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
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 'sent' or 'received'

    // Fetch offers based on type
    let offers;
    
    if (type === "sent") {
      // Offers sent by this user (as client)
      offers = await withRetry(() =>
        prisma.privateOffer.findMany({
          where: { clientId: userId },
          include: {
            worker: {
              select: {
                id: true,
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
          where: { workerId: userId },
          include: {
            client: {
              select: {
                id: true,
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
            where: { clientId: userId },
            include: {
              worker: {
                select: {
                  id: true,
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
            where: { workerId: userId },
            include: {
              client: {
                select: {
                  id: true,
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
