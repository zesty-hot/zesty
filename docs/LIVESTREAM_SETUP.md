# LiveKit Livestream System - Implementation Guide

This document provides comprehensive information about the LiveKit livestream system integrated into your Next.js application.

## Overview

The livestream system allows users to:
- Start and broadcast live streams using WebRTC
- View active livestreams with real-time video and chat
- Search for streams by username or location
- Send donations/tips to streamers (stub implementation)
- Pay a small fee to go live (stub implementation)

## Technology Stack

- **LiveKit** - WebRTC infrastructure for real-time video/audio streaming
  - `livekit-server-sdk` - Server-side SDK for token generation and room management
  - `livekit-client` - Client-side SDK for connecting to LiveKit
  - `@livekit/components-react` - Pre-built React components for video UI

## Environment Variables

Add these to your `.env` file:

```bash
# LiveKit Configuration
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
NEXT_PUBLIC_LIVEKIT_WS_URL=wss://your-livekit-server.livekit.cloud
```

### Getting LiveKit Credentials

1. Sign up at [livekit.io](https://livekit.io/)
2. Create a new project
3. Copy your API Key and Secret from the dashboard
4. Use the WebSocket URL provided (format: `wss://your-project.livekit.cloud`)

For local development, you can run LiveKit locally:
```bash
docker run --rm -it -p 7880:7880 livekit/livekit-server --dev --bind 0.0.0.0
```

Then use:
```bash
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
NEXT_PUBLIC_LIVEKIT_WS_URL=ws://localhost:7880
```

## API Routes

### POST /api/live/token
Generate LiveKit access token for joining a stream.

**Request:**
```json
{
  "roomName": "live-username-1234567890",
  "role": "broadcaster" | "viewer"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "wsUrl": "wss://your-livekit-server.livekit.cloud"
}
```

### POST /api/live/create
Create or update a livestream page.

**Request:**
```json
{
  "title": "My Awesome Stream",
  "description": "Join me for live content!"
}
```

**Response:**
```json
{
  "id": "clxxxx",
  "slug": "username",
  "title": "My Awesome Stream",
  "roomName": "live-username-1234567890",
  "streamKey": "abc123...",
  "active": false
}
```

### POST /api/live/toggle-active
Toggle the stream's active status (start/stop streaming).

**Request:**
```json
{
  "active": true
}
```

### POST /api/live/search
Search for livestreams by username or location.

**Request (by username):**
```json
{
  "slug": "username",
  "page": 1,
  "limit": 8
}
```

**Request (by location):**
```json
{
  "longitude": -122.4194,
  "latitude": 37.7749,
  "page": 1,
  "limit": 8
}
```

**Response:**
```json
{
  "streams": [...],
  "total": 42,
  "totalPages": 6
}
```

## Component Usage

### LiveStreamViewer
Used by viewers to watch a livestream.

```tsx
import { LiveStreamViewer } from '@/app/[lang]/live/(client-renders)/livekit-components';

<LiveStreamViewer 
  roomName="live-username-1234567890"
  userSlug="username"
/>
```

### LiveStreamBroadcaster
Used by streamers to broadcast.

```tsx
import { LiveStreamBroadcaster } from '@/app/[lang]/live/(client-renders)/livekit-components';

<LiveStreamBroadcaster 
  roomName="live-username-1234567890"
  userSlug="username"
  onStreamEnd={() => console.log('Stream ended')}
/>
```

## Payment Integration (Stub)

The system includes stub functions for payments that need to be replaced with actual payment gateway integration:

### payToGoLive
Process payment for streaming access.

```typescript
import { payToGoLive } from '@/lib/payments';

const result = await payToGoLive(userId, slug, 500); // $5.00
if (result.success) {
  // Enable streaming
}
```

### sendStreamDonation
Process donations/tips to streamers.

```typescript
import { sendStreamDonation } from '@/lib/payments';

const result = await sendStreamDonation(donorId, streamId, 1000, "Great stream!");
if (result.success) {
  // Show success message
}
```

## Features

### Landing Page (`/live`)
- Displays grid of active livestreams
- Search by username or location
- Unified search component integration
- Real-time updates of stream status

### Stream Page (`/live/[slug]`)
- **Active Stream:**
  - Full LiveKit video player
  - Live chat sidebar (placeholder)
  - Donation/tip button
  - Stream controls for broadcaster
  
- **Offline Stream:**
  - Profile-like view with streamer info
  - Description and bio
  - "Go Live" button for stream owner
  - Links to other profiles (VIP, Escorts)

### User Flow

1. **Broadcaster:**
   - Create livestream page via `/api/live/create`
   - Pay fee to go live (stub function)
   - Toggle stream active via "Go Live" button
   - LiveKit room is created automatically
   - Start broadcasting audio/video
   - End stream via "End Stream" button

2. **Viewer:**
   - Browse active streams on `/live`
   - Click stream to watch
   - Automatic connection to LiveKit room
   - View real-time video/audio
   - Send messages in chat (coming soon)
   - Send donations/tips (stub)

## TODO / Future Enhancements

1. **Payment Integration:**
   - Replace stub functions with actual payment gateway (Stripe, PayPal)
   - Implement subscription model for streaming access
   - Process real donations with proper accounting

2. **Chat System:**
   - Implement real-time chat using LiveKit's data channels
   - Add chat moderation features
   - Donation alerts in chat

3. **Stream Quality:**
   - Add quality selector for viewers
   - Implement adaptive bitrate streaming
   - Add stream statistics/health monitoring

4. **Notifications:**
   - Notify followers when streamer goes live
   - Email/push notifications
   - Subscribe to favorite streamers

5. **Analytics:**
   - Viewer count tracking
   - Stream duration statistics
   - Donation/tip analytics
   - Most popular streams

6. **Moderation:**
   - Block/ban viewers
   - Chat moderation tools
   - Report system

7. **RTMP Ingress:**
   - Allow streaming from OBS/external software
   - Configure RTMP endpoints via LiveKit ingress


### Long term future goal

1. **Recording:**
   - Implement stream recording
   - VOD (Video on Demand) playback
   - Archive management

## Troubleshooting

### "Failed to connect to livestream"
- Check that LiveKit credentials are correct in `.env`
- Verify LiveKit server is accessible
- Check browser console for WebRTC errors

### "No live streams"
- Ensure streams have `active: true` in database
- Check that LiveKit rooms are being created properly
- Verify search API is returning results

### Video/Audio Not Working
- Check browser permissions for camera/microphone
- Verify LiveKit token has proper permissions
- Test with LiveKit example applications first

## Resources

- [LiveKit Documentation](https://docs.livekit.io/)
- [LiveKit React Components](https://docs.livekit.io/client-sdk-js/react/)
- [WebRTC Basics](https://webrtc.org/getting-started/overview)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## Support

For issues specific to:
- **LiveKit:** Check [LiveKit Community](https://livekit.io/community)
- **Payment Integration:** Refer to your payment gateway documentation
- **General Questions:** See main README or open an issue
