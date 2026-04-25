import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getSeoSettingsSync } from "@/lib/seo";
import type { SitemapEntry } from "@/app/dashboard/seo/actions";

async function getCustomEntries(): Promise<SitemapEntry[]> {
  const row = await db.settings.findUnique({
    where: { key: 'sitemap_custom' }
  });
  if (!row) return [];
  try { return JSON.parse(row.value) as SitemapEntry[]; } catch { return []; }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const s = await getSeoSettingsSync();
  const base = s.siteUrl || "https://tourvibe.com";

  const tours = await db.tourPackage.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' }
  });

  const blogPosts = await (async () => {
    try {
      return await db.blogPost.findMany({
        where: { status: 'published' },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' }
      });
    } catch { return []; }
  })();

  const customEntries = await getCustomEntries();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,             lastModified: new Date(), changeFrequency: "daily",   priority: 1    },
    { url: `${base}/tours`,  lastModified: new Date(), changeFrequency: "daily",   priority: 0.9  },
    { url: `${base}/blog`,   lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
  ];

  const tourRoutes: MetadataRoute.Sitemap = tours.map((t) => ({
    url: `${base}/tours/${t.slug}`,
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
