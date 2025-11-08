import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma, withRetry } from '@/lib/prisma';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, description } = await request.json();
    
    // Get user
    const user = await withRetry(() => prisma.user.findUnique({
      where: { email: currentUser.email },
      select: { id: true, slug: true, liveStreamPage: true },
    }));

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.slug) {
      return NextResponse.json(
        { error: 'User must have a slug to create a livestream' },
        { status: 400 }
      );
    }

    // Check if user already has a livestream page
    if (user.liveStreamPage) {
      // Update existing livestream page
      const updated = await withRetry(() => prisma.liveStreamPage.update({
        where: { userId: user.id },
        data: {
          description,
        },
      }));

      return NextResponse.json(updated);
    }

    // Create new livestream page (channel)
    const streamKey = randomBytes(16).toString('hex');

    // Note: We don't create a LiveKit room here anymore
    // Rooms are created when starting a stream session via /api/live/start-stream

    const liveStreamPage = await withRetry(() => prisma.liveStreamPage.create({
      data: {
        description,
        userId: user.id,
        streamKey,
        active: false, // Channel is disabled by default until user activates it
      },
    }));

    return NextResponse.json(liveStreamPage);
  } catch (error) {
    console.error('Error creating livestream:', error);
    return NextResponse.json(
      { error: 'Failed to create livestream' },
      { status: 500 }
    );
  }
}
