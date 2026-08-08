import type { RoleCode } from "@/lib/domain/enums";
import type { NavItem } from "@/components/sidebar-item";
import { accessibleModules, iconMap, type IconName, type ModuleCode } from "@/lib/modules/registry";

export type { IconName };
export { iconMap };

export type NavSpec = { label: string; href: string; icon: IconName; badge?: number | string };

type RoleNavItem = { label: string; href: string; icon: IconName; module?: ModuleCode };
type RoleNavGroup = { label: string; items: RoleNavItem[] };

function moduleItem(module: ModuleCode, href: string, label?: string, icon?: IconName): RoleNavItem {
  return { label: label ?? module, href, icon: icon ?? "School", module };
}

const ROLE_NAV: Record<RoleCode, RoleNavGroup[]> = {
  TEACHER: [
    {
      label: "Overview",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
        { label: "Weekly Review", href: "/weekly-review", icon: "Sparkles" },
        { label: "Analytics", href: "/analytics", icon: "BarChart3" },
      ],
    },
    {
      label: "People & Administration",
      items: [
        moduleItem("students", "/students", "Students", "GraduationCap"),
        moduleItem("classes", "/classes", "Classes", "LayoutGrid"),
      ],
    },
    {
      label: "Academic & Curriculum",
      items: [
        moduleItem("performance", "/progress", "Student Performance", "BarChart3"),
        moduleItem("homework", "/homework", "Homework", "BookOpen"),
        moduleItem("assessments", "/assessments", "Assessments", "FileText"),
        moduleItem("observations", "/observations", "Observations", "ClipboardList"),
      ],
    },
    {
      label: "Operations & Campus",
      items: [
        moduleItem("calendar", "/today", "Calendar", "CalendarDays"),
        moduleItem("attendance", "/attendance", "Attendance", "Clock"),
        moduleItem("actions", "/actions", "Actions", "CheckCircle2"),
      ],
    },
    {
      label: "Communication & Community",
      items: [moduleItem("messaging", "/messages", "Messaging", "MessageSquare")],
    },
    {
      label: "Finance & Reporting",
      items: [moduleItem("reports", "/reports", "Reports", "FileText")],
    },
  ],
  STUDENT: [
    {
      label: "My day",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
        moduleItem("calendar", "/today", "Calendar", "CalendarDays"),
        moduleItem("performance", "/progress", "Student Performance", "BarChart3"),
        moduleItem("homework", "/homework", "Homework", "BookOpen"),
        { label: "Goals", href: "/goals", icon: "Target" },
        { label: "Feedback", href: "/feedback", icon: "HeartHandshake" },
        { label: "Achievements", href: "/achievements", icon: "Trophy" },
        moduleItem("actions", "/actions", "Actions", "CheckCircle2"),
      ],
    },
    {
      label: "Connect",
      items: [moduleItem("messaging", "/messages", "Messaging", "MessageSquare"), { label: "Help", href: "/help", icon: "Bell" }],
    },
  ],
  PARENT: [
    {
      label: "Family",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
        moduleItem("students", "/children", "My Children", "Users"),
        moduleItem("calendar", "/today", "Today", "CalendarDays"),
        moduleItem("homework", "/homework", "Homework", "BookOpen"),
        moduleItem("performance", "/progress", "Progress", "BarChart3"),
        moduleItem("actions", "/actions", "Actions", "CheckCircle2"),
      ],
    },
    {
      label: "School",
      items: [moduleItem("messaging", "/messages", "Messaging", "MessageSquare"), moduleItem("reports", "/reports", "Reports", "FileText")],
    },
  ],
  NURSE: [
    {
      label: "Overview",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
        moduleItem("calendar", "/today", "Calendar", "CalendarDays"),
      ],
    },
    {
      label: "People & Administration",
      items: [moduleItem("students", "/students", "Students", "GraduationCap")],
    },
    {
      label: "Academic & Curriculum",
      items: [moduleItem("performance", "/progress", "Student Performance", "BarChart3")],
    },
    {
      label: "Operations & Campus",
      items: [
        moduleItem("attendance", "/attendance", "Attendance", "Clock"),
        moduleItem("observations", "/observations", "Observations", "ClipboardList"),
        moduleItem("actions", "/actions", "Actions", "CheckCircle2"),
      ],
    },
    {
      label: "Communication & Community",
      items: [moduleItem("messaging", "/messages", "Messaging", "MessageSquare")],
    },
    {
      label: "Finance & Reporting",
      items: [moduleItem("reports", "/reports", "Reports", "FileText")],
    },
  ],
  ADMIN: [
    {
      label: "Overview",
      items: [{ label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" }],
    },
    {
      label: "People & Administration",
      items: [
        moduleItem("establishments", "/school", "Establishments", "School"),
        moduleItem("students", "/students", "Students", "GraduationCap"),
        moduleItem("teachers", "/teachers", "Teachers", "Users"),
        moduleItem("classes", "/classes", "Classes", "LayoutGrid"),
      ],
    },
    {
      label: "Academic & Curriculum",
      items: [
        moduleItem("performance", "/progress", "Student Performance", "BarChart3"),
        moduleItem("homework", "/homework", "Homework", "BookOpen"),
        moduleItem("assessments", "/assessments", "Assessments", "FileText"),
        moduleItem("observations", "/observations", "Observations", "ClipboardList"),
        moduleItem("programs", "/modules/programs", "Programs", "Library"),
        moduleItem("levels", "/modules/levels", "Levels & Subjects", "Layers"),
      ],
    },
    {
      label: "Operations & Campus",
      items: [
        moduleItem("calendar", "/today", "Calendar", "CalendarDays"),
        moduleItem("attendance", "/attendance", "Attendance", "Clock"),
        moduleItem("actions", "/actions", "Actions", "CheckCircle2"),
        moduleItem("rules", "/modules/rules", "Internal Rules", "ScrollText"),
        moduleItem("canteen", "/modules/canteen", "Canteen", "Utensils"),
        moduleItem("transport", "/modules/transport", "Transport", "Bus"),
      ],
    },
    {
      label: "Communication & Community",
      items: [moduleItem("messaging", "/messages", "Messaging", "MessageSquare")],
    },
    {
      label: "Finance & Reporting",
      items: [
        moduleItem("finance", "/modules/finance", "Finance & Fees", "Wallet"),
        moduleItem("reports", "/reports", "Reports", "FileText"),
      ],
    },
    {
      label: "Platform",
      items: [
        moduleItem("configuration", "/configuration", "Configuration", "Settings"),
        moduleItem("permissions", "/permissions", "Modules & Permissions", "KeyRound"),
      ],
    },
  ],
  PRINCIPAL: [
    {
      label: "Executive",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
        moduleItem("calendar", "/today", "Calendar", "CalendarDays"),
        { label: "Live View", href: "/live", icon: "Clock" },
        { label: "Analytics", href: "/analytics", icon: "BarChart3" },
        moduleItem("reports", "/reports", "Reports", "FileText"),
      ],
    },
    {
      label: "People & Administration",
      items: [
        moduleItem("establishments", "/school", "Establishments", "School"),
        moduleItem("classes", "/classes", "Classes", "LayoutGrid"),
        moduleItem("students", "/students", "Students", "GraduationCap"),
        moduleItem("teachers", "/teachers", "Teachers", "Users"),
      ],
    },
    {
      label: "Academic & Curriculum",
      items: [
        moduleItem("performance", "/progress", "Student Performance", "BarChart3"),
        moduleItem("homework", "/homework", "Homework", "BookOpen"),
        moduleItem("assessments", "/assessments", "Assessments", "FileText"),
        moduleItem("observations", "/observations", "Observations", "ClipboardList"),
        moduleItem("programs", "/modules/programs", "Programs", "Library"),
        moduleItem("levels", "/modules/levels", "Levels & Subjects", "Layers"),
      ],
    },
    {
      label: "Operations & Campus",
      items: [
        moduleItem("attendance", "/attendance", "Attendance", "Clock"),
        moduleItem("actions", "/actions", "Actions", "CheckCircle2"),
        moduleItem("rules", "/modules/rules", "Internal Rules", "ScrollText"),
        moduleItem("canteen", "/modules/canteen", "Canteen", "Utensils"),
        moduleItem("transport", "/modules/transport", "Transport", "Bus"),
      ],
    },
    {
      label: "Communication & Community",
      items: [moduleItem("messaging", "/messages", "Messaging", "MessageSquare")],
    },
    {
      label: "Finance & Reporting",
      items: [
        moduleItem("finance", "/modules/finance", "Finance & Fees", "Wallet"),
      ],
    },
    {
      label: "Configuration",
      items: [
        moduleItem("configuration", "/configuration", "Configuration", "Settings"),
        moduleItem("permissions", "/permissions", "Modules & Permissions", "KeyRound"),
      ],
    },
  ],
  GROUP_MANAGER: [
    {
      label: "Overview",
      items: [{ label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" }],
    },
    {
      label: "People & Administration",
      items: [
        moduleItem("establishments", "/establishments", "Establishments", "School"),
      ],
    },
    {
      label: "Finance & Reporting",
      items: [moduleItem("reports", "/reports", "Reports", "FileText")],
    },
    {
      label: "Platform",
      items: [
        moduleItem("configuration", "/configuration", "Configuration", "Settings"),
        moduleItem("permissions", "/permissions", "Modules & Permissions", "KeyRound"),
      ],
    },
  ],
  SCHOOL_MANAGER: [
    {
      label: "Overview",
      items: [{ label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" }],
    },
    {
      label: "People & Administration",
      items: [
        moduleItem("establishments", "/school", "Establishments", "School"),
        moduleItem("students", "/students", "Students", "GraduationCap"),
        moduleItem("teachers", "/teachers", "Teachers", "Users"),
        moduleItem("classes", "/classes", "Classes", "LayoutGrid"),
      ],
    },
    {
      label: "Academic & Curriculum",
      items: [
        moduleItem("performance", "/progress", "Student Performance", "BarChart3"),
        moduleItem("homework", "/homework", "Homework", "BookOpen"),
        moduleItem("assessments", "/assessments", "Assessments", "FileText"),
        moduleItem("observations", "/observations", "Observations", "ClipboardList"),
        moduleItem("programs", "/modules/programs", "Programs", "Library"),
        moduleItem("levels", "/modules/levels", "Levels & Subjects", "Layers"),
      ],
    },
    {
      label: "Operations & Campus",
      items: [
        moduleItem("calendar", "/today", "Calendar", "CalendarDays"),
        moduleItem("attendance", "/attendance", "Attendance", "Clock"),
        moduleItem("actions", "/actions", "Actions", "CheckCircle2"),
        moduleItem("rules", "/modules/rules", "Internal Rules", "ScrollText"),
        moduleItem("canteen", "/modules/canteen", "Canteen", "Utensils"),
        moduleItem("transport", "/modules/transport", "Transport", "Bus"),
      ],
    },
    {
      label: "Communication & Community",
      items: [moduleItem("messaging", "/messages", "Messaging", "MessageSquare")],
    },
    {
      label: "Finance & Reporting",
      items: [
        moduleItem("finance", "/modules/finance", "Finance & Fees", "Wallet"),
        moduleItem("reports", "/reports", "Reports", "FileText"),
      ],
    },
    {
      label: "Platform",
      items: [
        moduleItem("configuration", "/configuration", "Configuration", "Settings"),
        moduleItem("permissions", "/permissions", "Modules & Permissions", "KeyRound"),
      ],
    },
  ],
  SUPER_ADMIN: [
    {
      label: "Overview",
      items: [{ label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" }],
    },
    {
      label: "People & Administration",
      items: [
        moduleItem("establishments", "/schools", "Establishments", "School"),
        moduleItem("students", "/students", "Students", "GraduationCap"),
        moduleItem("teachers", "/teachers", "Teachers", "Users"),
        moduleItem("classes", "/classes", "Classes", "LayoutGrid"),
      ],
    },
    {
      label: "Academic & Curriculum",
      items: [
        moduleItem("performance", "/progress", "Student Performance", "BarChart3"),
        moduleItem("homework", "/homework", "Homework", "BookOpen"),
        moduleItem("assessments", "/assessments", "Assessments", "FileText"),
        moduleItem("observations", "/observations", "Observations", "ClipboardList"),
        moduleItem("programs", "/modules/programs", "Programs", "Library"),
        moduleItem("levels", "/modules/levels", "Levels & Subjects", "Layers"),
      ],
    },
    {
      label: "Operations & Campus",
      items: [
        moduleItem("calendar", "/today", "Calendar", "CalendarDays"),
        moduleItem("attendance", "/attendance", "Attendance", "Clock"),
        moduleItem("actions", "/actions", "Actions", "CheckCircle2"),
        moduleItem("rules", "/modules/rules", "Internal Rules", "ScrollText"),
        moduleItem("canteen", "/modules/canteen", "Canteen", "Utensils"),
        moduleItem("transport", "/modules/transport", "Transport", "Bus"),
      ],
    },
    {
      label: "Communication & Community",
      items: [moduleItem("messaging", "/messages", "Messaging", "MessageSquare")],
    },
    {
      label: "Finance & Reporting",
      items: [
        moduleItem("finance", "/modules/finance", "Finance & Fees", "Wallet"),
        moduleItem("reports", "/reports", "Reports", "FileText"),
      ],
    },
    {
      label: "Platform",
      items: [
        { label: "Users", href: "/users", icon: "Users" },
        { label: "Copilot", href: "/copilot", icon: "BrainCircuit" },
        { label: "Audit Log", href: "/audit", icon: "FileText" },
        moduleItem("configuration", "/configuration", "Configuration", "Settings"),
        moduleItem("permissions", "/permissions", "Modules & Permissions", "KeyRound"),
      ],
    },
  ],
};/** Primary nav role: SUPER_ADMIN wins, otherwise the first role. */
function primaryRole(roles: RoleCode[]): RoleCode {
  return roles.includes("SUPER_ADMIN") ? "SUPER_ADMIN" : (roles[0] ?? "TEACHER");
}

export function navigationForRoles(roles: RoleCode[]): { label: string; items: NavSpec[] }[] {
  const primary = primaryRole(roles);
  const accessible = new Set(accessibleModules(roles).map((m) => m.code));
  const groups = (ROLE_NAV[primary] ?? ROLE_NAV.TEACHER)
    .map((group) => ({
      label: group.label,
      items: group.items
        .filter((item) => !item.module || accessible.has(item.module))
        .map((item): NavSpec => ({ label: item.label, href: item.href, icon: item.icon })),
    }))
    .filter((group) => group.items.length > 0);
  return groups;
}

export function resolveNavGroups(groups: { label: string; items: NavSpec[] }[]): { label: string; items: NavItem[] }[] {
  return groups.map((g) => ({
    label: g.label,
    items: g.items.map((i) => ({ ...i, icon: iconMap[i.icon] })),
  }));
}
