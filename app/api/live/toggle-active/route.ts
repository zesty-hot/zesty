import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma, withRetry } from '@/lib/prisma';

// This route now toggles the LiveStreamPage (channel) active status
// Not individual stream sessions
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { active } = await request.json();

    if (typeof active !== 'boolean') {
      return NextResponse.json(
        { error: 'Active status is required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await withRetry(() => prisma.user.findUnique({
      where: { email: currentUser.email },
      select: { id: true, liveStreamPage: true },
    }));

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.liveStreamPage) {
      return NextResponse.json(
        { error: 'No livestream channel found' },
        { status: 404 }
      );
    }

    // Update channel active status
    const updated = await withRetry(() => prisma.liveStreamPage.update({
      where: { userId: user.id },
      data: { active },
    }));

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error toggling livestream channel status:', error);
    return NextResponse.json(
      { error: 'Failed to toggle livestream channel status' },
      { status: 500 }
    );
  }
}
