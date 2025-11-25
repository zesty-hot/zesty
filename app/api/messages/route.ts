import { NextRequest, NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { serverSupabase } from "@/lib/supabase/server";

// Get all chats for current user
export async function GET(req: NextRequest) {
  try {
    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: userId },
      select: { zesty_id: true },
    }));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const chats = await withRetry(() => prisma.chat.findMany({
      where: {
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
            createdAt: 'desc',
          },
          take: 1,
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
      orderBy: {
        createdAt: 'desc',
      },
    }));

    // Format the chats to include the other user and last message
    const formattedChats = chats.map((chat) => {
      let otherUser = chat.activeUsers.find((chatUser) => chatUser.zesty_id !== user.zesty_id);

      if (!otherUser) {
        otherUser = {
          zesty_id: 'deleted',
          slug: 'Deleted User',
          images: []
        };
      }

      const lastMessage = chat.messages[0] || null;

      return {
        id: chat.id,
        otherUser,
        lastMessage,
        createdAt: chat.createdAt,
      };
    });

    return NextResponse.json(formattedChats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
  }
}
