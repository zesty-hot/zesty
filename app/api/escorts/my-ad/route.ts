import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma, withRetry } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    // Fetch user's private ad (user can only have one)
    const ad = await withRetry(() =>
      prisma.privateAd.findUnique({
        where: { workerId: userId },
        include: {
          services: {
            include: {
              options: true,
            },
          },
          extras: true,
        },
      })
    );

    if (!ad) {
      return NextResponse.json({ ad: null });
    }

    return NextResponse.json({ ad });
  } catch (error) {
    console.error("Error fetching ad:", error);
    return NextResponse.json(
      { error: "Failed to fetch ad" },
      { status: 500 }
    );
  }
}
