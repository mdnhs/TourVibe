"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { requireDashboardSession } from "@/lib/dashboard";
import { db } from "@/lib/db";
import { roleLabels } from "@/lib/permissions";

export async function createUser(formData: FormData) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as keyof typeof roleLabels;

  if (!name || !email || !password || !role) {
    return { error: "All fields are required." };
  }

  try {
    const response = await auth.api.createUser({
      headers: await headers(),
      body: {
        name,
        email,
        password,
        role,
      },
    });

    if (response.error) {
      return { error: response.error.message || "Unable to create the user account." };
    }
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function updateUser(id: string, formData: FormData) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as keyof typeof roleLabels;
  const newPassword = formData.get("password") as string;

  if (!name || !email || !role) {
    return { error: "Name, email and role are required." };
  }

  try {
    const requestHeaders = await headers();

    // Update basic info
    await auth.api.updateUser({
      headers: requestHeaders,
      body: {
        userId: id,
        data: {
          name,
          email,
        },
      },
    });

    // Update role
    await auth.api.setRole({
      headers: requestHeaders,
      body: {
        userId: id,
        role: role,
      },
    });

    // Update password if provided
    if (newPassword && newPassword.length >= 8) {
      await auth.api.setUserPassword({
        headers: requestHeaders,
        body: {
          userId: id,
          newPassword: newPassword,
        },
      });
    }
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function banUser(id: string, reason?: string) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) throw new Error("Unauthorized");

  try {
    await auth.api.banUser({
      headers: await headers(),
      body: {
        userId: id,
        banReason: reason || "Account disabled by super admin.",
      },
    });
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function unbanUser(id: string) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) throw new Error("Unauthorized");

  try {
    await auth.api.unbanUser({
      headers: await headers(),
      body: {
        userId: id,
      },
    });
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function deleteUser(id: string) {
  const { session, isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) throw new Error("Unauthorized");
  if (id === session.user.id) return { error: "You cannot delete yourself." };

  try {
    // Unassign from vehicles if driver
    db.prepare("UPDATE vehicle SET driverId = NULL WHERE driverId = ?").run(id);
    
    // Delete from db directly
    db.prepare("DELETE FROM user WHERE id = ?").run(id);
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function deleteUsers(ids: string[]) {
  const { session, isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) throw new Error("Unauthorized");

  const filteredIds = ids.filter(id => id !== session.user.id);
  if (filteredIds.length === 0) return { error: "No valid IDs provided." };

  try {
    const placeholders = filteredIds.map(() => "?").join(",");
    
    // Unassign vehicles
    db.prepare(`UPDATE vehicle SET driverId = NULL WHERE driverId IN (${placeholders})`).run(...filteredIds);
    
    // Delete users
    db.prepare(`DELETE FROM user WHERE id IN (${placeholders})`).run(...filteredIds);
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/users");
  return { success: true };
}
