"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireDashboardSession } from "@/lib/dashboard";
import type { CustomRolePermissions } from "@/lib/permissions";

export async function createCustomRole(formData: FormData) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) return { error: "Unauthorized" };

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() ?? "";
  if (!name) return { error: "Role name is required." };

  const permissions: CustomRolePermissions = JSON.parse(
    (formData.get("permissions") as string) || '{"menus":[],"actions":{}}'
  );
  if (permissions.menus.length === 0) return { error: "Grant at least one menu permission." };

  try {
    await prisma.customRole.create({
      data: { id: randomUUID(), name, description, permissions: JSON.stringify(permissions) },
    });
    revalidatePath("/dashboard/roles");
    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Unique constraint")) {
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
  if (permissions.menus.length === 0) return { error: "Grant at least one menu permission." };

  try {
    await prisma.customRole.update({
      where: { id },
      data: { name, description, permissions: JSON.stringify(permissions) },
    });
    revalidatePath("/dashboard/roles");
    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Unique constraint")) {
      return { error: "A role with this name already exists." };
    }
    return { error: "Failed to update role." };
  }
}

export async function deleteCustomRole(id: string) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) return { error: "Unauthorized" };

  const role = await prisma.customRole.findUnique({ where: { id }, select: { name: true } });
  if (role) {
    await prisma.user.updateMany({ where: { role: role.name }, data: { role: "tourist" } });
  }

  await prisma.customRole.delete({ where: { id } });
  revalidatePath("/dashboard/roles");
  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function getRoleUserCounts(): Promise<Record<string, number>> {
  const rows = await prisma.user.groupBy({ by: ["role"], _count: { _all: true } });
  return Object.fromEntries(rows.map((r) => [r.role ?? "unknown", r._count._all]));
}

const EDITABLE_BUILTIN_ROLES = ["driver", "tourist"] as const;
export type EditableBuiltinRole = (typeof EDITABLE_BUILTIN_ROLES)[number];

export async function updateBuiltinRolePermissions(roleKey: string, formData: FormData) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) return { error: "Unauthorized" };

  if (!EDITABLE_BUILTIN_ROLES.includes(roleKey as EditableBuiltinRole)) {
    return { error: "This role's permissions cannot be edited." };
  }

  const permissions: CustomRolePermissions = JSON.parse(
    (formData.get("permissions") as string) || '{"menus":[],"actions":{}}'
  );
  if (permissions.menus.length === 0) return { error: "Grant at least one menu permission." };

  await prisma.settings.upsert({
    where: { key: `role_override_${roleKey}` },
    create: { key: `role_override_${roleKey}`, value: JSON.stringify(permissions) },
    update: { value: JSON.stringify(permissions) },
  });

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

  await prisma.settings.deleteMany({ where: { key: `role_override_${roleKey}` } });
  revalidatePath("/dashboard/roles");
  revalidatePath("/dashboard");
  return { success: true };
}
