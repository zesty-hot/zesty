import { NextRequest, NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { serverSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { offerId, reason } = body;

    if (!offerId || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();

    const user = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: session.user?.id },
      select: { zesty_id: true },
    }));

    // Get the offer and verify the user is the client
    const offer = await withRetry(() =>
      prisma.privateOffer.findUnique({
        where: { id: offerId },
        select: {
          id: true,
          clientId: true,
          status: true,
          completedAt: true,
        },
      })
    );

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    if (offer.clientId !== user?.zesty_id) {
      return NextResponse.json(
        { error: "Only the client can raise a dispute" },
        { status: 403 }
      );
    }

    if (offer.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Can only dispute confirmed offers" },
        { status: 400 }
      );
    }

    // Check if within 48 hours of completion
    if (offer.completedAt) {
      const hoursSinceCompletion = 
        (Date.now() - offer.completedAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceCompletion > 48) {
        return NextResponse.json(
          { error: "Dispute period has expired (48 hours after completion)" },
          { status: 400 }
        );
      }
    }

    // Raise the dispute
    const updatedOffer = await withRetry(() =>
      prisma.privateOffer.update({
        where: { id: offerId },
        data: {
          status: "DISPUTED",
          disputeReason: reason,
          disputeRaisedAt: new Date(),
        },
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
      })
    );

    return NextResponse.json({ offer: updatedOffer });
  } catch (error) {
    console.error("Error raising dispute:", error);
    return NextResponse.json(
      { error: "Failed to raise dispute" },
      { status: 500 }
    );
  }
}
