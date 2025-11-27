import { MetadataRoute } from "next";
import { getSiteConfig } from "@/lib/metadata";
import { prisma, withRetry } from "@/lib/prisma";
import { locales } from '@/lib/i18n/config';
import { EventStatus } from "@prisma/client";

// Revalidate sitemap every 24 hours (86400 seconds)
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteConfig({ lang: "en" }).url;

  // Add other language versions
  const languagePages: MetadataRoute.Sitemap = locales.flatMap((lang) => [
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
      url: `${baseUrl}/${lang}/jobs`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/${lang}/events`,
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
      url: `${baseUrl}/${lang}/vip`,
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
    {
      url: `${baseUrl}/${lang}/about`,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/${lang}/tos`,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/${lang}/privacy`,
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
        orderBy: {
          lastActive: "desc",
        },
      })
    );

    const escortPages: MetadataRoute.Sitemap = escorts.flatMap((escort) =>
      locales.map((lang) => ({
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
        orderBy: {
          updatedAt: "desc",
        },
      })
    );

    const vipPageEntries: MetadataRoute.Sitemap = vipPages.flatMap((page) =>
      locales.map((lang) => ({
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
        orderBy: {
          updatedAt: "desc",
        },
      })
    );

    const livePageEntries: MetadataRoute.Sitemap = livePages.flatMap((page) =>
      locales.map((lang) => ({
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
          status: {
            in: ["OPEN", "PAY_TO_JOIN", "REQUEST_TO_JOIN"] as EventStatus[],
          },
          startTime: {
            gte: new Date(), // Only include upcoming events
          },
        },
        select: {
          slug: true,
          updatedAt: true,
        },
        orderBy: {
          startTime: "asc",
        },
      })
    );

    const eventPages: MetadataRoute.Sitemap = events.flatMap((event) =>
      locales.map((lang) => ({
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
        orderBy: {
          updatedAt: "desc",
        },
      })
    );

    const jobPages: MetadataRoute.Sitemap = jobs.flatMap((job) =>
      locales.map((lang) => ({
        url: `${baseUrl}/${lang}/jobs/${job.slug}`,
        lastModified: job.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }))
    );

    return [
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
    return [...languagePages];
  }
}