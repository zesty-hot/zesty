import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { serverSupabase } from '@/lib/supabase/server';

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-');  // Replace multiple - with single -
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Manual validation
    if (!body.title || typeof body.title !== 'string' || body.title.length < 3) {
      return NextResponse.json({ error: 'Title must be at least 3 characters' }, { status: 400 });
    }
    if (!body.startTime) {
      return NextResponse.json({ error: 'Start time is required' }, { status: 400 });
    }

    // Generate unique slug
    let slug = slugify(body.title);
    const existingEvent = await prisma.event.findUnique({ where: { slug } });
    if (existingEvent) {
      slug = `${slug}-${Date.now()}`;
    }

    const event = await withRetry(() => prisma.event.create({
      data: {
        title: body.title,
        description: body.description || '',
        slug,
        startTime: new Date(body.startTime),
        endTime: body.endTime ? new Date(body.endTime) : null,
        location: body.location || null,
        suburb: body.suburb || null,
        venue: body.venue || null,
        coverImage: body.coverImage || null,
        status: body.status || 'OPEN',
        price: body.price ? parseInt(body.price) : null,
        maxAttendees: body.maxAttendees ? parseInt(body.maxAttendees) : null,
        organizerId: zestyUser.zesty_id,
      },
    }));

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
