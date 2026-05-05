import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/push-notifications';
import { serverSupabase } from '@/lib/supabase/server';

// This is an example endpoint - you would call this from your backend
// when you want to send notifications (e.g., new message, new match, etc.)
export async function POST(req: NextRequest) {
  try {
    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();
    
    // Only authenticated users or server-side processes should send notifications
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { userId, title, body: notificationBody, url, icon, data } = body;

    if (!userId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user's active push subscriptions
    const user = await withRetry(() => prisma.user.findUnique({
      where: { zesty_id: userId },
      include: {
        pushSubscriptions: {
          where: { active: true },
        },
      },
    }));

    if (!user || user.pushSubscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No active subscriptions found for user' },
        { status: 404 }
      );
    }

    // Send notification to all user's devices
    const results = await Promise.allSettled(
      user.pushSubscriptions.map((subscription) =>
        sendPushNotification(subscription, {
          title,
          body: notificationBody,
          icon,
          url,
          data,
        })
      )
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      sent: successful,
      failed,
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
