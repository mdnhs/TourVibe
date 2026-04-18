import { redirect } from "next/navigation";

import { UserManagementTable } from "@/components/dashboard/user-management-table";
import { SiteHeader } from "@/components/site-header";
import { db } from "@/lib/db";
import { requireDashboardSession } from "@/lib/dashboard";
import { roleLabels } from "@/lib/permissions";

export default async function UsersPage() {
  const { session, isSuperAdmin } = await requireDashboardSession();

  if (!isSuperAdmin) {
    redirect("/dashboard");
  }

  const allUsers = db
    .prepare(
      "SELECT id, name, email, role, banned, banReason, createdAt FROM user ORDER BY createdAt DESC",
    )
    .all() as Array<{
      id: string;
      name: string;
      email: string;
      role: keyof typeof roleLabels;
      banned: number;
      banReason: string | null;
      createdAt: string;
    }>;

  return (
    <>
      <SiteHeader title="User Administration" subtitle="Admin only route" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <UserManagementTable
          currentUserId={session.user.id}
          users={allUsers.map((user) => ({
            ...user,
            banned: Boolean(user.banned),
          }))}
        />
      </div>
    </>
  );
}
