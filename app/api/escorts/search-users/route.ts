import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Search for users with active escort profiles
    const users = await withRetry(() =>
      prisma.user.findMany({
        where: {
          slug: {
            contains: query,
            mode: 'insensitive',
          },
          privateAds: {
            some: {
              active: true,
            }
          }
        },
        select: {
          zesty_id: true,
          slug: true,
          images: {
            where: { default: true },
            select: { url: true },
            take: 1,
          }
        },
        take: 10,
      })
    );

    const formattedUsers = users.map((user) => ({
      value: user.zesty_id,
      label: user.slug || 'Unknown',
      slug: user.slug || '',
      image: user.images?.[0]?.url || null,
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Internal server error', detail: String(error) },
      { status: 500 }
    );
  }
}
