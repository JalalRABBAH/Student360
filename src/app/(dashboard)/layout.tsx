import { requireSession } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { AppShell, type SessionUser } from "@/components/app-shell";
import { navigationForRoles, type NavSpec } from "@/components/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { redirect } from "next/navigation";
import type { RoleCode } from "@/lib/domain/enums";
import { headers } from "next/headers";
import { defaultLocale, isLocale, localizePath } from "@/i18n/config";
import { listNotifications, unreadMessageCount, unreadNotificationCount } from "@/lib/notifications/service";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const requestHeaders = await headers();
  const localeValue = requestHeaders.get("x-s360-locale");
  const locale = isLocale(localeValue) ? localeValue : defaultLocale;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: {
      school: true,
      roles: { select: { roleCode: true } },
      student: { select: { id: true } },
      teacher: { select: { id: true } },
      guardian: { select: { id: true } },
    },
  });

  if (!user) redirect(localizePath("/login", locale));

  const roles = user.roles.map((r) => r.roleCode);
  const sessionUser: SessionUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    roles,
    schoolName: user.school?.name,
    avatarUrl: user.avatarUrl,
  };

  const [notifications, unreadNotifications, unreadMessages] = await Promise.all([
    listNotifications(session),
    unreadNotificationCount(session),
    unreadMessageCount(session),
  ]);

  const navSpecs = navigationForRoles(roles as RoleCode[]).map((group) => ({
    ...group,
    items: group.items.map((item): NavSpec => (item.href === "/messages" && unreadMessages > 0 ? { ...item, badge: unreadMessages } : item)),
  }));

  return (
    <ThemeProvider>
      <AppShell groups={navSpecs} user={sessionUser} notifications={notifications} unreadNotifications={unreadNotifications}>
        {children}
      </AppShell>
    </ThemeProvider>
  );
}
