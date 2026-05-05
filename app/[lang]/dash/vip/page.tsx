"use client";

import { redirect, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, Eye, DollarSign, Users, Image as ImageIcon, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { useSupabaseSession } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";

interface VIPPage {
  id: string;
  active: boolean;
  description: string;
  bannerUrl: string | null;
  subscriptionPrice: number;
  isFree: boolean;
  subscriberCount: number;
  contentCount: number;
}

export default function VIPManagementPage() {
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();
  const { data: session, status, user } = useSupabaseSession();
  const [loading, setLoading] = useState(true);
  const [vipPage, setVipPage] = useState<VIPPage | null>(null);
  const [creating, setCreating] = useState(false);
  const [isActivating, setIsActivating] = useState<boolean>(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchVIPPage();
    }
  }, [status]);

  const createVIPPage = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/vip/create', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to create channel');
      const json = await res.json();
      if (json?.page) setVipPage(json.page);
    } catch (err) {
      console.error('createChannel error:', err);
    } finally {
      setCreating(false);
    }
  };

  const fetchVIPPage = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/vip/my-page");
      if (response.ok) {
        const data = await response.json();
        setVipPage(data);
      }
    } catch (error) {
      console.error("Error fetching VIP page:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async () => {
    if (!vipPage) return;
    setIsActivating(true);

    try {
      const response = await fetch("/api/vip/my-page", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !vipPage.active }),
      });

      if (response.ok) {
        setVipPage({ ...vipPage, active: !vipPage.active });
      }
    } catch (error) {
      console.error("Error toggling page:", error);
    } finally {
      setIsActivating(false);
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
    toastManager.add({
      title: "Authentication Required",
      description: "Please log in to access your vip profile.",
      type: "warning",
    });
    router.push(`/${lang}`);
    return;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b backdrop-blur">
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
                  <Camera className="w-8 h-8 text-orange-500" />
                  VIP Content Page
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your exclusive content subscription page
                </p>
              </div>
            </div>
            {vipPage && (
              <Link href={`/${lang}/vip/${user?.slug || ''}`}>
                <Button variant="outline">
                  {vipPage.active ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                  View Page
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {!vipPage ? (
          <Card className="p-12 text-center">
            <Camera className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Create Your VIP Page</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven't created a VIP content page yet. Set up your exclusive subscription page to share premium content with your fans and earn money.
            </p>
            <Button size="lg" onClick={() => createVIPPage()} disabled={creating}>
              <Camera className="w-4 h-4 mr-2" />
              {creating ? 'Creating...' : 'Create VIP Page'}
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Page Status Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Page Status</h3>
                  <p className="text-muted-foreground text-sm">
                    {vipPage.active
                      ? "Your page is live and accepting subscriptions"
                      : "Your page is currently hidden from public view"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {isActivating ? 'Updating...' : vipPage.active ? "Published" : "Draft"}
                  </span>
                  <Switch
                    disabled={isActivating}
                    checked={vipPage.active}
                    onCheckedChange={toggleActive}
                  />
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="text-muted-foreground text-sm mb-1">Subscribers</div>
                <div className="text-3xl font-bold flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  {vipPage.subscriberCount || 0}
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-muted-foreground text-sm mb-1">Subscription Price</div>
                <div className="text-3xl font-bold flex items-center gap-2">
                  <DollarSign className="w-6 h-6" />
                  {vipPage.isFree ? "Free" : `${(vipPage.subscriptionPrice / 100).toFixed(2)}`}
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-muted-foreground text-sm mb-1">Content Posts</div>
                <div className="text-3xl font-bold flex items-center gap-2">
                  <ImageIcon className="w-6 h-6" />
                  {vipPage.contentCount || 0}
                </div>
              </Card>
            </div>

            {/* Monthly Revenue Estimate */}
            <Card className="p-6 bg-gradient-to-r from-green-500/5 to-emerald-500/10 border-green-500/20">
              <h3 className="text-lg font-semibold mb-2">Monthly Revenue Estimate</h3>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                ${vipPage.isFree ? 0 : ((vipPage.subscriberCount || 0) * (vipPage.subscriptionPrice / 100)).toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Based on {vipPage.subscriberCount || 0} active subscribers
              </p>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href={`/${lang}/dash/vip/manage`}>
                <Card className="relative p-6 hover:border-orange-500 transition-colors cursor-pointer h-full">
                  <Camera className="w-8 h-8 text-orange-500 mb-3" />
                  <Badge className="absolute top-2 right-2 w-9 h-5 opacity-80 rounded-md">New</Badge>
                  <h3 className="text-lg font-semibold mb-2">Post New Content</h3>
                  <p className="text-muted-foreground text-sm">
                    Share photos, videos, or status updates with your subscribers
                  </p>
                </Card>
              </Link>

              <Link href={`/${lang}/dash/vip/setup`}>
                <Card className="p-6 hover:border-orange-500 transition-colors cursor-pointer h-full">
                  <DollarSign className="w-8 h-8 text-orange-500 mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Pricing & Settings</h3>
                  <p className="text-muted-foreground text-sm">
                    Update subscription price, description, and page settings
                  </p>
                </Card>
              </Link>
            </div>

            {/* Description Preview */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3">About Your Page</h3>
              <p className="text-muted-foreground">
                {vipPage.description || "No description set. Add a description to let potential subscribers know what exclusive content they'll get."}
              </p>
              <Link href={`/${lang}/dash/vip/setup`}>
                <Button variant="link" className="mt-2 px-0">
                  Edit Description
                </Button>
              </Link>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3">Profile banner</h3>
              {vipPage.bannerUrl ? (<img src={vipPage.bannerUrl} alt="VIP Page Banner" className="w-full h-40 object-cover rounded-md mb-4" />) : (
                <div className="w-full h-48 md:h-72 lg:h-96 bg-linear-to-br from-purple-500 via-pink-500 to-rose-500 rounded-sm">
                  <div className="w-full h-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles w-16 h-16 text-white/30" aria-hidden="true">
                      <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>
                      <path d="M20 2v4"></path>
                      <path d="M22 4h-4"></path>
                      <circle cx="4" cy="20" r="2"></circle>
                    </svg>
                  </div>
                  <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/5 to-transparent"></div>
                </div>
              )}
              <Link href={`/${lang}/dash/vip/setup`}>
                <Button variant="link" className="mt-2 px-0">
                  Edit Banner
                </Button>
              </Link>
            </Card>
          </div>
        )}

        {/* Tips */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-orange-500/5 to-amber-500/10 border-orange-500/20">
          <h3 className="font-semibold text-lg mb-3">Content Creation Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Post regularly to keep subscribers engaged and coming back</li>
            <li>✓ Offer exclusive content that can't be found elsewhere</li>
            <li>✓ Engage with your subscribers through comments and messages</li>
            <li>✓ Tease free content on other platforms to attract new subscribers</li>
            <li>✓ Consider offering promotional pricing to grow your subscriber base</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
