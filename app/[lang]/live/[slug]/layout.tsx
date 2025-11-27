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
 * Generate dynamic metadata for live stream pages
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lang } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const siteConfig = getSiteConfig({ lang: lang as Locale });
  const dictionary = getDictionary(lang as Locale);
  const liveDict = dictionary?.metadata?.live || {};

  try {
    // Fetch the live stream page data
    const streamPage = await withRetry(() =>
      prisma.liveStreamPage.findFirst({
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
          streams: {
            where: {
              isLive: true,
            },
            take: 1,
            select: {
              title: true,
              viewerCount: true,
            },
          },
          _count: {
            select: {
              followers: true,
            },
          },
        },
      })
    );

    // If stream page doesn't exist, return basic metadata from translations or site defaults
    if (!streamPage) {
      return genMeta({
        title: liveDict.not_found_title ?? siteConfig.title,
        description: liveDict.not_found_description ?? siteConfig.description,
        noIndex: true,
      });
    }

    // Get age if available
    const age = streamPage.user.dob ? calculateAge(streamPage.user.dob) : null;

    // Check if currently live
    const isLive = streamPage.streams.length > 0;
    const currentStream = streamPage.streams[0];

    // Build location string
    const location = streamPage.user.suburb || "";

    // Get image
    const imageUrl =
      streamPage.bannerUrl ||
      streamPage.user.images[0]?.url ||
      `${siteConfig.url}/default-live.jpg`;

    // Truncate description
    const liveNowLabel = liveDict.live_now_label ?? "";
    const viewersText = liveDict.viewers_text ?? "";
    const liveStatus = isLive
      ? `${liveNowLabel ? `${liveNowLabel} ` : ""}${currentStream.viewerCount} ${viewersText ? `${viewersText}` : ""}${currentStream.title ? ` "${currentStream.title}"` : ""}`.trim()
      : "";

    const description = liveStatus
      ? `${liveStatus} ${streamPage.description ? streamPage.description.substring(0, 100) : ""}`.trim()
      : streamPage.description
        ? streamPage.description.length > 155
          ? `${streamPage.description.substring(0, 152)}...`
          : streamPage.description
        : streamPage.user.bio
          ? streamPage.user.bio.length > 155
            ? `${streamPage.user.bio.substring(0, 152)}...`
            : streamPage.user.bio
          : (() => {
            const channelFrom = liveDict.channel_from ?? "";
            const followersLabel = liveDict.followers_label ?? "";
            const callToAction = liveDict.call_to_action ?? "";
            const subject = streamPage.user.title || streamPage.user.slug;
            const parts: string[] = [];
            parts.push(channelFrom ? `${channelFrom} ${subject}.` : `${subject}`);
            if (typeof streamPage._count?.followers === 'number' && followersLabel) parts.push(`${streamPage._count.followers} ${followersLabel}`);
            if (callToAction) parts.push(callToAction);
            return parts.filter(Boolean).join(' ');
          })();

    // Build title
    const titleParts = [];
    if (isLive) {
      titleParts.push(liveDict.live_prefix ?? "");
    }
    titleParts.push(streamPage.user.title || streamPage.user.slug);
    if (age) {
      titleParts.push(`${age}`);
    }
    if (location) {
      titleParts.push(`in ${location}`);
    }
    titleParts.push(liveDict.stream_label ?? siteConfig.name);

    const title = titleParts.join(" - ");

    // Build keywords from translations + dynamic pieces
    const baseKeywords: string[] = liveDict.keywords ?? [];
    const templates = liveDict.templates ?? {};
    const dynamicKeywords = [
      templates.slug_live ? templates.slug_live.replace('{slug}', streamPage.user.slug) : streamPage.user.slug,
      templates.title_webcam ? templates.title_webcam.replace('{title}', streamPage.user.title || streamPage.user.slug) : (streamPage.user.title || streamPage.user.slug),
      isLive ? (liveDict.live_now_keyword ?? '') : (liveDict.live_streaming_keyword ?? ''),
      location && templates.location_webcam ? templates.location_webcam.replace('{location}', location) : location ? `${location}` : '',
    ].filter(Boolean);

    return genMeta({
      title,
      description,
      image: imageUrl,
      keywords: [...baseKeywords, ...dynamicKeywords].filter(Boolean),
      canonical: `${siteConfig.url}/${lang}/live/${slug}`,
    });
  } catch (error) {
    console.error("Error generating live stream metadata:", error);
    return genMeta({
      title: liveDict.default_title ?? siteConfig.title,
      description: liveDict.default_description ?? siteConfig.description,
      noIndex: true,
    });
  }
}

export default function LiveSlugLayout({ children }: Props) {
  return <>{children}</>;
}
