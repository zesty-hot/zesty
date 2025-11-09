"use client";

import { Calendar, Camera, Clapperboard, Flame, Mail, Search, TvMinimalPlay } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { UnreadMessagesBadge } from "@/components/unread-messages-badge";
import { useSession } from "next-auth/react";

export default function MobileNav() {
  const { lang } = useParams();
  const pathname = usePathname();
  const [clickedPath, setClickedPath] = useState<string | null>(null);
  const { data: session } = useSession();

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
    const clicked = isClicked(path) ? "scale-120 opacity-70" : "";
    const activeScale = isActive(path) ? "font-semibold scale-110" : "";

    return `${base} ${active} ${hover} ${clicked} ${activeScale}`;
  };

  return (
    <nav
      id="mobile-nav"
      className="fixed min-h-16 lg:hidden bottom-0 left-0 right-0 z-30 flex w-full items-center justify-around bg-muted"
      style={{
        borderTopLeftRadius: "0.375rem",
        borderTopRightRadius: "0.375rem",
        boxShadow: "0 -4px 6px -1px rgb(0 0 0 / 0.1), 0 -2px 4px -2px rgb(0 0 0 / 0.1)",
        WebkitTransform: "translateZ(30)",
        transform: "translateZ(30)",
        paddingBottom: "max(env(safe-area-inset-bottom, 0.5rem), 0.75rem)",
        paddingTop: "0.5rem"
      }}
    >
      <Link
        href={`/${lang}/escorts`}
        className={getLinkClassName("/escorts") + ` ml-3`}
        prefetch={false}
        onClick={() => handleClick("/escorts")}
        suppressHydrationWarning
      >
        <Search className={`h-6 w-6`} />
        <span className="text-xs">Directory</span>
      </Link>
      <Link
        href={`/${lang}/jobs`}
        className={getLinkClassName("/jobs")}
        prefetch={false}
        onClick={() => handleClick("/jobs")}
        suppressHydrationWarning
      >
        <Clapperboard className={`h-6 w-6`} />
        <span className="text-xs">Studios</span>
      </Link>
      <Link
        href={`/${lang}/vip`}
        className={getLinkClassName("/vip")}
        prefetch={false}
        onClick={() => handleClick("/vip")}
        suppressHydrationWarning
      >
        <Camera className={`h-6 w-6`} />
        <span className="text-xs">Creators</span>
      </Link>
      <Link
        href={`/${lang}/live`}
        className={getLinkClassName("/live")}
        prefetch={false}
        onClick={() => handleClick("/live")}
        suppressHydrationWarning
      >
        <TvMinimalPlay className={`h-6 w-6`} />
        <span className="text-xs">Live</span>
      </Link>
      <Link
        href={`/${lang}/events`}
        className={getLinkClassName("/events")}
        prefetch={false}
        onClick={() => handleClick("/events")}
        suppressHydrationWarning
      >
        <Calendar className={`h-6 w-6`} />
        <span className="text-xs">Events</span>
      </Link>
      <Link
        href={`/${lang}/dating`}
        className={getLinkClassName("/dating") + ` mr-3`}
        prefetch={false}
        onClick={() => handleClick("/dating")}
        suppressHydrationWarning
      >
        <Flame className={`h-6 w-6`} />
        <span className="text-xs">Meet</span>
      </Link>
    </nav>

  );
}