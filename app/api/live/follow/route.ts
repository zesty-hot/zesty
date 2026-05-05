import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { serverSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { channelId } = await request.json();

    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      );
    }

    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();

    // Get user
    const user = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: session.user?.id },
      select: { zesty_id: true },
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
        zesty_id_channelId: {
          zesty_id: user.zesty_id,
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
          zesty_id: user.zesty_id,
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
