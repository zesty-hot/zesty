import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Safely get current user, proceeding without authentication if it fails
    let currentUser = null;
    try {
      currentUser = await getCurrentUser();
    } catch (err) {
      console.error('getCurrentUser failed in jobs route, proceeding as unauthenticated:', err);
      currentUser = null;
    }
    
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Job slug is required' },
        { status: 400 }
      );
    }

    // Get full user from database if logged in
    let user = null;
    if (currentUser?.email) {
      user = await withRetry(() => prisma.user.findUnique({
        where: { email: currentUser.email },
        select: { id: true },
      }));
    }

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
                userId: true,
              },
            },
            _count: {
              select: {
                reviews: true,
              },
            },
          },
        },
        applications: user?.id ? {
          where: {
            applicantId: user.id,
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
    const isStudioAdmin = user?.id && (
      job.studio.ownerId === user.id ||
      job.studio.admins.some(admin => admin.userId === user.id)
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
            id: true,
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
