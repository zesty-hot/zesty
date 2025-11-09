"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, TvMinimalPlay, Eye, Settings as SettingsIcon, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useSession } from "next-auth/react";
import { Spinner } from "@/components/ui/spinner";

interface LiveStreamPage {
  id: string;
  active: boolean;
  description: string;
  followerCount: number;
}

export default function LiveManagementPage() {
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [liveStreamPage, setLiveStreamPage] = useState<LiveStreamPage | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchLiveStreamPage();
    }
  }, [status]);

  const fetchLiveStreamPage = async () => {
    try {
      const response = await fetch("/api/live/my-page");
      if (response.ok) {
        const data = await response.json();
        setLiveStreamPage(data);
      }
    } catch (error) {
      console.error("Error fetching live stream page:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async () => {
    if (!liveStreamPage) return;
    
    try {
      const response = await fetch("/api/live/my-page", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !liveStreamPage.active }),
      });

      if (response.ok) {
        setLiveStreamPage({ ...liveStreamPage, active: !liveStreamPage.active });
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
    router.push(`/${lang}/auth/signin?callbackUrl=/${lang}/dash/live`);
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
                  <TvMinimalPlay className="w-8 h-8 text-purple-500" />
                  Live Streaming
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your live streaming page and settings
                </p>
              </div>
            </div>
            {liveStreamPage && (
              <Link href={`/${lang}/live/${session?.user?.slug || ''}`}>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View Page
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {!liveStreamPage ? (
          <Card className="p-12 text-center">
            <TvMinimalPlay className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Set Up Live Streaming</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven't set up your live streaming page yet. Create your page to start broadcasting and connect with your audience in real-time.
            </p>
            <Link href={`/${lang}/live/setup`}>
              <Button size="lg">
                <TvMinimalPlay className="w-4 h-4 mr-2" />
                Create Live Stream Page
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Page Status Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Page Status</h3>
                  <p className="text-muted-foreground text-sm">
                    {liveStreamPage.active 
                      ? "Your page is live and visible to viewers" 
                      : "Your page is currently hidden from viewers"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {liveStreamPage.active ? "Active" : "Inactive"}
                  </span>
                  <Switch
                    checked={liveStreamPage.active}
                    onCheckedChange={toggleActive}
                  />
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="text-muted-foreground text-sm mb-1">Followers</div>
                <div className="text-3xl font-bold">{liveStreamPage.followerCount || 0}</div>
              </Card>
              <Card className="p-6">
                <div className="text-muted-foreground text-sm mb-1">Total Streams</div>
                <div className="text-3xl font-bold">0</div>
              </Card>
              <Card className="p-6">
                <div className="text-muted-foreground text-sm mb-1">Total Donations</div>
                <div className="text-3xl font-bold">$0</div>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href={`/${lang}/live/start`}>
                <Card className="p-6 hover:border-purple-500 transition-colors cursor-pointer h-full">
                  <Radio className="w-8 h-8 text-purple-500 mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Start Streaming</h3>
                  <p className="text-muted-foreground text-sm">
                    Go live and start broadcasting to your audience
                  </p>
                </Card>
              </Link>

              <Link href={`/${lang}/live/settings`}>
                <Card className="p-6 hover:border-purple-500 transition-colors cursor-pointer h-full">
                  <SettingsIcon className="w-8 h-8 text-purple-500 mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Page Settings</h3>
                  <p className="text-muted-foreground text-sm">
                    Update your description, banner, and streaming preferences
                  </p>
                </Card>
              </Link>
            </div>

            {/* Description Preview */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3">About Your Stream</h3>
              <p className="text-muted-foreground">
                {liveStreamPage.description || "No description set. Add a description to let viewers know what to expect from your streams."}
              </p>
              <Link href={`/${lang}/live/settings`}>
                <Button variant="link" className="mt-2 px-0">
                  Edit Description
                </Button>
              </Link>
            </Card>
          </div>
        )}

        {/* Tips */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-purple-500/5 to-indigo-500/10 border-purple-500/20">
          <h3 className="font-semibold text-lg mb-3">Streaming Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Use good lighting and a quality webcam for the best experience</li>
            <li>✓ Engage with your viewers through chat and responses</li>
            <li>✓ Set a consistent streaming schedule to build your audience</li>
            <li>✓ Promote your streams on social media and other platforms</li>
            <li>✓ Test your equipment before going live to avoid technical issues</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
