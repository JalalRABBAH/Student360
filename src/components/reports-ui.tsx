"use client";

import { useState } from "react";
import { Check, FileSpreadsheet, FileText, ShieldCheck, Users } from "lucide-react";
import { FilterBar, MetricCard, PageHeader, ProgressBar, StatusBadge } from "@/components/demo-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/i18n/provider";
import { intlLocale } from "@/i18n/config";
import { REPORT_SCOPE_LABELS, type ReportsData } from "@/lib/admin/reports-data";

export function ReportsPage({ data }: { data: ReportsData }) {
  const { t, locale } = useI18n();
  const [ready, setReady] = useState<string[]>([]);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");

  const formatDateTime = (iso: string) =>
    new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

  const visibleClasses = data.classes.filter((c) => {
    const matchesScope = filter === "All" || c.gradeLevel === filter;
    return matchesScope && c.name.toLowerCase().includes(query.trim().toLowerCase());
  });

  const exportCsv = () => {
    const header = ["Class", "Grade", "Students", "Attendance %", "Homework %", "Engagement %", "Positive", "Attention"];
    const rows = data.classes.map((c) => [c.name, c.gradeLevel, c.students, c.attendance ?? "", c.homework ?? "", c.engagement ?? "", c.positive, c.attention]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "student360-class-weekly-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const gradeFilters = ["All", ...[...new Set(data.classes.map((c) => c.gradeLevel))]];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Reports")}
        description={t("Generate concise student, class and school reports with privacy-aware content.")}
        actions={
          <Button onClick={exportCsv} disabled={!data.classes.length}>
            <FileSpreadsheet className="me-2 h-4 w-4" />
            {t("Export CSV")}
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label={t("Available templates")} value={data.metrics.templates} detail={t("Student, class and school")} icon={FileText} />
        <MetricCard label={t("Generated this month")} value={data.metrics.generatedMonth} detail={t("Logged with actor and time")} icon={Check} tone="sky" />
        <MetricCard label={t("Weekly report ready")} value={data.metrics.classesReady} detail={t("One per active class")} icon={Users} tone="amber" />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{t("Report templates")}</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.templates.map((template) => (
            <Card key={template.id} className="p-5">
              <div className="flex justify-between">
                <div className="rounded-xl bg-sky-50 p-2.5 text-sky-600 dark:bg-sky-500/10"><FileText className="h-5 w-5" /></div>
                <StatusBadge tone="neutral">{t(REPORT_SCOPE_LABELS[template.scope])}</StatusBadge>
              </div>
              <h3 className="mt-4 font-bold">{t(template.title)}</h3>
              <p className="mt-1 min-h-10 text-sm text-slate-500">{t(template.description)}</p>
              <div className="mt-5">
                <Button
                  className="w-full"
                  variant={ready.includes(template.id) ? "secondary" : "default"}
                  onClick={() => setReady((current) => (current.includes(template.id) ? current : [...current, template.id]))}
                >
                  {ready.includes(template.id) ? (<><Check className="me-2 h-4 w-4" />{t("Ready")}</>) : t("Generate preview")}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{t("Class weekly reports")}</h2>
        <FilterBar
          placeholder={t("Search class")}
          filters={gradeFilters}
          query={query}
          onQueryChange={setQuery}
          active={filter}
          onActiveChange={setFilter}
        />
        {visibleClasses.length ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleClasses.map((c) => (
              <Card key={c.classId} className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold">{c.gradeLevel} {c.name}</h3>
                    <p className="text-xs text-slate-500">{c.students} {t("students")}</p>
                  </div>
                  <div className="flex gap-1">
                    {c.positive ? <StatusBadge tone="positive">+{c.positive}</StatusBadge> : null}
                    {c.attention ? <StatusBadge tone="attention">{c.attention}</StatusBadge> : null}
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <ProgressBar value={c.attendance ?? 0} label={t("Attendance")} />
                  <ProgressBar value={c.homework ?? 0} label={t("Homework")} tone="sky" />
                  <ProgressBar value={c.engagement ?? 0} label={t("Engagement")} tone="amber" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-sm text-slate-500">{t("No classes match your search")}</Card>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{t("Recent exports")}</h2>
        <Card className="overflow-hidden">
          {data.exports.length ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.exports.map((exported) => (
                <div key={exported.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-slate-100 p-2 text-slate-600 dark:bg-slate-800"><FileSpreadsheet className="h-4 w-4" /></div>
                    <div>
                      <div className="text-sm font-semibold">{t("Report exported")}</div>
                      <div className="text-xs text-slate-500">{exported.actorName ?? "—"} · {formatDateTime(exported.createdAt)}</div>
                    </div>
                  </div>
                  <StatusBadge tone="info"><ShieldCheck className="me-1 h-3 w-3" />{t("Audited")}</StatusBadge>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-8 text-center text-sm text-slate-500">{t("No exports recorded yet")}</p>
          )}
        </Card>
      </div>
    </div>
  );
}
