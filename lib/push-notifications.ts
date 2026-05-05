import webpush from 'web-push';
import type { PushSubscription } from '@/prisma/generated/client';
import { prisma } from './prisma';

// Initialize VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@zesty.app';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export interface PushNotificationPayload {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  tag?: string;
  requireInteraction?: boolean;
  vibrate?: number[];
}

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushNotificationPayload
) {
  if (!vapidPublicKey || !vapidPrivateKey) {
    throw new Error('VAPID keys not configured');
  }

  try {
    const keys = JSON.parse(subscription.keys);

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    };

    const result = await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload)
    );

    return result;
  } catch (error: any) {
    console.error('Error sending push notification:', error);

    // Handle subscription expiration or errors
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription is no longer valid, mark as inactive
      await prisma.pushSubscription.update({
        where: { id: subscription.id },
        data: { active: false },
      });
    }

    throw error;
  }
}

export async function sendNotificationToUser(
  zesty_id: string,
  payload: PushNotificationPayload
) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      zesty_id: zesty_id,
      active: true,
    },
  });

  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const results = await Promise.allSettled(
    subscriptions.map((subscription) =>
      sendPushNotification(subscription, payload)
    )
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  return { sent, failed };
}

// Helper functions for common notification types

export async function sendNewMessageNotification(
  recipientId: string,
  senderName: string,
  message: string
) {
  return sendNotificationToUser(recipientId, {
    title: `New message from ${senderName}`,
    body: message.length > 100 ? `${message.substring(0, 100)}...` : message,
    icon: '/android-chrome-192x192.png',
    badge: '/android-chrome-192x192.png',
    url: '/messages',
    tag: 'new-message',
    data: { type: 'message', senderId: recipientId },
  });
}

export async function sendNewMatchNotification(
  userId: string,
  matchName: string
) {
  return sendNotificationToUser(userId, {
    title: 'New Match! 🎉',
    body: `You matched with ${matchName}`,
    icon: '/android-chrome-192x192.png',
    badge: '/android-chrome-192x192.png',
    url: '/dating',
    tag: 'new-match',
    data: { type: 'match' },
  });
}

export async function sendLiveStreamNotification(
  userId: string,
  streamerName: string
) {
  return sendNotificationToUser(userId, {
    title: `${streamerName} is live!`,
    body: 'Tap to watch now',
    icon: '/android-chrome-192x192.png',
    badge: '/android-chrome-192x192.png',
    url: '/live',
    tag: 'live-stream',
    requireInteraction: false,
    data: { type: 'livestream' },
  });
}

export async function sendEventReminderNotification(
  userId: string,
  eventTitle: string,
  eventSlug: string
) {
  return sendNotificationToUser(userId, {
    title: 'Event Reminder',
    body: `${eventTitle} is starting soon!`,
    icon: '/android-chrome-192x192.png',
    badge: '/android-chrome-192x192.png',
    url: `/events/${eventSlug}`,
    tag: 'event-reminder',
    requireInteraction: true,
    data: { type: 'event', slug: eventSlug },
  });
}

export async function sendNewOfferNotification(
  workerId: string,
  clientName: string,
  amount: number
) {
  return sendNotificationToUser(workerId, {
    title: 'New Offer Received! 💰',
    body: `${clientName} sent you an offer for $${amount}`,
    icon: '/android-chrome-192x192.png',
    badge: '/android-chrome-192x192.png',
    url: '/messages',
    tag: 'new-offer',
    requireInteraction: true,
    data: { type: 'offer', action: 'new' },
  });
}

export async function sendOfferAcceptedNotification(
  clientId: string,
  workerName: string
) {
  return sendNotificationToUser(clientId, {
    title: 'Offer Accepted! ✅',
    body: `${workerName} accepted your offer`,
    icon: '/android-chrome-192x192.png',
    badge: '/android-chrome-192x192.png',
    url: '/messages',
    tag: 'offer-accepted',
    requireInteraction: true,
    data: { type: 'offer', action: 'accepted' },
  });
}

export async function sendOfferRejectedNotification(
  clientId: string,
  workerName: string
) {
  return sendNotificationToUser(clientId, {
    title: 'Offer Declined',
    body: `${workerName} declined your offer`,
    icon: '/android-chrome-192x192.png',
    badge: '/android-chrome-192x192.png',
    url: '/messages',
    tag: 'offer-rejected',
    data: { type: 'offer', action: 'rejected' },
  });
}

export async function sendOfferConfirmedNotification(
  clientId: string,
  workerName: string
) {
  return sendNotificationToUser(clientId, {
    title: 'Service Completed ⭐',
    body: `${workerName} marked the service as complete. Leave a review!`,
    icon: '/android-chrome-192x192.png',
    badge: '/android-chrome-192x192.png',
    url: '/messages',
    tag: 'offer-confirmed',
    requireInteraction: true,
    data: { type: 'offer', action: 'confirmed' },
  });
}
