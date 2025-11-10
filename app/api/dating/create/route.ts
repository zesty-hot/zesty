import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma, withRetry } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    // If profile already exists, return it
    const existing = await withRetry(() =>
      prisma.datingPage.findUnique({ where: { userId } })
    );
    if (existing) {
      return NextResponse.json({ profile: existing });
    }

    // Create default dating profile and set active=true
    const created = await withRetry(() =>
      prisma.datingPage.create({
        data: {
          user: { connect: { id: userId } },
          active: true,
          lookingFor: [],
          ageRangeMin: 18,
          ageRangeMax: 100,
          maxDistance: 50,
        },
      })
    );

    return NextResponse.json({ profile: created });
  } catch (err) {
    console.error("Error creating dating profile:", err);
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }
}
