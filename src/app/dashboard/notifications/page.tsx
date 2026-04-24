import { SiteHeader } from "@/components/site-header";
import { requireDashboardSession } from "@/lib/dashboard";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SendNotificationForm } from "./send-form";
import { AdminNotificationTable, type AdminNotification } from "./admin-table";
import { NotificationList, type NotificationItem } from "./notification-list";

export default async function NotificationsPage() {
  const { session, isSuperAdmin } = await requireDashboardSession();

  if (isSuperAdmin) {
    // Admin: all sent notifications with read counts + user list for targeting
    const notificationsRaw = await db.notification.findMany({
      include: {
        targetUser: {
          select: { name: true },
        },
        _count: {
          select: { reads: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const notifications: AdminNotification[] = notificationsRaw.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      type: n.type,
      targetUserId: n.targetUserId,
      targetUserName: n.targetUser?.name || null,
      createdAt: n.createdAt.toISOString(),
      readCount: n._count.reads,
    }));

    const users = await db.user.findMany({
      where: {
        role: {
          not: "super_admin",
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    });

    return (
      <>
        <SiteHeader
          title="Notifications"
          subtitle="Send and manage platform notifications"
        />
        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin flex flex-col gap-6 p-4 md:p-6 max-w-4xl">
          <Card className="shrink-0 overflow-hidden border-0 shadow-md">
            <div className="h-1 w-full bg-linear-to-r from-violet-500 via-blue-500 to-cyan-400" />
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                Send Notification
              </CardTitle>
              <CardDescription>
                Broadcast to all users or target a specific person.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SendNotificationForm users={users} />
            </CardContent>
          </Card>

          <Card className="shrink-0 overflow-hidden border-0 shadow-md">
            <div className="h-1 w-full bg-linear-to-r from-emerald-500 via-teal-400 to-cyan-400" />
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                Sent Notifications
              </CardTitle>
              <CardDescription>
                {notifications.length} notification
                {notifications.length !== 1 ? "s" : ""} sent so far.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminNotificationTable notifications={notifications} />
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Regular user: their inbox (broadcast + targeted)
  const notificationsRaw = await db.notification.findMany({
    where: {
      OR: [{ targetUserId: null }, { targetUserId: session.user.id }],
    },
    include: {
      reads: {
        where: { userId: session.user.id },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const inbox: NotificationItem[] = notificationsRaw.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    type: n.type,
    createdAt: n.createdAt.toISOString(),
    isRead: n.reads.length > 0,
  }));

  const unreadCount = inbox.filter((n) => !n.isRead).length;

  return (
    <>
      <SiteHeader
        title="Notifications"
        subtitle={
          unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
            : "You're all caught up"
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin flex flex-col gap-6 p-4 md:p-6 max-w-3xl">
        <NotificationList notifications={inbox} />
      </div>
    </>
  );
}
