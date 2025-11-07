import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma, withRetry } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { channelId } = await request.json();

    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await withRetry(() => prisma.user.findUnique({
      where: { email: currentUser.email },
      select: { id: true },
    }));

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already following
    const existingFollow = await withRetry(() => prisma.liveStreamFollower.findUnique({
      where: {
        userId_channelId: {
          userId: user.id,
          channelId: channelId,
        },
      },
    }));

    if (existingFollow) {
      // Unfollow
      await withRetry(() => prisma.liveStreamFollower.delete({
        where: { id: existingFollow.id },
      }));

      return NextResponse.json({
        following: false,
        message: 'Unfollowed channel',
      });
    } else {
      // Follow
      await withRetry(() => prisma.liveStreamFollower.create({
        data: {
          userId: user.id,
          channelId: channelId,
        },
      }));

      return NextResponse.json({
        following: true,
        message: 'Following channel',
      });
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    return NextResponse.json(
      { error: 'Failed to toggle follow' },
      { status: 500 }
    );
  }
}
