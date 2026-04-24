import type { MetadataRoute } from "next";
import { getSeoSettingsSync } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const s = await getSeoSettingsSync();
  const base = s.siteUrl || "https://tourvibe.com";

  if (!s.robotsIndex) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
