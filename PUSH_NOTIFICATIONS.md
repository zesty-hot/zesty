# Push Notifications Setup Guide

## Generate VAPID Keys

To use push notifications, you need to generate VAPID keys. Run this command in your terminal:

```bash
npx web-push generate-vapid-keys
```

This will output something like:

```
=======================================

Public Key:
BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U

Private Key:
UUxI4O8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls

=======================================
```

## Add to Environment Variables

Add these keys to your `.env.local` file:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:your-email@example.com
```

Replace:
- `your_public_key_here` with the Public Key from the output
- `your_private_key_here` with the Private Key from the output
- `your-email@example.com` with your contact email or website URL (e.g., https://zesty.app)

## Usage

### Enable Notifications in Settings

Add the `PushNotificationToggle` component to your settings page:

```tsx
import { PushNotificationToggle } from '@/components/push-notification-toggle';

// In your settings page
<PushNotificationToggle />
```

### Send Notifications from Your Backend

Use the helper functions from `lib/push-notifications.ts`:

```tsx
import { sendNewMessageNotification, sendNotificationToUser } from '@/lib/push-notifications';

// Send a message notification
await sendNewMessageNotification(recipientId, senderName, messageText);

// Send a custom notification
await sendNotificationToUser(userId, {
  title: 'Hello!',
  body: 'This is a push notification',
  icon: '/android-chrome-192x192.png',
  url: '/dashboard',
});
```

### Example: Send notification when a new message is received

In your message creation API route:

```tsx
import { sendNewMessageNotification } from '@/lib/push-notifications';

// After creating a message
const message = await prisma.chatMessage.create({
  data: {
    content: messageContent,
    senderId: session.user.id,
    chatId: chatId,
  },
  include: {
    sender: true,
  },
});

// Send push notification to recipient
await sendNewMessageNotification(
  recipientId,
  message.sender.name || 'Someone',
  message.content
);
```

## Testing

1. Open your app in a browser
2. Go to Settings and enable push notifications
3. Grant permission when prompted
4. Send a test notification using the `/api/push/send` endpoint or by triggering an event that sends notifications

## Browser Support

Push notifications are supported in:
- Chrome/Edge (Desktop & Android)
- Firefox (Desktop & Android)
- Safari (Desktop & iOS 16.4+)
- Opera (Desktop & Android)

Note: iOS requires the app to be added to the home screen for push notifications to work.
