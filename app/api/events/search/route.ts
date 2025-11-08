import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { calculateDistance } from '@/lib/calculate-distance';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      slug,
      longitude, 
      latitude, 
      page = 1, 
      limit = 20,
      startDate,
      endDate,
      status,
    } = body;

    const skip = (page - 1) * limit;
    const now = new Date();

    // Build where clause
    const where: any = {
      startTime: {
        gte: startDate ? new Date(startDate) : now, // Only show upcoming events
      },
    };

    // Filter by end date if provided
    if (endDate) {
      where.startTime.lte = new Date(endDate);
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Search by slug (event title/organizer)
    if (slug) {
      where.OR = [
        { slug: { contains: slug.toLowerCase(), mode: 'insensitive' } },
        { title: { contains: slug, mode: 'insensitive' } },
        { organizer: { slug: { contains: slug.toLowerCase(), mode: 'insensitive' } } },
      ];
    }

    // Location-based search
    if (longitude !== undefined && latitude !== undefined) {
      // For location search, we need to get all events and filter by distance
      const allEvents = await withRetry(() => prisma.event.findMany({
        where,
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
              id: true,
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
          _count: {
            select: {
              attendees: {
                where: {
                  status: { in: ['GOING', 'MAYBE'] },
                },
              },
            },
          },
          createdAt: true,
        },
        orderBy: { startTime: 'asc' },
      }));

      // Filter and sort by distance
      const eventsWithDistance = allEvents
        .map(event => {
          if (!event.location) return null;
          
          const [eventLat, eventLng] = event.location.split(',').map(Number);
          const distance = calculateDistance(latitude, longitude, eventLat, eventLng);
          
          return {
            ...event,
            distance,
            distanceText: distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`,
            attendeeCount: event._count.attendees,
          };
        })
        .filter(event => event !== null)
        .sort((a, b) => a!.distance - b!.distance)
        .slice(skip, skip + limit);

      return NextResponse.json({ 
        events: eventsWithDistance,
        page,
        limit,
        hasMore: allEvents.length > skip + limit,
      });
    }

    // Regular search without location
    const events = await withRetry(() => prisma.event.findMany({
      where,
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
            id: true,
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
        _count: {
          select: {
            attendees: {
              where: {
                status: { in: ['GOING', 'MAYBE'] },
              },
            },
          },
        },
        createdAt: true,
      },
      orderBy: { startTime: 'asc' },
      skip,
      take: limit,
    }));

    const eventsWithCount = events.map(event => ({
      ...event,
      attendeeCount: event._count.attendees,
    }));

    return NextResponse.json({ 
      events: eventsWithCount,
      page,
      limit,
      hasMore: events.length === limit,
    });
  } catch (error) {
    console.error('Error searching events:', error);
    return NextResponse.json(
      { error: 'Failed to search events' },
      { status: 500 }
    );
  }
}
