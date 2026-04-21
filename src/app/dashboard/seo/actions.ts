"use server";

import { db } from "@/lib/db";
import { requireDashboardSession } from "@/lib/dashboard";
import { revalidatePath } from "next/cache";

export async function getSeoSettings() {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'seo'").get() as { value: string } | undefined;
  if (!row) {
    return {
      title: "TourVibe",
      description: "Car & Tour Management System",
      keywords: "car, tour, management",
    };
  }
  return JSON.parse(row.value);
}

export async function updateSeoSettings(formData: FormData) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) {
    return { error: "Unauthorized" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const keywords = formData.get("keywords") as string;

  const value = JSON.stringify({ title, description, keywords });

  db.prepare(`
    INSERT INTO settings (key, value, updatedAt)
    VALUES ('seo', ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updatedAt = CURRENT_TIMESTAMP
  `).run(value);

  revalidatePath("/dashboard/seo");
  return { success: true };
}
