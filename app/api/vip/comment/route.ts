import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { serverSupabase } from '@/lib/supabase/server';

// Get comments for content
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contentId = searchParams.get('contentId');

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    const comments = await withRetry(() => prisma.vIPComment.findMany({
      where: {
        contentId: contentId,
      },
      include: {
        user: {
          select: {
            zesty_id: true,
            slug: true,
            verified: true,
            images: {
              where: { default: true },
              select: { url: true },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }));

    return NextResponse.json({
      comments: comments.map(comment => ({
        id: comment.id,
        text: comment.text,
        user: comment.user,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Post a comment
export async function POST(req: NextRequest) {
  try {
    const { contentId, text } = await req.json();

    if (!contentId || !text) {
      return NextResponse.json(
        { error: 'Content ID and text are required' },
        { status: 400 }
      );
    }

    // Validate text length
    if (text.length > 1000) {
      return NextResponse.json(
        { error: 'Comment text is too long (max 1000 characters)' },
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

    // Create comment
    const comment = await withRetry(() => prisma.vIPComment.create({
      data: {
        zesty_id: user.zesty_id,
        contentId: contentId,
        text: text.trim(),
      },
      include: {
        user: {
          select: {
            zesty_id: true,
            title: true,
            slug: true,
            verified: true,
            images: {
              where: { default: true },
              select: { url: true },
              take: 1,
            },
          },
        },
      },
    }));

    return NextResponse.json({
      comment: {
        id: comment.id,
        text: comment.text,
        user: comment.user,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error posting comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
