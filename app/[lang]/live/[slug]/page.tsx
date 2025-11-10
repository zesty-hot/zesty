"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Radio,
  Heart,
  MessageCircle,
  DollarSign,
  MapPin,
  Clock,
  Users,
  ArrowLeft,
  Loader2,
  Power,
  PowerOff,
  TriangleAlert,
  Camera,
  Webcam,
  Coffee,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LiveStreamViewer, LiveStreamBroadcaster } from '../(client-renders)/livekit-components';
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu";
import { profile } from "console";
import { useSession } from "next-auth/react";

interface LiveStreamChannelData {
  id: string;
  description: string | null;
  bannerUrl: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    slug: string | null;
    bio: string | null;
    suburb: string | null;
    verified: boolean;
    lastActive: Date | null;
    images: {
      url: string;
    }[];
    vipPage: {
      active: boolean;
    } | null;
    privateAds: {
      active: boolean;
    }[];
  };
  currentStream: {
    id: string;
    title: string | null;
    roomName: string;
    viewerCount: number;
    startedAt: Date;
  } | null;
  followerCount: number;
  isFollowing: boolean;
  isOwner: boolean;
  pastStreams: {
    id: string;
    title: string | null;
    viewerCount: number;
    startedAt: Date;
    endedAt: Date;
  }[];
}

export default function LiveStreamPage() {
  const { slug, lang } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [channel, setChannel] = useState<LiveStreamChannelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingStream, setIsTogglingStream] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!slug) return;
    fetchChannelData();
  }, [slug, status]);

  const fetchChannelData = async () => {
    try {
      const response = await fetch('/api/live/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.channels && data.channels.length > 0) {
          const channelData = data.channels[0];
          setChannel({
            ...channelData,
            currentStream: channelData.streams?.[0] || null,
            isOwner: channelData.user.slug === session?.user?.slug,
            followerCount: channelData._count?.followers || 0,
            isFollowing: false, // TODO: get from API
            pastStreams: [], // Will be loaded separately if needed
          });
          setIsFollowing(false); // TODO: get actual follow status
        }
      }
    } catch (error) {
      console.error('Error fetching channel:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startStream = async () => {
    if (!channel) return;

    setIsTogglingStream(true);
    try {
      const response = await fetch('/api/live/start-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${channel.user.slug}'s Live Stream`
        }),
      });

      if (response.ok) {
        // Refresh channel data to get new stream
        await fetchChannelData();
      }
    } catch (error) {
      console.error('Error starting stream:', error);
    } finally {
      setIsTogglingStream(false);
    }
  };

  const endStream = async () => {
    setIsTogglingStream(true);
    try {
      const response = await fetch('/api/live/end-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Refresh channel data
        await fetchChannelData();
      }
    } catch (error) {
      console.error('Error ending stream:', error);
    } finally {
      setIsTogglingStream(false);
    }
  };

  const toggleFollow = async () => {
    if (!channel) return;

    try {
      const response = await fetch('/api/live/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channelId: channel.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.following);
        // Optionally refresh to get updated follower count
        await fetchChannelData();
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleDonation = () => {
    // Stub function for donations
    console.log('Donation feature coming soon');
    alert('Donation feature coming soon!');
  };

  const handleReport = () => {
    // Stub function for reporting
    console.log('Report feature coming soon');
    alert('Report feature coming soon!');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-8">
        <div className="text-center py-16">
          <Radio className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Channel not found</h2>
          <p className="text-muted-foreground mb-6">
            This livestream channel doesn't exist or has been removed
          </p>
          <Link href={`/${lang}/live`}>
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Livestreams
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isLive = channel.currentStream !== null;
  const roomName = channel.currentStream?.roomName || '';

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="container mx-auto px-2 sm:px-4 py-4">
        <Link href={`/${lang}/live`}>
          <Button variant="ghost" size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-2 sm:px-4 pb-8">
        {isLive ? (
          // Active Stream View
          <div className="grid lg:grid-cols-[1fr_400px] gap-3 sm:gap-6">
            {/* Main Video Player */}
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden isolate">
                {channel.isOwner ? (
                  <LiveStreamBroadcaster
                    roomName={roomName}
                    userSlug={channel.user.slug || ''}
                  />
                ) : (
                  <LiveStreamViewer
                    roomName={roomName}
                    userSlug={channel.user.slug || ''}
                  />
                )}

                {/* Live Badge Overlay */}
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-red-500 hover:bg-red-600 animate-pulse text-lg px-4 py-2">
                    <Radio className="w-4 h-4 mr-2" />
                    LIVE
                  </Badge>
                </div>
              </div>

              {/* Stream Info Below Video */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                      {channel.currentStream?.title || `${channel.user.slug}'s Channel`}
                    </h1>
                    {channel.description && (
                      <p className="text-muted-foreground">{channel.description}</p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={handleReport}
                    className="shrink-0"
                    title="Report channel"
                  >
                    <TriangleAlert className="w-4 h-4" />
                  </Button>
                </div>

                {/* Streamer Info */}
                <div className="flex flex-col md:flex-row lg:flex-col xl:flex-row md:items-center lg:items-baseline xl:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3">
                  <Link href={`/${lang}/vip/${channel.user.slug}`} className="flex items-center gap-3 pb-4 md:pb-0 lg:pb-4 xl:pb-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                      {channel.user.images[0]?.url ? (
                        <img
                          src={channel.user.images[0].url}
                          alt={channel.user.slug || 'Streamer'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold">
                          {channel.user.slug?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{channel.user.slug}</p>
                      {channel.user.suburb && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {channel.user.suburb}
                        </p>
                      )}
                    </div>
                  </Link>

                  {!channel.isOwner && (
                    <div className="flex gap-2 flex-wrap w-full md:w-auto lg:w-full xl:w-auto"
                    >
                      <div className="flex gap-2 flex-col w-full md:w-auto lg:w-full xl:w-auto">
                        {(channel.user.vipPage || channel.user.privateAds.length > 0) && (
                          <Menu>
                            <MenuTrigger render={
                              <Button variant="outline" size="lg" className="w-full md:w-auto lg:w-full xl:w-auto">
                                <span className="inline">Other Pages</span>
                                <ChevronDown className="w-4 h-4 ml-2" />
                              </Button>
                            } />
                            <MenuPopup>
                              {channel.user.privateAds.length > 0 ? (
                                <Link href={`/${lang}/escorts/${channel.user.slug}`} className="cursor-pointer w-full">
                                  <MenuItem className="flex items-center gap-2 cursor-pointer w-full">
                                    <Coffee className="w-4 h-4" />
                                    Escort Profile
                                  </MenuItem>
                                </Link>
                              ) : (
                                <MenuItem className="flex items-center gap-2 opacity-40 pointer-events-none">
                                  <Coffee className="w-4 h-4" />
                                  Escort Profile
                                </MenuItem>
                              )}
                              {channel.user.vipPage ? (
                                <Link href={`/${lang}/vip/${channel.user.slug}`} className="cursor-pointer">
                                  <MenuItem className="flex items-center gap-2 cursor-pointer w-full">
                                    <Camera className="w-4 h-4" />
                                    VIP Content
                                  </MenuItem>
                                </Link>
                              ) : (
                                <MenuItem className="flex items-center gap-2 opacity-40 pointer-events-none">
                                  <Camera className="w-4 h-4" />
                                  VIP Content
                                </MenuItem>
                              )}
                            </MenuPopup>
                          </Menu>
                        )}
                      </div>


                      <Button onClick={toggleFollow} className="px-4 sm:px-6 flex-1 md:flex-initial lg:flex-1 xl:flex-initial" variant={isFollowing ? "outline" : "default"}>
                        {isFollowing ? 'Unfollow' : 'Follow'}
                      </Button>
                      <Button onClick={handleDonation} variant="outline" className="flex-1 md:flex-initial lg:flex-1 xl:flex-initial">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Send Tip</span>
                        <span className="sm:hidden">Tip</span>
                      </Button>
                    </div>
                  )}

                  {channel.isOwner && (
                    <Button
                      onClick={endStream}
                      disabled={isTogglingStream}
                      variant="destructive"
                    >
                      {isTogglingStream ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <PowerOff className="w-4 h-4 mr-2" />
                      )}
                      End Stream
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Sidebar */}
            <div className="border rounded-lg p-3 sm:p-4 h-[600px] flex flex-col">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Live Chat
              </h3>
              <div className="flex-1 overflow-y-auto">
                <p className="text-sm text-muted-foreground text-center py-8">
                  Chat feature coming soon...
                </p>
              </div>
              <div className="pt-4 border-t">
                <input
                  type="text"
                  placeholder="Send a message..."
                  className="w-full px-4 py-2 border rounded-lg"
                  disabled
                />
              </div>
            </div>
          </div>
        ) : (
          // Offline Channel View - Profile-like page
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-6 sm:py-8 border rounded-lg bg-muted/30 mb-6 sm:mb-8">
              <Radio className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Channel Offline</h2>
              <p className="text-muted-foreground text-sm sm:text-base px-4">
                {channel.user.slug} is not currently streaming
              </p>
                {channel.isOwner && (
                  <Button
                    onClick={startStream}
                    className="mt-6"
                    disabled={isTogglingStream || !channel.active}
                    size="lg"
                  >
                    {isTogglingStream ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Power className="w-4 h-4 mr-2" />
                    )}
                    Go Live
                  </Button>
                )}
            </div>

            {/* Profile Information */}
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-muted shrink-0">
                  {channel.user.images[0]?.url ? (
                    <img
                      src={channel.user.images[0].url}
                      alt={channel.user.slug || 'Streamer'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold">
                      {channel.user.slug?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">{channel.user.slug}'s Channel</h1>
                  <p className="text-base sm:text-lg text-muted-foreground mb-2">@{channel.user.slug}</p>
                  {channel.user.suburb && (
                    <p className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {channel.user.suburb}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    {channel.followerCount} follower{channel.followerCount !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="flex gap-2 flex-col w-full sm:w-auto">
                  {!channel.isOwner && (
                    <>
                      {(channel.user.vipPage || channel.user.privateAds.length > 0) && (
                        <Menu>
                          <MenuTrigger render={
                            <Button variant="outline" size="lg" className="w-full sm:w-auto">
                              <span className="hidden sm:inline">Other Pages</span>
                              <span className="sm:hidden">Pages</span>
                              <ChevronDown className="w-4 h-4 ml-2" />
                            </Button>
                          } />
                          <MenuPopup>
                            {channel.user.privateAds.length > 0 ? (
                              <Link href={`/${lang}/escorts/${channel.user.slug}`} className="cursor-pointer w-full">
                                <MenuItem className="flex items-center gap-2 cursor-pointer w-full">
                                  <Coffee className="w-4 h-4" />
                                  Escort Profile
                                </MenuItem>
                              </Link>
                            ) : (
                              <MenuItem className="flex items-center gap-2 opacity-40 pointer-events-none">
                                <Coffee className="w-4 h-4" />
                                Escort Profile
                              </MenuItem>
                            )}
                            {channel.user.vipPage ? (
                              <Link href={`/${lang}/vip/${channel.user.slug}`} className="cursor-pointer">
                                <MenuItem className="flex items-center gap-2 cursor-pointer w-full">
                                  <Camera className="w-4 h-4" />
                                  VIP Content
                                </MenuItem>
                              </Link>
                            ) : (
                              <MenuItem className="flex items-center gap-2 opacity-40 pointer-events-none">
                                <Camera className="w-4 h-4" />
                                VIP Content
                              </MenuItem>
                            )}
                          </MenuPopup>
                        </Menu>
                      )}
                      <Button onClick={toggleFollow} variant={isFollowing ? "outline" : "default"} size="lg">
                        {isFollowing ? 'Unfollow' : 'Follow'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={handleReport}
                        title="Report channel"
                      >
                        <TriangleAlert className="w-4 h-4" />
                        Report Channel
                      </Button>
                    </>
                    )}
                </div>
              </div>

              {/* About Section */}
              {channel.description && (
                <div className="border rounded-lg p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-3">About</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{channel.description}</p>
                </div>
              )}

              {channel.user.bio && (
                <div className="border rounded-lg p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-3">Bio</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{channel.user.bio}</p>
                </div>
              )}

              {/* Past Streams */}
              {channel.pastStreams && channel.pastStreams.length > 0 && (
                <div className="border rounded-lg p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4">Past Streams</h2>
                  <div className="space-y-3">
                    {channel.pastStreams.map((pastStream) => (
                      <div key={pastStream.id} className="flex items-center justify-between p-3 bg-muted rounded">
                        <div>
                          <p className="font-medium">{pastStream.title || 'Untitled Stream'}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(pastStream.startedAt).toLocaleDateString()} • {pastStream.viewerCount} viewers
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
