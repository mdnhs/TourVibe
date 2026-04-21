"use server";

import { db } from "@/lib/db";
import { requireDashboardSession } from "@/lib/dashboard";
import { revalidatePath } from "next/cache";

export interface SeoSettings {
  // General
  siteTitle: string;
  titleTemplate: string;
  description: string;
  keywords: string;
  siteUrl: string;
  // Open Graph
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogSiteName: string;
  ogType: string;
  // Twitter
  twitterCard: string;
  twitterSite: string;
  twitterCreator: string;
  twitterImage: string;
  // Technical
  robotsIndex: boolean;
  robotsFollow: boolean;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  // Verification
  googleSiteVerification: string;
  bingSiteVerification: string;
  yandexVerification: string;
  // Structured Data
  orgName: string;
  orgLogo: string;
  enableJsonLd: boolean;
}

const defaults: SeoSettings = {
  siteTitle: "TourVibe",
  titleTemplate: "%s | TourVibe",
  description: "Car-based tour management platform offering scenic road tours, airport transfers, and custom itineraries.",
  keywords: "car tour, road trip, scenic tours, airport transfer, tour management",
  siteUrl: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  ogSiteName: "TourVibe",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterSite: "",
  twitterCreator: "",
  twitterImage: "",
  robotsIndex: true,
  robotsFollow: true,
  googleAnalyticsId: "",
  googleTagManagerId: "",
  googleSiteVerification: "",
  bingSiteVerification: "",
  yandexVerification: "",
  orgName: "TourVibe",
  orgLogo: "",
  enableJsonLd: true,
};

export async function getSeoSettings(): Promise<SeoSettings> {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'seo'").get() as { value: string } | undefined;
  if (!row) return defaults;
  return { ...defaults, ...JSON.parse(row.value) };
}

export async function updateSeoSettings(formData: FormData) {
  const { isSuperAdmin, allowedMenus } = await requireDashboardSession();
  if (!isSuperAdmin && !allowedMenus?.includes("SEO")) return { error: "Unauthorized" };

  const settings: SeoSettings = {
    siteTitle: (formData.get("siteTitle") as string) || "",
    titleTemplate: (formData.get("titleTemplate") as string) || "%s | TourVibe",
    description: (formData.get("description") as string) || "",
    keywords: (formData.get("keywords") as string) || "",
    siteUrl: (formData.get("siteUrl") as string) || "",
    ogTitle: (formData.get("ogTitle") as string) || "",
    ogDescription: (formData.get("ogDescription") as string) || "",
    ogImage: (formData.get("ogImage") as string) || "",
    ogSiteName: (formData.get("ogSiteName") as string) || "",
    ogType: (formData.get("ogType") as string) || "website",
    twitterCard: (formData.get("twitterCard") as string) || "summary_large_image",
    twitterSite: (formData.get("twitterSite") as string) || "",
    twitterCreator: (formData.get("twitterCreator") as string) || "",
    twitterImage: (formData.get("twitterImage") as string) || "",
    robotsIndex: formData.get("robotsIndex") === "true",
    robotsFollow: formData.get("robotsFollow") === "true",
    googleAnalyticsId: (formData.get("googleAnalyticsId") as string) || "",
    googleTagManagerId: (formData.get("googleTagManagerId") as string) || "",
    googleSiteVerification: (formData.get("googleSiteVerification") as string) || "",
    bingSiteVerification: (formData.get("bingSiteVerification") as string) || "",
    yandexVerification: (formData.get("yandexVerification") as string) || "",
    orgName: (formData.get("orgName") as string) || "",
    orgLogo: (formData.get("orgLogo") as string) || "",
    enableJsonLd: formData.get("enableJsonLd") === "true",
  };

  db.prepare(`
    INSERT INTO settings (key, value, updatedAt)
    VALUES ('seo', ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updatedAt = CURRENT_TIMESTAMP
  `).run(JSON.stringify(settings));

  revalidatePath("/", "layout");
  revalidatePath("/dashboard/seo");
  return { success: true };
}

// ── Sitemap custom entries ────────────────────────────────────────────────────

export type ChangeFrequency =
  | "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

export interface SitemapEntry {
  url: string;
  priority: number;
  changeFrequency: ChangeFrequency;
}

export async function getSitemapCustomEntries(): Promise<SitemapEntry[]> {
  const row = db
    .prepare("SELECT value FROM settings WHERE key = 'sitemap_custom'")
    .get() as { value: string } | undefined;
  if (!row) return [];
  try { return JSON.parse(row.value) as SitemapEntry[]; } catch { return []; }
}

export async function updateSitemapCustomEntries(entries: SitemapEntry[]) {
  const { isSuperAdmin, allowedMenus } = await requireDashboardSession();
  if (!isSuperAdmin && !allowedMenus?.includes("SEO")) return { error: "Unauthorized" };

  // Sanitise: drop entries with empty URL
  const clean = entries.filter((e) => e.url.trim() !== "");

  db.prepare(`
    INSERT INTO settings (key, value, updatedAt) VALUES ('sitemap_custom', ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = CURRENT_TIMESTAMP
  `).run(JSON.stringify(clean));

  revalidatePath("/sitemap.xml");
  revalidatePath("/dashboard/seo");
  return { success: true };
}
