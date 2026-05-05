import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { serverSupabase } from '@/lib/supabase/server';

// This route now toggles the LiveStreamPage (channel) active status
// Not individual stream sessions
export async function POST(request: NextRequest) {
  try {
    const { active } = await request.json();

    if (typeof active !== 'boolean') {
      return NextResponse.json(
        { error: 'Active status is required' },
        { status: 400 }
      );
    }

    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();
    
    const user = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: session.user?.id },
      select: { zesty_id: true, liveStreamPage: true },
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
      where: { zesty_id: user.zesty_id },
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
