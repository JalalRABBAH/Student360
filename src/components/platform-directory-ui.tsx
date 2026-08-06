"use client";

import { useState } from "react";
import { Activity, Building2, GraduationCap, Mail, School, Users } from "lucide-react";
import { FilterBar, MetricCard, PageHeader, ProgressBar, StatusBadge, StudentAvatar } from "@/components/demo-ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";
import type { PlatformOverview, PlatformSchoolEntry, PlatformUserEntry } from "@/lib/platform/service";

const ROLE_FILTERS = [
  { code: "ALL", label: "All" },
  { code: "STUDENT", label: "Student" },
  { code: "TEACHER", label: "Teacher" },
  { code: "PARENT", label: "Parent / Guardian" },
  { code: "NURSE", label: "School nurse" },
  { code: "ADMIN", label: "School administration" },
  { code: "PRINCIPAL", label: "School management" },
  { code: "SUPER_ADMIN", label: "Platform administrator" },
] as const;

const ROLE_CODE_BY_LABEL: Record<string, string> = Object.fromEntries(ROLE_FILTERS.map((f) => [f.label, f.code]));

const SCHOOL_FILTERS = ["All", "Active", "Trial", "Suspended", "Archived"] as const;
const SCHOOL_STATUS_BY_LABEL: Record<string, string> = {
  Active: "ACTIVE",
  Suspended: "SUSPENDED",
  Archived: "ARCHIVED",
};

function statusTone(status: string): "positive" | "neutral" | "watch" | "attention" {
  if (status === "ACTIVE") return "positive";
  if (status === "SUSPENDED") return "attention";
  if (status === "TRIAL") return "watch";
  return "neutral";
}

function statusLabel(status: string) {
  if (status === "ACTIVE") return "Active";
  if (status === "SUSPENDED") return "Suspended";
  if (status === "TRIAL") return "Trial";
  if (status === "ARCHIVED") return "Archived";
  return "Inactive";
}

// ---------------------------------------------------------------------------
// Platform users directory
// ---------------------------------------------------------------------------

export function UsersPage({ users, overview }: { users: PlatformUserEntry[]; overview: PlatformOverview }) {
  const { t, formatDate } = useI18n();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All");

  const visible = users.filter((user) => {
    const matchesQuery = `${user.name} ${user.email} ${user.roleLabel} ${user.schoolName ?? ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    const matchesRole = role === "All" || user.roleCodes.includes(ROLE_CODE_BY_LABEL[role]);
    return matchesQuery && matchesRole;
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t("Users")} description={t("Platform-wide user directory and access overview.")} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t("Total users")} value={overview.totalUsers} detail={t("All accounts on the platform")} icon={Users} />
        <MetricCard label={t("Active this month")} value={overview.activeUsers} detail={t("Signed in within the last 30 days")} icon={Activity} tone="sky" />
        <MetricCard label={t("Schools")} value={overview.schools} detail={t("Tenants on the platform")} icon={Building2} tone="amber" />
        <MetricCard label={t("Students")} value={overview.students} detail={t("Active student accounts")} icon={GraduationCap} tone="violet" />
      </div>
      <FilterBar
        placeholder={t("Search name, email or role")}
        filters={ROLE_FILTERS.map((f) => f.label)}
        query={query}
        onQueryChange={setQuery}
        active={role}
        onActiveChange={setRole}
      />
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
          <div><h3 className="font-bold text-slate-950 dark:text-white">{t("Users")}</h3><p className="text-xs text-slate-500">{visible.length} {t("Users").toLowerCase()}</p></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-900">
              <tr><th className="px-4 py-3">{t("Name")}</th><th className="px-4 py-3">{t("Role")}</th><th className="px-4 py-3">{t("School")}</th><th className="px-4 py-3">{t("Status")}</th><th className="px-4 py-3">{t("Last login")}</th><th /></tr>
            </thead>
            <tbody>
              {visible.map((user) => (
                <tr key={user.id} className="border-t border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <StudentAvatar student={user} />
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{t(user.roleLabel)}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.schoolName ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge tone={user.status === "ACTIVE" ? "positive" : "neutral"}>{t(statusLabel(user.status))}</StatusBadge></td>
                  <td className="px-4 py-3 text-slate-500">{user.lastLoginAt ? formatDate(user.lastLoginAt) : "—"}</td>
                  <td className="px-4 py-3">
                    <Button size="icon" variant="ghost" title={user.email} asChild><a href={`mailto:${user.email}`}><Mail className="h-4 w-4" /></a></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visible.length ? <p className="p-8 text-center text-sm text-slate-500">{t("No users match your search")}</p> : null}
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Platform schools directory
// ---------------------------------------------------------------------------

export function SchoolsPage({ schools, overview }: { schools: PlatformSchoolEntry[]; overview: PlatformOverview }) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");

  const visible = schools.filter((school) => {
    const matchesQuery = `${school.name} ${school.city ?? ""} ${school.country} ${school.plan}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    const matchesStatus =
      status === "All" ||
      (status === "Trial" ? school.plan === "TRIAL" : school.status === SCHOOL_STATUS_BY_LABEL[status]);
    return matchesQuery && matchesStatus;
  });

  const seatsPct = overview.seatsLimit ? Math.min(100, Math.round((overview.seatsUsed / overview.seatsLimit) * 100)) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title={t("Schools")} description={t("Multi-tenant platform health and subscription management.")} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t("Active schools")} value={overview.activeSchools} detail={t("Active tenants")} icon={Building2} />
        <MetricCard label={t("Seats used")} value={`${overview.seatsUsed} / ${overview.seatsLimit}`} detail={t("Within plan limits")} icon={Users} tone="sky" />
        <MetricCard label={t("Students")} value={overview.students} detail={t("Active student accounts")} icon={GraduationCap} tone="amber" />
        <MetricCard label={t("Teachers")} value={overview.teachers} detail={t("Active teaching staff")} icon={School} tone="violet" />
      </div>
      <FilterBar
        placeholder={t("Search schools")}
        filters={[...SCHOOL_FILTERS]}
        query={query}
        onQueryChange={setQuery}
        active={status}
        onActiveChange={setStatus}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((school) => {
          const schoolSeats = school.seatsLimit
            ? Math.min(100, Math.round((school.userCount / school.seatsLimit) * 100))
            : 0;
          return (
            <Card key={school.id} className="flex h-full flex-col p-5">
              <div className="flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/10"><Building2 className="h-5 w-5" /></div>
                <StatusBadge tone={statusTone(school.status)}>{t(statusLabel(school.status))}</StatusBadge>
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">{school.name}</h2>
              <p className="text-sm text-slate-500">{school.city ? `${school.city} · ` : ""}{school.country} · <span className="font-semibold">{school.plan} {t("Plan")}</span></p>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900"><div className="font-bold text-slate-900 dark:text-white">{school.userCount}</div><div className="text-[10px] text-slate-500">{t("Users")}</div></div>
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900"><div className="font-bold text-slate-900 dark:text-white">{school.studentCount}</div><div className="text-[10px] text-slate-500">{t("Students")}</div></div>
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900"><div className="font-bold text-slate-900 dark:text-white">{school.teacherCount}</div><div className="text-[10px] text-slate-500">{t("Teachers")}</div></div>
              </div>
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500"><span>{t("Seats used")}</span><span dir="ltr">{school.userCount} / {school.seatsLimit}</span></div>
                <ProgressBar value={schoolSeats} tone={schoolSeats >= 90 ? "rose" : schoolSeats >= 70 ? "amber" : "primary"} />
              </div>
            </Card>
          );
        })}
      </div>
      {!visible.length ? <p className="p-8 text-center text-sm text-slate-500">{t("No schools match your search")}</p> : null}
    </div>
  );
}
