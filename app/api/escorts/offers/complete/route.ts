import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma, withRetry } from "@/lib/prisma";
import { sendOfferConfirmedNotification } from "@/lib/push-notifications";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const { offerId } = body;

    if (!offerId) {
      return NextResponse.json(
        { error: "Missing offerId" },
        { status: 400 }
      );
    }

    // Get the offer and verify ownership
    const offer = await withRetry(() =>
      prisma.privateOffer.findUnique({
        where: { id: offerId },
        select: {
          id: true,
          workerId: true,
          clientId: true,
          status: true,
        },
      })
    );

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    if (offer.workerId !== userId) {
      return NextResponse.json(
        { error: "Only the worker can mark an offer as complete" },
        { status: 403 }
      );
    }

    if (offer.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending offers can be marked as complete" },
        { status: 400 }
      );
    }

    // Mark the offer as confirmed (worker has completed service)
    // The payment will be released after 48 hours if no dispute is raised
    const updatedOffer = await withRetry(() =>
      prisma.privateOffer.update({
        where: { id: offerId },
        data: {
          status: "CONFIRMED",
          completedAt: new Date(),
        },
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
      })
    );

    // Send push notification to client to leave a review
    const workerName = updatedOffer.worker.slug || 'Worker';
    await sendOfferConfirmedNotification(offer.clientId, workerName).catch(err => {
      console.error('Failed to send push notification:', err);
    });

    return NextResponse.json({ offer: updatedOffer });
  } catch (error) {
    console.error("Error marking offer as complete:", error);
    return NextResponse.json(
      { error: "Failed to mark offer as complete" },
      { status: 500 }
    );
  }
}
