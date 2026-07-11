"use server";

import { prisma } from "@/lib/prisma";
import { requireDashboardSession } from "@/lib/dashboard";

export async function getUnreadCount() {
  try {
    const { session, isSuperAdmin } = await requireDashboardSession();
    
    let messageCount = 0;
    if (isSuperAdmin) {
      messageCount = await prisma.contactMessage.count({
        where: { status: "unread" }
      });
    }

    const notificationCount = await prisma.notification.count({
      where: {
        OR: [{ targetUserId: null }, { targetUserId: session.user.id }],
        reads: { none: { userId: session.user.id } },
      },
    });

    return messageCount + notificationCount;
  } catch (err) {
    return 0;
  }
}

export async function getRecentNotifications() {
  try {
    const { session, isSuperAdmin } = await requireDashboardSession();
    
    let messages: any[] = [];
    if (isSuperAdmin) {
      const rawMessages = await prisma.contactMessage.findMany({
        where: { status: "unread" },
        orderBy: { createdAt: "desc" },
        take: 5,
      });
      messages = rawMessages.map(m => ({
        id: m.id,
        title: "New Contact Message",
        body: `From: ${m.name} - ${m.subject}`,
        createdAt: m.createdAt,
        type: "message",
        href: "/dashboard/messages",
      }));
    }

    const rawNotifications = await prisma.notification.findMany({
      where: {
        OR: [{ targetUserId: null }, { targetUserId: session.user.id }],
        reads: { none: { userId: session.user.id } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    
    const notifications = rawNotifications.map(n => ({
      id: n.id,
      title: n.title,
      body: n.body,
      createdAt: n.createdAt,
      type: "notification",
      href: "/dashboard/notifications",
    }));

    // Merge and sort
    const combined = [...messages, ...notifications]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    return combined;
  } catch (err) {
    return [];
  }
}
