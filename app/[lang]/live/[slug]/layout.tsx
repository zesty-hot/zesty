import { Metadata } from "next";
import { prisma, withRetry } from "@/lib/prisma";
import { generateMetadata as genMeta, siteConfig } from "@/lib/metadata";
import { calculateAge } from "@/lib/calculate-age";

type Props = {
  params: Promise<{ slug: string; lang: string }>;
  children: React.ReactNode;
};

/**
 * Generate dynamic metadata for live stream pages
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lang } = await params;
  
  try {
    // Fetch the live stream page data
    const streamPage = await withRetry(() =>
      prisma.liveStreamPage.findFirst({
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

    // If stream page doesn't exist, return basic metadata
    if (!streamPage) {
      return genMeta({
        title: "Live Stream Not Found",
        description: "The live stream channel you're looking for doesn't exist.",
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
    const liveStatus = isLive
      ? `🔴 LIVE NOW - ${currentStream.viewerCount} viewers! ${
          currentStream.title ? `"${currentStream.title}"` : ""
        }`
      : "";

    const description = liveStatus
      ? `${liveStatus} ${
          streamPage.description
            ? streamPage.description.substring(0, 100)
            : ""
        }`
      : streamPage.description
      ? streamPage.description.length > 155
        ? `${streamPage.description.substring(0, 152)}...`
        : streamPage.description
      : streamPage.user.bio
      ? streamPage.user.bio.length > 155
        ? `${streamPage.user.bio.substring(0, 152)}...`
        : streamPage.user.bio
      : `Live streams from ${streamPage.user.title || streamPage.user.slug}. ${
          streamPage._count.followers
        } followers. Watch live adult entertainment now!`;

    // Build title
    const titleParts = [];
    if (isLive) {
      titleParts.push("🔴 LIVE");
    }
    titleParts.push(streamPage.user.title || streamPage.user.slug);
    if (age) {
      titleParts.push(`${age}`);
    }
    if (location) {
      titleParts.push(`in ${location}`);
    }
    titleParts.push("Live Stream");

    const title = titleParts.join(" - ");

    // Generate rich metadata
    return genMeta({
      title,
      description,
      image: imageUrl,
      keywords: [
        `${streamPage.user.slug} live stream`,
        `${streamPage.user.title || streamPage.user.slug} webcam`,
        isLive ? "live now" : "live streaming",
        "adult live stream",
        "webcam show",
        "live entertainment",
        location ? `${location} webcam` : "",
        "real-time streaming",
      ].filter(Boolean),
      canonical: `${siteConfig.url}/${lang}/live/${slug}`,
    });
  } catch (error) {
    console.error("Error generating live stream metadata:", error);
    return genMeta({
      title: "Live Stream Channel",
      description: "Watch live adult entertainment and interact with performers.",
      noIndex: true,
    });
  }
}

export default function LiveSlugLayout({ children }: Props) {
  return <>{children}</>;
}
