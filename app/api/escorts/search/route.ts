import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Gender, BodyType, Race, DaysAvailable } from '@prisma/client';
import { calculateDistance } from '@/lib/calculate-distance';
import { calculateAge } from '@/lib/calculate-age';

interface FilterData {
  gender: string[];
  age: [number, number];
  bodyType: string[];
  race: string[];
}

interface SearchRequest {
  longitude: number;
  latitude: number;
  filters: FilterData;
  page: number;
  limit: number;
}

type UserWithDistance = {
  id: string;
  ad: any;
  slug: string | null;
  location: string | null;
  suburb: string | null;
  dob: Date | null;
  gender: Gender | null;
  bodyType: BodyType | null;
  race: Race | null;
  images: { url: string, default: boolean, NSFW: boolean }[];
  minPrice: number | null;
  maxPrice: number | null;
  distance: number;
  age: number | null;
  lastActive: Date | null;
  daysAvailable: DaysAvailable[] | null;
  averageRating: number;
};

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();
    const { longitude, latitude, filters, page = 1, limit = 30 } = body;
    const clientLatitude = latitude;
    const clientLongitude = longitude;

    if (!longitude || !latitude) {
      return NextResponse.json(
        { error: 'Location coordinates are required' },
        { status: 400 }
      );
    }

    // Build where clause for Prisma
    const where: any = {};

    // Apply gender filter
    if (filters.gender && filters.gender.length > 0) {
      where.gender = {
        in: filters.gender.map(g => {
          // Map frontend values to Prisma enum
          if (g === 'woman') return Gender.FEMALE;
          if (g === 'man') return Gender.MALE;
          if (g === 'trans') return Gender.TRANS;
          return g.toUpperCase() as Gender;
        })
      };
    }

    // Apply body type filter
    if (filters.bodyType && filters.bodyType.length > 0) {
      where.bodyType = {
        in: filters.bodyType.map(bt => {
          // Map frontend values to Prisma enum
          if (bt === 'athlete') return BodyType.ATHLETE;
          if (bt === 'regular') return BodyType.REGULAR;
          if (bt === 'plus') return BodyType.PLUS;
          return bt.toUpperCase() as BodyType;
        })
      };
    }

    // Apply race filter
    if (filters.race && filters.race.length > 0) {
      where.race = {
        in: filters.race.map(r => r.toUpperCase() as Race)
      };
    }

    // Fetch all matching ACTIVE PrivateAds with their workers (users)
    // We filter by the worker's attributes, not the ad itself
    const ads = await prisma.privateAd.findMany({
      where: {
        active: true,
        worker: where // Apply filters to the worker
      },
      select: {
        id: true,
        title: true,
        description: true,
        acceptsGender: true,
        acceptsRace: true,
        acceptsBodyType: true,
        acceptsAgeRange: true,
        extras: true,
        daysAvailable: true,
        services: {
          include: {
            options: {
              orderBy: { price: 'asc' }
            },
          }
        },
        worker: {
          select: {
            name: false,
            image: false,

            id: true,
            slug: true,
            location: true,
            suburb: true,
            dob: true,
            gender: true,
            race: true,
            bodyType: true,
            lastActive: true,
            images: {
              select: { url: true, default: true, NSFW: true },
              // TODO: select 6 random images but always take 1 default if exists
              take: 6
            }
          }
        }
      }
    });

    // Get average ratings for all workers in one query
    const workerIds = ads.map(ad => ad.worker.id);
    const ratingsData = await prisma.review.groupBy({
      by: ['revieweeId'],
      where: {
        revieweeId: {
          in: workerIds
        }
      },
      _avg: {
        rating: true
      },
      _count: {
        rating: true
      }
    });

    // Create a map for quick lookup
    const ratingsMap = new Map(
      ratingsData.map(r => [
        r.revieweeId, 
        { 
          averageRating: r._avg.rating ?? 0,
        }
      ])
    );

    // Calculate distance and age, then filter
    const profilesWithDistance: UserWithDistance[] = ads
      .map((ad) => {
        const user = ad.worker!;
        // Parse location "lat,lng"
        const [workerLat, workerLong] = user.location!.split(',').map(parseFloat);
        const distance = calculateDistance(clientLatitude, clientLongitude, workerLat, workerLong);
        const age = user.dob ? calculateAge(user.dob) : null;
        const ratings = ratingsMap.get(user.id) ?? { averageRating: 0 };

        // Get price range from all services
        let minPrice = null;
        let maxPrice = null;
        if (ad.services.length > 0) {
          const prices = ad.services.map(s => s.options.map((o) => o.price)).flat();
          minPrice = Math.min(...prices);
          maxPrice = Math.max(...prices);
        }

        return {
          id: user.id,
          ad: ad,
          slug: user.slug,
          location: user.location,
          suburb: user.suburb,
          dob: user.dob,
          gender: user.gender,
          bodyType: user.bodyType,
          race: user.race,
          images: user.images,
          minPrice,
          maxPrice,
          distance,
          age,
          lastActive: user.lastActive,
          daysAvailable: ad.daysAvailable,
          averageRating: ratings.averageRating,
        };
      })
      .filter((user) => {
        // Filter by age range
        if (user.age === null) return false;
        if (filters.age) {
          if (user.age < filters.age[0] || user.age > filters.age[1]) {
            return false;
          }
        }
        return true;
      })
      // Sort by distance (nearest first)
      .sort((a, b) => a.distance - b.distance);

    // Paginate
    const total = profilesWithDistance.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const paginatedProfiles = profilesWithDistance.slice(skip, skip + limit);

    const timeAgo = (date: Date) => {
      const now = new Date();
      const diff = Math.abs(now.getTime() - date.getTime());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);

      if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
      }
      if (hours <= 1) {
        return 'Just now';
      }
      return `${hours} hr${hours > 1 ? 's' : ''} ago`;
    };

    // Format response
    const profiles = paginatedProfiles.map((user) => {
      // Map database enums back to frontend values
      let genderLabel = 'unknown';
      if (user.gender === Gender.FEMALE) genderLabel = 'WOMAN';
      else if (user.gender === Gender.MALE) genderLabel = 'MAN';
      else if (user.gender === Gender.TRANS) genderLabel = 'TRANS';

      return {
        id: user.id,
        ad: user.ad,
        slug: user.slug,
        location: user.suburb,
        distance: `${user.distance.toFixed(1)}km away`,
        price: user.minPrice && user.maxPrice
          ? (user.minPrice === user.maxPrice
            ? `$${user.minPrice}`
            : `$${user.minPrice} - $${user.maxPrice}`)
          : 'Contact for rates',
        age: user.age,
        gender: genderLabel,
        bodyType: user.bodyType || 'regular',
        race: user.race || 'unknown',
        images: user.images.map(img => ({ url: img.url, default: img.default, NSFW: img.NSFW })),
        lastActive: user.lastActive ? timeAgo(user.lastActive) : 'Inactive',
        daysAvailable: user.daysAvailable || [],
        averageRating: user.averageRating,
      };
    });

    return NextResponse.json({
      profiles,
      total,
      totalPages
    });

  } catch (error) {
    console.error('Error searching escorts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
