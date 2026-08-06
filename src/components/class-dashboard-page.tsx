"use client";

import { LocalizedLink as Link } from "@/i18n/provider";
import { useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, Eye, Users } from "lucide-react";
import { InsightCard, MetricCard, PageHeader, ProgressBar, StatusBadge, StudentAvatar } from "@/components/demo-ui";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/provider";
import type { ClassDetail } from "@/lib/students/service";

const modes = ["Overview", "Attendance", "Homework", "Engagement", "Signals"] as const;

const SIGNAL_TONE = { POSITIVE: "positive", STABLE: "neutral", WATCH: "watch", ATTENTION: "attention" } as const;

export function ClassDashboardPage({ schoolClass }: { schoolClass: ClassDetail }) {
  const { t, href } = useI18n();
  const [mode, setMode] = useState<(typeof modes)[number]>("Overview");

  const metric = (student: ClassDetail["roster"][number]) => {
    switch (mode) {
      case "Attendance": return `${student.attendance}%`;
      case "Homework": return `${student.homework}%`;
      case "Engagement": return `${student.engagement}%`;
      case "Signals": return student.signal === "ATTENTION" ? t("Action") : student.signal === "WATCH" ? t("Watch") : student.signal === "POSITIVE" ? t("Positive") : t("Stable");
      default: return `${student.academic}%`;
    }
  };
  const metricTone = (student: ClassDetail["roster"][number]) => {
    const value = mode === "Attendance" ? student.attendance : mode === "Homework" ? student.homework : mode === "Engagement" ? student.engagement : student.academic;
    if (mode === "Signals") return student.signal;
    return value >= 80 ? "POSITIVE" : value >= 60 ? "STABLE" : value < 50 ? "ATTENTION" : "WATCH";
  };

  const attentionCount = schoolClass.roster.filter((s) => s.signal === "ATTENTION").length;
  const watchCount = schoolClass.roster.filter((s) => s.signal === "WATCH").length;
  const positiveCount = schoolClass.roster.filter((s) => s.signal === "POSITIVE").length;

  return (
    <div className="space-y-6">
      <Link href={href("/classes")} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary-600"><ArrowLeft className="h-4 w-4" />{t("All classes")}</Link>
      <PageHeader title={`${schoolClass.name} · ${t("Class overview")}`} description={`${t(schoolClass.gradeLevel)}${schoolClass.room ? ` · ${t("Room")} ${schoolClass.room}` : ""} · ${t("School year")} 2025–2026 · ${schoolClass.studentCount} ${t("Students").toLowerCase()}${schoolClass.teacherName ? ` · ${t("Homeroom")}: ${schoolClass.teacherName}` : ""}`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Students" value={schoolClass.studentCount} detail={t("Roster size")} icon={Users} />
        <MetricCard label="Attendance" value={`${schoolClass.attendance}%`} detail={t("Class average")} icon={CheckCircle2} tone="sky" />
        <MetricCard label="Homework" value={`${schoolClass.homework}%`} detail={t("Completion this week")} icon={BookOpen} />
        <MetricCard label="Engagement" value={`${schoolClass.engagement}%`} detail={t("Observed average")} tone="amber" />
      </div>
      {schoolClass.subjects.length ? (
        <Card className="p-4"><div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t("Subjects")}</div><div className="flex flex-wrap gap-1.5">{schoolClass.subjects.map((subject) => <span key={subject.id} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{subject.name}</span>)}</div></Card>
      ) : null}
      <Card className="p-3"><div className="flex gap-1 overflow-x-auto">{modes.map((item) => <button key={item} onClick={() => setMode(item)} className={cn("whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition", mode === item ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800")}>{t(item)}</button>)}</div></Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {schoolClass.roster.map((student) => (
          <Link href={href(`/students/${student.id}`)} key={student.id}>
            <Card className={cn("group h-full p-4 transition hover:-translate-y-0.5 hover:border-primary-300", student.signal === "ATTENTION" && "border-rose-200 dark:border-rose-500/20", student.signal === "POSITIVE" && "border-emerald-200 dark:border-emerald-500/20")}>
              <div className="flex items-start gap-3"><StudentAvatar student={student} size="lg" /><div className="min-w-0 flex-1"><div className="truncate font-bold text-slate-900 dark:text-white">{student.name}</div><div className="mt-1"><StatusBadge tone={SIGNAL_TONE[student.signal]}>{t(student.signal === "POSITIVE" ? "Positive" : student.signal === "ATTENTION" ? "Action suggested" : student.signal === "WATCH" ? "Watch" : "Stable")}</StatusBadge></div></div></div>
              <div className="mt-5 rounded-xl bg-slate-50 p-3 dark:bg-slate-900"><div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{t(mode)}</div><div className={cn("mt-1 font-bold", mode === "Signals" ? "text-base" : "text-xl")}>{metric(student)}</div><div className="mt-2"><ProgressBar value={mode === "Signals" ? (student.signal === "POSITIVE" ? 85 : student.signal === "WATCH" ? 60 : student.signal === "ATTENTION" ? 30 : 70) : mode === "Attendance" ? student.attendance : mode === "Homework" ? student.homework : mode === "Engagement" ? student.engagement : student.academic} tone={metricTone(student) === "ATTENTION" ? "rose" : metricTone(student) === "POSITIVE" ? "primary" : "amber"} /></div></div>
            </Card>
          </Link>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {positiveCount > 0 ? <InsightCard positive title={t("Positive evolution")} reasons={[t(`${positiveCount} students progressing in several dimensions`)]} /> : null}
        {attentionCount + watchCount > 0 ? <InsightCard title={t("Attention suggested")} reasons={[t(`${attentionCount + watchCount} students show combined weak signals`), t("Reasons are available in each profile")]} /> : null}
        <Card className="p-4"><div className="flex gap-3"><div className="rounded-lg bg-sky-50 p-2 text-sky-600 dark:bg-sky-500/10"><Eye className="h-4 w-4" /></div><div><div className="text-sm font-bold">{t("Privacy reminder")}</div><p className="mt-1 text-xs text-slate-500">{t("Sensitive wellbeing entries are visible only to authorised roles.")}</p></div></div></Card>
      </div>
    </div>
  );
}
