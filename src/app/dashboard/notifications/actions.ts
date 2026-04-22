"use server";

import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
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

  try {
    await prisma.notification.create({
      data: {
        id: crypto.randomUUID(),
        title,
        body,
        type,
        targetUserId,
        createdBy: session.user.id,
      },
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/notifications");
  return { success: true };
}

export async function deleteNotification(id: string) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) return { error: "Unauthorized" };

  await prisma.notification.delete({ where: { id } });
  revalidatePath("/dashboard/notifications");
  return { success: true };
}

export async function markAsRead(notificationId: string) {
  const { session } = await requireDashboardSession();

  await prisma.notificationRead.upsert({
    where: { notificationId_userId: { notificationId, userId: session.user.id } },
    create: { notificationId, userId: session.user.id },
    update: {},
  });

  revalidatePath("/dashboard/notifications");
  return { success: true };
}

export async function markAllAsRead() {
  const { session } = await requireDashboardSession();
  const userId = session.user.id;

  const unread = await prisma.notification.findMany({
    where: {
      OR: [{ targetUserId: null }, { targetUserId: userId }],
      reads: { none: { userId } },
    },
    select: { id: true },
  });

  await prisma.notificationRead.createMany({
    data: unread.map((n) => ({ notificationId: n.id, userId })),
    skipDuplicates: true,
  });

  revalidatePath("/dashboard/notifications");
  return { success: true };
}
