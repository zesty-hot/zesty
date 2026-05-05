import { Metadata } from "next";
import { prisma, withRetry } from "@/lib/prisma";
import { generateMetadata as genMeta, getSiteConfig } from "@/lib/metadata";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { calculateAge } from "@/lib/calculate-age";
import { Locale } from "@/lib/i18n/config";

type Props = {
  params: Promise<{ slug: string; lang: string }>;
  children: React.ReactNode;
};

/**
 * Generate dynamic metadata for VIP creator pages
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lang } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const siteConfig = getSiteConfig({ lang: lang as Locale });
  const dictionary = getDictionary(lang as Locale);
  const vipDict = dictionary?.metadata?.vip || {};

  try {
    // Fetch the VIP page data
    const vipPage = await withRetry(() =>
      prisma.vIPPage.findFirst({
        where: {
          active: true,
          user: {
            slug: decodedSlug,
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

    // If VIP page doesn't exist, return basic metadata (use translations or site defaults)
    if (!vipPage) {
      return genMeta({
        title: vipDict.not_found_title ?? siteConfig.title,
        description: vipDict.not_found_description ?? siteConfig.description,
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
        : (() => {
            const exclusiveLabel = vipDict.exclusive_from_label ?? "";
            const subject = vipPage.user.title || vipPage.user.slug;
            const freeLabel = vipDict.free_to_follow_label ?? "";
            const subscribePrefix = vipDict.subscribe_prefix ?? "";
            const postsSuffix = vipDict.posts_available_suffix ?? "";

            const priceText = vipPage.isFree
              ? freeLabel
              : subscribePrefix
                ? `${subscribePrefix} $${(vipPage.subscriptionPrice / 100).toFixed(2)}/month.`
                : "";

            const parts = [exclusiveLabel ? `${exclusiveLabel} ${subject}.` : `${subject}`];
            if (priceText) parts.push(priceText);
            if (typeof vipPage._count?.content === 'number' && postsSuffix) parts.push(`${vipPage._count.content} ${postsSuffix}`);
            return parts.filter(Boolean).join(" ");
          })();

    // Build title
    const titleParts = [vipPage.user.title || vipPage.user.slug, vipDict.vip_content_label ?? siteConfig.name];
    if (age) {
      titleParts.splice(1, 0, `${age}`);
    }
    if (location) {
      const fromLabel = vipDict.from_label ?? "";
      titleParts.push(fromLabel ? `${fromLabel} ${location}` : `${location}`);
    }

    const title = titleParts.join(" - ");

    // Build keywords from translations + dynamic pieces
    const baseKeywords: string[] = vipDict.keywords ?? [];
    const templates = vipDict.keyword_templates ?? {};
    const dynamicKeywords = [
      templates.vip_by_name ? templates.vip_by_name.replace('{name}', vipPage.user.slug) : vipPage.user.slug,
      templates.exclusive_by_name ? templates.exclusive_by_name.replace('{name}', vipPage.user.title || vipPage.user.slug) : (vipPage.user.title || vipPage.user.slug),
      ...(baseKeywords || []),
      templates.location_content_creator && location ? templates.location_content_creator.replace('{location}', location) : location ? `${location}` : "",
      vipPage.isFree ? (templates.free_content ?? vipDict.free_to_follow_label ?? "") : (templates.subscription_content ?? (vipDict.subscribe_prefix ? `${vipDict.subscribe_prefix} $${(vipPage.subscriptionPrice / 100).toFixed(2)}/month` : "")),
    ].filter(Boolean);

    return genMeta({
      title,
      description,
      image: imageUrl,
      keywords: dynamicKeywords,
      canonical: `${siteConfig.url}/${lang}/vip/${slug}`,
    });
    } catch (error) {
      console.error("Error generating VIP metadata:", error);
      return genMeta({
        title: vipDict.default_title ?? siteConfig.title,
        description: vipDict.default_description ?? siteConfig.description,
        noIndex: true,
      });
    }
}

export default function VIPSlugLayout({ children }: Props) {
  return <>{children}</>;
}
