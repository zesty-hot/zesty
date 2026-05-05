import { NextRequest, NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { serverSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();
    
    const user = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: session.user?.id },
      select: { zesty_id: true, liveStreamPage: true },
    }));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.liveStreamPage) {
      return NextResponse.json({ channel: user.liveStreamPage });
    }

    // Create a simple channel and enable it
    const created = await withRetry(() =>
      prisma.liveStreamPage.create({
        data: {
          user: { connect: { zesty_id: user.zesty_id } },
          active: true,
          description: null,
        },
      })
    );

    return NextResponse.json({ channel: created });
  } catch (error) {
    console.error('Error creating live channel:', error);
    return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 });
  }
}
