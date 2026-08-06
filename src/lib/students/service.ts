/**
 * STUDENT360 — Directory & Student 360 profile service.
 *
 * All read paths are scoped through RBAC (`canAccessStudent`, `accessibleClassIds`,
 * `resolveStudentScope`). Indicator values come from the weekly
 * `StudentIndicatorSnapshot` rows produced by the seed; detail sections are
 * aggregated live from the transactional tables (attendance, homework, grades,
 * check-ins, observations, goals, interventions, achievements, …).
 */

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  accessibleClassIds,
  canAccessClass,
  canAccessStudent,
  can,
  hasRole,
  isStaff,
  resolveStudentScope,
} from "@/lib/auth/rbac";
import type { SessionPayload } from "@/lib/auth/session";
import { ROLES, type RoleCode } from "@/lib/domain/enums";
import { initials } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Public types (serializable — no Date instances)
// ---------------------------------------------------------------------------

export type StudentSignal = "POSITIVE" | "STABLE" | "WATCH" | "ATTENTION";

export type StudentRosterEntry = {
  id: string;
  name: string;
  initials: string;
  classId: string | null;
  className: string;
  studentNumber: string;
  academic: number;
  homework: number;
  attendance: number;
  engagement: number;
  motivation: number;
  wellbeing: number;
  trend: "UP" | "DOWN" | "STABLE";
  signal: StudentSignal;
};

export type ClassCard = {
  id: string;
  name: string;
  gradeLevel: string;
  room: string | null;
  teacherName: string;
  studentCount: number;
  attendance: number;
  homework: number;
  engagement: number;
  trend: number;
};

export type ClassStudent = {
  id: string;
  name: string;
  initials: string;
  academic: number;
  homework: number;
  attendance: number;
  engagement: number;
  signal: StudentSignal;
};

export type ClassDetail = {
  id: string;
  name: string;
  gradeLevel: string;
  room: string | null;
  teacherName: string;
  studentCount: number;
  attendance: number;
  homework: number;
  engagement: number;
  subjects: { id: string; name: string; code: string }[];
  roster: ClassStudent[];
};

export type TeacherEntry = {
  id: string;
  name: string;
  initials: string;
  title: string;
  email: string;
  isHomeroom: boolean;
  specialties: string[];
  classCount: number;
  classNames: string[];
};

export type ChildCard = {
  id: string;
  name: string;
  initials: string;
  className: string;
  classId: string | null;
  academic: number;
  homework: number;
  attendance: number;
  engagement: number;
  trend: "UP" | "DOWN" | "STABLE";
  signal: StudentSignal;
  presentToday: boolean;
};

export type GuardianInfo = {
  name: string;
  email: string;
  phone: string | null;
  occupation: string | null;
  relationship: string;
  isPrimary: boolean;
};

export type DailyRatingInfo = {
  id: string;
  date: string;
  note: string | null;
  criteria: { code: string; value: number }[];
};

export type StudentProfile = {
  id: string;
  name: string;
  initials: string;
  studentNumber: string;
  className: string;
  classId: string | null;
  gradeLevel: string;
  dateOfBirth: string | null;
  gender: string | null;
  status: string;
  advisorName: string | null;
  headline: string;
  trend: "UP" | "DOWN" | "STABLE";
  overall: number;
  indicators: {
    academic: number;
    engagement: number;
    homework: number;
    attendance: number;
    motivation: number;
    wellbeing: number;
  };
  recentForm: { week: string; tone: "positive" | "neutral" | "attention" }[];
  identity: {
    nationality: string | null;
    birthplace: string | null;
    address: string | null;
    regime: string | null;
    transportMode: string | null;
    busLine: string | null;
    homeLanguage: string | null;
    languagesSpoken: string[];
    previousSchool: string | null;
    transferReason: string | null;
    aeshName: string | null;
    aeshSchedule: string | null;
    emergencyContact: string | null;
  };
  family: {
    guardians: GuardianInfo[];
    pickupPeople: { name: string; relationship: string; phone: string | null; idNumber: string | null; notes: string | null }[];
    emergencyContact: string | null;
  };
  medical: {
    bloodType: string | null;
    allergies: string[];
    chronicDiseases: string[];
    medications: string[];
    sportsRestrictions: string[];
    treatingPhysician: string | null;
    physicianPhone: string | null;
    emergencyProtocol: string | null;
    protocolVisibleToTeachers: boolean;
  } | null;
  academics: { subjectId: string; subject: string; score: number; graded: number }[];
  homework: { id: string; title: string; subject: string; dueDate: string; status: string }[];
  attendance: { present: number; late: number; excused: number; absent: number; percent: number };
  wellbeing: {
    moodAvg: number;
    energyAvg: number;
    motivationAvg: number;
    stressAvg: number;
    recent: { date: string; mood: number; motivation: number }[];
  };
  competencies: { id: string; name: string; level: number; score: number; trend: string }[];
  goals: { id: string; title: string; category: string; targetDate: string; progress: number; status: string }[];
  interventions: { id: string; title: string; action: string; responsible: string; frequency: string; status: string; outcome: string | null }[];
  achievements: { id: string; title: string; level: string; awardedAt: string }[];
  feedback: { id: string; note: string; category: string; sentiment: string; teacherName: string; occurredAt: string }[];
  parentInputs: { id: string; type: string; content: string; occurredAt: string }[];
  timeline: { id: string; type: string; title: string; description: string | null; sentiment: string; occurredAt: string }[];
  documents: { id: string; name: string; type: string; createdAt: string }[];
  discipline: { id: string; type: string; severity: string; title: string; description: string | null; status: string; decidedAt: string }[];
  plans: { id: string; type: string; title: string; description: string | null; accommodations: string[]; assignedTo: string | null; startDate: string; endDate: string | null; status: string }[];
  meetings: { id: string; title: string; date: string; participants: string | null; agenda: string | null; minutes: string | null; decisions: string | null; followUp: string | null; status: string }[];
  dailyRatings: DailyRatingInfo[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fullName(user: { firstName: string; lastName: string }) {
  return `${user.firstName} ${user.lastName}`;
}

function pct(value: number | null | undefined) {
  return Math.round(value ?? 0);
}

function weekLabel(date: Date) {
  const iso = date.toISOString().slice(0, 10);
  const start = new Date(iso);
  const mondayOffset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - mondayOffset);
  const weekNumber = Math.ceil(((start.getTime() - new Date(start.getFullYear(), 0, 1).getTime()) / 86_400_000 + 1) / 7);
  return `W${weekNumber}`;
}

function signalFor(snap: { academic: number; attendance: number; homework: number; motivation: number; engagement: number; wellbeing: number }): StudentSignal {
  if (snap.attendance < 88 || snap.academic < 55 || snap.homework < 50 || snap.motivation < 45 || snap.wellbeing < 40) return "ATTENTION";
  if (snap.attendance < 93 || snap.academic < 65 || snap.homework < 65 || snap.motivation < 55) return "WATCH";
  if ((snap.academic + snap.homework + snap.engagement) / 3 >= 80) return "POSITIVE";
  return "STABLE";
}

function trendValue(value: string | null | undefined): "UP" | "DOWN" | "STABLE" {
  return value === "UP" || value === "DOWN" ? value : "STABLE";
}

function snapNumbers(snap: {
  academic: number | null;
  attendance: number | null;
  homework: number | null;
  motivation: number | null;
  engagement: number | null;
  wellbeing: number | null;
}) {
  return {
    academic: pct(snap.academic),
    attendance: pct(snap.attendance),
    homework: pct(snap.homework),
    motivation: pct(snap.motivation),
    engagement: pct(snap.engagement),
    wellbeing: pct(snap.wellbeing),
  };
}

function toneFor(value: number) {
  if (value >= 80) return "positive" as const;
  if (value >= 60) return "neutral" as const;
  return "attention" as const;
}

function splitList(value: string | null | undefined) {
  return (value ?? "").split(",").map((s) => s.trim()).filter(Boolean);
}

const DAILY_RATING_KEYS = [
  "punctuality",
  "participation",
  "classwork",
  "homework",
  "behavior",
  "rules",
  "concentration",
  "motivation",
  "groupWork",
  "autonomy",
  "organisation",
] as const;

// ---------------------------------------------------------------------------
// Snapshot helpers
// ---------------------------------------------------------------------------

async function latestSnapshotRows(studentIds: string[]) {
  if (!studentIds.length) return new Map<string, Prisma.StudentIndicatorSnapshotGetPayload<{}>>();
  const latest = await prisma.studentIndicatorSnapshot.findFirst({
    where: { studentId: { in: studentIds }, granularity: "WEEK" },
    orderBy: { periodStart: "desc" },
    select: { periodStart: true },
  });
  if (!latest) return new Map<string, Prisma.StudentIndicatorSnapshotGetPayload<{}>>();
  const rows = await prisma.studentIndicatorSnapshot.findMany({
    where: { studentId: { in: studentIds }, granularity: "WEEK", periodStart: latest.periodStart },
  });
  return new Map(rows.map((row) => [row.studentId, row]));
}

function snapOf(snaps: Map<string, Prisma.StudentIndicatorSnapshotGetPayload<{}>>, studentId: string) {
  return snaps.get(studentId);
}

async function recentSnapshots(studentId: string, take = 8) {
  return prisma.studentIndicatorSnapshot.findMany({
    where: { studentId, granularity: "WEEK" },
    orderBy: { periodStart: "desc" },
    take,
  });
}

async function studentScopeIds(session: SessionPayload) {
  const scope = await resolveStudentScope(session);
  if (scope.kind === "PLATFORM") return { mode: "all" as const, schoolId: null as string | null };
  if (scope.kind === "ALL_SCHOOL") return { mode: "school" as const, schoolId: scope.schoolId };
  if (scope.kind === "STUDENT_IDS") return { mode: "ids" as const, ids: scope.studentIds };
  return { mode: "none" as const, ids: [] as string[] };
}

// ---------------------------------------------------------------------------
// Students roster
// ---------------------------------------------------------------------------

export async function listStudents(
  session: SessionPayload,
  opts: { q?: string; signal?: string } = {},
): Promise<StudentRosterEntry[]> {
  const scope = await studentScopeIds(session);
  const where: Prisma.StudentWhereInput = {};
  if (scope.mode === "school") where.schoolId = scope.schoolId;
  else if (scope.mode === "ids") where.id = { in: scope.ids };
  else if (scope.mode === "none") return [];
  where.status = "ACTIVE";

  const students = await prisma.student.findMany({
    where,
    select: {
      id: true,
      studentNumber: true,
      currentClassId: true,
      user: { select: { id: true, firstName: true, lastName: true } },
      currentClass: { select: { name: true } },
    },
    orderBy: [{ user: { lastName: "asc" } }, { user: { firstName: "asc" } }],
  });
  const snaps = await latestSnapshotRows(students.map((s) => s.id));

  const entries: StudentRosterEntry[] = students.map((student) => {
    const snap = snapOf(snaps, student.id);
    const values = snap ? snapNumbers(snap) : null;
    const academic = values?.academic ?? 70;
    const homework = values?.homework ?? 75;
    const attendance = values?.attendance ?? 92;
    const engagement = values?.engagement ?? 70;
    const motivation = values?.motivation ?? 70;
    const wellbeing = values?.wellbeing ?? 70;
    const signal = values ? signalFor(values) : "STABLE";
    return {
      id: student.id,
      name: fullName(student.user),
      initials: initials(student.user.firstName, student.user.lastName),
      classId: student.currentClassId,
      className: student.currentClass?.name ?? "—",
      studentNumber: student.studentNumber,
      academic,
      homework,
      attendance,
      engagement,
      motivation,
      wellbeing,
      trend: trendValue(snap?.overallTrend),
      signal,
    };
  });

  const q = opts.q?.trim().toLowerCase();
  if (q) {
    return entries.filter((e) => `${e.name} ${e.className} ${e.studentNumber}`.toLowerCase().includes(q));
  }
  if (opts.signal && opts.signal !== "ALL") {
    return entries.filter((e) => e.signal === opts.signal);
  }
  return entries;
}

// ---------------------------------------------------------------------------
// Student 360 profile
// ---------------------------------------------------------------------------

export async function getStudentProfile(session: SessionPayload, studentId: string): Promise<StudentProfile> {
  const accessible = await canAccessStudent(session, studentId);
  if (!accessible) throw new Error("STUDENT_ACCESS_DENIED");

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, phone: true } },
      currentClass: { select: { id: true, name: true, gradeLevel: true } },
      advisor: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
  });
  if (!student) throw new Error("STUDENT_NOT_FOUND");

  const viewerIsStaff = isStaff(session);
  const viewerCanReadMedical = can(session, "medical:read");

  // Parent visibility for the target student
  let parentPermissions: { canViewAcademics: boolean; canViewAttendance: boolean; canViewWellbeing: boolean; canViewObservations: boolean } | null = null;
  if (hasRole(session, ROLES.PARENT) && session.guardianId) {
    const rel = await prisma.parentStudentRelationship.findFirst({
      where: { guardianId: session.guardianId, studentId },
      select: { canViewAcademics: true, canViewAttendance: true, canViewWellbeing: true, canViewObservations: true },
    });
    if (rel) parentPermissions = rel;
  }

  const [snapshots, family, medical, academics, homework, attendance, checkIns, competencies, goals, interventions, achievements, observations, parentInputs, events, documents, discipline, plans, meetings, ratings] = await Promise.all([
    recentSnapshots(studentId, 8),
    prisma.parentStudentRelationship.findMany({
      where: { studentId },
      select: {
        isPrimary: true,
        relationship: true,
        canViewAcademics: true,
        canViewAttendance: true,
        canViewWellbeing: true,
        canViewObservations: true,
        guardian: {
          select: {
            occupation: true,
            user: { select: { firstName: true, lastName: true, email: true, phone: true } },
          },
        },
      },
    }),
    viewerCanReadMedical
      ? prisma.medicalRecord.findUnique({ where: { studentId } })
      : Promise.resolve(null),
    viewerIsStaff || parentPermissions?.canViewAcademics
      ? prisma.grade.findMany({
          where: { studentId },
          select: {
            percentage: true,
            assessment: { select: { subjectId: true, subject: { select: { name: true, code: true } } } },
          },
        })
      : Promise.resolve([]),
    parentPermissions?.canViewAcademics || viewerIsStaff
      ? prisma.homeworkSubmission.findMany({
          where: { studentId },
          orderBy: { createdAt: "desc" },
          take: 8,
          select: {
            status: true,
            homework: { select: { title: true, dueDate: true, subject: { select: { name: true } } } },
          },
        })
      : Promise.resolve([]),
    parentPermissions?.canViewAttendance || viewerIsStaff
      ? prisma.attendanceRecord.findMany({
          where: { studentId, date: { gte: new Date(Date.now() - 30 * 86_400_000) } },
          select: { status: true },
        })
      : Promise.resolve([]),
    parentPermissions?.canViewWellbeing || viewerIsStaff
      ? prisma.dailyCheckIn.findMany({
          where: { studentId },
          orderBy: { date: "desc" },
          take: 10,
          select: { date: true, mood: true, energy: true, motivation: true, stress: true },
        })
      : Promise.resolve([]),
    prisma.studentCompetency.findMany({
      where: { studentId },
      take: 12,
      select: {
        level: true,
        score: true,
        trend: true,
        competency: { select: { name: true } },
      },
    }),
    prisma.studentGoal.findMany({
      where: { studentId, status: { in: ["ACTIVE", "ACHIEVED"] } },
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: { id: true, title: true, category: true, targetDate: true, progress: true, status: true },
    }),
    prisma.intervention.findMany({
      where: { studentId, status: { not: "CANCELLED" } },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, title: true, action: true, responsible: true, frequency: true, status: true, outcome: true },
    }),
    prisma.achievement.findMany({
      where: { studentId },
      orderBy: { awardedAt: "desc" },
      take: 12,
      select: { id: true, title: true, level: true, awardedAt: true },
    }),
    parentPermissions?.canViewObservations || viewerIsStaff
      ? prisma.teacherObservation.findMany({
          where: { studentId, note: { not: null } },
          orderBy: { occurredAt: "desc" },
          take: 10,
          select: {
            id: true,
            note: true,
            category: true,
            sentiment: true,
            occurredAt: true,
            teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
          },
        })
      : Promise.resolve([]),
    parentPermissions ? Promise.resolve([]) : prisma.parentInput.findMany({
      where: { studentId },
      orderBy: { occurredAt: "desc" },
      take: 10,
      select: { id: true, type: true, content: true, occurredAt: true },
    }),
    viewerIsStaff
      ? prisma.activityEvent.findMany({
          where: { studentId },
          orderBy: { occurredAt: "desc" },
          take: 15,
          select: { id: true, type: true, title: true, description: true, sentiment: true, occurredAt: true },
        })
      : Promise.resolve([]),
    viewerIsStaff
      ? prisma.document.findMany({
          where: { studentId },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { id: true, name: true, type: true, createdAt: true },
        })
      : Promise.resolve([]),
    viewerIsStaff || parentPermissions?.canViewObservations
      ? prisma.disciplineRecord.findMany({
          where: { studentId, ...(viewerIsStaff ? {} : { visibleToParents: true }) },
          orderBy: { decidedAt: "desc" },
          take: 12,
          select: { id: true, type: true, severity: true, title: true, description: true, status: true, decidedAt: true },
        })
      : Promise.resolve([]),
    viewerIsStaff
      ? prisma.learningPlan.findMany({
          where: { studentId },
          orderBy: { startDate: "desc" },
          take: 10,
          select: { id: true, type: true, title: true, description: true, accommodations: true, assignedTo: true, startDate: true, endDate: true, status: true },
        })
      : Promise.resolve([]),
    viewerIsStaff
      ? prisma.meeting.findMany({
          where: { studentId },
          orderBy: { date: "desc" },
          take: 10,
          select: { id: true, title: true, date: true, participants: true, agenda: true, minutes: true, decisions: true, followUp: true, status: true },
        })
      : Promise.resolve([]),
    viewerIsStaff || parentPermissions?.canViewWellbeing
      ? prisma.dailyRating.findMany({
          where: { studentId },
          orderBy: { date: "desc" },
          take: 12,
        })
      : Promise.resolve([]),
  ]);

  // ---- indicators from latest snapshot ----
  const latest = snapshots[0];
  const latestValues = latest ? snapNumbers(latest) : null;
  const indicators = {
    academic: latestValues?.academic ?? 70,
    engagement: latestValues?.engagement ?? 70,
    homework: latestValues?.homework ?? 75,
    attendance: latestValues?.attendance ?? 92,
    motivation: latestValues?.motivation ?? 70,
    wellbeing: latestValues?.wellbeing ?? 70,
  };
  const overall = Math.round(
    (indicators.academic + indicators.engagement + indicators.homework + indicators.attendance + indicators.motivation + indicators.wellbeing) / 6,
  );
  const trend = trendValue(latest?.overallTrend);
  const signal = latestValues ? signalFor(latestValues) : "STABLE";

  const recentForm = snapshots
    .slice()
    .reverse()
    .slice(-6)
    .map((snap) => {
      const values = snapNumbers(snap);
      return {
        week: weekLabel(snap.periodStart),
        tone: toneFor((values.attendance + values.homework + values.engagement) / 3),
      };
    });

  // ---- academics: average percentage per subject ----
  const subjectMap = new Map<string, { name: string; total: number; count: number }>();
  for (const grade of academics) {
    const subjectId = grade.assessment.subjectId;
    const current = subjectMap.get(subjectId) ?? { name: grade.assessment.subject.name, total: 0, count: 0 };
    current.total += grade.percentage ?? 0;
    current.count += 1;
    subjectMap.set(subjectId, current);
  }
  const subjectRows = [...subjectMap.entries()].map(([subjectId, row]) => ({
    subjectId,
    subject: row.name,
    score: Math.round(row.total / row.count),
    graded: row.count,
  }));

  // ---- attendance summary ----
  let attendanceSummary = { present: 0, late: 0, excused: 0, absent: 0, percent: 92 };
  if (attendance.length) {
    const counts = { present: 0, late: 0, excused: 0, absent: 0 };
    for (const record of attendance) {
      if (record.status === "PRESENT") counts.present += 1;
      else if (record.status === "LATE") counts.late += 1;
      else if (record.status === "EXCUSED") counts.excused += 1;
      else counts.absent += 1;
    }
    const total = counts.present + counts.late + counts.excused + counts.absent;
    attendanceSummary = { ...counts, percent: total ? Math.round(((counts.present + counts.late) / total) * 100) : 92 };
  }

  // ---- wellbeing ----
  const recentCheckIns = checkIns.slice(0, 6);
  const wellbeing = {
    moodAvg: checkIns.length ? Math.round(checkIns.reduce((sum, c) => sum + c.mood, 0) / checkIns.length) : 0,
    energyAvg: checkIns.length ? Math.round(checkIns.reduce((sum, c) => sum + (c.energy || 0), 0) / checkIns.length) : 0,
    motivationAvg: checkIns.length ? Math.round(checkIns.reduce((sum, c) => sum + c.motivation, 0) / checkIns.length) : 0,
    stressAvg: checkIns.length ? Math.round(checkIns.reduce((sum, c) => sum + c.stress, 0) / checkIns.length) : 0,
    recent: recentCheckIns.map((c) => ({ date: c.date.toISOString().slice(0, 10), mood: c.mood, motivation: c.motivation })),
  };

  const primary = family.find((f) => f.isPrimary) ?? family[0];

  return {
    id: student.id,
    name: fullName(student.user),
    initials: initials(student.user.firstName, student.user.lastName),
    studentNumber: student.studentNumber,
    className: student.currentClass?.name ?? "—",
    classId: student.currentClass?.id ?? null,
    gradeLevel: student.currentClass?.gradeLevel ?? "",
    dateOfBirth: student.dateOfBirth?.toISOString().slice(0, 10) ?? null,
    gender: student.gender ?? null,
    status: student.status,
    advisorName: student.advisor ? fullName(student.advisor.user) : null,
    headline: signal === "ATTENTION" ? "Action suggested" : signal === "WATCH" ? "Watch" : signal === "POSITIVE" ? "Positive progress" : "Stable",
    trend,
    overall,
    indicators,
    recentForm,
    identity: {
      nationality: student.nationality,
      birthplace: student.birthplace,
      address: student.address,
      regime: student.regime,
      transportMode: student.transportMode,
      busLine: student.busLine,
      homeLanguage: student.homeLanguage,
      languagesSpoken: splitList(student.languagesSpoken),
      previousSchool: student.previousSchool,
      transferReason: student.transferReason,
      aeshName: student.aeshName,
      aeshSchedule: student.aeshSchedule,
      emergencyContact: student.emergencyContact,
    },
    family: {
      guardians: family.map((rel) => ({
        name: fullName(rel.guardian.user),
        email: rel.guardian.user.email,
        phone: rel.guardian.user.phone,
        occupation: rel.guardian.occupation,
        relationship: rel.relationship,
        isPrimary: rel.isPrimary,
      })),
      pickupPeople: await prisma.pickupPerson.findMany({
        where: { studentId, isActive: true },
        select: { name: true, relationship: true, phone: true, idNumber: true, notes: true },
      }),
      emergencyContact: student.emergencyContact,
    },
    medical: medical
      ? {
          bloodType: medical.bloodType,
          allergies: splitList(medical.allergies),
          chronicDiseases: splitList(medical.chronicDiseases),
          medications: splitList(medical.medications),
          sportsRestrictions: splitList(medical.sportsRestrictions),
          treatingPhysician: medical.treatingPhysician,
          physicianPhone: medical.physicianPhone,
          emergencyProtocol: medical.emergencyProtocol,
          protocolVisibleToTeachers: medical.emergencyProtocolVisibleToTeachers,
        }
      : null,
    academics: subjectRows.sort((a, b) => b.score - a.score),
    homework: homework.map((s) => ({
      id: s.homework.title,
      title: s.homework.title,
      subject: s.homework.subject.name,
      dueDate: s.homework.dueDate.toISOString().slice(0, 10),
      status: s.status,
    })),
    attendance: attendanceSummary,
    wellbeing,
    competencies: competencies.map((c) => ({
      id: c.competency.name,
      name: c.competency.name,
      level: c.level,
      score: c.score,
      trend: c.trend,
    })),
    goals: goals.map((g) => ({
      id: g.id,
      title: g.title,
      category: g.category,
      targetDate: g.targetDate.toISOString().slice(0, 10),
      progress: g.progress,
      status: g.status,
    })),
    interventions: interventions.map((i) => ({
      id: i.id,
      title: i.title,
      action: i.action,
      responsible: i.responsible,
      frequency: i.frequency,
      status: i.status,
      outcome: i.outcome,
    })),
    achievements: achievements.map((a) => ({ id: a.id, title: a.title, level: a.level, awardedAt: a.awardedAt.toISOString().slice(0, 10) })),
    feedback: observations.map((o) => ({
      id: o.id,
      note: o.note ?? "",
      category: o.category,
      sentiment: o.sentiment,
      teacherName: fullName(o.teacher.user),
      occurredAt: o.occurredAt.toISOString().slice(0, 10),
    })),
    parentInputs: parentInputs.map((p) => ({ id: p.id, type: p.type, content: p.content, occurredAt: p.occurredAt.toISOString().slice(0, 10) })),
    timeline: events.map((e) => ({
      id: e.id,
      type: e.type,
      title: e.title,
      description: e.description,
      sentiment: e.sentiment,
      occurredAt: e.occurredAt.toISOString(),
    })),
    documents: documents.map((d) => ({ id: d.id, name: d.name, type: d.type, createdAt: d.createdAt.toISOString().slice(0, 10) })),
    discipline: discipline.map((d) => ({
      id: d.id,
      type: d.type,
      severity: d.severity,
      title: d.title,
      description: d.description,
      status: d.status,
      decidedAt: d.decidedAt.toISOString().slice(0, 10),
    })),
    plans: plans.map((p) => ({
      id: p.id,
      type: p.type,
      title: p.title,
      description: p.description,
      accommodations: p.accommodations ? (JSON.parse(p.accommodations) as string[]) : [],
      assignedTo: p.assignedTo,
      startDate: p.startDate.toISOString().slice(0, 10),
      endDate: p.endDate?.toISOString().slice(0, 10) ?? null,
      status: p.status,
    })),
    meetings: meetings.map((m) => ({
      id: m.id,
      title: m.title,
      date: m.date.toISOString().slice(0, 10),
      participants: m.participants,
      agenda: m.agenda,
      minutes: m.minutes,
      decisions: m.decisions,
      followUp: m.followUp,
      status: m.status,
    })),
    dailyRatings: ratings.map((r) => ({
      id: r.id,
      date: r.date.toISOString().slice(0, 10),
      note: r.note,
      criteria: DAILY_RATING_KEYS.map((key) => ({ code: key, value: r[key] ?? 0 })).filter((c) => c.value > 0),
    })),
  };
}

// ---------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------

export async function listClasses(session: SessionPayload): Promise<ClassCard[]> {
  const ids = await accessibleClassIds(session);
  const classWhere: Prisma.SchoolClassWhereInput = ids === "ALL" ? {} : { id: { in: ids } };

  const classes = await prisma.schoolClass.findMany({
    where: classWhere,
    include: {
      assignments: {
        where: { isHomeroom: true },
        include: { teacher: { include: { user: { select: { firstName: true, lastName: true } } } } },
      },
      enrollments: { where: { status: "ACTIVE" } },
    },
    orderBy: [{ gradeOrder: "asc" }, { section: "asc" }],
  });

  const students = await prisma.student.findMany({
    where: { status: "ACTIVE", ...(ids === "ALL" ? {} : { currentClassId: { in: ids } }) },
    select: { id: true, currentClassId: true },
  });
  const snaps = await latestSnapshotRows(students.map((s) => s.id));

  const byClass = new Map<string, { attendance: number[]; homework: number[]; engagement: number[]; trend: number[] }>();
  for (const student of students) {
    const snap = snapOf(snaps, student.id);
    if (!student.currentClassId || !snap) continue;
    const bucket = byClass.get(student.currentClassId) ?? { attendance: [], homework: [], engagement: [], trend: [] };
    bucket.attendance.push(pct(snap.attendance));
    bucket.homework.push(pct(snap.homework));
    bucket.engagement.push(pct(snap.engagement));
    bucket.trend.push(snap.overallTrend === "UP" ? 1 : snap.overallTrend === "DOWN" ? -1 : 0);
    byClass.set(student.currentClassId, bucket);
  }

  const avg = (values: number[]) => (values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0);

  return classes.map((schoolClass) => {
    const bucket = byClass.get(schoolClass.id);
    const trendDelta = bucket?.trend.reduce((a, b) => a + b, 0) ?? 0;
    return {
      id: schoolClass.id,
      name: schoolClass.name,
      gradeLevel: schoolClass.gradeLevel,
      room: schoolClass.room,
      teacherName: schoolClass.assignments[0]?.teacher ? fullName(schoolClass.assignments[0].teacher.user) : "",
      studentCount: schoolClass.enrollments.length,
      attendance: bucket ? avg(bucket.attendance) : 92,
      homework: bucket ? avg(bucket.homework) : 75,
      engagement: bucket ? avg(bucket.engagement) : 70,
      trend: trendDelta,
    };
  });
}

export async function getClassDetail(session: SessionPayload, classId: string): Promise<ClassDetail> {
  if (!(await canAccessClass(session, classId))) throw new Error("CLASS_ACCESS_DENIED");

  const schoolClass = await prisma.schoolClass.findUnique({
    where: { id: classId },
    include: {
      assignments: {
        include: {
          teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
          subject: { select: { id: true, name: true, code: true } },
        },
      },
    },
  });
  if (!schoolClass) throw new Error("CLASS_NOT_FOUND");

  const roster = await prisma.student.findMany({
    where: { currentClassId: classId, status: "ACTIVE" },
    select: { id: true, user: { select: { firstName: true, lastName: true } } },
    orderBy: [{ user: { lastName: "asc" } }, { user: { firstName: "asc" } }],
  });
  const snaps = await latestSnapshotRows(roster.map((s) => s.id));

  const homeroom = schoolClass.assignments.find((a) => a.isHomeroom);
  const subjectSet = new Map<string, { id: string; name: string; code: string }>();
  for (const assignment of schoolClass.assignments) {
    if (assignment.subject) subjectSet.set(assignment.subject.id, assignment.subject);
  }

  const students: ClassStudent[] = roster.map((student) => {
    const snap = snapOf(snaps, student.id);
    const values = snap ? snapNumbers(snap) : null;
    return {
      id: student.id,
      name: fullName(student.user),
      initials: initials(student.user.firstName, student.user.lastName),
      academic: values?.academic ?? 70,
      homework: values?.homework ?? 75,
      attendance: values?.attendance ?? 92,
      engagement: values?.engagement ?? 70,
      signal: values ? signalFor(values) : "STABLE",
    };
  });

  const classCards = await listClasses(session);
  const card = classCards.find((c) => c.id === classId);

  return {
    id: schoolClass.id,
    name: schoolClass.name,
    gradeLevel: schoolClass.gradeLevel,
    room: schoolClass.room,
    teacherName: homeroom ? fullName(homeroom.teacher.user) : "",
    studentCount: roster.length,
    attendance: card?.attendance ?? 92,
    homework: card?.homework ?? 75,
    engagement: card?.engagement ?? 70,
    subjects: [...subjectSet.values()],
    roster: students,
  };
}

// ---------------------------------------------------------------------------
// Teachers
// ---------------------------------------------------------------------------

export async function listTeachers(session: SessionPayload): Promise<TeacherEntry[]> {
  if (!session.schoolId) return [];
  const teachers = await prisma.teacher.findMany({
    where: { schoolId: session.schoolId, status: "ACTIVE" },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      assignments: {
        include: { class: { select: { id: true, name: true } }, subject: { select: { name: true, code: true } } },
      },
    },
    orderBy: [{ user: { lastName: "asc" } }, { user: { firstName: "asc" } }],
  });

  return teachers.map((teacher) => {
    const classes = [...new Map(teacher.assignments.map((a) => [a.classId, a.class.name])).values()];
    const specialties = [...new Set(teacher.assignments.map((a) => a.subject?.name).filter((s): s is string => Boolean(s)))];
    return {
      id: teacher.id,
      name: fullName(teacher.user),
      initials: initials(teacher.user.firstName, teacher.user.lastName),
      title: teacher.title,
      email: teacher.user.email,
      isHomeroom: teacher.isHomeroom || teacher.assignments.some((a) => a.isHomeroom),
      specialties,
      classCount: classes.length,
      classNames: classes,
    };
  });
}

// ---------------------------------------------------------------------------
// Parent children
// ---------------------------------------------------------------------------

export async function listChildren(session: SessionPayload): Promise<ChildCard[]> {
  const scope = await studentScopeIds(session);
  if (scope.mode !== "ids") return [];
  const students = await prisma.student.findMany({
    where: { id: { in: scope.ids }, status: "ACTIVE" },
    select: {
      id: true,
      currentClassId: true,
      user: { select: { firstName: true, lastName: true } },
      currentClass: { select: { name: true } },
    },
    orderBy: [{ user: { firstName: "asc" } }],
  });
  const snaps = await latestSnapshotRows(students.map((s) => s.id));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const attendanceToday = await prisma.attendanceRecord.findMany({
    where: { studentId: { in: students.map((s) => s.id) }, date: today },
    select: { studentId: true, status: true },
  });
  const presentToday = new Set(attendanceToday.filter((a) => a.status === "PRESENT").map((a) => a.studentId));

  return students.map((student) => {
    const snap = snapOf(snaps, student.id);
    const values = snap ? snapNumbers(snap) : null;
    const academic = values?.academic ?? 70;
    const homework = values?.homework ?? 75;
    const attendance = values?.attendance ?? 92;
    const engagement = values?.engagement ?? 70;
    return {
      id: student.id,
      name: fullName(student.user),
      initials: initials(student.user.firstName, student.user.lastName),
      className: student.currentClass?.name ?? "—",
      classId: student.currentClassId,
      academic,
      homework,
      attendance,
      engagement,
      trend: trendValue(snap?.overallTrend),
      signal: values ? signalFor(values) : "STABLE",
      presentToday: presentToday.has(student.id),
    };
  });
}

// ---------------------------------------------------------------------------
// School overview
// ---------------------------------------------------------------------------

export type SchoolOverview = {
  schoolName: string;
  city: string | null;
  country: string;
  students: number;
  teachers: number;
  activeClasses: number;
  attendanceToday: number;
  checkInsToday: number;
  homeworkDone7d: number;
  observations7d: number;
  openSupportPlans: number;
  grades: { gradeLevel: string; students: number; classes: ClassCard[] }[];
};

export async function getSchoolOverview(session: SessionPayload): Promise<SchoolOverview> {
  if (!session.schoolId) throw new Error("NO_SCHOOL");
  const school = await prisma.school.findUnique({
    where: { id: session.schoolId },
    select: { name: true, city: true, country: true },
  });
  if (!school) throw new Error("SCHOOL_NOT_FOUND");

  const [studentCount, teacherCount, classCount, classCards] = await Promise.all([
    prisma.student.count({ where: { schoolId: session.schoolId, status: "ACTIVE" } }),
    prisma.teacher.count({ where: { schoolId: session.schoolId, status: "ACTIVE" } }),
    prisma.schoolClass.count({ where: { schoolId: session.schoolId } }),
    listClasses(session),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(Date.now() - 7 * 86_400_000);

  const [attendanceToday, checkInsToday, submissions7d, observations7d, openPlans] = await Promise.all([
    prisma.attendanceRecord.count({ where: { schoolId: session.schoolId, date: today } }),
    prisma.dailyCheckIn.count({ where: { schoolId: session.schoolId, date: today } }),
    prisma.homeworkSubmission.count({ where: { schoolId: session.schoolId, createdAt: { gte: weekAgo } } }),
    prisma.teacherObservation.count({ where: { schoolId: session.schoolId, occurredAt: { gte: weekAgo } } }),
    prisma.learningPlan.count({ where: { schoolId: session.schoolId, status: "ACTIVE" } }),
  ]);

  const gradeOrder = ["Grade 7", "Grade 8", "Grade 9"];
  const grades = gradeOrder.map((gradeLevel) => {
    const gradeClasses = classCards.filter((c) => c.gradeLevel === gradeLevel);
    return {
      gradeLevel,
      students: gradeClasses.reduce((sum, c) => sum + c.studentCount, 0),
      classes: gradeClasses,
    };
  });

  return {
    schoolName: school.name,
    city: school.city,
    country: school.country,
    students: studentCount,
    teachers: teacherCount,
    activeClasses: classCount,
    attendanceToday,
    checkInsToday,
    homeworkDone7d: submissions7d,
    observations7d,
    openSupportPlans: openPlans,
    grades,
  };
}
