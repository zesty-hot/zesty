"use client";

import { Calendar, Camera, Clapperboard, Flame, Search, TvMinimalPlay } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";

export default function MobileNav() {
  const { lang } = useParams();
  const pathname = usePathname();
  const [clickedPath, setClickedPath] = useState<string | null>(null);

  const handleClick = (path: string) => {
    setClickedPath(path);
    // Reset after animation
    setTimeout(() => setClickedPath(null), 300);
  };

  const isActive = (path: string) => pathname?.includes(path);
  const isClicked = (path: string) => clickedPath === path;

  const getLinkClassName = (path: string) => {
    const base = "flex flex-col items-center justify-center gap-1 transition-all duration-200";
    const active = isActive(path)
      ? "text-primary dark:text-primary"
      : "text-gray-500 dark:text-gray-400";
    const hover = "hover:text-gray-900 dark:hover:text-gray-50";
    const clicked = isClicked(path) ? "scale-100 opacity-70" : "scale-110";
    const activeScale = isActive(path) ? "font-semibold" : "";
    
    return `${base} ${active} ${hover} ${clicked} ${activeScale}`;
  };

  return (
    <nav
      className="fixed lg:hidden bottom-0 left-0 right-0 z-30 flex h-16 pt-1 w-full items-center justify-around bg-muted"
      style={{ 
        borderTopLeftRadius: "0.375rem", 
        borderTopRightRadius: "0.375rem",
        boxShadow: "0 -4px 6px -1px rgb(0 0 0 / 0.1), 0 -2px 4px -2px rgb(0 0 0 / 0.1)",
        WebkitTransform: "translateZ(30)",
        transform: "translateZ(30)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)"
      }}
    >
      <Link
        href={`/${lang}/escorts`}
        className={getLinkClassName("/escorts") + ` ml-3`}
        prefetch={false}
        onClick={() => handleClick("/escorts")}
      >
        <Search className={`h-6 w-6 transition-transform ${isClicked("/escorts") ? "scale-90" : ""}`} />
        <span className="text-xs">Directory</span>
      </Link>
      <Link
        href={`/${lang}/jobs`}
        className={getLinkClassName("/jobs")}
        prefetch={false}
        onClick={() => handleClick("/jobs")}
      >
        <Clapperboard className={`h-6 w-6 transition-transform ${isClicked("/jobs") ? "scale-90" : ""}`} />
        <span className="text-xs">Studios</span>
      </Link>
      <Link
        href={`/${lang}/vip`}
        className={getLinkClassName("/vip")}
        prefetch={false}
        onClick={() => handleClick("/vip")}
      >
        <Camera className={`h-6 w-6 transition-transform ${isClicked("/vip") ? "scale-90" : ""}`} />
        <span className="text-xs">Creators</span>
      </Link>
      <Link
        href={`/${lang}/live`}
        className={getLinkClassName("/live")}
        prefetch={false}
        onClick={() => handleClick("/live")}
      >
        <TvMinimalPlay className={`h-6 w-6 transition-transform ${isClicked("/live") ? "scale-90" : ""}`} />
        <span className="text-xs">Live</span>
      </Link>
      <Link
        href={`/${lang}/events`}
        className={getLinkClassName("/events")}
        prefetch={false}
        onClick={() => handleClick("/events")}
      >
        <Calendar className={`h-6 w-6 transition-transform ${isClicked("/events") ? "scale-90" : ""}`} />
        <span className="text-xs">Events</span>
      </Link>
      <Link
        href={`/${lang}/dating`}
        className={getLinkClassName("/dating") + ` mr-3`}
        prefetch={false}
        onClick={() => handleClick("/dating")}
      >
        <Flame className={`h-6 w-6 transition-transform ${isClicked("/dating") ? "scale-90" : ""}`} />
        <span className="text-xs">Meet</span>
      </Link>
    </nav>
  );
}