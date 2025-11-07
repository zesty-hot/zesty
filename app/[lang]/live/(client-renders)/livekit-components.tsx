"use client";

import { useEffect, useState } from 'react';
import { 
  LiveKitRoom,
  VideoConference,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
  useParticipants,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import { Loader2 } from 'lucide-react';

interface LiveStreamViewerProps {
  roomName: string;
  userSlug: string;
}

export function LiveStreamViewer({ roomName, userSlug }: LiveStreamViewerProps) {
  const [token, setToken] = useState<string>('');
  const [wsUrl, setWsUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchToken();
  }, [roomName]);

  const fetchToken = async () => {
    try {
      const response = await fetch('/api/live/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName,
          role: 'viewer',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get token');
      }

      const data = await response.json();
      setToken(data.token);
      setWsUrl(data.wsUrl || 'ws://localhost:7880');
    } catch (error) {
      console.error('Error fetching token:', error);
      setError('Failed to connect to livestream');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px] bg-black rounded-lg">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[500px] bg-black rounded-lg text-white">
        <p>{error}</p>
      </div>
    );
  }

  if (!token || !wsUrl) {
    return null;
  }

  return (
    <LiveKitRoom
      video={false}
      audio={false}
      token={token}
      serverUrl={wsUrl}
      data-lk-theme="default"
      className="livekit-room"
    >
      <VideoConference />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

interface LiveStreamBroadcasterProps {
  roomName: string;
  userSlug: string;
  onStreamEnd?: () => void;
}

export function LiveStreamBroadcaster({ roomName, userSlug, onStreamEnd }: LiveStreamBroadcasterProps) {
  const [token, setToken] = useState<string>('');
  const [wsUrl, setWsUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchToken();
  }, [roomName]);

  const fetchToken = async () => {
    try {
      const response = await fetch('/api/live/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName,
          role: 'broadcaster',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get token');
      }

      const data = await response.json();
      setToken(data.token);
      setWsUrl(data.wsUrl || 'ws://localhost:7880');
    } catch (error) {
      console.error('Error fetching token:', error);
      setError('Failed to connect to livestream');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px] bg-black rounded-lg">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[500px] bg-black rounded-lg text-white">
        <p>{error}</p>
      </div>
    );
  }

  if (!token || !wsUrl) {
    return null;
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={wsUrl}
      data-lk-theme="default"
      className="livekit-room"
      onDisconnected={onStreamEnd}
    >
      <VideoConference />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
