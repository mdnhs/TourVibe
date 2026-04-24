import { getIntegrations } from "@/lib/integrations";

export async function getCurrencyCode(): Promise<string> {
  const cfg = await getIntegrations();
  return (cfg.stripeCurrency || "usd").toLowerCase();
}
