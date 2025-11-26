import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { serverSupabase } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
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

    const events = await withRetry(() => prisma.event.findMany({
      where: {
        organizerId: zestyUser.zesty_id,
      },
      orderBy: {
        startTime: 'desc',
      },
      include: {
        _count: {
          select: { attendees: true },
        },
      },
    }));

    // Transform to match the interface expected by the frontend
    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      eventDate: event.startTime.toISOString(),
      endTime: event.endTime?.toISOString(),
      location: event.venue || event.suburb || 'TBD',
      attendeeCount: event._count.attendees,
      isPublished: true, // Assuming all created events are published for now, or we can add a status check
      slug: event.slug,
    }));

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error('Error fetching my events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
