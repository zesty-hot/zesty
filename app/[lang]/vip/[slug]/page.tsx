"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  MapPin,
  Calendar,
  Lock,
  CheckCircle2,
  Image as ImageIcon,
  Video,
  FileText,
  Sparkles,
  Grid3x3,
  LayoutList,
  Loader2,
  Send,
  X,
  Camera,
  Webcam,
  ChevronDown,
  TriangleAlert,
  Coffee,
  Radio
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Menu,
  MenuTrigger,
  MenuPopup,
  MenuItem,
} from "@/components/ui/menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StartChatButton } from "@/components/start-chat-button";
import { Spinner } from "@/components/ui/spinner";

interface VIPProfileData {
  liveStreamPage: boolean;
  id: string;
  title: string;
  description: string;
  bannerUrl: string | null;
  subscriptionPrice: number;
  isFree: boolean;
  user: {
    id: string;
    name: string | null;
    slug: string | null;
    image: string | null; // Note: This comes from the API, derived from user.images relation
    bio: string | null;
    suburb: string | null;
    verified: boolean;
    lastActive: Date | null;
    createdAt: Date;
  };
  hasActiveSubscription: boolean;
  isOwnPage: boolean;
  totalContent: number;
  totalLikes: number;
  content: ContentItem[];
  nextCursor: string | null;
  hasMore: boolean;
  activeDiscount: {
    discountPercent: number;
    discountedPrice: number;
    validUntil: Date | null;
  } | null;
  hasActiveEscort: boolean;
  hasActiveLive: boolean;
  isLive: boolean;
}

interface ContentItem {
  id: string;
  type: 'IMAGE' | 'VIDEO' | 'STATUS';
  caption?: string;
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  statusText?: string;
  NSFW?: boolean;
  locked: boolean;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  isLiked: boolean;
}

export default function VIPProfilePage() {
  const { slug, lang } = useParams();
  const [profile, setProfile] = useState<VIPProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState<'feed' | 'grid'>('feed');
  const [cursor, setCursor] = useState<string | null>(null);
  const [isHoveringSubscribed, setIsHoveringSubscribed] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!slug || hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    fetchProfileData();
  }, [slug]);

  const fetchProfileData = async (loadMoreCursor?: string | null) => {
    if (!slug) return;

    const isLoadingMore = !!loadMoreCursor;
    if (isLoadingMore) {
      setIsLoadingMore(true);
    }

    try {
      const response = await fetch('/api/vip/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug,
          cursor: loadMoreCursor,
          limit: 8,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (isLoadingMore && profile) {
          // Append new content to existing
          setProfile({
            ...data,
            content: [...profile.content, ...data.content],
          });
          setCursor(data.nextCursor);
        } else {
          // Initial load
          setProfile(data);
          setCursor(data.nextCursor);
        }
      }
    } catch (error) {
      console.error('Error fetching VIP profile:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!cursor || isLoadingMore || !profile?.hasMore) return;
    fetchProfileData(cursor);
  };

  const handleLike = async (contentId: string) => {
    try {
      const response = await fetch('/api/vip/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contentId }),
      });

      if (response.ok) {
        // Refresh profile data to update like counts
        fetchProfileData();
      }
    } catch (error) {
      console.error('Error liking content:', error);
    }
  };

  const handleReport = () => {
    // Stub function for reporting
    console.log('Report feature coming soon');
    alert('Report feature coming soon!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)] min-h-52">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Content creator not found</p>
      </div>
    );
  }

  const displayPrice = profile.activeDiscount
    ? profile.activeDiscount.discountedPrice
    : profile.subscriptionPrice;

  const canViewContent = profile.hasActiveSubscription || profile.isOwnPage || profile.isFree;

  // Check if user is online (active within last hour)
  const isOnline = profile.user.lastActive
    ? (Date.now() - new Date(profile.user.lastActive).getTime()) < 3600000
    : false;

  return (
    <div className="min-h-screen bg-background">
      {/* Banner Section */}
      <div className="relative w-full h-48 md:h-72 lg:h-96 bg-linear-to-br from-purple-500 via-pink-500 to-rose-500 overflow-hidden">
        {profile.bannerUrl ? (
          <img
            src={profile.bannerUrl}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Sparkles className="w-16 h-16 text-white/30" />
          </div>
        )}
        {/* Stronger gradient overlay for better text visibility */}
        <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/5 to-transparent" />
      </div>

      {/* Profile Header */}
      <div className="container mx-auto px-4 -mt-20 md:-mt-8 lg:-mt-16 relative z-10">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-end">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background overflow-hidden bg-muted shadow-xl">
              {profile.user.image ? (
                <img
                  src={profile.user.image}
                  alt={profile.user.slug || 'Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground">
                  {profile.user.slug?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>

            {/* Live Badge - Top Right */}
            {profile.isLive && (
              <Link href={`/${lang}/live/${profile.user.slug}`} className="absolute -top-2 -right-2 group">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg hover:shadow-xl hover:scale-105">
                  <div className="relative">
                    <Radio className="w-3.5 h-3.5" />
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                  <span className="text-xs font-bold">LIVE</span>
                </div>
              </Link>
            )}

            {/* Online Status - Bottom Right */}
            {profile.user.lastActive && (Date.now() - new Date(profile.user.lastActive).getTime()) < 3600000 && (
              <div className="absolute bottom-2 right-2 w-8 h-8 bg-background rounded-full flex items-center justify-center">
                <div className="w-5 h-5 bg-green-500 rounded-full border-2 border-background shadow-lg" />
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-2">
            <div>
              <div className="flex items-center gap-3">
                <Tooltip delay={100}>
                  <TooltipTrigger className="cursor-text" render={<h1 className="text-3xl hidden md:block xl:hidden md:text-4xl font-bold text-foreground">
                    {profile.title.slice(0, 30) + '...' || profile.user.slug}
                  </h1>}>
                  </TooltipTrigger>
                  <TooltipContent className={profile.title.length > 30 ? '' : 'hidden'}>
                    <p className="text-sm text-muted-foreground">
                      {profile.title || profile.user.slug}
                    </p>
                  </TooltipContent>
                </Tooltip>
                <h1 className="text-3xl md:hidden xl:block md:text-4xl font-bold text-foreground">
                  {profile.title || profile.user.slug}
                </h1>
              </div>
              {profile.user.slug && (
                <p className="text-muted-foreground">@{profile.user.slug}</p>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 text-sm md:-mb-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold">{profile.totalContent}</span>
                <span className="text-muted-foreground">posts</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold">{profile.totalLikes}</span>
                <span className="text-muted-foreground">likes</span>
              </div>
              {profile.user.suburb && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{profile.user.suburb}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {!profile.isOwnPage && (
            <div className="w-full md:w-auto flex flex-col gap-2 md:-mb-14 lg:-mb-20">
              {/* Other Pages Dropdown */}
              {(profile.hasActiveEscort || profile.liveStreamPage) && (
                <Menu>
                  <MenuTrigger render={
                    <Button variant="outline" size="lg" className="w-full">
                      <span>Other Pages</span>
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  } />
                  <MenuPopup>
                    {profile.hasActiveEscort ? (
                      <Link href={`/${lang}/escorts/${profile.user.slug}`} className="cursor-pointer w-full">
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
                    {profile.liveStreamPage ? (
                      <Link href={`/${lang}/live/${profile.user.slug}`} className="cursor-pointer">
                        <MenuItem className="flex items-center gap-2 cursor-pointer w-full">
                          <Webcam className="w-4 h-4" />
                          Live Streams
                        </MenuItem>
                      </Link>
                    ) : (
                      <MenuItem className="flex items-center gap-2 opacity-40 pointer-events-none">
                        <Webcam className="w-4 h-4" />
                        Live Streams
                      </MenuItem>
                    )}
                  </MenuPopup>
                </Menu>
              )}

              {/* Subscription Buttons */}
              {profile.hasActiveSubscription ? (
                <>
                  <Button
                    size="lg"
                    variant={isHoveringSubscribed ? "destructive" : "outline"}
                    className="w-full md:w-auto relative overflow-hidden transition-colors"
                    onMouseEnter={() => setIsHoveringSubscribed(true)}
                    onMouseLeave={() => setIsHoveringSubscribed(false)}
                  >
                    <span className={cn(
                      "flex items-center transition-all duration-300",
                      isHoveringSubscribed ? "opacity-0 -translate-x-2" : "opacity-100 translate-x-0"
                    )}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Subscribed
                    </span>
                    <span className={cn(
                      "absolute inset-0 flex items-center justify-center transition-all duration-300",
                      isHoveringSubscribed ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
                    )}>
                      <X className="w-4 h-4 mr-2" />
                      Unsubscribe
                    </span>
                  </Button>
                  <StartChatButton otherUserSlug={profile.user.slug as string} lang={lang as string} size="lg" />
                </>
              ) : profile.isFree ? (
                <Button size="lg" className="w-full md:w-auto">
                  Follow for Free
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button size="lg" className="w-full md:w-auto bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    Subscribe ${(displayPrice / 100).toFixed(2)}/month
                  </Button>
                  {profile.activeDiscount && (
                    <p className="text-xs text-muted-foreground text-center">
                      <span className="line-through">${(profile.subscriptionPrice / 100).toFixed(2)}</span>
                      {' '}Save {profile.activeDiscount.discountPercent}%
                    </p>
                  )}
                </div>
              )}

              {/* Report Button */}
              <Button
                variant="ghost"
                size="lg"
                onClick={handleReport}
                className="self-end w-full"
                title="Report profile"
              >
                <TriangleAlert className="w-4 h-4" />
                Report Profile
              </Button>
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.user.bio && (
          <div className="mt-6 max-w-2xl">
            <p className="text-muted-foreground whitespace-pre-line">{profile.user.bio}</p>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8 lg:mt-2">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Posts</h2>

          {/* View Mode Tabs */}
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'feed' | 'grid')}>
            <TabsList>
              <TabsTrigger value="feed" className="gap-2">
                <LayoutList className="w-4 h-4" />
                Feed
              </TabsTrigger>
              <TabsTrigger value="grid" className="gap-2">
                <Grid3x3 className="w-4 h-4" />
                Grid
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {profile.content.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No content yet</p>
          </div>
        ) : viewMode === 'feed' ? (
          // Feed View - Single Column
          <div className="max-w-2xl mx-auto space-y-6">
            {profile.content.map((item: ContentItem) => (
              <FeedCard
                key={item.id}
                item={item}
                canViewContent={canViewContent}
                onLike={() => handleLike(item.id)}
                user={profile.user}
              />
            ))}
          </div>
        ) : (
          // Grid View
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
            {profile.content.map((item: ContentItem) => (
              <ContentCard
                key={item.id}
                item={item}
                canViewContent={canViewContent}
                onLike={() => handleLike(item.id)}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {profile.hasMore && profile.content.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Button
              onClick={loadMore}
              disabled={isLoadingMore}
              variant="outline"
              size="lg"
              className="min-w-[200px]"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function FeedCard({
  item,
  canViewContent,
  onLike,
  user
}: {
  item: ContentItem;
  canViewContent: boolean;
  onLike: () => void;
  user: VIPProfileData['user'];
}) {
  const [isBlurred, setIsBlurred] = useState(item.NSFW);

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
          {user.image ? (
            <img
              src={user.image}
              alt={user.slug || 'Profile'}
              className="mask-circle object-fill"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
              {user.slug?.[0]?.toUpperCase() || '?'}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">{user.slug}</p>
            {/* {user.verified && (
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
            )} */}
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {item.type === 'IMAGE' && 'Photo'}
          {item.type === 'VIDEO' && 'Video'}
          {item.type === 'STATUS' && 'Post'}
        </Badge>
      </div>

      {/* Content */}
      {item.locked ? (
        // Locked content
        <div className="aspect-square bg-muted flex flex-col items-center justify-center p-8 text-center">
          <Lock className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground font-medium">Subscribe to unlock this content</p>
        </div>
      ) : (
        <>
          {/* Caption (if exists and not status) */}
          {item.caption && item.type !== 'STATUS' && (
            <div className="px-4 pb-3">
              <p className="text-sm">{item.caption}</p>
            </div>
          )}

          {/* Image */}
          {item.type === 'IMAGE' && item.imageUrl && (
            <div
              className="relative w-full overflow-hidden"
              onClick={() => item.NSFW && setIsBlurred(!isBlurred)}
            >
              <img
                src={item.imageUrl}
                alt={item.caption || 'Content'}
                className={cn(
                  "w-full object-contain max-h-[600px] transition-all duration-300",
                  (isBlurred && false) && "blur-xl cursor-pointer"
                )}
              />
              {(item.NSFW && false) && (
                <div className="absolute top-4 right-4">
                  <Badge variant="destructive">NSFW</Badge>
                </div>
              )}
            </div>
          )}

          {/* Video */}
          {item.type === 'VIDEO' && (
            <div
              className="relative w-full bg-black overflow-hidden group/video"
              onClick={() => item.NSFW && setIsBlurred(!isBlurred)}
            >
              {item.thumbnailUrl ? (
                <img
                  src={item.thumbnailUrl}
                  alt="Video thumbnail"
                  className={cn(
                    "w-full object-contain max-h-[600px] transition-all duration-300",
                    (isBlurred && false) && "blur-xl cursor-pointer"
                  )}
                />
              ) : (
                <div className="aspect-video flex items-center justify-center">
                  <Video className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
              <div className={cn(
                "absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300",
                (item.NSFW && false) && "group-hover/video:opacity-100 opacity-0"
              )}>
                <div className="bg-white/90 rounded-full p-4">
                  <Video className="w-8 h-8 text-black" />
                </div>
              </div>
              {item.duration && (
                <div className="absolute bottom-4 right-4 bg-black/75 px-3 py-1.5 rounded text-sm text-white font-medium">
                  {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                </div>
              )}
              {(item.NSFW && false) && (
                <div className="absolute top-4 right-4 transition-opacity duration-300 group-hover/video:opacity-0">
                  <Badge variant="destructive">NSFW</Badge>
                </div>
              )}
            </div>
          )}

          {/* Status Update */}
          {item.type === 'STATUS' && (
            <div className="px-4 pb-4">
              <p className="text-base whitespace-pre-line">{item.statusText}</p>
            </div>
          )}
        </>
      )}

      {/* Interactions */}
      {!item.locked && (
        <div className="p-4 border-t">
          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={onLike}
              className="flex items-center gap-2 text-sm hover:text-red-500 transition-colors"
            >
              <Heart
                className={cn(
                  "w-5 h-5",
                  item.isLiked && "fill-red-500 text-red-500"
                )}
              />
              <span className="font-medium">{item.likesCount}</span>
            </button>
            <button className="flex items-center gap-2 text-sm hover:text-blue-500 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">{item.commentsCount}</span>
            </button>
          </div>

          {item.caption && item.type === 'STATUS' && (
            <p className="text-sm text-muted-foreground">
              {item.likesCount} {item.likesCount === 1 ? 'like' : 'likes'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ContentCard({
  item,
  canViewContent,
  onLike
}: {
  item: ContentItem;
  canViewContent: boolean;
  onLike: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [isBlurred, setIsBlurred] = useState(item.NSFW);

  return (
    <div
      className="relative aspect-square bg-muted rounded-lg overflow-hidden group cursor-pointer"
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
      onClick={() => item.NSFW && setIsBlurred(!isBlurred)}
    >
      {/* Content Display */}
      {item.locked ? (
        // Locked content - show gray square with lock
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <Lock className="w-8 h-8 md:w-12 md:h-12 text-muted-foreground/50" />
        </div>
      ) : (
        <>
          {/* Image */}
          {item.type === 'IMAGE' && item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.caption || 'Content'}
              className={cn(
                "w-full h-full object-cover transition-all duration-300",
                isBlurred && "blur-xl"
              )}
            />
          )}

          {/* Video */}
          {item.type === 'VIDEO' && (
            <div className="relative w-full h-full bg-black">
              {item.thumbnailUrl ? (
                <img
                  src={item.thumbnailUrl}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Video className="w-12 h-12 text-white" />
              </div>
              {item.duration && (
                <div className="absolute bottom-2 right-2 bg-black/75 px-2 py-1 rounded text-xs text-white">
                  {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                </div>
              )}
            </div>
          )}

          {/* Status Update */}
          {item.type === 'STATUS' && (
            <div className="w-full h-full bg-linear-to-br from-purple-500/20 to-pink-500/20 p-4 flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm line-clamp-4">{item.statusText}</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Overlay with stats */}
      {showDetails && !item.locked && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity">
          <div className="flex gap-6 text-white">
            <div className="flex items-center gap-2">
              <Heart className={cn("w-5 h-5", item.isLiked && "fill-red-500 text-red-500")} />
              <span className="font-semibold">{item.likesCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">{item.commentsCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Type indicator */}
      {!item.locked && (
        <div className="absolute top-2 right-2">
          {item.type === 'VIDEO' && (
            <Badge variant="secondary" className="bg-black/75 text-white">
              <Video className="w-3 h-3 mr-1" />
              Video
            </Badge>
          )}
          {item.type === 'STATUS' && (
            <Badge variant="secondary" className="bg-black/75 text-white">
              <FileText className="w-3 h-3 mr-1" />
              Post
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}