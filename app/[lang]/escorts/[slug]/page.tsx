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

interface ProfileData {
  id: string
  adId: string
  slug: string
  location: string
  price: string
  age: number
  gender: string
  bodyType?: string
  race?: string
  images: { url: string, default: boolean }[]
}

export default function EscortSlugPage() {
  const { slug } = useParams();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [isHovered, setIsHovered] = useState(false);

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
          {profile.age} • {profile.location} • {profile.price}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Display default image - Hero section */}
        {defaultImage && (
          <div className="lg:col-span-2">
            <div className="relative aspect-video max-h-[400px] lg:max-h-[600px] overflow-hidden rounded-xl bg-muted shadow-lg">
              <img
                src={defaultImage.url}
                alt={`${profile.slug} - Profile Photo`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Info card or additional content */}
        <div className="lg:col-span-1">
          <div className="bg-card border rounded-xl p-6 shadow-sm h-full">
            <h2 className="text-xl font-semibold mb-4">Details</h2>
            <div className="space-y-3 text-sm">
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
                  <span className="font-medium">{profile.gender}</span>
                </div>
              )}
              {profile.bodyType && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Body Type:</span>
                  <span className="font-medium">{profile.bodyType}</span>
                </div>
              )}
              {profile.race && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Race:</span>
                  <span className="font-medium">{profile.race}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Carousel for other images */}
      {otherImages.length > 0 && (
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
                    <div className="aspect-square overflow-hidden rounded-lg bg-muted shadow-md hover:shadow-xl transition-shadow max-w-[280px] mx-auto">
                      <img
                        src={image.url}
                        alt={`${profile.slug} - Photo ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      )}
    </div>
  );
}