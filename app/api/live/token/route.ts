import { NextRequest, NextResponse } from 'next/server';
import { generateBroadcasterToken, generateViewerToken } from '@/lib/live/livekit';
import { prisma, withRetry } from '@/lib/prisma';
import { serverSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { roomName, role } = await request.json();

    if (!roomName) {
      return NextResponse.json(
        { error: 'Room name is required' },
        { status: 400 }
      );
    }

    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();

    const user = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: session?.user?.id },
    }));

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if this is the stream owner by finding the active stream session
    const stream = await withRetry(() => prisma.liveStream.findUnique({
      where: { roomName },
      select: {
        channel: {
          select: { zesty_id: true },
        },
      },
    }));

    const isOwner = stream?.channel.zesty_id === user.zesty_id;
    const participantName = user.slug || user.title || 'Anonymous';

    // Generate appropriate token based on role and ownership
    let token: string;
    if (role === 'broadcaster' && isOwner) {
      token = await generateBroadcasterToken(roomName, user.zesty_id, participantName);
    } else {
      token = await generateViewerToken(roomName, user.zesty_id, participantName);
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
