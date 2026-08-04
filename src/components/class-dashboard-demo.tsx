"use client";

import { LocalizedLink as Link } from "@/i18n/provider";
import { useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, Eye, MessageSquare, Plus, Users } from "lucide-react";
import { ActionButton, InsightCard, MetricCard, PageHeader, ProgressBar, StatusBadge, StudentAvatar } from "@/components/demo-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { demoClasses, demoStudents } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/provider";

const modes = ["Overview", "Attendance", "Homework", "Engagement", "Progress", "Mood", "Motivation", "Competencies", "Support"] as const;

export function ClassDashboardDemo({ classId }: { classId: string }) {
  const { t, href } = useI18n();
  const [mode, setMode] = useState<(typeof modes)[number]>("Overview");
  const schoolClass = demoClasses.find((item) => item.id === classId) ?? demoClasses[3];
  const classStudents = demoStudents.filter((student) => student.classId === schoolClass.id);
  const metric = (student: (typeof demoStudents)[number]) => mode === "Attendance" ? `${student.attendance}%` : mode === "Homework" ? `${student.homework}%` : mode === "Engagement" ? `${student.engagement}%` : mode === "Mood" ? ["😞", "😟", "😐", "🙂", "😄"][student.mood - 1] : mode === "Motivation" ? `${Math.max(1, Math.round(student.motivation / 20))}/5` : mode === "Competencies" ? `${student.academic - 3}%` : mode === "Support" ? student.status === "ATTENTION" ? t("Action") : student.status === "WATCH" ? t("Watch") : t("None") : mode === "Progress" ? student.trend === "UP" ? `↑ ${t("Improving")}` : student.trend === "DOWN" ? `↓ ${t("Lower")}` : `→ ${t("Stable")}` : `${student.academic}%`;
  return (
    <div className="space-y-6">
      <Link href={href("/classes")} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary-600"><ArrowLeft className="h-4 w-4" />{t("All classes")}</Link>
      <PageHeader title={`${t(schoolClass.name)} · ${t("Class overview")}`} description={`${schoolClass.teacher} · ${t("Room")} ${schoolClass.room} · ${t("School year")} 2025–2026 · ${schoolClass.students} ${t("Students").toLowerCase()}`} actions={<><ActionButton label={t("Quick observation")} title={t("Quick student observation")}><div className="space-y-3"><select className="h-10 w-full rounded-xl border px-3 dark:bg-slate-900">{classStudents.slice(0, 8).map((student) => <option key={student.id}>{student.name}</option>)}</select><select className="h-10 w-full rounded-xl border px-3 dark:bg-slate-900"><option>{t("Participation +1")}</option><option>{t("Engagement high")}</option><option>{t("Support needed")}</option></select><textarea className="min-h-20 w-full rounded-xl border p-3 dark:bg-slate-900" placeholder={t("Optional note")} /></div></ActionButton><Button variant="outline" asChild><Link href={href("/weekly-review")}>{t("Weekly Review")}</Link></Button></>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Present today" value="24 / 26" detail="2 absences" icon={CheckCircle2} /><MetricCard label="Homework" value={`${schoolClass.homework}%`} detail="Completion this week" trend={8} icon={BookOpen} tone="sky" /><MetricCard label="Engagement" value={`${schoolClass.engagement}%`} detail="Based on observations" trend={4} tone="amber" /><MetricCard label="Check-ins received" value="21 / 26" detail="81% participation" icon={MessageSquare} tone="violet" /></div>
      <Card className="p-3"><div className="flex gap-1 overflow-x-auto">{modes.map((item) => <button key={item} onClick={() => setMode(item)} className={cn("whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition", mode === item ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800")}>{t(item)}</button>)}</div></Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {classStudents.map((student) => (
          <Link href={href(`/students/${student.id}`)} key={student.id}>
            <Card className={cn("group h-full p-4 transition hover:-translate-y-0.5 hover:border-primary-300", student.status === "ATTENTION" && "border-rose-200 dark:border-rose-500/20", student.status === "POSITIVE" && "border-emerald-200 dark:border-emerald-500/20")}>
              <div className="flex items-start gap-3"><StudentAvatar student={student} size="lg" /><div className="min-w-0 flex-1"><div className="truncate font-bold">{student.name}</div><div className="mt-1"><StatusBadge tone={student.status === "POSITIVE" ? "positive" : student.status === "ATTENTION" ? "attention" : student.status === "WATCH" ? "watch" : "neutral"}>{student.status === "POSITIVE" ? t("Positive") : student.status === "ATTENTION" ? t("Action suggested") : student.status === "WATCH" ? t("Watch") : t("Stable")}</StatusBadge></div></div></div>
              <div className="mt-5 rounded-xl bg-slate-50 p-3 dark:bg-slate-900"><div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{t(mode)}</div><div className={cn("mt-1 font-bold", mode === "Mood" ? "text-3xl" : "text-xl")}>{metric(student)}</div></div>
              <p className="mt-3 truncate text-xs text-slate-500">{t(student.headline)}</p>
            </Card>
          </Link>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-3"><InsightCard positive title={t("Positive evolution")} reasons={[t("6 students improved in several dimensions"), t("Homework completion +8 points")]} /><InsightCard title={t("Attention suggested")} reasons={[t("4 students show combined weak signals"), t("Reasons are available in each profile")]} /><Card className="p-4"><div className="flex gap-3"><div className="rounded-lg bg-sky-50 p-2 text-sky-600 dark:bg-sky-500/10"><Eye className="h-4 w-4" /></div><div><div className="text-sm font-bold">{t("Privacy reminder")}</div><p className="mt-1 text-xs text-slate-500">{t("Sensitive wellbeing entries are visible only to authorised roles.")}</p></div></div></Card></div>
    </div>
  );
}