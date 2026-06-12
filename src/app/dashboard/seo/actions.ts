"use server";

import { prisma } from "@/lib/prisma";
import { requireDashboardSession } from "@/lib/dashboard";
import { revalidatePath } from "next/cache";

export interface SeoSettings {
  siteTitle: string;
  titleTemplate: string;
  description: string;
  keywords: string;
  siteUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogSiteName: string;
  ogType: string;
  twitterCard: string;
  twitterSite: string;
  twitterCreator: string;
  twitterImage: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  metaPixelId: string;
  facebookCatalogUrl: string;
  googleSiteVerification: string;
  bingSiteVerification: string;
  yandexVerification: string;
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
  metaPixelId: "",
  facebookCatalogUrl: "/api/feeds/facebook",
  googleSiteVerification: "",
  bingSiteVerification: "",
  yandexVerification: "",
  orgName: "TourVibe",
  orgLogo: "",
  enableJsonLd: true,
};

export async function getSeoSettings(): Promise<SeoSettings> {
  const row = await prisma.settings.findUnique({ where: { key: "seo" } });
  if (!row) return defaults;
  return { ...defaults, ...JSON.parse(row.value) };
}

export async function updateSeoSettings(formData: FormData) {
  const { isSuperAdmin, allowedMenus } = await requireDashboardSession();
  if (!isSuperAdmin && !allowedMenus?.includes("SEO")) return { error: "Unauthorized" };

  // Inactive tabs are unmounted, so their fields are absent from FormData.
  // Merge with existing settings — only overwrite keys that were submitted.
  const existing = await getSeoSettings();
  const str = <K extends keyof SeoSettings>(key: K, fallback: string) =>
    formData.has(key) ? (formData.get(key) as string) || fallback : (existing[key] as string);
  const bool = <K extends keyof SeoSettings>(key: K) =>
    formData.has(key) ? formData.get(key) === "true" : (existing[key] as boolean);

  const settings: SeoSettings = {
    siteTitle: str("siteTitle", ""),
    titleTemplate: str("titleTemplate", "%s | TourVibe"),
    description: str("description", ""),
    keywords: str("keywords", ""),
    siteUrl: str("siteUrl", ""),
    ogTitle: str("ogTitle", ""),
    ogDescription: str("ogDescription", ""),
    ogImage: str("ogImage", ""),
    ogSiteName: str("ogSiteName", ""),
    ogType: str("ogType", "website"),
    twitterCard: str("twitterCard", "summary_large_image"),
    twitterSite: str("twitterSite", ""),
    twitterCreator: str("twitterCreator", ""),
    twitterImage: str("twitterImage", ""),
    robotsIndex: bool("robotsIndex"),
    robotsFollow: bool("robotsFollow"),
    googleAnalyticsId: str("googleAnalyticsId", ""),
    googleTagManagerId: str("googleTagManagerId", ""),
    metaPixelId: str("metaPixelId", ""),
    googleSiteVerification: str("googleSiteVerification", ""),
    bingSiteVerification: str("bingSiteVerification", ""),
    yandexVerification: str("yandexVerification", ""),
    orgName: str("orgName", ""),
    orgLogo: str("orgLogo", ""),
    enableJsonLd: bool("enableJsonLd"),
    facebookCatalogUrl: str("facebookCatalogUrl", "/api/feeds/facebook"),
  };

  await prisma.settings.upsert({
    where: { key: "seo" },
    create: { key: "seo", value: JSON.stringify(settings) },
    update: { value: JSON.stringify(settings) },
  });

  revalidatePath("/", "layout");
  revalidatePath("/dashboard/seo");
  return { success: true };
}

export type ChangeFrequency =
  | "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

export interface SitemapEntry {
  url: string;
  priority: number;
  changeFrequency: ChangeFrequency;
}

export async function getSitemapCustomEntries(): Promise<SitemapEntry[]> {
  const row = await prisma.settings.findUnique({ where: { key: "sitemap_custom" } });
  if (!row) return [];
  try { return JSON.parse(row.value) as SitemapEntry[]; } catch { return []; }
}

export async function updateSitemapCustomEntries(entries: SitemapEntry[]) {
  const { isSuperAdmin, allowedMenus } = await requireDashboardSession();
  if (!isSuperAdmin && !allowedMenus?.includes("SEO")) return { error: "Unauthorized" };

  const clean = entries.filter((e) => e.url.trim() !== "");

  await prisma.settings.upsert({
    where: { key: "sitemap_custom" },
    create: { key: "sitemap_custom", value: JSON.stringify(clean) },
    update: { value: JSON.stringify(clean) },
  });

  revalidatePath("/sitemap.xml");
  revalidatePath("/dashboard/seo");
  return { success: true };
}
