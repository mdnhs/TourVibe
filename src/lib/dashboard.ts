import { redirect } from "next/navigation";

import { roleHighlights, roleLabels } from "@/lib/permissions";
import { getServerSession } from "@/lib/session";

export async function requireDashboardSession() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user.role as keyof typeof roleLabels | undefined) ?? "tourist";

  return {
    session,
    role,
    label: roleLabels[role],
    highlights: roleHighlights[role],
    isSuperAdmin: role === "super_admin",
  };
}
