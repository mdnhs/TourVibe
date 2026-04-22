"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireDashboardSession } from "@/lib/dashboard";

export async function updateMyLocation(lat: number, lng: number, locationName?: string) {
  const { session, role } = await requireDashboardSession();

  if (role !== "driver" && role !== "super_admin") {
    return { error: "Only drivers can update location." };
  }
  if (typeof lat !== "number" || typeof lng !== "number") {
    return { error: "Invalid coordinates." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { lat, lng, locationName: locationName?.trim() || null, locationUpdatedAt: new Date() },
  });

  revalidatePath("/dashboard/tracking");
  return { success: true };
}

export async function clearMyLocation() {
  const { session, role } = await requireDashboardSession();

  if (role !== "driver" && role !== "super_admin") {
    return { error: "Unauthorized." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { lat: null, lng: null, locationName: null, locationUpdatedAt: null },
  });

  revalidatePath("/dashboard/tracking");
  return { success: true };
}
