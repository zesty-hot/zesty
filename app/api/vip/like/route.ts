import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { serverSupabase } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { contentId } = await req.json();
    
    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();

    const user = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: (session?.user as any)?.id },
    }));
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
        zesty_id_contentId: {
          zesty_id: user.zesty_id,
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
          zesty_id: user.zesty_id,
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
