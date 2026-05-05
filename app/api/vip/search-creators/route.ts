import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || query.length < 2) {
      return NextResponse.json({ creators: [] });
    }

    // Search for users with active VIP pages
    const users = await withRetry(() =>
      prisma.user.findMany({
        where: {
          slug: {
            contains: query,
            mode: 'insensitive',
          },
          vipPage: {
            active: true,
          }
        },
        select: {
          zesty_id: true,
          slug: true,
          title: true,
          images: {
            where: { default: true },
            select: { url: true },
            take: 1,
          },
          vipPage: {
            select: {
              active: true,
            }
          }
        },
        take: 10,
      })
    );

    const formattedCreators = users.map((user) => ({
      value: user.zesty_id,
      label: user.title || user.slug || 'Unknown',
      slug: user.slug || '',
      image: user.images?.[0]?.url || null,
    }));

    return NextResponse.json({ creators: formattedCreators });
  } catch (error) {
    console.error('Error searching creators:', error);
    return NextResponse.json(
      { error: 'Internal server error', detail: String(error) },
      { status: 500 }
    );
  }
}
