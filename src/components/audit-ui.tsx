"use client";

import { useState } from "react";
import { FileText, LogIn, MessageSquare, ShieldCheck, Users } from "lucide-react";
import { FilterBar, MetricCard, PageHeader, StatusBadge } from "@/components/demo-ui";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/i18n/provider";
import { intlLocale } from "@/i18n/config";
import { AUDIT_CATEGORIES, type AuditEntry, type AuditOverview } from "@/lib/audit/service";

const ACTION_TONE: Record<string, "info" | "positive" | "attention" | "neutral"> = {
  LOGIN: "positive",
  LOGOUT: "neutral",
  SEND_MESSAGE: "info",
  CREATE_THREAD: "info",
};

export function AuditPage({ logs, overview }: { logs: AuditEntry[]; overview: AuditOverview }) {
  const { t, locale } = useI18n();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All actions");

  const formatDateTime = (iso: string) =>
    new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

  const visible = logs.filter((log) => {
    const matchesQuery = [log.actorName, log.actorRole, log.action, log.category, log.detail, log.schoolName, log.entityType]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    return matchesQuery && (category === "All actions" || log.category === category);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Audit log")}
        description={t("Security and privacy trail for sensitive access and platform actions.")}
        actions={
          <p className="max-w-sm text-right text-xs text-slate-500">
            <ShieldCheck className="me-1 inline h-3.5 w-3.5" />
            {t("Append-only trail. Records cannot be edited or deleted.")}
          </p>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t("Events today")} value={overview.eventsToday} detail={t("Recorded across the visible scope")} icon={ShieldCheck} />
        <MetricCard label={t("Logins today")} value={overview.loginsToday} detail={t("Authentication events")} icon={LogIn} tone="sky" />
        <MetricCard label={t("Messages today")} value={overview.messagesToday} detail={t("Sent and logged with actor")} icon={MessageSquare} tone="amber" />
        <MetricCard label={t("Active sessions")} value={overview.activeSessions} detail={t("Current valid sessions")} icon={Users} tone="violet" />
      </div>
      <FilterBar
        placeholder={t("Search actor, action or entity")}
        filters={[...AUDIT_CATEGORIES]}
        query={query}
        onQueryChange={setQuery}
        active={category}
        onActiveChange={setCategory}
      />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-3">{t("Time")}</th>
                <th className="px-4 py-3">{t("Actor")}</th>
                <th className="px-4 py-3">{t("Action")}</th>
                <th className="px-4 py-3">{t("Details")}</th>
                <th className="px-4 py-3">{t("School")}</th>
                <th className="px-4 py-3">{t("IP address")}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((log) => (
                <tr key={log.id} className="border-t border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/60">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDateTime(log.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900 dark:text-white">{log.actorName ?? "—"}</div>
                    <div className="text-xs text-slate-500">{log.actorRole ? t(log.actorRole) : "—"}</div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge tone={ACTION_TONE[log.action] ?? "neutral"}>{log.action}</StatusBadge></td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {log.detail ? t(log.detail) : log.entityType ?? "—"}
                    {log.entityType && log.detail ? <span className="block text-xs text-slate-400">{log.entityType}</span> : null}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{log.schoolName ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-400" dir="ltr">{log.ip ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visible.length ? <p className="p-8 text-center text-sm text-slate-500">{t("No audit events match your search")}</p> : null}
        </div>
      </Card>
    </div>
  );
}
