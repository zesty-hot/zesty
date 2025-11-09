import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma, withRetry } from "@/lib/prisma";
import { PrivateAdServiceCategory, DaysAvailable } from "@prisma/client";
import { sendNewOfferNotification } from "@/lib/push-notifications";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const body = await req.json();
    const {
      workerId,
      adId,
      service,
      durationMin,
      extras,
      scheduledFor,
      dayRequested,
      isAsap,
      amount,
      chatId,
    } = body;

    // Validate required fields
    if (!workerId || !adId || !service || !durationMin || amount === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the ad exists and belongs to the worker
    const ad = await withRetry(() =>
      prisma.privateAd.findUnique({
        where: { id: adId },
        select: { workerId: true, active: true },
      })
    );

    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    if (ad.workerId !== workerId) {
      return NextResponse.json(
        { error: "Ad does not belong to this worker" },
        { status: 400 }
      );
    }

    if (!ad.active) {
      return NextResponse.json(
        { error: "This ad is not active" },
        { status: 400 }
      );
    }

    // Create the offer
    const offer = await withRetry(() =>
      prisma.privateOffer.create({
        data: {
          clientId: userId,
          workerId,
          adId,
          service: service as PrivateAdServiceCategory,
          durationMin: Number.parseInt(durationMin),
          extras: extras || [],
          scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
          dayRequested: dayRequested as DaysAvailable | null,
          isAsap: isAsap || false,
          amount: Number.parseInt(amount),
          chatId: chatId || null,
          status: "OFFER",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
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

    // Send push notification to worker
    const clientName = offer.client.slug || 'Someone';
    await sendNewOfferNotification(workerId, clientName, offer.amount).catch(err => {
      console.error('Failed to send push notification:', err);
    });

    return NextResponse.json({ offer }, { status: 201 });
  } catch (error) {
    console.error("Error creating offer:", error);
    return NextResponse.json(
      { error: "Failed to create offer" },
      { status: 500 }
    );
  }
}
