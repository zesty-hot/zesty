"use client";

import MobileNav from "@/app/[lang]/(client-renders)/mobile-nav";
import DesktopNav from "@/app/[lang]/(client-renders)/desktop-nav";
import { SessionProvider } from "next-auth/react";
import { Footer } from "@/app/[lang]/(client-renders)/footer";
import Cookies from "@/app/[lang]//(client-renders)/cookies";
import ClientAnalytics from "@/app/[lang]/(client-renders)/analytics";
import AgeVerify from "./(client-renders)/age-verify";
import { OnboardingCheck } from "./(client-renders)/onboarding-check";
import { ToastProvider } from "@/components/ui/toast";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <main className="pb-16 lg:pb-0">
          {/* Top */}
          <DesktopNav />      

          {children}

          {/* Bottom */}
          <Footer />
          <MobileNav />
          
          {/* Injections */}
          <ClientAnalytics />
          <Cookies />
          <AgeVerify />
          <OnboardingCheck />
        </main>
      </ToastProvider>
    </SessionProvider>
  );
}
