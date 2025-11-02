"use client";

import {
  getCookie,
  setCookie,
} from 'cookies-next/client';
import { SunMoon } from "lucide-react";

export default function ThemeToggle() {
  const setTheme = () => {
    const theme = getCookie("zesty-theme");
    console.log("Current theme:", theme);
    if (theme === "dark") {
      setCookie("zesty-theme", "light", { path: '/' });
      document.documentElement.classList.remove("dark");
      document.head.querySelector('meta[name="theme-color"]')?.setAttribute("content", "white");
    } else {
      setCookie("zesty-theme", "dark", { path: '/' });
      document.documentElement.classList.add("dark");
      document.head.querySelector('meta[name="theme-color"]')?.setAttribute("content", "black");
    }
  };

  return (
    <button onClick={() => setTheme()} data-slot="button" className="cursor-pointer focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border shadow-xs size-9" type="button" id="radix-_R_6qnpfiv5ubsnpnb_" aria-haspopup="menu" aria-expanded="false" data-state="closed">
      <SunMoon />
      <span className="sr-only">Theme</span>
    </button>
  );
}