"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/lib/db";
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
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    // Manually update the role to driver
    db.prepare("UPDATE user SET role = ? WHERE email = ?").run("driver", email);
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

  if (!name || !email) {
    return { error: "Name and email are required." };
  }

  try {
    // Update basic info
    await auth.api.updateUser({
      headers: await headers(),
      body: {
        userId: id,
        data: {
          name,
          email,
        },
      },
    });

    // Update password if provided
    if (newPassword && newPassword.length >= 8) {
      await auth.api.setUserPassword({
        headers: await headers(),
        body: {
          userId: id,
          newPassword: newPassword,
        },
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
    // Check if driver has assigned vehicles
    const assignedVehicles = db.prepare("SELECT id FROM vehicle WHERE driverId = ?").all(id);
    if (assignedVehicles.length > 0) {
      db.prepare("UPDATE vehicle SET driverId = NULL WHERE driverId = ?").run(id);
    }

    db.prepare("DELETE FROM user WHERE id = ?").run(id);
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
    const placeholders = ids.map(() => "?").join(",");
    
    // Unassign vehicles first
    db.prepare(`UPDATE vehicle SET driverId = NULL WHERE driverId IN (${placeholders})`).run(...ids);
    
    // Delete users
    db.prepare(`DELETE FROM user WHERE id IN (${placeholders})`).run(...ids);
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/drivers");
  return { success: true };
}
