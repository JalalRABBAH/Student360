import { prisma } from "@/lib/db";
import { resolveStudentScope } from "@/lib/auth/rbac";
import type { SessionPayload } from "@/lib/auth/session";
import { addDays, avg, fullName, initials, round, startOfDay, startOfWeek } from "@/lib/utils";

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

function studentWhereIn(scope: Scope): { id?: { in: string[] } | string; status: string } {
  if (scope === "ALL") return { status: "ACTIVE" };
  if (scope.length) return { id: { in: scope }, status: "ACTIVE" };
  return { id: "__none__", status: "ACTIVE" };
}

function avgOf(values: (number | null | undefined)[]) {
  return values.some((v) => v !== null && v !== undefined) ? (round(avg(values), 0) ?? null) : null;
}

function delta(current: number | null | undefined, previous: number | null | undefined) {
  if (current === null || current === undefined || previous === null || previous === undefined) return null;
  return round(current - previous, 1);
}

export type AnalyticsSignal = "POSITIVE" | "STABLE" | "WATCH" | "ATTENTION";

export function signalFor(ind: {
  attendance: number | null;
  academic: number | null;
  homework: number | null;
  motivation: number | null;
  wellbeing: number | null;
  engagement: number | null;
}): AnalyticsSignal {
  const attendance = ind.attendance ?? 0;
  const academic = ind.academic ?? 0;
  const homework = ind.homework ?? 0;
  const motivation = ind.motivation ?? 0;
  const wellbeing = ind.wellbeing ?? 0;
  const engagement = ind.engagement ?? 0;
  if (attendance < 88 || academic < 55 || homework < 50 || motivation < 45 || wellbeing < 40) return "ATTENTION";
  if (attendance < 93 || academic < 65 || homework < 65 || motivation < 55) return "WATCH";
  if ((academic + homework + engagement) / 3 >= 80) return "POSITIVE";
  return "STABLE";
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export type AnalyticsTrendPoint = {
  periodStart: string;
  attendance: number | null;
  homework: number | null;
  engagement: number | null;
  academic: number | null;
};

export type AnalyticsMetric = {
  label: string;
  value: number | null;
  detail: string;
  tone: "primary" | "sky" | "amber" | "violet";
  trend: number | null;
};

export type AnalyticsReason = { label: string; value: string };

export type AnalyticsStudent = {
  id: string;
  name: string;
  initials: string;
  className: string;
  gradeLevel: string;
  signal: AnalyticsSignal;
  indicators: {
    attendance: number | null;
    homework: number | null;
    engagement: number | null;
    academic: number | null;
    motivation: number | null;
    wellbeing: number | null;
  };
  reasons: AnalyticsReason[];
  points: number | null;
};

export type AnalyticsData = {
  schoolName: string | null;
  trends: AnalyticsTrendPoint[];
  metrics: AnalyticsMetric[];
  students: AnalyticsStudent[];
  total: number;
  insightReasons: AnalyticsReason[];
};

const REASON_KEYS: Array<[keyof AnalyticsStudent["indicators"], number, string]> = [
  ["attendance", 88, "Attendance"],
  ["homework", 60, "Homework completion"],
  ["academic", 65, "Academic score"],
  ["motivation", 55, "Motivation"],
  ["wellbeing", 40, "Wellbeing"],
];

export async function getAnalytics(session: SessionPayload): Promise<AnalyticsData> {
  const scope = await scopeStudentIds(session);

  const students = await prisma.student.findMany({
    where: studentWhereIn(scope),
    select: {
      id: true,
      currentClass: { select: { id: true, name: true, gradeLevel: true } },
      user: { select: { firstName: true, lastName: true } },
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

  const scopedSnaps = snaps;

  const periods = [...new Set(scopedSnaps.map((s) => s.periodStart.getTime()))]
    .map((t) => new Date(t))
    .sort((a, b) => a.getTime() - b.getTime())
    .slice(-8);

  const trends: AnalyticsTrendPoint[] = periods.map((period) => {
    const rows = scopedSnaps.filter((s) => s.periodStart.getTime() === period.getTime());
    return {
      periodStart: period.toISOString().slice(0, 10),
      attendance: avgOf(rows.map((r) => r.attendance)),
      homework: avgOf(rows.map((r) => r.homework)),
      engagement: avgOf(rows.map((r) => r.engagement)),
      academic: avgOf(rows.map((r) => r.academic)),
    };
  });

  const latest = new Map<string, (typeof scopedSnaps)[number]>();
  scopedSnaps.forEach((s) => {
    if (!latest.has(s.studentId) || s.periodStart > latest.get(s.studentId)!.periodStart) latest.set(s.studentId, s);
  });
  const previous = new Map<string, (typeof scopedSnaps)[number]>();
  scopedSnaps.forEach((s) => {
    const cur = latest.get(s.studentId);
    if (!cur) return;
    const isLatest = s.periodStart.getTime() === cur.periodStart.getTime();
    if (!isLatest && (!previous.has(s.studentId) || s.periodStart > previous.get(s.studentId)!.periodStart)) {
      previous.set(s.studentId, s);
    }
  });

  const tenDaysAgo = addDays(startOfDay(new Date()), -10);
  const twoWeeksAgo = addDays(startOfDay(new Date()), -14);

  const [attentionNotes, missingHomework] = await Promise.all([
    ids.length
      ? prisma.teacherObservation.findMany({
          where: { studentId: { in: ids }, sentiment: "ATTENTION", occurredAt: { gte: twoWeeksAgo } },
          select: { studentId: true },
        })
      : Promise.resolve([]),
    ids.length
      ? prisma.homeworkSubmission.findMany({
          where: { studentId: { in: ids }, status: { in: ["MISSING", "NOT_DONE"] }, updatedAt: { gte: tenDaysAgo } },
          select: { studentId: true },
        })
      : Promise.resolve([]),
  ]);

  const noteCount = new Map<string, number>();
  attentionNotes.forEach((n) => noteCount.set(n.studentId, (noteCount.get(n.studentId) ?? 0) + 1));
  const missingCount = new Map<string, number>();
  missingHomework.forEach((n) => missingCount.set(n.studentId, (missingCount.get(n.studentId) ?? 0) + 1));

  const studentOut: AnalyticsStudent[] = students.map((s) => {
    const cur = latest.get(s.id);
    const prev = previous.get(s.id);
    const indicators = {
      attendance: cur?.attendance ?? null,
      homework: cur?.homework ?? null,
      engagement: cur?.engagement ?? null,
      academic: cur?.academic ?? null,
      motivation: cur?.motivation ?? null,
      wellbeing: cur?.wellbeing ?? null,
    };
    const reasons: AnalyticsReason[] = [];
    REASON_KEYS.forEach(([key, threshold, label]) => {
      const v = indicators[key];
      if (v !== null && v < threshold) reasons.push({ label, value: `${round(v)}%` });
    });
    const notes = noteCount.get(s.id) ?? 0;
    if (notes > 0) reasons.push({ label: "Teacher attention notes", value: String(notes) });
    const missing = missingCount.get(s.id) ?? 0;
    if (missing > 0) reasons.push({ label: "Missing homework", value: String(missing) });
    const points =
      indicators.homework !== null && indicators.engagement !== null && prev
        ? round((indicators.homework - (prev.homework ?? indicators.homework)) + (indicators.engagement - (prev.engagement ?? indicators.engagement)), 0)
        : null;
    return {
      id: s.id,
      name: fullName(s.user),
      initials: initials(s.user.firstName, s.user.lastName),
      className: s.currentClass?.name ?? "—",
      gradeLevel: s.currentClass?.gradeLevel ?? "—",
      signal: cur ? signalFor(indicators) : "STABLE",
      indicators,
      reasons: reasons.slice(0, 3),
      points,
    };
  });

  const latestVals = [...latest.values()];
  const prevVals = [...previous.values()];
  const attendanceCurrent = avgOf(latestVals.map((s) => s.attendance));
  const attendancePrev = avgOf(prevVals.map((s) => s.attendance));
  const homeworkCurrent = avgOf(latestVals.map((s) => s.homework));
  const homeworkPrev = avgOf(prevVals.map((s) => s.homework));
  const engagementCurrent = avgOf(latestVals.map((s) => s.engagement));
  const engagementPrev = avgOf(prevVals.map((s) => s.engagement));

  const attentionCount = studentOut.filter((s) => s.signal === "ATTENTION").length;

  const lowAttendance = studentOut.filter((s) => (s.indicators.attendance ?? 100) < 88).length;
  const missingTotal = missingHomework.length;
  const noteTotal = attentionNotes.length;
  const insightReasons: AnalyticsReason[] = [];
  if (lowAttendance > 0) insightReasons.push({ label: "Low attendance", value: `${lowAttendance} students` });
  if (missingTotal > 0) insightReasons.push({ label: "Missing assignments", value: `${missingTotal} in 10 days` });
  if (noteTotal > 0) insightReasons.push({ label: "Teacher attention notes", value: `${noteTotal} in 14 days` });
  if (!insightReasons.length) insightReasons.push({ label: "All indicators stable compared with the previous period", value: "" });

  const metrics: AnalyticsMetric[] = [
    { label: "Attendance", value: attendanceCurrent, detail: "Latest weekly average", tone: "sky", trend: delta(attendanceCurrent, attendancePrev) },
    { label: "Homework", value: homeworkCurrent, detail: "Completion rate", tone: "primary", trend: delta(homeworkCurrent, homeworkPrev) },
    { label: "Engagement", value: engagementCurrent, detail: "Observation-based", tone: "amber", trend: delta(engagementCurrent, engagementPrev) },
    { label: "Attention suggested", value: attentionCount, detail: "Combined explainable signals", tone: "violet", trend: null },
  ];

  const schoolName = session.schoolId
    ? (await prisma.school.findUnique({ where: { id: session.schoolId }, select: { name: true } }))?.name ?? null
    : null;

  return { schoolName, trends, metrics, students: studentOut, total: studentOut.length, insightReasons };
}

// ---------------------------------------------------------------------------
// Live
// ---------------------------------------------------------------------------

export type LiveEvent = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  sentiment: string;
  studentId: string | null;
  studentName: string;
  className: string;
  occurredAt: string;
};

export type LiveClassPulse = {
  id: string;
  name: string;
  gradeLevel: string;
  students: number;
  attendance: number | null;
  homework: number | null;
  engagement: number | null;
  checkInRate: number | null;
};

export type LiveMapStudent = {
  id: string;
  name: string;
  initials: string;
  className: string;
  signal: AnalyticsSignal;
};

export type LiveData = {
  schoolName: string | null;
  types: string[];
  classes: { id: string; label: string }[];
  events: LiveEvent[];
  pulses: LiveClassPulse[];
  map: LiveMapStudent[];
  metrics: { eventsWeek: number; checkInsWeek: number; helpWeek: number; activeClasses: number };
  since: string;
};

export async function getLive(session: SessionPayload): Promise<LiveData> {
  const scope = await scopeStudentIds(session);
  const weekStart = startOfWeek(new Date());
  const since = addDays(startOfDay(new Date()), -6);

  const students = await prisma.student.findMany({
    where: studentWhereIn(scope),
    select: {
      id: true,
      currentClass: { select: { id: true, name: true, gradeLevel: true } },
      user: { select: { firstName: true, lastName: true } },
    },
  });

  const ids = students.map((s) => s.id);

  const [events, checkInsWeek, helpWeek, snaps] = await Promise.all([
    ids.length > 0
      ? prisma.activityEvent.findMany({
          where: { studentId: { in: ids }, occurredAt: { gte: since } },
          orderBy: { occurredAt: "desc" },
          take: 80,
          include: {
            student: {
              select: { id: true, user: { select: { firstName: true, lastName: true } }, currentClass: { select: { name: true } } },
            },
          },
        })
      : Promise.resolve([]),
    ids.length > 0 ? prisma.dailyCheckIn.count({ where: { studentId: { in: ids }, date: { gte: weekStart } } }) : 0,
    ids.length > 0 ? prisma.activityEvent.count({ where: { type: "HELP_REQUEST", studentId: { in: ids }, occurredAt: { gte: weekStart } } }) : 0,
    ids.length > 0
      ? prisma.studentIndicatorSnapshot.findMany({
          where: { studentId: { in: ids }, granularity: "WEEK" },
          select: { studentId: true, periodStart: true, academic: true, attendance: true, homework: true, engagement: true, motivation: true, wellbeing: true },
          orderBy: { periodStart: "asc" },
        })
      : [],
  ]);

  const latest = new Map<string, (typeof snaps)[number]>();
  snaps.forEach((s) => {
    if (!latest.has(s.studentId) || s.periodStart > latest.get(s.studentId)!.periodStart) latest.set(s.studentId, s);
  });

  const byClass = new Map<string, { id: string; name: string; gradeLevel: string; studentIds: string[] }>();
  students.forEach((s) => {
    const classId = s.currentClass?.id;
    if (!classId) return;
    const entry = byClass.get(classId) ?? { id: classId, name: s.currentClass!.name, gradeLevel: s.currentClass!.gradeLevel, studentIds: [] };
    entry.studentIds.push(s.id);
    byClass.set(classId, entry);
  });

  const classIds = [...byClass.keys()];
  const checkInsByClass =
    classIds.length > 0
      ? await prisma.dailyCheckIn.groupBy({
          by: ["studentId"],
          where: { studentId: { in: ids }, date: { gte: weekStart } },
          _count: { _all: true },
        })
      : [];

  const checkInCount = new Map<string, number>();
  checkInsByClass.forEach((r) => checkInCount.set(r.studentId, r._count._all));

  const pulses: LiveClassPulse[] = [...byClass.values()].map((c) => {
    const classSnaps = c.studentIds.map((id) => latest.get(id)).filter((s): s is NonNullable<typeof s> => Boolean(s));
    const attendance = avgOf(classSnaps.map((s) => s.attendance));
    const homework = avgOf(classSnaps.map((s) => s.homework));
    const engagement = avgOf(classSnaps.map((s) => s.engagement));
    const checkIns = c.studentIds.reduce((acc, id) => acc + (checkInCount.get(id) ?? 0), 0);
    return {
      id: c.id,
      name: c.name,
      gradeLevel: c.gradeLevel,
      students: c.studentIds.length,
      attendance,
      homework,
      engagement,
      checkInRate: c.studentIds.length ? round((checkIns / c.studentIds.length) * 100, 0) : null,
    };
  });

  const eventsOut: LiveEvent[] = events.map((e) => ({
    id: e.id,
    type: e.type,
    title: e.title,
    description: e.description,
    sentiment: e.sentiment,
    studentId: e.student?.id ?? null,
    studentName: e.student ? fullName(e.student.user) : "—",
    className: e.student?.currentClass?.name ?? "—",
    occurredAt: e.occurredAt.toISOString(),
  }));

  const types = [...new Set(eventsOut.map((e) => e.type))];

  const map: LiveMapStudent[] = students.map((s) => {
    const snap = latest.get(s.id);
    const indicators = {
      attendance: snap?.attendance ?? null,
      academic: snap?.academic ?? null,
      homework: snap?.homework ?? null,
      motivation: snap?.motivation ?? null,
      wellbeing: snap?.wellbeing ?? null,
      engagement: snap?.engagement ?? null,
    };
    return {
      id: s.id,
      name: fullName(s.user),
      initials: initials(s.user.firstName, s.user.lastName),
      className: s.currentClass?.name ?? "—",
      signal: snap ? signalFor(indicators) : "STABLE",
    };
  });

  const schoolName = session.schoolId
    ? (await prisma.school.findUnique({ where: { id: session.schoolId }, select: { name: true } }))?.name ?? null
    : null;

  return {
    schoolName,
    types,
    classes: [...byClass.values()].map((c) => ({ id: c.id, label: `${c.gradeLevel} ${c.name}` })),
    events: eventsOut,
    pulses,
    map,
    metrics: { eventsWeek: eventsOut.length, checkInsWeek: checkInsWeek, helpWeek: helpWeek, activeClasses: pulses.length },
    since: since.toISOString().slice(0, 10),
  };
}
