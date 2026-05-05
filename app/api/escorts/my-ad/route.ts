import { NextRequest, NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { serverSupabase } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();

    if (!session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userWithAdds = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: session.user?.id },
      select: {
        zesty_id: true, 
        privateAds: {
          include: {
            services: {
              include: {
                options: true,
              },
            },
            extras: true,
          },
          take: 1,
        }
      },
    }));

    if (!userWithAdds) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const ad = userWithAdds.privateAds[0] || null;

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
