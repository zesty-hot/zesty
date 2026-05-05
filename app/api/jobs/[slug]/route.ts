import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { serverSupabase } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {

    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Job slug is required' },
        { status: 400 }
      );
    }

    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();

    const user = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: session.user?.id },
      select: { zesty_id: true },
    }));

    const job = await withRetry(() => prisma.job.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        type: true,
        payAmount: true,
        payType: true,
        lengthHours: true,
        lengthDays: true,
        location: true,
        suburb: true,
        venue: true,
        startDate: true,
        endDate: true,
        requirements: true,
        coverImage: true,
        status: true,
        maxApplicants: true,
        studioId: true,
        studio: {
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            logo: true,
            coverImage: true,
            location: true,
            suburb: true,
            website: true,
            verified: true,
            ownerId: true,
            admins: {
              select: {
                zesty_id: true,
              },
            },
            _count: {
              select: {
                reviews: true,
              },
            },
          },
        },
        applications: user?.zesty_id ? {
          where: {
            applicantId: user.zesty_id,
          },
          select: {
            id: true,
            status: true,
            coverLetter: true,
            createdAt: true,
          },
        } : false,
        _count: {
          select: {
            applications: {
              where: {
                status: { in: ['PENDING', 'ACCEPTED'] },
              },
            },
          },
        },
        createdAt: true,
      },
    }));

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if user is studio admin/owner
    const isStudioAdmin = user?.zesty_id && (
      job.studio.ownerId === user.zesty_id ||
      job.studio.admins.some(admin => admin.zesty_id === user.zesty_id)
    );

    // Get studio reviews and average rating
    const reviews = await withRetry(() => prisma.studioReview.findMany({
      where: { studioId: job.studioId },
      select: {
        id: true,
        rating: true,
        comment: true,
        wouldWorkAgain: true,
        reviewer: {
          select: {
            zesty_id: true,
            slug: true,
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }));

    const averageRating = reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0;

    const wouldWorkAgainPercentage = reviews.length > 0
      ? (reviews.filter(r => r.wouldWorkAgain).length / reviews.length) * 100
      : 0;

    return NextResponse.json({
      ...job,
      applicationCount: job._count.applications,
      userApplication: job.applications?.[0] || null,
      isStudioAdmin,
      studio: {
        ...job.studio,
        reviewCount: job.studio._count.reviews,
        averageRating: Math.round(averageRating * 10) / 10,
        wouldWorkAgainPercentage: Math.round(wouldWorkAgainPercentage),
        reviews,
      },
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    );
  }
}
