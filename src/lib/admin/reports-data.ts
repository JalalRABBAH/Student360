// Client-safe constants and shared types for the reports & configuration views.
// This module must NOT import anything server-only (Prisma, node:crypto, ...).

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
