import { requireSession } from "@/lib/auth/server";
import { hasRole, isLeadership } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/domain/enums";
import { accessibleModules, MODULE_CATEGORIES } from "@/lib/modules/registry";
import { ModuleLobbyPage, type LobbyModule } from "@/components/module-lobby";
import { redirect } from "next/navigation";
import { defaultLocale, isLocale, localizePath } from "@/i18n/config";
import { headers } from "next/headers";

// Per-role route overrides for modules in the lobby.
const ROUTE_OVERRIDES: Record<string, Record<string, string>> = {
  PARENT: { students: "/children", calendar: "/today", performance: "/progress" },
  STUDENT: { calendar: "/today", performance: "/progress" },
  SUPER_ADMIN: { establishments: "/schools" },
};

export default async function Page() {
  const session = await requireSession();

  // School group managers / leadership without an active establishment land on the group page.
  if (isLeadership(session) && !session.schoolId && !hasRole(session, ROLES.SUPER_ADMIN)) {
    const requestHeaders = await headers();
    const localeValue = requestHeaders.get("x-s360-locale");
    redirect(localizePath("/establishments", isLocale(localeValue) ? localeValue : defaultLocale));
  }

  const modules = accessibleModules(session.roles);
  const primary = session.roles.includes("SUPER_ADMIN") ? "SUPER_ADMIN" : session.roles[0] ?? "TEACHER";
  const overrides = ROUTE_OVERRIDES[primary] ?? {};

  const lobby: LobbyModule[] = modules.map((m) => ({
    code: m.code,
    label: m.label,
    category: m.category,
    icon: m.icon,
    href: overrides[m.code] ?? m.href,
    placeholder: m.placeholder,
  }));

  return <ModuleLobbyPage modules={lobby} categories={MODULE_CATEGORIES} />;
}
