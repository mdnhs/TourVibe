"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { requireDashboardSession } from "@/lib/dashboard";

export async function createCustomRole(formData: FormData) {
  const { isSuperAdmin } = await requireDashboardSession();

  if (!isSuperAdmin) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const permissions = formData.getAll("permissions") as string[];

  if (!name || permissions.length === 0) {
    return { error: "Name and at least one permission are required." };
  }

  try {
    db.prepare(
      "INSERT INTO custom_role (id, name, description, permissions) VALUES (?, ?, ?, ?)"
    ).run(randomUUID(), name, description, JSON.stringify(permissions));

    revalidatePath("/dashboard/roles");
    return { success: true };
  } catch (error: any) {
    if (error.message.includes("UNIQUE constraint failed")) {
      return { error: "A role with this name already exists." };
    }
    return { error: "Failed to create role." };
  }
}

export async function deleteCustomRole(id: string) {
  const { isSuperAdmin } = await requireDashboardSession();

  if (!isSuperAdmin) {
    throw new Error("Unauthorized");
  }

  try {
    db.prepare("DELETE FROM custom_role WHERE id = ?").run(id);
    revalidatePath("/dashboard/roles");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete role." };
  }
}
