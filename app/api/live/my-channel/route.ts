import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma, withRetry } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    let currentUser = null;
    try {
      currentUser = await getCurrentUser();
    } catch (err) {
      console.error('getCurrentUser failed in live/my-channel route:', err);
      return NextResponse.json({ error: 'Unauthorized - authentication error' }, { status: 401 });
    }

    if (!currentUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await withRetry(() => prisma.user.findUnique({
      where: { email: currentUser.email },
      select: { liveStreamPage: true }
    }));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ channel: user.liveStreamPage || null });
  } catch (error) {
    console.error('Error fetching live channel:', error);
    return NextResponse.json({ error: 'Failed to fetch channel' }, { status: 500 });
  }
}
