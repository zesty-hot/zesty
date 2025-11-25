import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { calculateDistance } from '@/lib/calculate-distance';
import { calculateAge } from '@/lib/calculate-age';
import { Gender, BodyType, Race } from '@/prisma/generated/enums';
import { serverSupabase } from '@/lib/supabase/server';

interface FilterData {
  gender: string[];
  age: [number, number];
  bodyType: string[];
  race: string[];
  sortBy?: string;
}

export async function POST(request: NextRequest) {
  try {
    const {
      slug,
      longitude,
      latitude,
      filters = {
        gender: [],
        age: [18, 100],
        bodyType: [],
        race: [],
        sortBy: 'distance'
      },
      page = 1,
      limit = 8,
      liveOnly = false,  // Add parameter to filter only live streams
    } = await request.json();

    // Get current user for follow status
    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();
    let currentUserId: string | null = null;

    if (session.user) {
      const user = await withRetry(() => prisma.user.findUnique({
        where: { supabaseId: session.user?.id },
        select: { zesty_id: true },
      }));
      if (user) {
        currentUserId = user.zesty_id;
      }
    }

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
              zesty_id: true,
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

      // Check if following
      let isFollowing = false;
      if (currentUserId) {
        const follow = await withRetry(() => prisma.liveStreamFollower.findUnique({
          where: {
            zesty_id_channelId: {
              zesty_id: currentUserId!,
              channelId: channel.id,
            },
          },
        }));
        isFollowing = !!follow;
      }

      return NextResponse.json({
        channels: [{ ...channel, isFollowing }],
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

      // Build user filters
      const userWhere: any = {};

      // Apply gender filter
      if (filters.gender && filters.gender.length > 0) {
        userWhere.gender = {
          in: filters.gender.map((g: string) => {
            if (g === 'woman') return Gender.FEMALE;
            if (g === 'man') return Gender.MALE;
            if (g === 'trans') return Gender.TRANS;
            return g.toUpperCase() as Gender;
          })
        };
      }

      // Apply body type filter
      if (filters.bodyType && filters.bodyType.length > 0) {
        userWhere.bodyType = {
          in: filters.bodyType.map((bt: string) => {
            if (bt === 'athlete') return BodyType.ATHLETE;
            if (bt === 'regular') return BodyType.REGULAR;
            if (bt === 'plus') return BodyType.PLUS;
            return bt.toUpperCase() as BodyType;
          })
        };
      }

      // Apply race filter
      if (filters.race && filters.race.length > 0) {
        userWhere.race = {
          in: filters.race.map((r: string) => r.toUpperCase() as Race)
        };
      }

      // Add user filters to where clause if any exist
      if (Object.keys(userWhere).length > 0) {
        whereClause.user = userWhere;
      }

      // Fetch all enabled channels
      const channels = await withRetry(() => prisma.liveStreamPage.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              zesty_id: true,
              slug: true,
              dob: true,
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
        orderBy: {
          createdAt: 'desc',
        },
      }));

      // Calculate distances, filter by age, and sort
      const channelsWithDistance = await Promise.all(channels
        .map(async (channel) => {
          if (!channel.user.location) return null;

          // Age filter
          if (channel.user.dob && filters.age) {
            const age = calculateAge(channel.user.dob);
            if (age < filters.age[0] || age > filters.age[1]) {
              return null;
            }
          }

          const [channelLat, channelLng] = channel.user.location
            .split(',')
            .map((coord) => parseFloat(coord.trim()));

          const distance = calculateDistance(
            latitude,
            longitude,
            channelLat,
            channelLng
          );

          // Check follow status
          let isFollowing = false;
          if (currentUserId) {
            const follow = await withRetry(() => prisma.liveStreamFollower.findUnique({
              where: {
                zesty_id_channelId: {
                  zesty_id: currentUserId!,
                  channelId: channel.id,
                },
              },
            }));
            isFollowing = !!follow;
          }

          return {
            ...channel,
            isFollowing,
            distance,
            distanceText: distance < 1
              ? `${Math.round(distance * 1000)}m away`
              : `${distance.toFixed(1)}km away`,
          };
        }));

      const validChannels = channelsWithDistance
        .filter((channel): channel is NonNullable<typeof channel> => channel !== null)
        .sort((a, b) => a.distance - b.distance); // Always sort by distance for location-based search

      // Paginate
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedChannels = validChannels.slice(startIndex, endIndex);

      return NextResponse.json({
        channels: paginatedChannels,
        total: validChannels.length,
        totalPages: Math.ceil(validChannels.length / limit),
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
              zesty_id: true,
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
                where: {
                  active: true,
                },
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

    // Add follow status
    const channelsWithFollow = await Promise.all(channels.map(async (channel) => {
      let isFollowing = false;
      if (currentUserId) {
        const follow = await withRetry(() => prisma.liveStreamFollower.findUnique({
          where: {
            zesty_id_channelId: {
              zesty_id: currentUserId!,
              channelId: channel.id,
            },
          },
        }));
        isFollowing = !!follow;
      }
      return { ...channel, isFollowing };
    }));

    return NextResponse.json({
      channels: channelsWithFollow,
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

