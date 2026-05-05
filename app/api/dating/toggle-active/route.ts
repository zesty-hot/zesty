import { NextRequest, NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { serverSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { active } = body;

    if (typeof active !== "boolean") {
      return NextResponse.json({ error: "Missing active field" }, { status: 400 });
    }

    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();

    const user = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: session.user?.id },
      select: { zesty_id: true },
    }));

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const profile = await withRetry(() =>
      prisma.datingPage.update({ where: { zesty_id: user.zesty_id }, data: { active } })
    );

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error toggling dating profile:", error);
    return NextResponse.json({ error: "Failed to toggle profile" }, { status: 500 });
  }
}
