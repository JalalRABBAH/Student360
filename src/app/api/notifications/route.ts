import { NextResponse } from "next/server";

import { apiSession } from "@/lib/auth/server";
import { listNotifications, markAllNotificationsRead, unreadNotificationCount } from "@/lib/notifications/service";

export async function GET() {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const [notifications, unread] = await Promise.all([listNotifications(session!), unreadNotificationCount(session!)]);
  return NextResponse.json({ notifications, unread });
}

export async function POST() {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const updated = await markAllNotificationsRead(session!);
  return NextResponse.json({ ok: true, updated });
}
