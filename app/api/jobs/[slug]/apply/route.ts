import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    let currentUser = null;
    try {
      currentUser = await getCurrentUser();
    } catch (err) {
      console.error('getCurrentUser failed in jobs/apply route:', err);
      return NextResponse.json({ error: 'Unauthorized - authentication error' }, { status: 401 });
    }
    
    if (!currentUser?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const body = await request.json();
    const { coverLetter } = body;

    // Get user from database
    const user = await withRetry(() => prisma.user.findUnique({
      where: { email: currentUser.email },
      select: { id: true },
    }));

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get job
    const job = await withRetry(() => prisma.job.findUnique({
      where: { slug },
      select: {
        id: true,
        status: true,
        maxApplicants: true,
        _count: {
          select: {
            applications: {
              where: {
                status: { in: ['PENDING', 'ACCEPTED'] },
              },
            },
          },
        },
      },
    }));

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if job is accepting applications
    if (job.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'This job is not accepting applications' },
        { status: 400 }
      );
    }

    // Check if max applicants reached
    if (job.maxApplicants && job._count.applications >= job.maxApplicants) {
      return NextResponse.json(
        { error: 'This job has reached the maximum number of applicants' },
        { status: 400 }
      );
    }

    // Check if user has already applied
    const existingApplication = await withRetry(() => prisma.jobApplication.findUnique({
      where: {
        jobId_applicantId: {
          jobId: job.id,
          applicantId: user.id,
        },
      },
    }));

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 400 }
      );
    }

    // Create application
    const application = await withRetry(() => prisma.jobApplication.create({
      data: {
        jobId: job.id,
        applicantId: user.id,
        coverLetter,
        status: 'PENDING',
      },
      select: {
        id: true,
        status: true,
        coverLetter: true,
        createdAt: true,
      },
    }));

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error applying to job:', error);
    return NextResponse.json(
      { error: 'Failed to apply to job' },
      { status: 500 }
    );
  }
}

// Withdraw application
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    let currentUser = null;
    try {
      currentUser = await getCurrentUser();
    } catch (err) {
      console.error('getCurrentUser failed in jobs/apply DELETE route:', err);
      return NextResponse.json({ error: 'Unauthorized - authentication error' }, { status: 401 });
    }
    
    if (!currentUser?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { slug } = await params;

    // Get user from database
    const user = await withRetry(() => prisma.user.findUnique({
      where: { email: currentUser.email },
      select: { id: true },
    }));

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get job
    const job = await withRetry(() => prisma.job.findUnique({
      where: { slug },
      select: { id: true },
    }));

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Update application status to withdrawn
    await withRetry(() => prisma.jobApplication.updateMany({
      where: {
        jobId: job.id,
        applicantId: user.id,
        status: 'PENDING',
      },
      data: {
        status: 'WITHDRAWN',
      },
    }));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error withdrawing application:', error);
    return NextResponse.json(
      { error: 'Failed to withdraw application' },
      { status: 500 }
    );
  }
}
