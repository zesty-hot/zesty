import { Metadata } from "next";
import { prisma, withRetry } from "@/lib/prisma";
import { generateMetadata as genMeta, getSiteConfig } from "@/lib/metadata";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { notFound } from "next/navigation";
import { calculateAge } from "@/lib/calculate-age";
import { Locale } from "@/lib/i18n/config";

type Props = {
  params: Promise<{ slug: string; lang: string }>;
  children: React.ReactNode;
};

/**
 * Generate dynamic metadata for escort profiles
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lang } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const siteConfig = getSiteConfig({ lang: lang as Locale });
  const dictionary = getDictionary(lang as Locale);
  const escortsDict = dictionary?.metadata?.escorts || {};

  try {
    // Fetch the escort profile data
    const profile = await withRetry(() =>
      prisma.user.findUnique({
        where: { slug: decodedSlug },
        select: {
          zesty_id: true,
          slug: true,
          title: true,
          bio: true,
          dob: true,
          suburb: true,
          verified: true,
          gender: true,
          bodyType: true,
          race: true,
          images: {
            where: { default: true },
            take: 1,
            select: { url: true },
          },
          privateAds: {
            where: { active: true },
            take: 1,
            select: {
              title: true,
              description: true,
              services: {
                select: {
                  category: true,
                  options: {
                    select: {
                      price: true,
                    },
                    orderBy: {
                      price: "asc",
                    },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      })
    );

    // If profile doesn't exist or has no active ads, return basic metadata
    if (!profile || profile.privateAds.length === 0) {
      return genMeta({
        title: escortsDict.not_found_title || "Profile Not Found",
        description: escortsDict.not_found_description || "The escort profile you're looking for doesn't exist.",
        noIndex: true,
      });
    }

    const ad = profile.privateAds[0];

    // Build location string
    const location = profile.suburb || escortsDict.available_label || "Available";

    // Get services for keywords
    const services = ad.services.map((s) =>
      s.category
        .split("_")
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ")
    );

    // Get age if available
    const age = profile.dob ? calculateAge(profile.dob) : null;

    // Get starting price
    const startingPrice = ad.services
      .flatMap((s) => s.options)
      .sort((a, b) => a.price - b.price)[0]?.price;

    // Get first image or use default
    const imageUrl =
      profile.images[0]?.url || `${siteConfig.url}/default-profile.jpg`;

    // Truncate description to appropriate length
    const description = ad.description
      ? ad.description.length > 155
        ? `${ad.description.substring(0, 152)}...`
        : ad.description
      : `${ad.title}. ${location ? `${escortsDict.located_in_label || 'Located in'} ${location}.` : ""} ${startingPrice ? `From $${startingPrice}.` : ""
      } ${escortsDict.booking_call_to_action || 'Book now for premium escort services.'}`;

    // Build title
    const titleParts = [];
    if (profile.title || ad.title) {
      titleParts.push(profile.title || ad.title);
    }
    if (age) {
      titleParts.push(`${age} ${escortsDict.years_old_label || 'Years Old'}`);
    }
    if (profile.gender) {
      titleParts.push(
        profile.gender.charAt(0) + profile.gender.slice(1).toLowerCase()
      );
    }
    if (location) {
      titleParts.push(`in ${location}`);
    }

    const title =
      titleParts.join(" - ") || `${escortsDict.verified_escort_prefix || 'Verified Escort -'} ${location || "Available Now"}`;

    // Build keywords from translations + dynamic pieces
    const baseKeywords: string[] = escortsDict.keywords || [];
    const templates = escortsDict.keyword_templates || {};
    const dynamicKeywords = [
      templates.profile_escort ? templates.profile_escort.replace('{name}', profile.title || profile.slug) : `${profile.title || profile.slug} escort`,
      templates.by_location ? templates.by_location.replace('{location}', location) : `escort ${location}`,
      ...services,
      location || "",
      templates.verified_escort || 'verified escort',
      templates.premium_companion || 'premium companion',
      profile.gender ? (templates.gender_escort ? templates.gender_escort.replace('{gender}', profile.gender.toLowerCase()) : `${profile.gender.toLowerCase()} escort`) : '',
      profile.bodyType ? (templates.bodytype_escort ? templates.bodytype_escort.replace('{bodyType}', profile.bodyType.toLowerCase()) : `${profile.bodyType.toLowerCase()} escort`) : '',
    ].filter(Boolean);

    return genMeta({
      title,
      description,
      image: imageUrl,
      keywords: [...baseKeywords, ...dynamicKeywords].filter(Boolean),
      canonical: `${siteConfig.url}/${lang}/escorts/${slug}`,
    });
  } catch (error) {
    console.error("Error generating escort metadata:", error);
    return genMeta({
      title: escortsDict.default_title || "Escort Profile",
      description: escortsDict.default_description || "View verified escort profiles and services.",
      noIndex: true,
    });
  }
}

export default function EscortSlugLayout({ children }: Props) {
  return <>{children}</>;
}
