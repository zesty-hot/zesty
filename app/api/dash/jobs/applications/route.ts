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

    const applications = await withRetry(() => prisma.jobApplication.findMany({
      where: {
        applicantId: user.zesty_id,
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
          },
        },
        jobId: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }));

    // We need to fetch studio details separately or include them in the query above.
    // Let's include them in the query above.
    // Wait, I need to check if I can include studio through job.
    // Job has studio relation.

    const applicationsWithStudio = await withRetry(() => prisma.jobApplication.findMany({
      where: {
        applicantId: user.zesty_id,
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            studio: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }));

    // Transform the data to match the frontend expectation if needed.
    // Frontend expects: app.job.title, app.studio.name (which is nested in job)
    // Actually frontend code:
    // app.job.title
    // app.studio.name  <-- This assumes app.studio exists directly on app, OR app.job.studio.
    // Let's look at page.tsx again.
    // 186: <p className="text-muted-foreground mb-3">{app.studio.name}</p>
    // It seems it expects app.studio.name directly.
    // But the relation is Job -> Studio.
    // So it should be app.job.studio.name.
    // I will return the structure as is from Prisma, but I might need to flatten it or update frontend.
    // Let's look at page.tsx again carefully.

    return NextResponse.json(applicationsWithStudio.map(app => ({
      ...app,
      studio: app.job.studio, // Flatten for convenience if frontend expects it, or just rely on frontend change.
      // But wait, page.tsx line 186 says app.studio.name.
      // If I return app.job.studio, then app.studio will be undefined unless I map it here.
    })));

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
