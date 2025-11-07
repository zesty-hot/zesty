import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { calculateDistance } from '@/lib/calculate-distance';

export async function POST(request: NextRequest) {
  try {
    const { 
      slug,
      longitude, 
      latitude,
      page = 1,
      limit = 8 
    } = await request.json();

    // Search by username/slug - return the channel
    if (slug) {
      const channel = await withRetry(() => prisma.liveStreamPage.findFirst({
        where: {
          slug: {
            contains: slug,
            mode: 'insensitive',
          },
          active: true,  // Only show enabled channels
        },
        include: {
          user: {
            select: {
              id: true,
              slug: true,
              name: true,
              image: true,
              suburb: true,
              location: true,
              verified: true,
            },
          },
          streams: {
            where: { isLive: true },
            select: {
              id: true,
              title: true,
              roomName: true,
              viewerCount: true,
              startedAt: true,
            },
            take: 1,
          },
          _count: {
            select: { followers: true },
          },
        },
      }));

      if (!channel) {
        return NextResponse.json({
          channels: [],
          total: 0,
          totalPages: 0,
        });
      }

      return NextResponse.json({
        channels: [channel],
        total: 1,
        totalPages: 1,
      });
    }

    // Search by location - find channels with active streams
    if (longitude !== undefined && latitude !== undefined) {
      // Fetch all enabled channels with active streams
      const channels = await withRetry(() => prisma.liveStreamPage.findMany({
        where: {
          active: true,
          streams: {
            some: { isLive: true },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              slug: true,
              name: true,
              image: true,
              suburb: true,
              location: true,
              verified: true,
            },
          },
          streams: {
            where: { isLive: true },
            select: {
              id: true,
              title: true,
              roomName: true,
              viewerCount: true,
              startedAt: true,
            },
            take: 1,
          },
          _count: {
            select: { followers: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }));

      // Calculate distances and filter
      const channelsWithDistance = channels
        .map((channel) => {
          if (!channel.user.location) return null;

          const [channelLat, channelLng] = channel.user.location
            .split(',')
            .map((coord) => parseFloat(coord.trim()));

          const distance = calculateDistance(
            latitude,
            longitude,
            channelLat,
            channelLng
          );

          return {
            ...channel,
            distance,
            distanceText: distance < 1 
              ? `${Math.round(distance * 1000)}m away`
              : `${distance.toFixed(1)}km away`,
          };
        })
        .filter((channel): channel is NonNullable<typeof channel> => channel !== null)
        .sort((a, b) => a.distance - b.distance);

      // Paginate
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedChannels = channelsWithDistance.slice(startIndex, endIndex);

      return NextResponse.json({
        channels: paginatedChannels,
        total: channelsWithDistance.length,
        totalPages: Math.ceil(channelsWithDistance.length / limit),
      });
    }

    // Default: return channels with active streams with pagination
    const skip = (page - 1) * limit;
    
    const [channels, total] = await Promise.all([
      withRetry(() => prisma.liveStreamPage.findMany({
        where: {
          active: true,
          streams: {
            some: { isLive: true },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              slug: true,
              name: true,
              image: true,
              suburb: true,
              location: true,
              verified: true,
            },
          },
          streams: {
            where: { isLive: true },
            select: {
              id: true,
              title: true,
              roomName: true,
              viewerCount: true,
              startedAt: true,
            },
            take: 1,
          },
          _count: {
            select: { followers: true },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        skip,
        take: limit,
      })),
      withRetry(() => prisma.liveStreamPage.count({
        where: {
          active: true,
          streams: {
            some: { isLive: true },
          },
        },
      })),
    ]);

    return NextResponse.json({
      channels,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error searching livestreams:', error);
    return NextResponse.json(
      { error: 'Failed to search livestreams' },
      { status: 500 }
    );
  }
}

