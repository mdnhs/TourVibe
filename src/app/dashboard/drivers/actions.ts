"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";
import { requireDashboardSession } from "@/lib/dashboard";
import { auth } from "@/lib/auth";

export async function createDriver(formData: FormData) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Name, email and password are required." };
  }

  try {
    await auth.api.signUpEmail({ body: { name, email, password } });
    await prisma.user.update({ where: { email }, data: { role: "driver" } });
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/drivers");
  return { success: true };
}

export async function updateDriver(id: string, formData: FormData) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const newPassword = formData.get("password") as string;

  if (!name || !email) return { error: "Name and email are required." };

  try {
    await prisma.user.update({
      where: { id },
      data: { name, email },
    });

    if (newPassword && newPassword.length >= 8) {
      await auth.api.setUserPassword({
        headers: await headers(),
        body: { userId: id, newPassword },
      });
    }
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/drivers");
  return { success: true };
}

export async function deleteDriver(id: string) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) throw new Error("Unauthorized");

  try {
    await prisma.vehicle.updateMany({ where: { driverId: id }, data: { driverId: null } });
    await prisma.user.delete({ where: { id } });
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/drivers");
  return { success: true };
}

export async function deleteDrivers(ids: string[]) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) throw new Error("Unauthorized");
  if (ids.length === 0) return { error: "No IDs provided" };

  try {
    await prisma.vehicle.updateMany({ where: { driverId: { in: ids } }, data: { driverId: null } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/drivers");
  return { success: true };
}
