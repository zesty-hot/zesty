import { NextRequest, NextResponse } from "next/server";
import { getOrCreateChat } from "@/lib/chat/chat";
import { serverSupabase } from "@/lib/supabase/server";
import { prisma, withRetry } from "@/lib/prisma";

// Create or get existing chat with another user
export async function POST(req: NextRequest) {
  try {
    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();

    const user = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: session?.user?.id },
      select: { slug: true },
    }));

    const userSlug = user?.slug;

    if (!userSlug) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { otherUserSlug } = await req.json();

    if (!otherUserSlug) {
      return NextResponse.json({ error: "otherUserId is required" }, { status: 400 });
    }

    if (otherUserSlug === userSlug) {
      return NextResponse.json({ error: "Cannot create chat with yourself" }, { status: 400 });
    }

    // Get or create the chat
    const chat = await getOrCreateChat(userSlug, otherUserSlug);

    return NextResponse.json(chat);
  } catch (error) {
    console.error("Error creating/getting chat:", error);
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
  }
}
