/**
 * STUDENT360 — indicator engine.
 *
 * Turns raw signals (attendance, homework, observations, check-ins, grades)
 * into the multi-dimensional picture the product is built around.
 *
 * Design rules:
 *  - A student is NEVER reduced to a single score. `overall` exists only as a
 *    convenience sort key and is always displayed next to its dimensions.
 *  - Every value is 0..100 or `null` (never 0 for "no data") so the UI can
 *    honestly say "not enough data yet".
 *  - Trends compare the current window with the immediately preceding window
 *    of identical length, so "last 30 days vs the 30 days before".
 */

import { prisma } from "@/lib/db";
import { type Trend, TREND } from "@/lib/domain/enums";
import { addDays, avg, clamp, round, startOfDay, startOfWeek } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const INDICATOR_KEYS = [
  "academic",
  "engagement",
  "homework",
  "attendance",
  "motivation",
  "wellbeing",
  "participation",
  "competencies",
  "overall",
] as const;

export type IndicatorKey = (typeof INDICATOR_KEYS)[number];
export type IndicatorSet = Record<IndicatorKey, number | null>;

export type MetricWindow = { from: Date; to: Date };

type AttendanceRow = { date: Date; status: string; minutesLate: number; justified: boolean };
type SubmissionRow = {
  status: string;
  submittedAt: Date | null;
  qualityScore: number | null;
  dueDate: Date;
  subjectId: string;
  homeworkId: string;
  title: string;
};
type GradeRow = {
  percentage: number | null;
  score: number | null;
  isAbsent: boolean;
  date: Date;
  maxScore: number;
  weight: number;
  subjectId: string;
};
type CheckInRow = {
  date: Date;
  mood: number;
  energy: number;
  motivation: number;
  stress: number;
  understanding: number;
  homeworkStatus: string;
  needsHelp: boolean;
  helpTopic: string | null;
};
type ObservationRow = {
  occurredAt: Date;
  category: string;
  sentiment: string;
  value: number | null;
  delta: number | null;
  teacherId: string;
};
type AlertRow = { id: string; level: string; code: string; title: string; status: string; detectedAt: Date };

export type StudentSignalData = {
  studentId: string;
  attendance: AttendanceRow[];
  submissions: SubmissionRow[];
  grades: GradeRow[];
  checkIns: CheckInRow[];
  observations: ObservationRow[];
  competencies: { score: number; level: number }[];
  alerts: AlertRow[];
};

export type StudentMetrics = {
  studentId: string;
  window: MetricWindow;
  current: IndicatorSet;
  previous: IndicatorSet;
  delta: Record<IndicatorKey, number | null>;
  trend: Record<IndicatorKey, Trend>;
  counts: {
    attendance: { present: number; absent: number; late: number; excused: number; total: number };
    homework: { assigned: number; completed: number; late: number; partial: number; missing: number; pending: number };
    checkIns: { received: number; expected: number; helpRequests: number };
    observations: { total: number; positive: number; attention: number; teachers: number };
    assessments: number;
  };
  latest: {
    checkIn: CheckInRow | null;
    mood: number | null;
    observation: ObservationRow | null;
    attendance: AttendanceRow | null;
  };
  openAlerts: AlertRow[];
  series: WeeklyPoint[];
  data: StudentSignalData;
};

export type WeeklyPoint = {
  weekStart: string;
  label: string;
  homework: number | null;
  attendance: number | null;
  engagement: number | null;
  motivation: number | null;
  mood: number | null;
  academic: number | null;
};

// ---------------------------------------------------------------------------
// Scoring primitives
// ---------------------------------------------------------------------------

const ATTENDANCE_WEIGHT: Record<string, number> = { PRESENT: 1, EXCUSED: 0.85, LATE: 0.7, ABSENT: 0 };
const SUBMISSION_WEIGHT: Record<string, number> = {
  COMPLETED: 1,
  LATE: 0.75,
  PARTIAL: 0.5,
  NEED_HELP: 0.4,
  PENDING: 0.1,
  NOT_DONE: 0,
  MISSING: 0,
};
const SENTIMENT_FALLBACK: Record<string, number> = { POSITIVE: 84, NEUTRAL: 60, ATTENTION: 34 };

const ENGAGEMENT_CATEGORIES = new Set([
  "PARTICIPATION",
  "ENGAGEMENT",
  "EFFORT",
  "COLLABORATION",
  "AUTONOMY",
  "UNDERSTANDING",
  "BEHAVIOR",
  "IMPROVEMENT",
]);

/** 1..5 self-report or rating → 0..100 */
export function scaleToScore(value: number | null | undefined) {
  if (value === null || value === undefined) return null;
  return clamp(((value - 1) / 4) * 100);
}

function weightedAverage(pairs: { value: number; weight: number }[]) {
  const totalWeight = pairs.reduce((a, p) => a + p.weight, 0);
  if (!totalWeight) return null;
  return pairs.reduce((a, p) => a + p.value * p.weight, 0) / totalWeight;
}

export function attendanceScore(rows: AttendanceRow[]) {
  if (!rows.length) return null;
  const score = rows.reduce((a, r) => a + (ATTENDANCE_WEIGHT[r.status] ?? 0), 0);
  return clamp((score / rows.length) * 100);
}

export function homeworkScore(rows: SubmissionRow[]) {
  if (!rows.length) return null;
  const score = rows.reduce((a, r) => a + (SUBMISSION_WEIGHT[r.status] ?? 0), 0);
  return clamp((score / rows.length) * 100);
}

export function academicScore(rows: GradeRow[]) {
  const pairs = rows
    .filter((g) => !g.isAbsent)
    .map((g) => {
      const value = g.percentage ?? (g.score !== null && g.maxScore ? (g.score / g.maxScore) * 100 : null);
      return value === null ? null : { value: clamp(value), weight: g.weight || 1 };
    })
    .filter((p): p is { value: number; weight: number } => Boolean(p));
  return pairs.length ? clamp(weightedAverage(pairs) ?? 0) : null;
}

export function observationScore(rows: ObservationRow[], categories?: Set<string>) {
  const relevant = categories ? rows.filter((o) => categories.has(o.category)) : rows;
  if (!relevant.length) return null;
  const values = relevant.map((o) =>
    o.value !== null && o.value !== undefined ? scaleToScore(o.value)! : SENTIMENT_FALLBACK[o.sentiment] ?? 60,
  );
  return clamp(avg(values) ?? 0);
}

export function motivationScore(rows: CheckInRow[]) {
  const value = avg(rows.map((c) => c.motivation));
  return value === null ? null : scaleToScore(value);
}

export function wellbeingScore(rows: CheckInRow[]) {
  if (!rows.length) return null;
  const mood = scaleToScore(avg(rows.map((c) => c.mood)));
  const energy = scaleToScore(avg(rows.map((c) => c.energy)));
  const calm = scaleToScore(avg(rows.map((c) => 6 - c.stress)));
  const parts = [
    { value: mood, weight: 0.5 },
    { value: energy, weight: 0.25 },
    { value: calm, weight: 0.25 },
  ].filter((p): p is { value: number; weight: number } => p.value !== null);
  return parts.length ? clamp(weightedAverage(parts) ?? 0) : null;
}

const OVERALL_WEIGHTS: Partial<Record<IndicatorKey, number>> = {
  academic: 0.24,
  homework: 0.2,
  attendance: 0.18,
  engagement: 0.2,
  motivation: 0.09,
  wellbeing: 0.09,
};

export function overallScore(set: Omit<IndicatorSet, "overall">) {
  const parts = Object.entries(OVERALL_WEIGHTS)
    .map(([key, weight]) => {
      const value = set[key as keyof typeof set];
      return value === null || value === undefined ? null : { value, weight: weight! };
    })
    .filter((p): p is { value: number; weight: number } => Boolean(p));
  return parts.length ? clamp(weightedAverage(parts) ?? 0) : null;
}

// ---------------------------------------------------------------------------
// Windowing
// ---------------------------------------------------------------------------

function inWindow(date: Date, from: Date, to: Date) {
  const t = new Date(date).getTime();
  return t >= from.getTime() && t <= to.getTime();
}

function sliceData(data: StudentSignalData, from: Date, to: Date): StudentSignalData {
  return {
    studentId: data.studentId,
    attendance: data.attendance.filter((r) => inWindow(r.date, from, to)),
    submissions: data.submissions.filter((r) => inWindow(r.dueDate, from, to)),
    grades: data.grades.filter((r) => inWindow(r.date, from, to)),
    checkIns: data.checkIns.filter((r) => inWindow(r.date, from, to)),
    observations: data.observations.filter((r) => inWindow(r.occurredAt, from, to)),
    competencies: data.competencies,
    alerts: data.alerts,
  };
}

export function indicatorsFor(slice: StudentSignalData): IndicatorSet {
  const base = {
    academic: round(academicScore(slice.grades), 1),
    engagement: round(observationScore(slice.observations, ENGAGEMENT_CATEGORIES), 1),
    homework: round(homeworkScore(slice.submissions), 1),
    attendance: round(attendanceScore(slice.attendance), 1),
    motivation: round(motivationScore(slice.checkIns), 1),
    wellbeing: round(wellbeingScore(slice.checkIns), 1),
    participation: round(observationScore(slice.observations, new Set(["PARTICIPATION"])), 1),
    competencies: slice.competencies.length ? round(avg(slice.competencies.map((c) => c.score)), 1) : null,
  };
  return { ...base, overall: round(overallScore(base), 1) };
}

function schoolDaysBetween(from: Date, to: Date) {
  let count = 0;
  for (let d = startOfDay(from); d.getTime() <= to.getTime(); d = addDays(d, 1)) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) count += 1;
  }
  return count;
}

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

export async function loadSignalData(studentIds: string[], from: Date, to: Date) {
  const map = new Map<string, StudentSignalData>();
  if (!studentIds.length) return map;

  studentIds.forEach((id) =>
    map.set(id, {
      studentId: id,
      attendance: [],
      submissions: [],
      grades: [],
      checkIns: [],
      observations: [],
      competencies: [],
      alerts: [],
    }),
  );

  const range = { gte: from, lte: to };

  const [attendance, submissions, grades, checkIns, observations, competencies, alerts] = await Promise.all([
    prisma.attendanceRecord.findMany({
      where: { studentId: { in: studentIds }, date: range },
      select: { studentId: true, date: true, status: true, minutesLate: true, justified: true },
      orderBy: { date: "asc" },
    }),
    prisma.homeworkSubmission.findMany({
      where: { studentId: { in: studentIds }, homework: { dueDate: range } },
      select: {
        studentId: true,
        status: true,
        submittedAt: true,
        qualityScore: true,
        homeworkId: true,
        homework: { select: { dueDate: true, subjectId: true, title: true } },
      },
    }),
    prisma.grade.findMany({
      where: { studentId: { in: studentIds }, assessment: { date: range } },
      select: {
        studentId: true,
        percentage: true,
        score: true,
        isAbsent: true,
        assessment: { select: { date: true, maxScore: true, weight: true, subjectId: true } },
      },
    }),
    prisma.dailyCheckIn.findMany({
      where: { studentId: { in: studentIds }, date: range },
      select: {
        studentId: true,
        date: true,
        mood: true,
        energy: true,
        motivation: true,
        stress: true,
        understanding: true,
        homeworkStatus: true,
        needsHelp: true,
        helpTopic: true,
      },
      orderBy: { date: "asc" },
    }),
    prisma.teacherObservation.findMany({
      where: { studentId: { in: studentIds }, occurredAt: range },
      select: {
        studentId: true,
        occurredAt: true,
        category: true,
        sentiment: true,
        value: true,
        delta: true,
        teacherId: true,
      },
      orderBy: { occurredAt: "asc" },
    }),
    prisma.studentCompetency.findMany({
      where: { studentId: { in: studentIds } },
      select: { studentId: true, score: true, level: true },
    }),
    prisma.alert.findMany({
      where: { studentId: { in: studentIds }, status: { in: ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS"] } },
      select: { id: true, studentId: true, level: true, code: true, title: true, status: true, detectedAt: true },
      orderBy: { detectedAt: "desc" },
    }),
  ]);

  attendance.forEach((r) => map.get(r.studentId)?.attendance.push(r));
  submissions.forEach((r) =>
    map.get(r.studentId)?.submissions.push({
      status: r.status,
      submittedAt: r.submittedAt,
      qualityScore: r.qualityScore,
      homeworkId: r.homeworkId,
      dueDate: r.homework.dueDate,
      subjectId: r.homework.subjectId,
      title: r.homework.title,
    }),
  );
  grades.forEach((r) =>
    map.get(r.studentId)?.grades.push({
      percentage: r.percentage,
      score: r.score,
      isAbsent: r.isAbsent,
      date: r.assessment.date,
      maxScore: r.assessment.maxScore,
      weight: r.assessment.weight,
      subjectId: r.assessment.subjectId,
    }),
  );
  checkIns.forEach((r) => map.get(r.studentId)?.checkIns.push(r));
  observations.forEach((r) => map.get(r.studentId)?.observations.push(r));
  competencies.forEach((r) => map.get(r.studentId)?.competencies.push({ score: r.score, level: r.level }));
  alerts.forEach((r) => map.get(r.studentId)?.alerts.push(r));

  map.forEach((d) => d.submissions.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()));

  return map;
}

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

export function weeklySeries(data: StudentSignalData, from: Date, to: Date): WeeklyPoint[] {
  const points: WeeklyPoint[] = [];
  let cursor = startOfWeek(from);
  while (cursor.getTime() <= to.getTime()) {
    const weekEnd = addDays(cursor, 6);
    weekEnd.setHours(23, 59, 59, 999);
    const slice = sliceData(data, cursor, weekEnd);
    points.push({
      weekStart: cursor.toISOString().slice(0, 10),
      label: `${cursor.getDate()}/${cursor.getMonth() + 1}`,
      homework: round(homeworkScore(slice.submissions), 0),
      attendance: round(attendanceScore(slice.attendance), 0),
      engagement: round(observationScore(slice.observations, ENGAGEMENT_CATEGORIES), 0),
      motivation: round(motivationScore(slice.checkIns), 0),
      mood: round(avg(slice.checkIns.map((c) => c.mood)), 2),
      academic: round(academicScore(slice.grades), 0),
    });
    cursor = addDays(cursor, 7);
  }
  return points;
}

export function metricsFor(data: StudentSignalData, window: MetricWindow): StudentMetrics {
  const length = Math.max(1, Math.round((window.to.getTime() - window.from.getTime()) / 86_400_000));
  const prevTo = addDays(window.from, -1);
  prevTo.setHours(23, 59, 59, 999);
  const prevFrom = startOfDay(addDays(prevTo, -length));

  const currentSlice = sliceData(data, window.from, window.to);
  const previousSlice = sliceData(data, prevFrom, prevTo);

  const current = indicatorsFor(currentSlice);
  const previous = indicatorsFor(previousSlice);

  const delta = {} as Record<IndicatorKey, number | null>;
  const trend = {} as Record<IndicatorKey, Trend>;
  INDICATOR_KEYS.forEach((key) => {
    const a = current[key];
    const b = previous[key];
    delta[key] = a !== null && b !== null ? round(a - b, 1) : null;
    trend[key] =
      delta[key] === null ? TREND.STABLE : delta[key]! >= 4 ? TREND.UP : delta[key]! <= -4 ? TREND.DOWN : TREND.STABLE;
  });

  const att = currentSlice.attendance;
  const subs = currentSlice.submissions;
  const obs = currentSlice.observations;

  return {
    studentId: data.studentId,
    window,
    current,
    previous,
    delta,
    trend,
    counts: {
      attendance: {
        present: att.filter((a) => a.status === "PRESENT").length,
        absent: att.filter((a) => a.status === "ABSENT").length,
        late: att.filter((a) => a.status === "LATE").length,
        excused: att.filter((a) => a.status === "EXCUSED").length,
        total: att.length,
      },
      homework: {
        assigned: subs.length,
        completed: subs.filter((s) => s.status === "COMPLETED").length,
        late: subs.filter((s) => s.status === "LATE").length,
        partial: subs.filter((s) => s.status === "PARTIAL").length,
        missing: subs.filter((s) => s.status === "MISSING" || s.status === "NOT_DONE").length,
        pending: subs.filter((s) => s.status === "PENDING").length,
      },
      checkIns: {
        received: currentSlice.checkIns.length,
        expected: schoolDaysBetween(window.from, window.to),
        helpRequests: currentSlice.checkIns.filter((c) => c.needsHelp).length,
      },
      observations: {
        total: obs.length,
        positive: obs.filter((o) => o.sentiment === "POSITIVE").length,
        attention: obs.filter((o) => o.sentiment === "ATTENTION").length,
        teachers: new Set(obs.map((o) => o.teacherId)).size,
      },
      assessments: currentSlice.grades.length,
    },
    latest: {
      checkIn: data.checkIns.at(-1) ?? null,
      mood: data.checkIns.at(-1)?.mood ?? null,
      observation: data.observations.at(-1) ?? null,
      attendance: data.attendance.at(-1) ?? null,
    },
    openAlerts: data.alerts,
    series: weeklySeries(data, window.from, window.to),
    data,
  };
}

/**
 * Main entry point. Loads the doubled window once and derives current +
 * previous indicators for every student in a single pass.
 */
export async function studentMetrics(studentIds: string[], window: MetricWindow) {
  const length = Math.max(1, Math.round((window.to.getTime() - window.from.getTime()) / 86_400_000));
  const loadFrom = startOfDay(addDays(window.from, -(length + 1)));
  const raw = await loadSignalData(studentIds, loadFrom, window.to);
  const out = new Map<string, StudentMetrics>();
  raw.forEach((data, id) => out.set(id, metricsFor(data, window)));
  return out;
}

export function defaultWindow(days = 30): MetricWindow {
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  return { from: startOfDay(addDays(to, -(days - 1))), to };
}

/** Aggregate a group of students into class / school level averages. */
export function aggregateIndicators(list: StudentMetrics[]): IndicatorSet {
  const out = {} as IndicatorSet;
  INDICATOR_KEYS.forEach((key) => {
    out[key] = round(avg(list.map((m) => m.current[key])), 1);
  });
  return out;
}

export function aggregateDelta(list: StudentMetrics[]): Record<IndicatorKey, number | null> {
  const out = {} as Record<IndicatorKey, number | null>;
  INDICATOR_KEYS.forEach((key) => {
    out[key] = round(avg(list.map((m) => m.delta[key])), 1);
  });
  return out;
}
