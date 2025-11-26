"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/image-upload";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface VIPPage {
  id: string;
  active: boolean;
  description: string;
  bannerUrl: string | null;
  subscriptionPrice: number;
  isFree: boolean;
}

export default function VipSetupPage() {
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [description, setDescription] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState("9.99");
  const [active, setActive] = useState(true);

  useEffect(() => {
    fetchPageData();
  }, []);

  const fetchPageData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vip/my-page");
      if (res.ok) {
        const data: VIPPage = await res.json();
        setDescription(data.description || "");
        setBannerUrl(data.bannerUrl || "");
        setIsFree(data.isFree);
        setPrice((data.subscriptionPrice / 100).toFixed(2));
        setActive(data.active);
      }
    } catch (error) {
      console.error("Error fetching page data:", error);
      toastManager.add({
        title: "Error",
        description: "Failed to load page settings.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        description,
        bannerUrl,
        isFree,
        subscriptionPrice: Math.round(parseFloat(price) * 100),
        active,
      };

      const res = await fetch("/api/vip/my-page", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update settings");

      toastManager.add({
        title: "Success",
        description: "Settings saved successfully.",
        type: "success",
      });

      router.refresh();
    } catch (error) {
      console.error("Error saving settings:", error);
      toastManager.add({
        title: "Error",
        description: "Failed to save settings.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b backdrop-blur sticky top-0 z-10 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/${lang}/dash/vip`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Page Settings
              </h1>
              <p className="text-muted-foreground text-sm">
                Configure your VIP page details
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Banner Image */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Banner Image</Label>
                <p className="text-sm text-muted-foreground">
                  This image will be displayed at the top of your VIP page.
                </p>
              </div>
              <ImageUpload
                value={bannerUrl}
                onChange={setBannerUrl}
                uploadEndpoint="/api/vip/upload"
                accept="image/*"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Tell your subscribers what they can expect..."
                className="min-h-[120px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/3000
              </p>
            </div>

            {/* Pricing */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Pricing</h3>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Free Subscription</Label>
                  <p className="text-sm text-muted-foreground">
                    Make your VIP page free for everyone
                  </p>
                </div>
                <Switch checked={isFree} onCheckedChange={setIsFree} />
              </div>

              {!isFree && (
                <div className="space-y-2">
                  <Label>Monthly Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Visibility */}
            {/* <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Visibility</h3>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Page Active</Label>
                  <p className="text-sm text-muted-foreground">
                    When active, your page is visible and can accept subscriptions
                  </p>
                </div>
                <Switch checked={active} onCheckedChange={setActive} />
              </div>
            </div> */}

            <div className="pt-4">
              <Button type="submit" className="w-full" size="lg" disabled={isSaving}>
                {isSaving ? <Spinner className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
