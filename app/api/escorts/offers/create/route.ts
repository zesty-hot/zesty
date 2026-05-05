import { NextRequest, NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { PrivateAdServiceCategory, PrivateAdDaysAvailable, PrivateOfferStatus } from "@prisma/client";
import { sendNewOfferNotification, sendNewMessageNotification } from "@/lib/push-notifications";
import { serverSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
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

    // Create or find chat between client and worker
    let finalChatId = chatId;

    if (!finalChatId) {
      // Check if a chat already exists between these users
      // We need to find a chat where BOTH users are active
      const allChats = await withRetry(() =>
        prisma.chat.findMany({
          where: {
            activeUsers: {
              some: {
                zesty_id: user?.zesty_id,
              },
            },
          },
          include: {
            activeUsers: {
              select: {
                zesty_id: true,
              },
            },
          },
        })
      );

      // Find a chat that has exactly these two users
      const existingChat = allChats.find(chat => {
        const userIds = chat.activeUsers.map(u => u.zesty_id).sort();
        const targetIds = [user?.zesty_id, workerId].sort();
        return userIds.length === 2 &&
          userIds[0] === targetIds[0] &&
          userIds[1] === targetIds[1];
      });

      if (existingChat) {
        finalChatId = existingChat.id;
      } else {
        // Create a new chat
        const newChat = await withRetry(() =>
          prisma.chat.create({
            data: {
              activeUsers: {
                connect: [{ zesty_id: user?.zesty_id }, { zesty_id: workerId }],
              },
            },
          })
        );
        finalChatId = newChat.id;
      }
    }

    // Create the offer
    const offer = await withRetry(() =>
      prisma.privateOffer.create({
        data: {
          clientId: user?.zesty_id,
          workerId,
          adId,
          service: service as PrivateAdServiceCategory,
          durationMin: Number.parseInt(durationMin),
          extras: extras || [],
          scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
          dayRequested: dayRequested as PrivateAdDaysAvailable | null,
          isAsap: isAsap || false,
          amount: Number.parseInt(amount),
          chatId: finalChatId,
          status: "OFFER" as PrivateOfferStatus,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
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

    // Create a chat message to notify the worker about the new offer
    // const offerMessage = await withRetry(() =>
    //   prisma.chatMessage.create({
    //     data: {
    //       content: `📋 New offer received: ${service.replace(/_/g, " ")} for $${amount}`,
    //       senderId: user?.zesty_id,
    //       chatId: finalChatId,
    //     },
    //   })
    // );

    // Send push notification to worker
    const clientName = offer.client.slug || 'Someone';
    await Promise.all([
      sendNewOfferNotification(workerId, clientName, offer.amount).catch(err => {
        console.error('Failed to send offer push notification:', err);
      }),
      // sendNewMessageNotification(workerId, clientName, offerMessage.content).catch(err => {
      //   console.error('Failed to send message push notification:', err);
      // })
    ]);

    return NextResponse.json({ offer }, { status: 201 });
  } catch (error) {
    console.error("Error creating offer:", error);
    return NextResponse.json(
      { error: "Failed to create offer" },
      { status: 500 }
    );
  }
}
