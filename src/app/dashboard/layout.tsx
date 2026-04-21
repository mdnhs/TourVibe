import type { CSSProperties, ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireDashboardSession } from "@/lib/dashboard";
import { db } from "@/lib/db";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { session, label, allowedMenus } = await requireDashboardSession();

  const { unread } = db
    .prepare(
      `SELECT COUNT(*) as unread
       FROM notification n
       WHERE (n.targetUserId IS NULL OR n.targetUserId = ?)
         AND n.id NOT IN (
           SELECT notificationId FROM notification_read WHERE userId = ?
         )`,
    )
    .get(session.user.id, session.user.id) as { unread: number };

  return (
    <SidebarProvider
      style={
        {
          "--header-height": "4rem",
        } as CSSProperties
      }
    >
      <AppSidebar
        user={{
          name: session.user.name,
          email: session.user.email,
          role: label,
          avatar: session.user.image,
        }}
        unreadNotifications={unread}
        allowedMenus={allowedMenus}
      />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
