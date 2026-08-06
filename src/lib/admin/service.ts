import type { Prisma, SchoolConfig } from "@prisma/client";
import { prisma } from "@/lib/db";
import { can, resolveStudentScope } from "@/lib/auth/rbac";
import type { SessionPayload } from "@/lib/auth/session";
import { signalFor } from "@/lib/intelligence/service";
import { addDays, avg, fullName, round, startOfDay } from "@/lib/utils";

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
  return { id: "__none__", status: "ACTIVE" };
}

function auditScopeWhere(session: SessionPayload): Prisma.AuditLogWhereInput {
  return session.schoolId ? { schoolId: session.schoolId } : {};
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export const REPORT_TEMPLATES = [
  { id: "student-weekly", title: "Student weekly report", description: "Individual progress, goals, feedback and attendance", scope: "STUDENT" },
  { id: "student-term", title: "Student term report", description: "Full term academic and competency synthesis", scope: "STUDENT" },
  { id: "class-weekly", title: "Class weekly report", description: "Class indicators, progress groups and highlights", scope: "CLASS" },
  { id: "attendance", title: "Attendance report", description: "Attendance patterns by grade, class and period", scope: "SCHOOL" },
  { id: "homework", title: "Homework report", description: "Completion, lateness and support needs", scope: "SCHOOL" },
  { id: "intervention", title: "Intervention report", description: "Open plans, outcomes and measured progress", scope: "SUPPORT" },
] as const;

export const REPORT_SCOPE_LABELS: Record<string, string> = {
  STUDENT: "Student",
  CLASS: "Class",
  SCHOOL: "School",
  SUPPORT: "Support",
};

export type ClassReportSummary = {
  classId: string;
  name: string;
  gradeLevel: string;
  students: number;
  attendance: number | null;
  homework: number | null;
  engagement: number | null;
  positive: number;
  attention: number;
};

export type RecentExport = {
  id: string;
  actorName: string | null;
  createdAt: string;
};

export type ReportsData = {
  templates: typeof REPORT_TEMPLATES;
  metrics: { templates: number; generatedMonth: number; classesReady: number };
  classes: ClassReportSummary[];
  exports: RecentExport[];
};

const emptyReports: ReportsData = {
  templates: REPORT_TEMPLATES,
  metrics: { templates: REPORT_TEMPLATES.length, generatedMonth: 0, classesReady: 0 },
  classes: [],
  exports: [],
};

export async function getReports(session: SessionPayload): Promise<ReportsData> {
  if (!can(session, "reports:export")) return emptyReports;

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
            attendance: true,
            homework: true,
            engagement: true,
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

  const byClass = new Map<string, { id: string; name: string; gradeLevel: string; studentIds: string[] }>();
  students.forEach((s) => {
    const classId = s.currentClass?.id;
    if (!classId) return;
    const entry = byClass.get(classId) ?? { id: classId, name: s.currentClass!.name, gradeLevel: s.currentClass!.gradeLevel, studentIds: [] };
    entry.studentIds.push(s.id);
    byClass.set(classId, entry);
  });

  const classes: ClassReportSummary[] = [...byClass.values()].map((c) => {
    const classSnaps = c.studentIds.map((id) => latest.get(id)).filter((s): s is NonNullable<typeof s> => Boolean(s));
    const signals = c.studentIds.map((id) => {
      const snap = latest.get(id);
      return snap
        ? signalFor({
            attendance: snap.attendance,
            academic: snap.academic,
            homework: snap.homework,
            motivation: snap.motivation,
            wellbeing: snap.wellbeing,
            engagement: snap.engagement,
          })
        : "STABLE";
    });
    return {
      classId: c.id,
      name: c.name,
      gradeLevel: c.gradeLevel,
      students: c.studentIds.length,
      attendance: avg(classSnaps.map((s) => s.attendance)) === null ? null : round(avg(classSnaps.map((s) => s.attendance)), 0),
      homework: avg(classSnaps.map((s) => s.homework)) === null ? null : round(avg(classSnaps.map((s) => s.homework)), 0),
      engagement: avg(classSnaps.map((s) => s.engagement)) === null ? null : round(avg(classSnaps.map((s) => s.engagement)), 0),
      positive: signals.filter((x) => x === "POSITIVE").length,
      attention: signals.filter((x) => x === "ATTENTION" || x === "WATCH").length,
    };
  });

  const monthAgo = addDays(startOfDay(new Date()), -30);
  const [exportsMonth, recentExports] = await Promise.all([
    prisma.auditLog.count({ where: { ...auditScopeWhere(session), action: "EXPORT_REPORT", createdAt: { gte: monthAgo } } }),
    prisma.auditLog.findMany({
      where: { ...auditScopeWhere(session), action: "EXPORT_REPORT" },
      orderBy: { createdAt: "desc" },
      take: 15,
      include: { actor: { select: { firstName: true, lastName: true } } },
    }),
  ]);

  return {
    templates: REPORT_TEMPLATES,
    metrics: { templates: REPORT_TEMPLATES.length, generatedMonth: exportsMonth, classesReady: classes.length },
    classes,
    exports: recentExports.map((e) => ({
      id: e.id,
      actorName: e.actor ? fullName(e.actor) : null,
      createdAt: e.createdAt.toISOString(),
    })),
  };
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export type ConfigField = {
  name: string;
  label: string;
  type: "text" | "select" | "number" | "checkboxes";
  options?: string[];
  value?: string;
  checked?: string[];
};

export type ConfigSection = {
  key: string | null;
  label: string;
  summary: string;
  description: string;
  rows: { label: string; value: string }[];
  fields: ConfigField[];
};

export type ConfigurationOverview = {
  academicYear: string | null;
  terms: string[];
  classes: number;
  subjects: number;
  competencies: number;
  students: number;
};

export type ConfigurationData = {
  available: boolean;
  schoolName: string | null;
  overview: ConfigurationOverview | null;
  sections: ConfigSection[];
};

function configOrDefault(configs: SchoolConfig[], key: string, fallback: unknown) {
  const row = configs.find((c) => c.key === key);
  if (!row) return fallback;
  try {
    return JSON.parse(row.value);
  } catch {
    return fallback;
  }
}

export async function getConfiguration(session: SessionPayload): Promise<ConfigurationData> {
  if (!can(session, "school:configure")) return { available: false, schoolName: null, overview: null, sections: [] };
  const schoolId = session.schoolId;
  if (!schoolId) return { available: false, schoolName: null, overview: null, sections: [] };

  const [school, currentYear, classes, subjects, competencies, students, configs] = await Promise.all([
    prisma.school.findUnique({ where: { id: schoolId }, select: { name: true, defaultLocale: true, supportedLocales: true } }),
    prisma.academicYear.findFirst({ where: { schoolId, isCurrent: true }, include: { terms: { orderBy: { sequence: "asc" } } } }),
    prisma.schoolClass.findMany({ where: { schoolId }, orderBy: { gradeOrder: "asc" }, select: { id: true, name: true, gradeLevel: true, capacity: true } }),
    prisma.subject.findMany({ where: { schoolId }, orderBy: { name: "asc" }, select: { id: true, name: true, code: true, color: true } }),
    prisma.competency.findMany({ where: { schoolId, isActive: true }, orderBy: { order: "asc" }, select: { id: true, name: true, category: true } }),
    prisma.student.count({ where: { schoolId, status: "ACTIVE" } }),
    prisma.schoolConfig.findMany({ where: { schoolId } }),
  ]);

  const grading = configOrDefault(configs, "GRADING_SYSTEM", { scale: "NUMERIC_20", pass: "10", max: "20" }) as Record<string, unknown>;
  const attendanceTypes = configOrDefault(configs, "ATTENDANCE_TYPES", { types: ["PRESENT", "ABSENT", "LATE", "EXCUSED"] }) as Record<string, unknown>;
  const checkinQuestions = configOrDefault(configs, "CHECKIN_QUESTIONS", { dimensions: ["Mood", "Energy", "Motivation", "Workload", "Understanding"] }) as Record<string, unknown>;
  const alertThresholds = configOrDefault(configs, "ALERT_THRESHOLDS", { rule: "Help request signal", severity: "Medium", threshold: "3" }) as Record<string, unknown>;
  const parentVisibility = configOrDefault(configs, "PARENT_VISIBILITY", { overall: "Balanced", visible: ["Grades", "Attendance", "Homework"], notify: ["Low grades", "Absences"] }) as Record<string, unknown>;
  const languages = configOrDefault(configs, "LANGUAGES", { locales: (school?.supportedLocales ?? "en,fr,ar").split(","), default: school?.defaultLocale ?? "en" }) as Record<string, unknown>;

  const asStrings = (value: unknown): string[] => (Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : []);
  const str = (value: unknown): string => (typeof value === "string" ? value : String(value ?? ""));

  const termRows = (currentYear?.terms ?? []).map((term) => ({
    label: term.name,
    value: `${term.startDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} – ${term.endDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}${term.isCurrent ? " · Current" : ""}`,
  }));

  const sections: ConfigSection[] = [
    {
      key: null,
      label: "Academic years",
      summary: currentYear?.name ?? "—",
      description: "Calendar, terms and current period",
      rows: [
        { label: "Current academic year", value: currentYear?.name ?? "—" },
        ...termRows,
        { label: "Active classes", value: String(classes.length) },
        { label: "Active students", value: String(students) },
      ],
      fields: [],
    },
    {
      key: null,
      label: "Classes and grades",
      summary: `${classes.length} classes · ${[...new Set(classes.map((c) => c.gradeLevel))].join(", ")}`,
      description: "Capacity, rooms and homeroom teachers",
      rows: classes.map((c) => ({ label: `${c.gradeLevel} ${c.name}`, value: `Capacity ${c.capacity}` })),
      fields: [],
    },
    {
      key: null,
      label: "Subjects",
      summary: `${subjects.length} active subjects`,
      description: "Names, codes, colours and ordering",
      rows: subjects.map((s) => ({ label: s.name, value: s.code })),
      fields: [],
    },
    {
      key: null,
      label: "Competencies",
      summary: `${competencies.length} active competencies`,
      description: "School-specific competency framework",
      rows: competencies.map((c) => ({ label: c.name, value: c.category })),
      fields: [],
    },
    {
      key: "GRADING_SYSTEM",
      label: "Grading system",
      summary: str(grading.scale),
      description: "Multiple systems supported",
      rows: [],
      fields: [
        { name: "scale", label: "Scale type", type: "select", options: ["NUMERIC_20", "NUMERIC_100", "LETTER", "COMPETENCY_4"], value: str(grading.scale) },
        { name: "pass", label: "Passing grade", type: "number", value: str(grading.pass) },
        { name: "max", label: "Max grade", type: "number", value: str(grading.max) },
      ],
    },
    {
      key: "ATTENDANCE_TYPES",
      label: "Attendance types",
      summary: `${asStrings(attendanceTypes.types).length} active types`,
      description: "Present, absent, late and excused",
      rows: [],
      fields: [
        { name: "types", label: "Active types", type: "checkboxes", options: ["PRESENT", "ABSENT", "LATE", "EXCUSED"], checked: asStrings(attendanceTypes.types) },
      ],
    },
    {
      key: "CHECKIN_QUESTIONS",
      label: "Check-in questions",
      summary: `${asStrings(checkinQuestions.dimensions).length} daily dimensions`,
      description: "Mood, energy, motivation, workload and understanding",
      rows: [],
      fields: [
        { name: "dimensions", label: "Active dimensions", type: "checkboxes", options: ["Mood", "Energy", "Motivation", "Workload", "Understanding"], checked: asStrings(checkinQuestions.dimensions) },
      ],
    },
    {
      key: "ALERT_THRESHOLDS",
      label: "Alert thresholds",
      summary: str(alertThresholds.rule),
      description: "Signal timing and evidence thresholds",
      rows: [],
      fields: [
        { name: "rule", label: "Rule name", type: "text", value: str(alertThresholds.rule) },
        { name: "severity", label: "Severity", type: "select", options: ["Low", "Medium", "High", "Critical"], value: str(alertThresholds.severity) },
        { name: "threshold", label: "Evidence threshold", type: "number", value: str(alertThresholds.threshold) },
      ],
    },
    {
      key: "PARENT_VISIBILITY",
      label: "Parent visibility",
      summary: str(parentVisibility.overall),
      description: "Fine-grained per-data-type controls",
      rows: [],
      fields: [
        { name: "overall", label: "Overall visibility", type: "select", options: ["Minimal", "Balanced", "Full"], value: str(parentVisibility.overall) },
        { name: "visible", label: "Visible data types", type: "checkboxes", options: ["Grades", "Attendance", "Homework", "Behaviour", "Check-ins", "Messages"], checked: asStrings(parentVisibility.visible) },
        { name: "notify", label: "Always notify parent for", type: "checkboxes", options: ["Low grades", "Absences", "Behaviour alerts", "All changes"], checked: asStrings(parentVisibility.notify) },
      ],
    },
    {
      key: "LANGUAGES",
      label: "Languages",
      summary: (school?.supportedLocales ?? "en,fr,ar").toUpperCase().replaceAll(",", ", "),
      description: "RTL prepared for Arabic",
      rows: [],
      fields: [
        { name: "locales", label: "Enabled languages", type: "checkboxes", options: ["en", "fr", "ar"], checked: asStrings(languages.locales) },
        { name: "default", label: "Default language", type: "select", options: ["en", "fr", "ar"], value: str(languages.default) },
      ],
    },
  ];

  return {
    available: true,
    schoolName: school?.name ?? null,
    overview: {
      academicYear: currentYear?.name ?? null,
      terms: (currentYear?.terms ?? []).map((t) => t.name),
      classes: classes.length,
      subjects: subjects.length,
      competencies: competencies.length,
      students,
    },
    sections,
  };
}
