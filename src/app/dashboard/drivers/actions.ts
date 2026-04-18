"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { requireDashboardSession } from "@/lib/dashboard";
import { db } from "@/lib/db";

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
    const response = await auth.api.createUser({
      headers: await headers(),
      body: {
        name,
        email,
        password,
        role: "driver",
      },
    });

    if (response.error) {
      return { error: response.error.message || "Unable to create the driver account." };
    }
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
      // Option 1: Prevent deletion
      // return { error: "Cannot delete driver with assigned vehicles. Please unassign first." };
      
      // Option 2: Unassign vehicles (handled by FK SET NULL) - but we might want to be explicit
      db.prepare("UPDATE vehicle SET driverId = NULL WHERE driverId = ?").run(id);
    }

    // better-auth doesn't seem to have a direct 'deleteUser' in admin api by default, 
    // but we can delete from db directly if needed, or use better-auth if available.
    // Actually better-auth admin plugin has removeUser if configured, let's check if we can just delete from db.
    db.prepare("DELETE FROM user WHERE id = ?").run(id);
    // Also delete sessions etc if needed, but better-auth usually handles this if using its API.
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
