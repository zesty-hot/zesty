"use client";

import { redirect, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Settings, User, Bell, Lock, CreditCard, HelpCircle, IdCard, DoorOpen, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { PushNotificationToggle } from "@/components/push-notification-toggle";
import { toastManager } from "@/components/ui/toast";
import { useSupabaseSession } from "@/lib/supabase/client";
import { ProfileSettings } from "@/components/settings/profile-settings";

export default function SettingsPage() {
  const { lang } = useParams<{ lang: string }>();
  const { status, supabase } = useSupabaseSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)] min-h-52">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    toastManager.add({
      title: "Authentication Required",
      description: "Please log in to access your settings.",
      type: "warning",
    });
    router.push(`/${lang}`);
    return;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href={`/${lang}/dash`}>
              <Button variant="ghost" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Settings className="w-8 h-8 text-gray-500" />
                Settings
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your account and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* <Card className="p-12 text-center">
            <Settings className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Settings Coming Soon</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              This settings page is currently under development. Here you'll be able to manage your account preferences, notifications, privacy, and more.
            </p>
          </Card> */}

          {/* Planned Settings Sections */}
          <div className="grid gap-4">
            <ProfileSettings />

            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage email and push notification preferences
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-400 opacity-10"></div>
              <div className="pl-16">
                <PushNotificationToggle />
              </div>
              <div className="pl-16 text-muted-foreground">
                Email notifications
                <p className="text-sm">Coming soon</p>
              </div>
            </Card>

            <Card className="p-6 opacity-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-300 to-cyan-500 flex items-center justify-center">
                  <IdCard className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Verification</h3>
                  <p className="text-sm text-muted-foreground">
                    Verify your identity to unlock special features
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">Coming Soon</span>
              </div>
            </Card>

            <Card className="p-6 opacity-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Help & Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Get help, view FAQs, and contact support
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">Coming Soon</span>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <DoorOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Logout</h3>
                  <p className="text-sm text-muted-foreground">
                    Sign out of your account on this device
                  </p>
                </div>
                <Button onClick={() => supabase.auth.signOut()} variant="outline" size="lg" className="whitespace-nowrap">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
