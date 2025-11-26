import { NextRequest, NextResponse } from "next/server";
import { serverSupabase } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateChat } from "@/lib/chat/chat";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await serverSupabase();
    const { data: { user: sessionUser } } = await supabase.auth.getUser();

    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userSlug } = await req.json();

    if (!userSlug) {
      return NextResponse.json({ error: "User slug is required" }, { status: 400 });
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { supabaseId: sessionUser.id },
    });

    if (!currentUser || !currentUser.slug) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get event
    const event = await prisma.event.findUnique({
      where: { slug },
      include: { organizer: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get invited user
    const invitedUser = await prisma.user.findUnique({
      where: { slug: userSlug },
    });

    if (!invitedUser || !invitedUser.slug) {
      return NextResponse.json({ error: "User to invite not found" }, { status: 404 });
    }

    if (invitedUser.zesty_id === currentUser.zesty_id) {
      return NextResponse.json({ error: "You cannot invite yourself" }, { status: 400 });
    }

    // Check if already attending or invited
    const existingAttendee = await prisma.eventAttendee.findUnique({
      where: {
        eventId_zesty_id: {
          eventId: event.id,
          zesty_id: invitedUser.zesty_id,
        },
      },
    });

    if (existingAttendee) {
      return NextResponse.json({ error: "User is already on the guest list" }, { status: 400 });
    }

    // Create attendee record
    const attendee = await prisma.eventAttendee.create({
      data: {
        eventId: event.id,
        zesty_id: invitedUser.zesty_id,
        status: 'INVITED',
      },
    });

    // Create chat and send message
    const chat = await getOrCreateChat(currentUser.slug, invitedUser.slug);

    await prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        senderId: currentUser.zesty_id,
        content: `I've invited you to ${event.title}`,
        eventAttendeeId: attendee.id,
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error inviting user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
