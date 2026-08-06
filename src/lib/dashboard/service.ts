/**
 * STUDENT360 — Role-based dashboard service.
 *
 * The landing page after sign-in is composed per role from the live database:
 *   • LEADERSHIP (ADMIN / PRINCIPAL) → school pulse: metrics, class grid,
 *     students to check in, positive highlights, live activity, homework.
 *   • TEACHER → their classes, their students' signals, homework to review.
 *   • NURSE → wellbeing pulse: today's check-ins, open plans, signals.
 *   • PARENT → their children, recent family inputs, children's activity.
 *   • STUDENT → my day: check-in, homework, grades, goals, achievements.
 *   • SUPER_ADMIN → platform metrics + recent logins.
 *
 * Every read path stays inside the caller's RBAC scope (student / class scopes
 * are resolved through `src/lib/auth/rbac.ts`).
 */

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { accessibleClassIds, hasRole, isLeadership, resolveStudentScope } from "@/lib/auth/rbac";
import type { SessionPayload } from "@/lib/auth/session";
import { ROLES, ROLE_LABELS } from "@/lib/domain/enums";
import { isLocale, intlLocale, type Locale } from "@/i18n/config";
import { addDays, fullName, greetingFor, initials, startOfDay } from "@/lib/utils";
import { listChildren, listClasses, listStudents, type ChildCard, type StudentSignal } from "@/lib/students/service";

export type DashboardVariant = "STUDENT" | "PARENT" | "TEACHER" | "NURSE" | "LEADERSHIP" | "SUPER_ADMIN";

export type DashboardPerson = {
  id: string;
  name: string;
  initials: string;
  classId: string | null;
  className: string;
  headline: string;
  signal: StudentSignal;
  trend: "UP" | "DOWN" | "STABLE";
};

export type DashboardClass = {
  id: string;
  name: string;
  gradeLevel: string;
  teacherName: string;
  studentCount: number;
  attendance: number;
  homework: number;
  engagement: number;
};

export type DashboardEvent = {
  id: string;
  type: string;
  title: string;
  sentiment: string;
  occurredAt: string;
  studentName: string | null;
};

export type DashboardHomework = {
  id: string;
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  submitted: number;
  total: number;
};

export type DashboardMetrics = {
  students: number;
  teachers: number;
  activeClasses: number;
  attendanceToday: number | null;
  attendanceBreakdown: { present: number; late: number } | null;
  checkInsToday: number | null;
  homeworkCompletion: number | null;
  openPlans: number | null;
  openAlerts: number | null;
  submissionsToReview: number | null;
};

export type DashboardData = {
  variant: DashboardVariant;
  firstName: string;
  roleLabel: string;
  dateLabel: string;
  greeting: ReturnType<typeof greetingFor>;
  unreadMessages: number;
  metrics: DashboardMetrics | null;
  classes: DashboardClass[];
  studentsToCheck: DashboardPerson[];
  positiveHighlights: DashboardPerson[];
  liveEvents: DashboardEvent[];
  upcomingHomework: DashboardHomework[];
  student: {
    id: string;
    name: string;
    initials: string;
    className: string;
    overall: number;
    trend: "UP" | "DOWN" | "STABLE";
    headline: string;
    checkInToday: { mood: number; homeworkStatus: string } | null;
    homeworkDue: number;
    homeworkDone: number;
    activeGoals: { id: string; title: string; progress: number }[];
    recentAchievements: { id: string; title: string; awardedAt: string }[];
    recentGrades: { id: string; subject: string; score: number; date: string }[];
  } | null;
  children: ChildCard[];
  parentInputs: { id: string; type: string; content: string; occurredAt: string; studentName: string }[];
  platform: {
    schools: number;
    users: number;
    students: number;
    teachers: number;
    recentLogins: { id: string; userName: string; role: string; at: string }[];
  } | null;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function variantFor(session: SessionPayload): DashboardVariant {
  if (hasRole(session, ROLES.SUPER_ADMIN)) return "SUPER_ADMIN";
  if (isLeadership(session)) return "LEADERSHIP";
  if (hasRole(session, ROLES.TEACHER)) return "TEACHER";
  if (hasRole(session, ROLES.NURSE)) return "NURSE";
  if (hasRole(session, ROLES.PARENT)) return "PARENT";
  return "STUDENT";
}

function pct(value: number | null | undefined) {
  return Math.round(value ?? 0);
}

function signalHeadline(signal: StudentSignal) {
  if (signal === "ATTENTION") return "Action suggested";
  if (signal === "WATCH") return "Watch";
  if (signal === "POSITIVE") return "Positive progress";
  return "Stable";
}

function signalFor(values: { academic: number; attendance: number; homework: number; motivation: number; engagement: number; wellbeing: number }): StudentSignal {
  if (values.attendance < 88 || values.academic < 55 || values.homework < 50 || values.motivation < 45 || values.wellbeing < 40) return "ATTENTION";
  if (values.attendance < 93 || values.academic < 65 || values.homework < 65 || values.motivation < 55) return "WATCH";
  if ((values.academic + values.homework + values.engagement) / 3 >= 80) return "POSITIVE";
  return "STABLE";
}

function trendValue(value: string | null | undefined): "UP" | "DOWN" | "STABLE" {
  return value === "UP" || value === "DOWN" ? value : "STABLE";
}

function toPerson(row: {
  id: string;
  name: string;
  initials: string;
  classId: string | null;
  className: string;
  signal: StudentSignal;
  trend: "UP" | "DOWN" | "STABLE";
}): DashboardPerson {
  return {
    id: row.id,
    name: row.name,
    initials: row.initials,
    classId: row.classId,
    className: row.className,
    headline: signalHeadline(row.signal),
    signal: row.signal,
    trend: row.trend,
  };
}

async function liveEvents(
  session: SessionPayload,
  opts: { schoolWide?: boolean; types?: string[]; take?: number } = {},
): Promise<DashboardEvent[]> {
  const where: Prisma.ActivityEventWhereInput = {};
  if (session.schoolId) where.schoolId = session.schoolId;
  if (opts.types?.length) where.type = { in: opts.types };
  if (!opts.schoolWide) {
    const scope = await resolveStudentScope(session);
    if (scope.kind === "STUDENT_IDS" && scope.studentIds.length) {
      where.studentId = { in: scope.studentIds };
    } else if (scope.kind === "ALL_SCHOOL") {
      where.schoolId = scope.schoolId;
    } else if (scope.kind !== "PLATFORM") {
      return [];
    }
  }
  const rows = await prisma.activityEvent.findMany({
    where,
    orderBy: { occurredAt: "desc" },
    take: opts.take ?? 6,
    include: { student: { select: { user: { select: { firstName: true, lastName: true } } } } },
  });
  return rows.map((e) => ({
    id: e.id,
    type: e.type,
    title: e.title,
    sentiment: e.sentiment,
    occurredAt: e.occurredAt.toISOString(),
    studentName: e.student ? fullName(e.student.user) : null,
  }));
}

async function upcomingHomework(session: SessionPayload, take = 5): Promise<DashboardHomework[]> {
  const classIds = await accessibleClassIds(session);
  if (classIds === "ALL" || !classIds.length) return [];
  const dueFrom = startOfDay(new Date());
  const dueTo = addDays(dueFrom, 7);
  const rows = await prisma.homework.findMany({
    where: {
      classId: { in: classIds },
      status: "PUBLISHED",
      dueDate: { gte: dueFrom, lte: dueTo },
    },
    include: {
      subject: { select: { name: true } },
      class: { select: { name: true } },
    },
    orderBy: { dueDate: "asc" },
    take,
  });
  if (!rows.length) return [];

  const homeworkIds = rows.map((hw) => hw.id);
  const [allRows, doneRows] = await Promise.all([
    prisma.homeworkSubmission.groupBy({ by: ["homeworkId"], where: { homeworkId: { in: homeworkIds } }, _count: { _all: true } }),
    prisma.homeworkSubmission.groupBy({
      by: ["homeworkId"],
      where: { homeworkId: { in: homeworkIds }, status: { in: ["COMPLETED", "LATE"] } },
      _count: { _all: true },
    }),
  ]);
  const total = new Map(allRows.map((r) => [r.homeworkId, r._count._all]));
  const done = new Map(doneRows.map((r) => [r.homeworkId, r._count._all]));

  return rows.map((hw) => ({
    id: hw.id,
    title: hw.title,
    subject: hw.subject.name,
    className: hw.class.name,
    dueDate: hw.dueDate.toISOString().slice(0, 10),
    submitted: done.get(hw.id) ?? 0,
    total: total.get(hw.id) ?? 0,
  }));
}

async function schoolMetrics(session: SessionPayload): Promise<DashboardMetrics> {
  const today = startOfDay(new Date());
  const schoolId = session.schoolId!;

  const [studentCount, teacherCount, classCount, attendanceToday, checkInsToday, openPlans, openAlerts, latest] = await Promise.all([
    prisma.student.count({ where: { schoolId, status: "ACTIVE" } }),
    prisma.teacher.count({ where: { schoolId, status: "ACTIVE" } }),
    prisma.schoolClass.count({ where: { schoolId } }),
    prisma.attendanceRecord.findMany({ where: { schoolId, date: today }, select: { status: true } }),
    prisma.dailyCheckIn.count({ where: { schoolId, date: today } }),
    prisma.learningPlan.count({ where: { schoolId, status: "ACTIVE" } }),
    prisma.alert.count({ where: { schoolId, status: "OPEN" } }),
    prisma.studentIndicatorSnapshot.findFirst({
      where: { schoolId, granularity: "WEEK" },
      orderBy: { periodStart: "desc" },
      select: { periodStart: true },
    }),
  ]);

  let homeworkCompletion: number | null = null;
  if (latest) {
    const rows = await prisma.studentIndicatorSnapshot.findMany({
      where: { schoolId, granularity: "WEEK", periodStart: latest.periodStart },
      select: { homework: true },
    });
    const values = rows.map((r) => r.homework).filter((v): v is number => v !== null);
    if (values.length) homeworkCompletion = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }

  return {
    students: studentCount,
    teachers: teacherCount,
    activeClasses: classCount,
    attendanceToday: attendanceToday.length,
    attendanceBreakdown: {
      present: attendanceToday.filter((a) => a.status === "PRESENT").length,
      late: attendanceToday.filter((a) => a.status === "LATE").length,
    },
    checkInsToday,
    homeworkCompletion,
    openPlans,
    openAlerts,
    submissionsToReview: null,
  };
}

async function teacherMetrics(session: SessionPayload): Promise<DashboardMetrics> {
  const students = await listStudents(session);
  const classes = await listClasses(session);
  const classIds = classes.map((c) => c.id);
  const toReview = classIds.length
    ? await prisma.homeworkSubmission.count({
        where: {
          status: { in: ["PENDING", "MISSING", "NOT_DONE"] },
          homework: { classId: { in: classIds } },
        },
      })
    : 0;
  return {
    students: students.length,
    teachers: 0,
    activeClasses: classes.length,
    attendanceToday: null,
    attendanceBreakdown: null,
    checkInsToday: null,
    homeworkCompletion: null,
    openPlans: null,
    openAlerts: null,
    submissionsToReview: toReview,
  };
}

async function platformOverview() {
  const [schools, users, students, teachers, recentLogins] = await Promise.all([
    prisma.school.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.student.count({ where: { status: "ACTIVE" } }),
    prisma.teacher.count({ where: { status: "ACTIVE" } }),
    prisma.auditLog.findMany({
      where: { action: "LOGIN" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { actor: { select: { firstName: true, lastName: true, roles: { select: { roleCode: true } } } } },
    }),
  ]);
  return {
    schools,
    users,
    students,
    teachers,
    recentLogins: recentLogins.map((log) => ({
      id: log.id,
      userName: log.actor ? fullName(log.actor) : "—",
      role: log.actorRole ? (ROLE_LABELS[log.actorRole as keyof typeof ROLE_LABELS] ?? log.actorRole) : "—",
      at: log.createdAt.toISOString(),
    })),
  };
}

async function signalRoster(session: SessionPayload): Promise<{ toCheck: DashboardPerson[]; positives: DashboardPerson[] }> {
  const rows = await listStudents(session);
  const severity: Record<StudentSignal, number> = { ATTENTION: 0, WATCH: 1, POSITIVE: 2, STABLE: 3 };
  const sorted = rows.slice().sort((a, b) => severity[a.signal] - severity[b.signal]);
  const toCheck = sorted
    .filter((s) => s.signal === "ATTENTION" || s.signal === "WATCH")
    .slice(0, 5)
    .map((s) => toPerson(s));
  const positives = rows
    .filter((s) => s.signal === "POSITIVE")
    .slice(0, 4)
    .map((s) => toPerson(s));
  return { toCheck, positives };
}

// ---------------------------------------------------------------------------
// Main entry
// ---------------------------------------------------------------------------

export async function getDashboard(session: SessionPayload): Promise<DashboardData> {
  const variant = variantFor(session);
  const locale: Locale = isLocale(session.locale) ? session.locale : "fr";
  const dateLabel = new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "full" }).format(new Date());

  const roster = variant === "STUDENT" || variant === "PARENT" || variant === "SUPER_ADMIN" ? null : await signalRoster(session);

  const [unreadMessages, classes, live, homework, children, parentInputs, student, staffMetrics, platform] = await Promise.all([
    prisma.messageRecipient.count({ where: { userId: session.sub, readAt: null } }),
    (async () => {
      if (variant === "STUDENT" || variant === "PARENT") return [];
      const rows = await listClasses(session);
      return rows.map((c) => ({
        id: c.id,
        name: c.name,
        gradeLevel: c.gradeLevel,
        teacherName: c.teacherName,
        studentCount: c.studentCount,
        attendance: c.attendance,
        homework: c.homework,
        engagement: c.engagement,
      }));
    })(),
    (async () => {
      if (variant === "SUPER_ADMIN") return [];
      if (variant === "NURSE") return liveEvents(session, { schoolWide: true, types: ["CHECK_IN", "HELP_REQUEST"], take: 6 });
      if (variant === "LEADERSHIP") return liveEvents(session, { schoolWide: true, take: 6 });
      if (variant === "STUDENT" || variant === "PARENT" || variant === "TEACHER") return liveEvents(session, { take: 5 });
      return [];
    })(),
    (async () => {
      if (variant === "STUDENT" || variant === "PARENT" || variant === "SUPER_ADMIN") return [];
      return upcomingHomework(session, 5);
    })(),
    (async () => {
      if (variant !== "PARENT") return [];
      return listChildren(session);
    })(),
    (async () => {
      if (variant !== "PARENT" || !session.guardianId) return [];
      const rows = await prisma.parentInput.findMany({
        where: { guardianId: session.guardianId },
        orderBy: { occurredAt: "desc" },
        take: 5,
        include: { student: { select: { user: { select: { firstName: true, lastName: true } } } } },
      });
      return rows.map((row) => ({
        id: row.id,
        type: row.type,
        content: row.content,
        occurredAt: row.occurredAt.toISOString().slice(0, 10),
        studentName: fullName(row.student.user),
      }));
    })(),
    (async () => {
      if (variant !== "STUDENT" || !session.studentId) return null;
      const today = startOfDay(new Date());
      const studentId = session.studentId;
      const [row, checkInToday, submissions, goals, achievements, grades, snapshot] = await Promise.all([
        prisma.student.findUnique({
          where: { id: studentId },
          include: { user: { select: { firstName: true, lastName: true } }, currentClass: { select: { name: true } } },
        }),
        prisma.dailyCheckIn.findUnique({ where: { studentId_date: { studentId, date: today } } }),
        prisma.homeworkSubmission.findMany({
          where: { studentId },
          include: { homework: { select: { dueDate: true } } },
        }),
        prisma.studentGoal.findMany({
          where: { studentId, status: "ACTIVE" },
          orderBy: { updatedAt: "desc" },
          take: 3,
          select: { id: true, title: true, progress: true },
        }),
        prisma.achievement.findMany({
          where: { studentId },
          orderBy: { awardedAt: "desc" },
          take: 3,
          select: { id: true, title: true, awardedAt: true },
        }),
        prisma.grade.findMany({
          where: { studentId },
          orderBy: { gradedAt: "desc" },
          take: 5,
          select: { id: true, percentage: true, assessment: { select: { date: true, subject: { select: { name: true } } } } },
        }),
        prisma.studentIndicatorSnapshot.findFirst({
          where: { studentId, granularity: "WEEK" },
          orderBy: { periodStart: "desc" },
        }),
      ]);
      if (!row) return null;

      const values = snapshot
        ? {
            academic: pct(snapshot.academic),
            attendance: pct(snapshot.attendance),
            homework: pct(snapshot.homework),
            motivation: pct(snapshot.motivation),
            wellbeing: pct(snapshot.wellbeing),
            engagement: pct(snapshot.engagement),
          }
        : null;
      const overall = values
        ? pct((values.academic + values.homework + values.attendance + values.engagement + values.motivation + values.wellbeing) / 6)
        : 70;

      const pending = submissions.filter((s) => s.homework.dueDate >= today);

      return {
        id: row.id,
        name: fullName(row.user),
        initials: initials(row.user.firstName, row.user.lastName),
        className: row.currentClass?.name ?? "—",
        overall,
        trend: trendValue(snapshot?.overallTrend),
        headline: signalHeadline(values ? signalFor(values) : "STABLE"),
        checkInToday: checkInToday ? { mood: checkInToday.mood, homeworkStatus: checkInToday.homeworkStatus } : null,
        homeworkDue: pending.length,
        homeworkDone: submissions.filter((s) => s.status === "COMPLETED" || s.status === "LATE").length,
        activeGoals: goals.map((g) => ({ id: g.id, title: g.title, progress: g.progress })),
        recentAchievements: achievements.map((a) => ({ id: a.id, title: a.title, awardedAt: a.awardedAt.toISOString().slice(0, 10) })),
        recentGrades: grades
          .map((g) => ({ id: g.id, subject: g.assessment.subject.name, score: pct(g.percentage), date: g.assessment.date.toISOString().slice(0, 10) }))
          .filter((g) => g.score > 0),
      };
    })(),
    (async () => {
      if (variant === "LEADERSHIP" || variant === "NURSE") return schoolMetrics(session);
      if (variant === "TEACHER") return teacherMetrics(session);
      return null;
    })(),
    (async () => (variant === "SUPER_ADMIN" ? platformOverview() : null))(),
  ]);

  return {
    variant,
    firstName: session.firstName,
    roleLabel: ROLE_LABELS[session.activeRole],
    dateLabel,
    greeting: greetingFor(),
    unreadMessages,
    metrics: staffMetrics,
    classes,
    studentsToCheck: roster?.toCheck ?? [],
    positiveHighlights: roster?.positives ?? [],
    liveEvents: live,
    upcomingHomework: homework,
    student,
    children,
    parentInputs,
    platform,
  };
}
