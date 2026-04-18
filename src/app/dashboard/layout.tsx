import type { CSSProperties, ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireDashboardSession } from "@/lib/dashboard";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { session, label } = await requireDashboardSession();

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
      />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
