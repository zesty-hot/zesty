"use client";

import { signIn, useSession } from "next-auth/react";
import ThemeToggle from "./theme";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/origin_ui_old/button";
import { KeyRound, ScanFace } from "lucide-react";
import {
  RiFacebookFill,
  RiGoogleFill,
  RiMicrosoftFill,
} from "@remixicon/react";

export default function DesktopNav() {
  const { data: session, status } = useSession();

  return (
    <nav className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3 sm:px-6">
      <a href="#">
        <div className="flex items-center">
          🌶️
          <span className="ml-5 text-xl font-semibold">zesty</span>
        </div>
      </a>
      <div className="bg-muted flex items-center gap-4 rounded-md px-5 py-2.5 max-lg:hidden">
        <div className="flex-1 max-xl:hidden"></div>
        <div className="text-muted-foreground flex items-center gap-10 font-medium">
          <a href="#" className="hover:text-foreground">Directory</a>
          <a href="#" className="hover:text-foreground">Studios</a>
          <a href="#" className="hover:text-foreground">Creators</a>
          <a href="#" className="hover:text-foreground">Live</a>
          <a href="#" className="hover:text-foreground">Events</a>
          <a href="#" className="hover:text-foreground">Meet</a>
        </div>

        <div className="flex-1 max-xl:hidden"></div>
        <div className="h-6 w-px bg-border max-xl:hidden"></div>
        <div className="flex-1 max-xl:hidden"></div>

        <div className="flex gap-4 max-xl:hidden">
          <a href="#" data-slot="button" className="focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 hover:bg-accent-foreground/5 hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border size-9 bg-transparent shadow-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail" aria-hidden="true">
              <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path>
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            </svg>
          </a>
        </div>
        <div className="flex-1 max-xl:hidden"></div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <a href="#" data-slot="button" className="focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border shadow-xs size-9 xl:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail" aria-hidden="true">
            <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path>
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
          </svg>
        </a>

        <Dialog>
          <DialogTrigger>
            <span data-slot="button" className="cursor-pointer focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs h-9 px-4 py-2 has-[>svg]:px-3 group">Get Started<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></span>
          </DialogTrigger>
          <DialogContent className="dark:bg-neutral-900">
            <div className="flex flex-col items-center gap-2">
              <ScanFace size={52} />
              <DialogHeader>
                <DialogTitle className="sm:text-center">
                  Log in to Zesty
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="flex flex-col gap-2">
              <Button className="bg-[#DB4437] text-white after:flex-1 hover:bg-[#DB4437]/85 cursor-pointer" onClick={() => signIn("google")}
                style={{
                  border: "none"
                }}>
                <span className="pointer-events-none me-2 flex-1">
                  <RiGoogleFill className="opacity-60" size={16} aria-hidden="true" />
                </span>
                Continue with Google
              </Button>
              {/* <Button className="bg-[#14171a] text-white after:flex-1 hover:bg-[#14171a]/90 cursor-pointer" onClick={() => signIn("x")}>
                    <span className="pointer-events-none me-2 flex-1">
                      <RiTwitterXFill className="opacity-60" size={16} aria-hidden="true" />
                    </span>
                    {dict.login.x}
                  </Button> */}
              <Button className="bg-[#1877f2] text-white after:flex-1 hover:bg-[#1877f2]/85 cursor-pointer" onClick={() => signIn("facebook")}
                style={{
                  border: "none"
                }}>
                <span className="pointer-events-none me-2 flex-1">
                  <RiFacebookFill className="opacity-60" size={16} aria-hidden="true" />
                </span>
                Continue with Facebook
              </Button>
              <Button className="bg-[#333333] text-white after:flex-1 hover:bg-[#333333]/85 cursor-pointer" onClick={() => signIn("azure-ad")}
                style={{
                  border: "none"
                }}>
                <span className="pointer-events-none me-2 flex-1">
                  <RiMicrosoftFill className="opacity-60" size={16} aria-hidden="true" />
                </span>
                Continue with Microsoft
              </Button>
            </div>

            <p className="text-muted-foreground text-center text-xs">
              By signing in you agree to our Terms of Service and Privacy Policy.
            </p>
          </DialogContent>
        </Dialog>
        <ThemeToggle />
      </div>
    </nav>
  );
}