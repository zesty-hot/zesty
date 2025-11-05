import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Gender, BodyType, Race, User, Images } from '@prisma/client';
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
  adId: string;
  slug: string | null;
  location: string | null;
  suburb: string | null;
  dob: Date | null;
  gender: Gender | null;
  bodyType: BodyType | null;
  race: Race | null;
  image: string | null;
  images: { url: string }[];
  minPrice: number | null;
  maxPrice: number | null;
  distance: number;
  age: number | null;
};

// Calculate age from date of birth


export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();
    const { longitude, latitude, filters, page = 1, limit = 30 } = body;

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
        services: {
          select: {
            price: true,
            length: true,
          }
        },
        worker: {
          select: {
            id: true,
            slug: true,
            location: true,
            suburb: true,
            dob: true,
            gender: true,
            race: true,
            bodyType: true,
            image: true,
            images: {
              select: { url: true },
              take: 5
            }
          }
        }
      }
    });

    // Calculate distance and age, then filter
    const profilesWithDistance: UserWithDistance[] = ads
      .filter((ad) => {
        // Skip if no worker or worker has no location/dob
        if (!ad.worker || !ad.worker.location || !ad.worker.dob) return false;
        return true;
      })
      .map((ad) => {
        const user = ad.worker!;
        // Parse location "lat,lng"
        const [userLat, userLon] = user.location!.split(',').map(parseFloat);
        const distance = calculateDistance(latitude, longitude, userLat, userLon);
        const age = user.dob ? calculateAge(user.dob) : null;
        
        // Get price range from all services
        let minPrice = null;
        let maxPrice = null;
        if (ad.services.length > 0) {
          const prices = ad.services.map(s => s.price);
          minPrice = Math.min(...prices);
          maxPrice = Math.max(...prices);
        }

        return {
          id: user.id,
          adId: ad.id,
          slug: user.slug,
          location: user.location,
          suburb: user.suburb,
          dob: user.dob,
          gender: user.gender,
          bodyType: user.bodyType,
          race: user.race,
          image: user.image,
          images: user.images,
          minPrice,
          maxPrice,
          distance,
          age
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

    // Format response
    const profiles = paginatedProfiles.map((user) => {
      // Map database enums back to frontend values
      let genderLabel = 'unknown';
      if (user.gender === Gender.FEMALE) genderLabel = 'woman';
      else if (user.gender === Gender.MALE) genderLabel = 'man';
      else if (user.gender === Gender.TRANS) genderLabel = 'trans';

        return {
          id: user.id,
          adId: user.adId,
          slug: user.slug,
          location: user.suburb 
            ? `${user.suburb} (${user.distance.toFixed(1)}km away)` 
            : `${user.distance.toFixed(1)}km away`,
          price: user.minPrice && user.maxPrice 
            ? (user.minPrice === user.maxPrice 
                ? `$${user.minPrice}` 
                : `$${user.minPrice} - $${user.maxPrice}`)
            : 'Contact for rates',
          age: user.age,
          gender: genderLabel,
          bodyType: user.bodyType?.toLowerCase() || 'regular',
          race: user.race?.toLowerCase() || 'unknown',
          images: user.images.length > 0 ? user.images.map(img => img.url) : user.image ? [user.image] : ['/placeholder.jpg']
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
