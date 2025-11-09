"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, Eye, Settings as SettingsIcon, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useSession } from "next-auth/react";
import { Spinner } from "@/components/ui/spinner";

interface DatingPage {
  id: string;
  active: boolean;
  bio: string;
  interests: string[];
  lookingFor: string;
  matchCount: number;
}

export default function DatingManagementPage() {
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [datingPage, setDatingPage] = useState<DatingPage | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDatingPage();
    }
  }, [status]);

  const fetchDatingPage = async () => {
    try {
      const response = await fetch("/api/dating/my-profile");
      if (response.ok) {
        const data = await response.json();
        setDatingPage(data);
      }
    } catch (error) {
      console.error("Error fetching dating page:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async () => {
    if (!datingPage) return;
    
    try {
      const response = await fetch("/api/dating/my-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !datingPage.active }),
      });

      if (response.ok) {
        setDatingPage({ ...datingPage, active: !datingPage.active });
      }
    } catch (error) {
      console.error("Error toggling page:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push(`/${lang}/auth/signin?callbackUrl=/${lang}/dash/dating`);
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/${lang}/dash`}>
                <Button variant="ghost" size="lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                  <Heart className="w-8 h-8 text-red-500" />
                  Dating Profile
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your dating profile and preferences
                </p>
              </div>
            </div>
            {datingPage && (
              <Link href={`/${lang}/dating`}>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Browse Profiles
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {!datingPage ? (
          <Card className="p-12 text-center">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Set Up Your Dating Profile</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven't created a dating profile yet. Set up your profile to start matching with people who share your interests and find meaningful connections.
            </p>
            <Link href={`/${lang}/dating/setup`}>
              <Button size="lg">
                <Heart className="w-4 h-4 mr-2" />
                Create Dating Profile
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Profile Status Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Profile Status</h3>
                  <p className="text-muted-foreground text-sm">
                    {datingPage.active 
                      ? "Your profile is visible and you can receive matches" 
                      : "Your profile is hidden and you won't receive new matches"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {datingPage.active ? "Active" : "Inactive"}
                  </span>
                  <Switch
                    checked={datingPage.active}
                    onCheckedChange={toggleActive}
                  />
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="text-muted-foreground text-sm mb-1">Total Matches</div>
                <div className="text-3xl font-bold flex items-center gap-2">
                  <Heart className="w-6 h-6" />
                  {datingPage.matchCount || 0}
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-muted-foreground text-sm mb-1">Profile Views</div>
                <div className="text-3xl font-bold flex items-center gap-2">
                  <Eye className="w-6 h-6" />
                  0
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-muted-foreground text-sm mb-1">Conversations</div>
                <div className="text-3xl font-bold flex items-center gap-2">
                  <MessageCircle className="w-6 h-6" />
                  0
                </div>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href={`/${lang}/dating`}>
                <Card className="p-6 hover:border-red-500 transition-colors cursor-pointer h-full">
                  <Heart className="w-8 h-8 text-red-500 mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Find Matches</h3>
                  <p className="text-muted-foreground text-sm">
                    Browse profiles and connect with people near you
                  </p>
                </Card>
              </Link>

              <Link href={`/${lang}/dating/settings`}>
                <Card className="p-6 hover:border-red-500 transition-colors cursor-pointer h-full">
                  <SettingsIcon className="w-8 h-8 text-red-500 mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Profile Settings</h3>
                  <p className="text-muted-foreground text-sm">
                    Update your bio, photos, interests, and preferences
                  </p>
                </Card>
              </Link>
            </div>

            {/* Profile Preview */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3">About You</h3>
              <p className="text-muted-foreground mb-4">
                {datingPage.bio || "No bio set. Add a bio to help potential matches get to know you better."}
              </p>
              
              {datingPage.interests && datingPage.interests.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {datingPage.interests.map((interest, i) => (
                      <span 
                        key={i} 
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {datingPage.lookingFor && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Looking For</h4>
                  <p className="text-muted-foreground text-sm">{datingPage.lookingFor}</p>
                </div>
              )}

              <Link href={`/${lang}/dating/settings`}>
                <Button variant="link" className="mt-4 px-0">
                  Edit Profile
                </Button>
              </Link>
            </Card>
          </div>
        )}

        {/* Tips */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-red-500/5 to-rose-500/10 border-red-500/20">
          <h3 className="font-semibold text-lg mb-3">Dating Success Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Use recent, clear photos that show your personality</li>
            <li>✓ Write an authentic bio that reflects who you really are</li>
            <li>✓ Be specific about your interests and what you're looking for</li>
            <li>✓ Respond to messages promptly to keep conversations flowing</li>
            <li>✓ Stay safe by meeting in public places for first dates</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
