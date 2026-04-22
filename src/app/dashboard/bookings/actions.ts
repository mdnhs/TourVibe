"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireDashboardSession } from "@/lib/dashboard";

export type BookingStatus = "pending" | "paid" | "cancelled";

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) return { error: "Unauthorized" };

  const valid: BookingStatus[] = ["pending", "paid", "cancelled"];
  if (!valid.includes(status)) return { error: "Invalid status" };

  try {
    await prisma.booking.update({ where: { id }, data: { status } });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/bookings");
  return { success: true };
}

export async function cancelOwnBooking(id: string) {
  const { session } = await requireDashboardSession();

  const booking = await prisma.booking.findUnique({
    where: { id },
    select: { userId: true, status: true },
  });

  if (!booking) return { error: "Booking not found" };
  if (booking.userId !== session.user.id) return { error: "Unauthorized" };
  if (booking.status === "cancelled") return { error: "Already cancelled" };

  try {
    await prisma.booking.update({ where: { id }, data: { status: "cancelled" } });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/bookings");
  return { success: true };
}
