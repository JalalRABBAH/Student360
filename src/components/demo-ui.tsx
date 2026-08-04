"use client";

import { LocalizedLink as Link } from "@/i18n/provider";
import { useMemo, useState } from "react";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronRight, CircleAlert, Clock3, Download,
  Filter, MoreHorizontal, Plus, Search, Sparkles, TrendingUp, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { demoStudents, type DemoStudent } from "@/lib/demo-data";
import { useI18n } from "@/i18n/provider";

export function PageHeader({ title, description, actions }: { title: string; description: string; actions?: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-600 dark:text-primary-400">{t("Student success intelligence")}</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">{t(title)}</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{t(description)}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatusBadge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "positive" | "neutral" | "watch" | "attention" | "info" }) {
  const { t } = useI18n();
  const styles = {
    positive: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
    neutral: "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
    watch: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
    attention: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20",
    info: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset", styles[tone])}>{typeof children === "string" ? t(children) : children}</span>;
}

export function Trend({ value, suffix = "pts" }: { value: number; suffix?: string }) {
  const positive = value > 0;
  const Icon = positive ? ArrowUpRight : value < 0 ? ArrowDownRight : ArrowRight;
  return <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", positive ? "text-emerald-600" : value < 0 ? "text-rose-600" : "text-slate-500")}><Icon className="h-3.5 w-3.5" />{positive ? "+" : ""}{value} {suffix}</span>;
}

export function MetricCard({ label, value, detail, trend, icon: Icon = TrendingUp, tone = "primary" }: {
  label: string; value: string | number; detail: string; trend?: number; icon?: React.ElementType; tone?: "primary" | "sky" | "amber" | "violet";
}) {
  const { t } = useI18n();
  const colors = {
    primary: "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400",
    sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    violet: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  };
  return (
    <Card className="group p-5 transition-transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className={cn("rounded-xl p-2.5", colors[tone])}><Icon className="h-5 w-5" /></div>
        {trend !== undefined ? <Trend value={trend} /> : null}
      </div>
      <div className="mt-5 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{value}</div>
      <div className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">{t(label)}</div>
      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t(detail)}</div>
    </Card>
  );
}

export function ProgressBar({ value, tone = "primary", label }: { value: number; tone?: "primary" | "sky" | "amber" | "rose"; label?: string }) {
  const { t, formatNumber } = useI18n();
  const colors = { primary: "bg-primary-500", sky: "bg-sky-500", amber: "bg-amber-500", rose: "bg-rose-500" };
  return (
    <div className="w-full">
      {label ? <div className="mb-1.5 flex justify-between text-xs text-slate-500"><span>{t(label)}</span><span dir="ltr">{formatNumber(value)}%</span></div> : null}
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={cn("h-full rounded-full transition-all", colors[tone])} style={{ width: `${Math.max(3, value)}%` }} /></div>
    </div>
  );
}

export function MiniBars({ values, color = "bg-primary-500" }: { values: number[]; color?: string }) {
  return <div className="flex h-12 items-end gap-1">{values.map((value, index) => <div key={index} className={cn("flex-1 rounded-sm opacity-80", color)} style={{ height: `${value}%` }} />)}</div>;
}

export function DemoDialog({ open, onClose, title, children, onConfirm, confirmLabel = "Save changes" }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; onConfirm?: () => void; confirmLabel?: string;
}) {
  const { t } = useI18n();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-950" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-slate-950 dark:text-white">{t(title)}</h2><Button variant="ghost" size="icon" onClick={onClose}><MoreHorizontal className="h-5 w-5" /></Button></div>
        <div className="my-5">{children}</div>
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>{t("Cancel")}</Button><Button onClick={() => { onConfirm?.(); onClose(); }}><Check className="me-2 h-4 w-4" />{t(confirmLabel)}</Button></div>
      </div>
    </div>
  );
}

export function ActionButton({ label, title = label, children, confirmLabel, variant = "default", onConfirm }: {
  label: string; title?: string; children: React.ReactNode; confirmLabel?: string; variant?: "default" | "outline" | "ghost"; onConfirm?: () => void;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>{done ? <Check className="me-2 h-4 w-4" /> : <Plus className="me-2 h-4 w-4" />}{done ? t("Saved") : t(label)}</Button>
      <DemoDialog open={open} onClose={() => setOpen(false)} title={title} confirmLabel={confirmLabel} onConfirm={() => { setDone(true); onConfirm?.(); }}>{children}</DemoDialog>
    </>
  );
}

export function FilterBar({ placeholder = "Search", filters = ["All", "Active", "Attention"], query: controlledQuery, onQueryChange, active: controlledActive, onActiveChange }: { placeholder?: string; filters?: string[]; query?: string; onQueryChange?: (value: string) => void; active?: string; onActiveChange?: (value: string) => void }) {
  const { t } = useI18n();
  const [internalQuery, setInternalQuery] = useState("");
  const [internalActive, setInternalActive] = useState(filters[0]);
  const query = controlledQuery ?? internalQuery;
  const active = controlledActive ?? internalActive;
  const setQuery = onQueryChange ?? setInternalQuery;
  const setActive = onActiveChange ?? setInternalActive;
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1"><Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t(placeholder)} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 ps-9 pe-3 text-sm outline-none focus:border-primary-400 dark:border-slate-800 dark:bg-slate-900" /></div>
      <div className="flex gap-1 overflow-x-auto">{filters.map((filter) => <button key={filter} onClick={() => setActive(filter)} className={cn("whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition", active === filter ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800")}>{t(filter)}</button>)}</div>
      <Button variant="outline" size="sm"><Filter className="me-2 h-4 w-4" />{t("Filters")}</Button>
    </div>
  );
}

export function StudentAvatar({ student, size = "md" }: { student: Pick<DemoStudent, "initials" | "name">; size?: "sm" | "md" | "lg" }) {
  return <div title={student.name} className={cn("grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 font-bold text-white shadow-sm", size === "sm" ? "h-8 w-8 text-[10px]" : size === "lg" ? "h-16 w-16 text-lg" : "h-10 w-10 text-xs")}>{student.initials}</div>;
}

export function StudentTable({ students = demoStudents.slice(0, 10) }: { students?: DemoStudent[] }) {
  const { t, href } = useI18n();
  const [query, setQuery] = useState("");
  const rows = useMemo(() => students.filter((student) => student.name.toLowerCase().includes(query.toLowerCase())), [query, students]);
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800"><div><h3 className="font-bold text-slate-950 dark:text-white">{t("Students")}</h3><p className="text-xs text-slate-500">{rows.length} {t("Students").toLowerCase()}</p></div><div className="relative"><Search className="absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-slate-50 ps-8 pe-3 text-xs dark:border-slate-800 dark:bg-slate-900" placeholder={t("Search student")} /></div></div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-900"><tr><th className="px-4 py-3">{t("Student")}</th><th className="px-4 py-3">{t("Academic")}</th><th className="px-4 py-3">{t("Homework")}</th><th className="px-4 py-3">{t("Attendance")}</th><th className="px-4 py-3">{t("Signal")}</th><th /></tr></thead>
          <tbody>{rows.map((student) => <tr key={student.id} className="border-t border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/60"><td className="px-4 py-3"><div className="flex items-center gap-3"><StudentAvatar student={student} /><div><div className="font-semibold text-slate-900 dark:text-white">{student.name}</div><div className="text-xs text-slate-500">{t(student.className)}</div></div></div></td><td className="px-4 py-3 font-semibold">{student.academic}%</td><td className="px-4 py-3">{student.homework}%</td><td className="px-4 py-3">{student.attendance}%</td><td className="px-4 py-3"><StatusBadge tone={student.status === "POSITIVE" ? "positive" : student.status === "ATTENTION" ? "attention" : student.status === "WATCH" ? "watch" : "neutral"}>{t(student.headline)}</StatusBadge></td><td className="px-4 py-3"><Link href={href(`/students/${student.id}`)} className="inline-flex items-center text-xs font-semibold text-primary-600 hover:underline">{t("Open")} <ChevronRight className="h-3.5 w-3.5" /></Link></td></tr>)}</tbody>
        </table>
      </div>
    </Card>
  );
}

export function InsightCard({ title, reasons, positive = false }: { title: string; reasons: string[]; positive?: boolean }) {
  const { t } = useI18n();
  return <div className={cn("rounded-2xl border p-4", positive ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/5" : "border-amber-200 bg-amber-50/70 dark:border-amber-500/20 dark:bg-amber-500/5")}><div className="flex gap-3"><div className={cn("mt-0.5 rounded-lg p-2", positive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10" : "bg-amber-100 text-amber-700 dark:bg-amber-500/10")}>{positive ? <Sparkles className="h-4 w-4" /> : <CircleAlert className="h-4 w-4" />}</div><div><h3 className="text-sm font-bold text-slate-900 dark:text-white">{t(title)}</h3><ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">{reasons.map((reason) => <li key={reason}>• {t(reason)}</li>)}</ul></div></div></div>;
}

export function DownloadButton({ filename = "student360-report.csv" }: { filename?: string }) {
  const { t } = useI18n();
  const download = () => {
    const rows = [["Student", "Class", "Academic", "Homework", "Attendance"], ...demoStudents.map((student) => [student.name, student.className, student.academic, student.homework, student.attendance])];
    const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return <Button variant="outline" onClick={download}><Download className="mr-2 h-4 w-4" />{t("Export CSV")}</Button>;
}

export function EmptyAction({ icon: Icon = Users, title, description, action }: { icon?: React.ElementType; title: string; description: string; action?: React.ReactNode }) {
  const { t } = useI18n();
  return <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700"><div><div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800"><Icon className="h-5 w-5" /></div><h3 className="mt-3 font-bold text-slate-900 dark:text-white">{t(title)}</h3><p className="mt-1 max-w-sm text-sm text-slate-500">{t(description)}</p>{action ? <div className="mt-4">{action}</div> : null}</div></div>;
}

export function TimelineItem({ time, title, description, tone = "neutral" }: { time: string; title: string; description: string; tone?: string }) {
  const { t } = useI18n();
  return <div className="relative flex gap-4 pb-5 last:pb-0"><div className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-4", tone === "positive" ? "bg-emerald-500 ring-emerald-100 dark:ring-emerald-500/10" : tone === "attention" ? "bg-rose-500 ring-rose-100 dark:ring-rose-500/10" : tone === "watch" ? "bg-amber-500 ring-amber-100 dark:ring-amber-500/10" : "bg-sky-500 ring-sky-100 dark:ring-sky-500/10")} /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><h4 className="text-sm font-semibold text-slate-900 dark:text-white">{t(title)}</h4><span className="inline-flex items-center gap-1 text-xs text-slate-400"><Clock3 className="h-3 w-3" />{time}</span></div><p className="mt-1 text-xs text-slate-500">{t(description)}</p></div></div>;
}