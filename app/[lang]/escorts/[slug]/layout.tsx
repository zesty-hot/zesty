import { Metadata } from "next";
import { prisma, withRetry } from "@/lib/prisma";
import { generateMetadata as genMeta, siteConfig } from "@/lib/metadata";
import { notFound } from "next/navigation";
import { calculateAge } from "@/lib/calculate-age";

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
        title: "Profile Not Found",
        description: "The escort profile you're looking for doesn't exist.",
        noIndex: true,
      });
    }

    const ad = profile.privateAds[0];

    // Build location string
    const location = profile.suburb || "Available";

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
      : `${ad.title}. ${location ? `Located in ${location}.` : ""} ${startingPrice ? `From $${startingPrice}.` : ""
      } Book now for premium escort services.`;

    // Build title
    const titleParts = [];
    if (profile.title || ad.title) {
      titleParts.push(profile.title || ad.title);
    }
    if (age) {
      titleParts.push(`${age} Years Old`);
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
      titleParts.join(" - ") || `Verified Escort - ${location || "Available Now"}`;

    // Generate rich metadata
    return genMeta({
      title,
      description,
      image: imageUrl,
      keywords: [
        `escort ${location}`,
        `${profile.title || profile.slug} escort`,
        ...services,
        location,
        "verified escort",
        "premium companion",
        profile.gender ? `${profile.gender.toLowerCase()} escort` : "",
        profile.bodyType
          ? `${profile.bodyType.toLowerCase()} escort`
          : "",
      ].filter(Boolean),
      canonical: `${siteConfig.url}/${lang}/escorts/${slug}`,
    });
  } catch (error) {
    console.error("Error generating escort metadata:", error);
    return genMeta({
      title: "Escort Profile",
      description: "View verified escort profiles and services.",
      noIndex: true,
    });
  }
}

export default function EscortSlugLayout({ children }: Props) {
  return <>{children}</>;
}
