import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { calculateDistance } from '@/lib/calculate-distance';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      slug,
      longitude,
      latitude,
      page = 1,
      limit = 20,
      type,
      status = 'OPEN',
    } = body;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: status || 'OPEN', // Default to OPEN jobs
      OR: [
        { endDate: null },
        { endDate: { gte: new Date() } }
      ]
    };

    // Filter by job type
    if (type) {
      where.type = type;
    }

    // Search by slug (job title/studio)
    if (slug) {
      where.OR = [
        { slug: { contains: slug.toLowerCase(), mode: 'insensitive' } },
        { title: { contains: slug, mode: 'insensitive' } },
        { studio: { slug: { contains: slug.toLowerCase(), mode: 'insensitive' } } },
        { studio: { name: { contains: slug, mode: 'insensitive' } } },
      ];
    }

    // Location-based search
    if (longitude !== undefined && latitude !== undefined) {
      // For location search, we need to get all jobs and filter by distance
      const allJobs = await withRetry(() => prisma.job.findMany({
        where,
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
          coverImage: true,
          status: true,
          maxApplicants: true,
          studio: {
            select: {
              id: true,
              slug: true,
              name: true,
              logo: true,
              verified: true,
            },
          },
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
        orderBy: { createdAt: 'desc' },
      }));

      // Filter and sort by distance
      const jobsWithDistance = allJobs
        .map(job => {
          if (!job.location) return null;

          const [jobLat, jobLng] = job.location.split(',').map(Number);
          const distance = calculateDistance(latitude, longitude, jobLat, jobLng);

          return {
            ...job,
            distance,
            distanceText: distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`,
            applicationCount: job._count.applications,
          };
        })
        .filter(job => job !== null)
        .sort((a, b) => a!.distance - b!.distance)
        .slice(skip, skip + limit);

      return NextResponse.json({
        jobs: jobsWithDistance,
        page,
        limit,
        hasMore: allJobs.length > skip + limit,
      });
    }

    // Regular search without location
    const jobs = await withRetry(() => prisma.job.findMany({
      where,
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
        coverImage: true,
        status: true,
        maxApplicants: true,
        studio: {
          select: {
            id: true,
            slug: true,
            name: true,
            logo: true,
            verified: true,
          },
        },
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
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }));

    const jobsWithCount = jobs.map(job => ({
      ...job,
      applicationCount: job._count.applications,
    }));

    return NextResponse.json({
      jobs: jobsWithCount,
      page,
      limit,
      hasMore: jobs.length === limit,
    });
  } catch (error) {
    console.error('Error searching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to search jobs' },
      { status: 500 }
    );
  }
}
