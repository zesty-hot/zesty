import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

// Initialize LiveKit configuration from environment variables
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || '';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || '';
const LIVEKIT_WS_URL = process.env.NEXT_PUBLIC_LIVEKIT_WS_URL || 'ws://localhost:7880';

// Create RoomServiceClient for server-side operations
const roomService = new RoomServiceClient(LIVEKIT_WS_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);

/**
 * Generate a LiveKit access token for a participant
 * @param roomName - The name of the room to join
 * @param participantIdentity - Unique identifier for the participant
 * @param participantName - Display name for the participant
 * @param canPublish - Whether the participant can publish audio/video
 * @param canSubscribe - Whether the participant can subscribe to other streams
 * @returns JWT token string
 */
export async function generateLiveKitToken(
  roomName: string,
  participantIdentity: string,
  participantName: string,
  options: {
    canPublish?: boolean;
    canSubscribe?: boolean;
    canPublishData?: boolean;
  } = {}
): Promise<string> {
  const {
    canPublish = false,
    canSubscribe = true,
    canPublishData = true,
  } = options;

  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: participantIdentity,
    name: participantName,
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish,
    canSubscribe,
    canPublishData,
  });

  return await at.toJwt();
}

/**
 * Generate a broadcaster token with publish permissions
 */
export async function generateBroadcasterToken(
  roomName: string,
  participantIdentity: string,
  participantName: string
): Promise<string> {
  return await generateLiveKitToken(roomName, participantIdentity, participantName, {
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });
}

/**
 * Generate a viewer token with only subscribe permissions
 */
export async function generateViewerToken(
  roomName: string,
  participantIdentity: string,
  participantName: string
): Promise<string> {
  return await generateLiveKitToken(roomName, participantIdentity, participantName, {
    canPublish: false,
    canSubscribe: true,
    canPublishData: true, // Allow chat messages
  });
}

/**
 * Create a new LiveKit room
 * @param roomName - Unique name for the room
 * @returns Room object
 */
export async function createRoom(roomName: string) {
  try {
    const room = await roomService.createRoom({
      name: roomName,
      emptyTimeout: 300, // Auto-delete room after 5 minutes of being empty
      maxParticipants: 100,
    });
    return room;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
}

/**
 * Delete a LiveKit room
 * @param roomName - Name of the room to delete
 */
export async function deleteRoom(roomName: string) {
  try {
    await roomService.deleteRoom(roomName);
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
}

/**
 * List all active rooms
 * @returns Array of room objects
 */
export async function listRooms() {
  try {
    const rooms = await roomService.listRooms();
    return rooms;
  } catch (error) {
    console.error('Error listing rooms:', error);
    throw error;
  }
}

/**
 * Get room details
 * @param roomName - Name of the room
 * @returns Room object with participants
 */
export async function getRoomInfo(roomName: string) {
  try {
    const participants = await roomService.listParticipants(roomName);
    return {
      roomName,
      participants,
      participantCount: participants.length,
    };
  } catch (error) {
    console.error('Error getting room info:', error);
    return null;
  }
}

/**
 * Remove a participant from a room
 * @param roomName - Name of the room
 * @param participantIdentity - Identity of the participant to remove
 */
export async function removeParticipant(roomName: string, participantIdentity: string) {
  try {
    await roomService.removeParticipant(roomName, participantIdentity);
  } catch (error) {
    console.error('Error removing participant:', error);
    throw error;
  }
}

/**
 * Generate a unique room name for a livestream
 * @param slug - User slug
 * @returns Unique room name
 */
export function generateRoomName(slug: string): string {
  return `live-${slug}-${Date.now()}`;
}
