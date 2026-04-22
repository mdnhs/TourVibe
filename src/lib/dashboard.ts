import { redirect } from "next/navigation";

import { roleHighlights, roleLabels, parseRolePermissions } from "@/lib/permissions";
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
  let highlights: string[] = roleHighlights[roleKey] || [];
  let label: string = roleLabels[roleKey] || (session.user.role ?? "tourist");

  if (customRole) {
    const perms = parseRolePermissions(customRole.permissions);
    allowedMenus = perms.menus;
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
  };
}
