import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { deleteRoom } from '@/lib/live/livekit';
import { serverSupabase } from '@/lib/supabase/server';

// End the current live stream session
export async function POST(request: NextRequest) {
  try {
    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();
    
    // Get user with their current live stream
    const user = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: session.user?.id },
      select: { 
        zesty_id: true,
        liveStreamPage: {
          select: {
            id: true,
            streams: {
              where: { isLive: true },
              select: {
                id: true,
                roomName: true,
                startedAt: true,
              },
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
        { error: 'No livestream channel found' },
        { status: 404 }
      );
    }

    const currentStream = user.liveStreamPage.streams[0];
    if (!currentStream) {
      return NextResponse.json(
        { error: 'No active stream to end' },
        { status: 404 }
      );
    }

    // Update stream to ended
    const endedStream = await withRetry(() => prisma.liveStream.update({
      where: { id: currentStream.id },
      data: {
        isLive: false,
        endedAt: new Date(),
      },
    }));

    // Clean up LiveKit room
    try {
      await deleteRoom(currentStream.roomName);
    } catch (error) {
      console.error('Error deleting LiveKit room:', error);
      // Don't fail the request if room deletion fails
    }

    return NextResponse.json(endedStream);
  } catch (error) {
    console.error('Error ending livestream:', error);
    return NextResponse.json(
      { error: 'Failed to end livestream' },
      { status: 500 }
    );
  }
}
