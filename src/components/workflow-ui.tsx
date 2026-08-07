"use client";

import { useState } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";
import { InsightCard, MetricCard, PageHeader, ProgressBar, StatusBadge, TimelineItem } from "@/components/demo-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LocalizedLink as Link, useI18n } from "@/i18n/provider";
import { intlLocale } from "@/i18n/config";
import { formatDateShort, relativeTime } from "@/lib/utils";
import type {
  AssessmentsData,
  AttendanceData,
  HomeworkData,
  ObservationsData,
  TodayData,
  WeeklyReviewData,
} from "@/lib/workflow/service";

const toneFor = (tone: string) => {
  if (tone === "POSITIVE") return "positive" as const;
  if (tone === "ATTENTION") return "attention" as const;
  if (tone === "WATCH") return "watch" as const;
  return "neutral" as const;
};

const attendanceTone: Record<string, "positive" | "attention" | "watch" | "neutral"> = {
  PRESENT: "positive",
  ABSENT: "attention",
  LATE: "watch",
  EXCUSED: "neutral",
};

// ---------------------------------------------------------------------------
// Today
// ---------------------------------------------------------------------------

export function TodayPage({ data }: { data: TodayData }) {
const { t, locale } = useI18n();
  const slotTone = (status: string) =>
    status === "Completed" ? "positive" : status === "In progress" ? "info" : status === "Next" ? "watch" : "neutral";
  const pulseTone = (s: string) => (s === "POSITIVE" ? "positive" : s === "ATTENTION" ? "attention" : "neutral");

  return (
    <div className="space-y-6">
      <PageHeader title={t("Today")} description={t("Your schedule, class pulse and priority actions.")} />
      {data.metrics ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label={t("Classes today")} value={data.metrics.classesToday} detail={t("Across your assignments")} icon={CalendarDays} />
          <MetricCard label={t("Attendance entered")} value={`${data.metrics.attendanceEntered} / ${data.metrics.attendanceTotal}`} detail={data.metrics.attendanceEntered < data.metrics.attendanceTotal ? t("Some classes still pending") : t("All classes entered")} icon={CalendarCheck} tone="sky" />
          <MetricCard label={t("Homework to review")} value={data.metrics.homeworkToReview} detail={t("Submissions awaiting feedback")} icon={BookOpen} tone="amber" />
          <MetricCard label={t("Students to check in")} value={data.metrics.studentsToCheck} detail={t("Attention or watch signals")} icon={MessageSquare} tone="violet" />
        </div>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div><h2 className="font-bold">{t("Schedule")}</h2><p className="text-xs text-slate-500">{t("Today's timetable")}</p></div>
            {data.slots.some((s) => s.status === "In progress") ? <StatusBadge tone="info">{t("Class in progress")}</StatusBadge> : null}
          </div>
          <div className="mt-5 space-y-2">
            {data.slots.length ? (
              data.slots.map((slot) => (
                <div key={slot.id} className="flex items-center gap-4 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                  <div className="w-14 text-sm font-bold">{slot.time}</div>
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800"><CalendarDays className="h-4 w-4" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{t(slot.subject)} · {slot.className}</div>
                    <div className="text-xs text-slate-500">{slot.room ?? "—"}</div>
                  </div>
                  <StatusBadge tone={slotTone(slot.status)}>{t(slot.status)}</StatusBadge>
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-sm text-slate-500">{t("No classes scheduled today.")}</p>
            )}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex justify-between">
            <div><h2 className="font-bold">{t("Live pulse")}</h2><p className="text-xs text-slate-500">{t("Latest school events")}</p></div>
            <Link href="/live" className="text-xs font-semibold text-primary-600">{t("View all")}</Link>
          </div>
          <div className="mt-5">
            {data.pulse.length ? (
              data.pulse.slice(0, 6).map((event) => (
                <TimelineItem key={event.id} time={relativeTime(event.occurredAt, intlLocale(locale))} title={event.title} description={event.studentName ?? "—"} tone={pulseTone(event.sentiment)} />
              ))
            ) : (
              <p className="py-10 text-center text-sm text-slate-500">{t("No recent events.")}</p>
            )}
          </div>
        </Card>
      </div>
      {data.priorities.length ? (
        <Card className="p-5">
          <h2 className="font-bold">{t("Priority actions")}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {data.priorities.map((action) => (
              <div key={action.label} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                <div className="flex justify-between">
                  <Clock3 className="h-4 w-4 text-primary-500" />
                  <StatusBadge tone={action.priority ? "attention" : "neutral"}>{action.priority ? t("Priority") : t("Today")}</StatusBadge>
                </div>
                <div className="mt-3 text-sm font-semibold">{t(action.label)}</div>
                <Button size="sm" variant="outline" className="mt-3 w-full" asChild>
                  <Link href={action.href}>{t("Open action")}</Link>
                </Button>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
      {data.self ? (
        <Card className="p-5">
          <h2 className="font-bold">{t("My day")}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
              <div className="text-xs text-slate-500">{t("Check-in today")}</div>
              <div className="mt-1 font-semibold">{data.self.checkInToday ? `${data.self.checkInToday.mood} / 5` : t("Not submitted yet")}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
              <div className="text-xs text-slate-500">{t("Homework due")}</div>
              <div className="mt-1 font-semibold">{data.self.homeworkDue}</div>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Homework
// ---------------------------------------------------------------------------

export function HomeworkPage({ data }: { data: HomeworkData }) {
  const { t } = useI18n();
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const statusTone = (status: string) =>
    status === "Due today" ? "watch" : status === "Overdue" ? "attention" : status === "Closed" ? "neutral" : "info";

  const visible = data.items.filter((item) => {
    const matchesFilter =
      filter === "All" ||
      (filter === "Due today" ? item.status === "Due today" : filter === "Open" ? item.status === "Open" : filter === "Closed" ? item.status === "Closed" : filter === "Needs review" ? item.needsReview : item.status === "Overdue");
    const matchesQuery = `${item.title} ${item.subject} ${item.className}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t("Homework")} description={t("Assignments, submission progress and completion patterns.")} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t("Open assignments")} value={data.metrics.open} detail={t("Across visible classes")} icon={BookOpen} />
        <MetricCard label={t("Due today")} value={data.metrics.dueToday} detail={t("Items due")} icon={Clock3} tone="amber" />
        <MetricCard label={t("Completion")} value={`${data.metrics.completion}%`} detail={t("Last 30 days")} tone="sky" />
        <MetricCard label={t("Need feedback")} value={data.metrics.needFeedback} detail={t("Review queue")} icon={MessageSquare} tone="violet" />
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 dark:border-slate-800">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("Search assignments")}
          className="h-11 flex-1 bg-transparent text-sm outline-none"
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs dark:border-slate-800 dark:bg-slate-900">
          {["All", "Due today", "Open", "Overdue", "Closed", "Needs review"].map((option) => <option key={option}>{t(option)}</option>)}
        </select>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {visible.length ? (
          visible.map((item) => (
            <Card key={item.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-primary-50 p-2.5 text-primary-600 dark:bg-primary-500/10"><BookOpen className="h-5 w-5" /></div>
                <StatusBadge tone={statusTone(item.status)}>{t(item.status)}</StatusBadge>
              </div>
              <h2 className="mt-4 font-bold">{item.title}</h2>
              <p className="text-sm text-slate-500">{t(item.subject)} · {t(item.className)} · {item.dueDate}</p>
              <div className="mt-5"><ProgressBar label={`${item.submitted} ${t("of")} ${item.total} ${t("submitted")}`} value={item.completion} /></div>
              <div className="mt-4"><StatusBadge tone={item.needsReview ? "watch" : "positive"}>{item.needsReview ? t("Review submissions") : t("All submissions reviewed")}</StatusBadge></div>
            </Card>
          ))
        ) : (
          <p className="col-span-full py-12 text-center text-sm text-slate-500">{t("No assignments match your search.")}</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------

export function AttendancePage({ data }: { data: AttendanceData }) {
  const { t, locale } = useI18n();
  const [classFilter, setClassFilter] = useState("All");
  const statusLabel: Record<string, string> = { PRESENT: "Present", ABSENT: "Absent", LATE: "Late", EXCUSED: "Excused" };
  const visible = data.students.filter((s) => classFilter === "All" || s.className === classFilter);

  return (
    <div className="space-y-6">
      <PageHeader title={t("Attendance")} description={`${formatDateShort(data.date, intlLocale(locale))} · ${t("Daily register and attendance patterns.")}`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t("Present")} value={data.metrics.present} detail={t("Today")} icon={CheckCircle2} />
        <MetricCard label={t("Absent")} value={data.metrics.absent} detail={t("Today")} tone="amber" />
        <MetricCard label={t("Late")} value={data.metrics.late} detail={t("Today")} icon={Clock3} tone="sky" />
        <MetricCard label={t("30-day attendance")} value={`${data.metrics.average30}%`} detail={t("Visible students")} tone="violet" />
      </div>
      <div className="flex items-center gap-3">
        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900">
          {["All", ...data.classes].map((name) => <option key={name}>{t(name)}</option>)}
        </select>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-[11px] uppercase text-slate-500 dark:bg-slate-900">
              <tr><th className="px-4 py-3">{t("Student")}</th><th className="px-4 py-3">{t("Status")}</th><th className="px-4 py-3">{t("30 days")}</th><th className="px-4 py-3">{t("Pattern")}</th></tr>
            </thead>
            <tbody>
              {visible.map((student) => (
                <tr key={student.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3">
                    <Link href={`/students/${student.id}`} className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-xs font-bold text-white">{student.initials}</div>
                      <div><div className="font-semibold">{student.name}</div><div className="text-xs text-slate-500">{t(student.className)}</div></div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">{student.todayStatus ? <StatusBadge tone={attendanceTone[student.todayStatus] ?? "neutral"}>{t(statusLabel[student.todayStatus] ?? student.todayStatus)}</StatusBadge> : <span className="text-xs text-slate-400">{t("Not recorded")}</span>}</td>
                  <td className="px-4 py-3 font-semibold">{student.attendance30}%</td>
                  <td className="px-4 py-3"><StatusBadge tone={student.pattern === "Monitor" ? "watch" : "positive"}>{t(student.pattern)}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visible.length ? <p className="py-12 text-center text-sm text-slate-500">{t("No students in this class.")}</p> : null}
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Observations
// ---------------------------------------------------------------------------

export function ObservationsPage({ data }: { data: ObservationsData }) {
  const { t, locale } = useI18n();
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const visible = data.items.filter((item) => {
    const matchesFilter = filter === "All" || (filter === "Positive" ? item.sentiment === "POSITIVE" : filter === "Attention" ? item.sentiment === "ATTENTION" : filter === "Neutral" ? item.sentiment === "NEUTRAL" : item.sentiment === "ATTENTION");
    const matchesQuery = `${item.studentName} ${item.note ?? ""} ${item.categoryLabel}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t("Observations")} description={t("Teacher input that feeds the longitudinal student profile.")} />
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label={t("This week")} value={data.metrics.thisWeek} detail={t("Across visible students")} icon={MessageSquare} />
        <MetricCard label={t("Positive")} value={`${data.metrics.positiveRate}%`} detail={t("Recognition and strengths")} tone="sky" />
        <MetricCard label={t("Follow-ups due")} value={data.metrics.followUps} detail={t("Attention signals")} tone="amber" />
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 dark:border-slate-800">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Search student or note")} className="h-11 flex-1 bg-transparent text-sm outline-none" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs dark:border-slate-800 dark:bg-slate-900">
          {["All", "Positive", "Neutral", "Attention"].map((option) => <option key={option}>{t(option)}</option>)}
        </select>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {visible.length ? (
          visible.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 text-xs font-bold text-white">{item.studentName.split(" ").map((p) => p[0]).join("").slice(0, 2)}</div>
                <div className="min-w-0 flex-1">
                  <Link href={`/students/${item.studentId}`} className="font-semibold hover:underline">{item.studentName}</Link>
                  <div className="text-xs text-slate-500">{t(item.categoryLabel)} · {t(item.className)}</div>
                </div>
                <StatusBadge tone={toneFor(item.sentiment)}>{t(item.sentiment === "POSITIVE" ? "Positive" : item.sentiment === "ATTENTION" ? "Needs attention" : "Neutral")}</StatusBadge>
              </div>
              {item.note ? <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-900">{item.note}</p> : null}
              <div className="mt-3 flex justify-between text-xs text-slate-400"><span>{item.teacherName}</span><span>{formatDateShort(item.occurredAt, intlLocale(locale))}</span></div>
            </Card>
          ))
        ) : (
          <p className="col-span-full py-12 text-center text-sm text-slate-500">{t("No observations match your search.")}</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Assessments
// ---------------------------------------------------------------------------

export function AssessmentsPage({ data }: { data: AssessmentsData }) {
  const { t } = useI18n();
  const [filter, setFilter] = useState("All subjects");
  const [query, setQuery] = useState("");
  const visible = data.items.filter((item) => {
    const matchesFilter = filter === "All subjects" || item.subject === filter;
    const matchesQuery = `${item.subject} ${item.title} ${item.className}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t("Assessments")} description={t("Quizzes, tests and projects with progress context.")} />
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label={t("This term")} value={data.metrics.termCount} detail={t("Across visible classes")} icon={BarChart3} />
        <MetricCard label={t("Awaiting grades")} value={data.metrics.awaitingGrades} detail={t("Assessments without results")} tone="amber" />
        <MetricCard label={t("Academic trend")} value={data.metrics.academicTrend !== null ? `${data.metrics.academicTrend > 0 ? "+" : ""}${data.metrics.academicTrend} pts` : "—"} detail={t("Recent vs previous")} tone="sky" />
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 dark:border-slate-800">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Search assessments")} className="h-11 flex-1 bg-transparent text-sm outline-none" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs dark:border-slate-800 dark:bg-slate-900">
          {["All subjects", ...data.subjects].map((option) => <option key={option}>{t(option)}</option>)}
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {visible.length ? (
          visible.map((item) => (
            <Card key={item.id} className="p-5">
              <div className="flex justify-between">
                <div className="rounded-xl bg-violet-50 p-2 text-violet-600 dark:bg-violet-500/10"><BarChart3 className="h-5 w-5" /></div>
                <StatusBadge tone={item.graded ? "positive" : "watch"}>{item.graded ? t("Grades complete") : t("Grade entry open")}</StatusBadge>
              </div>
              <h2 className="mt-4 font-bold">{item.title}</h2>
              <p className="text-sm text-slate-500">{t(item.subject)} · {t(item.className)} · {item.date}</p>
              <div className="mt-5 flex items-end justify-between">
                <div><div className="text-2xl font-bold">{item.average !== null ? `${item.average} / 20` : "—"}</div><div className="text-[10px] text-slate-400">{t("Class average")}</div></div>
                <div className="w-1/2"><ProgressBar value={item.average !== null ? item.average * 5 : 0} /></div>
              </div>
            </Card>
          ))
        ) : (
          <p className="col-span-full py-12 text-center text-sm text-slate-500">{t("No assessments match your search.")}</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Weekly review
// ---------------------------------------------------------------------------

export function WeeklyReviewPage({ data }: { data: WeeklyReviewData }) {
  const { t } = useI18n();
  const [group, setGroup] = useState("All");
  const groups = [
    { key: "POSITIVE", label: "Positive evolution", tone: "positive" as const },
    { key: "STABLE", label: "Stable", tone: "neutral" as const },
    { key: "WATCH", label: "Keep an eye", tone: "watch" as const },
    { key: "ATTENTION", label: "Attention suggested", tone: "attention" as const },
  ];
  const visible = group === "All" ? data.students : data.students.filter((s) => s.signal === group);
  const groupLabel: Record<string, string> = { POSITIVE: "Positive evolution", STABLE: "Stable", WATCH: "Keep an eye", ATTENTION: "Attention suggested" };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Weekly Review")}
        description={t("Automatic summary grounded in attendance, homework, observations and student check-ins.")}
        actions={<Button variant="outline" asChild><Link href="/messages">{t("Share summary")}</Link></Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t("Homework")} value={data.metrics.homeworkDelta !== null ? `${data.metrics.homeworkDelta > 0 ? "+" : ""}${data.metrics.homeworkDelta} pts` : "—"} detail={t("Versus last week")} icon={BookOpen} />
        <MetricCard label={t("Attendance")} value={data.metrics.attendance !== null ? `${data.metrics.attendance}%` : "—"} detail={t("This week")} icon={CalendarCheck} tone="sky" />
        <MetricCard label={t("Engagement")} value={data.metrics.engagementDelta !== null ? `${data.metrics.engagementDelta > 0 ? "+" : ""}${data.metrics.engagementDelta} pts` : "—"} detail={t("Versus last week")} tone="amber" />
        <MetricCard label={t("Check-ins")} value={data.metrics.checkInRate !== null ? `${data.metrics.checkInRate}%` : "—"} detail={t("Participation this week")} tone="violet" />
      </div>
      <Card className="p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary-50 p-3 text-primary-600 dark:bg-primary-500/10"><Sparkles className="h-5 w-5" /></div>
          <div>
            <h2 className="font-bold">{t("Automatic class summary")}</h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {t("{positive} student(s) progressing, {stable} stable, {watch} worth a check-in.").split("{positive}").join(String(data.summary.positive)).split("{stable}").join(String(data.summary.stable)).split("{watch}").join(String(data.summary.watch))}
              {data.summary.openAlerts > 0 ? ` ${t("{count} attention signal(s) are open; each suggestion links to visible evidence.").split("{count}").join(String(data.summary.openAlerts))}` : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">{data.highlights.map((h) => <StatusBadge key={h.label} tone="info">{h.label}{h.value ? ` · ${h.value}` : ""}</StatusBadge>)}</div>
          </div>
        </div>
      </Card>
      <div className="grid gap-4 sm:grid-cols-4">
        {groups.map((g) => (
          <button key={g.key} onClick={() => setGroup(g.key)} className={`rounded-2xl border p-4 text-left transition dark:border-slate-800 ${group === g.key ? "border-primary-400 bg-primary-50 dark:bg-primary-500/5" : "border-slate-200 bg-white dark:bg-slate-900"}`}>
            <div className="text-2xl font-bold">{data.groups[g.key as keyof typeof data.groups]}</div>
            <div className="text-sm font-semibold">{t(g.label)}</div>
          </button>
        ))}
        <button onClick={() => setGroup("All")} className={`rounded-2xl border p-4 text-left transition dark:border-slate-800 ${group === "All" ? "border-primary-400 bg-primary-50 dark:bg-primary-500/5" : "border-slate-200 bg-white dark:bg-slate-900"}`}>
          <div className="text-2xl font-bold">{data.students.length}</div>
          <div className="text-sm font-semibold">{t("All students")}</div>
        </button>
      </div>
      <Card className="p-5">
        <div className="mb-4 flex justify-between">
          <h2 className="font-bold">{t(group === "All" ? "All students" : groupLabel[group] ?? "")} · {visible.length} {t("students")}</h2>
          <button onClick={() => setGroup("All")} className="text-xs font-semibold text-primary-600">{t("Show all")}</button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {visible.map((student) => (
            <Link href={`/students/${student.id}`} key={student.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-xs font-bold text-white">{student.initials}</div>
              <div className="min-w-0 flex-1"><div className="font-semibold">{student.name}</div><div className="truncate text-xs text-slate-500">{t(student.headline)} · {t(student.className)}</div></div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
