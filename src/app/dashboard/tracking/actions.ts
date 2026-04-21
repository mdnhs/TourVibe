"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireDashboardSession } from "@/lib/dashboard";

export async function updateMyLocation(
  lat: number,
  lng: number,
  locationName?: string,
) {
  const { session, role } = await requireDashboardSession();

  if (role !== "driver" && role !== "super_admin") {
    return { error: "Only drivers can update location." };
  }

  if (typeof lat !== "number" || typeof lng !== "number") {
    return { error: "Invalid coordinates." };
  }

  db.prepare(
    `UPDATE user
     SET lat = ?, lng = ?, locationName = ?, locationUpdatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
  ).run(lat, lng, locationName?.trim() || null, session.user.id);

  revalidatePath("/dashboard/tracking");
  return { success: true };
}

export async function clearMyLocation() {
  const { session, role } = await requireDashboardSession();

  if (role !== "driver" && role !== "super_admin") {
    return { error: "Unauthorized." };
  }

  db.prepare(
    "UPDATE user SET lat = NULL, lng = NULL, locationName = NULL, locationUpdatedAt = NULL WHERE id = ?",
  ).run(session.user.id);

  revalidatePath("/dashboard/tracking");
  return { success: true };
}
