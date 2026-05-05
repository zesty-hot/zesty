"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import UnifiedSearch from "@/components/unified-search";
import type { FilterData } from '@/app/[lang]/escorts/(client-renders)/filter';
import {
  Heart,
  MessageCircle,
  Lock,
  CheckCircle2,
  Image as ImageIcon,
  Video,
  FileText,
  Sparkles,
  Loader2,
  TrendingUp,
  Users,
  Crown,
  ArrowRight,
  X
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CommentSheet } from "@/components/vip/comment-sheet";

interface FeedContentItem {
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
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  isLiked: boolean;
  creator: {
    id: string;
    slug: string | null;
    image: string | null;
  };
}

interface FeaturedCreator {
  id: string;
  slug: string;
  image: { url: string, NSFW: boolean } | null;
  title: string;
  description: string;
  location?: string;
  subscribersCount: number;
  contentCount: number;
  isFree: boolean;
  price: number;
}

// Default filter values
const defaultFilters: FilterData = {
  gender: [],
  age: [18, 100],
  bodyType: [],
  race: [],
  sortBy: 'distance',
};

export default function Page() {
  const { lang } = useParams();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [feedContent, setFeedContent] = useState<FeedContentItem[]>([]);
  const [featuredCreators, setFeaturedCreators] = useState<FeaturedCreator[]>([]);
  const [searchResults, setSearchResults] = useState<FeaturedCreator[]>([]);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(1);
  const [isLoadingMoreSearch, setIsLoadingMoreSearch] = useState(false);
  const [lastSearchParams, setLastSearchParams] = useState<{
    type: 'location' | 'username';
    location?: any;
    username?: string;
    filters: FilterData;
  } | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCommentContentId, setActiveCommentContentId] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const response = await fetch('/api/vip/feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ limit: 8 }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(data.isLoggedIn);

        if (data.isLoggedIn) {
          setFeedContent(data.content || []);
          setFeaturedCreators(data.featuredCreators || []);
          setCursor(data.nextCursor);
          setHasMore(data.hasMore);
        } else {
          setFeaturedCreators(data.featuredCreators || []);
        }
      }
    } catch (error) {
      console.error('Error fetching VIP feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (!cursor || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const response = await fetch('/api/vip/feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cursor, limit: 8 }),
      });

      if (response.ok) {
        const data = await response.json();
        setFeedContent(prev => [...prev, ...data.content]);
        setCursor(data.nextCursor);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Error loading more content:', error);
    } finally {
      setIsLoadingMore(false);
    }
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
        // Update the like status locally
        setFeedContent(prev => prev.map(item =>
          item.id === contentId
            ? { ...item, isLiked: !item.isLiked, likesCount: item.isLiked ? item.likesCount - 1 : item.likesCount + 1 }
            : item
        ));
      }
    } catch (error) {
      console.error('Error liking content:', error);
    }
  };

  const handleCommentAdded = (contentId: string) => {
    setFeedContent(prev => prev.map(item =>
      item.id === contentId
        ? { ...item, commentsCount: item.commentsCount + 1 }
        : item
    ));
  };

  const handleUsernameSearch = async (username: string, filters: FilterData) => {
    setIsSearching(true);
    setSearchPage(1);
    setLastSearchParams({ type: 'username', username, filters });
    try {
      const response = await fetch('/api/vip/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug: username, filters, page: 1, limit: 20 }),
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.creators || []);
        setSearchTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error searching creators:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSearch = async (location: any, filters: FilterData) => {
    if (!location?.coordinates) return;

    setIsSearching(true);
    setSearchPage(1);
    setLastSearchParams({ type: 'location', location, filters });
    try {
      const response = await fetch('/api/vip/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          longitude: location.coordinates[0],
          latitude: location.coordinates[1],
          filters,
          page: 1,
          limit: 20
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.creators || []);
        setSearchTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error searching creators:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const loadMoreSearchResults = async () => {
    if (!lastSearchParams || isLoadingMoreSearch || searchPage >= searchTotalPages) return;

    setIsLoadingMoreSearch(true);
    const nextPage = searchPage + 1;

    try {
      let response;
      if (lastSearchParams.type === 'location' && lastSearchParams.location) {
        response = await fetch('/api/vip/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            longitude: lastSearchParams.location.coordinates[0],
            latitude: lastSearchParams.location.coordinates[1],
            filters: lastSearchParams.filters,
            page: nextPage,
            limit: 20
          }),
        });
      } else if (lastSearchParams.type === 'username' && lastSearchParams.username) {
        response = await fetch('/api/vip/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slug: lastSearchParams.username,
            filters: lastSearchParams.filters,
            page: nextPage,
            limit: 20
          }),
        });
      }

      if (response && response.ok) {
        const data = await response.json();
        setSearchResults(prev => [...prev, ...(data.creators || [])]);
        setSearchPage(nextPage);
      }
    } catch (error) {
      console.error('Error loading more search results:', error);
    } finally {
      setIsLoadingMoreSearch(false);
    }
  };

  const handleClearSearch = () => {
    setSearchResults([]);
    setIsSearching(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Logged-in user view - Show subscription feed
  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header / Hero Section */}
        <div className="relative overflow-hidden bg-linear-to-br from-purple-500/5 via-pink-500/5 to-rose-500/5 border-b">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-background/50 backdrop-blur-sm rounded-full border text-xs font-medium text-purple-600">
                <Crown className="w-3 h-3" />
                <span>VIP Access</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Your Exclusive Feed
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Catch up on the latest content from your favorite creators
              </p>

              {/* Unified Search Bar */}
              <div className="max-w-2xl mx-auto pt-4">
                <UnifiedSearch
                  defaultFilters={defaultFilters}
                  onLocationSearch={handleLocationSearch}
                  onUsernameSearch={handleUsernameSearch}
                  onClearSearch={handleClearSearch}
                  searchType="vip"
                  lang={lang as string}
                />
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Search Results */}
          {isSearching ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Search Results</h2>
                <Button variant="outline" onClick={handleClearSearch}>
                  Clear Search
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.map((creator) => (
                  <CreatorCard key={creator.id} creator={creator} lang={lang as string} />
                ))}
              </div>
            </div>
          ) : null}

          {/* Feed Content */}
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Latest Updates</h2>
            </div>

            {feedContent.length === 0 ? (
              <div className="text-center py-16 border rounded-xl bg-muted/30">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">No subscriptions yet</h2>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Start following creators to see their exclusive content here
                </p>
                {/* <Link href={`/${lang}/vip/discover`}>
                  <Button>
                    Discover Creators
                  </Button>
                </Link> */}
              </div>
            ) : (
              <div className="space-y-6">
                {feedContent.map((item) => (
                  <FeedCard
                    key={item.id}
                    item={item}
                    onLike={() => handleLike(item.id)}
                    onCommentClick={() => setActiveCommentContentId(item.id)}
                    lang={lang as string}
                  />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {hasMore && feedContent.length > 0 && (
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

          {/* Featured Creators Section */}
          {!isSearching && searchResults.length === 0 && featuredCreators.length > 0 && (
            <div className="mt-16 mb-12">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <h2 className="text-xl font-bold">Featured Creators</h2>
                </div>
                {/* <Link href={`/${lang}/vip/discover`}>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link> */}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredCreators.slice(0, 4).map((creator) => (
                  <CreatorCard key={creator.id} creator={creator} lang={lang as string} />
                ))}
              </div>
            </div>
          )}
        </div>

        <CommentSheet
          contentId={activeCommentContentId}
          isOpen={!!activeCommentContentId}
          onOpenChange={(open) => !open && setActiveCommentContentId(null)}
          onCommentAdded={handleCommentAdded}
        />
      </div>
    );
  }

  // Non-logged-in user view - Show marketing page with featured content
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-linear-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 border-b">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-background/50 backdrop-blur-sm rounded-full border">
              <Crown className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Exclusive VIP Content</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Connect with Your
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-purple-500 to-pink-500">
                Favorite Creators
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Subscribe to exclusive content, interact directly, and support the creators you love
            </p>

            {/* Unified Search Bar */}
            <div className="max-w-3xl mx-auto pt-4 relative z-10">
              <UnifiedSearch
                defaultFilters={defaultFilters}
                onLocationSearch={handleLocationSearch}
                onUsernameSearch={handleUsernameSearch}
                onClearSearch={handleClearSearch}
                searchType="vip"
                lang={lang as string}
              />
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        {/* Search Results */}
        {isSearching ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : searchResults.length > 0 ? (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-1">Search Results</h2>
                <p className="text-muted-foreground">{searchResults.length} creator{searchResults.length !== 1 ? 's' : ''} found</p>
              </div>
              <Button variant="outline" onClick={handleClearSearch}>
                Clear Search
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} lang={lang as string} />
              ))}
            </div>
            {searchPage < searchTotalPages && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={loadMoreSearchResults}
                  disabled={isLoadingMoreSearch}
                  variant="outline"
                  size="lg"
                >
                  {isLoadingMoreSearch ? (
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
        ) : null}

        {/* Only show features and featured creators if no search results */}
        {searchResults.length === 0 && !isSearching && (
          <>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
              <div className="text-center space-y-3">
                <div className="w-14 h-14 mx-auto bg-purple-500/10 rounded-2xl flex items-center justify-center">
                  <Lock className="w-7 h-7 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold">Exclusive Content</h3>
                <p className="text-muted-foreground">
                  Access premium photos, videos, and updates not available anywhere else
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-14 h-14 mx-auto bg-pink-500/10 rounded-2xl flex items-center justify-center">
                  <MessageCircle className="w-7 h-7 text-pink-500" />
                </div>
                <h3 className="text-xl font-semibold">Direct Interaction</h3>
                <p className="text-muted-foreground">
                  Message creators, comment on posts, and be part of an exclusive community
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-14 h-14 mx-auto bg-rose-500/10 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-rose-500" />
                </div>
                <h3 className="text-xl font-semibold">Support Creators</h3>
                <p className="text-muted-foreground">
                  Directly support the creators you love and help them create more content
                </p>
              </div>
            </div>

            {/* Featured Creators */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-1">Featured Creators</h2>
                  <p className="text-muted-foreground">Discover popular creators with free content</p>
                </div>
                <Link href={`/${lang}/vip/discover`}>
                  <Button variant="outline">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              {featuredCreators.length === 0 ? (
                <div className="text-center py-16 border rounded-xl bg-muted/30">
                  <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">No featured creators available yet</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {featuredCreators.map((creator) => (
                    <CreatorCard key={creator.id} creator={creator} lang={lang as string} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* CTA Section - Always show */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="relative overflow-hidden bg-linear-to-br from-purple-500 to-pink-500 rounded-2xl p-8 md:p-12 text-center text-white">
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Ready to get started?</h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                Sign up now to subscribe to creators, unlock exclusive content, and join the community
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-white/90">
                  Sign Up Free
                </Button>
                {/* <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Learn More
                </Button> */}
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedCard({
  item,
  onLike,
  onCommentClick,
  lang
}: {
  item: FeedContentItem;
  onLike: () => void;
  onCommentClick: () => void;
  lang: string;
}) {
  const [isBlurred, setIsBlurred] = useState(item.NSFW);

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex items-center gap-3">
        <Link href={`/${lang}/vip/${item.creator.slug}`}>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-muted hover:ring-2 ring-primary transition-all cursor-pointer">
            {item.creator.image ? (
              <img
                src={item.creator.image}
                alt={item.creator.slug || 'Creator'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                {item.creator.slug?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
        </Link>
        <div className="flex-1">
          <Link href={`/${lang}/vip/${item.creator.slug}`}>
            <p className="font-semibold text-sm hover:underline cursor-pointer">
              {item.creator.slug}
            </p>
          </Link>
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
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover/video:opacity-100 transition-opacity duration-300">
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
            <div className="absolute top-4 right-4">
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

      {/* Interactions */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-4">
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
          <button
            onClick={onCommentClick}
            className="flex items-center gap-2 text-sm hover:text-blue-500 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">{item.commentsCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function CreatorCard({ creator, lang }: { creator: FeaturedCreator; lang: string }) {
  const [isBlurred, setIsBlurred] = useState(creator.image?.NSFW || false);

  return (
    <Link href={`/${lang}/vip/${creator.slug}`}>
      <div className="bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        {/* Profile Image */}
        <div
          className="relative aspect-square bg-linear-to-br from-purple-500/20 to-pink-500/20 overflow-hidden"
          onClick={(e) => {
            if (creator.image?.NSFW) {
              e.preventDefault();
              setIsBlurred(!isBlurred);
            }
          }}
        >
          {creator.image ? (
            <>
              <img
                src={creator.image.url}
                alt={creator.slug}
                className={cn(
                  "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300",
                  (isBlurred && false) && "blur-xl cursor-pointer"
                )}
              />
              {(creator.image.NSFW && false) && (
                <div className="absolute top-2 right-2 z-10">
                  <Badge variant="destructive" className="shadow-sm">NSFW</Badge>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground/50">
              {creator.slug[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold truncate">{creator.title || creator.slug}</h3>
            {creator.isFree ? (
              <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Free</Badge>
            ) : (
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/20">
                ${(creator.price / 100).toFixed(2)} / month
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 h-10">
            {creator.description || `Check out ${creator.slug}'s exclusive content!`}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{creator.subscribersCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              <span>{creator.contentCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}