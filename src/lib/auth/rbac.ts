/**
 * STUDENT360 — Role Based Access Control & student data scoping.
 *
 * Privacy by design. Because the platform stores data about minors, every
 * read/write path goes through one of the helpers below. Nothing in the UI is
 * trusted: server components and API routes both resolve the caller's scope
 * against the database.
 */

import { prisma } from "@/lib/db";
import { LEADERSHIP_ROLES, ROLES, type RoleCode, STAFF_ROLES } from "@/lib/domain/enums";
import type { SessionPayload } from "@/lib/auth/session";

// ---------------------------------------------------------------------------
// Capabilities
// ---------------------------------------------------------------------------

export const CAPABILITIES = [
  "student:read",
  "student:read_wellbeing",
  "student:read_restricted_wellbeing",
  "student:write_checkin",
  "student:manage",
  "class:read",
  "class:manage",
  "attendance:write",
  "homework:write",
  "homework:submit",
  "observation:write",
  "assessment:write",
  "goal:write",
  "intervention:write",
  "achievement:write",
  "parentinput:write",
  "message:write",
  "alert:manage",
  "medical:read",
  "medical:manage",
  "student:read_emergency",
  "discipline:read",
  "discipline:write",
  "rating:write",
  "analytics:school",
  "analytics:class",
  "reports:export",
  "copilot:use",
  "school:configure",
  "establishment:manage",
  "tenant:manage",
  "audit:read",
] as const;

export type Capability = (typeof CAPABILITIES)[number];

const ROLE_CAPABILITIES: Record<RoleCode, Capability[]> = {
  STUDENT: ["student:read", "student:read_wellbeing", "student:write_checkin", "homework:submit", "goal:write", "message:write"],
  PARENT: ["student:read", "student:read_wellbeing", "parentinput:write", "message:write"],
  NURSE: [
    "student:read",
    "student:read_wellbeing",
    "medical:read",
    "medical:manage",
    "student:read_emergency",
    "message:write",
    "reports:export",
  ],
  TEACHER: [
    "student:read",
    "student:read_wellbeing",
    "student:read_emergency",
    "class:read",
    "attendance:write",
    "homework:write",
    "observation:write",
    "assessment:write",
    "goal:write",
    "intervention:write",
    "achievement:write",
    "message:write",
    "alert:manage",
    "discipline:read",
    "rating:write",
    "analytics:class",
    "reports:export",
    "copilot:use",
  ],
  ADMIN: [
    "student:read",
    "student:read_wellbeing",
    "student:read_emergency",
    "student:manage",
    "class:read",
    "class:manage",
    "attendance:write",
    "homework:write",
    "observation:write",
    "assessment:write",
    "goal:write",
    "intervention:write",
    "achievement:write",
    "message:write",
    "alert:manage",
    "medical:read",
    "medical:manage",
    "discipline:read",
    "discipline:write",
    "rating:write",
    "analytics:class",
    "analytics:school",
    "reports:export",
    "copilot:use",
    "school:configure",
    "audit:read",
  ],
  PRINCIPAL: [
    "student:read",
    "student:read_wellbeing",
    "student:read_restricted_wellbeing",
    "student:read_emergency",
    "student:manage",
    "class:read",
    "class:manage",
    "attendance:write",
    "homework:write",
    "observation:write",
    "assessment:write",
    "goal:write",
    "intervention:write",
    "achievement:write",
    "message:write",
    "alert:manage",
    "medical:read",
    "medical:manage",
    "discipline:read",
    "discipline:write",
    "rating:write",
    "analytics:class",
    "analytics:school",
    "reports:export",
    "copilot:use",
    "school:configure",
    "audit:read",
  ],
  SCHOOL_MANAGER: [
    "student:read",
    "student:read_wellbeing",
    "student:read_emergency",
    "student:manage",
    "class:read",
    "class:manage",
    "attendance:write",
    "homework:write",
    "observation:write",
    "assessment:write",
    "goal:write",
    "intervention:write",
    "achievement:write",
    "message:write",
    "alert:manage",
    "medical:read",
    "medical:manage",
    "discipline:read",
    "discipline:write",
    "rating:write",
    "analytics:class",
    "analytics:school",
    "reports:export",
    "copilot:use",
    "school:configure",
    "establishment:manage",
    "audit:read",
  ],
  SUPER_ADMIN: [...CAPABILITIES],
};

export function capabilitiesFor(roles: RoleCode[]): Set<Capability> {
  const set = new Set<Capability>();
  roles.forEach((role) => ROLE_CAPABILITIES[role]?.forEach((c) => set.add(c)));
  return set;
}

export function can(session: Pick<SessionPayload, "roles">, capability: Capability) {
  return capabilitiesFor(session.roles).has(capability);
}

export function isStaff(session: Pick<SessionPayload, "roles">) {
  return session.roles.some((r) => STAFF_ROLES.includes(r));
}

export function isLeadership(session: Pick<SessionPayload, "roles">) {
  return session.roles.some((r) => LEADERSHIP_ROLES.includes(r));
}

export function hasRole(session: Pick<SessionPayload, "roles">, role: RoleCode) {
  return session.roles.includes(role);
}

// ---------------------------------------------------------------------------
// Student scoping
// ---------------------------------------------------------------------------

export type StudentScope =
  | { kind: "ALL_SCHOOL"; schoolId: string }
  | { kind: "PLATFORM" }
  | { kind: "STUDENT_IDS"; studentIds: string[] }
  | { kind: "NONE" };

/**
 * Resolve which students the caller may see.
 * - SUPER_ADMIN → every tenant
 * - ADMIN / PRINCIPAL → their whole school
 * - TEACHER → students enrolled in the classes they are assigned to (+ advisees)
 * - PARENT → only linked children
 * - STUDENT → only themselves
 */
export async function resolveStudentScope(session: SessionPayload): Promise<StudentScope> {
  if (hasRole(session, ROLES.SUPER_ADMIN)) return { kind: "PLATFORM" };

  if (isLeadership(session) && session.schoolId) {
    return { kind: "ALL_SCHOOL", schoolId: session.schoolId };
  }

  // The school nurse covers the whole school for medical & wellbeing purposes.
  if (hasRole(session, ROLES.NURSE) && session.schoolId) {
    return { kind: "ALL_SCHOOL", schoolId: session.schoolId };
  }

  if (hasRole(session, ROLES.TEACHER) && session.teacherId) {
    const assignments = await prisma.teacherClassAssignment.findMany({
      where: { teacherId: session.teacherId },
      select: { classId: true },
    });
    const classIds = assignments.map((a) => a.classId);
    const enrollments = await prisma.enrollment.findMany({
      where: { classId: { in: classIds }, status: "ACTIVE" },
      select: { studentId: true },
    });
    const advised = await prisma.student.findMany({
      where: { advisorTeacherId: session.teacherId },
      select: { id: true },
    });
    const ids = new Set<string>([...enrollments.map((e) => e.studentId), ...advised.map((s) => s.id)]);
    return { kind: "STUDENT_IDS", studentIds: [...ids] };
  }

  if (hasRole(session, ROLES.PARENT) && session.guardianId) {
    const links = await prisma.parentStudentRelationship.findMany({
      where: { guardianId: session.guardianId },
      select: { studentId: true },
    });
    return { kind: "STUDENT_IDS", studentIds: links.map((l) => l.studentId) };
  }

  if (hasRole(session, ROLES.STUDENT) && session.studentId) {
    return { kind: "STUDENT_IDS", studentIds: [session.studentId] };
  }

  return { kind: "NONE" };
}

/** Prisma `where` fragment restricting a Student query to the caller's scope. */
export function studentScopeWhere(scope: StudentScope) {
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

export async function canAccessStudent(session: SessionPayload, studentId: string) {
  const scope = await resolveStudentScope(session);
  if (scope.kind === "PLATFORM") return true;
  if (scope.kind === "ALL_SCHOOL") {
    const student = await prisma.student.findFirst({
      where: { id: studentId, schoolId: scope.schoolId },
      select: { id: true },
    });
    return Boolean(student);
  }
  if (scope.kind === "STUDENT_IDS") return scope.studentIds.includes(studentId);
  return false;
}

export async function accessibleClassIds(session: SessionPayload): Promise<string[] | "ALL"> {
  if (hasRole(session, ROLES.SUPER_ADMIN)) return "ALL";
  if (isLeadership(session) && session.schoolId) {
    const classes = await prisma.schoolClass.findMany({
      where: { schoolId: session.schoolId },
      select: { id: true },
    });
    return classes.map((c) => c.id);
  }
  if (hasRole(session, ROLES.TEACHER) && session.teacherId) {
    const assignments = await prisma.teacherClassAssignment.findMany({
      where: { teacherId: session.teacherId },
      select: { classId: true },
    });
    return [...new Set(assignments.map((a) => a.classId))];
  }
  if (hasRole(session, ROLES.STUDENT) && session.studentId) {
    const student = await prisma.student.findUnique({
      where: { id: session.studentId },
      select: { currentClassId: true },
    });
    return student?.currentClassId ? [student.currentClassId] : [];
  }
  if (hasRole(session, ROLES.PARENT) && session.guardianId) {
    const links = await prisma.parentStudentRelationship.findMany({
      where: { guardianId: session.guardianId },
      select: { student: { select: { currentClassId: true } } },
    });
    return links.map((l) => l.student.currentClassId).filter((v): v is string => Boolean(v));
  }
  return [];
}

export async function canAccessClass(session: SessionPayload, classId: string) {
  const ids = await accessibleClassIds(session);
  return ids === "ALL" || ids.includes(classId);
}

/**
 * Whether the caller may manage a given establishment (school group manager,
 * delegated admin/principal, own school, or platform admin).
 */
export async function canManageSchool(session: SessionPayload, schoolId: string) {
  if (hasRole(session, ROLES.SUPER_ADMIN)) return true;
  if (session.schoolId === schoolId) return true;
  const row = await prisma.establishmentAccess.findFirst({
    where: { userId: session.sub, schoolId },
    select: { id: true },
  });
  return Boolean(row);
}

// ---------------------------------------------------------------------------
// Visibility filtering
// ---------------------------------------------------------------------------

/**
 * Which record visibilities the caller is allowed to read for a given student.
 * Restricted wellbeing entries (`STUDENT_ONLY`) are never surfaced to anyone
 * but the student themself.
 */
export function visibilityFilterFor(
  session: SessionPayload,
  opts: {
    studentId?: string;
    category?: "observation" | "wellbeing";
    parentPermissions?: { canViewWellbeing?: boolean; canViewObservations?: boolean };
  } = {},
): string[] {
  if (hasRole(session, ROLES.STUDENT) && session.studentId === opts.studentId) {
    return ["STUDENT_ONLY", "INCLUDING_STUDENT", "INCLUDING_PARENTS", "PARTICIPANTS"];
  }
  if (hasRole(session, ROLES.PARENT)) {
    const visibility = ["PARTICIPANTS"];
    const canViewShared =
      opts.category === "observation"
        ? opts.parentPermissions?.canViewObservations
        : opts.category === "wellbeing"
          ? opts.parentPermissions?.canViewWellbeing
          : false;
    if (canViewShared) {
      visibility.push("INCLUDING_PARENTS");
    }
    return visibility;
  }
  if (hasRole(session, ROLES.TEACHER) || hasRole(session, ROLES.NURSE)) {
    return ["TEACHER_ONLY", "SCHOOL_STAFF", "INCLUDING_STUDENT", "INCLUDING_PARENTS", "PARTICIPANTS"];
  }
  if (isLeadership(session)) {
    return ["SCHOOL_STAFF", "INCLUDING_STUDENT", "INCLUDING_PARENTS", "PARTICIPANTS", "TEACHER_ONLY"];
  }
  return ["INCLUDING_PARENTS"];
}

/** Parent-specific per-child data permissions. */
export async function parentPermissionsFor(session: SessionPayload, studentId: string) {
  if (!session.guardianId) return null;
  return prisma.parentStudentRelationship.findFirst({
    where: { guardianId: session.guardianId, studentId },
  });
}
