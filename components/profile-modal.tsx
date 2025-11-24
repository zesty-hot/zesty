"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { type CarouselApi, Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { calculateAge } from "@/lib/calculate-age";
import {
  MapPin,
  Calendar,
  User,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Info,
  Heart,
  Video,
  Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";

type ImageItem = { url: string; width?: number; height?: number; default?: boolean };

type ProfileData = {
  id: string;
  slug: string | null;
  bio?: string | null;
  location?: string | null;
  suburb?: string | null;
  verified?: boolean;
  bodyType?: string | null;
  race?: string | null;
  gender?: string | null;
  dob?: string | null;
  images?: ImageItem[];
  hasEscort?: boolean;
  hasVIP?: boolean;
  hasLive?: boolean;
};

export function ProfileModal({
  slug,
  open,
  onOpenChange,
}: {
  slug?: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { lang } = useParams();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !slug) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/users/${encodeURIComponent(slug as string)}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || 'Failed to load profile');
        }
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err: any) {
        console.error('ProfileModal fetch error', err);
        if (!cancelled) setError(err.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [open, slug]);

  const age = data?.dob ? calculateAge(new Date(data.dob)) : null;
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!carouselApi) return;

    carouselApi.on("select", () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  function pretty(value?: string | null) {
    if (!value) return null;
    return value.charAt(0) + value.slice(1).toLowerCase();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-full lg:max-w-6xl p-0 overflow-hidden bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl gap-0 h-[95vh] lg:h-[700px] rounded-t-2xl lg:rounded-3xl border-0 lg:border">
        <DialogTitle className="sr-only">Profile Summary for {slug}</DialogTitle>
        <DialogDescription className="sr-only">
          Detailed view of {slug}&apos;s profile including photos and personal information.
        </DialogDescription>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-full w-full gap-4 text-muted-foreground">
            <Spinner className="h-8 w-8 text-primary" />
            <p className="text-sm font-medium animate-pulse">Loading profile...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full w-full gap-4 p-8 text-center">
            <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4">
              <Info className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Unable to load profile</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">{error}</p>
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        ) : data ? (
          <div className="flex flex-col lg:flex-row h-full w-full">
            {/* Left Side: Image Carousel */}
            {/* Mobile/Tablet: 45% height. Desktop: 55% width, full height */}
            <div className="relative w-full h-[45%] lg:h-full lg:w-[55%] bg-zinc-100 dark:bg-zinc-900 flex flex-col shrink-0">
              {data.images && data.images.length > 0 ? (
                <div className="relative h-full w-full group">
                  <Carousel setApi={setCarouselApi} className="h-full w-full [&_[data-slot=carousel-content]]:h-full">
                    <CarouselContent className="h-full ml-0">
                      {data.images.map((img, i) => (
                        <CarouselItem key={i} className="h-full pl-0">
                          <div className="relative h-full w-full overflow-hidden bg-black">
                            {/* Mobile: Contain (show full image). Desktop: Cover (fill space) */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.url}
                              alt={`Photo ${i + 1}`}
                              className="absolute inset-0 w-full h-full object-contain lg:object-cover opacity-90 z-10"
                            />

                            {/* Blurred background for mobile/contain mode to fill whitespace */}
                            <div
                              className="absolute inset-0 z-0 blur-3xl opacity-40 scale-125"
                              style={{
                                backgroundImage: `url(${img.url})`,
                                backgroundPosition: 'center',
                                backgroundSize: 'cover'
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 z-20" />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>

                    {data.images.length > 1 && (
                      <>
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-30">
                          {data.images.map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                "h-1.5 rounded-full transition-all duration-300 shadow-sm",
                                currentSlide === i ? "w-6 bg-white" : "w-1.5 bg-white/50"
                              )}
                            />
                          ))}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => carouselApi?.scrollPrev()}
                          className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-30"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => carouselApi?.scrollNext()}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-30"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </Carousel>
                </div>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                  <User className="h-20 w-20 opacity-20" />
                </div>
              )}
            </div>

            {/* Right Side: Content */}
            <div className="flex-1 flex flex-col h-[55%] lg:h-full overflow-hidden min-h-0 bg-white dark:bg-zinc-950">
              {/* Header */}
              <div className="p-4 lg:p-6 pb-2 shrink-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                      {data.slug || 'Unknown'}
                      {data.verified && (
                        <CheckCircle2 className="h-5 w-5 text-blue-500 fill-blue-500/10" />
                      )}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                      {data.suburb ? (
                        <>
                          <MapPin className="h-3.5 w-3.5" />
                          {data.suburb}
                        </>
                      ) : (
                        <span className="italic">No location set</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 lg:p-6 pt-2 space-y-6 custom-scrollbar">
                {/* Bio */}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                    {data.bio || <span className="italic text-muted-foreground">No bio available.</span>}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Age
                    </div>
                    <div className="text-sm font-semibold">{age ?? 'N/A'}</div>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
                      <User className="h-3.5 w-3.5" />
                      Gender
                    </div>
                    <div className="text-sm font-semibold">{pretty(data.gender) ?? 'N/A'}</div>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
                      <Info className="h-3.5 w-3.5" />
                      Body Type
                    </div>
                    <div className="text-sm font-semibold">{pretty(data.bodyType) ?? 'N/A'}</div>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
                      <User className="h-3.5 w-3.5" />
                      Race
                    </div>
                    <div className="text-sm font-semibold">{pretty(data.race) ?? 'N/A'}</div>
                  </div>
                </div>

                {/* Other Profiles */}
                {(data.hasEscort || data.hasVIP || data.hasLive) && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Linked Profiles
                    </h4>
                    <div className="grid gap-2">
                      {data.hasEscort && (
                        <a
                          href={`/${lang}/escorts/${data.slug}`}
                          className="flex items-center justify-between p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
                              <Heart className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-rose-900 dark:text-rose-100">Escort Profile</span>
                              <span className="text-xs text-rose-700 dark:text-rose-300/70">View full booking details</span>
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-rose-400 group-hover:text-rose-600 transition-colors" />
                        </a>
                      )}

                      {data.hasVIP && (
                        <a
                          href={`/${lang}/vip/${data.slug}`}
                          className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                              <Crown className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">VIP Content</span>
                              <span className="text-xs text-amber-700 dark:text-amber-300/70">Exclusive photos & videos</span>
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-amber-400 group-hover:text-amber-600 transition-colors" />
                        </a>
                      )}

                      {data.hasLive && (
                        <a
                          href={`/${lang}/live/${data.slug}`}
                          className="flex items-center justify-between p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                              <Video className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">Live Channel</span>
                              <span className="text-xs text-purple-700 dark:text-purple-300/70">Watch live streams</span>
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-purple-400 group-hover:text-purple-600 transition-colors" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30 flex justify-end shrink-0">
                <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full px-6">
                  Close
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No profile data available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ProfileModal;
