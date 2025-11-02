"use client";

import MobileNav from "./(client-renders)/mobile-nav";
import DesktopNav from "./(client-renders)/desktop-nav";
import { SessionProvider } from "next-auth/react";
import { Footer1 } from "@/components/pro-blocks/landing-page/footers/footer-1";
import Cookies from "./(client-renders)/cookies";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="pb-16 lg:pb-0">
      <SessionProvider>
        <DesktopNav />      
      </SessionProvider>

      {children}

      <Footer1 />
      <Cookies />

      <MobileNav />
    </main>
  );
} 