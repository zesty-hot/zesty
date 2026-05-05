import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { serverSupabase } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; postId: string }> }
) {
  try {
    const { slug, postId } = await params;
    const json = await request.json();
    const { content } = json;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();

    if (!session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    // Verify event and post exist and user has access
    const event = await withRetry(() => prisma.event.findUnique({
      where: { slug },
      select: {
        id: true,
        organizerId: true,
        attendees: {
          where: {
            zesty_id: user.zesty_id,
            status: { in: ['GOING', 'MAYBE'] },
          },
        },
      },
    }));

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const isOrganizer = event.organizerId === user.zesty_id;
    const isAttendee = event.attendees.length > 0;

    if (!isOrganizer && !isAttendee) {
      return NextResponse.json(
        { error: 'You must join the event to comment' },
        { status: 403 }
      );
    }

    // Verify post belongs to event
    const post = await withRetry(() => prisma.eventPost.findUnique({
      where: { id: postId },
      select: { eventId: true },
    }));

    if (!post || post.eventId !== event.id) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const comment = await withRetry(() => prisma.eventComment.create({
      data: {
        content,
        postId,
        authorId: user.zesty_id,
      },
      include: {
        author: {
          select: {
            zesty_id: true,
            slug: true,
            title: true,
            images: {
              where: { default: true },
              select: { url: true },
              take: 1,
            },
          },
        },
      },
    }));

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
