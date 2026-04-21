"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireDashboardSession } from "@/lib/dashboard";

async function saveUpload(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  const ext = file.name.split(".").pop() ?? "jpg";
  const name = `avatar-${crypto.randomUUID()}.${ext}`;
  await fs.writeFile(path.join(uploadDir, name), buffer);
  return `/uploads/${name}`;
}

export async function updateProfile(formData: FormData) {
  const { session } = await requireDashboardSession();

  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const avatarFile = formData.get("avatar") as File | null;

  if (!name) return { error: "Name is required." };

  let imageUrl: string | undefined;
  if (avatarFile && avatarFile.size > 0) {
    try {
      imageUrl = await saveUpload(avatarFile);
    } catch {
      return { error: "Failed to upload avatar." };
    }
  }

  try {
    const requestHeaders = await headers();
    await auth.api.updateUser({
      headers: requestHeaders,
      body: { name, image: imageUrl },
    });

    db.prepare(
      "UPDATE user SET phone = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
    ).run(phone || null, session.user.id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/account");
  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const { session } = await requireDashboardSession();

  const currentPassword = (formData.get("currentPassword") as string)?.trim();
  const newPassword = (formData.get("newPassword") as string)?.trim();
  const confirmPassword = (formData.get("confirmPassword") as string)?.trim();

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All password fields are required." };
  }
  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  try {
    await auth.api.changePassword({
      headers: await headers(),
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      },
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Incorrect current password." };
  }

  return { success: true };
}
