import { Binoculars, Camera, Earth, Film, Flame, Heart, HomeIcon, Popcorn, Search, SearchIcon, SettingsIcon, TvMinimalPlay, UserIcon } from "lucide-react";

import MobileNav from "./(client-renders)/mobile-nav";
import DesktopNav from "./(client-renders)/desktop-nav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <DesktopNav />
      
      {children}

      <MobileNav />
    </main>
  );
} 