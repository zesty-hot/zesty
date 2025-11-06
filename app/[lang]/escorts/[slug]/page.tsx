"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/origin_ui_old/button";
import { Bookmark, Camera, CircleCheck, CircleX, Send, TriangleAlert, Webcam, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/origin_ui_old/dialog";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EscortProfileData } from "../page";
import { cn } from "@/lib/utils";
import { RiStarFill } from "@remixicon/react";

export default function EscortSlugPage() {
  const { lang, slug } = useParams();
  const [profile, setProfile] = useState<EscortProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || hasLoadedRef.current) return;

    hasLoadedRef.current = true;

    const cachedData = sessionStorage.getItem(`profile_${slug}`);

    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        setProfile(parsedData);
        setIsLoading(false);

        setTimeout(() => {
          sessionStorage.removeItem(`profile_${slug}`);
        }, 100);
      } catch (error) {
        console.error('Error parsing cached data:', error);
        fetchProfileData();
      }
    } else {
      fetchProfileData();
    }
  }, [slug]);

  // Auto-scroll effect for carousel
  useEffect(() => {
    if (!carouselApi || isHovered) {
      return;
    }

    const interval = setInterval(() => {
      if (!document.hidden) {
        carouselApi.scrollNext();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [carouselApi, isHovered]);

  const fetchProfileData = async () => {
    if (!slug) return;

    try {
      // Replace with your actual API endpoint
      const response = await fetch(`/api/escorts/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug }),
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-10 md:px-4 py-4">
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-10 md:px-4 py-4">
        <p className="text-center text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  // Separate default image from other images
  const defaultImage = profile.images.find(img => img.default);
  const otherImages = profile.images.filter(img => !img.default);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center">{profile.slug}</h1>
        <p className="text-lg text-center text-muted-foreground mt-2">
          {profile.ad.title}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Display default image - Hero section */}
        {defaultImage && (
          <div className="lg:col-span-2 m-auto lg:m-0">
            <div
              className="relative aspect-3/4 md:aspect-video max-h-[400px] lg:max-h-[600px] overflow-hidden rounded-xl bg-muted shadow-lg cursor-pointer hover:shadow-2xl transition-shadow group"
              onClick={() => setSelectedImage(defaultImage.url)}
            >
              <img
                src={defaultImage.url}
                alt={`${profile.slug} - Profile Photo`}
                className={`w-full h-full object-cover transition-all duration-300 ${
                  defaultImage.NSFW === true ? 'blur-xl group-hover:blur-0' : ''
                }`}
              />
              {defaultImage.NSFW === true && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
                  <div className="bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                    <p className="text-sm font-medium">Click to reveal</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info card or additional content */}
        <div className="lg:col-span-1">
          <div className="sm:mx-10 lg:m-0 bg-card border rounded-xl p-4 shadow-sm h-full flex flex-col">
            <div className="flex flex-row">
              <h2 className="text-xl font-semibold mb-4 w-full">Details</h2>
              <Tooltip delay={100}>
                <TooltipTrigger render={
                  <Button variant="ghost" size="sm" className="-mr-3"><span className="float-right inline text-muted-foreground align-middle"><TriangleAlert size={16} /></span></Button>
                } />
                <TooltipContent className="max-sm:hidden">
                  <p>Report this profile</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="space-y-3 text-sm flex-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Age:</span>
                <span className="font-medium">{profile.age}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{profile.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price:</span>
                <span className="font-medium">{profile.price}</span>
              </div>
              {profile.gender && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gender:</span>
                  <span className="font-medium">{profile.gender.charAt(0) + profile.gender.slice(1).toLowerCase()}</span>
                </div>
              )}
              {profile.bodyType && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Body Type:</span>
                  {profile.bodyType === 'ATHLETE' && (
                    <span className="font-medium">Athletic</span>
                  )}
                  {profile.bodyType === 'REGULAR' && (
                    <span className="font-medium">Regular</span>
                  )}
                  {profile.bodyType === 'PLUS' && (
                    <span className="font-medium">Plus size</span>
                  )}
                </div>
              )}
              {profile.race && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Race:</span>
                  <span className="font-medium">{profile.race.charAt(0) + profile.race.slice(1).toLowerCase()}</span>
                </div>
              )}
              {profile.lastActive && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Active:</span>
                  <span className="font-medium">{profile.lastActive}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rating:</span>
                <span
                  className="inline-flex items-center"
                  aria-hidden="true"
                >
                  {profile.averageRating == 0 && (
                    <>
                      <RiStarFill size={16} className="text-amber-500 opacity-60" />
                      <RiStarFill size={16} className="text-amber-500 opacity-60" />
                      <RiStarFill size={16} className="text-amber-500 opacity-60" />
                      <RiStarFill size={16} className="text-amber-500 opacity-60" />
                      <RiStarFill size={16} className="text-amber-500 opacity-60" />
                    </>
                  )}
                  {profile.averageRating > 0 && profile.averageRating < 0.8 && (
                    <>
                      <div className="relative w-4 h-4">
                        <RiStarFill
                          size={16}
                          className="absolute inset-0"
                          style={{
                            fill: "url(#star-gradient)"
                          }}
                        />
                        <svg width="0" height="0" className="absolute">
                          <defs>
                            <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="rgb(245, 158, 11)" />
                              <stop offset="50%" stopColor="rgb(245, 158, 11)" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="rgb(245, 158, 11)" stopOpacity="0.1" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <RiStarFill size={16} className="text-amber-500 opacity-60" />
                      <RiStarFill size={16} className="text-amber-500 opacity-60" />
                      <RiStarFill size={16} className="text-amber-500 opacity-60" />
                      <RiStarFill size={16} className="text-amber-500 opacity-60" />
                    </>
                  )}
                  {profile.averageRating >= 0.8 && profile.averageRating <= 1.2 && (
                    <>
                      <RiStarFill size={16} className="text-amber-500" />
                      <RiStarFill size={16} className="text-amber-500 opacity-60" />
                      <RiStarFill size={16} className="text-amber-500 opacity-60" />
                      <RiStarFill size={16} className="text-amber-500 opacity-60" />
                      <RiStarFill size={16} className="text-amber-500 opacity-60" />
                    </>
                  )}
                  {profile.averageRating > 1.2 && profile.averageRating < 1.8 && (
                    <>
                      <RiStarFill size={16} className="text-amber-500" />
                      <div className="relative w-4 h-4">
                        <RiStarFill
                          size={16}
                          className="absolute inset-0"
                          style={{
                            fill: "url(#star-gradient-2)"
                          }}
                        />
                        <svg width="0" height="0" className="absolute">
                          <defs>
                            <linearGradient id="star-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="rgb(245, 158, 11)" />
                              <stop offset="50%" stopColor="rgb(245, 158, 11)" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="rgb(245, 158, 11)" stopOpacity="0.1" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <RiStarFill size={16} className="text-amber-500 opacity-60" />
                      <RiStarFill size={16} className="text-amber-500 opacity-60" />
                      <RiStarFill size={16} className="text-amber-500 opacity-60" />
                    </>
                  )}
                  {profile.averageRating >= 1.8 && profile.averageRating <= 2.2 && (
                    <>
                      <RiStarFill size={16} className="text-amber-500" />
                      <RiStarFill size={16} className="text-amber-500" />
                      <RiStarFill size={16} className="text-amber-500 opacity-60" />
                      <RiStarFill size={16} className="text-amber-500 opacity-60" />
                      <RiStarFill size ={16} className="text-amber-500 opacity-60" />
                    </>
                  )}
                  {profile.averageRating > 2.2 && profile.averageRating < 2.8 && (
                    <>
                      <RiStarFill size={16} className="text-amber-500" />
                      <RiStarFill size={16} className="text-amber-500" />
                      <div className="relative w-4 h-4">
                        <RiStarFill
                          size={16}
                          className="absolute inset-0"
                          style={{
                            fill: "url(#star-gradient-3)"
                          }}
                        />
                        <svg width="0" height="0" className="absolute">
                          <defs>
                            <linearGradient id="star-gradient-3" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="rgb(245, 158, 11)" />
                              <stop offset="50%" stopColor="rgb(245, 158, 11)" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="rgb(245, 158, 11)" stopOpacity="0.1" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </>
                  )}
                  {profile.averageRating >= 2.8 && profile.averageRating <= 3.2 && (
                    <>
                      <RiStarFill size={16} className="text-amber-500" />
                      <RiStarFill size={16} className="text-amber-500" />
                      <RiStarFill size={16} className="text-amber-500" />
                      <RiStarFill size={16} className="text-amber-500 opacity-60" />
                      <RiStarFill size={16} className="text-amber-500 opacity-60" />
                    </>
                  )}
                  {profile.averageRating > 3.2 && profile.averageRating < 3.8 && (
                    <>
                      <RiStarFill size={16} className="text-amber-500" />
                      <RiStarFill size={16} className="text-amber-500" />
                      <RiStarFill size={16} className="text-amber-500" />
                      <div className="relative w-4 h-4">
                        <RiStarFill
                          size={16}
                          className="absolute inset-0"
                          style={{
                            fill: "url(#star-gradient-4)"
                          }}
                        />
                        <svg width="0" height="0" className="absolute">
                          <defs>
                            <linearGradient id="star-gradient-4" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="rgb(245, 158, 11)" />
                              <stop offset="50%" stopColor="rgb(245, 158, 11)" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="rgb(245, 158, 11)" stopOpacity="0.1" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </>
                  )}
                  {profile.averageRating >= 3.8 && profile.averageRating < 4.2 && (
                    <>
                      <RiStarFill size={16} className="text-amber-500" />
                      <RiStarFill size={16} className="text-amber-500" />
                      <RiStarFill size={16} className="text-amber-500" />
                      <RiStarFill size={16} className="text-amber-500" />
                      <RiStarFill size={16} className="text-amber-500 opacity-60" />
                    </>
                  )}
                  {profile.averageRating > 4.2 && profile.averageRating < 4.8 && (
                    <>
                      <RiStarFill size={16} className="text-amber-500" />
                      <RiStarFill size={16} className="text-amber-500" />
                      <RiStarFill size={16} className="text-amber-500" />
                      <RiStarFill size={16} className="text-amber-500" />
                      <div className="relative w-4 h-4">
                        <RiStarFill
                          size={16}
                          className="absolute inset-0"
                          style={{
                            fill: "url(#star-gradient-5)"
                          }}
                        />
                        <svg width="0" height="0" className="absolute">
                          <defs>
                            <linearGradient id="star-gradient-5" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="rgb(245, 158, 11)" />
                              <stop offset="50%" stopColor="rgb(245, 158, 11)" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="rgb(245, 158, 11)" stopOpacity="0.1" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </>
                  )}
                  {profile.averageRating >= 4.8 && (
                    <>
                      <RiStarFill size={16} className="text-amber-500" />
                      <RiStarFill size={16} className="text-amber-500" />
                      <RiStarFill size={16} className="text-amber-500" />
                      <RiStarFill size={16} className="text-amber-500" />
                      <RiStarFill size={16} className="text-amber-500" />
                    </>
                  )}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <Button variant="outline" size="sm" className="w-full opacity-70 hover:opacity-100"><Bookmark />Add to favourites</Button>
              <div className="flex flex-row gap-2">
                <Link href={`/${lang}/vip/${profile.slug}`} className={`flex w-full ${profile.vip ? 'pointer-events-auto cursor-pointer opacity-80 hover:opacity-100' : 'pointer-events-none opacity-40'}`}><Button variant="outline" size="sm" className="w-full"><Camera />VIP content</Button></Link>
                <Link href={`/${lang}/live/${profile.slug}`} className="flex w-full opacity-80 hover:opacity-100"><Button variant="outline" size="sm" className="w-full"><Webcam />Live streams</Button></Link>
              </div>
              <Button variant="outline" size="lg" className="w-full text-sm h-11 -mb-1"><Send />Contact {decodeURIComponent(slug as string)}</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="sm:mx-10 mt-6 lg:mx-0 bg-card border rounded-xl p-6 shadow-sm h-full flex flex-col">
        <div className="text-xl font-semibold mb-2">Description</div>
        {profile.ad.description ? (
          <p className="text-sm text-muted-foreground whitespace-pre-line">{profile.ad.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No description provided.</p>
        )}
      </div>

      {/* Carousel for other images */}
      {
        otherImages.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">More Photos</h2>
            <div className="relative">
              <Carousel
                setApi={setCarouselApi}
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full max-w-5xl mx-auto"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {otherImages.map((image, index) => (
                    <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                      <div
                        className="aspect-square overflow-hidden rounded-lg bg-muted shadow-md hover:shadow-xl transition-shadow max-w-[280px] mx-auto cursor-pointer group relative"
                        onClick={() => setSelectedImage(image.url)}
                      >
                        <img
                          src={image.url}
                          alt={`${profile.slug} - Photo ${index + 1}`}
                          className={`w-full h-full object-cover hover:scale-105 transition-all duration-300 ${
                            image.NSFW === true ? 'blur-xl group-hover:blur-0' : ''
                          }`}
                        />
                        {image.NSFW === true && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
                            <div className="bg-black/60 text-white px-3 py-1.5 rounded-lg backdrop-blur-sm text-xs font-medium">
                              NSFW
                            </div>
                          </div>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden xl:flex" />
                <CarouselNext className="hidden xl:flex" />
              </Carousel>
            </div>
          </div>
        )
      }

      {/* Services & Pricing and Availability Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Services & Pricing - Takes up 2 columns */}
        <div className="lg:col-span-2 sm:mx-10 lg:mx-0 bg-card border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Services & Pricing</h2>

          {/* Services Grid */}
          <div className="space-y-6">
            {profile.ad.services.map((service) => (
              <div key={service.id} className="space-y-3">
                {/* Service Category Header */}
                <div className="flex items-center gap-2 pb-2 border-b">
                  <h3 className="text-lg font-semibold">
                    {service.category.split('_').map(word =>
                      word.charAt(0) + word.slice(1).toLowerCase()
                    ).join(' ')}
                  </h3>
                  {service.label && (
                    <span className="text-sm text-muted-foreground">({service.label})</span>
                  )}
                </div>

                {/* Service Options List */}
                <div className="grid gap-2">
                  {service.options.map((opt) => (
                    <div
                      key={opt.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {opt.durationMin} {opt.durationMin === 1 ? 'minute' : 'minutes'}
                        </span>
                      </div>
                      <span className="text-sm font-semibold">
                        ${opt.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Extras Section */}
            {profile.ad.extras.length > 0 && (
              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <h3 className="text-lg font-semibold">Available Extras</h3>
                </div>

                <div className="grid gap-2">
                  {profile.ad.extras.map((extra) => (
                    <div
                      key={extra.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <span className="text-sm font-medium">
                        {extra.name.split('_').map(word =>
                          word.charAt(0) + word.slice(1).toLowerCase()
                        ).join(' ')}
                      </span>
                      <span className="text-sm font-semibold">
                        ${extra.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Availability - Takes up 1 column */}
        <div className="lg:col-span-1 sm:mx-10 lg:mx-0 bg-card border rounded-xl p-6 shadow-sm h-fit">
          <h2 className="text-xl font-semibold mb-6">Availability</h2>

          {profile.ad.daysAvailable && profile.ad.daysAvailable.length > 0 ? (
            <div className="space-y-2">
              {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => {
                const isAvailable = profile.ad.daysAvailable.includes(day as any);
                return (
                  <div
                    key={day}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg transition-colors",
                      isAvailable
                        ? "bg-green-500/10 border border-green-500/20"
                        : "bg-muted/30 opacity-50"
                    )}
                  >
                    <span className={cn(
                      "text-sm font-medium",
                      isAvailable ? "text-green-700 dark:text-green-400" : "text-muted-foreground"
                    )}>
                      {day.charAt(0) + day.slice(1).toLowerCase()}
                    </span>
                    {isAvailable ? (<CircleCheck className="text-green-400" />) : (<CircleX className="text-muted-foreground/30" />)}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No availability information</p>
          )}
        </div>
      </div>

      {/* Image Lightbox Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogTitle className="hidden">
          Image Preview
        </DialogTitle>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-0 bg-black/95 [&>button]:bg-white/40 [&>button]:hover:bg-white/60 [&>button]:text-white [&>button]:font-semibold [&>button]:h-10 [&>button]:w-10">
          {selectedImage && (
            <div className="flex items-center justify-center w-full h-full p-4">
              <img
                src={selectedImage}
                alt="Full size"
                className="max-w-full max-h-[90vh] object-contain rounded-sm"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div >
  );
}