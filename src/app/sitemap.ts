import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getSeoSettingsSync } from "@/lib/seo";
import type { SitemapEntry } from "@/app/dashboard/seo/actions";

function getCustomEntries(): SitemapEntry[] {
  const row = db
    .prepare("SELECT value FROM settings WHERE key = 'sitemap_custom'")
    .get() as { value: string } | undefined;
  if (!row) return [];
  try { return JSON.parse(row.value) as SitemapEntry[]; } catch { return []; }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const s = getSeoSettingsSync();
  const base = s.siteUrl || "https://tourvibe.com";

  const tours = db
    .prepare("SELECT id, updatedAt FROM tour_package ORDER BY updatedAt DESC")
    .all() as { id: string; updatedAt: string }[];

  const blogPosts = (() => {
    try {
      return db
        .prepare("SELECT slug, updatedAt FROM blog_post WHERE status = 'published' ORDER BY updatedAt DESC")
        .all() as { slug: string; updatedAt: string }[];
    } catch { return []; }
  })();

  const customEntries = getCustomEntries();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,             lastModified: new Date(), changeFrequency: "daily",   priority: 1    },
    { url: `${base}/tours`,  lastModified: new Date(), changeFrequency: "daily",   priority: 0.9  },
    { url: `${base}/blog`,   lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
  ];

  const tourRoutes: MetadataRoute.Sitemap = tours.map((t) => ({
    url: `${base}/tours/${t.id}`,
    lastModified: new Date(t.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Manual entries: resolve relative paths against the base URL
  const customRoutes: MetadataRoute.Sitemap = customEntries
    .filter((e) => e.url.trim() !== "")
    .map((e) => ({
      url: e.url.startsWith("http") ? e.url : `${base}${e.url.startsWith("/") ? "" : "/"}${e.url}`,
      lastModified: new Date(),
      changeFrequency: e.changeFrequency,
      priority: e.priority,
    }));

  return [...staticRoutes, ...tourRoutes, ...blogRoutes, ...customRoutes];
}
