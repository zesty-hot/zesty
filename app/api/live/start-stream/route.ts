import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { createRoom, generateRoomName } from '@/lib/live/livekit';
import { serverSupabase } from '@/lib/supabase/server';

// Start a new live stream session
export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json();

    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();

    // Get user with their livestream channel
    const user = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: session.user?.id },
      select: { 
        zesty_id: true, 
        slug: true,
        liveStreamPage: {
          select: {
            id: true,
            active: true,
            streams: {
              where: { isLive: true },
              select: { id: true },
            },
          },
        },
      },
    }));

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.liveStreamPage) {
      return NextResponse.json(
        { error: 'No livestream channel found. Create a channel first.' },
        { status: 404 }
      );
    }

    if (!user.liveStreamPage.active) {
      return NextResponse.json(
        { error: 'Livestream channel is disabled. Enable it first.' },
        { status: 400 }
      );
    }

    // Check if already streaming
    if (user.liveStreamPage.streams.length > 0) {
      return NextResponse.json(
        { error: 'Already streaming. End current stream first.' },
        { status: 400 }
      );
    }

    // Create LiveKit room for this session
    const roomName = generateRoomName(user.slug!);
    await createRoom(roomName);

    // Create new stream session
    const stream = await withRetry(() => prisma.liveStream.create({
      data: {
        channelId: user.liveStreamPage!.id,
        roomName,
        title: title || user.slug + "'s Live Stream",
        isLive: true,
        viewerCount: 0,
      },
      include: {
        channel: {
          select: {
            id: true,
          },
        },
      },
    }));

    return NextResponse.json(stream);
  } catch (error) {
    console.error('Error starting livestream:', error);
    return NextResponse.json(
      { error: 'Failed to start livestream' },
      { status: 500 }
    );
  }
}
