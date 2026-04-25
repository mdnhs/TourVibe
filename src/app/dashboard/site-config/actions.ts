"use server";

import { prisma } from "@/lib/prisma";
import { requireDashboardSession } from "@/lib/dashboard";
import { revalidatePath } from "next/cache";
import { type SiteConfig, siteConfigDefaults } from "./types";
import { getIntegrations, invalidateIntegrationsCache, type IntegrationsConfig } from "@/lib/integrations";

export async function getSiteConfig(): Promise<SiteConfig> {
  const row = await prisma.settings.findUnique({ where: { key: "site_config" } });
  if (!row) return siteConfigDefaults;
  return { ...siteConfigDefaults, ...JSON.parse(row.value) };
}

export async function updateSiteConfig(formData: FormData) {
  const { isSuperAdmin, allowedMenus } = await requireDashboardSession();
  if (!isSuperAdmin && !allowedMenus?.includes("Site Config"))
    return { error: "Unauthorized" };

  const g = (k: string) => (formData.get(k) as string) || "";

  const config: SiteConfig = {
    siteName: g("siteName") || siteConfigDefaults.siteName,
    tagline: g("tagline"),
    logoUrl: g("logoUrl"),
    heroImage: g("heroImage") || siteConfigDefaults.heroImage,
    heroBadgeText: g("heroBadgeText"),
    heroTitle: g("heroTitle") || siteConfigDefaults.heroTitle,
    heroTitleHighlight: g("heroTitleHighlight"),
    heroSubtitle: g("heroSubtitle"),
    heroTag1Emoji: g("heroTag1Emoji"),
    heroTag1Label: g("heroTag1Label"),
    heroTag1Url: g("heroTag1Url"),
    heroTag2Emoji: g("heroTag2Emoji"),
    heroTag2Label: g("heroTag2Label"),
    heroTag2Url: g("heroTag2Url"),
    heroTag3Emoji: g("heroTag3Emoji"),
    heroTag3Label: g("heroTag3Label"),
    heroTag3Url: g("heroTag3Url"),
    contactEmail: g("contactEmail"),
    contactPhone: g("contactPhone"),
    contactLocation: g("contactLocation"),
    footerTagline: g("footerTagline"),
    aboutTitle: g("aboutTitle") || siteConfigDefaults.aboutTitle,
    aboutTitleHighlight: g("aboutTitleHighlight"),
    aboutDescription: g("aboutDescription"),
    aboutStat1Value: g("aboutStat1Value"),
    aboutStat1Label: g("aboutStat1Label"),
    aboutStat2Value: g("aboutStat2Value"),
    aboutStat2Label: g("aboutStat2Label"),
    aboutStat3Value: g("aboutStat3Value"),
    aboutStat3Label: g("aboutStat3Label"),
    servicesBadgeText: g("servicesBadgeText"),
    servicesSectionTitle: g("servicesSectionTitle") || siteConfigDefaults.servicesSectionTitle,
    servicesSectionHighlight: g("servicesSectionHighlight"),
    servicesSectionSubtitle: g("servicesSectionSubtitle"),
    service1Title: g("service1Title") || siteConfigDefaults.service1Title,
    service1Description: g("service1Description"),
    service1Icon: g("service1Icon") || siteConfigDefaults.service1Icon,
    service2Title: g("service2Title") || siteConfigDefaults.service2Title,
    service2Description: g("service2Description"),
    service2Icon: g("service2Icon") || siteConfigDefaults.service2Icon,
    service3Title: g("service3Title") || siteConfigDefaults.service3Title,
    service3Description: g("service3Description"),
    service3Icon: g("service3Icon") || siteConfigDefaults.service3Icon,
    service4Title: g("service4Title") || siteConfigDefaults.service4Title,
    service4Description: g("service4Description"),
    service4Icon: g("service4Icon") || siteConfigDefaults.service4Icon,
    service5Title: g("service5Title") || siteConfigDefaults.service5Title,
    service5Description: g("service5Description"),
    service5Icon: g("service5Icon") || siteConfigDefaults.service5Icon,
    // Footer columns
    footerCol1Heading: g("footerCol1Heading") || siteConfigDefaults.footerCol1Heading,
    footerCol1Link1Label: g("footerCol1Link1Label"),
    footerCol1Link1Url: g("footerCol1Link1Url"),
    footerCol1Link2Label: g("footerCol1Link2Label"),
    footerCol1Link2Url: g("footerCol1Link2Url"),
    footerCol1Link3Label: g("footerCol1Link3Label"),
    footerCol1Link3Url: g("footerCol1Link3Url"),
    footerCol1Link4Label: g("footerCol1Link4Label"),
    footerCol1Link4Url: g("footerCol1Link4Url"),
    footerCol2Heading: g("footerCol2Heading") || siteConfigDefaults.footerCol2Heading,
    footerCol2Link1Label: g("footerCol2Link1Label"),
    footerCol2Link1Url: g("footerCol2Link1Url"),
    footerCol2Link2Label: g("footerCol2Link2Label"),
    footerCol2Link2Url: g("footerCol2Link2Url"),
    footerCol2Link3Label: g("footerCol2Link3Label"),
    footerCol2Link3Url: g("footerCol2Link3Url"),
    footerCol2Link4Label: g("footerCol2Link4Label"),
    footerCol2Link4Url: g("footerCol2Link4Url"),
    footerCol3Heading: g("footerCol3Heading") || siteConfigDefaults.footerCol3Heading,
    footerCol3Link1Label: g("footerCol3Link1Label"),
    footerCol3Link1Url: g("footerCol3Link1Url"),
    footerCol3Link2Label: g("footerCol3Link2Label"),
    footerCol3Link2Url: g("footerCol3Link2Url"),
    footerCol3Link3Label: g("footerCol3Link3Label"),
    footerCol3Link3Url: g("footerCol3Link3Url"),
    footerCol3Link4Label: g("footerCol3Link4Label"),
    footerCol3Link4Url: g("footerCol3Link4Url"),
    // Footer social & misc
    footerFacebookUrl: g("footerFacebookUrl"),
    footerInstagramUrl: g("footerInstagramUrl"),
    footerTwitterUrl: g("footerTwitterUrl"),
    footerYoutubeUrl: g("footerYoutubeUrl"),
    footerPoweredByText: g("footerPoweredByText") || siteConfigDefaults.footerPoweredByText,
  };

  await prisma.settings.upsert({
    where: { key: "site_config" },
    create: { key: "site_config", value: JSON.stringify(config) },
    update: { value: JSON.stringify(config) },
  });

  revalidatePath("/", "layout");
  revalidatePath("/dashboard/site-config");
  return { success: true };
}

export async function getIntegrationsConfig() {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) return null;

  const cfg = await getIntegrations();
  return {
    cloudinaryCloudName: cfg.cloudinaryCloudName,
    cloudinaryApiKey:    cfg.cloudinaryApiKey,
    cloudinaryApiSecret: cfg.cloudinaryApiSecret,
    stripeSecretKey:     cfg.stripeSecretKey,
    stripeWebhookSecret: cfg.stripeWebhookSecret,
    stripeCurrency:      cfg.stripeCurrency,
  };
}

export async function saveIntegrationsConfig(formData: FormData) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) return { error: "Unauthorized" };

  const existing = await getIntegrations();
  const g = (k: string) => (formData.get(k) as string | null)?.trim() || null;

  const updated: IntegrationsConfig = {
    cloudinaryCloudName: g("cloudinaryCloudName") ?? existing.cloudinaryCloudName,
    cloudinaryApiKey:    g("cloudinaryApiKey")    ?? existing.cloudinaryApiKey,
    cloudinaryApiSecret: g("cloudinaryApiSecret") ?? existing.cloudinaryApiSecret,
    stripeSecretKey:     g("stripeSecretKey")     ?? existing.stripeSecretKey,
    stripeWebhookSecret: g("stripeWebhookSecret") ?? existing.stripeWebhookSecret,
    stripeCurrency:      (g("stripeCurrency") ?? existing.stripeCurrency ?? "usd").toLowerCase(),
  };

  await prisma.settings.upsert({
    where: { key: "integrations" },
    create: { key: "integrations", value: JSON.stringify(updated) },
    update: { value: JSON.stringify(updated) },
  });

  invalidateIntegrationsCache();
  revalidatePath("/", "layout");
  return { success: true };
}
