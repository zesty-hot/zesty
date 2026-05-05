import { MetadataRoute } from "next";
import { getSiteConfig } from "@/lib/metadata";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteConfig({ lang: "en" }).url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/protected/",
          "/admin/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
