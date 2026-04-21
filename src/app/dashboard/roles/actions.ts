"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { requireDashboardSession } from "@/lib/dashboard";
import type { CustomRolePermissions } from "@/lib/permissions";

// ── Custom roles ──────────────────────────────────────────────────────────────

export async function createCustomRole(formData: FormData) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) return { error: "Unauthorized" };

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() ?? "";

  if (!name) return { error: "Role name is required." };

  const permissions: CustomRolePermissions = JSON.parse(
    (formData.get("permissions") as string) || '{"menus":[],"actions":{}}'
  );

  if (permissions.menus.length === 0) {
    return { error: "Grant at least one menu permission." };
  }

  try {
    db.prepare(
      "INSERT INTO custom_role (id, name, description, permissions) VALUES (?, ?, ?, ?)"
    ).run(randomUUID(), name, description, JSON.stringify(permissions));

    revalidatePath("/dashboard/roles");
    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (e: any) {
    if (e.message?.includes("UNIQUE constraint failed")) {
      return { error: "A role with this name already exists." };
    }
    return { error: "Failed to create role." };
  }
}

export async function updateCustomRole(id: string, formData: FormData) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) return { error: "Unauthorized" };

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() ?? "";

  if (!name) return { error: "Role name is required." };

  const permissions: CustomRolePermissions = JSON.parse(
    (formData.get("permissions") as string) || '{"menus":[],"actions":{}}'
  );

  if (permissions.menus.length === 0) {
    return { error: "Grant at least one menu permission." };
  }

  try {
    db.prepare(
      "UPDATE custom_role SET name = ?, description = ?, permissions = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(name, description, JSON.stringify(permissions), id);

    revalidatePath("/dashboard/roles");
    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (e: any) {
    if (e.message?.includes("UNIQUE constraint failed")) {
      return { error: "A role with this name already exists." };
    }
    return { error: "Failed to update role." };
  }
}

export async function deleteCustomRole(id: string) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) return { error: "Unauthorized" };

  // Demote users with this role to tourist before deleting
  const role = db.prepare("SELECT name FROM custom_role WHERE id = ?").get(id) as { name: string } | undefined;
  if (role) {
    db.prepare("UPDATE user SET role = 'tourist' WHERE role = ?").run(role.name);
  }

  db.prepare("DELETE FROM custom_role WHERE id = ?").run(id);
  revalidatePath("/dashboard/roles");
  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function getRoleUserCounts(): Promise<Record<string, number>> {
  const rows = db.prepare(
    "SELECT role, COUNT(*) as count FROM user GROUP BY role"
  ).all() as { role: string; count: number }[];

  return Object.fromEntries(rows.map((r) => [r.role, r.count]));
}

// ── Built-in role permission overrides (driver + tourist only) ────────────────

const EDITABLE_BUILTIN_ROLES = ["driver", "tourist"] as const;
export type EditableBuiltinRole = (typeof EDITABLE_BUILTIN_ROLES)[number];

export async function updateBuiltinRolePermissions(
  roleKey: string,
  formData: FormData
) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) return { error: "Unauthorized" };

  if (!EDITABLE_BUILTIN_ROLES.includes(roleKey as EditableBuiltinRole)) {
    return { error: "This role's permissions cannot be edited." };
  }

  const permissions: CustomRolePermissions = JSON.parse(
    (formData.get("permissions") as string) || '{"menus":[],"actions":{}}'
  );

  if (permissions.menus.length === 0) {
    return { error: "Grant at least one menu permission." };
  }

  db.prepare(`
    INSERT INTO settings (key, value, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = CURRENT_TIMESTAMP
  `).run(`role_override_${roleKey}`, JSON.stringify(permissions));

  revalidatePath("/dashboard/roles");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function resetBuiltinRolePermissions(roleKey: string) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) return { error: "Unauthorized" };

  if (!EDITABLE_BUILTIN_ROLES.includes(roleKey as EditableBuiltinRole)) {
    return { error: "This role cannot be reset." };
  }

  db.prepare("DELETE FROM settings WHERE key = ?").run(`role_override_${roleKey}`);
  revalidatePath("/dashboard/roles");
  revalidatePath("/dashboard");
  return { success: true };
}
