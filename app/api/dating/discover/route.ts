import { NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { serverSupabase } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();

    const user = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: session.user?.id },
      select: { zesty_id: true, location: true, dob: true },
    }));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { cursor, limit = 10 } = await request.json();

    // Get user's dating page
    const datingPage = await withRetry(() =>
      prisma.datingPage.findUnique({
        where: { zesty_id: user.zesty_id },
      })
    );

    if (!datingPage) {
      return NextResponse.json({ error: 'Dating profile not found' }, { status: 404 });
    }

    // Get IDs of users already swiped on (using DatingPage ID, not User ID)
    const swipedUserIds = await withRetry(() =>
      prisma.datingSwipe.findMany({
        where: { swiperId: datingPage.id },
        select: { swipedId: true },
      })
    );

    const swipedIds = swipedUserIds.map((s: { swipedId: string }) => s.swipedId);

    // Build filters based on preferences
    const filters: any = {
      id: {
        notIn: swipedIds, // Exclude already swiped profiles by DatingPage ID
      },
      zesty_id: {
        not: user.zesty_id, // Exclude self
      },
      active: true,
    };

    // Age filter
    if (datingPage.ageRangeMin && datingPage.ageRangeMax) {
      const today = new Date();
      const maxBirthDate = new Date(
        today.getFullYear() - datingPage.ageRangeMin,
        today.getMonth(),
        today.getDate()
      );
      const minBirthDate = new Date(
        today.getFullYear() - datingPage.ageRangeMax - 1,
        today.getMonth(),
        today.getDate()
      );

      filters.user = {
        dob: {
          gte: minBirthDate,
          lte: maxBirthDate,
        },
      };
    }

    // Gender filter
    if (datingPage.lookingFor && datingPage.lookingFor.length > 0) {
      filters.user = {
        ...filters.user,
        gender: { in: datingPage.lookingFor },
      };
    }

    // Cursor pagination
    if (cursor) {
      filters.id = {
        lt: cursor,
      };
    }

    // Fetch potential matches
    const profiles = await withRetry(() =>
      prisma.datingPage.findMany({
        where: filters,
        orderBy: { id: 'desc' },
        take: limit,
        include: {
          user: {
            select: {
              zesty_id: true,
              title: true,
              slug: true,
              bio: true,
              gender: true,
              dob: true,
              location: true,
              suburb: true,
              verified: true,
              images: {
                orderBy: { createdAt: 'asc' },
              },
            },
          },
        },
      })
    );

    // Calculate distances if maxDistance is set and user has location
    let filteredProfiles = profiles;
    if (datingPage.maxDistance && user.location) {
      const userCoords = user.location.split(',').map(Number);

      filteredProfiles = profiles.filter((profile) => {
        if (!profile.user.location) return false;

        const profileCoords = profile.user.location.split(',').map(Number);
        const distance = calculateDistance(
          userCoords[0],
          userCoords[1],
          profileCoords[0],
          profileCoords[1]
        );

        return distance <= datingPage.maxDistance;
      });
    }

    // Map to response format
    const formattedProfiles = filteredProfiles.map((profile) => ({
      id: profile.id,
      zesty_id: profile.zesty_id,
      title: profile.user.title || profile.user.slug || 'Anonymous',
      bio: profile.user.bio || '',
      lookingFor: profile.lookingFor,
      verified: profile.verified,
      images: profile.user.images.map((img) => ({
        url: img.url,
        NSFW: img.NSFW,
      })),
      age: profile.user.dob
        ? calculateAge(profile.user.dob)
        : null,
      distance: profile.user.location && user.location
        ? calculateDistance(
          ...user.location.split(',').map(Number) as [number, number],
          ...profile.user.location.split(',').map(Number) as [number, number]
        )
        : null,
      suburb: profile.user.suburb,
    }));

    return NextResponse.json({
      profiles: formattedProfiles,
      nextCursor:
        filteredProfiles.length === limit
          ? filteredProfiles[filteredProfiles.length - 1].id
          : null,
    });
  } catch (error) {
    console.error('Error fetching dating profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    );
  }
}

// Helper function to calculate age from date of birth
function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
