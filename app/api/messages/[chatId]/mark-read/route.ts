import { NextRequest, NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { serverSupabase } from "@/lib/supabase/server";

// Mark messages as read in a chat
export async function POST(
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
    }));

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Find all messages from others in this chat
    const messagesFromOthers = await withRetry(() => prisma.chatMessage.findMany({
      where: {
        chatId: chatId,
        senderId: {
          not: user.zesty_id,
        },
      },
      select: {
        id: true,
      },
    }));

    if (messagesFromOthers.length === 0) {
      return NextResponse.json({ success: true, markedRead: 0 });
    }

    // Find which of these messages have already been read
    const alreadyRead = await withRetry(() => prisma.messageRead.findMany({
      where: {
        messageId: {
          in: messagesFromOthers.map(m => m.id),
        },
        zesty_id: user.zesty_id,
      },
      select: {
        messageId: true,
      },
    }));

    const alreadyReadIds = new Set(alreadyRead.map(r => r.messageId));
    const unreadMessages = messagesFromOthers.filter(m => !alreadyReadIds.has(m.id));

    // Mark all unread messages as read
    if (unreadMessages.length > 0) {
      await withRetry(() => prisma.messageRead.createMany({
        data: unreadMessages.map((msg) => ({
          messageId: msg.id,
          zesty_id: user.zesty_id,
        })),
        skipDuplicates: true, // In case of race conditions
      }));
    }

    return NextResponse.json({ success: true, markedRead: unreadMessages.length });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json({ error: "Failed to mark messages as read" }, { status: 500 });
  }
}
