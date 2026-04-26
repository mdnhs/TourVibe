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
    metaPixelId: (formData.get("metaPixelId") as string) || "",
    googleSiteVerification: (formData.get("googleSiteVerification") as string) || "",
    bingSiteVerification: (formData.get("bingSiteVerification") as string) || "",
    yandexVerification: (formData.get("yandexVerification") as string) || "",
    orgName: (formData.get("orgName") as string) || "",
    orgLogo: (formData.get("orgLogo") as string) || "",
    enableJsonLd: formData.get("enableJsonLd") === "true",
    facebookCatalogUrl: (formData.get("facebookCatalogUrl") as string) || "/api/feeds/facebook",
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
