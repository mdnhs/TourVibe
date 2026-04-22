"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { requireDashboardSession } from "@/lib/dashboard";

export async function updateProfile(formData: FormData) {
  const { session } = await requireDashboardSession();

  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const avatarFile = formData.get("avatar") as File | null;

  if (!name) return { error: "Name is required." };

  let imageUrl: string | undefined;
  if (avatarFile && avatarFile.size > 0) {
    try {
      imageUrl = await uploadToCloudinary(avatarFile, "tourvibe/avatars");
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

    await prisma.user.update({
      where: { id: session.user.id },
      data: { phone: phone || null },
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/account");
  return { success: true };
}

export async function updatePassword(formData: FormData) {
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
      body: { currentPassword, newPassword, revokeOtherSessions: false },
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Incorrect current password." };
  }

  return { success: true };
}
