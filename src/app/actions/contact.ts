"use server";

import { prisma } from "@/lib/prisma";
import { requireDashboardSession } from "@/lib/dashboard";
import { revalidatePath } from "next/cache";

export async function submitContactForm(formData: FormData) {
  const name    = (formData.get("name")    as string)?.trim();
  const email   = (formData.get("email")   as string)?.trim();
  const phone   = (formData.get("phone")   as string)?.trim() || null;
  const subject = (formData.get("subject") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  if (!name || !email || !subject || !message) {
    return { error: "Please fill in all required fields." };
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return { error: "Invalid email address." };
  }

  await prisma.contactMessage.create({
    data: { name, email, phone, subject, message, status: "unread" },
  });

  return { success: true };
}

export async function updateMessageStatus(id: string, status: "unread" | "read" | "replied") {
  await requireDashboardSession();
  await prisma.contactMessage.update({ where: { id }, data: { status } });
  revalidatePath("/dashboard/messages");
}

export async function deleteMessage(id: string) {
  await requireDashboardSession();
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/dashboard/messages");
}

export async function bulkUpdateStatus(ids: string[], status: "read" | "replied") {
  await requireDashboardSession();
  await prisma.contactMessage.updateMany({
    where: { id: { in: ids } },
    data: { status },
  });
  revalidatePath("/dashboard/messages");
}

export async function bulkDeleteMessages(ids: string[]) {
  await requireDashboardSession();
  await prisma.contactMessage.deleteMany({
    where: { id: { in: ids } },
  });
  revalidatePath("/dashboard/messages");
}
