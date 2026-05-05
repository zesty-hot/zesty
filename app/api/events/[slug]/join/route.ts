import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { serverSupabase } from '@/lib/supabase/server';

export async function POST(
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

    // Check if already attending
    const existingAttendance = await prisma.eventAttendee.findUnique({
      where: {
        eventId_zesty_id: {
          eventId: event.id,
          zesty_id: zestyUser.zesty_id,
        },
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        { error: 'Already attending or requested' },
        { status: 400 }
      );
    }

    // Determine initial status based on event type
    let status: 'GOING' | 'PENDING' = 'GOING';
    if (event.status === 'REQUEST_TO_JOIN' || event.status === 'INVITE_ONLY') {
      status = 'PENDING';
    } else if (event.status === 'PAY_TO_JOIN') {
      // For now, we'll assume payment is handled or mocked, and set to GOING
      // In a real scenario, this might be PENDING until payment confirmation
      status = 'GOING';
    }

    const attendee = await withRetry(() => prisma.eventAttendee.create({
      data: {
        eventId: event.id,
        zesty_id: zestyUser.zesty_id,
        status: status,
      },
    }));

    return NextResponse.json(attendee);
  } catch (error) {
    console.error('Error joining event:', error);
    return NextResponse.json(
      { error: 'Failed to join event' },
      { status: 500 }
    );
  }
}
