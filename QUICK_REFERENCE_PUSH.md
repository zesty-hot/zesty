# Quick Reference: Push Notifications

## Setup (One-Time)

1. Add to `.env.local`:


2. Users can enable notifications at: `/[lang]/dash/settings`

## Send Notifications

### Import
```typescript
import { 
  sendNotificationToUser,
  sendNewMessageNotification,
  sendNewMatchNotification,
  sendLiveStreamNotification,
  sendEventReminderNotification
} from '@/lib/push-notifications';
```

### Quick Examples

**New Message:**
```typescript
await sendNewMessageNotification(recipientId, senderName, messageText);
```

**Dating Match:**
```typescript
await sendNewMatchNotification(userId, matchName);
```

**Live Stream:**
```typescript
await sendLiveStreamNotification(userId, streamerName);
```

**Event Reminder:**
```typescript
await sendEventReminderNotification(userId, eventTitle, eventSlug);
```

**Custom Notification:**
```typescript
await sendNotificationToUser(userId, {
  title: 'Title',
  body: 'Message',
  url: '/path',
  icon: '/android-chrome-192x192.png',
  requireInteraction: false, // true for high-priority
});
```

## Common Use Cases

### 1. New Message
Location: `app/api/messages/route.ts`
```typescript
await sendNewMessageNotification(recipientId, sender.name, message.content);
```

### 2. Dating Match
Location: When creating a `DatingMatch`
```typescript
await sendNewMatchNotification(user1.id, user2.name);
await sendNewMatchNotification(user2.id, user1.name);
```

### 3. Live Stream Start
Location: When setting `LiveStream.isLive = true`
```typescript
const followers = await prisma.liveStreamFollower.findMany({
  where: { channelId }
});

for (const follower of followers) {
  await sendLiveStreamNotification(follower.userId, streamer.name);
}
```

### 4. Event Starting Soon
Location: Scheduled job or cron
```typescript
const attendees = await prisma.eventAttendee.findMany({
  where: { eventId, status: 'GOING' }
});

for (const attendee of attendees) {
  await sendEventReminderNotification(
    attendee.userId, 
    event.title, 
    event.slug
  );
}
```

### 5. VIP Content Posted
```typescript
const subscribers = await prisma.vIPSubscription.findMany({
  where: { vipPageId, active: true }
});

for (const sub of subscribers) {
  await sendNotificationToUser(sub.subscriberId, {
    title: `${creator.name} posted new content`,
    body: 'Check out their latest VIP content',
    url: `/vip/${creator.slug}`,
  });
}
```

## Testing

Test notifications using the API:
```bash
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id_here",
    "title": "Test Notification",
    "body": "This is a test!",
    "url": "/dashboard"
  }'
```

## Browser DevTools

Check subscription status:
```javascript
// In browser console
navigator.serviceWorker.ready.then(reg => {
  reg.pushManager.getSubscription().then(sub => {
    console.log('Subscription:', sub);
  });
});
```

## Troubleshooting

1. **Notifications not showing up?**
   - Check if permission is granted: `Notification.permission`
   - Check if service worker is registered: `navigator.serviceWorker.controller`
   - Check browser console for errors

2. **"VAPID keys not configured" error?**
   - Make sure `.env.local` has the VAPID keys
   - Restart your dev server after adding env variables

3. **Subscription failing?**
   - Service worker must be registered first
   - App must be on HTTPS (or localhost)
   - User must grant permission

## Important Notes

- ✅ Notifications work on desktop and mobile
- ✅ iOS requires app to be added to home screen
- ✅ Chrome/Firefox/Safari all supported
- ⚠️ Rate limit: Don't spam users with too many notifications
- ⚠️ Battery: Be mindful of notification frequency
- ✅ Invalid subscriptions are automatically cleaned up
