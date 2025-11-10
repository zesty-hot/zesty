"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export function Footer() {
  const { lang } = useParams<{ lang: string }>();
  
  return (
    <footer
      className="bg-background text-sm pb-10 mt-6"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container-padding-x container mx-auto flex flex-col gap-12 lg:gap-16">
        {/* Bottom Section */}
        <div className="flex w-full flex-row justify-center items-center gap-12 lg:flex-row lg:justify-between lg:gap-6">
          {/* Copyright Text */}
          <p className="text-muted-foreground text-center lg:text-left">
            <span>Copyright © {new Date().getFullYear()}</span>{" "}
            <Link href={`/${lang}/about`} className="hover:underline">
              Zesty
            </Link>
            . All rights reserved.
          </p>

          {/* Legal Navigation */}
          <nav
            className="flex flex-col items-center gap-4 md:flex-row md:gap-8"
            aria-label="Legal links"
          >
            <Link
              href={`/${lang}/privacy`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href={`/${lang}/tos`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <a
              onClick={(e) => window.dispatchEvent(new CustomEvent('zesty-cookie-banner'))}
              className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
            >
              Cookie Settings
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
