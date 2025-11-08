import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/metadata";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/protected/",
          "/_next/",
          "/admin/",
          "/user/*/private/",
          "/messages/",
          "/settings/",
        ],
      },
      // Specific rules for common bots
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/protected/", "/admin/"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/api/", "/protected/", "/admin/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    // Add host for Yandex
    host: baseUrl,
  };
}
