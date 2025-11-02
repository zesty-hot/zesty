import { Camera, Clapperboard, Flame, Popcorn, Search, TvMinimalPlay } from "lucide-react";
import Link from "next/link";

export default function MobileNav() {
  return (
          <nav
        className="fixed lg:hidden bottom-0 left-0 right-0 z-50 flex h-16 pt-1 w-full items-center justify-around bg-muted shadow-t"
        // debug: inline radius to test whether CSS utility is being applied/overridden
        style={{ borderTopLeftRadius: "0.375rem", borderTopRightRadius: "0.375rem" }}
      >
        <Link
          href="#"
          className="flex flex-col items-center justify-center gap-1 text-gray-500 transition-colors hover:text-gray-900 focus:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 dark:focus:text-gray-50"
          prefetch={false}
        >
          <Search className="h-6 w-6" />
          <span className="text-xs">Directory</span>
        </Link>
        <Link
          href="#"
          className="flex flex-col items-center justify-center gap-1 text-gray-500 transition-colors hover:text-gray-900 focus:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 dark:focus:text-gray-50"
          prefetch={false}
        >
          <Clapperboard className="h-6 w-6" />
          <span className="text-xs">Studios</span>
        </Link>
        <Link
          href="#"
          className="flex flex-col items-center justify-center gap-1 text-gray-500 transition-colors hover:text-gray-900 focus:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 dark:focus:text-gray-50"
          prefetch={false}
        >
          <Camera className="h-6 w-6" />
          <span className="text-xs">Creators</span>
        </Link>
        <Link
          href="#"
          className="flex flex-col items-center justify-center gap-1 text-gray-500 transition-colors hover:text-gray-900 focus:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 dark:focus:text-gray-50"
          prefetch={false}
        >
          <TvMinimalPlay className="h-6 w-6" />
          <span className="text-xs">Live</span>
        </Link>
        <Link
          href="#"
          className="flex flex-col items-center justify-center gap-1 text-gray-500 transition-colors hover:text-gray-900 focus:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 dark:focus:text-gray-50"
          prefetch={false}
        >
          <Flame className="h-6 w-6" />
          <span className="text-xs">Meet</span>
        </Link>
      </nav>
  );
}