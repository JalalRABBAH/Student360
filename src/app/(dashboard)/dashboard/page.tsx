import { requireSession } from "@/lib/auth/server";
import { getDashboard } from "@/lib/dashboard/service";
import { DashboardPage } from "@/components/dashboard-page";
import { hasRole, isLeadership } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/domain/enums";
import { redirect } from "next/navigation";
import { defaultLocale, isLocale, localizePath } from "@/i18n/config";
import { headers } from "next/headers";

export default async function Page() {
  const session = await requireSession();

  // School group managers / leadership without an active establishment land on the group page.
  if (isLeadership(session) && !session.schoolId && !hasRole(session, ROLES.SUPER_ADMIN)) {
    const requestHeaders = await headers();
    const localeValue = requestHeaders.get("x-s360-locale");
    redirect(localizePath("/establishments", isLocale(localeValue) ? localeValue : defaultLocale));
  }

  const data = await getDashboard(session);
  return <DashboardPage data={data} />;
}
