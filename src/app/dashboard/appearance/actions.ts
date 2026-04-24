"use server";

import { prisma } from "@/lib/prisma";
import { requireDashboardSession } from "@/lib/dashboard";
import { revalidatePath } from "next/cache";
import { type ThemeConfig, themeDefaults } from "@/lib/theme";

export async function getThemeConfig(): Promise<ThemeConfig> {
  const row = await prisma.settings.findUnique({ where: { key: "theme" } });
  if (!row) return themeDefaults;
  return { ...themeDefaults, ...JSON.parse(row.value) };
}

export async function saveThemeConfig(formData: FormData) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) return { error: "Unauthorized" };

  const config: ThemeConfig = {
    primaryHue: Number(formData.get("primaryHue")) || themeDefaults.primaryHue,
    radius: Number(formData.get("radius")) || themeDefaults.radius,
  };

  await prisma.settings.upsert({
    where: { key: "theme" },
    create: { key: "theme", value: JSON.stringify(config) },
    update: { value: JSON.stringify(config) },
  });

  revalidatePath("/", "layout");
  return { success: true };
}
