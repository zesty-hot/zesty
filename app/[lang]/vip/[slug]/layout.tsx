import { Metadata } from "next";
import { prisma, withRetry } from "@/lib/prisma";
import { generateMetadata as genMeta, siteConfig } from "@/lib/metadata";
import { calculateAge } from "@/lib/calculate-age";

type Props = {
  params: Promise<{ slug: string; lang: string }>;
  children: React.ReactNode;
};

/**
 * Generate dynamic metadata for VIP creator pages
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lang } = await params;
  
  try {
    // Fetch the VIP page data
    const vipPage = await withRetry(() =>
      prisma.vIPPage.findFirst({
        where: {
          active: true,
          user: {
            slug: slug,
          },
        },
        select: {
          id: true,
          description: true,
          bannerUrl: true,
          subscriptionPrice: true,
          isFree: true,
          user: {
            select: {
              slug: true,
              title: true,
              bio: true,
              suburb: true,
              dob: true,
              verified: true,
              images: {
                where: { default: true },
                take: 1,
                select: { url: true },
              },
            },
          },
          _count: {
            select: {
              content: true,
              subscriptions: {
                where: {
                  active: true,
                },
              },
            },
          },
        },
      })
    );

    // If VIP page doesn't exist, return basic metadata
    if (!vipPage) {
      return genMeta({
        title: "VIP Page Not Found",
        description: "The VIP creator page you're looking for doesn't exist.",
        noIndex: true,
      });
    }

    // Get age if available
    const age = vipPage.user.dob ? calculateAge(vipPage.user.dob) : null;

    // Build location string
    const location = vipPage.user.suburb || "";

    // Get image
    const imageUrl =
      vipPage.bannerUrl ||
      vipPage.user.images[0]?.url ||
      `${siteConfig.url}/default-vip.jpg`;

    // Truncate description
    const description = vipPage.description
      ? vipPage.description.length > 155
        ? `${vipPage.description.substring(0, 152)}...`
        : vipPage.description
      : vipPage.user.bio
      ? vipPage.user.bio.length > 155
        ? `${vipPage.user.bio.substring(0, 152)}...`
        : vipPage.user.bio
      : `Exclusive VIP content from ${vipPage.user.title || vipPage.user.slug}. ${
          vipPage.isFree
            ? "Free to follow!"
            : `Subscribe for $${(vipPage.subscriptionPrice / 100).toFixed(2)}/month.`
        } ${vipPage._count.content} posts available.`;

    // Build title
    const titleParts = [vipPage.user.title || vipPage.user.slug, "VIP Content"];
    if (age) {
      titleParts.splice(1, 0, `${age}`);
    }
    if (location) {
      titleParts.push(`from ${location}`);
    }

    const title = titleParts.join(" - ");

    // Generate rich metadata
    return genMeta({
      title,
      description,
      image: imageUrl,
      keywords: [
        `${vipPage.user.slug} VIP`,
        `${vipPage.user.title || vipPage.user.slug} exclusive content`,
        "VIP content",
        "premium content",
        "exclusive access",
        "adult content creator",
        location ? `${location} content creator` : "",
        vipPage.isFree ? "free content" : "subscription content",
      ].filter(Boolean),
      canonical: `${siteConfig.url}/${lang}/vip/${slug}`,
    });
  } catch (error) {
    console.error("Error generating VIP metadata:", error);
    return genMeta({
      title: "VIP Creator Page",
      description: "Explore exclusive VIP content and premium experiences.",
      noIndex: true,
    });
  }
}

export default function VIPSlugLayout({ children }: Props) {
  return <>{children}</>;
}
