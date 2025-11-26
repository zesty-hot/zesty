"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  X,
  Star,
  MapPin,
  Info,
  Settings,
  MessageCircle,
  Users,
  Sparkles,
  Flame,
  Zap,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCheck,
  MapPinned,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface DatingProfile {
  id: string;
  userId: string;
  title: string;
  bio: string | null;
  age: number;
  gender: string;
  suburb: string | null;
  distance: number | null;
  distanceText: string | null;
  lookingFor: string[];
  images: {
    url: string;
    NSFW: boolean;
  }[];
  verified: boolean;
}

export default function Page() {
  const { lang } = useParams();
  const router = useRouter();
  const [profiles, setProfiles] = useState<DatingProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showMarketingPage, setShowMarketingPage] = useState(false);
  const [showRulesDialog, setShowRulesDialog] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [unblurredImages, setUnblurredImages] = useState<Set<string>>(new Set());
  const cardRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0 });

  // Check if user has seen rules this session
  useEffect(() => {
    const hasSeenRules = sessionStorage.getItem('dating-rules-seen');
    if (!hasSeenRules) {
      setShowRulesDialog(true);
    }
  }, []);

  const handleAcceptRules = () => {
    sessionStorage.setItem('dating-rules-seen', 'true');
    setShowRulesDialog(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/dating/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ limit: 20 }),
      });

      if (response.ok) {
        const data = await response.json();
        // Append new profiles instead of replacing, to avoid duplicates on refresh
        setProfiles(prevProfiles => {
          const newProfiles = data.profiles || [];
          // Filter out any profiles we already have
          const existingIds = new Set(prevProfiles.map((p: DatingProfile) => p.id));
          const uniqueNewProfiles = newProfiles.filter((p: DatingProfile) => !existingIds.has(p.id));
          return [...prevProfiles, ...uniqueNewProfiles];
        });
        setShowMarketingPage(false);
      } else {
        const errorData = await response.json();
        console.error('Error fetching profiles:', errorData);
        setErrorMessage(errorData.error || 'Failed to fetch profiles');
        setHasError(true);
        // Show marketing page if user is unauthorized or doesn't have a dating profile
        if (response.status === 401 || response.status === 404) {
          setShowMarketingPage(true);
        }
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setHasError(true);
      setErrorMessage('Failed to fetch profiles. Please try again.');
      setShowMarketingPage(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = async (direction: 'like' | 'pass', superLike: boolean = false) => {
    if (isSwiping || profiles.length === 0) return;

    setIsSwiping(true);
    setSwipeDirection(direction === 'like' ? 'right' : 'left');

    const currentProfile = profiles[currentIndex];

    try {
      await fetch('/api/dating/swipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId: currentProfile.id,
          direction,
          superLike,
        }),
      });

      // Wait for animation
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setCurrentImageIndex(0);
        setSwipeDirection(null);
        setIsSwiping(false);
        setDragOffset({ x: 0, y: 0 });
        setUnblurredImages(new Set()); // Reset unblurred images for next profile

        // Load more if running low
        if (currentIndex >= profiles.length - 3) {
          fetchProfiles();
        }
      }, 300);
    } catch (error) {
      console.error('Error swiping:', error);
      setIsSwiping(false);
      setSwipeDirection(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isSwiping) return;
    setIsDragging(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isSwiping) return;
    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // If dragged far enough, trigger swipe
    if (Math.abs(dragOffset.x) > 100) {
      handleSwipe(dragOffset.x > 0 ? 'like' : 'pass');
    } else {
      // Snap back
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isSwiping) return;
    setIsDragging(true);
    const touch = e.touches[0];
    startPosRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isSwiping) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPosRef.current.x;
    const deltaY = touch.clientY - startPosRef.current.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (Math.abs(dragOffset.x) > 100) {
      handleSwipe(dragOffset.x > 0 ? 'like' : 'pass');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const currentProfile = profiles[currentIndex];

  // Marketing/Landing Page
  if (showMarketingPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            {/* Logo/Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                  <Heart className="w-12 h-12 text-white fill-current" />
                </div>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Find Your Match
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground">
                Connect with real people in your area. Date, make friends, or find something casual.
              </p>
            </div>

            {/* CTA Button */}
            {/* <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                onClick={() => router.push(`/${lang}/auth/signin?callbackUrl=/${lang}/dating`)}
              >
                <Heart className="w-5 h-5 mr-2" />
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg"
                onClick={() => router.push(`/${lang}/about`)}
              >
                Learn More
              </Button>
            </div> */}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-rose-600">12K+</div>
                <div className="text-sm text-muted-foreground">Active Members</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-pink-600">50+</div>
                <div className="text-sm text-muted-foreground">Cities</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-purple-600">1M+</div>
                <div className="text-sm text-muted-foreground">Matches Made</div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold">Safe & Verified</h3>
              <p className="text-muted-foreground">
                All profiles are manually verified. Your safety and privacy are our top priority.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                <MapPinned className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold">Location-Based</h3>
              <p className="text-muted-foreground">
                Find people nearby. Set your distance preferences and discover locals.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold">Real Connections</h3>
              <p className="text-muted-foreground">
                Match based on shared interests and what you're looking for. No fake profiles.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-24 text-center max-w-4xl mx-auto space-y-12">
            <h2 className="text-4xl font-bold">How It Works</h2>

            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <h3 className="text-xl font-bold">Create Your Profile</h3>
                <p className="text-muted-foreground">
                  Add photos, write your bio, and tell us what you're looking for.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <h3 className="text-xl font-bold">Swipe & Match</h3>
                <p className="text-muted-foreground">
                  Browse profiles, swipe right on people you like. When they like you back, it's a match!
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <h3 className="text-xl font-bold">Start Chatting</h3>
                <p className="text-muted-foreground">
                  Message your matches and see where it goes. Meet up when you're ready.
                </p>
              </div>
            </div>

            {/* Final CTA */}
            <div className="pt-8">
              <Button
                size="lg"
                // className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-12 py-6 text-lg rounded-full shadow-lg transition-all"
                onClick={() => router.push(`/${lang}/auth/signin?callbackUrl=/${lang}/dash/dating`)}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Join Now - It's Free
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)] min-h-52">
        <div className="text-center">
          <Flame className="w-16 h-16 mx-auto mb-4 text-rose-500 animate-pulse" />
          <p className="text-muted-foreground">Finding matches...</p>
        </div>
      </div>
    );
  }

  if (!currentProfile || currentIndex >= profiles.length) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)] min-h-52 p-4">
        <div className="text-center max-w-md space-y-6">
          <div className="w-24 h-24 mx-auto bg-muted flex items-center justify-center">
            <Users className="w-12 h-12 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">No More Profiles</h2>
            <p className="text-muted-foreground">
              You've seen everyone in your area. Check back later for new members!
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => {
              setCurrentIndex(0);
              fetchProfiles();
            }}>
              Refresh
            </Button>
            <Link href={`/${lang}/dating/matches`}>
              <Button variant="outline">
                <MessageCircle className="w-4 h-4 mr-2" />
                View Matches
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Auto-skip profiles without images
  if (!currentProfile.images || currentProfile.images.length === 0) {
    // Automatically skip to next profile
    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      if (currentIndex >= profiles.length - 3) {
        fetchProfiles();
      }
    }, 0);

    // Return empty while skipping
    return null;
  }

  const currentImage = currentProfile.images[currentImageIndex] || currentProfile.images[0];
  const rotation = dragOffset.x * 0.05;
  const opacity = 1 - Math.abs(dragOffset.x) / 300;

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur-sm z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-rose-500" />
            <h1 className="text-xl font-bold">Zesty Dating</h1>
          </div>
          {/* <div className="flex items-center gap-2">
            <Link href={`/${lang}/dating/profile`}>
              <Button variant="ghost" size="lg">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div> */}
        </div>
      </div>

      {/* Main Swipe Area */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="relative h-[70vh]">

          {/* Rules Card - Shows before profiles */}
          {showRulesDialog && (
            <div className="absolute inset-0 rounded-3xl overflow-hidden border-4 border-background shadow-2xl bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
              <div className="relative w-full h-full flex flex-col">
                {/* Header with icon */}
                <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-4 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white fill-current" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Welcome to Dating</h2>
                      <p className="text-sm text-white/90">Please read our guidelines</p>
                    </div>
                  </div>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div className="space-y-4">
                    <div className="flex gap-3 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                        <Heart className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base mb-1">For Genuine Connections Only</h4>
                        <p className="text-sm text-muted-foreground">
                          This platform is designed for people to meet each other, make friends, date, or find relationships.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                        <X className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base mb-1">No Commercial Services</h4>
                        <p className="text-sm text-muted-foreground">
                          Advertising paid services, escort services, or any commercial activities is strictly prohibited and will result in immediate termination.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base mb-1">Respect & Safety</h4>
                        <p className="text-sm text-muted-foreground">
                          Treat everyone with respect. Harassment, hate speech, or inappropriate behavior will not be tolerated.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                        <UserCheck className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base mb-1">Be Authentic</h4>
                        <p className="text-sm text-muted-foreground">
                          Use real photos and honest information. Fake profiles and catfishing are prohibited.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action button at bottom */}
                <div className="p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-t border-border">
                  <Button
                    size="lg"
                    onClick={handleAcceptRules}
                    className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-lg py-4"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    I Understand & Agree
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Card Stack */}
          {!showRulesDialog && (
            <div className="absolute inset-0">
              {/* Next card (behind) */}
              {profiles[currentIndex + 1] && (
                <div className="absolute inset-0 rounded-3xl overflow-hidden border-4 border-background shadow-2xl scale-95 opacity-50">
                  <img
                    src={profiles[currentIndex + 1].images[0]?.url}
                    alt="Next"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Current card */}
              <div
                ref={cardRef}
                className={cn(
                  "absolute inset-0 rounded-3xl overflow-hidden border-4 border-background shadow-2xl cursor-grab active:cursor-grabbing transition-all",
                  isDragging ? "transition-none" : "transition-all duration-300"
                )}
                style={{
                  transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
                  opacity: isDragging ? opacity : 1,
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Image */}
                <div className="relative w-full h-full">
                  <img
                    src={currentImage.url}
                    alt={currentProfile.title}
                    className={cn(
                      "w-full h-full object-cover transition-all",
                      (currentImage.NSFW && false) && !unblurredImages.has(currentImage.url) && "blur-lg"
                    )}
                  />

                  {/* NSFW Warning Badge - Clickable Overlay */}
                  {(currentImage.NSFW && false) && !unblurredImages.has(currentImage.url) && (
                    <div
                      className="absolute inset-0 flex items-center justify-center cursor-pointer z-20"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUnblurredImages(prev => new Set(prev).add(currentImage.url));
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                    >
                      <div className="bg-black/80 backdrop-blur-sm text-white px-6 py-3 rounded-full border-2 border-white/30 text-center pointer-events-none">
                        <AlertCircle className="w-6 h-6 mx-auto mb-1" />
                        <p className="font-bold text-sm">NSFW Content</p>
                        <p className="text-xs text-white/80">Tap to view</p>
                      </div>
                    </div>
                  )}

                  {/* Swipe indicators */}
                  {dragOffset.x > 50 && (
                    <div className="absolute top-8 right-8 rotate-12">
                      <div className="px-6 py-3 border-4 border-green-500 text-green-500 text-2xl font-bold rounded-xl bg-white/20 backdrop-blur">
                        LIKE
                      </div>
                    </div>
                  )}
                  {dragOffset.x < -50 && (
                    <div className="absolute top-8 left-8 -rotate-12">
                      <div className="px-6 py-3 border-4 border-red-500 text-red-500 text-2xl font-bold rounded-xl bg-white/20 backdrop-blur">
                        NOPE
                      </div>
                    </div>
                  )}

                  {/* Image navigation dots */}
                  {currentProfile.images.length > 1 && (
                    <div className="absolute top-4 left-0 right-0 flex gap-1 px-4">
                      {currentProfile.images.map((_, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex-1 h-1 rounded-full transition-all",
                            idx === currentImageIndex ? "bg-white" : "bg-white/30"
                          )}
                        />
                      ))}
                    </div>
                  )}

                  {/* Image navigation areas */}
                  {currentProfile.images.length > 1 && (
                    <>
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer group z-30"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentImageIndex > 0) setCurrentImageIndex(currentImageIndex - 1);
                        }}
                      >
                        {currentImageIndex > 0 && (
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 group-hover:opacity-100 transition-opacity bg-black/30 rounded-full p-2 backdrop-blur-sm">
                            <ChevronLeft className="w-6 h-6 text-white" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <div
                        className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer group z-30"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentImageIndex < currentProfile.images.length - 1) setCurrentImageIndex(currentImageIndex + 1);
                        }}
                      >
                        {currentImageIndex < currentProfile.images.length - 1 && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 group-hover:opacity-100 transition-opacity bg-black/30 rounded-full p-2 backdrop-blur-sm">
                            <ChevronRight className="w-6 h-6 text-white" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />

                  {/* Profile info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex items-end gap-3 mb-2">
                      <h2 className="text-3xl font-bold">{currentProfile.title}</h2>
                      <span className="text-2xl mb-1">{currentProfile.age}</span>
                      {/* {currentProfile.verified && (
                        <Badge className="bg-blue-500 mb-1">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          Verified
                        </Badge>
                      )} */}
                    </div>

                    {currentProfile.suburb && (
                      <div className="flex items-center gap-2 text-white/90 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{currentProfile.suburb}</span>
                        {currentProfile.distanceText && (
                          <span>• {currentProfile.distanceText}</span>
                        )}
                      </div>
                    )}

                    {currentProfile.bio && (
                      <p className="text-white/90 text-sm line-clamp-2 mb-3">
                        {currentProfile.bio}
                      </p>
                    )}

                    {currentProfile.lookingFor.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {currentProfile.lookingFor.map((item) => (
                          <Badge key={item} variant="secondary" className="bg-white/20 text-white border-white/30">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Info button */}
                  {/* <button
                    className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition-colors z-30"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Show full profile modal
                    }}
                  >
                    <Info className="w-5 h-5" />
                  </button> */}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons - Hidden when rules dialog is showing */}
        {!showRulesDialog && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              size="lg"
              variant="outline"
              className="!w-16 !h-16 !border-2 hover:scale-110 transition-transform !p-0 !min-h-0"
              onClick={() => handleSwipe('pass')}
              disabled={isSwiping}
            >
              <X className="w-8 h-8 text-red-500" />
            </Button>

            {/* <Button
              size="lg"
              variant="outline"
              className="!w-20 !h-20 !border-0 hover:scale-110 transition-transform bg-gradient-to-br from-blue-500 to-purple-500 !p-0 !min-h-0"
              onClick={() => handleSwipe('like', true)}
              disabled={isSwiping}
            >
              <Star className="w-10 h-10 text-white fill-current" />
            </Button> */}

            <Button
              size="lg"
              variant="outline"
              className="!w-16 !h-16 !border-2 hover:scale-110 transition-transform !p-0 !min-h-0"
              onClick={() => handleSwipe('like')}
              disabled={isSwiping}
            >
              <Heart className="w-8 h-8 text-green-500" />
            </Button>
          </div>
        )}

        {/* Stats - Hidden when rules dialog is showing */}
        {!showRulesDialog && (
          <div className="text-center mt-6 text-sm text-muted-foreground">
            {profiles.slice(currentIndex).filter(p => p.images && p.images.length > 0).length} profiles remaining
          </div>
        )}
      </div>
    </div>
  );
}