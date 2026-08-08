"use client";

import { useState } from "react";
import { LocalizedLink as Link, useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { GlobalSearch, NotificationCenter, UserMenu } from "@/components/global-tools";
import { LanguageSwitcher } from "@/components/language-switcher";
import { EstablishmentSwitcher } from "@/components/establishment-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
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

function TopBar({
  user,
  notifications,
  unreadNotifications,
}: {
  user: SessionUser;
  notifications?: import("@/lib/notifications/service").AppNotification[];
  unreadNotifications?: number;
}) {
  const { t, href } = useI18n();
  return (
    <header
      className="fixed inset-x-0 top-0 z-30 flex h-[var(--topbar-height)] items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80 sm:px-6 lg:px-8"
    >
      <div className="flex min-w-0 items-center gap-3">
        <Link href={href("/dashboard")} className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-bold text-white shadow-sm">
            360
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
            STUDENT<span className="text-primary-600 dark:text-primary-400">360</span>
          </span>
        </Link>
        <div className="hidden h-6 w-px bg-slate-200 dark:bg-slate-800 sm:block" />
        <div className="hidden items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 sm:flex">
          <span className="text-slate-400">{user.schoolName ?? ""}</span>
          {user.roles.length ? (
            <span className="text-slate-400">
              · {user.roles.map((role) => t(ROLE_LABELS[role as RoleCode])).join(", ")}
            </span>
          ) : null}
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
  user,
  children,
  notifications = [],
  unreadNotifications = 0,
  managedSchools = [],
  currentSchoolId = null,
  showSwitcher = false,
}: {
  user: SessionUser;
  children: React.ReactNode;
  notifications?: import("@/lib/notifications/service").AppNotification[];
  unreadNotifications?: number;
  managedSchools?: { id: string; name: string }[];
  currentSchoolId?: string | null;
  showSwitcher?: boolean;
}) {
  return (
    <div className="min-h-screen">
      <TopBar user={user} notifications={notifications} unreadNotifications={unreadNotifications} />
      <main className="min-h-screen pt-[var(--topbar-height)]">
        {showSwitcher && managedSchools.length > 0 ? (
          <EstablishmentSwitcher schools={managedSchools} currentSchoolId={currentSchoolId} />
        ) : null}
        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
