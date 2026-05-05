import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { serverSupabase } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();  
    
    const user = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: session.user?.id },
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
