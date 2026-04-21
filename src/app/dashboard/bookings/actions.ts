"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireDashboardSession } from "@/lib/dashboard";

export type BookingStatus = "pending" | "paid" | "cancelled";

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) return { error: "Unauthorized" };

  const valid: BookingStatus[] = ["pending", "paid", "cancelled"];
  if (!valid.includes(status)) return { error: "Invalid status" };

  try {
    db.prepare(
      "UPDATE booking SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
    ).run(status, id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/bookings");
  return { success: true };
}

export async function cancelOwnBooking(id: string) {
  const { session } = await requireDashboardSession();

  const booking = db
    .prepare("SELECT userId, status FROM booking WHERE id = ?")
    .get(id) as { userId: string; status: string } | undefined;

  if (!booking) return { error: "Booking not found" };
  if (booking.userId !== session.user.id) return { error: "Unauthorized" };
  if (booking.status === "cancelled") return { error: "Already cancelled" };

  try {
    db.prepare(
      "UPDATE booking SET status = 'cancelled', updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
    ).run(id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/bookings");
  return { success: true };
}
