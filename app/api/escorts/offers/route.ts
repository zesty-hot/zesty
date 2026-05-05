import { NextRequest, NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { serverSupabase } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 'sent' or 'received'

    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();

    const user = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: session.user?.id },
      select: { zesty_id: true },
    }));

    // Fetch offers based on type
    let offers;

    if (type === "sent") {
      // Offers sent by this user (as client)
      offers = await withRetry(() =>
        prisma.privateOffer.findMany({
          where: { clientId: user?.zesty_id },
          include: {
            worker: {
              select: {
                zesty_id: true,
                slug: true,
                bio: true,
                verified: true,
                images: {
                  where: { default: true },
                  select: { url: true },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        })
      );
    } else if (type === "received") {
      // Offers received by this user (as worker)
      offers = await withRetry(() =>
        prisma.privateOffer.findMany({
          where: { workerId: user?.zesty_id },
          include: {
            client: {
              select: {
                zesty_id: true,
                slug: true,
                bio: true,
                verified: true,
                images: {
                  where: { default: true },
                  select: { url: true },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        })
      );
    } else {
      // Fetch both sent and received
      const [sent, received] = await Promise.all([
        withRetry(() =>
          prisma.privateOffer.findMany({
            where: { clientId: user?.zesty_id },
            include: {
              worker: {
                select: {
                  zesty_id: true,
                  slug: true,
                  bio: true,
                  verified: true,
                  images: {
                    where: { default: true },
                    select: { url: true },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          })
        ),
        withRetry(() =>
          prisma.privateOffer.findMany({
            where: { workerId: user?.zesty_id },
            include: {
              client: {
                select: {
                  zesty_id: true,
                  slug: true,
                  bio: true,
                  verified: true,
                  images: {
                    where: { default: true },
                    select: { url: true },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          })
        ),
      ]);

      return NextResponse.json({ sent, received });
    }

    return NextResponse.json({ offers });
  } catch (error) {
    console.error("Error fetching offers:", error);
    return NextResponse.json(
      { error: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}
