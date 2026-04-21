import type { MetadataRoute } from "next";
import { getSeoSettingsSync } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const s = getSeoSettingsSync();
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
