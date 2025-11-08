import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { Gender, BodyType, Race } from '@prisma/client';
import { calculateAge } from '@/lib/calculate-age';

interface FilterData {
  gender: string[];
  age: [number, number];
  bodyType: string[];
  race: string[];
}

interface SearchRequest {
  slug?: string; // For username-based search
  filters: FilterData;
  page: number;
  limit: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();
    const { slug, filters, page = 1, limit = 20 } = body;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    // Build where clause for Prisma
    const userWhere: any = {
      slug,
    };

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
            id: true,
            slug: true,
            title: true,
            dob: true,
            suburb: true,
            images: {
              where: { default: true },
              select: { url: true },
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

    // Filter by age if specified
    const filteredPages = vipPages.filter((page) => {
      if (!page.user.dob) return false;
      const age = calculateAge(page.user.dob);
      if (filters.age) {
        if (age < filters.age[0] || age > filters.age[1]) {
          return false;
        }
      }
      return true;
    });

    // Paginate
    const total = filteredPages.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const paginatedPages = filteredPages.slice(skip, skip + limit);

    // Format response
    const creators = paginatedPages.map((page) => ({
      id: page.id,
      slug: page.user.slug,
      title: page.user.title,
      description: page.description,
      bannerUrl: page.bannerUrl,
      image: page.user.images?.[0]?.url || null,
      location: page.user.suburb,
      subscribersCount: page._count.subscriptions,
      contentCount: page._count.content,
      isFree: page.isFree,
      price: page.subscriptionPrice,
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
