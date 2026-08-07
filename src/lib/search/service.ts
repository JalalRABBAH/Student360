/**
 * STUDENT360 — Global search service.
 *
 * Scoped by the caller's RBAC profile (same helpers as every other read path):
 * students are limited to the caller's student scope, classes to the caller's
 * accessible class ids, teachers to the caller's school (or the platform for
 * SUPER_ADMIN). Nothing in here trusts the client.
 */

import { prisma } from "@/lib/db";
import {
  accessibleClassIds,
  canAccessClass,
  canAccessStudent,
  resolveStudentScope,
  studentScopeWhere,
} from "@/lib/auth/rbac";
import type { SessionPayload } from "@/lib/auth/session";

export type SearchResult = {
  id: string;
  kind: "student" | "class" | "teacher";
  label: string;
  meta: string;
  href: string;
};

function nameOr(term: string) {
  const contains = { contains: term };
  return {
    OR: [{ firstName: contains }, { lastName: contains }],
  };
}

export async function searchAll(session: SessionPayload, q: string, limit = 5): Promise<SearchResult[]> {
  const term = q.trim().toLowerCase();
  if (!term) return [];
  const results: SearchResult[] = [];

  // ---- Students (caller's student scope) ----
  const scope = await resolveStudentScope(session);
  if (scope.kind !== "NONE") {
    const students = await prisma.student.findMany({
      where: {
        status: "ACTIVE",
        ...studentScopeWhere(scope),
        user: { is: nameOr(term) },
      },
      select: {
        id: true,
        user: { select: { firstName: true, lastName: true } },
        currentClass: { select: { name: true } },
      },
      orderBy: [{ user: { lastName: "asc" } }, { user: { firstName: "asc" } }],
      take: limit,
    });
    for (const student of students) {
      results.push({
        id: student.id,
        kind: "student",
        label: `${student.user.firstName} ${student.user.lastName}`,
        meta: student.currentClass?.name ?? "—",
        href: `/students/${student.id}`,
      });
    }
  }

  // ---- Classes (caller's accessible classes) ----
  const classIds = await accessibleClassIds(session);
  if (classIds.length || classIds === "ALL") {
    const classes = await prisma.schoolClass.findMany({
      where: {
        ...(classIds === "ALL" ? {} : { id: { in: classIds } }),
        OR: [{ name: { contains: term } }, { gradeLevel: { contains: term } }],
      },
      select: { id: true, name: true, gradeLevel: true },
      orderBy: [{ gradeOrder: "asc" }],
      take: limit,
    });
    for (const schoolClass of classes) {
      results.push({
        id: schoolClass.id,
        kind: "class",
        label: schoolClass.name,
        meta: schoolClass.gradeLevel,
        href: `/classes/${schoolClass.id}`,
      });
    }
  }

  // ---- Teachers (own school, or platform for SUPER_ADMIN) ----
  const teachers = await prisma.teacher.findMany({
    where: {
      status: "ACTIVE",
      ...(session.schoolId ? { schoolId: session.schoolId } : {}),
      user: { is: nameOr(term) },
    },
    select: {
      id: true,
      user: { select: { firstName: true, lastName: true } },
    },
    orderBy: [{ user: { lastName: "asc" } }, { user: { firstName: "asc" } }],
    take: limit,
  });
  for (const teacher of teachers) {
    results.push({
      id: teacher.id,
      kind: "teacher",
      label: `${teacher.user.firstName} ${teacher.user.lastName}`,
      meta: "Teacher",
      href: "/teachers",
    });
  }

  return results;
}

/** Resolve a single resource name for the top-bar breadcrumb (RBAC-scoped). */
export async function resolveResourceName(
  session: SessionPayload,
  type: "students" | "classes",
  id: string,
): Promise<string | null> {
  if (type === "students") {
    const allowed = await canAccessStudent(session, id);
    if (!allowed) return null;
    const student = await prisma.student.findUnique({
      where: { id },
      select: { user: { select: { firstName: true, lastName: true } } },
    });
    return student ? `${student.user.firstName} ${student.user.lastName}` : null;
  }
  const allowed = await canAccessClass(session, id);
  if (!allowed) return null;
  const schoolClass = await prisma.schoolClass.findUnique({
    where: { id },
    select: { gradeLevel: true, name: true },
  });
  return schoolClass ? `${schoolClass.gradeLevel} ${schoolClass.name}`.trim() : null;
}
