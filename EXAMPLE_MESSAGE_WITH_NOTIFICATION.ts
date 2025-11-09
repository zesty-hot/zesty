// Example: Send push notification when a new message is created
// Add this to your message creation API route

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { sendNewMessageNotification } from '@/lib/push-notifications';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { chatId, content } = body;

    // Create the message
    const message = await prisma.chatMessage.create({
      data: {
        content,
        senderId: user.id,
        chatId,
      },
      include: {
        sender: true,
      },
    });

    // Get the chat and other participants
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        activeUsers: {
          where: {
            id: {
              not: user.id, // Exclude the sender
            },
          },
        },
      },
    });

    // Send push notifications to all other participants
    if (chat?.activeUsers) {
      for (const recipient of chat.activeUsers) {
        try {
          await sendNewMessageNotification(
            recipient.id,
            message.sender.name || 'Someone',
            content
          );
        } catch (error) {
          console.error(`Failed to send notification to ${recipient.id}:`, error);
          // Continue sending to other users even if one fails
        }
      }
    }

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
