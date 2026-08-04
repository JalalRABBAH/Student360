"use client";

import { LocalizedLink as Link } from "@/i18n/provider";
import { useState } from "react";
import { BookOpen, CalendarDays, CheckCircle2, ChevronRight, MessageSquare, School, Users } from "lucide-react";
import { ActionButton, InsightCard, MetricCard, MiniBars, PageHeader, ProgressBar, StatusBadge, StudentAvatar, TimelineItem } from "@/components/demo-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { demoClasses, demoEvents, demoHomework, grade8BStudents } from "@/lib/demo-data";
import { useI18n } from "@/i18n/provider";

export function DashboardDemo() {
  const { t, href } = useI18n();
  const [range, setRange] = useState("This week");
  const attention = grade8BStudents.filter((student) => student.status === "ATTENTION" || student.status === "WATCH").slice(0, 4);
  const positives = grade8BStudents.filter((student) => student.status === "POSITIVE").slice(0, 4);
  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Good morning, Nadia.")}
        description={t("Here is the school pulse for Monday, 27 July. Positive progress and support signals are shown with equal priority.")}
        actions={
          <>
            <select value={range} onChange={(event) => setRange(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950">
              <option value="This week">{t("This week")}</option><option value="Last 30 days">{t("Last 30 days")}</option><option value="Current term">{t("Current term")}</option>
            </select>
            <ActionButton label={t("Create action")} title={t("Create a school action")}>
              <div className="space-y-3"><input className="h-10 w-full rounded-xl border border-slate-200 px-3 dark:border-slate-800 dark:bg-slate-900" placeholder={t("Action title")} /><textarea className="min-h-24 w-full rounded-xl border border-slate-200 p-3 dark:border-slate-800 dark:bg-slate-900" placeholder={t("What needs to happen?")} /></div>
            </ActionButton>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Students" value="147" detail="Across 6 active classes" trend={2} icon={Users} />
        <MetricCard label={t("Attendance today")} value="94.2%" detail={t("138 present · 5 late")} trend={0.8} icon={CheckCircle2} tone="sky" />
        <MetricCard label="Homework completion" value="86%" detail="Up across four classes" trend={6} icon={BookOpen} tone="amber" />
        <MetricCard label="Students to check in" value="4" detail="Explainable combined signals" trend={-2} icon={MessageSquare} tone="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between"><div><h2 className="font-bold text-slate-950 dark:text-white">{t("School progress pulse")}</h2><p className="text-xs text-slate-500">{t("Six-week evolution")} · {t(range)}</p></div><StatusBadge tone="positive">{t("Healthy momentum")}</StatusBadge></div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div><div className="mb-3 flex items-end justify-between"><div><div className="text-3xl font-bold">+4.8</div><div className="text-xs text-slate-500">{t("Engagement points")}</div></div><StatusBadge tone="positive">{t("Improving")}</StatusBadge></div><MiniBars values={[48, 56, 52, 66, 72, 81]} /></div>
            <div className="space-y-4">
              <ProgressBar label={t("Attendance")} value={94} tone="sky" />
              <ProgressBar label={t("Homework completion")} value={86} tone="primary" />
              <ProgressBar label={t("Average engagement")} value={78} tone="amber" />
              <ProgressBar label={t("Student check-ins")} value={82} tone="primary" />
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <InsightCard positive title={t("Positive evolution")} reasons={[t("19 students improved in several dimensions"), t("Homework completion +6 points")]} />
            <InsightCard title={t("Attendance pattern")} reasons={[t("One class declined this week"), t("5 late arrivals today")]} />
            <InsightCard title={t("Open interventions")} reasons={[t("8 active plans"), t("3 review dates due this week")]} />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between"><div><h2 className="font-bold text-slate-950 dark:text-white">{t("Live today")}</h2><p className="text-xs text-slate-500">{t("Recent activity across the school")}</p></div><Link href={href("/live")} className="text-xs font-semibold text-primary-600">{t("Open live view")}</Link></div>
          <div className="mt-5">{demoEvents.slice(0, 5).map((event) => <TimelineItem key={event.time} {...event} />)}</div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold text-slate-950 dark:text-white">{t("Students to check in with")}</h2><p className="text-xs text-slate-500">{t("Signals are suggestions, never labels")}</p></div><Link href={href("/analytics")} className="text-xs font-semibold text-primary-600">{t("View reasons")}</Link></div>
          <div className="space-y-2">{attention.map((student) => <Link key={student.id} href={`/students/${student.id}`} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-primary-200 hover:bg-primary-50/30 dark:border-slate-800 dark:hover:border-primary-500/20 dark:hover:bg-primary-500/5"><StudentAvatar student={student} /><div className="min-w-0 flex-1"><div className="font-semibold text-slate-900 dark:text-white">{student.name}</div><div className="truncate text-xs text-slate-500">{t(student.headline)}</div></div><StatusBadge tone={student.status === "ATTENTION" ? "attention" : "watch"}>{student.status === "ATTENTION" ? t("Action suggested") : t("Watch")}</StatusBadge><ChevronRight className="h-4 w-4 text-slate-400" /></Link>)}</div>
        </Card>
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold text-slate-950 dark:text-white">{t("Positive highlights")}</h2><p className="text-xs text-slate-500">{t("Recognition sustains momentum")}</p></div><StatusBadge tone="positive">{positives.length}</StatusBadge></div>
          <div className="space-y-2">{positives.map((student) => <Link key={student.id} href={`/students/${student.id}`} className="flex items-center gap-3 rounded-xl bg-emerald-50/60 p-3 dark:bg-emerald-500/5"><StudentAvatar student={student} /><div className="min-w-0 flex-1"><div className="font-semibold text-slate-900 dark:text-white">{student.name}</div><div className="truncate text-xs text-slate-500">{t(student.headline)}</div></div><StatusBadge tone="positive">+{4 + student.id.length % 5} {t("pts")}</StatusBadge></Link>)}</div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-5"><div><h2 className="font-bold text-slate-950 dark:text-white">{t("Classes")}</h2><p className="text-xs text-slate-500">{t("Open a class squad dashboard in one click")}</p></div><Button variant="outline" asChild><Link href={href("/classes")}><School className="me-2 h-4 w-4" />{t("All classes")}</Link></Button></div>
        <div className="grid border-t border-slate-100 dark:border-slate-800 sm:grid-cols-2 xl:grid-cols-3">{demoClasses.map((schoolClass) => <Link key={schoolClass.id} href={`/classes/${schoolClass.id}`} className="border-b border-r border-slate-100 p-4 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"><div className="flex items-center justify-between"><div className="font-bold text-slate-900 dark:text-white">{t(schoolClass.name)}</div><ChevronRight className="h-4 w-4 text-slate-400" /></div><div className="mt-1 text-xs text-slate-500">{schoolClass.teacher} · {schoolClass.students} {t("students")}</div><div className="mt-4 grid grid-cols-3 gap-2 text-center"><div><div className="text-sm font-bold">{schoolClass.attendance}%</div><div className="text-[10px] text-slate-400">{t("Attendance")}</div></div><div><div className="text-sm font-bold">{schoolClass.homework}%</div><div className="text-[10px] text-slate-400">{t("Homework")}</div></div><div><div className="text-sm font-bold">{schoolClass.engagement}%</div><div className="text-[10px] text-slate-400">{t("Engagement")}</div></div></div></Link>)}</div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Card className="p-5"><div className="mb-4 flex justify-between"><div><h2 className="font-bold text-slate-950 dark:text-white">{t("Upcoming homework")}</h2><p className="text-xs text-slate-500">{t("Items requiring review")}</p></div><Link href="/homework" className="text-xs font-semibold text-primary-600">{t("Open workspace")}</Link></div><div className="space-y-3">{demoHomework.slice(0, 3).map((item) => <div key={item.id} className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800"><BookOpen className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{t(item.title)}</div><div className="text-xs text-slate-500">{t(item.subject)} · {t(item.className)}</div></div>            <div className="text-right"><div className="text-sm font-bold">{item.submitted}/{item.total}</div><div className="text-[10px] text-slate-400">{t(item.due)}</div></div></div>)}</div></Card>
        <Card className="p-5"><h2 className="font-bold text-slate-950 dark:text-white">{t("Upcoming actions")}</h2><p className="text-xs text-slate-500">{t("Keep support plans moving")}</p><div className="mt-4 space-y-3">{[t("Review three intervention plans"), t("Prepare Grade 8B weekly review"), t("Reply to two parent messages")].map((action, index) => <div key={action} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900"><CalendarDays className="h-4 w-4 text-primary-500" /><div className="flex-1 text-sm font-medium">{action}</div><StatusBadge tone={index === 0 ? "watch" : "neutral"}>{index === 0 ? t("Today") : t("This week")}</StatusBadge></div>)}</div></Card>
      </div>
    </div>
  );
}