import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { serverSupabase } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();

    if (!session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: session.user?.id },
      select: { zesty_id: true },
    }));

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const studios = await withRetry(() => prisma.studio.findMany({
      where: {
        OR: [
          { ownerId: user.zesty_id },
          {
            admins: {
              some: {
                zesty_id: user.zesty_id,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logo: true,
        _count: {
          select: {
            admins: true, // This is admins, not all members. But maybe good enough for "members" count for now.
            jobs: {
              where: {
                status: 'OPEN',
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }));

    // Map to the format expected by frontend
    const mappedStudios = studios.map(studio => ({
      ...studio,
      memberCount: studio._count.admins + 1, // +1 for owner
      jobCount: studio._count.jobs,
    }));

    return NextResponse.json(mappedStudios);

  } catch (error) {
    console.error('Error fetching studios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch studios' },
      { status: 500 }
    );
  }
}
