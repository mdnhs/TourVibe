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
    const notifications = db
      .prepare(
        `SELECT n.*,
                u.name as targetUserName,
                COUNT(nr.userId) as readCount
         FROM notification n
         LEFT JOIN user u ON n.targetUserId = u.id
         LEFT JOIN notification_read nr ON nr.notificationId = n.id
         GROUP BY n.id
         ORDER BY n.createdAt DESC`,
      )
      .all() as AdminNotification[];

    const users = db
      .prepare("SELECT id, name, email FROM user WHERE role != 'super_admin' ORDER BY name")
      .all() as { id: string; name: string; email: string }[];

    return (
      <>
        <SiteHeader
          title="Notifications"
          subtitle="Send and manage platform notifications"
        />
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Send Notification</CardTitle>
              <CardDescription>
                Broadcast to all users or target a specific person.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SendNotificationForm users={users} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sent Notifications</CardTitle>
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
  type RawNotif = {
    id: string;
    title: string;
    body: string;
    type: string;
    createdAt: string;
    isRead: number;
  };

  const notifications = db
    .prepare(
      `SELECT n.id, n.title, n.body, n.type, n.createdAt,
              CASE WHEN nr.userId IS NOT NULL THEN 1 ELSE 0 END as isRead
       FROM notification n
       LEFT JOIN notification_read nr
         ON nr.notificationId = n.id AND nr.userId = ?
       WHERE n.targetUserId IS NULL OR n.targetUserId = ?
       ORDER BY n.createdAt DESC`,
    )
    .all(session.user.id, session.user.id) as RawNotif[];

  const inbox: NotificationItem[] = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    type: n.type,
    createdAt: n.createdAt,
    isRead: n.isRead === 1,
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
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-3xl">
        <NotificationList notifications={inbox} />
      </div>
    </>
  );
}
