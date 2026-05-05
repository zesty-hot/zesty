import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';

export async function GET(_: NextRequest, { params }: { params: Promise<{  slug: string }> }) {
  const { slug } = await params;

  try {
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    const user = await withRetry(() =>
      prisma.user.findUnique({
        where: { slug },
        select: {
          zesty_id: true,
          slug: true,
          bio: true,
          location: true,
          suburb: true,
          verified: true,
          bodyType: true,
          race: true,
          gender: true,
          dob: true,
          images: {
            orderBy: { default: 'desc' },
            select: { url: true, width: true, height: true, default: true },
          },
          privateAds: {
            where: { active: true },
            select: { id: true },
            take: 1,
          },
          vipPage: {
            select: { id: true, active: true },
          },
          liveStreamPage: {
            select: { id: true, active: true },
          },
        },
      })
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Normalize response shape a little
    const hasEscort = (user.privateAds && user.privateAds.length > 0) || false;
    const hasVIP = !!user.vipPage?.active;
    const hasLive = !!user.liveStreamPage?.active;

    return NextResponse.json({ ...user, hasEscort, hasVIP, hasLive });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
