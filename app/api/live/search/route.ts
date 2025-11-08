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
      limit = 8,
      liveOnly = false,  // Add parameter to filter only live streams
    } = await request.json();

    let decodedSlug = decodeURIComponent(slug);
  
    // Search by username/slug - return the channel (even if not live)
    if (slug) {
      const channel = await withRetry(() => prisma.liveStreamPage.findFirst({
        where: {
          user: {
            slug: decodedSlug,
          },
          active: true,  // Only show enabled channels
        },
        include: {
          user: {
            select: {
              id: true,
              slug: true,
              suburb: true,
              location: true,
              verified: true,
              images: {
                where: { default: true },
                select: { url: true },
                take: 1,
              },
              vipPage: {
                select: {
                  active: true,
                },
              },
              privateAds: {
                where: {
                  active: true,
                },
                select: {
                  active: true,
                },
                take: 1,
              },
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
              isLive: true,
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

    // Search by location - find channels
    if (longitude !== undefined && latitude !== undefined) {
      // Build where clause
      const whereClause: any = {
        active: true,
      };
      
      // Optionally filter for live streams only
      if (liveOnly) {
        whereClause.streams = {
          some: { isLive: true },
        };
      }
      
      // Fetch all enabled channels
      const channels = await withRetry(() => prisma.liveStreamPage.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              slug: true,
              suburb: true,
              location: true,
              verified: true,
              images: {
                where: { default: true },
                select: { url: true },
                take: 1,
              },
              vipPage: {
                select: {
                  active: true,
                },
              },
              privateAds: {
                where: {
                  active: true,
                },
                select: {
                  active: true,
                },
                take: 1,
              },
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

    // Default: return channels with pagination
    const skip = (page - 1) * limit;
    
    // Build where clause
    const whereClause: any = {
      active: true,
    };
    
    // Optionally filter for live streams only
    if (liveOnly) {
      whereClause.streams = {
        some: { isLive: true },
      };
    }
    
    const [channels, total] = await Promise.all([
      withRetry(() => prisma.liveStreamPage.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              slug: true,
              suburb: true,
              location: true,
              verified: true,
              images: {
                where: { default: true },
                select: { url: true },
                take: 1,
              },
              vipPage: {
                select: {
                  active: true,
                },
              },
              privateAds: {
                where: {
                  active: true,
                },
                select: {
                  active: true,
                },
                take: 1,
              },
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
        where: whereClause,
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

