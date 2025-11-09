import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendNewMessageNotification } from "@/lib/push-notifications";

// Get messages for a specific chat
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;

    // Verify user is part of this chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        activeUsers: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        activeUsers: {
          select: {
            id: true,
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
                id: true,
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
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const otherUser = chat.activeUsers.find((user) => user.id !== userId);

    // Fetch other user's private ad if they have one
    let otherUserAd = null;
    if (otherUser) {
      otherUserAd = await prisma.privateAd.findUnique({
        where: { workerId: otherUser.id },
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
      });
    }

    return NextResponse.json({
      id: chat.id,
      otherUser,
      messages: chat.messages,
      otherUserAd,
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
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;
    const { content } = await req.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    // Verify user is part of this chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        activeUsers: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Create the message
    const message = await prisma.chatMessage.create({
      data: {
        content: content.trim(),
        senderId: userId,
        chatId: chatId,
      },
      include: {
        sender: {
          select: {
            id: true,
            slug: true,
            images: {
              where: { default: true },
              select: { url: true }
            }
          },
        },
      },
    });

    // Get other user in the chat to send notification
    const chatWithUsers = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        activeUsers: {
          select: { id: true, slug: true },
        },
      },
    });

    const recipientId = chatWithUsers?.activeUsers.find(u => u.id !== userId)?.id;
    
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
