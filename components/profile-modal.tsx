"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { type CarouselApi, Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { calculateAge } from "@/lib/calculate-age";

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

  function pretty(value?: string | null) {
    if (!value) return null;
    return value.charAt(0) + value.slice(1).toLowerCase();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                {data?.images?.[0]?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data!.images![0].url} alt={data?.slug || 'User'} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gray-300 flex items-center justify-center">
                    <span className="font-semibold">{data?.slug?.[0]?.toUpperCase() || '?'}</span>
                  </div>
                )}
              </Avatar>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{data?.slug || 'Unknown'}</span>
                  {data?.verified && <span className="text-xs text-blue-600">Verified</span>}
                </div>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>{data?.bio}</DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Spinner />
            </div>
          ) : error ? (
            <div className="p-4 text-sm text-red-600">{error}</div>
          ) : data ? (
            <div className="space-y-4">
              {/* Images carousel */}
              {data.images && data.images.length > 0 && (
                <div className="relative">
                  <Carousel setApi={setCarouselApi}>
                    <CarouselContent>
                      {data.images.map((img, i) => (
                        <CarouselItem key={i}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.url} alt={`Photo ${i + 1}`} className="w-full h-64 sm:h-80 object-cover rounded" />
                        </CarouselItem>
                      ))}
                    </CarouselContent>

                    <button
                      type="button"
                      onClick={() => carouselApi?.scrollPrev()}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 dark:bg-black/60 p-2 rounded-full shadow"
                      aria-label="Previous image"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => carouselApi?.scrollNext()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 dark:bg-black/60 p-2 rounded-full shadow"
                      aria-label="Next image"
                    >
                      ›
                    </button>
                  </Carousel>
                </div>
              )}

              {/* Profile details */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <h4 className="font-semibold">About</h4>
                  <p className="text-sm text-muted-foreground mt-2">{data.bio || 'No profile description.'}</p>
                </div>

                <div>
                  <h4 className="font-semibold">Details</h4>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    {data.race && <li>Race: {pretty(data.race)}</li>}
                    {data.gender && <li>Gender: {pretty(data.gender)}</li>}
                    {data.bodyType && <li>Body type: {pretty(data.bodyType)}</li>}
                    {data.suburb && <li>Location: {data.suburb}</li>}
                    {age !== null && <li>Age: {age}</li>}
                  </ul>

                  <div className="mt-3">
                    <h4 className="font-semibold">Other profiles</h4>
                    <div className="mt-2 flex gap-3 items-center">
                      {data.hasEscort ? (
                        <a className="text-sm underline text-blue-600" href={`/escorts/${data.slug}`}>Escort profile</a>
                      ) : null}

                      {data.hasVIP ? (
                        <a className="text-sm underline text-blue-600" href={`/vip/${data.slug}`}>VIP page</a>
                      ) : null}

                      {data.hasLive ? (
                        <a className="text-sm underline text-blue-600" href={`/live/${data.slug}`}>Live channel</a>
                      ) : null}

                      {!data.hasEscort && !data.hasVIP && !data.hasLive && (
                        <span className="text-sm text-muted-foreground">No additional public profiles</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-sm text-muted-foreground">No profile data</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProfileModal;
