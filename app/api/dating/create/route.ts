import { NextRequest, NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { serverSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const user = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: session.user?.id },
      select: { zesty_id: true },
    }));

    const existing = await withRetry(() =>
      prisma.datingPage.findUnique({ where: { zesty_id: user?.zesty_id } })
    );

    if (existing) {
      return NextResponse.json({ profile: existing });
    }

    // Create default dating profile and set active=true
    const created = await withRetry(() =>
      prisma.datingPage.create({
        data: {
          user: { connect: { zesty_id: user?.zesty_id } },
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
