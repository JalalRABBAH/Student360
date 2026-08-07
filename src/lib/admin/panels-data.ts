/**
 * STUDENT360 — Admin panels data (dropdown options for the create forms).
 */

import { prisma } from "@/lib/db";
import { can } from "@/lib/auth/rbac";
import type { SessionPayload } from "@/lib/auth/session";

export type AdminPanelsData = {
  canManage: boolean;
  classes: { id: string; name: string }[];
  students: { id: string; name: string }[];
  teachers: { id: string; name: string }[];
  subjects: { id: string; name: string; code: string }[];
  assignments: {
    id: string;
    className: string;
    teacherName: string;
    subjectName: string | null;
    role: string;
    isHomeroom: boolean;
  }[];
};

export async function adminPanelsData(session: SessionPayload): Promise<AdminPanelsData> {
  const schoolId = session.schoolId;
  const canManage = Boolean(schoolId && (can(session, "student:manage") || can(session, "class:manage")));
  if (!schoolId || !canManage) {
    return { canManage: false, classes: [], students: [], teachers: [], subjects: [], assignments: [] };
  }

  const [classes, students, teachers, subjects, assignments] = await Promise.all([
    prisma.schoolClass.findMany({ where: { schoolId }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.student.findMany({
      where: { schoolId, status: "ACTIVE" },
      select: { id: true, user: { select: { firstName: true, lastName: true } } },
      orderBy: { user: { lastName: "asc" } },
    }),
    prisma.teacher.findMany({
      where: { schoolId, status: "ACTIVE" },
      select: { id: true, user: { select: { firstName: true, lastName: true } } },
      orderBy: { user: { lastName: "asc" } },
    }),
    prisma.subject.findMany({ where: { schoolId, isActive: true }, select: { id: true, name: true, code: true }, orderBy: { order: "asc" } }),
    prisma.teacherClassAssignment.findMany({
      where: { class: { schoolId } },
      select: {
        id: true,
        isHomeroom: true,
        role: true,
        class: { select: { name: true } },
        teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
        subject: { select: { name: true } },
      },
      orderBy: [{ class: { name: "asc" } }, { teacher: { user: { lastName: "asc" } } }],
    }),
  ]);

  return {
    canManage: true,
    classes: classes.map((c) => ({ id: c.id, name: c.name })),
    students: students.map((s) => ({ id: s.id, name: `${s.user.firstName} ${s.user.lastName}` })),
    teachers: teachers.map((t) => ({ id: t.id, name: `${t.user.firstName} ${t.user.lastName}` })),
    subjects: subjects.map((s) => ({ id: s.id, name: s.name, code: s.code })),
    assignments: assignments.map((a) => ({
      id: a.id,
      className: a.class.name,
      teacherName: `${a.teacher.user.firstName} ${a.teacher.user.lastName}`,
      subjectName: a.subject?.name ?? null,
      role: a.role,
      isHomeroom: a.isHomeroom,
    })),
  };
}

export type AdminClassDetail = {
  canManage: boolean;
  subjects: { id: string; name: string; code: string }[];
  teachers: { id: string; name: string }[];
  slots: {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room: string | null;
    subjectName: string | null;
    teacherName: string | null;
  }[];
};

export async function adminClassDetailData(session: SessionPayload, classId: string): Promise<AdminClassDetail> {
  const schoolId = session.schoolId;
  const canManage = Boolean(schoolId && can(session, "class:manage"));
  if (!schoolId || !canManage) {
    return { canManage: false, subjects: [], teachers: [], slots: [] };
  }
  const [subjects, teachers, slots] = await Promise.all([
    prisma.subject.findMany({ where: { schoolId, isActive: true }, select: { id: true, name: true, code: true }, orderBy: { order: "asc" } }),
    prisma.teacher.findMany({
      where: { schoolId, status: "ACTIVE" },
      select: { id: true, user: { select: { firstName: true, lastName: true } } },
      orderBy: { user: { lastName: "asc" } },
    }),
    prisma.timetableSlot.findMany({
      where: { classId },
      select: {
        id: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        room: true,
        subject: { select: { name: true } },
        teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
  ]);

  return {
    canManage: true,
    subjects: subjects.map((s) => ({ id: s.id, name: s.name, code: s.code })),
    teachers: teachers.map((t) => ({ id: t.id, name: `${t.user.firstName} ${t.user.lastName}` })),
    slots: slots.map((slot) => ({
      id: slot.id,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      room: slot.room,
      subjectName: slot.subject?.name ?? null,
      teacherName: slot.teacher ? `${slot.teacher.user.firstName} ${slot.teacher.user.lastName}` : null,
    })),
  };
}
