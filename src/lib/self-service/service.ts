import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hasRole, isStaff, resolveStudentScope } from "@/lib/auth/rbac";
import type { SessionPayload } from "@/lib/auth/session";
import {
  GOAL_CATEGORY_LABELS,
  GOAL_STATUS_LABELS,
  OBSERVATION_CATEGORY_LABELS,
  ROLES,
} from "@/lib/domain/enums";
import { avg, fullName, initials, parseJson, round } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

type Scope = string[] | "ALL";

async function scopeStudentIds(session: SessionPayload): Promise<Scope> {
  const scope = await resolveStudentScope(session);
  if (scope.kind === "PLATFORM") return "ALL";
  if (scope.kind === "ALL_SCHOOL") {
    const rows = await prisma.student.findMany({
      where: { schoolId: scope.schoolId, status: "ACTIVE" },
      select: { id: true },
    });
    return rows.map((r) => r.id);
  }
  if (scope.kind === "STUDENT_IDS") return scope.studentIds;
  return [];
}

function studentWhereIn(scope: Scope): Prisma.StudentWhereInput {
  if (scope === "ALL") return { status: "ACTIVE" };
  if (scope.length) return { id: { in: scope }, status: "ACTIVE" };
  return { id: "__none__" };
}

function familyVisibilityFilter(session: SessionPayload) {
  if (hasRole(session, ROLES.PARENT)) {
    return { visibility: { in: ["INCLUDING_PARENTS", "PARTICIPANTS"] } };
  }
  return {};
}

function avgOf(values: (number | null | undefined)[]) {
  return values.some((v) => v !== null && v !== undefined) ? (round(avg(values), 0) ?? 0) : null;
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export type IndicatorValues = {
  academic: number | null;
  engagement: number | null;
  homework: number | null;
  attendance: number | null;
  motivation: number | null;
  wellbeing: number | null;
};

export type ProgressSignal = "POSITIVE" | "STABLE" | "WATCH" | "ATTENTION";

export type ProgressStudent = {
  id: string;
  name: string;
  initials: string;
  className: string;
  indicators: IndicatorValues;
  signal: ProgressSignal;
};

export type ProgressWeek = {
  periodStart: string;
  homework: number;
  engagement: number;
  motivation: number;
};

export type ProgressInsight = {
  tone: "positive" | "next";
  title: string;
  reasons: string[];
};

export type ProgressData = {
  variant: "STAFF" | "SELF";
  metrics: IndicatorValues;
  students: ProgressStudent[];
  weeks: ProgressWeek[] | null;
  insights: ProgressInsight[];
};

function signalFor(v: IndicatorValues): ProgressSignal {
  const attendance = v.attendance ?? 0;
  const academic = v.academic ?? 0;
  const homework = v.homework ?? 0;
  const motivation = v.motivation ?? 0;
  const wellbeing = v.wellbeing ?? 0;
  const engagement = v.engagement ?? 0;
  if (attendance < 88 || academic < 55 || homework < 50 || motivation < 45 || wellbeing < 40) return "ATTENTION";
  if (attendance < 93 || academic < 65 || homework < 65 || motivation < 55) return "WATCH";
  if ((academic + homework + engagement) / 3 >= 80) return "POSITIVE";
  return "STABLE";
}

function buildInsights(weeks: ProgressWeek[], latest: IndicatorValues | undefined): ProgressInsight[] {
  const insights: ProgressInsight[] = [];
  const homework = weeks.map((w) => w.homework);
  const improved = homework.length >= 3 && homework[homework.length - 1] >= homework[homework.length - 3] + 5;
  const engaged = (latest?.engagement ?? 0) >= 75;
  if (improved || engaged) {
    insights.push({
      tone: "positive",
      title: "You are building momentum",
      reasons: [
        ...(improved ? ["Homework consistency improved for three weeks"] : []),
        ...(engaged ? ["Teachers noticed strong collaboration"] : []),
      ],
    });
  }
  insights.push({
    tone: "next",
    title: "Next useful step",
    reasons: ["Keep using your planning checklist", "Ask for help early when something feels unclear"],
  });
  return insights;
}

export async function getProgress(session: SessionPayload): Promise<ProgressData> {
  const scope = await scopeStudentIds(session);
  const staff = isStaff(session);
  const students = await prisma.student.findMany({
    where: studentWhereIn(scope),
    select: {
      id: true,
      currentClassId: true,
      user: { select: { firstName: true, lastName: true } },
      currentClass: { select: { name: true } },
    },
  });
  const ids = students.map((s) => s.id);

  const snaps =
    ids.length > 0
      ? await prisma.studentIndicatorSnapshot.findMany({
          where: { studentId: { in: ids }, granularity: "WEEK" },
          select: {
            studentId: true,
            periodStart: true,
            academic: true,
            engagement: true,
            homework: true,
            attendance: true,
            motivation: true,
            wellbeing: true,
          },
          orderBy: { periodStart: "asc" },
        })
      : [];

  const latest = new Map<string, (typeof snaps)[number]>();
  snaps.forEach((s) => {
    if (!latest.has(s.studentId) || s.periodStart > latest.get(s.studentId)!.periodStart) latest.set(s.studentId, s);
  });

  const roster: ProgressStudent[] = students.map((s) => {
    const snap = latest.get(s.id);
    const indicators: IndicatorValues = {
      academic: snap?.academic ?? null,
      engagement: snap?.engagement ?? null,
      homework: snap?.homework ?? null,
      attendance: snap?.attendance ?? null,
      motivation: snap?.motivation ?? null,
      wellbeing: snap?.wellbeing ?? null,
    };
    return {
      id: s.id,
      name: fullName(s.user),
      initials: initials(s.user.firstName, s.user.lastName),
      className: s.currentClass?.name ?? "—",
      indicators,
      signal: snap ? signalFor(indicators) : "STABLE",
    };
  });

  const metrics: IndicatorValues = {
    academic: avgOf([...latest.values()].map((s) => s.academic)),
    engagement: avgOf([...latest.values()].map((s) => s.engagement)),
    homework: avgOf([...latest.values()].map((s) => s.homework)),
    attendance: avgOf([...latest.values()].map((s) => s.attendance)),
    motivation: avgOf([...latest.values()].map((s) => s.motivation)),
    wellbeing: avgOf([...latest.values()].map((s) => s.wellbeing)),
  };

  if (staff) return { variant: "STAFF", metrics, students: roster, weeks: null, insights: [] };

  if (students.length === 1) {
    const mine = snaps.filter((s) => s.studentId === students[0].id).slice(-6);
    const weeks: ProgressWeek[] = mine.map((s) => ({
      periodStart: s.periodStart.toISOString().slice(0, 10),
      homework: s.homework ?? 0,
      engagement: s.engagement ?? 0,
      motivation: s.motivation ?? 0,
    }));
    return {
      variant: "SELF",
      metrics,
      students: roster,
      weeks,
      insights: buildInsights(weeks, latest.get(students[0].id)),
    };
  }

  return { variant: "SELF", metrics, students: roster, weeks: null, insights: [] };
}

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------

export type GoalItem = {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  status: string;
  statusLabel: string;
  progress: number;
  targetDate: string;
  studentId: string;
  studentName: string;
  className: string;
};

export type GoalsData = {
  variant: "STAFF" | "SELF";
  items: GoalItem[];
  metrics: { active: number; achieved: number; averageProgress: number };
};

export async function getGoals(session: SessionPayload): Promise<GoalsData> {
  const scope = await scopeStudentIds(session);
  const staff = isStaff(session);
  const rows = await prisma.studentGoal.findMany({
    where: { student: studentWhereIn(scope), ...familyVisibilityFilter(session) },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    take: 60,
    include: {
      student: {
        select: { id: true, user: { select: { firstName: true, lastName: true } }, currentClass: { select: { name: true } } },
      },
    },
  });

  const items: GoalItem[] = rows.map((g) => ({
    id: g.id,
    title: g.title,
    category: g.category,
    categoryLabel: GOAL_CATEGORY_LABELS[g.category] ?? g.category,
    status: g.status,
    statusLabel: GOAL_STATUS_LABELS[g.status] ?? g.status,
    progress: g.progress,
    targetDate: g.targetDate.toISOString().slice(0, 10),
    studentId: g.student.id,
    studentName: fullName(g.student.user),
    className: g.student.currentClass?.name ?? "—",
  }));

  return {
    variant: staff ? "STAFF" : "SELF",
    items,
    metrics: {
      active: rows.filter((g) => g.status === "ACTIVE").length,
      achieved: rows.filter((g) => g.status === "ACHIEVED").length,
      averageProgress: rows.length ? (round(avg(rows.map((g) => g.progress)), 0) ?? 0) : 0,
    },
  };
}

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------

export type FeedbackItem = {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  category: string;
  categoryLabel: string;
  subject: string | null;
  sentiment: string;
  note: string | null;
  teacherName: string;
  occurredAt: string;
};

export type FeedbackData = {
  variant: "STAFF" | "SELF";
  items: FeedbackItem[];
  metrics: { month: number; positive: number; nextSteps: number };
};

export async function getFeedback(session: SessionPayload): Promise<FeedbackData> {
  const scope = await scopeStudentIds(session);
  const staff = isStaff(session);
  const rows = await prisma.teacherObservation.findMany({
    where: { student: studentWhereIn(scope), ...familyVisibilityFilter(session) },
    orderBy: { occurredAt: "desc" },
    take: 60,
    include: {
      student: {
        select: { id: true, user: { select: { firstName: true, lastName: true } }, currentClass: { select: { name: true } } },
      },
      teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
      subject: { select: { name: true } },
    },
  });

  const items: FeedbackItem[] = rows.map((o) => ({
    id: o.id,
    studentId: o.student.id,
    studentName: fullName(o.student.user),
    className: o.student.currentClass?.name ?? "—",
    category: o.category,
    categoryLabel: OBSERVATION_CATEGORY_LABELS[o.category] ?? o.category,
    subject: o.subject?.name ?? null,
    sentiment: o.sentiment,
    note: o.note,
    teacherName: fullName(o.teacher.user),
    occurredAt: o.occurredAt.toISOString(),
  }));

  const since = new Date();
  since.setDate(since.getDate() - 30);

  return {
    variant: staff ? "STAFF" : "SELF",
    items,
    metrics: {
      month: rows.filter((o) => o.occurredAt >= since).length,
      positive: rows.filter((o) => o.sentiment === "POSITIVE").length,
      nextSteps: rows.filter((o) => o.sentiment === "ATTENTION").length,
    },
  };
}

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------

export type AchievementItem = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  level: string;
  studentId: string;
  studentName: string;
  className: string;
  awardedAt: string;
};

export type AchievementsData = {
  variant: "STAFF" | "SELF";
  items: AchievementItem[];
  metrics: { total: number; gold: number; silver: number; bronze: number };
};

export async function getAchievements(session: SessionPayload): Promise<AchievementsData> {
  const scope = await scopeStudentIds(session);
  const staff = isStaff(session);
  const rows = await prisma.achievement.findMany({
    where: { student: studentWhereIn(scope), ...familyVisibilityFilter(session) },
    orderBy: { awardedAt: "desc" },
    take: 60,
    include: {
      student: {
        select: { id: true, user: { select: { firstName: true, lastName: true } }, currentClass: { select: { name: true } } },
      },
    },
  });

  const items: AchievementItem[] = rows.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    category: a.category,
    level: a.level,
    studentId: a.student.id,
    studentName: fullName(a.student.user),
    className: a.student.currentClass?.name ?? "—",
    awardedAt: a.awardedAt.toISOString(),
  }));

  return {
    variant: staff ? "STAFF" : "SELF",
    items,
    metrics: {
      total: rows.length,
      gold: rows.filter((a) => a.level === "GOLD").length,
      silver: rows.filter((a) => a.level === "SILVER").length,
      bronze: rows.filter((a) => a.level === "BRONZE").length,
    },
  };
}

// ---------------------------------------------------------------------------
// Help requests
// ---------------------------------------------------------------------------

export type HelpItem = {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string | null;
  options: string[];
  createdAt: string;
};

export type HelpData = {
  canRequest: boolean;
  thisWeek: number;
  items: HelpItem[];
};

export async function getHelp(session: SessionPayload): Promise<HelpData> {
  const scope = await scopeStudentIds(session);
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);

  const rows = await prisma.activityEvent.findMany({
    where: { type: "HELP_REQUEST", student: studentWhereIn(scope) },
    orderBy: { occurredAt: "desc" },
    take: 30,
    include: {
      student: {
        select: { id: true, user: { select: { firstName: true, lastName: true } }, currentClass: { select: { name: true } } },
      },
    },
  });

  const items: HelpItem[] = rows.map((e) => ({
    id: e.id,
    studentId: e.student?.id ?? "—",
    studentName: e.student ? fullName(e.student.user) : "—",
    title: e.title,
    description: e.description,
    options: parseJson<string[]>(e.metadata, []),
    createdAt: e.occurredAt.toISOString(),
  }));

  return {
    canRequest: hasRole(session, ROLES.STUDENT),
    thisWeek: rows.filter((e) => e.occurredAt >= weekStart).length,
    items,
  };
}
