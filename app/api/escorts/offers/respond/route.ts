import { NextRequest, NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { sendOfferAcceptedNotification, sendOfferRejectedNotification, sendNewMessageNotification } from "@/lib/push-notifications";
import { serverSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {

    const body = await req.json();
    const { offerId, action } = body; // action: 'accept' or 'reject'

    if (!offerId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (action !== "accept" && action !== "reject") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
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
          amount: true,
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
        { error: "You are not authorized to respond to this offer" },
        { status: 403 }
      );
    }

    if (offer.status !== "OFFER") {
      return NextResponse.json(
        { error: "This offer has already been responded to" },
        { status: 400 }
      );
    }

    if (action === "reject") {
      // Simply reject the offer
      const updatedOffer = await withRetry(() =>
        prisma.privateOffer.update({
          where: { id: offerId },
          data: {
            status: "REJECTED",
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

      // Send push notification to client
      const workerName = updatedOffer.worker.slug || 'Worker';
      await sendOfferRejectedNotification(offer.clientId, workerName).catch(err => {
        console.error('Failed to send push notification:', err);
      });

      // Create a chat message about the rejection
      if (offer.chatId) {
        const rejectMessage = await withRetry(() =>
          prisma.chatMessage.create({
            data: {
              content: `❌ Offer for ${offer.service.replace(/_/g, " ")} was declined`,
              senderId: user.zesty_id,
              chatId: offer.chatId!,
            },
          })
        );

        // Send message notification
        await sendNewMessageNotification(offer.clientId, workerName, rejectMessage.content).catch(err => {
          console.error('Failed to send message notification:', err);
        });
      }

      return NextResponse.json({ offer: updatedOffer });
    }

    // Accept the offer - this requires payment processing
    // For now, we'll mark it as PENDING and handle payment separately
    // In a real implementation, this would:
    // 1. Charge the client the full amount + $5 credit fee
    // 2. Hold the funds in escrow
    // 3. Set creditFeePaid to true

    const updatedOffer = await withRetry(() =>
      prisma.privateOffer.update({
        where: { id: offerId },
        data: {
          status: "PENDING",
          acceptedAt: new Date(),
          // TODO: Add Stripe payment intent creation here
          // creditFeePaid: true,
          // stripePaymentIntentId: paymentIntent.id,
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

    // Send push notification to client
    const workerName = updatedOffer.worker.slug || 'Worker';
    await sendOfferAcceptedNotification(offer.clientId, workerName).catch(err => {
      console.error('Failed to send push notification:', err);
    });

    // Create a chat message about the acceptance
    if (offer.chatId) {
      const acceptMessage = await withRetry(() =>
        prisma.chatMessage.create({
          data: {
            content: `✅ Offer for ${offer.service.replace(/_/g, " ")} was accepted! Payment of $${offer.amount} is being processed.`,
            senderId: user.zesty_id,
            chatId: offer.chatId!,
          },
        })
      );

      // Send message notification
      await sendNewMessageNotification(offer.clientId, workerName, acceptMessage.content).catch(err => {
        console.error('Failed to send message notification:', err);
      });
    }

    return NextResponse.json({ offer: updatedOffer });
  } catch (error) {
    console.error("Error responding to offer:", error);
    return NextResponse.json(
      { error: "Failed to respond to offer" },
      { status: 500 }
    );
  }
}
