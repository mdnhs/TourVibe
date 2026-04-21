"use server";

import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { requireDashboardSession } from "@/lib/dashboard";

export type NotificationType =
  | "offer"
  | "sale"
  | "new_tour"
  | "new_car"
  | "booking"
  | "general";

export async function sendNotification(formData: FormData) {
  const { session, isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) return { error: "Unauthorized" };

  const title = (formData.get("title") as string)?.trim();
  const body = (formData.get("body") as string)?.trim();
  const type = (formData.get("type") as NotificationType) || "general";
  const targetUserId = (formData.get("targetUserId") as string)?.trim() || null;

  if (!title || !body) return { error: "Title and message are required." };

  const id = crypto.randomUUID();
  try {
    db.prepare(
      `INSERT INTO notification (id, title, body, type, targetUserId, createdBy)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(id, title, body, type, targetUserId, session.user.id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/notifications");
  return { success: true };
}

export async function deleteNotification(id: string) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) return { error: "Unauthorized" };

  db.prepare("DELETE FROM notification WHERE id = ?").run(id);
  revalidatePath("/dashboard/notifications");
  return { success: true };
}

export async function markAsRead(notificationId: string) {
  const { session } = await requireDashboardSession();

  db.prepare(
    `INSERT OR IGNORE INTO notification_read (notificationId, userId)
     VALUES (?, ?)`,
  ).run(notificationId, session.user.id);

  revalidatePath("/dashboard/notifications");
  return { success: true };
}

export async function markAllAsRead() {
  const { session } = await requireDashboardSession();

  const unread = db
    .prepare(
      `SELECT n.id FROM notification n
       WHERE (n.targetUserId IS NULL OR n.targetUserId = ?)
         AND n.id NOT IN (
           SELECT notificationId FROM notification_read WHERE userId = ?
         )`,
    )
    .all(session.user.id, session.user.id) as { id: string }[];

  const insert = db.prepare(
    "INSERT OR IGNORE INTO notification_read (notificationId, userId) VALUES (?, ?)",
  );
  for (const row of unread) {
    insert.run(row.id, session.user.id);
  }

  revalidatePath("/dashboard/notifications");
  return { success: true };
}
