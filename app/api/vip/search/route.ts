import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { Gender, BodyType, Race } from '@/prisma/generated/enums';
import { calculateAge } from '@/lib/calculate-age';
import { calculateDistance } from '@/lib/calculate-distance';

interface FilterData {
  gender: string[];
  age: [number, number];
  bodyType: string[];
  race: string[];
  sortBy?: string;
}

interface SearchRequest {
  slug?: string; // For username-based search
  longitude?: number; // For location-based search
  latitude?: number; // For location-based search
  filters?: FilterData;
  page: number;
  limit: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();
    const { slug, longitude, latitude, filters = {
      gender: [],
      age: [18, 100],
      bodyType: [],
      race: [],
      sortBy: 'distance'
    }, page = 1, limit = 20 } = body;

    // Build where clause for Prisma
    const userWhere: any = {};

    // If searching by slug
    if (slug) {
      userWhere.slug = slug;
    }

    // Apply gender filter
    if (filters.gender && filters.gender.length > 0) {
      userWhere.gender = {
        in: filters.gender.map(g => {
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
        in: filters.bodyType.map(bt => {
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
        in: filters.race.map(r => r.toUpperCase() as Race)
      };
    }

    // Fetch VIP pages matching the criteria
    const vipPages = await withRetry(() => prisma.vIPPage.findMany({
      where: {
        active: true,
        user: userWhere
      },
      select: {
        id: true,
        description: true,
        bannerUrl: true,
        subscriptionPrice: true,
        isFree: true,
        user: {
          select: {
            zesty_id: true,
            slug: true,
            title: true,
            dob: true,
            suburb: true,
            location: true,
            images: {
              where: { default: true },
              select: { url: true, NSFW: true },
              take: 1,
            }
          }
        },
        _count: {
          select: {
            content: true,
            subscriptions: {
              where: {
                active: true,
                OR: [
                  { expiresAt: null },
                  { expiresAt: { gte: new Date() } }
                ]
              }
            }
          }
        }
      }
    }));

    // Filter by age and calculate distance if location provided
    let processedPages = vipPages
      .map((page) => {
        if (!page.user.dob) return null;
        const age = calculateAge(page.user.dob);

        // Age filter
        if (filters.age && (age < filters.age[0] || age > filters.age[1])) {
          return null;
        }

        // Calculate distance if location is provided
        let distance: number | undefined;
        let distanceText: string | undefined;

        if (longitude !== undefined && latitude !== undefined && page.user.location) {
          const [userLat, userLng] = page.user.location
            .split(',')
            .map((coord) => parseFloat(coord.trim()));

          distance = calculateDistance(latitude, longitude, userLat, userLng);
          distanceText = distance < 1
            ? `${Math.round(distance * 1000)}m away`
            : `${distance.toFixed(1)}km away`;
        }

        return {
          ...page,
          distance,
          distanceText,
        };
      })
      .filter((page): page is NonNullable<typeof page> => page !== null);

    // Sort based on sortBy filter
    if (filters.sortBy === 'lowest-price') {
      processedPages.sort((a, b) => a.subscriptionPrice - b.subscriptionPrice);
    } else if (filters.sortBy === 'distance' && longitude !== undefined && latitude !== undefined) {
      processedPages.sort((a, b) => {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });
    }

    // Paginate
    const total = processedPages.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const paginatedPages = processedPages.slice(skip, skip + limit);

    // Format response
    const creators = paginatedPages.map((page) => ({
      id: page.id,
      slug: page.user.slug,
      title: page.user.title,
      description: page.description,
      bannerUrl: page.bannerUrl,
      image: page.user.images?.[0] ? {
        url: page.user.images[0].url,
        NSFW: page.user.images[0].NSFW
      } : null,
      location: page.user.suburb,
      subscribersCount: page._count.subscriptions,
      contentCount: page._count.content,
      isFree: page.isFree,
      price: page.subscriptionPrice,
      distance: page.distance,
      distanceText: page.distanceText,
    }));

    return NextResponse.json({
      creators,
      total,
      totalPages
    });

  } catch (error) {
    console.error('Error searching VIP creators:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
