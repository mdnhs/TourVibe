import type { CSSProperties, ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireDashboardSession } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { session, label, allowedMenus } = await requireDashboardSession();

  const unread = await prisma.notification.count({
    where: {
      OR: [{ targetUserId: null }, { targetUserId: session.user.id }],
      reads: { none: { userId: session.user.id } },
    },
  });

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
