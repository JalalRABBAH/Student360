/**
 * STUDENT360 — Module registry.
 *
 * Skouly-aligned: the application is organised as a set of modules, each
 * granted to the user's profile with a level of access (none / read / write).
 * The registry is the single source of truth for the sidebar, the page guards
 * and the "Modules & Permissions" administration screen.
 */

import {
  BarChart3,
  BookOpen,
  BrainCircuit,
  Bus,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  GraduationCap,
  HeartHandshake,
  KeyRound,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Library,
  MessageSquare,
  School,
  ScrollText,
  Settings,
  Sparkles,
  Target,
  Trophy,
  Users,
  Utensils,
  Wallet,
  type LucideIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Icons (shared with the sidebar)
// ---------------------------------------------------------------------------

export type IconName =
  | "LayoutDashboard"
  | "Users"
  | "GraduationCap"
  | "CalendarDays"
  | "BookOpen"
  | "ClipboardList"
  | "BarChart3"
  | "MessageSquare"
  | "FileText"
  | "Settings"
  | "School"
  | "BrainCircuit"
  | "HeartHandshake"
  | "Trophy"
  | "Clock"
  | "Target"
  | "Sparkles"
  | "CheckCircle2"
  | "LayoutGrid"
  | "Library"
  | "Layers"
  | "ScrollText"
  | "Utensils"
  | "Bus"
  | "Wallet"
  | "KeyRound";

export const iconMap: Record<IconName, LucideIcon> = {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarDays,
  BookOpen,
  ClipboardList,
  BarChart3,
  MessageSquare,
  FileText,
  Settings,
  School,
  BrainCircuit,
  HeartHandshake,
  Trophy,
  Clock,
  Target,
  Sparkles,
  CheckCircle2,
  LayoutGrid,
  Library,
  Layers,
  ScrollText,
  Utensils,
  Bus,
  Wallet,
  KeyRound,
};

// ---------------------------------------------------------------------------
// Modules
// ---------------------------------------------------------------------------

export type ModuleCode =
  | "establishments"
  | "students"
  | "teachers"
  | "classes"
  | "performance"
  | "homework"
  | "assessments"
  | "programs"
  | "levels"
  | "calendar"
  | "attendance"
  | "observations"
  | "rules"
  | "canteen"
  | "transport"
  | "messaging"
  | "actions"
  | "finance"
  | "reports"
  | "configuration"
  | "permissions";

export type ModuleAccess = "none" | "read" | "write";

export type ModuleCategory = "people" | "academic" | "operations" | "communication" | "finance" | "platform";

export type ModuleDef = {
  code: ModuleCode;
  /** English i18n key (also the display string for `en`). */
  label: string;
  category: ModuleCategory;
  icon: IconName;
  href: string;
  /** True when the module is a Skouly roadmap placeholder (no functional page yet). */
  placeholder?: boolean;
};

export const MODULE_CATEGORIES: { key: ModuleCategory; label: string }[] = [
  { key: "people", label: "People & Administration" },
  { key: "academic", label: "Academic & Curriculum" },
  { key: "operations", label: "Operations & Campus" },
  { key: "communication", label: "Communication & Community" },
  { key: "finance", label: "Finance & Reporting" },
  { key: "platform", label: "Platform" },
];

export const MODULES: ModuleDef[] = [
  // People & Administration
  { code: "establishments", label: "Establishments", category: "people", icon: "School", href: "/school" },
  { code: "students", label: "Students", category: "people", icon: "GraduationCap", href: "/students" },
  { code: "teachers", label: "Teachers", category: "people", icon: "Users", href: "/teachers" },
  { code: "classes", label: "Classes", category: "people", icon: "LayoutGrid", href: "/classes" },
  // Academic & Curriculum
  { code: "performance", label: "Student Performance", category: "academic", icon: "BarChart3", href: "/progress" },
  { code: "homework", label: "Homework", category: "academic", icon: "BookOpen", href: "/homework" },
  { code: "assessments", label: "Assessments", category: "academic", icon: "FileText", href: "/assessments" },
  { code: "programs", label: "Programs", category: "academic", icon: "Library", href: "/modules/programs", placeholder: true },
  { code: "levels", label: "Levels & Subjects", category: "academic", icon: "Layers", href: "/modules/levels", placeholder: true },
  // Operations & Campus
  { code: "calendar", label: "Calendar", category: "operations", icon: "CalendarDays", href: "/today" },
  { code: "attendance", label: "Attendance", category: "operations", icon: "Clock", href: "/attendance" },
  { code: "observations", label: "Observations", category: "operations", icon: "ClipboardList", href: "/observations" },
  { code: "rules", label: "Internal Rules", category: "operations", icon: "ScrollText", href: "/modules/rules", placeholder: true },
  { code: "canteen", label: "Canteen", category: "operations", icon: "Utensils", href: "/modules/canteen", placeholder: true },
  { code: "transport", label: "Transport", category: "operations", icon: "Bus", href: "/modules/transport", placeholder: true },
  // Communication & Community
  { code: "messaging", label: "Messaging", category: "communication", icon: "MessageSquare", href: "/messages" },
  { code: "actions", label: "Actions", category: "communication", icon: "CheckCircle2", href: "/actions" },
  // Finance & Reporting
  { code: "finance", label: "Finance & Fees", category: "finance", icon: "Wallet", href: "/modules/finance", placeholder: true },
  { code: "reports", label: "Reports", category: "finance", icon: "FileText", href: "/reports" },
  // Platform
  { code: "configuration", label: "Configuration", category: "platform", icon: "Settings", href: "/configuration" },
  { code: "permissions", label: "Modules & Permissions", category: "platform", icon: "KeyRound", href: "/permissions" },
];

export function moduleByCode(code: ModuleCode): ModuleDef | undefined {
  return MODULES.find((m) => m.code === code);
}

// ---------------------------------------------------------------------------
// Role × module access matrix (none / read / write)
// ---------------------------------------------------------------------------

const WRITE: ModuleAccess = "write";
const READ: ModuleAccess = "read";

const ALL_MODULES: ModuleCode[] = MODULES.map((m) => m.code);

const ALL_WRITE = Object.fromEntries(ALL_MODULES.map((code) => [code, WRITE])) as Record<ModuleCode, ModuleAccess>;

const LEADERSHIP_WRITE: Record<ModuleCode, ModuleAccess> = ALL_WRITE;

export const ROLE_MODULE_ACCESS: Record<string, Partial<Record<ModuleCode, ModuleAccess>>> = {
  SUPER_ADMIN: LEADERSHIP_WRITE,
  ADMIN: LEADERSHIP_WRITE,
  PRINCIPAL: LEADERSHIP_WRITE,
  TEACHER: {
    students: READ,
    classes: READ,
    performance: WRITE,
    homework: WRITE,
    assessments: WRITE,
    observations: WRITE,
    calendar: READ,
    attendance: WRITE,
    actions: WRITE,
    messaging: WRITE,
    reports: READ,
  },
  PARENT: {
    students: READ,
    calendar: READ,
    performance: READ,
    homework: READ,
    attendance: READ,
    actions: WRITE,
    messaging: WRITE,
    reports: READ,
    finance: READ,
  },
  STUDENT: {
    calendar: READ,
    performance: READ,
    homework: READ,
    assessments: READ,
    attendance: READ,
    actions: WRITE,
    messaging: WRITE,
  },
  NURSE: {
    students: READ,
    performance: READ,
    calendar: READ,
    attendance: READ,
    observations: WRITE,
    actions: WRITE,
    messaging: WRITE,
    reports: READ,
  },
};

const ACCESS_LEVEL: Record<ModuleAccess, number> = { none: 0, read: 1, write: 2 };

/** Merge a user's module access across all their roles (highest wins). */
export function moduleAccessFor(roles: readonly string[]): Partial<Record<ModuleCode, ModuleAccess>> {
  const merged: Partial<Record<ModuleCode, ModuleAccess>> = {};
  for (const role of roles) {
    const row = ROLE_MODULE_ACCESS[role];
    if (!row) continue;
    for (const [code, level] of Object.entries(row) as [ModuleCode, ModuleAccess][]) {
      if (!merged[code] || ACCESS_LEVEL[level] > ACCESS_LEVEL[merged[code]]) merged[code] = level;
    }
  }
  return merged;
}

/** True when the session may access the module with at least `mode`. */
export function canModule(session: Pick<{ roles: readonly string[] }, "roles">, code: ModuleCode, mode: ModuleAccess = "read") {
  const level = moduleAccessFor(session.roles)[code];
  return Boolean(level && ACCESS_LEVEL[level] >= ACCESS_LEVEL[mode]);
}

/** Modules the given roles may see (access != none), in category order. */
export function accessibleModules(roles: readonly string[]): ModuleDef[] {
  const access = moduleAccessFor(roles);
  return MODULES.filter((m) => access[m.code] && access[m.code] !== "none");
}
