import { NextRequest, NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { sendNewMessageNotification } from "@/lib/push-notifications";
import { serverSupabase } from "@/lib/supabase/server";

// Get messages for a specific chat
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();

    const user = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: session?.user?.id },
      select: { zesty_id: true },
    }));

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;

    // Verify user is part of this chat
    const chat = await withRetry(() => prisma.chat.findFirst({
      where: {
        id: chatId,
        activeUsers: {
          some: {
            zesty_id: user.zesty_id,
          },
        },
      },
      include: {
        activeUsers: {
          select: {
            zesty_id: true,
            slug: true,
            images: {
              where: { default: true },
              select: { url: true }
            }
          },
        },
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            sender: {
              select: {
                zesty_id: true,
                slug: true,
                images: {
                  where: { default: true },
                  select: { url: true }
                }
              },
            },
          },
        },
      },
    }));

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const otherUser = chat.activeUsers.find((chatUser) => chatUser.zesty_id !== user.zesty_id);

    // Fetch other user's private ad if they have one
    let otherUserAd = null;
    if (otherUser) {
      otherUserAd = await withRetry(() => prisma.privateAd.findUnique({
        where: { workerId: otherUser.zesty_id },
        include: {
          services: {
            include: {
              options: true,
            },
          },
          extras: {
            where: { active: true },
          },
        },
      }));
    }

    // Fetch offers related to this chat
    const offers = await withRetry(() => prisma.privateOffer.findMany({
      where: {
        chatId: chatId,
      },
      include: {
        client: {
          select: {
            zesty_id: true,
            slug: true,
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
            verified: true,
            images: {
              where: { default: true },
              select: { url: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    }));

    return NextResponse.json({
      id: chat.id,
      otherUser,
      messages: chat.messages,
      otherUserAd,
      offers,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// Send a new message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: session.user.id },
      select: { zesty_id: true },
    }));

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;
    const { content } = await req.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    // Verify user is part of this chat
    const chat = await withRetry(() => prisma.chat.findFirst({
      where: {
        id: chatId,
        activeUsers: {
          some: {
            zesty_id: user.zesty_id,
          },
        },
      },
    }));

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Create the message
    const message = await withRetry(() => prisma.chatMessage.create({
      data: {
        content: content.trim(),
        senderId: user.zesty_id,
        chatId: chatId,
      },
      include: {
        sender: {
          select: {
            zesty_id: true,
            slug: true,
            images: {
              where: { default: true },
              select: { url: true }
            }
          },
        },
      },
    }));

    // Get other user in the chat to send notification
    const chatWithUsers = await withRetry(() => prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        activeUsers: {
          select: { zesty_id: true, slug: true },
        },
      },
    }));

    const recipientId = chatWithUsers?.activeUsers.find((chatUser) => chatUser.zesty_id !== user.zesty_id)?.zesty_id;

    if (recipientId) {
      // Send push notification to recipient
      const senderName = message.sender.slug || 'Someone';
      await sendNewMessageNotification(recipientId, senderName, content.trim()).catch(err => {
        console.error('Failed to send push notification:', err);
      });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
