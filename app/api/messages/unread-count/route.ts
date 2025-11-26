import { NextRequest, NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { serverSupabase } from "@/lib/supabase/server";

// Get count of unread messages for current user
export async function GET(req: NextRequest) {
  try {
    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();
    const supabaseId = session?.user?.id;

    if (!supabaseId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Count messages where:
    // 1. User is in the chat (active)
    // 2. Message was not sent by the user
    // 3. User has not read the message

    // First, get all messages from others in user's chats
    const messagesFromOthers = await withRetry(() => prisma.chatMessage.findMany({
      where: {
        chat: {
          activeUsers: {
            some: {
              supabaseId: supabaseId,
            },
          },
        },
        sender: {
          supabaseId: {
            not: supabaseId,
          },
        },
      },
      select: {
        id: true,
        chatId: true,
      },
    }));

    if (messagesFromOthers.length === 0) {
      return NextResponse.json({
        totalUnread: 0,
        chatsWithUnread: 0,
        unreadByChat: [],
      });
    }

    const user = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: supabaseId },
      select: { zesty_id: true },
    }));

    // Find which messages have been read by this user
    const readMessages = await withRetry(() => prisma.messageRead.findMany({
      where: {
        messageId: {
          in: messagesFromOthers.map(m => m.id),
        },
        zesty_id: user?.zesty_id,
      },
      select: {
        messageId: true,
      },
    }));

    const readMessageIds = new Set(readMessages.map(r => r.messageId));
    const unreadMessages = messagesFromOthers.filter(m => !readMessageIds.has(m.id));

    // Group unread messages by chat
    const unreadByChat = unreadMessages.reduce((acc, msg) => {
      if (!acc[msg.chatId]) {
        acc[msg.chatId] = 0;
      }
      acc[msg.chatId]++;
      return acc;
    }, {} as Record<string, number>);

    const chatUnreadCounts = Object.entries(unreadByChat).map(([chatId, count]) => ({
      chatId,
      count,
    }));

    return NextResponse.json({
      totalUnread: unreadMessages.length,
      chatsWithUnread: chatUnreadCounts.length,
      unreadByChat: chatUnreadCounts,
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json({ error: "Failed to fetch unread count" }, { status: 500 });
  }
}
