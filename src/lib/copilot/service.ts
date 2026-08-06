/**
 * STUDENT360 — Grounded Copilot service.
 *
 * Deterministic, evidence-backed answers computed from the live database
 * within the caller's RBAC scope. There is no free-text LLM here: every
 * suggested prompt resolves to real aggregates and student references, and
 * the UI always displays the data sources that back each answer.
 *
 *   • SUPER_ADMIN → platform-wide aggregates
 *   • ADMIN / PRINCIPAL → their whole school
 *   • TEACHER / NURSE → students they may see
 */

import { prisma } from "@/lib/db";
import { resolveStudentScope, type StudentScope } from "@/lib/auth/rbac";
import type { SessionPayload } from "@/lib/auth/session";
import { EVENT_TYPE_LABELS, ALERT_LEVEL_ORDER } from "@/lib/domain/enums";
import { fullName } from "@/lib/utils";

const WEEK_MS = 7 * 86_400_000;

export type CopilotAnswer = {
  /** Canonical English prompt — also the suggested-prompt label (i18n key). */
  prompt: string;
  /** Template key containing {placeholders}; translated via t() then substituted. */
  text: string;
  /** Values substituted into `text` after translation ({n}, {top}…). */
  data: Record<string, string | number>;
  /** Data-source badges (i18n keys). */
  evidence: string[];
  /** Clickable student references surfaced by the answer. */
  students: { id: string; name: string }[];
};

export type CopilotData = {
  /** Display label for the scope the answers cover. */
  scopeLabel: string;
  /** True when the scope is the whole platform (SUPER_ADMIN). */
  platform: boolean;
  answers: CopilotAnswer[];
};

// ---------------------------------------------------------------------------
// Scope helpers — return a Prisma where fragment for models exposing
// `studentId`+`schoolId` (alerts, submissions, snapshots, attendance).
// ---------------------------------------------------------------------------

type ScopeFragment = { schoolId?: string; studentId?: { in: string[] }; id?: { in: string[] } | string };

function studentModelWhere(scope: StudentScope): ScopeFragment {
  switch (scope.kind) {
    case "PLATFORM":
      return {};
    case "ALL_SCHOOL":
      return { schoolId: scope.schoolId };
    case "STUDENT_IDS":
      return { studentId: { in: scope.studentIds } };
    default:
      return { studentId: { in: [] } };
  }
}

/** Scope fragment for the Student entity itself (which has `id`, not `studentId`). */
function studentEntityWhere(scope: StudentScope): ScopeFragment {
  switch (scope.kind) {
    case "PLATFORM":
      return {};
    case "ALL_SCHOOL":
      return { schoolId: scope.schoolId };
    case "STUDENT_IDS":
      return { id: { in: scope.studentIds } };
    default:
      return { id: "__none__" };
  }
}

function studentRef(scope: StudentScope): ScopeFragment {
  return scope.kind === "STUDENT_IDS" ? { studentId: { in: scope.studentIds } } : {};
}

function toRefs(rows: { studentId: string; student: { id: string; user: { firstName: string; lastName: string } } }[], limit = 3) {
  const seen = new Set<string>();
  const refs: CopilotAnswer["students"] = [];
  for (const row of rows) {
    if (seen.has(row.studentId)) continue;
    seen.add(row.studentId);
    refs.push({ id: row.student.id, name: fullName(row.student.user) });
    if (refs.length >= limit) break;
  }
  return { refs, count: seen.size };
}

// ---------------------------------------------------------------------------
// Individual answers
// ---------------------------------------------------------------------------

async function answerCheckIns(scope: StudentScope): Promise<CopilotAnswer> {
  const rows = await prisma.alert.findMany({
    where: { status: "OPEN", ...studentModelWhere(scope) },
    orderBy: { detectedAt: "desc" },
    take: 200,
    select: {
      id: true,
      studentId: true,
      level: true,
      title: true,
      student: { select: { id: true, user: { select: { firstName: true, lastName: true } } } },
    },
  });
  const ranked = rows
    .slice()
    .sort((a, b) => (ALERT_LEVEL_ORDER[b.level] ?? 0) - (ALERT_LEVEL_ORDER[a.level] ?? 0));
  const { refs } = toRefs(ranked, 3);
  return {
    prompt: "Who should I check in with today?",
    text:
      ranked.length > 0
        ? "{n} students have open signals that may deserve a short check-in. Review the evidence on their profiles before acting."
        : "No open alerts today. Nothing requires immediate attention.",
    data: { n: ranked.length },
    evidence: ["Open alerts", "Alert history"],
    students: refs,
  };
}

async function answerWeekSummary(scope: StudentScope): Promise<CopilotAnswer> {
  const weekAgo = new Date(Date.now() - WEEK_MS);
  const schoolWhere = scope.kind === "PLATFORM" ? {} : scope.kind === "ALL_SCHOOL" ? { schoolId: scope.schoolId } : studentRef(scope);
  const [eventCount, topEvent, loginCount, newStudents] = await Promise.all([
    prisma.activityEvent.count({ where: { occurredAt: { gte: weekAgo }, ...schoolWhere } }),
    prisma.activityEvent.groupBy({
      by: ["type"],
      where: { occurredAt: { gte: weekAgo }, ...schoolWhere },
      _count: { _all: true },
      orderBy: { _count: { type: "desc" } },
      take: 1,
    }),
    prisma.auditLog.count({ where: { action: "LOGIN", createdAt: { gte: weekAgo }, ...schoolWhere } }),
    prisma.student.count({ where: { enrolledAt: { gte: weekAgo }, ...studentEntityWhere(scope) } }),
  ]);
  const topType = topEvent[0]?.type;
  return {
    prompt: "Summarize this week",
    text:
      eventCount > 0
        ? "This week recorded {events} activity events, {logins} sign-ins and {students} new students. The most frequent event type was {top}."
        : "This week recorded {logins} sign-ins and {students} new students, and no activity events yet.",
    data: {
      events: eventCount,
      logins: loginCount,
      students: newStudents,
      top: topType ? (EVENT_TYPE_LABELS[topType] ?? topType) : "",
    },
    evidence: ["Activity events", "New enrollments"],
    students: [],
  };
}

async function answerImproved(scope: StudentScope): Promise<CopilotAnswer> {
  const rows = await prisma.studentIndicatorSnapshot.findMany({
    where: { granularity: "WEEK", overallTrend: "UP", ...studentModelWhere(scope) },
    orderBy: { periodStart: "desc" },
    take: 300,
    select: {
      studentId: true,
      student: { select: { id: true, user: { select: { firstName: true, lastName: true } } } },
    },
  });
  const { refs, count } = toRefs(rows, 3);
  return {
    prompt: "Show students who improved",
    text:
      count > 0
        ? "{n} students show upward progress in the latest weekly snapshot."
        : "No students show a clear upward trend in the latest weekly snapshot.",
    data: { n: count },
    evidence: ["Weekly indicators", "Competency snapshots"],
    students: refs,
  };
}

async function answerHomeworkSupport(scope: StudentScope): Promise<CopilotAnswer> {
  const rows = await prisma.homeworkSubmission.findMany({
    where: { status: { in: ["NEED_HELP", "MISSING"] }, ...studentModelWhere(scope) },
    orderBy: { updatedAt: "desc" },
    take: 300,
    select: {
      studentId: true,
      student: { select: { id: true, user: { select: { firstName: true, lastName: true } } } },
    },
  });
  const { refs, count } = toRefs(rows, 3);
  return {
    prompt: "Students needing homework support",
    text:
      count > 0
        ? "{n} students currently need homework support or are missing submissions."
        : "No students currently need homework support.",
    data: { n: count },
    evidence: ["Homework submissions"],
    students: refs,
  };
}

async function answerAttendance(scope: StudentScope): Promise<CopilotAnswer> {
  const weekAgo = new Date(Date.now() - WEEK_MS);
  const byStatus = await prisma.attendanceRecord.groupBy({
    by: ["status"],
    where: { date: { gte: weekAgo }, ...studentModelWhere(scope) },
    _count: { _all: true },
  });
  const counts = Object.fromEntries(byStatus.map((row) => [row.status, row._count._all]));
  return {
    prompt: "How is attendance this week?",
    text: "This week attendance across visible students shows {present} present, {late} late and {absent} absent.",
    data: {
      present: counts.PRESENT ?? 0,
      late: counts.LATE ?? 0,
      absent: (counts.ABSENT ?? 0) + (counts.EXCUSED ?? 0),
    },
    evidence: ["Attendance records"],
    students: [],
  };
}

// ---------------------------------------------------------------------------
// Main entry
// ---------------------------------------------------------------------------

export async function getCopilotData(session: SessionPayload): Promise<CopilotData> {
  const scope = await resolveStudentScope(session);
  const platform = scope.kind === "PLATFORM";

  const scopeLabel = scope.kind === "ALL_SCHOOL" ? (await prisma.school.findUnique({ where: { id: scope.schoolId }, select: { name: true } }))?.name ?? "Your school" : platform ? "Entire platform" : "Your visible students";

  const answers = await Promise.all([
    answerCheckIns(scope),
    answerWeekSummary(scope),
    answerImproved(scope),
    answerHomeworkSupport(scope),
    answerAttendance(scope),
  ]);

  return { scopeLabel, platform, answers };
}
