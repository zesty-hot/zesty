import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { contentId } = await req.json();
    
    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    // Get current user
    let currentUser = null;
    try {
      currentUser = await getCurrentUser();
    } catch (err) {
      console.error('getCurrentUser failed in vip/like route:', err);
      return NextResponse.json({ error: 'Unauthorized - authentication error' }, { status: 401 });
    }
    
    if (!currentUser?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await withRetry(() => prisma.user.findUnique({
      where: { email: currentUser.email },
    }));

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if content exists
    const content = await withRetry(() => prisma.vIPContent.findUnique({
      where: { id: contentId },
    }));

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // Toggle like
    const existingLike = await withRetry(() => prisma.vIPLike.findUnique({
      where: {
        userId_contentId: {
          userId: user.id,
          contentId: contentId,
        },
      },
    }));

    if (existingLike) {
      // Unlike
      await withRetry(() => prisma.vIPLike.delete({
        where: {
          id: existingLike.id,
        },
      }));

      return NextResponse.json({
        liked: false,
        message: 'Content unliked',
      });
    } else {
      // Like
      await withRetry(() => prisma.vIPLike.create({
        data: {
          userId: user.id,
          contentId: contentId,
        },
      }));

      return NextResponse.json({
        liked: true,
        message: 'Content liked',
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
