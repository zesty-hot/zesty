import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { serverSupabase } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await serverSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const zestyUser = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: { zesty_id: true },
    }));

    if (!zestyUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const event = await withRetry(() => prisma.event.findUnique({
      where: { slug },
    }));

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.organizerId !== zestyUser.zesty_id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Basic validation if needed, but for updates fields are optional
    // We just pass what's there

    const updatedEvent = await withRetry(() => prisma.event.update({
      where: { id: event.id },
      data: {
        title: body.title || undefined,
        description: body.description || undefined,
        startTime: body.startTime ? new Date(body.startTime) : undefined,
        endTime: body.endTime ? new Date(body.endTime) : undefined,
        location: body.location || undefined,
        suburb: body.suburb || undefined,
        venue: body.venue || undefined,
        coverImage: body.coverImage || undefined,
        price: body.price !== undefined ? parseInt(body.price) : undefined,
        maxAttendees: body.maxAttendees !== undefined ? parseInt(body.maxAttendees) : undefined,
      },
    }));

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}
