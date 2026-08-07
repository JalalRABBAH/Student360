import {
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
  Bell,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import type { NavItem } from "@/components/sidebar-item";
import type { RoleCode } from "@/lib/domain/enums";

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
  | "Bell"
  | "CheckCircle2";

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
  Bell,
  CheckCircle2,
};

type NavSpec = { label: string; href: string; icon: IconName; badge?: number | string };

export const navGroups: Record<RoleCode, { label: string; items: NavSpec[] }[]> = {
  TEACHER: [
    {
      label: "Overview",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
        { label: "Today", href: "/today", icon: "CalendarDays" },
        { label: "My Classes", href: "/classes", icon: "School" },
        { label: "Students", href: "/students", icon: "GraduationCap" },
        { label: "Actions", href: "/actions", icon: "CheckCircle2" },
      ],
    },
    {
      label: "Work",
      items: [
        { label: "Homework", href: "/homework", icon: "BookOpen" },
        { label: "Observations", href: "/observations", icon: "ClipboardList" },
        { label: "Assessments", href: "/assessments", icon: "FileText" },
        { label: "Attendance", href: "/attendance", icon: "Clock" },
      ],
    },
    {
      label: "Review",
      items: [
        { label: "Weekly Review", href: "/weekly-review", icon: "Sparkles" },
        { label: "Analytics", href: "/analytics", icon: "BarChart3" },
        { label: "Messages", href: "/messages", icon: "MessageSquare" },
      ],
    },
  ],
  STUDENT: [
    {
      label: "My day",
      items: [
        { label: "My Day", href: "/dashboard", icon: "LayoutDashboard" },
        { label: "My Progress", href: "/progress", icon: "BarChart3" },
        { label: "Homework", href: "/homework", icon: "BookOpen" },
        { label: "Goals", href: "/goals", icon: "Target" },
        { label: "Feedback", href: "/feedback", icon: "HeartHandshake" },
        { label: "Achievements", href: "/achievements", icon: "Trophy" },
        { label: "Actions", href: "/actions", icon: "CheckCircle2" },
      ],
    },
    {
      label: "Connect",
      items: [
        { label: "Messages", href: "/messages", icon: "MessageSquare" },
        { label: "Help", href: "/help", icon: "Bell" },
      ],
    },
  ],
  PARENT: [
    {
      label: "Family",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
        { label: "My Children", href: "/children", icon: "Users" },
        { label: "Today", href: "/today", icon: "CalendarDays" },
        { label: "Homework", href: "/homework", icon: "BookOpen" },
        { label: "Progress", href: "/progress", icon: "BarChart3" },
        { label: "Actions", href: "/actions", icon: "CheckCircle2" },
      ],
    },
    {
      label: "School",
      items: [
        { label: "Messages", href: "/messages", icon: "MessageSquare" },
        { label: "Reports", href: "/reports", icon: "FileText" },
      ],
    },
  ],
  NURSE: [
    {
      label: "Overview",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
        { label: "Students", href: "/students", icon: "GraduationCap" },
        { label: "Today", href: "/today", icon: "CalendarDays" },
      ],
    },
    {
      label: "Care",
      items: [
        { label: "Health", href: "/health", icon: "HeartHandshake" },
        { label: "Messages", href: "/messages", icon: "MessageSquare" },
      ],
    },
  ],
  ADMIN: [
    {
      label: "School",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
        { label: "School", href: "/school", icon: "School" },
        { label: "Classes", href: "/classes", icon: "Users" },
        { label: "Students", href: "/students", icon: "GraduationCap" },
        { label: "Teachers", href: "/teachers", icon: "BookOpen" },
        { label: "Actions", href: "/actions", icon: "CheckCircle2" },
      ],
    },
    {
      label: "Operations",
      items: [
        { label: "Analytics", href: "/analytics", icon: "BarChart3" },
        { label: "Attendance", href: "/attendance", icon: "Clock" },
        { label: "Reports", href: "/reports", icon: "FileText" },
        { label: "Messages", href: "/messages", icon: "MessageSquare" },
      ],
    },
    {
      label: "Configuration",
      items: [{ label: "Configuration", href: "/configuration", icon: "Settings" }],
    },
  ],
  PRINCIPAL: [
    {
      label: "Executive",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
        { label: "School", href: "/school", icon: "School" },
        { label: "Live View", href: "/live", icon: "Clock" },
        { label: "Analytics", href: "/analytics", icon: "BarChart3" },
        { label: "Reports", href: "/reports", icon: "FileText" },
      ],
    },
    {
      label: "People",
      items: [
        { label: "Classes", href: "/classes", icon: "Users" },
        { label: "Students", href: "/students", icon: "GraduationCap" },
        { label: "Teachers", href: "/teachers", icon: "BookOpen" },
        { label: "Actions", href: "/actions", icon: "CheckCircle2" },
        { label: "Messages", href: "/messages", icon: "MessageSquare" },
      ],
    },
    {
      label: "Configuration",
      items: [{ label: "Configuration", href: "/configuration", icon: "Settings" }],
    },
  ],
  SUPER_ADMIN: [
    {
      label: "Platform",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
        { label: "Schools", href: "/schools", icon: "School" },
        { label: "Users", href: "/users", icon: "Users" },
        { label: "Copilot", href: "/copilot", icon: "BrainCircuit" },
        { label: "Audit Log", href: "/audit", icon: "FileText" },
      ],
    },
  ],
};

export function navigationForRoles(roles: RoleCode[]): { label: string; items: NavSpec[] }[] {
  const primary = roles.includes("SUPER_ADMIN") ? "SUPER_ADMIN" : (roles[0] ?? "TEACHER");
  return navGroups[primary] ?? navGroups.TEACHER;
}

export function resolveNavGroups(groups: { label: string; items: NavSpec[] }[]): { label: string; items: NavItem[] }[] {
  return groups.map((g) => ({
    label: g.label,
    items: g.items.map((i) => ({ ...i, icon: iconMap[i.icon] })),
  }));
}

export type { NavSpec };
