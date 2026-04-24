import type { CSSProperties, ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireDashboardSession } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";
import { getIntegrations } from "@/lib/integrations";
import { IntegrationsSetupDialog } from "@/components/integrations-setup-dialog";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { session, label, allowedMenus, isSuperAdmin } = await requireDashboardSession();

  const [unread, unreadMessages, integrations] = await Promise.all([
    prisma.notification.count({
      where: {
        OR: [{ targetUserId: null }, { targetUserId: session.user.id }],
        reads: { none: { userId: session.user.id } },
      },
    }),
    isSuperAdmin
      ? prisma.contactMessage.count({ where: { status: "unread" } })
      : Promise.resolve(0),
    isSuperAdmin ? getIntegrations() : Promise.resolve(null),
  ]);

  const missingCloudinary = isSuperAdmin && integrations
    ? !integrations.cloudinaryCloudName || !integrations.cloudinaryApiKey || !integrations.cloudinaryApiSecret
    : false;

  const missingStripe = isSuperAdmin && integrations
    ? !integrations.stripeSecretKey || !integrations.stripeWebhookSecret
    : false;

  return (
    <SidebarProvider
      style={{ "--header-height": "4rem" } as CSSProperties}
    >
      <AppSidebar
        user={{
          name: session.user.name,
          email: session.user.email,
          role: label,
          avatar: session.user.image,
        }}
        unreadNotifications={unread}
        unreadMessages={unreadMessages}
        allowedMenus={allowedMenus}
      />
      <SidebarInset>{children}</SidebarInset>

      {isSuperAdmin && (missingCloudinary || missingStripe) && (
        <IntegrationsSetupDialog
          missingCloudinary={missingCloudinary}
          missingStripe={missingStripe}
        />
      )}
    </SidebarProvider>
  );
}
