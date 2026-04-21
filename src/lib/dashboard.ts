import { redirect } from "next/navigation";

import { roleHighlights, roleLabels, parseRolePermissions } from "@/lib/permissions";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";

export async function requireDashboardSession() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  const roleKey = (session.user.role as keyof typeof roleLabels | undefined) ?? "tourist";
  const isBuiltin = roleKey in roleLabels;

  // ── Custom role lookup ────────────────────────────────────────────────────
  const customRole = !isBuiltin
    ? (db.prepare("SELECT * FROM custom_role WHERE name = ?").get(session.user.role) as {
        name: string;
        description: string;
        permissions: string;
      } | undefined)
    : undefined;

  let allowedMenus: string[] | null = null;
  let highlights: string[] = roleHighlights[roleKey] || [];
  let label: string = roleLabels[roleKey] || (session.user.role ?? "tourist");

  if (customRole) {
    // Custom role — parse the structured permissions and expose menu list
    const perms = parseRolePermissions(customRole.permissions);
    allowedMenus = perms.menus;
    highlights = [customRole.description || "Custom role with specific access permissions"];
    label = customRole.name;
  } else if (isBuiltin && roleKey !== "super_admin") {
    // Built-in role (driver / tourist) — check for admin override
    const overrideRow = db
      .prepare("SELECT value FROM settings WHERE key = ?")
      .get(`role_override_${roleKey}`) as { value: string } | undefined;

    if (overrideRow) {
      try {
        const perms = parseRolePermissions(overrideRow.value);
        allowedMenus = perms.menus;
      } catch {
        // fall through to default hardcoded sidebar logic
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
