import type { Metadata } from "next";

/**
 * Site configuration for SEO and metadata
 * Inspired by best practices from similar platforms:
 * - AdultFriendFinder, Ashley Madison (dating focus)
 * - Skokka, EscortsAndBabes, Escortify, Tryst (escort directories)
 */

export const siteConfig = {
  name: "Zesty",
  title: "Zesty - Adult Dating, Escorts & Entertainment Services",
  description:
    "Connect with verified escorts, dating partners, and adult entertainment. Premium adult services directory featuring live streams, events, VIP experiences, and professional opportunities.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://zesty.com",
  ogImage: "/og-image.jpg",
  keywords: [
    "adult dating",
    "escort services",
    "verified escorts",
    "adult entertainment",
    "hookup sites",
    "casual dating",
    "adult personals",
    "companion services",
    "live adult streams",
    "adult events",
    "VIP experiences",
    "premium escorts",
    "adult classifieds",
    "dating hookups",
    "adult meet ups",
  ],
  locale: "en_US",
  type: "website",
  // Social media handles (update with your actual handles)
  social: {
    twitter: "@zesty",
    instagram: "@zesty",
  },
};

/**
 * Default metadata configuration
 * Use this as the base for all pages, then override specific fields as needed
 */
export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Open Graph metadata for social sharing
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - Adult Dating & Entertainment`,
      },
    ],
  },
  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.social.twitter,
  },
  // Robots directives - important for adult content
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Verification tags (add your actual verification codes)
  verification: {
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  // Category for app stores and directories
  category: "adult entertainment",
  // Alternate languages (expand based on your i18n setup)
  alternates: {
    canonical: siteConfig.url,
    languages: {
      "en-US": `${siteConfig.url}/en`,
      "es-ES": `${siteConfig.url}/es`,
      "fr-FR": `${siteConfig.url}/fr`,
      "de-DE": `${siteConfig.url}/de`,
    },
  },
  // App-specific metadata for mobile
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteConfig.name,
    startupImage: [
      {
        url: "/splash-screen.png",
        media: "(device-width: 375px) and (device-height: 812px)",
      },
    ],
  },
  // Other metadata
  other: {
    // Age restriction (important for adult content)
    rating: "adult",
    // Content rating
    "content-rating": "RTA-5042-1996-1400-1577-RTA",
  },
};

/**
 * Generate metadata for specific pages
 * @param config - Page-specific metadata overrides
 * @returns Complete metadata object
 */
export function generateMetadata(config: {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string[];
  noIndex?: boolean;
  canonical?: string;
}): Metadata {
  const { title, description, image, keywords, noIndex, canonical } = config;

  return {
    ...defaultMetadata,
    ...(title && {
      title,
      openGraph: {
        ...defaultMetadata.openGraph,
        title,
      },
      twitter: {
        ...defaultMetadata.twitter,
        title,
      },
    }),
    ...(description && {
      description,
      openGraph: {
        ...defaultMetadata.openGraph,
        description,
      },
      twitter: {
        ...defaultMetadata.twitter,
        description,
      },
    }),
    ...(image && {
      openGraph: {
        ...defaultMetadata.openGraph,
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: title || siteConfig.title,
          },
        ],
      },
      twitter: {
        ...defaultMetadata.twitter,
        images: [image],
      },
    }),
    ...(keywords && {
      keywords: [...siteConfig.keywords, ...keywords],
    }),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
        nocache: true,
      },
    }),
    ...(canonical && {
      alternates: {
        ...defaultMetadata.alternates,
        canonical,
      },
    }),
  };
}

/**
 * Escort directory page metadata
 */
export const escortsMetadata: Metadata = generateMetadata({
  title: "Verified Escorts Directory - Premium Companion Services",
  description:
    "Browse verified escorts and premium companions in your area. Professional, discreet, and safe adult services with reviews, photos, and instant booking.",
  keywords: [
    "verified escorts",
    "escort directory",
    "companions",
    "call girls",
    "escort reviews",
    "premium escorts",
  ],
});

/**
 * Dating page metadata
 */
export const datingMetadata: Metadata = generateMetadata({
  title: "Adult Dating & Hookups - Meet Singles Near You",
  description:
    "Join thousands of singles for casual dating, hookups, and adult encounters. Create your profile, browse matches, and connect with like-minded people tonight.",
  keywords: [
    "adult dating",
    "casual hookups",
    "meet singles",
    "dating app",
    "adult personals",
    "hookup site",
  ],
});

/**
 * Live streaming page metadata
 */
export const liveMetadata: Metadata = generateMetadata({
  title: "Live Adult Entertainment - Watch & Interact Now",
  description:
    "Watch live adult streams, interact with performers, and enjoy exclusive VIP content. Premium HD streaming with private shows and chat features.",
  keywords: [
    "live adult streams",
    "webcam shows",
    "live entertainment",
    "adult performers",
    "private shows",
    "cam shows",
  ],
});

/**
 * Events page metadata
 */
export const eventsMetadata: Metadata = generateMetadata({
  title: "Adult Events & Parties - Exclusive Entertainment",
  description:
    "Discover exclusive adult events, parties, and social gatherings. Connect with the community at premium venues and special occasions.",
  keywords: [
    "adult events",
    "adult parties",
    "swingers events",
    "adult social",
    "lifestyle events",
  ],
});

/**
 * VIP page metadata
 */
export const vipMetadata: Metadata = generateMetadata({
  title: "VIP Premium Content - Exclusive Adult Entertainment",
  description:
    "Access exclusive VIP content, premium features, and elite experiences. Join our VIP community for the ultimate adult entertainment.",
  keywords: [
    "VIP content",
    "premium access",
    "exclusive content",
    "VIP membership",
    "elite entertainment",
  ],
});

/**
 * Jobs page metadata
 */
export const jobsMetadata: Metadata = generateMetadata({
  title: "Adult Industry Jobs - Opportunities for Performers & Studios",
  description:
    "Find opportunities in the adult entertainment industry. Jobs for performers, models, content creators, and studio positions.",
  keywords: [
    "adult industry jobs",
    "performer opportunities",
    "model jobs",
    "studio positions",
    "adult entertainment careers",
  ],
});

/**
 * Generate structured data for SEO (JSON-LD)
 * Use this for rich snippets in search results
 */
export function generateStructuredData(type: "WebSite" | "Organization") {
  if (type === "WebSite") {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.name,
      description: siteConfig.description,
      url: siteConfig.url,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    };
  }

  if (type === "Organization") {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: `${siteConfig.url}/logo.png`,
      description: siteConfig.description,
      sameAs: [
        `https://twitter.com/${siteConfig.social.twitter.replace("@", "")}`,
        `https://instagram.com/${siteConfig.social.instagram.replace("@", "")}`,
      ],
    };
  }
}
