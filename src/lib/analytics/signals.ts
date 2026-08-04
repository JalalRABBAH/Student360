/**
 * STUDENT360 — explainable signal engine.
 *
 * Rules, not black boxes. Every signal carries the evidence that produced it,
 * so the UI can always answer "why am I seeing this?".
 *
 * Product guardrails encoded here:
 *  - No opaque risk score is ever produced.
 *  - Positive signals are detected with the same rigour as concerns.
 *  - Wording is descriptive ("motivation declined"), never diagnostic.
 *  - Signals are suggestions for a human, never automatic sanctions.
 */

import { ALERT_LEVELS, type AlertLevel, SIGNAL_CODES, TREND } from "@/lib/domain/enums";
import { addDays, avg, round, startOfDay } from "@/lib/utils";

import type { IndicatorKey, StudentMetrics } from "./indicators";

export type SignalPolarity = "CONCERN" | "POSITIVE" | "NEUTRAL";

export type Signal = {
  code: string;
  level: AlertLevel;
  polarity: SignalPolarity;
  title: string;
  /** Human readable, evidence-backed bullet points. */
  reasons: string[];
  indicator?: IndicatorKey;
  /** Suggested next step for the adult reading it. Never applied automatically. */
  suggestion?: string;
  weight: number;
};

export type StudentSignalReport = {
  studentId: string;
  level: AlertLevel | null;
  concerns: Signal[];
  positives: Signal[];
  all: Signal[];
  /** Combined statement when several weak signals appear at the same time. */
  combined: Signal | null;
  headline: string;
};

const fmt = (value: number | null | undefined, digits = 0) =>
  value === null || value === undefined ? "–" : value.toFixed(digits);

// ---------------------------------------------------------------------------
// Detection
// ---------------------------------------------------------------------------

export function detectSignals(metrics: StudentMetrics): StudentSignalReport {
  const signals: Signal[] = [];
  const { current, previous, delta, counts, data, window } = metrics;

  const recentFrom = startOfDay(addDays(window.to, -13));
  const recentSubs = data.submissions.filter((s) => s.dueDate >= recentFrom && s.dueDate <= window.to);
  const recentMissing = recentSubs.filter((s) => ["MISSING", "NOT_DONE", "PENDING"].includes(s.status));

  // --- Homework ------------------------------------------------------------
  if (recentMissing.length >= 2) {
    signals.push({
      code: SIGNAL_CODES.MISSING_ASSIGNMENTS,
      level: recentMissing.length >= 4 ? ALERT_LEVELS.ACTION_SUGGESTED : ALERT_LEVELS.WATCH,
      polarity: "CONCERN",
      indicator: "homework",
      title: `${recentMissing.length} assignments not handed in`,
      reasons: [
        `${recentMissing.length} of ${recentSubs.length} assignments due in the last 14 days were not handed in`,
        ...recentMissing.slice(0, 3).map((s) => `• ${s.title}`),
      ],
      suggestion: "Check what is blocking: workload, understanding, or organisation.",
      weight: recentMissing.length >= 4 ? 3 : 2,
    });
  }

  if ((delta.homework ?? 0) <= -10 && current.homework !== null) {
    signals.push({
      code: SIGNAL_CODES.HOMEWORK_DECLINE,
      level: ALERT_LEVELS.WATCH,
      polarity: "CONCERN",
      indicator: "homework",
      title: "Homework completion is declining",
      reasons: [
        `Completion moved from ${fmt(previous.homework)}% to ${fmt(current.homework)}% (${fmt(delta.homework, 1)} pts)`,
      ],
      suggestion: "A short check-in about homework routine may help.",
      weight: 2,
    });
  }

  // --- Attendance ----------------------------------------------------------
  if (counts.attendance.total >= 5 && (delta.attendance ?? 0) <= -6 && (current.attendance ?? 100) < 95) {
    signals.push({
      code: SIGNAL_CODES.ATTENDANCE_DECLINE,
      level: (current.attendance ?? 100) < 85 ? ALERT_LEVELS.ACTION_SUGGESTED : ALERT_LEVELS.WATCH,
      polarity: "CONCERN",
      indicator: "attendance",
      title: "Attendance is trending down",
      reasons: [
        `Attendance moved from ${fmt(previous.attendance)}% to ${fmt(current.attendance)}%`,
        `${counts.attendance.absent} absence(s) recorded in this period`,
      ],
      suggestion: "Contact the family to understand the context.",
      weight: 3,
    });
  }

  if (counts.attendance.late >= 3) {
    signals.push({
      code: SIGNAL_CODES.LATENESS,
      level: counts.attendance.late >= 5 ? ALERT_LEVELS.WATCH : ALERT_LEVELS.INFO,
      polarity: "CONCERN",
      indicator: "attendance",
      title: `Late ${counts.attendance.late} times`,
      reasons: [`${counts.attendance.late} late arrivals recorded during this period`],
      suggestion: "Morning routine or transport may be worth discussing.",
      weight: 1,
    });
  }

  // --- Participation & engagement -----------------------------------------
  if ((delta.engagement ?? 0) <= -8 && current.engagement !== null) {
    const teacherCount = counts.observations.teachers;
    signals.push({
      code: SIGNAL_CODES.PARTICIPATION_DROP,
      level: ALERT_LEVELS.WATCH,
      polarity: "CONCERN",
      indicator: "engagement",
      title: "Classroom engagement is lower than usual",
      reasons: [
        `Engagement moved from ${fmt(previous.engagement)} to ${fmt(current.engagement)}`,
        teacherCount > 1
          ? `${teacherCount} teachers recorded observations in this period`
          : "Based on recorded teacher observations",
      ],
      suggestion: "Ask what has changed — seating, subject difficulty, group dynamics.",
      weight: 2,
    });
  }

  if (counts.observations.attention >= 2 && counts.observations.teachers >= 2) {
    signals.push({
      code: SIGNAL_CODES.MULTIPLE_OBSERVATIONS,
      level: ALERT_LEVELS.WATCH,
      polarity: "CONCERN",
      title: "Several teachers flagged the same period",
      reasons: [
        `${counts.observations.attention} observations requesting attention from ${counts.observations.teachers} different teachers`,
      ],
      suggestion: "Worth a shared 5-minute conversation between the teachers involved.",
      weight: 2,
    });
  }

  // --- Self reported -------------------------------------------------------
  const half = Math.ceil(data.checkIns.length / 2);
  const firstHalf = data.checkIns.slice(0, half);
  const secondHalf = data.checkIns.slice(half);
  const motivationBefore = avg(firstHalf.map((c) => c.motivation));
  const motivationAfter = avg(secondHalf.map((c) => c.motivation));

  if (motivationBefore !== null && motivationAfter !== null && motivationAfter - motivationBefore <= -0.7) {
    signals.push({
      code: SIGNAL_CODES.MOTIVATION_DROP,
      level: motivationAfter <= 2.5 ? ALERT_LEVELS.ACTION_SUGGESTED : ALERT_LEVELS.WATCH,
      polarity: "CONCERN",
      indicator: "motivation",
      title: "Self-reported motivation has declined",
      reasons: [
        `Motivation moved from ${fmt(motivationBefore, 1)} to ${fmt(motivationAfter, 1)} (self-reported, scale 1–5)`,
        `Based on ${data.checkIns.length} check-ins`,
      ],
      suggestion: "A supportive one-to-one can help identify what would re-engage them.",
      weight: 3,
    });
  }

  const moodBefore = avg(firstHalf.map((c) => c.mood));
  const moodAfter = avg(secondHalf.map((c) => c.mood));
  if (moodBefore !== null && moodAfter !== null && moodAfter - moodBefore <= -0.8) {
    signals.push({
      code: SIGNAL_CODES.MOOD_DECLINE,
      level: ALERT_LEVELS.WATCH,
      polarity: "CONCERN",
      indicator: "wellbeing",
      title: "Reported mood is lower than earlier in the period",
      reasons: [
        `Mood moved from ${fmt(moodBefore, 1)} to ${fmt(moodAfter, 1)} on the 1–5 self-report scale`,
        "This is a self-reported trend, not an assessment of health",
      ],
      suggestion: "Listen first. Escalate to the school's wellbeing lead if it persists.",
      weight: 2,
    });
  }

  if (counts.checkIns.helpRequests >= 2) {
    signals.push({
      code: SIGNAL_CODES.REPEATED_HELP_REQUESTS,
      level: ALERT_LEVELS.ACTION_SUGGESTED,
      polarity: "CONCERN",
      title: `${counts.checkIns.helpRequests} requests for help`,
      reasons: [
        `The student asked for help ${counts.checkIns.helpRequests} times during this period`,
        ...[...new Set(data.checkIns.filter((c) => c.needsHelp && c.helpTopic).map((c) => `• ${c.helpTopic}`))].slice(0, 3),
      ],
      suggestion: "Respond directly — a student who asks is easy to help.",
      weight: 3,
    });
  }

  if (counts.checkIns.expected >= 10 && counts.checkIns.received / counts.checkIns.expected < 0.4) {
    signals.push({
      code: SIGNAL_CODES.NO_CHECKINS,
      level: ALERT_LEVELS.INFO,
      polarity: "NEUTRAL",
      title: "Few daily check-ins received",
      reasons: [`${counts.checkIns.received} check-ins out of ${counts.checkIns.expected} school days`],
      suggestion: "Wellbeing indicators will stay incomplete until check-ins resume.",
      weight: 1,
    });
  }

  // --- Academic ------------------------------------------------------------
  if ((delta.academic ?? 0) <= -8 && current.academic !== null && counts.assessments >= 2) {
    signals.push({
      code: SIGNAL_CODES.ACADEMIC_DROP,
      level: ALERT_LEVELS.WATCH,
      polarity: "CONCERN",
      indicator: "academic",
      title: "Recent results are below the usual level",
      reasons: [
        `Average moved from ${fmt(previous.academic)}% to ${fmt(current.academic)}%`,
        `${counts.assessments} assessments in this period`,
      ],
      suggestion: "Identify the specific topics rather than the overall average.",
      weight: 2,
    });
  }

  // --- Positive signals ---------------------------------------------------
  if ((delta.overall ?? 0) >= 5) {
    signals.push({
      code: SIGNAL_CODES.POSITIVE_MOMENTUM,
      level: ALERT_LEVELS.INFO,
      polarity: "POSITIVE",
      indicator: "overall",
      title: "Clear positive momentum",
      reasons: [
        `Overall picture improved by ${fmt(delta.overall, 1)} points versus the previous period`,
        ...(["homework", "engagement", "attendance", "academic", "motivation"] as IndicatorKey[])
          .filter((k) => (delta[k] ?? 0) >= 5)
          .map((k) => `• ${k} +${fmt(delta[k], 1)}`),
      ],
      suggestion: "Name it out loud — recognition sustains momentum.",
      weight: 0,
    });
  }

  if ((delta.homework ?? 0) >= 12) {
    signals.push({
      code: "HOMEWORK_IMPROVED",
      level: ALERT_LEVELS.INFO,
      polarity: "POSITIVE",
      indicator: "homework",
      title: "Homework completion clearly improved",
      reasons: [`From ${fmt(previous.homework)}% to ${fmt(current.homework)}%`],
      weight: 0,
    });
  }

  if (current.attendance === 100 && counts.attendance.total >= 10) {
    signals.push({
      code: "ATTENDANCE_EXCELLENT",
      level: ALERT_LEVELS.INFO,
      polarity: "POSITIVE",
      indicator: "attendance",
      title: "Perfect attendance",
      reasons: [`${counts.attendance.total} sessions, no absence and no lateness`],
      weight: 0,
    });
  }

  if (counts.observations.positive >= 3 && counts.observations.attention === 0) {
    signals.push({
      code: "POSITIVE_OBSERVATIONS",
      level: ALERT_LEVELS.INFO,
      polarity: "POSITIVE",
      indicator: "engagement",
      title: `${counts.observations.positive} positive observations`,
      reasons: [`Recorded by ${counts.observations.teachers} teacher(s) during this period`],
      weight: 0,
    });
  }

  // --- Combination --------------------------------------------------------
  const concerns = signals.filter((s) => s.polarity === "CONCERN").sort((a, b) => b.weight - a.weight);
  const positives = signals.filter((s) => s.polarity === "POSITIVE");

  let combined: Signal | null = null;
  const weightSum = concerns.reduce((a, s) => a + s.weight, 0);
  if (concerns.length >= 2 && weightSum >= 4) {
    combined = {
      code: SIGNAL_CODES.COMBINED,
      level: ALERT_LEVELS.ACTION_SUGGESTED,
      polarity: "CONCERN",
      title: "Attention suggested",
      reasons: concerns.flatMap((s) => s.reasons.filter((r) => !r.startsWith("•")).slice(0, 1)),
      suggestion: "Several weak signals appear together — a short conversation this week is recommended.",
      weight: weightSum,
    };
  }

  const level = combined
    ? combined.level
    : concerns.some((s) => s.level === ALERT_LEVELS.ACTION_SUGGESTED)
      ? ALERT_LEVELS.ACTION_SUGGESTED
      : concerns.some((s) => s.level === ALERT_LEVELS.WATCH)
        ? ALERT_LEVELS.WATCH
        : concerns.length
          ? ALERT_LEVELS.INFO
          : null;

  const headline = combined
    ? "Attention suggested"
    : concerns.length
      ? concerns[0].title
      : positives.length
        ? positives[0].title
        : "Everything looks steady";

  return {
    studentId: metrics.studentId,
    level,
    concerns,
    positives,
    all: signals,
    combined,
    headline,
  };
}

// ---------------------------------------------------------------------------
// Grouping helpers for class / school views
// ---------------------------------------------------------------------------

export type StudentStatusGroup = "ATTENTION" | "WATCH" | "STABLE" | "POSITIVE";

export function groupFor(metrics: StudentMetrics, report: StudentSignalReport): StudentStatusGroup {
  if (report.level === ALERT_LEVELS.ACTION_SUGGESTED) return "ATTENTION";
  if (report.level === ALERT_LEVELS.WATCH) return "WATCH";
  if (metrics.trend.overall === TREND.UP || report.positives.length >= 2) return "POSITIVE";
  return "STABLE";
}

export const GROUP_META: Record<
  StudentStatusGroup,
  { label: string; description: string; tone: "attention" | "watch" | "neutral" | "excellent" }
> = {
  ATTENTION: {
    label: "Attention suggested",
    description: "Several signals appeared together — worth a conversation",
    tone: "attention",
  },
  WATCH: { label: "Keep an eye", description: "One signal to monitor over the coming days", tone: "watch" },
  STABLE: { label: "Stable", description: "No significant change this period", tone: "neutral" },
  POSITIVE: { label: "Positive evolution", description: "Clear progress worth acknowledging", tone: "excellent" },
};

/** Text summary of a class, generated from aggregated deltas. */
export function classNarrative(input: {
  className: string;
  weekLabel: string;
  deltas: Partial<Record<IndicatorKey, number | null>>;
  groups: Record<StudentStatusGroup, number>;
  checkInRate: number | null;
}) {
  const highlights: string[] = [];
  const push = (key: IndicatorKey, label: string, unit = "%") => {
    const d = input.deltas[key];
    if (d === null || d === undefined || Math.abs(d) < 2) return;
    highlights.push(`${label} ${d > 0 ? "+" : ""}${round(d, 1)}${unit}`);
  };
  push("homework", "Homework completion");
  push("attendance", "Attendance");
  push("engagement", "Engagement");
  push("academic", "Academic average");
  push("motivation", "Motivation");

  if (!highlights.length) highlights.push("All indicators stable compared with the previous period");

  return {
    highlights,
    summary: `${input.className} — ${input.weekLabel}. ${input.groups.POSITIVE} student(s) progressing, ${input.groups.STABLE} stable, ${input.groups.WATCH + input.groups.ATTENTION} to keep an eye on.${
      input.checkInRate !== null ? ` Check-in participation ${round(input.checkInRate, 0)}%.` : ""
    }`,
  };
}
