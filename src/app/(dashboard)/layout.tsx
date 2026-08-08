import { requireSession } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { AppShell, type SessionUser } from "@/components/app-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { redirect } from "next/navigation";
import type { RoleCode } from "@/lib/domain/enums";
import { headers } from "next/headers";
import { defaultLocale, isLocale, localizePath } from "@/i18n/config";
import { listNotifications, unreadMessageCount, unreadNotificationCount } from "@/lib/notifications/service";
import { managedSchoolsFor } from "@/lib/platform/service";

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

  const [notifications, unreadNotifications] = await Promise.all([
    listNotifications(session),
    unreadNotificationCount(session),
  ]);

  const isGroupAdmin = roles.some((role) => ["SCHOOL_MANAGER", "SUPER_ADMIN", "ADMIN", "PRINCIPAL"].includes(role));
  const managedSchools = isGroupAdmin ? await managedSchoolsFor(session) : [];
  const showSwitcher =
    isGroupAdmin &&
    (roles.includes("SCHOOL_MANAGER") || roles.includes("SUPER_ADMIN") || managedSchools.length > 1);

  return (
    <ThemeProvider>
      <AppShell
        user={sessionUser}
        notifications={notifications}
        unreadNotifications={unreadNotifications}
        managedSchools={managedSchools}
        currentSchoolId={session.schoolId}
        showSwitcher={showSwitcher}
      >
        {children}
      </AppShell>
    </ThemeProvider>
  );
}
