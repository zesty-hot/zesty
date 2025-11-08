import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { generateBroadcasterToken, generateViewerToken } from '@/lib/livekit';
import { prisma, withRetry } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { roomName, role } = await request.json();

    if (!roomName) {
      return NextResponse.json(
        { error: 'Room name is required' },
        { status: 400 }
      );
    }

    // Get user details
    const user = await withRetry(() => prisma.user.findUnique({
      where: { email: currentUser.email },
      select: { id: true, slug: true, title: true },
    }));

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if this is the stream owner by finding the active stream session
    const stream = await withRetry(() => prisma.liveStream.findUnique({
      where: { roomName },
      select: { 
        channel: {
          select: { userId: true },
        },
      },
    }));

    const isOwner = stream?.channel.userId === user.id;
    const participantName = user.slug || user.title || 'Anonymous';

    // Generate appropriate token based on role and ownership
    let token: string;
    if (role === 'broadcaster' && isOwner) {
      token = await generateBroadcasterToken(roomName, user.id, participantName);
    } else {
      token = await generateViewerToken(roomName, user.id, participantName);
    }

    return NextResponse.json({
      token,
      wsUrl: process.env.NEXT_PUBLIC_LIVEKIT_WS_URL,
    });
  } catch (error) {
    console.error('Error generating LiveKit token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
