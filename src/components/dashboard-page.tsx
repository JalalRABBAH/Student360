"use client";

import { LocalizedLink as Link, useI18n } from "@/i18n/provider";
import {
  AlertTriangle, BookOpen, CalendarDays, CheckCircle2, ChevronRight, ClipboardCheck, GraduationCap,
  HeartPulse, MessageSquare, School, Sparkles, Trophy, Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InsightCard, MetricCard, PageHeader, ProgressBar, StatusBadge, StudentAvatar, TimelineItem } from "@/components/demo-ui";
import { cn } from "@/lib/utils";
import { intlLocale } from "@/i18n/config";
import type { DashboardData, DashboardEvent, DashboardHomework, DashboardPerson } from "@/lib/dashboard/service";
import type { StudentSignal } from "@/lib/students/service";

const SIGNAL_TONE: Record<StudentSignal, "positive" | "neutral" | "watch" | "attention"> = {
  POSITIVE: "positive",
  STABLE: "neutral",
  WATCH: "watch",
  ATTENTION: "attention",
};

const SIGNAL_LABEL: Record<StudentSignal, string> = {
  POSITIVE: "Positive progress",
  STABLE: "Stable",
  WATCH: "Watch",
  ATTENTION: "Action suggested",
};

function signalTone(signal: StudentSignal) {
  return SIGNAL_TONE[signal] ?? "neutral";
}

function signalLabel(signal: StudentSignal) {
  return SIGNAL_LABEL[signal] ?? "Stable";
}

function eventTone(sentiment: string) {
  if (sentiment === "POSITIVE") return "positive" as const;
  if (sentiment === "ATTENTION") return "attention" as const;
  return "neutral" as const;
}

const PARENT_INPUT_LABEL: Record<string, string> = {
  HOMEWORK_SUPPORT: "Homework support",
  OBSERVATION: "Observation",
  COMMENT: "Comment",
  INFO_FOR_SCHOOL: "Info for school",
  ACKNOWLEDGEMENT: "Acknowledgement",
  MESSAGE_TO_TEACHER: "Message to teacher",
};

function parentInputLabel(type: string) {
  return PARENT_INPUT_LABEL[type] ?? "Comment";
}

const HEADLINE_DESCRIPTION = {
  LEADERSHIP: "Here is the school pulse. Positive progress and support signals are shown with equal priority.",
  TEACHER: "Your classes, your students' signals and homework to review in one place.",
  NURSE: "The wellbeing pulse of the school, focused on check-ins and support plans.",
  PARENT: "A calm, practical overview of what matters today for your children.",
  STUDENT: "Your day at a glance: check-in, homework, grades and goals.",
  SUPER_ADMIN: "Platform overview across every school.",
} as const;

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

function Header({ data }: { data: DashboardData }) {
  const { t } = useI18n();
  return (
    <PageHeader
      title={`${t(data.greeting)}, ${data.firstName}.`}
      description={`${data.dateLabel} · ${t(HEADLINE_DESCRIPTION[data.variant])}`}
    />
  );
}

function StudentRow({ student, positive = false }: { student: DashboardPerson; positive?: boolean }) {
  const { t } = useI18n();
  return (
    <Link
      href={`/students/${student.id}`}
      className={cn(
        "flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-primary-200 hover:bg-primary-50/30 dark:border-slate-800 dark:hover:border-primary-500/20 dark:hover:bg-primary-500/5",
        positive && "border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-500/5",
      )}
    >
      <StudentAvatar student={student} />
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-slate-900 dark:text-white">{student.name}</div>
        <div className="truncate text-xs text-slate-500">{student.className}</div>
      </div>
      <StatusBadge tone={signalTone(student.signal)}>{t(signalLabel(student.signal))}</StatusBadge>
      <ChevronRight className="h-4 w-4 text-slate-400" />
    </Link>
  );
}

function LiveFeed({ events }: { events: DashboardEvent[] }) {
  const { t, formatDate } = useI18n();
  if (!events.length) return <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500 dark:bg-slate-900">{t("No recent activity yet")}</p>;
  return (
    <div>
      {events.map((event) => (
        <TimelineItem
          key={event.id}
          time={formatDate(event.occurredAt)}
          title={t(event.title)}
          description={event.studentName ?? ""}
          tone={eventTone(event.sentiment)}
        />
      ))}
    </div>
  );
}

function HomeworkList({ homework }: { homework: DashboardHomework[] }) {
  const { t, formatDate } = useI18n();
  if (!homework.length) return <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500 dark:bg-slate-900">{t("No upcoming homework")}</p>;
  return (
    <div className="space-y-3">
      {homework.map((item) => (
        <div key={item.id} className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800"><BookOpen className="h-4 w-4" /></div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{t(item.title)}</div>
            <div className="truncate text-xs text-slate-500">{t(item.subject)} · {t(item.className)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold">{item.total ? `${item.submitted}/${item.total}` : "—"}</div>
            <div className="text-[10px] text-slate-400">{formatDate(item.dueDate)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ClassGrid({ data }: { data: DashboardData }) {
  const { t } = useI18n();
  if (!data.classes.length) return null;
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-5">
        <div>
          <h2 className="font-bold text-slate-950 dark:text-white">{t("Classes")}</h2>
          <p className="text-xs text-slate-500">{t("Open a class squad dashboard in one click")}</p>
        </div>
        <Button variant="outline" asChild><Link href="/classes"><School className="me-2 h-4 w-4" />{t("All classes")}</Link></Button>
      </div>
      <div className="grid border-t border-slate-100 dark:border-slate-800 sm:grid-cols-2 xl:grid-cols-3">
        {data.classes.map((schoolClass) => (
          <Link key={schoolClass.id} href={`/classes/${schoolClass.id}`} className="border-b border-r border-slate-100 p-4 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-900 dark:text-white">{schoolClass.name}</div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-1 text-xs text-slate-500">{t(schoolClass.gradeLevel)} · {schoolClass.studentCount} {t("students")}</div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div><div className="text-sm font-bold">{schoolClass.attendance}%</div><div className="text-[10px] text-slate-400">{t("Attendance")}</div></div>
              <div><div className="text-sm font-bold">{schoolClass.homework}%</div><div className="text-[10px] text-slate-400">{t("Homework")}</div></div>
              <div><div className="text-sm font-bold">{schoolClass.engagement}%</div><div className="text-[10px] text-slate-400">{t("Engagement")}</div></div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}

function CheckInSection({ data }: { data: DashboardData }) {
  const { t } = useI18n();
  if (!data.studentsToCheck.length && !data.positiveHighlights.length) return null;
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-950 dark:text-white">{t("Students to check in with")}</h2>
            <p className="text-xs text-slate-500">{t("Signals are suggestions, never labels")}</p>
          </div>
          <StatusBadge tone={data.studentsToCheck.length ? "attention" : "positive"}>{data.studentsToCheck.length}</StatusBadge>
        </div>
        {data.studentsToCheck.length
          ? <div className="space-y-2">{data.studentsToCheck.map((student) => <StudentRow key={student.id} student={student} />)}</div>
          : <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500 dark:bg-slate-900">{t("No students need attention right now")}</p>}
      </Card>
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-950 dark:text-white">{t("Positive highlights")}</h2>
            <p className="text-xs text-slate-500">{t("Recognition sustains momentum")}</p>
          </div>
          <StatusBadge tone="positive">{data.positiveHighlights.length}</StatusBadge>
        </div>
        {data.positiveHighlights.length
          ? <div className="space-y-2">{data.positiveHighlights.map((student) => <StudentRow key={student.id} student={student} positive />)}</div>
          : <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500 dark:bg-slate-900">{t("No highlights yet this week")}</p>}
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LEADERSHIP + NURSE
// ---------------------------------------------------------------------------

function SchoolDashboard({ data }: { data: DashboardData }) {
  const { t } = useI18n();
  const metrics = data.metrics!;
  const isNurse = data.variant === "NURSE";
  const attendancePct = metrics.attendanceToday && metrics.attendanceBreakdown && metrics.attendanceToday > 0
    ? Math.round(((metrics.attendanceBreakdown.present + metrics.attendanceBreakdown.late) / metrics.attendanceToday) * 100)
    : null;
  const checkInPct = metrics.students && metrics.checkInsToday != null
    ? Math.round((metrics.checkInsToday / metrics.students) * 100)
    : 0;
  const pulseScore = Math.round(((attendancePct ?? 0) + (metrics.homeworkCompletion ?? 0)) / 2);

  return (
    <div className="space-y-6">
      <Header data={data} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t("Students")} value={metrics.students} detail={t("Active roster")} icon={Users} />
        {isNurse ? (
          <>
            <MetricCard label={t("Check-ins today")} value={metrics.checkInsToday ?? 0} detail={t("Student check-ins")} icon={CheckCircle2} tone="sky" />
            <MetricCard label={t("Open support plans")} value={metrics.openPlans ?? 0} detail={t("Active learning plans")} icon={HeartPulse} tone="amber" />
            <MetricCard label={t("Open alerts")} value={metrics.openAlerts ?? 0} detail={t("Signals requiring follow-up")} icon={AlertTriangle} tone="violet" />
          </>
        ) : (
          <>
            <MetricCard label={t("Teachers")} value={metrics.teachers} detail={t("Active teaching staff")} icon={GraduationCap} tone="sky" />
            <MetricCard
              label={t("Attendance today")}
              value={attendancePct === null ? "—" : `${attendancePct}%`}
              detail={`${metrics.attendanceBreakdown?.present ?? 0} ${t("present").toLowerCase()} · ${metrics.attendanceBreakdown?.late ?? 0} ${t("late").toLowerCase()}`}
              icon={CheckCircle2} tone="amber"
            />
            <MetricCard label={t("Open support plans")} value={metrics.openPlans ?? 0} detail={t("Active learning plans")} icon={HeartPulse} tone="violet" />
          </>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-950 dark:text-white">{t("School progress pulse")}</h2>
              <p className="text-xs text-slate-500">{t("This week")} · {t("Live indicators")}</p>
            </div>
            <StatusBadge tone={pulseScore >= 60 ? "positive" : "watch"}>{pulseScore >= 60 ? t("Healthy momentum") : t("Needs attention")}</StatusBadge>
          </div>
          <div className="mt-6 space-y-4">
            <ProgressBar label={t("Attendance")} value={attendancePct ?? 0} tone="sky" />
            <ProgressBar label={t("Homework completion")} value={metrics.homeworkCompletion ?? 0} tone="primary" />
            <ProgressBar label={t("Student check-ins")} value={checkInPct} tone="amber" />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <InsightCard positive title={t("Healthy momentum")} reasons={[`${t("Homework completion")} ${metrics.homeworkCompletion ?? 0}%`]} />
            <InsightCard title={t("Attendance pattern")} reasons={[`${metrics.attendanceBreakdown?.late ?? 0} ${t("late arrivals today")}`]} />
            <InsightCard title={t("Open interventions")} reasons={[`${metrics.openPlans ?? 0} ${t("active plans")}`, `${metrics.openAlerts ?? 0} ${t("open alerts")}`]} />
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-950 dark:text-white">{t("Live today")}</h2>
              <p className="text-xs text-slate-500">{t("Recent activity across the school")}</p>
            </div>
            <Link href="/live" className="text-xs font-semibold text-primary-600">{t("Open live view")}</Link>
          </div>
          <div className="mt-5"><LiveFeed events={data.liveEvents} /></div>
        </Card>
      </div>

      <CheckInSection data={data} />
      <ClassGrid data={data} />

      {data.upcomingHomework.length ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-950 dark:text-white">{t("Upcoming homework")}</h2>
                <p className="text-xs text-slate-500">{t("Items requiring review")}</p>
              </div>
              <Link href="/homework" className="text-xs font-semibold text-primary-600">{t("Open workspace")}</Link>
            </div>
            <HomeworkList homework={data.upcomingHomework} />
          </Card>
          <Card className="p-5">
            <h2 className="font-bold text-slate-950 dark:text-white">{t("Upcoming actions")}</h2>
            <p className="text-xs text-slate-500">{t("Keep support plans moving")}</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
                <CalendarDays className="h-4 w-4 text-primary-500" />
                <div className="flex-1 text-sm font-medium">{t("Review intervention plans")}</div>
                <StatusBadge tone="watch">{t("Today")}</StatusBadge>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
                <CalendarDays className="h-4 w-4 text-primary-500" />
                <div className="flex-1 text-sm font-medium">{t("Reply to parent messages")}</div>
                <StatusBadge tone="neutral">{t("This week")}</StatusBadge>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TEACHER
// ---------------------------------------------------------------------------

function TeacherDashboard({ data }: { data: DashboardData }) {
  const { t } = useI18n();
  const metrics = data.metrics!;
  return (
    <div className="space-y-6">
      <Header data={data} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t("My students")} value={metrics.students} detail={t("Active roster")} icon={Users} />
        <MetricCard label={t("My classes")} value={metrics.activeClasses} detail={t("Assigned classes")} icon={School} tone="sky" />
        <MetricCard label={t("To review")} value={metrics.submissionsToReview ?? 0} detail={t("Homework submissions")} icon={ClipboardCheck} tone="amber" />
        <MetricCard label={t("Unread messages")} value={data.unreadMessages} detail={t("In your inbox")} icon={MessageSquare} tone="violet" />
      </div>
      <CheckInSection data={data} />
      <ClassGrid data={data} />
      {data.upcomingHomework.length ? (
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-950 dark:text-white">{t("Upcoming homework")}</h2>
              <p className="text-xs text-slate-500">{t("Items requiring review")}</p>
            </div>
            <Link href="/homework" className="text-xs font-semibold text-primary-600">{t("Open workspace")}</Link>
          </div>
          <HomeworkList homework={data.upcomingHomework} />
        </Card>
      ) : null}
      {data.liveEvents.length ? (
        <Card className="p-5">
          <div className="mb-4">
            <h2 className="font-bold text-slate-950 dark:text-white">{t("Live today")}</h2>
            <p className="text-xs text-slate-500">{t("Recent activity from your students")}</p>
          </div>
          <LiveFeed events={data.liveEvents} />
        </Card>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PARENT
// ---------------------------------------------------------------------------

function ParentDashboard({ data }: { data: DashboardData }) {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <Header data={data} />
      <div className="grid gap-5 lg:grid-cols-2">
        {data.children.length
          ? data.children.map((child) => (
              <Card key={child.id} className="p-5">
                <div className="flex items-center gap-4">
                  <StudentAvatar student={child} size="lg" />
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-slate-950 dark:text-white">{child.name}</h2>
                    <p className="text-sm text-slate-500">{child.className} · {child.presentToday ? t("Present today") : t("No attendance record yet today")}</p>
                  </div>
                  <StatusBadge tone={signalTone(child.signal)}>{t(signalLabel(child.signal))}</StatusBadge>
                </div>
                <div className="mt-5 grid grid-cols-4 gap-3 text-center">
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900"><div className="font-bold text-slate-900 dark:text-white">{child.homework}%</div><div className="text-[10px] text-slate-500">{t("Homework")}</div></div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900"><div className="font-bold text-slate-900 dark:text-white">{child.attendance}%</div><div className="text-[10px] text-slate-500">{t("Attendance")}</div></div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900"><div className="font-bold text-slate-900 dark:text-white">{child.academic}%</div><div className="text-[10px] text-slate-500">{t("Academic")}</div></div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900"><div className="font-bold text-slate-900 dark:text-white">{child.trend === "UP" ? t("Improving") : child.trend === "DOWN" ? t("Lower") : t("Stable")}</div><div className="text-[10px] text-slate-500">{t("Progress")}</div></div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button className="flex-1" asChild><Link href={`/students/${child.id}`}>{t("View profile")}</Link></Button>
                  <Button variant="outline" asChild><Link href="/messages">{t("Message teacher")}</Link></Button>
                </div>
              </Card>
            ))
          : <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700">{t("No children linked to your account")}</p>}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4">
            <h2 className="font-bold text-slate-950 dark:text-white">{t("Recent family inputs")}</h2>
            <p className="text-xs text-slate-500">{t("What you shared with the school")}</p>
          </div>
          {data.parentInputs.length
            ? <div className="space-y-3">{data.parentInputs.map((input) => (
                <div key={input.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
                  <div className="flex items-center justify-between"><div className="text-sm font-semibold">{t(parentInputLabel(input.type))} · {input.studentName}</div><div className="text-xs text-slate-400">{input.occurredAt}</div></div>
                  <p className="mt-1 text-xs text-slate-500">{input.content}</p>
                </div>
              ))}</div>
            : <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500 dark:bg-slate-900">{t("No inputs shared yet")}</p>}
        </Card>
        <Card className="p-5">
          <div className="mb-4">
            <h2 className="font-bold text-slate-950 dark:text-white">{t("Children's activity")}</h2>
            <p className="text-xs text-slate-500">{t("Recent activity across your children")}</p>
          </div>
          <LiveFeed events={data.liveEvents} />
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STUDENT
// ---------------------------------------------------------------------------

function MoodDots({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((level) => (
        <span key={level} className={cn("h-3 w-3 rounded-full", level <= value ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700")} />
      ))}
    </div>
  );
}

function StudentDashboard({ data }: { data: DashboardData }) {
  const { t } = useI18n();
  const student = data.student!;
  const homeworkStatusLabel = student.checkInToday?.homeworkStatus === "DONE" ? "Done"
    : student.checkInToday?.homeworkStatus === "PARTIAL" ? "Partial"
    : student.checkInToday?.homeworkStatus === "NEED_HELP" ? "Need help"
    : student.checkInToday?.homeworkStatus === "NOT_DONE" ? "Not done" : "";
  return (
    <div className="space-y-6">
      <Header data={data} />
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <StudentAvatar student={student} size="lg" />
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">{student.name}</h2>
              <p className="text-sm text-slate-500">{student.className} · {t(student.headline)}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-950 dark:text-white">{student.overall}</div>
              <div className="text-[10px] text-slate-500">{t("Overall")}</div>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <InsightCard positive title={t("Healthy momentum")} reasons={[`${t("Overall")} ${student.overall}%`]} />
            <InsightCard title={t("Homework")} reasons={[`${student.homeworkDone} ${t("submitted")}`]} />
            <InsightCard title={t("My goals")} reasons={[`${student.activeGoals.length} ${t("active goals")}`]} />
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold text-slate-950 dark:text-white">{t("Today's check-in")}</h2>
          <p className="text-xs text-slate-500">{t("How are you feeling today?")}</p>
          {student.checkInToday ? (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{t("Mood")}</span>
                <MoodDots value={student.checkInToday.mood} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{t("Homework status")}</span>
                <StatusBadge tone="neutral">{t(homeworkStatusLabel)}</StatusBadge>
              </div>
            </div>
          ) : (
            <p className="mt-4 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500 dark:bg-slate-900">{t("No check-in yet today")}</p>
          )}
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs text-slate-500"><span>{t("Homework")}</span><span>{student.homeworkDone} {t("done")} · {student.homeworkDue} {t("due")}</span></div>
            <ProgressBar value={Math.min(100, Math.round((student.homeworkDone / Math.max(1, student.homeworkDone + student.homeworkDue)) * 100))} />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-slate-950 dark:text-white">{t("Recent grades")}</h2>
            <Sparkles className="h-4 w-4 text-primary-500" />
          </div>
          {student.recentGrades.length
            ? <div className="space-y-2">{student.recentGrades.map((grade) => (
                <div key={grade.id} className="flex items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{grade.score}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{t(grade.subject)}</div>
                    <div className="text-xs text-slate-500">{grade.date}</div>
                  </div>
                  <StatusBadge tone={grade.score >= 65 ? "positive" : grade.score >= 50 ? "watch" : "attention"}>{grade.score}%</StatusBadge>
                </div>
              ))}</div>
            : <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500 dark:bg-slate-900">{t("No grades published yet")}</p>}
        </Card>
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-slate-950 dark:text-white">{t("My goals")}</h2>
            <Link href="/goals" className="text-xs font-semibold text-primary-600">{t("View all")}</Link>
          </div>
          {student.activeGoals.length
            ? <div className="space-y-4">{student.activeGoals.map((goal) => (
                <div key={goal.id}>
                  <div className="mb-1.5 flex justify-between text-sm"><span className="font-semibold text-slate-900 dark:text-white">{t(goal.title)}</span><span className="text-slate-500">{goal.progress}%</span></div>
                  <ProgressBar value={goal.progress} tone={goal.progress >= 65 ? "primary" : goal.progress >= 40 ? "amber" : "rose"} />
                </div>
              ))}</div>
            : <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500 dark:bg-slate-900">{t("No active goals")}</p>}
          {student.recentAchievements.length ? (
            <div className="mt-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white"><Trophy className="h-4 w-4 text-amber-500" />{t("Recent achievements")}</div>
              <div className="space-y-2">{student.recentAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
                  <span className="text-sm font-medium">{t(achievement.title)}</span>
                  <span className="text-xs text-slate-400">{achievement.awardedAt}</span>
                </div>
              ))}</div>
            </div>
          ) : null}
        </Card>
      </div>

      {data.liveEvents.length ? (
        <Card className="p-5">
          <div className="mb-4">
            <h2 className="font-bold text-slate-950 dark:text-white">{t("Live today")}</h2>
            <p className="text-xs text-slate-500">{t("Recent activity")}</p>
          </div>
          <LiveFeed events={data.liveEvents} />
        </Card>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SUPER_ADMIN
// ---------------------------------------------------------------------------

function PlatformDashboard({ data }: { data: DashboardData }) {
  const { t, locale } = useI18n();
  const platform = data.platform!;
  const timeFormat = new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "medium", timeStyle: "short" });
  return (
    <div className="space-y-6">
      <Header data={data} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t("Schools")} value={platform.schools} detail={t("Active tenants")} icon={School} />
        <MetricCard label={t("Active users")} value={platform.users} detail={t("Enabled accounts")} icon={Users} tone="sky" />
        <MetricCard label={t("Students")} value={platform.students} detail={t("Active roster")} icon={GraduationCap} tone="amber" />
        <MetricCard label={t("Teachers")} value={platform.teachers} detail={t("Active teaching staff")} icon={ClipboardCheck} tone="violet" />
      </div>
      <Card className="p-5">
        <div className="mb-4">
          <h2 className="font-bold text-slate-950 dark:text-white">{t("Recent logins")}</h2>
          <p className="text-xs text-slate-500">{t("Latest sign-ins across the platform")}</p>
        </div>
        {platform.recentLogins.length
          ? <div className="space-y-2">{platform.recentLogins.map((login) => (
              <div key={login.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 text-[10px] font-bold text-white">{t(login.userName).split(" ").map((part) => part.charAt(0)).slice(0, 2).join("")}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{login.userName}</div>
                  <div className="text-xs text-slate-500">{login.role}</div>
                </div>
                <div className="text-xs text-slate-400">{timeFormat.format(new Date(login.at))}</div>
              </div>
            ))}</div>
          : <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500 dark:bg-slate-900">{t("No recent logins")}</p>}
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Entry
// ---------------------------------------------------------------------------

export function DashboardPage({ data }: { data: DashboardData }) {
  switch (data.variant) {
    case "TEACHER":
      return <TeacherDashboard data={data} />;
    case "NURSE":
    case "LEADERSHIP":
      return <SchoolDashboard data={data} />;
    case "PARENT":
      return <ParentDashboard data={data} />;
    case "STUDENT":
      return <StudentDashboard data={data} />;
    case "SUPER_ADMIN":
      return <PlatformDashboard data={data} />;
  }
}
