import { redirect } from "next/navigation";

import { roleHighlights, roleLabels } from "@/lib/permissions";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";

export async function requireDashboardSession() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  const roleKey = (session.user.role as keyof typeof roleLabels | undefined) ?? "tourist";
  
  // Fetch custom role if it exists
  const customRole = db.prepare("SELECT * FROM custom_role WHERE name = ?").get(session.user.role) as {
    name: string;
    description: string;
    permissions: string;
  } | undefined;

  let allowedMenus: string[] | null = null;
  let highlights: string[] = roleHighlights[roleKey] || [];
  let label: string = roleLabels[roleKey] || session.user.role;

  if (customRole) {
    try {
      allowedMenus = JSON.parse(customRole.permissions);
      highlights = [customRole.description || "Custom role with specific menu access"];
      label = customRole.name;
    } catch (e) {
      console.error("Failed to parse custom role permissions", e);
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
