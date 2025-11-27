import type { Metadata } from "next";
import { getDictionary } from '@/lib/i18n/dictionaries';
import { defaultLocale, Locale, locales } from "./i18n/config";

/**
 * Site configuration for SEO and metadata
 * Inspired by best practices from similar platforms:
 * - AdultFriendFinder, Ashley Madison (dating focus)
 * - Skokka, EscortsAndBabes, Escortify, Tryst (escort directories)
 */

export const getSiteConfig = ({ lang }: { lang: Locale }) => {
  const dictionary = getDictionary(lang);
  return {
    name: dictionary.metadata.site.name,
    title: dictionary.metadata.site.title,
    description: dictionary.metadata.site.description,
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://zesty.hot",
    ogImage: "/og-image.png",
    keywords: dictionary.metadata.site.keywords,
    locale: dictionary.metadata.site.locale,
    type: "website",
    social: {
      twitter: dictionary.metadata.site.social.twitter,
      instagram: dictionary.metadata.site.social.instagram,
    },
    openGraph: {
      images: {
        alt: dictionary.metadata.openGraph.images.alt,
      },
    },
  };
}

const siteConfig = getSiteConfig({ lang: defaultLocale }); // English default

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
        alt: `${siteConfig.name} - ${siteConfig.openGraph.images.alt}`,
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
    // Build alternates.languages from the supported locales so keys match our locale codes
    // and values point at the locale root path (e.g. https://example.com/en)
    languages: Object.fromEntries(locales.map((l) => [l, `${siteConfig.url}/${l}`])) as Record<string, string>,
  },
  // App-specific metadata for mobile
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteConfig.name,
    // startupImage: [
    //   {
    //     url: "/splash-screen.png",
    //     media: "(device-width: 375px) and (device-height: 812px)",
    //   },
    // ],
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
export const getEscortsMetadata = ({ lang }: { lang: Locale }): Metadata => {
  const dictionary = getDictionary(lang);
  return {
    title: dictionary.metadata.escorts.title,
    description: dictionary.metadata.escorts.description,
    keywords: dictionary.metadata.escorts.keywords,
  }
}

/**
 * Dating page metadata
 */
export const getDatingMetadata = ({ lang }: { lang: Locale }): Metadata => {
  const dictionary = getDictionary(lang);
  return {
    title: dictionary.metadata.dating.title,
    description: dictionary.metadata.dating.description,
    keywords: dictionary.metadata.dating.keywords,
  }
}

/**
 * Live streaming page metadata
 */
export const getLiveMetadata = ({ lang }: { lang: Locale }): Metadata => {
  const dictionary = getDictionary(lang);
  return {
    title: dictionary.metadata.live.title,
    description: dictionary.metadata.live.description,
    keywords: dictionary.metadata.live.keywords,
  }
}

/**
 * Events page metadata
 */
export const getEventsMetadata = ({ lang }: { lang: Locale }): Metadata => {
  const dictionary = getDictionary(lang);
  return {
    title: dictionary.metadata.events.title,
    description: dictionary.metadata.events.description,
    keywords: dictionary.metadata.events.keywords,
  }
}

/**
 * VIP page metadata
 */
export const getVipMetadata = ({ lang }: { lang: Locale }): Metadata => {
  const dictionary = getDictionary(lang);
  return {
    title: dictionary.metadata.vip.title,
    description: dictionary.metadata.vip.description,
    keywords: dictionary.metadata.vip.keywords,
  }
}

/**
 * Jobs page metadata
 */
export const getJobsMetadata = ({ lang }: { lang: Locale }): Metadata => {
  const dictionary = getDictionary(lang);
  return {
    title: dictionary.metadata.jobs.title,
    description: dictionary.metadata.jobs.description,
    keywords: dictionary.metadata.jobs.keywords,
  }
}

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
        `https://x.com/${siteConfig.social.twitter.replace("@", "")}`,
        `https://instagram.com/${siteConfig.social.instagram.replace("@", "")}`,
      ],
    };
  }
}
