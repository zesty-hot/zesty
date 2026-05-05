"use client";

import { redirect, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, Eye, EyeOff, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { useSupabaseSession } from "@/lib/supabase/client";

interface DatingProfile {
  id: string;
  active: boolean;
  lookingFor: string[];
  ageRangeMin: number;
  ageRangeMax: number;
  createdAt: string;
}

export default function DatingManagementPage() {
  const { lang } = useParams<{ lang: string }>();
  const { data: session, status, user } = useSupabaseSession();
  const [profile, setProfile] = useState<DatingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); 
  const [isTogglingActive, setIsTogglingActive] = useState<boolean>(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/dating/my-profile");
      if (res.ok) {
        const { profile } = await res.json();
        setProfile(profile);
      }
    } catch (err) {
      console.error("Error fetching dating profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const [creating, setCreating] = useState(false);

  const createProfile = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/dating/create', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to create profile');
      const json = await res.json();
      if (json?.profile) setProfile(json.profile);
    } catch (err) {
      console.error('createProfile error:', err);
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (current: boolean) => {
    if (!profile) return;

    setIsTogglingActive(true);

    try {
      const res = await fetch("/api/dating/toggle-active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !profile.active }),
      });

      if (!res.ok) {
        throw new Error("Failed to toggle");
      }

      setProfile({ ...profile, active: !profile.active });
    } catch (err) {
      console.error("Toggle failed:", err);
    } finally {
      setIsTogglingActive(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)] min-h-52">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    toastManager.add({
      title: "Authentication Required",
      description: "Please log in to access your dating profile.",
      type: "warning",
    });
    router.push(`/${lang}`);
    return;
  }

  return (
    <div className="min-h-screen bg-background">
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
                  <Heart className="w-8 h-8 text-rose-500" />
                  Dating Profile
                </h1>
                <p className="text-muted-foreground mt-1">Manage your dating profile</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {!profile ? (
          <Card className="p-12 text-center">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Dating Profile</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You don't have a dating profile yet. Create one to start matching.
            </p>
            <Button size="lg" onClick={createProfile} disabled={creating}>
              <Plus className="w-4 h-4 mr-2" />
              {creating ? 'Creating...' : 'Create Your Profile'}
            </Button>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold">Dating Profile</h3>
                  <Badge variant={profile.active ? "default" : "secondary"}>
                    {profile.active ? "Published" : "Draft"}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>🎉 Created {new Date(profile.createdAt).toLocaleDateString()}</span>
                  <span>👀 Looking for: {profile.lookingFor.join(", ") || '—'}</span>
                  <span>🎂 Age: {profile.ageRangeMin}–{profile.ageRangeMax}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 ml-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {isTogglingActive ? "Updating..." : profile.active ? "Published" : "Draft"}
                    </span>
                  <Switch 
                    disabled={isTogglingActive}
                    checked={profile.active} 
                    onCheckedChange={() => toggleActive(profile.active)}
                  />
                </div>
                <div className="flex gap-2">
                  <Link href={`/${lang}/dating/${user?.slug || ''}`}>
                    <Button variant="outline" size="sm">
                      {profile.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                  </Link>
                  <Link href={`/${lang}/dash/dating/setup`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card className="mt-8 p-6 bg-linear-to-r from-rose-500/5 to-pink-500/10 border-rose-500/20">
          <h3 className="font-semibold text-lg mb-3">Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Use an honest, friendly bio to attract compatible matches</li>
            <li>✓ Keep your photos clear and recent</li>
            <li>✓ Update availability and preferences regularly</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

