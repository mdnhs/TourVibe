import { prisma } from "@/lib/prisma";

export interface IntegrationsConfig {
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  stripeCurrency: string;
}

const envDefaults: IntegrationsConfig = {
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  cloudinaryApiKey:    process.env.CLOUDINARY_API_KEY    ?? "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
  stripeSecretKey:     process.env.STRIPE_SECRET_KEY     ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripeCurrency:      process.env.STRIPE_CURRENCY       ?? "usd",
};

let cache: IntegrationsConfig | null = null;
let cacheAt = 0;
const TTL = 60_000; // 1 min

export async function getIntegrations(): Promise<IntegrationsConfig> {
  const now = Date.now();
  if (cache && now - cacheAt < TTL) return cache;

  const row = await prisma.settings.findUnique({ where: { key: "integrations" } });
  const stored: Partial<IntegrationsConfig> = row ? JSON.parse(row.value) : {};

  cache = {
    cloudinaryCloudName: stored.cloudinaryCloudName || envDefaults.cloudinaryCloudName,
    cloudinaryApiKey:    stored.cloudinaryApiKey    || envDefaults.cloudinaryApiKey,
    cloudinaryApiSecret: stored.cloudinaryApiSecret || envDefaults.cloudinaryApiSecret,
    stripeSecretKey:     stored.stripeSecretKey     || envDefaults.stripeSecretKey,
    stripeWebhookSecret: stored.stripeWebhookSecret || envDefaults.stripeWebhookSecret,
    stripeCurrency:      (stored.stripeCurrency || envDefaults.stripeCurrency).toLowerCase(),
  };
  cacheAt = now;
  return cache;
}

export function invalidateIntegrationsCache() {
  cache = null;
  cacheAt = 0;
}
