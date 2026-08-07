/**
 * STUDENT360 — Administration service (socle admin).
 *
 * Creates students, guardians, teachers, classes, teacher assignments and
 * timetable slots. Every mutation is guarded by `student:manage` /
 * `class:manage` capabilities and scoped to the caller's school. New accounts
 * receive a generated temporary password that is returned ONCE to the admin.
 */

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import type { SessionPayload } from "@/lib/auth/session";
import { can, hasRole } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/domain/enums";
import { audit } from "@/lib/auth/audit";

// ---------------------------------------------------------------------------
// Guards & helpers
// ---------------------------------------------------------------------------

function requireSchool(session: SessionPayload) {
  if (!session.schoolId) throw new Error("FORBIDDEN");
  if (!can(session, "student:manage") && !can(session, "class:manage")) throw new Error("FORBIDDEN");
  return session.schoolId;
}

function requireClassManage(session: SessionPayload) {
  if (!session.schoolId) throw new Error("FORBIDDEN");
  if (!can(session, "class:manage")) throw new Error("FORBIDDEN");
  return session.schoolId;
}

export function generateTemporaryPassword() {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `Init-${suffix}`;
}

async function currentAcademicYear(schoolId: string) {
  const year = await prisma.academicYear.findFirst({
    where: { schoolId, isCurrent: true },
    select: { id: true },
  });
  if (!year) throw new Error("NO_ACADEMIC_YEAR");
  return year.id;
}

async function nextSequenceNumber(schoolId: string, prefix: string) {
  const count = await prisma.user.count({ where: { schoolId } });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}

function isUniqueViolation(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

type CreatedAccount = { userId: string; email: string; firstName: string; lastName: string; temporaryPassword: string };

// ---------------------------------------------------------------------------
// Students (with linked guardians)
// ---------------------------------------------------------------------------

export type CreateStudentInput = {
  firstName: string;
  lastName: string;
  email: string;
  classId?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  studentNumber?: string | null;
  guardians?: Array<{
    firstName: string;
    lastName: string;
    email: string;
    relationship?: string;
    isPrimary?: boolean;
  }>;
};

export async function createStudent(session: SessionPayload, input: CreateStudentInput): Promise<CreatedAccount> {
  const schoolId = requireSchool(session);
  if (!input.firstName?.trim() || !input.lastName?.trim() || !input.email?.trim()) throw new Error("INVALID");

  const studentNumber = input.studentNumber?.trim() || (await nextSequenceNumber(schoolId, "STD"));
  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  let classRecord: { id: string } | null = null;
  if (input.classId) {
    classRecord = await prisma.schoolClass.findFirst({
      where: { id: input.classId, schoolId },
      select: { id: true },
    });
    if (!classRecord) throw new Error("NOT_FOUND");
  }

  let userId: string;
  let studentId: string;
  try {
    const user = await prisma.user.create({
      data: {
        schoolId,
        email: input.email.trim().toLowerCase(),
        passwordHash,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        locale: "en",
        theme: "dark",
        isActive: true,
        mustReset: true,
        roles: { create: { roleCode: ROLES.STUDENT, schoolId } },
        student: {
          create: {
            schoolId,
            studentNumber,
            dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
            gender: input.gender || null,
            currentClassId: classRecord?.id ?? null,
            enrolledAt: new Date(),
            status: "ACTIVE",
          },
        },
      },
      select: { id: true, student: { select: { id: true } } },
    });
    userId = user.id;
    studentId = user.student!.id;
  } catch (error) {
    if (isUniqueViolation(error)) throw new Error("EMAIL_TAKEN");
    throw error;
  }

  if (classRecord) {
    const yearId = await currentAcademicYear(schoolId);
    await prisma.enrollment.create({
      data: { studentId, classId: classRecord.id, academicYearId: yearId, status: "ACTIVE", joinedAt: new Date() },
    });
  }

  const guardians: CreatedAccount[] = [];
  for (const g of input.guardians ?? []) {
    if (!g.email?.trim() || !g.firstName?.trim() || !g.lastName?.trim()) continue;
    guardians.push(await createGuardianAndLink(session, schoolId, studentId, {
      firstName: g.firstName,
      lastName: g.lastName,
      email: g.email,
      relationship: g.relationship,
      isPrimary: g.isPrimary,
    }));
  }

  await audit(session, {
    action: "STUDENT.CREATED",
    entityType: "Student",
    entityId: studentId,
    studentId,
    metadata: { studentNumber, classId: input.classId ?? null, guardians: guardians.length },
  });

  return { userId, email: input.email.trim().toLowerCase(), firstName: input.firstName.trim(), lastName: input.lastName.trim(), temporaryPassword };
}

export async function createGuardianAndLink(
  session: SessionPayload,
  schoolId: string,
  studentRowId: string,
  input: { firstName: string; lastName: string; email: string; relationship?: string; isPrimary?: boolean },
): Promise<CreatedAccount> {
  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  const user = await prisma.user.create({
    data: {
      schoolId,
      email: input.email.trim().toLowerCase(),
      passwordHash,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      locale: "en",
      theme: "light",
      isActive: true,
      mustReset: true,
      roles: { create: { roleCode: ROLES.PARENT, schoolId } },
      guardian: { create: { schoolId, preferredContact: "EMAIL", status: "ACTIVE" } },
    },
    select: { id: true, email: true, guardian: { select: { id: true } } },
  }).catch((error) => {
    if (isUniqueViolation(error)) throw new Error("EMAIL_TAKEN");
    throw error;
  });

  const guardianId = user.guardian!.id;

  await prisma.parentStudentRelationship.create({
    data: {
      guardianId,
      studentId: studentRowId,
      relationship: input.relationship || "PARENT",
      isPrimary: input.isPrimary ?? false,
    },
  });

  await audit(session, {
    action: "GUARDIAN.CREATED",
    entityType: "Guardian",
    entityId: guardianId,
    studentId: studentRowId,
    metadata: { relationship: input.relationship || "PARENT" },
  });

  return { userId: user.id, email: user.email, firstName: input.firstName.trim(), lastName: input.lastName.trim(), temporaryPassword };
}

// ---------------------------------------------------------------------------
// Parents (standalone, then linked to children)
// ---------------------------------------------------------------------------

export type CreateParentInput = {
  firstName: string;
  lastName: string;
  email: string;
  studentIds?: string[];
  relationship?: string;
};

export async function createParent(session: SessionPayload, input: CreateParentInput): Promise<CreatedAccount & { guardianId: string }> {
  const schoolId = requireSchool(session);
  if (!input.firstName?.trim() || !input.lastName?.trim() || !input.email?.trim()) throw new Error("INVALID");

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  const user = await prisma.user.create({
    data: {
      schoolId,
      email: input.email.trim().toLowerCase(),
      passwordHash,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      locale: "en",
      theme: "light",
      isActive: true,
      mustReset: true,
      roles: { create: { roleCode: ROLES.PARENT, schoolId } },
      guardian: { create: { schoolId, preferredContact: "EMAIL", status: "ACTIVE" } },
    },
    select: { id: true, email: true, guardian: { select: { id: true } } },
  }).catch((error) => {
    if (isUniqueViolation(error)) throw new Error("EMAIL_TAKEN");
    throw error;
  });

  const guardianId = user.guardian!.id;

  let linked = 0;
  for (const studentId of input.studentIds ?? []) {
    const student = await prisma.student.findFirst({
      where: { id: studentId, schoolId },
      select: { id: true },
    });
    if (!student) continue;
    await prisma.parentStudentRelationship.create({
      data: { guardianId, studentId: student.id, relationship: input.relationship || "PARENT", isPrimary: false },
    });
    linked += 1;
  }

  await audit(session, { action: "PARENT.CREATED", entityType: "Guardian", entityId: guardianId, metadata: { linked } });

  return { userId: user.id, guardianId, email: user.email, firstName: input.firstName.trim(), lastName: input.lastName.trim(), temporaryPassword };
}

// ---------------------------------------------------------------------------
// Teachers
// ---------------------------------------------------------------------------

export type CreateTeacherInput = {
  firstName: string;
  lastName: string;
  email: string;
  title?: string;
  specialtyCode?: string | null;
  classIds?: string[];
};

export async function createTeacher(session: SessionPayload, input: CreateTeacherInput): Promise<CreatedAccount> {
  const schoolId = requireSchool(session);
  if (!input.firstName?.trim() || !input.lastName?.trim() || !input.email?.trim()) throw new Error("INVALID");

  const employeeNumber = await nextSequenceNumber(schoolId, "EMP");
  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  const user = await prisma.user.create({
    data: {
      schoolId,
      email: input.email.trim().toLowerCase(),
      passwordHash,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      locale: "en",
      theme: "dark",
      isActive: true,
      mustReset: true,
      roles: { create: { roleCode: ROLES.TEACHER, schoolId } },
      teacher: { create: { schoolId, employeeNumber, title: input.title || "Mr.", specialties: input.specialtyCode || null, status: "ACTIVE" } },
    },
    select: { id: true, email: true, teacher: { select: { id: true } } },
  }).catch((error) => {
    if (isUniqueViolation(error)) throw new Error("EMAIL_TAKEN");
    throw error;
  });

  const teacherId = user.teacher!.id;

  for (const classId of input.classIds ?? []) {
    const cls = await prisma.schoolClass.findFirst({ where: { id: classId, schoolId }, select: { id: true } });
    if (!cls) continue;
    await prisma.teacherClassAssignment.create({
      data: { teacherId, classId: cls.id, isHomeroom: false, role: "SUBJECT_TEACHER" },
    });
  }

  await audit(session, { action: "TEACHER.CREATED", entityType: "Teacher", entityId: teacherId, metadata: { employeeNumber, classes: (input.classIds ?? []).length } });

  return { userId: user.id, email: user.email, firstName: input.firstName.trim(), lastName: input.lastName.trim(), temporaryPassword };
}

// ---------------------------------------------------------------------------
// Generic account (staff + parent) — create any profile from the admin area
// ---------------------------------------------------------------------------

export const CREATABLE_ACCOUNT_ROLES = ["ADMIN", "PRINCIPAL", "TEACHER", "NURSE", "PARENT"] as const;
export type CreatableAccountRole = (typeof CREATABLE_ACCOUNT_ROLES)[number];

export type CreateAccountInput = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  title?: string;
  classIds?: string[];
  studentIds?: string[];
};

export async function createAccount(session: SessionPayload, input: CreateAccountInput): Promise<CreatedAccount & { role: string }> {
  const schoolId = requireSchool(session);
  if (!input.firstName?.trim() || !input.lastName?.trim() || !input.email?.trim()) throw new Error("INVALID");
  if (!(CREATABLE_ACCOUNT_ROLES as readonly string[]).includes(input.role)) throw new Error("INVALID");
  const role = input.role as CreatableAccountRole;

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);
  const employeeNumber = role === "TEACHER" ? await nextSequenceNumber(schoolId, "EMP") : null;

  const user = await prisma.user.create({
    data: {
      schoolId,
      email: input.email.trim().toLowerCase(),
      passwordHash,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      locale: "en",
      theme: "dark",
      isActive: true,
      mustReset: true,
      roles: { create: { roleCode: role, schoolId } },
      ...(role === "TEACHER"
        ? { teacher: { create: { schoolId, employeeNumber: employeeNumber ?? "", title: input.title?.trim() || "Mr.", specialties: null, status: "ACTIVE" } } }
        : {}),
      ...(role === "PARENT"
        ? { guardian: { create: { schoolId, preferredContact: "EMAIL", status: "ACTIVE" } } }
        : {}),
    },
    select: { id: true, email: true, teacher: { select: { id: true } }, guardian: { select: { id: true } } },
  }).catch((error) => {
    if (isUniqueViolation(error)) throw new Error("EMAIL_TAKEN");
    throw error;
  });

  if (role === "TEACHER" && user.teacher) {
    for (const classId of input.classIds ?? []) {
      const cls = await prisma.schoolClass.findFirst({ where: { id: classId, schoolId }, select: { id: true } });
      if (!cls) continue;
      await prisma.teacherClassAssignment.create({ data: { teacherId: user.teacher.id, classId: cls.id, isHomeroom: false, role: "SUBJECT_TEACHER" } });
    }
  }

  if (role === "PARENT" && user.guardian) {
    for (const studentId of input.studentIds ?? []) {
      const student = await prisma.student.findFirst({ where: { id: studentId, schoolId }, select: { id: true } });
      if (!student) continue;
      await prisma.parentStudentRelationship.create({ data: { guardianId: user.guardian.id, studentId: student.id, relationship: "PARENT", isPrimary: false } });
    }
  }

  await audit(session, { action: "ACCOUNT.CREATED", entityType: "User", entityId: user.id, metadata: { role } });
  return { userId: user.id, email: user.email, firstName: input.firstName.trim(), lastName: input.lastName.trim(), temporaryPassword, role };
}

// ---------------------------------------------------------------------------
// Classes + teacher assignments + timetable
// ---------------------------------------------------------------------------

export type CreateClassInput = {
  name: string;
  gradeLevel: string;
  section?: string | null;
  room?: string | null;
  capacity?: number;
  homeroomTeacherId?: string | null;
};

export async function createClass(session: SessionPayload, input: CreateClassInput) {
  const schoolId = requireClassManage(session);
  if (!input.name?.trim() || !input.gradeLevel?.trim()) throw new Error("INVALID");

  const yearId = await currentAcademicYear(schoolId);
  const campus = await prisma.campus.findFirst({ where: { schoolId }, select: { id: true }, orderBy: { isMain: "desc" } });

  const cls = await prisma.schoolClass.create({
    data: {
      schoolId,
      campusId: campus?.id ?? null,
      academicYearId: yearId,
      name: input.name.trim(),
      gradeLevel: input.gradeLevel.trim(),
      section: input.section?.trim() || null,
      room: input.room?.trim() || null,
      capacity: input.capacity || 30,
    },
    select: { id: true, name: true },
  }).catch((error) => {
    if (isUniqueViolation(error)) throw new Error("CLASS_TAKEN");
    throw error;
  });

  if (input.homeroomTeacherId) {
    const teacher = await prisma.teacher.findFirst({
      where: { id: input.homeroomTeacherId, schoolId },
      select: { id: true },
    });
    if (teacher) {
      await prisma.teacherClassAssignment.create({
        data: { teacherId: teacher.id, classId: cls.id, isHomeroom: true, role: "HOMEROOM" },
      });
    }
  }

  await audit(session, { action: "CLASS.CREATED", entityType: "SchoolClass", entityId: cls.id, metadata: { name: cls.name } });
  return { ok: true, id: cls.id, name: cls.name };
}

export type AssignTeacherInput = {
  teacherId: string;
  classId: string;
  subjectId?: string | null;
  role?: string;
};

export async function assignTeacherToClass(session: SessionPayload, input: AssignTeacherInput) {
  const schoolId = requireClassManage(session);
  const teacher = await prisma.teacher.findFirst({ where: { id: input.teacherId, schoolId }, select: { id: true } });
  const cls = await prisma.schoolClass.findFirst({ where: { id: input.classId, schoolId }, select: { id: true } });
  if (!teacher || !cls) throw new Error("NOT_FOUND");

  if (input.subjectId) {
    const subject = await prisma.subject.findFirst({ where: { id: input.subjectId, schoolId }, select: { id: true } });
    if (!subject) throw new Error("NOT_FOUND");
  }

  const existing = await prisma.teacherClassAssignment.findFirst({
    where: { teacherId: teacher.id, classId: cls.id, subjectId: input.subjectId ?? null },
    select: { id: true },
  });
  if (existing) throw new Error("DUPLICATE");

  const created = await prisma.teacherClassAssignment.create({
    data: {
      teacherId: teacher.id,
      classId: cls.id,
      subjectId: input.subjectId ?? null,
      role: input.role ?? "SUBJECT_TEACHER",
      isHomeroom: input.role === "HOMEROOM",
    },
    select: { id: true },
  });

  await audit(session, { action: "TEACHER.ASSIGNED", entityType: "TeacherClassAssignment", entityId: created.id, metadata: { teacherId: teacher.id, classId: cls.id } });
  return { ok: true, id: created.id };
}

export async function unassignTeacherFromClass(session: SessionPayload, assignmentId: string) {
  const schoolId = requireClassManage(session);
  const assignment = await prisma.teacherClassAssignment.findFirst({
    where: { id: assignmentId, class: { schoolId } },
    select: { id: true },
  });
  if (!assignment) throw new Error("NOT_FOUND");
  await prisma.teacherClassAssignment.delete({ where: { id: assignment.id } });
  await audit(session, { action: "TEACHER.UNASSIGNED", entityType: "TeacherClassAssignment", entityId: assignment.id });
  return { ok: true };
}

export type TimetableSlotInput = {
  classId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subjectId?: string | null;
  teacherId?: string | null;
  room?: string | null;
};

export async function saveTimetableSlot(session: SessionPayload, input: TimetableSlotInput) {
  const schoolId = requireClassManage(session);
  if (!input.classId || !input.dayOfWeek || !input.startTime || !input.endTime) throw new Error("INVALID");

  const cls = await prisma.schoolClass.findFirst({ where: { id: input.classId, schoolId }, select: { id: true } });
  if (!cls) throw new Error("NOT_FOUND");

  if (!input.subjectId?.trim()) throw new Error("INVALID");
  const subject = await prisma.subject.findFirst({ where: { id: input.subjectId, schoolId }, select: { id: true } });
  if (!subject) throw new Error("NOT_FOUND");
  if (input.teacherId) {
    const teacher = await prisma.teacher.findFirst({ where: { id: input.teacherId, schoolId }, select: { id: true } });
    if (!teacher) throw new Error("NOT_FOUND");
  }

  const slot = await prisma.timetableSlot.create({
    data: {
      classId: cls.id,
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
      subjectId: subject.id,
      teacherId: input.teacherId ?? null,
      room: input.room?.trim() || null,
    },
    select: { id: true },
  });

  await audit(session, { action: "TIMETABLE.CREATED", entityType: "TimetableSlot", entityId: slot.id, metadata: { classId: cls.id, dayOfWeek: input.dayOfWeek } });
  return { ok: true, id: slot.id };
}

export async function deleteTimetableSlot(session: SessionPayload, id: string) {
  const schoolId = requireClassManage(session);
  const slot = await prisma.timetableSlot.findFirst({
    where: { id, class: { schoolId } },
    select: { id: true },
  });
  if (!slot) throw new Error("NOT_FOUND");
  await prisma.timetableSlot.delete({ where: { id: slot.id } });
  await audit(session, { action: "TIMETABLE.DELETED", entityType: "TimetableSlot", entityId: slot.id });
  return { ok: true };
}

export function isAdminActionError(error: unknown) {
  return typeof error === "string" && ["FORBIDDEN", "INVALID", "NOT_FOUND", "DUPLICATE", "EMAIL_TAKEN", "CLASS_TAKEN", "NO_ACADEMIC_YEAR"].includes(error);
}
