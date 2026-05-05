"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Video, Pencil, Plus, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { useSupabaseSession } from "@/lib/supabase/client";

interface LiveChannel {
  id: string;
  active: boolean;
  description?: string | null;
  createdAt?: string | null;
}

export default function LiveManagementPage() {
  const { lang } = useParams() as { lang?: string };
  const router = useRouter();
  const { data: session, status, user } = useSupabaseSession();
  const [channel, setChannel] = useState<LiveChannel | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState<boolean>(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      toastManager.add({
        title: "Authentication Required",
        description: "Please log in to access your live channel.",
        type: "warning",
      });
      router.push(`/${lang}`);
      return;
    }

    if (status === "authenticated") fetchChannel();
    if (status === "loading") setLoading(true);
  }, [status, lang]);

  const fetchChannel = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/live/my-channel`);
      if (!res.ok) throw new Error("Failed to fetch channel");
      const json = await res.json();
      setChannel(json.channel ?? null);
    } catch (err) {
      console.error("fetchChannel error:", err);
      setChannel(null);
    } finally {
      setLoading(false);
    }
  };

  const createChannel = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/live/create', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to create channel');
      const json = await res.json();
      if (json?.channel) setChannel(json.channel);
    } catch (err) {
      console.error('createChannel error:', err);
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (nextState?: boolean) => {
    if (!channel) return;
    setIsTogglingActive(true);
    const intended = typeof nextState === "boolean" ? nextState : !channel.active;
    setChannel((c) => (c ? { ...c, active: intended } : c));

    try {
      const res = await fetch(`/api/live/toggle-active`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: intended }),
      });
      if (!res.ok) throw new Error("Failed to toggle live channel");
      const json = await res.json();
      if (json?.channel) setChannel(json.channel);
    } catch (err) {
      console.error("toggleActive error:", err);
      setChannel((c) => (c ? { ...c, active: !intended } : c));
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
                  <Video className="w-8 h-8 text-rose-500" />
                  Live Channel
                </h1>
                <p className="text-muted-foreground mt-1">Manage your livestream channel</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {!channel ? (
          <Card className="p-12 text-center">
            <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Channel</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven't created a livestream channel yet. Create one to enable streaming.
            </p>
            <Button size="lg" onClick={createChannel} disabled={creating}>
              <Plus className="w-4 h-4 mr-2" />
              {creating ? 'Creating...' : 'Create Channel'}
            </Button>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold">Your Channel</h3>
                  <Badge variant={channel.active ? "default" : "secondary"}>
                    {channel.active ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-3 line-clamp-2">{channel.description || "No description"}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>Created {channel.createdAt ? new Date(channel.createdAt).toLocaleDateString() : "—"}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 ml-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {isTogglingActive ? "Updating..." : channel.active ? "Published" : "Draft"}
                    </span>
                  <Switch 
                  disabled={isTogglingActive}
                    checked={channel.active} 
                    onCheckedChange={(v) => toggleActive(Boolean(v))} 
                  />
                </div>
                <div className="flex gap-2">
                  <Link href={`/${lang}/live/${user?.slug || ''}`}>
                    <Button variant="outline" size="sm">
                      {channel.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                  </Link>
                  <Link href={`/${lang}/dash/live/setup`}>
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
            <li>✓ Keep your channel description up to date</li>
            <li>✓ Disable the channel when not streaming to avoid unwanted viewers</li>
            <li>✓ Test your stream key and settings before going live</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
