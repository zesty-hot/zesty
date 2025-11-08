"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import UnifiedSearch from "@/components/unified-search";
import type { FilterData } from '@/app/[lang]/escorts/(client-renders)/filter';
import { 
  Radio, 
  Users, 
  MapPin,
  Clock,
  ArrowRight,
  Loader2,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveChannel {
  id: string;
  description: string | null;
  active: boolean;
  createdAt: Date;
  user: {
    id: string;
    slug: string | null;
    suburb: string | null;
    verified: boolean;
    images: {
      url: string;
    }[];
  };
  streams: {
    id: string;
    title: string | null;
    roomName: string;
    viewerCount: number;
    isLive: boolean;
  }[];
  _count?: {
    followers: number;
  };
  distance?: number;
  distanceText?: string;
}

// Default filter values
const defaultFilters: FilterData = {
  gender: [],
  age: [18, 100],
  bodyType: [],
  race: [],
};

export default function Page() {
  const { lang } = useParams();
  const router = useRouter();
  const [channels, setChannels] = useState<LiveChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchResults, setSearchResults] = useState<LiveChannel[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchActiveChannels(1);
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !hasSearched) {
          loadMoreChannels();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, hasSearched, currentPage]);

  const fetchActiveChannels = async (page: number) => {
    try {
      const response = await fetch('/api/live/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page, limit: 8, liveOnly: true }),
      });

      if (response.ok) {
        const data = await response.json();
        setChannels(data.channels || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
        setHasMore(page < (data.totalPages || 1));
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching livestream channels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreChannels = async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    
    try {
      const response = await fetch('/api/live/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page: nextPage, limit: 8, liveOnly: true }),
      });

      if (response.ok) {
        const data = await response.json();
        setChannels(prev => [...prev, ...(data.channels || [])]);
        setCurrentPage(nextPage);
        setHasMore(nextPage < (data.totalPages || 1));
      }
    } catch (error) {
      console.error('Error loading more channels:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleUsernameSearch = async (slug: string, filters: FilterData) => {
    setIsSearching(true);
    setHasSearched(true);
    try {
      const response = await fetch('/api/live/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug, page: 1, limit: 20 }),
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.channels || []);
      }
    } catch (error) {
      console.error('Error searching livestream channels:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSearch = async (location: any, filters: FilterData) => {
    if (!location?.coordinates) return;
    
    setIsSearching(true);
    setHasSearched(true);
    try {
      const response = await fetch('/api/live/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          longitude: location.coordinates[0],
          latitude: location.coordinates[1],
          page: 1, 
          limit: 20 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.channels || []);
      }
    } catch (error) {
      console.error('Error searching livestream channels:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchResults([]);
    setIsSearching(false);
    setHasSearched(false);
    setHasMore(currentPage < totalPages);
  };

  const displayChannels = hasSearched ? searchResults : channels;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header with Search */}
      <div className="z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col lg:flex-row md:items-center gap-3 md:gap-4">
            <div className="flex items-center justify-between md:justify-start gap-2 md:shrink-0">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-500" />
                <h1 className="text-xl font-bold">Live Streams</h1>
              </div>
              {totalCount > 0 && !isSearching && (
                <Badge variant="destructive" className="animate-pulse">
                  {totalCount} LIVE
                </Badge>
              )}
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 w-full">
              <UnifiedSearch
                defaultFilters={defaultFilters}
                onLocationSearch={handleLocationSearch}
                onUsernameSearch={handleUsernameSearch}
                onClearSearch={handleClearSearch}
                searchType="live"
                lang={lang as string}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {isSearching ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : displayChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="bg-muted/30 rounded-full p-8 mb-6">
              <Radio className="w-16 h-16 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Live Channels</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {hasSearched 
                ? 'No channels match your search. Try different criteria.'
                : 'No one is streaming right now. Check back soon!'}
            </p>
            {hasSearched && (
              <Button onClick={handleClearSearch} variant="outline">
                Clear Search
              </Button>
            )}
            
            {/* CTA for creating stream */}
            {!hasSearched && (
              <div className="mt-8 p-6 border rounded-xl bg-card max-w-md text-center">
                <Sparkles className="w-10 h-10 mx-auto mb-4 text-red-500" />
                <h3 className="font-semibold mb-2">Be the first to go live!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start your own channel and build your audience
                </p>
                <Button className="w-full">
                  Start Streaming
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Section Header */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide">
                {hasSearched ? 'Search Results' : 'Live Channels'}
              </h2>
            </div>

            {/* Grid Layout - Similar to Twitch */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {displayChannels.map((channel) => (
                <ChannelCard key={channel.id} channel={channel} lang={lang as string} />
              ))}
            </div>

            {/* Infinite Scroll Loading Indicator and Load More Button */}
            {!hasSearched && hasMore && (
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <div ref={observerTarget} className="w-full flex justify-center">
                  {isLoadingMore && (
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  )}
                </div>
                {!isLoadingMore && (
                  <Button 
                    onClick={loadMoreChannels}
                    variant="outline"
                    size="lg"
                    disabled={isLoadingMore}
                  >
                    Load More
                  </Button>
                )}
              </div>
            )}

            {/* End of results message */}
            {!hasSearched && !hasMore && channels.length > 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">
                  You've reached the end of live channels
                </p>
              </div>
            )}

            {/* Bottom CTA */}
            {!hasSearched && !hasMore && (
              <div className="mt-4 p-8 border rounded-xl bg-linear-to-br from-red-500/5 to-pink-500/5">
                <div className="flex flex-col md:flex-row items-center gap-6 max-w-4xl mx-auto">
                  <div className="shrink-0">
                    <div className="w-16 h-16 rounded-full bg-linear-to-br from-red-500 to-pink-500 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold mb-1">Ready to stream?</h3>
                    <p className="text-muted-foreground">
                      Start your own channel and connect with your audience in real-time
                    </p>
                  </div>
                  <Button size="lg" className="shrink-0">
                    Start Streaming
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ChannelCard({ channel, lang }: { channel: LiveChannel; lang: string }) {
  const isLive = channel.streams && channel.streams.length > 0 && channel.streams[0].isLive;
  const viewerCount = isLive ? channel.streams[0]?.viewerCount || 0 : 0;
  const followerCount = channel._count?.followers || 0;

  return (
    <Link href={`/${lang}/live/${channel.user.slug}`}>
      <div className="group cursor-pointer">
        {/* Thumbnail - 16:9 aspect ratio */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted mb-2">
          {channel.user.images[0]?.url ? (
            <img
              src={channel.user.images[0].url}
              alt={channel.user.slug || 'Channel'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center">
              <Radio className="w-12 h-12 text-muted-foreground" />
            </div>
          )}

          {/* Live Badge Overlay */}
          {isLive && (
            <div className="absolute top-2 left-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-red-600 text-white text-xs font-semibold">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                LIVE
              </div>
            </div>
          )}

          {/* Viewer Count */}
          {isLive && (
            <div className="absolute bottom-2 left-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-black/70 text-white text-xs font-medium">
                <Users className="w-3 h-3" />
                {viewerCount > 0 ? viewerCount.toLocaleString() : '0'}
              </div>
            </div>
          )}
        </div>

        {/* Channel Info */}
        <div className="flex gap-2">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0">
            {channel.user.images[0]?.url ? (
              <img
                src={channel.user.images[0].url}
                alt={channel.user.slug || 'Avatar'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-sm">
                {channel.user.slug?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          {/* Text Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-red-500 transition-colors">
              {channel.streams?.[0]?.title || `${channel.user.slug}'s Channel`}
            </h3>
            <p className="text-xs text-muted-foreground">
              {channel.user.slug}
            </p>
            
            {/* Location or category info */}
            <div className="flex items-center gap-2 mt-1">
              {channel.user.suburb && (
                <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span className="line-clamp-1">{channel.user.suburb}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}