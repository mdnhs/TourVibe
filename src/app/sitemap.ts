import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getSeoSettingsSync } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const s = getSeoSettingsSync();
  const base = s.siteUrl || "https://tourvibe.com";

  const tours = db.prepare("SELECT id, updatedAt FROM tour_package ORDER BY updatedAt DESC").all() as {
    id: string;
    updatedAt: string;
  }[];

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/tours`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const tourRoutes: MetadataRoute.Sitemap = tours.map((t) => ({
    url: `${base}/tours/${t.id}`,
    lastModified: new Date(t.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...tourRoutes];
}
