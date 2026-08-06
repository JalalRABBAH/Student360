/**
 * STUDENT360 — Workflow pages service (Today / Homework / Attendance /
 * Observations / Assessments / Weekly Review).
 *
 * Every read is scoped through RBAC: staff see their classes (or whole school
 * for leadership), students and parents only their own / children's data.
 * Indicator values come from the weekly StudentIndicatorSnapshot rows; detail
 * tables are aggregated live from the transactional records.
 */

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  accessibleClassIds,
  hasRole,
  isStaff,
  resolveStudentScope,
} from "@/lib/auth/rbac";
import type { SessionPayload } from "@/lib/auth/session";
import { ROLES, OBSERVATION_CATEGORY_LABELS } from "@/lib/domain/enums";
import { listStudents } from "@/lib/students/service";
import { addDays, avg, fullName, initials, isSameDay, pct, round, startOfDay, startOfWeek } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

type Scope = string[] | "ALL";

async function scopeStudentIds(session: SessionPayload): Promise<Scope> {
  const scope = await resolveStudentScope(session);
  if (scope.kind === "PLATFORM") return "ALL";
  if (scope.kind === "ALL_SCHOOL") {
    const rows = await prisma.student.findMany({ where: { schoolId: scope.schoolId, status: "ACTIVE" }, select: { id: true } });
    return rows.map((r) => r.id);
  }
  if (scope.kind === "STUDENT_IDS") return scope.studentIds;
  return [];
}

async function classIdsFor(session: SessionPayload): Promise<Scope> {
  return accessibleClassIds(session);
}

function studentWhereIn(scope: Scope): Prisma.StudentWhereInput {
  if (scope === "ALL") return { status: "ACTIVE" };
  if (scope.length) return { id: { in: scope }, status: "ACTIVE" };
  return { id: "__none__" };
}

// ---------------------------------------------------------------------------
// Today
// ---------------------------------------------------------------------------

export type TodaySlot = {
  id: string;
  time: string;
  subject: string;
  className: string;
  room: string | null;
  status: "Completed" | "In progress" | "Next" | "Upcoming";
};

export type TodayPriority = { label: string; href: string; priority: boolean };

export type TodayData = {
  greeting: string;
  variant: "STAFF" | "STUDENT" | "PARENT";
  slots: TodaySlot[];
  pulse: { id: string; type: string; title: string; sentiment: string; studentName: string | null; occurredAt: string }[];
  metrics: {
    classesToday: number;
    attendanceEntered: number;
    attendanceTotal: number;
    homeworkToReview: number;
    studentsToCheck: number;
  } | null;
  priorities: TodayPriority[];
  self: {
    checkInToday: { mood: number; homeworkStatus: string } | null;
    homeworkDue: number;
  } | null;
};

const DAY_MAP: Record<number, number> = { 0: 7, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 };

async function timetableFor(classIds: Scope, today: Date, schoolId?: string) {
  return prisma.timetableSlot.findMany({
    where: { ...(schoolId ? { class: { schoolId } } : {}), ...(classIds === "ALL" ? {} : { classId: { in: classIds } }), dayOfWeek: DAY_MAP[today.getDay()] },
    include: { subject: true, class: { select: { id: true, name: true, room: true } } },
    orderBy: { startTime: "asc" },
  });
}

export async function getToday(session: SessionPayload): Promise<TodayData> {
  const today = startOfDay(new Date());
  const now = new Date();
  const staff = isStaff(session);
  const classIds = await classIdsFor(session);

  if (staff) {
    const [slots, attToday, submissionsToReview, roster] = await Promise.all([
      timetableFor(classIds, today, session.schoolId ?? undefined),
      prisma.attendanceRecord.findMany({ where: { ...(session.schoolId ? { schoolId: session.schoolId } : {}), ...(classIds === "ALL" ? {} : { classId: { in: classIds } }), date: today }, select: { classId: true } }),
      prisma.homeworkSubmission.count({
        where: { ...(session.schoolId ? { schoolId: session.schoolId } : {}), homework: { ...(classIds === "ALL" ? {} : { classId: { in: classIds } }) }, status: { in: ["PENDING", "MISSING", "NOT_DONE"] } },
      }),
      listStudents(session),
    ]);

    const pulse = await prisma.activityEvent.findMany({
      where: session.schoolId ? { schoolId: session.schoolId } : {},
      orderBy: { occurredAt: "desc" },
      take: 6,
      include: { student: { select: { user: { select: { firstName: true, lastName: true } } } } },
    });

    const slotsWithStatus: TodaySlot[] = slots.map((slot) => {
      const start = `${today.toISOString().slice(0, 10)}T${slot.startTime}:00`;
      const end = `${today.toISOString().slice(0, 10)}T${slot.endTime}:00`;
      const started = now >= new Date(start);
      const ended = now >= new Date(end);
      const status: TodaySlot["status"] = ended ? "Completed" : started ? "In progress" : slots.indexOf(slot) === slots.findIndex((s) => new Date(`${today.toISOString().slice(0, 10)}T${s.startTime}:00`) > now) ? "Next" : "Upcoming";
      return {
        id: slot.id,
        time: `${slot.startTime}–${slot.endTime}`,
        subject: slot.subject.name,
        className: slot.class.name,
        room: slot.class.room,
        status,
      };
    });

    const enteredClasses = new Set(attToday.map((a) => a.classId));
    const studentsToCheck = roster.filter((s) => s.signal === "ATTENTION" || s.signal === "WATCH").length;
    const attendanceTotal = classIds === "ALL" ? await prisma.schoolClass.count({ where: session.schoolId ? { schoolId: session.schoolId } : {} }) : classIds.length;

    return {
      greeting: "Today",
      variant: "STAFF",
      slots: slotsWithStatus,
      pulse: pulse.map((e) => ({
        id: e.id,
        type: e.type,
        title: e.title,
        sentiment: e.sentiment,
        studentName: e.student ? fullName(e.student.user) : null,
        occurredAt: e.occurredAt.toISOString(),
      })),
      metrics: {
        classesToday: attendanceTotal,
        attendanceEntered: enteredClasses.size,
        attendanceTotal,
        homeworkToReview: submissionsToReview,
        studentsToCheck,
      },
      priorities: [
        ...(studentsToCheck > 0 ? [{ label: "Respond to support signals", href: "/analytics", priority: true }] : []),
        ...(submissionsToReview > 0 ? [{ label: "Review homework submissions", href: "/homework", priority: false }] : []),
        ...(enteredClasses.size < attendanceTotal ? [{ label: "Complete attendance for the remaining classes", href: "/attendance", priority: false }] : []),
      ],
      self: null,
    };
  }

  // Student / parent path
  const scope = await resolveStudentScope(session);
  const targetIds = scope.kind === "STUDENT_IDS" ? scope.studentIds : [];
  const students = await prisma.student.findMany({
    where: { id: { in: targetIds }, status: "ACTIVE" },
    include: { currentClass: { select: { id: true, name: true, room: true } } },
  });
  const studentClassIds = students.map((s) => s.currentClass?.id).filter((v): v is string => Boolean(v));

  let checkInToday: { mood: number; homeworkStatus: string } | null = null;
  let homeworkDue = 0;
  if (session.studentId) {
    checkInToday = await prisma.dailyCheckIn.findUnique({ where: { studentId_date: { studentId: session.studentId, date: today } } });
    homeworkDue = await prisma.homeworkSubmission.count({
      where: { studentId: session.studentId, homework: { dueDate: { gte: today } } },
    });
  }

  const slots = (await timetableFor(studentClassIds, today)).map((slot) => ({
    id: slot.id,
    time: `${slot.startTime}–${slot.endTime}`,
    subject: slot.subject.name,
    className: slot.class.name,
    room: slot.class.room,
    status: "Upcoming" as const,
  }));

  return {
    greeting: "Today",
    variant: hasRole(session, ROLES.PARENT) ? "PARENT" : "STUDENT",
    slots,
    pulse: [],
    metrics: null,
    priorities: [],
    self: session.studentId
      ? { checkInToday: checkInToday ? { mood: checkInToday.mood, homeworkStatus: checkInToday.homeworkStatus } : null, homeworkDue }
      : null,
  };
}

// ---------------------------------------------------------------------------
// Homework
// ---------------------------------------------------------------------------

export type HomeworkItem = {
  id: string;
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  status: string;
  needsReview: boolean;
  completion: number;
  submitted: number;
  total: number;
};

export type HomeworkData = {
  items: HomeworkItem[];
  metrics: { open: number; dueToday: number; completion: number; needFeedback: number };
};

export async function getHomework(session: SessionPayload): Promise<HomeworkData> {
  const classIds = await classIdsFor(session);
  const classWhere = classIds === "ALL" ? {} : { classId: { in: classIds } };
  const where: Prisma.HomeworkWhereInput = { ...classWhere };
  if (session.schoolId) where.schoolId = session.schoolId;
  where.status = "PUBLISHED";
  const submissionWhere: Prisma.HomeworkSubmissionWhereInput = {
    homework: { ...classWhere, ...(session.schoolId ? { schoolId: session.schoolId } : {}) },
  };

  const [rows, completionStats, needFeedback] = await Promise.all([
    prisma.homework.findMany({
      where,
      include: { subject: { select: { name: true } }, class: { select: { name: true } } },
      orderBy: { dueDate: "asc" },
      take: 60,
    }),
    prisma.homeworkSubmission.groupBy({
      by: ["status"],
      where: { ...submissionWhere, createdAt: { gte: addDays(new Date(), -30) } },
      _count: { _all: true },
    }),
    prisma.homeworkSubmission.count({
      where: { ...submissionWhere, status: { in: ["PENDING", "MISSING", "NOT_DONE"] } },
    }),
  ]);

  const total = completionStats.reduce((a, r) => a + r._count._all, 0);
  const done = completionStats.filter((r) => ["COMPLETED", "LATE"].includes(r.status)).reduce((a, r) => a + r._count._all, 0);

  const today = startOfDay(new Date());
  let items: HomeworkItem[] = [];
  if (rows.length) {
    const submissionRows = await prisma.homeworkSubmission.groupBy({
      by: ["homeworkId", "status"],
      where: { homeworkId: { in: rows.map((r) => r.id) } },
      _count: { _all: true },
    });
    const totals = new Map<string, number>();
    const doneMap = new Map<string, number>();
    submissionRows.forEach((r) => {
      totals.set(r.homeworkId, (totals.get(r.homeworkId) ?? 0) + r._count._all);
      if (["COMPLETED", "LATE"].includes(r.status)) doneMap.set(r.homeworkId, (doneMap.get(r.homeworkId) ?? 0) + r._count._all);
    });

    items = rows.map((hw) => {
      const submitted = totals.get(hw.id) ?? 0;
      const completed = doneMap.get(hw.id) ?? 0;
      const due = startOfDay(hw.dueDate);
      const status = hw.status === "CLOSED" ? "Closed" : isSameDay(due, today) ? "Due today" : due < today ? "Overdue" : "Open";
      return {
        id: hw.id,
        title: hw.title,
        subject: hw.subject.name,
        className: hw.class.name,
        dueDate: hw.dueDate.toISOString().slice(0, 10),
        status,
        needsReview: submitted - completed > 0,
        completion: round((completed / submitted) * 100, 0) ?? 0,
        submitted: completed,
        total: submitted,
      };
    });
  }

  const dueToday = items.filter((i) => i.status === "Due today").length;
  return {
    items,
    metrics: {
      open: rows.filter((r) => r.status !== "CLOSED").length,
      dueToday,
      completion: total ? round((done / total) * 100, 0) ?? 0 : 0,
      needFeedback,
    },
  };
}

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------

export type AttendanceStudent = {
  id: string;
  name: string;
  initials: string;
  className: string;
  todayStatus: string | null;
  attendance30: number;
  pattern: "Monitor" | "Steady";
};

export type AttendanceData = {
  classes: string[];
  date: string;
  students: AttendanceStudent[];
  metrics: { present: number; absent: number; late: number; average30: number };
};

export async function getAttendance(session: SessionPayload): Promise<AttendanceData> {
  const classIds = await classIdsFor(session);
  const students = await prisma.student.findMany({
    where: { ...(classIds === "ALL" ? (session.schoolId ? { schoolId: session.schoolId } : {}) : { currentClassId: { in: classIds } }), status: "ACTIVE" },
    select: {
      id: true,
      currentClassId: true,
      user: { select: { firstName: true, lastName: true } },
      currentClass: { select: { name: true } },
    },
  });
  const studentIds = students.map((s) => s.id);
  const today = startOfDay(new Date());
  const since = addDays(today, -30);

  const [todayRows, historyRows] = await Promise.all([
    studentIds.length ? prisma.attendanceRecord.findMany({ where: { studentId: { in: studentIds }, date: today }, select: { studentId: true, status: true } }) : Promise.resolve([] as { studentId: string; status: string }[]),
    studentIds.length ? prisma.attendanceRecord.findMany({ where: { studentId: { in: studentIds }, date: { gte: since } }, select: { studentId: true, status: true } }) : Promise.resolve([] as { studentId: string; status: string }[]),
  ]);

  const todayStatus = new Map(todayRows.map((r) => [r.studentId, r.status]));
  const perStudent = new Map<string, { present: number; late: number; excused: number; absent: number; total: number }>();
  historyRows.forEach((r) => {
    const bucket = perStudent.get(r.studentId) ?? { present: 0, late: 0, excused: 0, absent: 0, total: 0 };
    if (r.status === "PRESENT") bucket.present += 1;
    else if (r.status === "LATE") bucket.late += 1;
    else if (r.status === "EXCUSED") bucket.excused += 1;
    else bucket.absent += 1;
    bucket.total += 1;
    perStudent.set(r.studentId, bucket);
  });

  const attendance30 = (id: string) => {
    const b = perStudent.get(id);
    if (!b || !b.total) return 0;
    return round(((b.present + b.excused + b.late * 0.5) / b.total) * 100, 0) ?? 0;
  };

  const roster: AttendanceStudent[] = students.map((s) => {
    const a30 = attendance30(s.id);
    return {
      id: s.id,
      name: fullName(s.user),
      initials: initials(s.user.firstName, s.user.lastName),
      className: s.currentClass?.name ?? "—",
      todayStatus: todayStatus.get(s.id) ?? null,
      attendance30: a30,
      pattern: a30 < 88 ? "Monitor" : "Steady",
    };
  });

  const classes = [...new Set(students.map((s) => s.currentClass?.name).filter((v): v is string => Boolean(v)))];
  const average30 = roster.length ? round(avg(roster.map((r) => r.attendance30)), 0) ?? 0 : 0;

  return {
    classes,
    date: today.toISOString().slice(0, 10),
    students: roster,
    metrics: {
      present: todayRows.filter((r) => r.status === "PRESENT").length,
      absent: todayRows.filter((r) => r.status === "ABSENT").length,
      late: todayRows.filter((r) => r.status === "LATE").length,
      average30,
    },
  };
}

// ---------------------------------------------------------------------------
// Observations
// ---------------------------------------------------------------------------

export type ObservationItem = {
  id: string;
  studentName: string;
  studentId: string;
  className: string;
  category: string;
  categoryLabel: string;
  sentiment: string;
  note: string | null;
  teacherName: string;
  occurredAt: string;
};

export type ObservationsData = {
  items: ObservationItem[];
  metrics: { thisWeek: number; positiveRate: number; followUps: number };
};

export async function getObservations(session: SessionPayload): Promise<ObservationsData> {
  const staff = isStaff(session);
  const scope = await resolveStudentScope(session);
  const studentWhere: Prisma.StudentWhereInput =
    scope.kind === "PLATFORM" ? {} : scope.kind === "ALL_SCHOOL" ? { schoolId: scope.schoolId } : scope.kind === "STUDENT_IDS" ? { id: { in: scope.studentIds } } : { id: "__none__" };

  const visibility = staff ? undefined : hasRole(session, ROLES.STUDENT) ? { in: ["STUDENT_ONLY", "INCLUDING_STUDENT", "INCLUDING_PARENTS"] } : { in: ["INCLUDING_PARENTS", "PARTICIPANTS"] };

  const [rows, weekCount, attentionCount] = await Promise.all([
    prisma.teacherObservation.findMany({
      where: { student: studentWhere, ...(visibility ? { visibility } : {}) },
      orderBy: { occurredAt: "desc" },
      take: 60,
      include: {
        student: { select: { id: true, user: { select: { firstName: true, lastName: true } }, currentClass: { select: { name: true } } } },
        teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
      },
    }),
    prisma.teacherObservation.count({
      where: { student: studentWhere, ...(visibility ? { visibility } : {}), occurredAt: { gte: startOfWeek(new Date()) } },
    }),
    prisma.teacherObservation.count({
      where: { student: studentWhere, ...(visibility ? { visibility } : {}), sentiment: "ATTENTION" },
    }),
  ]);

  const items: ObservationItem[] = rows.map((o) => ({
    id: o.id,
    studentName: fullName(o.student.user),
    studentId: o.student.id,
    className: o.student.currentClass?.name ?? "—",
    category: o.category,
    categoryLabel: OBSERVATION_CATEGORY_LABELS[o.category] ?? o.category,
    sentiment: o.sentiment,
    note: o.note,
    teacherName: fullName(o.teacher.user),
    occurredAt: o.occurredAt.toISOString(),
  }));

  return {
    items,
    metrics: {
      thisWeek: weekCount,
      positiveRate: rows.length ? round((rows.filter((o) => o.sentiment === "POSITIVE").length / rows.length) * 100, 0) ?? 0 : 0,
      followUps: attentionCount,
    },
  };
}

// ---------------------------------------------------------------------------
// Assessments
// ---------------------------------------------------------------------------

export type AssessmentItem = {
  id: string;
  title: string;
  subject: string;
  className: string;
  date: string;
  type: string;
  average: number | null;
  graded: number;
};

export type AssessmentsData = {
  subjects: string[];
  items: AssessmentItem[];
  metrics: { termCount: number; awaitingGrades: number; academicTrend: number | null };
};

export async function getAssessments(session: SessionPayload): Promise<AssessmentsData> {
  const classIds = await classIdsFor(session);
  const where: Prisma.AssessmentWhereInput = {};
  if (session.schoolId) where.schoolId = session.schoolId;
  if (classIds !== "ALL") where.classId = { in: classIds };

  const rows = await prisma.assessment.findMany({
    where,
    orderBy: { date: "desc" },
    take: 80,
    include: { subject: { select: { name: true } }, class: { select: { name: true } }, grades: { select: { percentage: true } } },
  });

  const items: AssessmentItem[] = rows.map((a) => {
    const percentages = a.grades.map((g) => g.percentage).filter((v): v is number => v !== null);
    return {
      id: a.id,
      title: a.title,
      subject: a.subject.name,
      className: a.class.name,
      date: a.date.toISOString().slice(0, 10),
      type: a.type,
      average: percentages.length ? round(avg(percentages), 1) : null,
      graded: percentages.length,
    };
  });

  const subjects = [...new Set(items.map((i) => i.subject))];
  const awaitingGrades = items.filter((i) => i.graded === 0).length;

  const graded = items.filter((i) => i.average !== null);
  const half = Math.ceil(graded.length / 2);
  const recent = graded.slice(0, half);
  const older = graded.slice(half);
  const avgOf = (list: typeof graded) => avg(list.flatMap((i) => (i.average === null ? [] : [i.average])));
  const trend = recent.length && older.length ? round(avgOf(recent) - avgOf(older), 1) : null;

  return { subjects, items, metrics: { termCount: items.length, awaitingGrades, academicTrend: trend } };
}

// ---------------------------------------------------------------------------
// Weekly review
// ---------------------------------------------------------------------------

export type WeeklyGroup = "POSITIVE" | "STABLE" | "WATCH" | "ATTENTION";

export type WeeklyReviewData = {
  classes: string[];
  group: WeeklyGroup | "ALL";
  metrics: { homeworkDelta: number | null; attendance: number | null; engagementDelta: number | null; checkInRate: number | null };
  summary: { positive: number; stable: number; watch: number; attention: number; openAlerts: number };
  highlights: { label: string; value: string }[];
  groups: Record<WeeklyGroup, number>;
  students: { id: string; name: string; initials: string; className: string; signal: WeeklyGroup; headline: string }[];
};

const GROUP_LABEL: Record<WeeklyGroup, string> = {
  POSITIVE: "Positive evolution",
  STABLE: "Stable",
  WATCH: "Keep an eye",
  ATTENTION: "Attention suggested",
};

export async function getWeeklyReview(session: SessionPayload): Promise<WeeklyReviewData> {
  const scope = await scopeStudentIds(session);
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

  const weekStart = startOfWeek(new Date());
  const prevWeekStart = addDays(weekStart, -7);

  const [snaps, prevSnaps, checkInsWeek, checkInsPrev, alerts] = await Promise.all([
    ids.length
      ? prisma.studentIndicatorSnapshot.findMany({ where: { studentId: { in: ids }, granularity: "WEEK", periodStart: { gte: weekStart } }, select: { studentId: true, academic: true, attendance: true, homework: true, engagement: true, motivation: true, wellbeing: true, overallTrend: true } })
      : Promise.resolve([]),
    ids.length
      ? prisma.studentIndicatorSnapshot.findMany({ where: { studentId: { in: ids }, granularity: "WEEK", periodStart: { gte: prevWeekStart, lt: weekStart } }, select: { studentId: true, academic: true, attendance: true, homework: true, engagement: true, motivation: true, wellbeing: true, overallTrend: true } })
      : Promise.resolve([]),
    ids.length ? prisma.dailyCheckIn.count({ where: { studentId: { in: ids }, date: { gte: weekStart } } }) : 0,
    ids.length ? prisma.dailyCheckIn.count({ where: { studentId: { in: ids }, date: { gte: prevWeekStart, lt: weekStart } } }) : 0,
    ids.length ? prisma.alert.findMany({ where: { studentId: { in: ids }, status: { in: ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS"] } }, select: { id: true, studentId: true, level: true, title: true } }) : Promise.resolve([]),
  ]);

  const latest = new Map<string, (typeof snaps)[number]>();
  snaps.forEach((s) => { if (!latest.has(s.studentId) || s.periodStart > latest.get(s.studentId)!.periodStart) latest.set(s.studentId, s); });
  const previous = new Map<string, (typeof prevSnaps)[number]>();
  prevSnaps.forEach((s) => { if (!previous.has(s.studentId) || s.periodStart > previous.get(s.studentId)!.periodStart) previous.set(s.studentId, s); });

  const studentSignal = (id: string): WeeklyGroup => {
    const cur = latest.get(id);
    if (!cur) return "STABLE";
    const a = pct(cur.attendance);
    const h = pct(cur.homework);
    const m = pct(cur.motivation);
    const w = pct(cur.wellbeing);
    const ac = pct(cur.academic);
    if (a < 88 || ac < 55 || h < 50 || m < 45 || w < 40) return "ATTENTION";
    if (a < 93 || ac < 65 || h < 65 || m < 55) return "WATCH";
    if ((ac + h + pct(cur.engagement)) / 3 >= 80) return "POSITIVE";
    return "STABLE";
  };

  const groups: Record<WeeklyGroup, number> = { POSITIVE: 0, STABLE: 0, WATCH: 0, ATTENTION: 0 };
  students.forEach((s) => { groups[studentSignal(s.id)] += 1; });

  const deltas = {
    homework: snapDelta(ids, latest, previous, "homework"),
    attendance: snapDelta(ids, latest, previous, "attendance"),
    engagement: snapDelta(ids, latest, previous, "engagement"),
  };

  const homeworkDelta = deltas.homework;
  const engagementDelta = deltas.engagement;
  const attendance = ids.length ? round(avg([...latest.values()].map((s) => pct(s.attendance))), 0) : null;
  const checkInRate = ids.length ? round((checkInsWeek / ids.length) * 100, 0) : null;
  const checkInDelta = checkInRate !== null && ids.length ? checkInRate - round((checkInsPrev / ids.length) * 100, 0) : null;

  const highlights: { label: string; value: string }[] = [];
  if (homeworkDelta !== null && Math.abs(homeworkDelta) >= 2) highlights.push({ label: "Homework completion", value: `${homeworkDelta > 0 ? "+" : ""}${homeworkDelta} pts` });
  if (attendance !== null) highlights.push({ label: "Attendance", value: `${attendance}%` });
  if (engagementDelta !== null && Math.abs(engagementDelta) >= 2) highlights.push({ label: "Engagement", value: `${engagementDelta > 0 ? "+" : ""}${engagementDelta} pts` });
  if (checkInDelta !== null && Math.abs(checkInDelta) >= 5) highlights.push({ label: "Check-in participation", value: `${checkInDelta > 0 ? "+" : ""}${checkInDelta} pts` });
  if (!highlights.length) highlights.push({ label: "All indicators stable compared with the previous period", value: "" });

  const attentionAlerts = alerts.filter((a) => a.level === "ACTION_SUGGESTED");

  const studentsOut = students
    .map((s) => ({
      id: s.id,
      name: fullName(s.user),
      initials: initials(s.user.firstName, s.user.lastName),
      className: s.currentClass?.name ?? "—",
      signal: studentSignal(s.id),
      headline: GROUP_LABEL[studentSignal(s.id)],
    }))
    .sort((a, b) => groupOrder(a.signal) - groupOrder(b.signal));

  const classes = [...new Set(students.map((s) => s.currentClass?.name).filter((v): v is string => Boolean(v)))];

  return {
    classes,
    group: "ALL",
    metrics: { homeworkDelta, attendance, engagementDelta, checkInRate },
    summary: { positive: groups.POSITIVE, stable: groups.STABLE, watch: groups.WATCH + groups.ATTENTION, attention: groups.ATTENTION, openAlerts: attentionAlerts.length },
    highlights,
    groups,
    students: studentsOut,
  };
}

function snapDelta(
  ids: string[],
  latest: Map<string, { homework: number | null; attendance: number | null; engagement: number | null }>,
  previous: Map<string, { homework: number | null; attendance: number | null; engagement: number | null }>,
  key: "homework" | "attendance" | "engagement",
) {
  const values: number[] = [];
  ids.forEach((id) => {
    const cur = latest.get(id)?.[key];
    const prev = previous.get(id)?.[key];
    if (cur !== null && cur !== undefined && prev !== null && prev !== undefined) values.push(cur - prev);
  });
  return values.length ? round(avg(values), 1) : null;
}

function groupOrder(g: WeeklyGroup) {
  return { ATTENTION: 0, WATCH: 1, POSITIVE: 2, STABLE: 3 }[g];
}
