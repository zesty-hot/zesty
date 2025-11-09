"use client";

import { useSession } from "next-auth/react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function OnboardingCheck() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { lang } = useParams();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect if:
    // 1. Session is loading
    // 2. User is not authenticated
    // 3. User is already on the onboarding page
    // 4. User is on auth-related pages
    if (status === "loading") return;
    if (status === "unauthenticated") return;
    if (pathname.includes("/onboarding")) return;
    if (pathname.includes("/api/auth")) return;

    // Check if user has completed onboarding
    const user = session?.user as any;
    if (user && user.onboardingCompleted === false) {
      router.push(`/${lang}/onboarding`);
    }
  }, [session, status, pathname, router]);

  return null;
}
