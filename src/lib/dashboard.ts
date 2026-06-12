import { redirect } from "next/navigation";

import {
  roleHighlights,
  roleLabels,
  parseRolePermissions,
  type ResourceKey,
} from "@/lib/permissions";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function requireDashboardSession() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  const roleKey = (session.user.role as keyof typeof roleLabels | undefined) ?? "tourist";
  const isBuiltin = roleKey in roleLabels;

  const customRole = !isBuiltin
    ? await prisma.customRole.findFirst({ where: { name: session.user.role ?? "" } })
    : undefined;

  let allowedMenus: string[] | null = null;
  let allowedActions: Partial<Record<ResourceKey, string[]>> | null = null;
  let highlights: string[] = roleHighlights[roleKey] || [];
  let label: string = roleLabels[roleKey] || (session.user.role ?? "tourist");

  if (customRole) {
    const perms = parseRolePermissions(customRole.permissions);
    allowedMenus = perms.menus;
    allowedActions = perms.actions;
    highlights = [customRole.description || "Custom role with specific access permissions"];
    label = customRole.name;
  } else if (isBuiltin && roleKey !== "super_admin") {
    const overrideRow = await prisma.settings.findUnique({
      where: { key: `role_override_${roleKey}` },
    });

    if (overrideRow) {
      try {
        const perms = parseRolePermissions(overrideRow.value);
        allowedMenus = perms.menus;
        allowedActions = perms.actions;
      } catch {
        // fall through
      }
    }
  }

  return {
    session,
    role: session.user.role,
    label,
    highlights,
    isSuperAdmin: session.user.role === "super_admin",
    allowedMenus,
    allowedActions,
  };
}

export type DashboardSession = Awaited<ReturnType<typeof requireDashboardSession>>;

export function canAccessMenu(s: DashboardSession, menu: string): boolean {
  return s.isSuperAdmin || !!s.allowedMenus?.includes(menu);
}

/**
 * Checks a resource action grant. Roles created before per-action grants
 * existed only store menus, so when the role defines no actions for the
 * resource we fall back to its menu access.
 */
export function canPerform(
  s: DashboardSession,
  resource: ResourceKey,
  action: string,
  menuFallback: string,
): boolean {
  if (s.isSuperAdmin) return true;
  const acts = s.allowedActions?.[resource];
  if (acts && acts.length > 0) return acts.includes(action);
  return !!s.allowedMenus?.includes(menuFallback);
}
