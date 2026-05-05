import { NextRequest, NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { sendOfferConfirmedNotification, sendNewMessageNotification } from "@/lib/push-notifications";
import { serverSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { offerId } = body;

    if (!offerId) {
      return NextResponse.json(
        { error: "Missing offerId" },
        { status: 400 }
      );
    }

    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();

    const user = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: session.user?.id },
      select: { zesty_id: true },
    }));

    // Get the offer and verify ownership
    const offer = await withRetry(() =>
      prisma.privateOffer.findUnique({
        where: { id: offerId },
        select: {
          id: true,
          workerId: true,
          clientId: true,
          status: true,
          chatId: true,
          service: true,
        },
      })
    );

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    if (offer.workerId !== user?.zesty_id) {
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

    // Send push notification to client to leave a review
    const workerName = updatedOffer.worker.slug || 'Worker';
    await sendOfferConfirmedNotification(offer.clientId, workerName).catch(err => {
      console.error('Failed to send push notification:', err);
    });

    // Create a chat message about the completion
    if (offer.chatId) {
      const completeMessage = await withRetry(() =>
        prisma.chatMessage.create({
          data: {
            content: `🎉 Service (${offer.service.replace(/_/g, " ")}) marked as complete! Payment will be released in 48 hours if no dispute is raised.`,
            senderId: user.zesty_id,
            chatId: offer.chatId!,
          },
        })
      );

      // Send message notification
      await sendNewMessageNotification(offer.clientId, workerName, completeMessage.content).catch(err => {
        console.error('Failed to send message notification:', err);
      });
    }

    return NextResponse.json({ offer: updatedOffer });
  } catch (error) {
    console.error("Error marking offer as complete:", error);
    return NextResponse.json(
      { error: "Failed to mark offer as complete" },
      { status: 500 }
    );
  }
}
