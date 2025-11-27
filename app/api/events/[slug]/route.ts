import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { serverSupabase } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Event slug is required' },
        { status: 400 }
      );
    }

    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();
    
    
    // Fetch event with all related data
    const event = await withRetry(() => prisma.event.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        coverImage: true,
        location: true,
        suburb: true,
        venue: true,
        startTime: true,
        endTime: true,
        status: true,
        price: true,
        maxAttendees: true,
        organizerId: true,
        organizer: {
          select: {
            zesty_id: true,
            slug: true,
            title: true,
            verified: true,
            images: {
              where: { default: true },
              select: { url: true },
              take: 1,
            },
          },
        },
        attendees: {
          select: {
            id: true,
            status: true,
            user: {
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
          where: {
            status: {
              in: ['GOING', 'MAYBE', 'INVITED'],
            },
          },
        },
        posts: {
          select: {
            id: true,
            content: true,
            createdAt: true,
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
            comments: {
              select: {
                id: true,
                content: true,
                createdAt: true,
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
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    }));

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (session.user == null) {
      // If no user is logged in, return event data without user-specific info
      return NextResponse.json({
        ...event,
        isOrganizer: false,
        userAttendanceStatus: null,
        posts: [],
      });
    }

    const user = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: session.user?.id },
      select: { zesty_id: true },
    }));


    // Check if user is the organizer
    const isOrganizer = user?.zesty_id === event.organizerId;

    // Check user's attendance status
    let userAttendanceStatus = null;
    if (user?.zesty_id) {
      const attendance = event.attendees.find(
        a => a.user.zesty_id === user.zesty_id
      );
      userAttendanceStatus = attendance?.status || null;
    }

    // Only return posts if user is attending or is organizer
    const canViewPosts = isOrganizer || userAttendanceStatus === 'GOING' || userAttendanceStatus === 'MAYBE';

    return NextResponse.json({
      ...event,
      isOrganizer,
      userAttendanceStatus,
      posts: canViewPosts ? event.posts : [],
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}
