"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Coffee, Eye, EyeOff, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useSession } from "next-auth/react";
import { Spinner } from "@/components/ui/spinner";

interface PrivateAd {
  id: string;
  active: boolean;
  title: string;
  description: string;
  hourlyRate: number;
  location: string;
  createdAt: string;
}

export default function EscortsManagementPage() {
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [ads, setAds] = useState<PrivateAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAds();
    }
  }, [status]);

  const fetchAds = async () => {
    try {
      const response = await fetch("/api/escorts/my-ads");
      if (response.ok) {
        const data = await response.json();
        setAds(data);
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdActive = async (adId: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/escorts/ads/${adId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (response.ok) {
        setAds(ads.map(ad => 
          ad.id === adId ? { ...ad, active: !currentActive } : ad
        ));
      }
    } catch (error) {
      console.error("Error toggling ad:", error);
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
    router.push(`/${lang}/auth/signin?callbackUrl=/${lang}/dash/escorts`);
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
                  <Coffee className="w-8 h-8 text-rose-500" />
                  Escort Ads
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your private advertisements
                </p>
              </div>
            </div>
            <Link href={`/${lang}/escorts/create`}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create New Ad
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {ads.length === 0 ? (
          <Card className="p-12 text-center">
            <Coffee className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Ads Yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven't created any private ads yet. Click the button below to create your first ad and start attracting clients.
            </p>
            <Link href={`/${lang}/escorts/create`}>
              <Button size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Ad
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {ads.map((ad) => (
              <Card key={ad.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{ad.title}</h3>
                      <Badge variant={ad.active ? "default" : "secondary"}>
                        {ad.active ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {ad.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>📍 {ad.location}</span>
                      <span>💰 ${ad.hourlyRate}/hr</span>
                      <span>📅 Created {new Date(ad.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 ml-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {ad.active ? "Published" : "Unpublished"}
                      </span>
                      <Switch
                        checked={ad.active}
                        onCheckedChange={() => toggleAdActive(ad.id, ad.active)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/${lang}/escorts/${session?.user?.slug || ''}`}>
                        <Button variant="outline" size="sm">
                          {ad.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                      </Link>
                      <Link href={`/${lang}/escorts/edit/${ad.id}`}>
                        <Button variant="outline" size="sm">
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Tips */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-rose-500/5 to-pink-500/10 border-rose-500/20">
          <h3 className="font-semibold text-lg mb-3">Tips for Success</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Use clear, high-quality photos to attract more clients</li>
            <li>✓ Be detailed in your description about services offered</li>
            <li>✓ Keep your rates competitive and clearly stated</li>
            <li>✓ Update your availability regularly</li>
            <li>✓ Respond promptly to inquiries to build trust</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
