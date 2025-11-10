import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma, withRetry } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    let currentUser = null;
    try {
      currentUser = await getCurrentUser();
    } catch (err) {
      console.error('getCurrentUser failed in live/create route:', err);
      return NextResponse.json({ error: 'Unauthorized - authentication error' }, { status: 401 });
    }

    if (!currentUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user
    const user = await withRetry(() =>
      prisma.user.findUnique({ where: { email: currentUser.email }, select: { id: true, liveStreamPage: true } })
    );

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
          user: { connect: { id: user.id } },
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
