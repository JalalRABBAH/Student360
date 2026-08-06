import { prisma } from "@/lib/db";
import type { SessionPayload } from "@/lib/auth/session";

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  linkUrl: string | null;
  priority: string;
  read: boolean;
  createdAt: string;
};

export async function listNotifications(session: SessionPayload, limit = 30): Promise<AppNotification[]> {
  const rows = await prisma.notification.findMany({
    where: { userId: session.sub },
    orderBy: [{ readAt: "asc" }, { createdAt: "desc" }],
    take: limit,
  });
  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    linkUrl: row.linkUrl,
    priority: row.priority,
    read: row.readAt !== null,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function unreadNotificationCount(session: SessionPayload): Promise<number> {
  return prisma.notification.count({ where: { userId: session.sub, readAt: null } });
}

export async function unreadMessageCount(session: SessionPayload): Promise<number> {
  return prisma.messageRecipient.count({ where: { userId: session.sub, readAt: null } });
}

export async function markAllNotificationsRead(session: SessionPayload): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: { userId: session.sub, readAt: null },
    data: { readAt: new Date() },
  });
  return result.count;
}
