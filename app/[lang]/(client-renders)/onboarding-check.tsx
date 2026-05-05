"use client";

import { useSupabaseSession } from "@/lib/supabase/client";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function OnboardingCheck() {
  const { data: session, status, user } = useSupabaseSession();
  const router = useRouter();
  const { lang } = useParams();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect if:
    // 1. Session is loading
    // 2. User is not authenticated
    // 3. User is already on the onboarding page
    // 4. User is on auth-related pages
    if (pathname.includes("/onboarding")) return;
    if (pathname.includes("/api/auth")) return;

    // Check if user has completed onboarding
    if (status === "authenticated" && user?.onboardingCompleted === false) {
      router.push(`/${lang}/onboarding`);
    }
  }, [status, user, pathname, router]);

  return null;
}
