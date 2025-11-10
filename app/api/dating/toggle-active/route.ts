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
    const body = await req.json();
    const { active } = body;

    if (typeof active !== "boolean") {
      return NextResponse.json({ error: "Missing active field" }, { status: 400 });
    }

    const profile = await withRetry(() =>
      prisma.datingPage.update({ where: { userId }, data: { active } })
    );

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error toggling dating profile:", error);
    return NextResponse.json({ error: "Failed to toggle profile" }, { status: 500 });
  }
}
