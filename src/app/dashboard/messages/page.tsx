import { prisma } from "@/lib/prisma";
import { requireDashboardSession } from "@/lib/dashboard";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { MessagesTable } from "./messages-table";

export default async function MessagesPage() {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) redirect("/dashboard");

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <SiteHeader title="Contact Messages" subtitle="Inbox from landing page contact form" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MessagesTable messages={messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))} />
      </div>
    </>
  );
}
