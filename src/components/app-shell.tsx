"use client";

import { LocalizedLink as Link } from "@/i18n/provider";
import { usePathname } from "next/navigation";
import { cn, initials } from "@/lib/utils";
import { SidebarItem } from "@/components/sidebar-item";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, PanelLeftClose, PanelLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { iconMap, type IconName } from "@/components/navigation";
import { GlobalSearch, NotificationCenter, UserMenu } from "@/components/global-tools";
import { LanguageSwitcher } from "@/components/language-switcher";
import { EstablishmentSwitcher } from "@/components/establishment-switcher";
import { stripLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { ROLE_LABELS, type RoleCode } from "@/lib/domain/enums";

export type SessionUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  schoolName?: string;
  avatarUrl?: string | null;
};

type NavSpec = { label: string; href: string; icon: IconName; badge?: number | string; children?: { label: string; href: string }[] };

type SidebarProps = {
  groups: { label: string; items: NavSpec[] }[];
  user: SessionUser;
  collapsed: boolean;
  onToggleCollapse: () => void;
};

export function Sidebar({ groups, user, collapsed, onToggleCollapse }: SidebarProps) {
  const { href, t } = useI18n();
  return (
    <aside
      className={cn(
        "sidebar-anchor fixed inset-y-0 z-40 hidden flex-col border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-950 lg:flex",
        collapsed ? "w-[var(--sidebar-collapsed)]" : "w-[var(--sidebar-width)]",
      )}
    >
      <div className="flex h-[var(--topbar-height)] items-center justify-between border-b border-slate-100 px-4 dark:border-slate-800">
        {!collapsed ? (
          <Link href={href("/dashboard")} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-bold text-white shadow-sm">
              360
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              STUDENT
              <span className="text-primary-600 dark:text-primary-400">360</span>
            </span>
          </Link>
        ) : (
          <Link href={href("/dashboard")} className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-xs font-bold text-white shadow-sm">
            360
          </Link>
        )}
        <button
          onClick={onToggleCollapse}
          className={cn(
            "hidden rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 lg:block dark:hover:bg-slate-800 dark:hover:text-slate-300",
            collapsed && "absolute inset-x-0 top-[0.85rem] mx-auto w-fit",
          )}
          aria-label={collapsed ? t("Expand sidebar") : t("Collapse sidebar")}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {groups.map((group) => (
          <div key={group.label} className={cn("mb-5", collapsed && "mb-3")}>
            {!collapsed && (
              <h3 className="mb-2 px-5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {t(group.label)}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <SidebarItem key={item.href} item={{ ...item, label: t(item.label), children: item.children?.map((child) => ({ ...child, label: t(child.label) })), icon: iconMap[item.icon] }} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3 dark:border-slate-800">
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-900",
            collapsed && "justify-center",
          )}
        >
          <Avatar className="h-9 w-9 shrink-0">
            {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} className="object-cover" /> : null}
            <AvatarFallback className="bg-gradient-to-br from-sky-400 to-indigo-600 text-xs font-semibold text-white">
              {initials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.roles.map((role) => t(ROLE_LABELS[role as RoleCode])).join(", ")}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export function MobileSidebar({ groups, user }: { groups: { label: string; items: NavSpec[] }[]; user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const { direction, href, t } = useI18n();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t("Open navigation")}>
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side={direction === "rtl" ? "right" : "left"} className="w-[var(--sidebar-width)] p-0">
        <div className="flex h-[var(--topbar-height)] items-center border-b border-slate-100 px-4 dark:border-slate-800">
          <Link href={href("/dashboard")} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-bold text-white shadow-sm">
              360
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              STUDENT
              <span className="text-primary-600 dark:text-primary-400">360</span>
            </span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {groups.map((group) => (
            <div key={group.label} className="mb-5">
              <h3 className="mb-2 px-5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {t(group.label)}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <div key={item.href} onClick={() => setOpen(false)}>
                    <SidebarItem item={{ ...item, label: t(item.label), children: item.children?.map((child) => ({ ...child, label: t(child.label) })), icon: iconMap[item.icon] }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          <div className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-900">
            <Avatar className="h-9 w-9">
              {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} className="object-cover" /> : null}
              <AvatarFallback className="bg-gradient-to-br from-sky-400 to-indigo-600 text-xs font-semibold text-white">
                {initials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.roles.map((role) => t(ROLE_LABELS[role as RoleCode])).join(", ")}</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function TopBar({
  user,
  mobileSidebar,
  collapsed,
  onToggleCollapse,
  notifications,
  unreadNotifications,
}: {
  user: SessionUser;
  mobileSidebar: React.ReactNode;
  collapsed: boolean;
  onToggleCollapse: () => void;
  notifications?: import("@/lib/notifications/service").AppNotification[];
  unreadNotifications?: number;
}) {
  const { t } = useI18n();
  const pathname = usePathname();
  const barePathname = pathname ? stripLocale(pathname) : "";
  const segments = barePathname.split("/").filter(Boolean);
  const [section, resourceId] = segments;
  const [resourceLabel, setResourceLabel] = useState<string | null>(null);
  useEffect(() => {
    if (resourceId && (section === "students" || section === "classes")) {
      let cancelled = false;
      fetch(`/api/resources?type=${section}&id=${encodeURIComponent(resourceId)}`)
        .then((response) => (response.ok ? response.json() : { name: null }))
        .then((data: { name: string | null }) => {
          if (!cancelled) setResourceLabel(data.name);
        })
        .catch(() => {});
      return () => {
        cancelled = true;
      };
    }
    setResourceLabel(null);
  }, [section, resourceId]);
  const breadcrumb = resourceLabel ?? segments.map((segment) => t(segment.replace(/-/g, " "))).join(" / ");

  return (
    <header
      className={cn(
        "fixed top-0 z-30 flex h-[var(--topbar-height)] items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80 sm:px-6 lg:px-8",
        "inset-x-0",
        collapsed ? "lg:start-[var(--sidebar-collapsed)]" : "lg:start-[var(--sidebar-width)]",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {mobileSidebar}
        <button
          onClick={onToggleCollapse}
          className="hidden rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 lg:block dark:hover:bg-slate-800 dark:hover:text-slate-300"
          aria-label={collapsed ? t("Expand sidebar") : t("Collapse sidebar")}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
        <div className="hidden h-6 w-px bg-slate-200 dark:bg-slate-800 sm:block" />
        <div className="hidden items-center gap-2 text-sm text-slate-500 dark:text-slate-400 sm:flex">
          <span className="font-medium text-slate-900 dark:text-slate-100">{user.schoolName ?? t("STUDENT360")}</span>
          {barePathname && barePathname !== "/dashboard" && (
            <>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="capitalize">{breadcrumb}</span>
            </>
          )}
        </div>
      </div>

      <div className="ms-auto flex items-center gap-2 sm:gap-3">
        <GlobalSearch />
        <NotificationCenter initial={notifications} initialUnread={unreadNotifications} />
        <LanguageSwitcher />
        <ThemeToggle />
        <UserMenu user={user} />
      </div>
    </header>
  );
}

export function AppShell({
  groups,
  user,
  children,
  notifications = [],
  unreadNotifications = 0,
  managedSchools = [],
  currentSchoolId = null,
  showSwitcher = false,
}: {
  groups: { label: string; items: NavSpec[] }[];
  user: SessionUser;
  children: React.ReactNode;
  notifications?: import("@/lib/notifications/service").AppNotification[];
  unreadNotifications?: number;
  managedSchools?: { id: string; name: string }[];
  currentSchoolId?: string | null;
  showSwitcher?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar groups={groups} user={user} collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />
      <TopBar
        user={user}
        mobileSidebar={<MobileSidebar groups={groups} user={user} />}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        notifications={notifications}
        unreadNotifications={unreadNotifications}
      />
      <main
        className={cn(
          "min-h-screen pt-[var(--topbar-height)] transition-all duration-300",
          collapsed ? "lg:ps-[var(--sidebar-collapsed)]" : "lg:ps-[var(--sidebar-width)]",
        )}
      >
        {showSwitcher && managedSchools.length > 0 ? <EstablishmentSwitcher schools={managedSchools} currentSchoolId={currentSchoolId} /> : null}
        <div className="page-container">{children}</div>
      </main>
    </div>
  );
}
