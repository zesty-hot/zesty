import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/metadata";
import { prisma, withRetry } from "@/lib/prisma";

// Revalidate sitemap every 24 hours (86400 seconds)
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/en/escorts`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en/dating`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en/live`,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en/events`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/en/jobs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/en/vip`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/en/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Add other language versions
  const languages = ["es", "fr", "de"];
  const languagePages: MetadataRoute.Sitemap = languages.flatMap((lang) => [
    {
      url: `${baseUrl}/${lang}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/${lang}/escorts`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/${lang}/dating`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/${lang}/live`,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.8,
    },
  ]);

  try {
    // Fetch dynamic escort profiles
    const escorts = await withRetry(() =>
      prisma.user.findMany({
        where: {
          privateAds: {
            some: {
              active: true,
            },
          },
          slug: {
            not: null,
          },
        },
        select: {
          slug: true,
          lastActive: true,
        },
        take: 1000, // Limit to top 1000 escorts
        orderBy: {
          lastActive: "desc",
        },
      })
    );

    const escortPages: MetadataRoute.Sitemap = escorts.flatMap((escort) =>
      ["en", "es", "fr", "de"].map((lang) => ({
        url: `${baseUrl}/${lang}/escorts/${escort.slug}`,
        lastModified: escort.lastActive || new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
    );

    // Fetch dynamic VIP pages
    const vipPages = await withRetry(() =>
      prisma.vIPPage.findMany({
        where: {
          active: true,
          user: {
            slug: {
              not: null,
            },
          },
        },
        select: {
          user: {
            select: {
              slug: true,
            },
          },
          updatedAt: true,
        },
        take: 500, // Limit to top 500 VIP pages
        orderBy: {
          updatedAt: "desc",
        },
      })
    );

    const vipPageEntries: MetadataRoute.Sitemap = vipPages.flatMap((page) =>
      ["en", "es", "fr", "de"].map((lang) => ({
        url: `${baseUrl}/${lang}/vip/${page.user.slug}`,
        lastModified: page.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.7,
      }))
    );

    // Fetch dynamic live stream pages
    const livePages = await withRetry(() =>
      prisma.liveStreamPage.findMany({
        where: {
          active: true,
          user: {
            slug: {
              not: null,
            },
          },
        },
        select: {
          user: {
            select: {
              slug: true,
              lastActive: true,
            },
          },
          updatedAt: true,
        },
        take: 500,
        orderBy: {
          updatedAt: "desc",
        },
      })
    );

    const livePageEntries: MetadataRoute.Sitemap = livePages.flatMap((page) =>
      ["en", "es", "fr", "de"].map((lang) => ({
        url: `${baseUrl}/${lang}/live/${page.user.slug}`,
        lastModified: page.user.lastActive || page.updatedAt,
        changeFrequency: "hourly" as const,
        priority: 0.8,
      }))
    );

    // Fetch dynamic events
    const events = await withRetry(() =>
      prisma.event.findMany({
        where: {
          status: "OPEN",
          startTime: {
            gte: new Date(), // Only include upcoming events
          },
        },
        select: {
          slug: true,
          updatedAt: true,
        },
        take: 500,
        orderBy: {
          startTime: "asc",
        },
      })
    );

    const eventPages: MetadataRoute.Sitemap = events.flatMap((event) =>
      ["en", "es", "fr", "de"].map((lang) => ({
        url: `${baseUrl}/${lang}/events/${event.slug}`,
        lastModified: event.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.6,
      }))
    );

    // Fetch dynamic jobs
    const jobs = await withRetry(() =>
      prisma.job.findMany({
        where: {
          status: "OPEN",
        },
        select: {
          slug: true,
          updatedAt: true,
        },
        take: 500,
        orderBy: {
          updatedAt: "desc",
        },
      })
    );

    const jobPages: MetadataRoute.Sitemap = jobs.flatMap((job) =>
      ["en", "es", "fr", "de"].map((lang) => ({
        url: `${baseUrl}/${lang}/jobs/${job.slug}`,
        lastModified: job.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }))
    );

    return [
      ...staticPages,
      ...languagePages,
      ...escortPages,
      ...vipPageEntries,
      ...livePageEntries,
      ...eventPages,
      ...jobPages,
    ];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return static pages if database fetch fails
    return [...staticPages, ...languagePages];
  }
}
