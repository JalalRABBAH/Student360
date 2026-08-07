/**
 * STUDENT360 — Actions service.
 *
 * Recurring, mandatory/optional tasks that feed the platform (attendance,
 * check-ins, weekly parent updates, monthly reports…). The app materialises
 * ActionAssignment rows lazily and idempotently: every time a user opens the
 * "Actions" screen we create the assignments that are now due and do not exist
 * yet — no cron, no background job, works offline and across tenants.
 *
 *  - Assignments generated from a template are deduplicated by
 *    (templateId, assigneeUserId, periodStart).
 *  - Admin / principal create templates and can also assign one-off actions.
 *  - Teachers can assign one-off actions to students (or their parents).
 *  - Completing an action writes an ActivityEvent so actions feed the LIVE
 *    view and the student timeline just like every other signal.
 */

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { SessionPayload } from "@/lib/auth/session";
import {
  accessibleClassIds,
  can,
  hasRole,
  isLeadership,
} from "@/lib/auth/rbac";
import {
  ACTION_REQUIRED,
  ACTION_SOURCES,
  ACTION_STATUS,
  ACTION_TARGET_ROLES,
  ROLES,
  type RoleCode,
} from "@/lib/domain/enums";
import { audit } from "@/lib/auth/audit";

const ACTIONABLE_ROLES: RoleCode[] = [ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT];

// ---------------------------------------------------------------------------
// Date helpers (local time — consistent with the seed's date arithmetic)
// ---------------------------------------------------------------------------

function addDays(d: Date, days: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

type PeriodKey = { periodStart: Date | null; periodEnd: Date | null; dueDate: Date };

function periodFor(frequency: string, asOf: Date, templateStart: Date): PeriodKey {
  const today = startOfDay(asOf);
  switch (frequency) {
    case "DAILY":
      return { periodStart: today, periodEnd: endOfDay(today), dueDate: endOfDay(today) };
    case "WEEKLY": {
      const offset = (today.getDay() + 6) % 7; // 0 = Monday
      const monday = addDays(today, -offset);
      return { periodStart: monday, periodEnd: endOfDay(addDays(monday, 6)), dueDate: endOfDay(addDays(monday, 6)) };
    }
    case "MONTHLY": {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { periodStart: first, periodEnd: endOfDay(last), dueDate: endOfDay(last) };
    }
    default: {
      // ONE_OFF — created once, never regenerated
      return { periodStart: null, periodEnd: null, dueDate: new Date(templateStart) };
    }
  }
}

// ---------------------------------------------------------------------------
// Eligibility
// ---------------------------------------------------------------------------

async function userMatchesTemplateClass(session: SessionPayload, classId: string | null): Promise<boolean> {
  if (!classId) return true;
  const accessible = await accessibleClassIds(session);
  return accessible === "ALL" || accessible.includes(classId);
}

/** Number of people a template applies to (for admin coverage). */
export async function eligibleCountForTemplate(template: {
  schoolId: string;
  targetRole: string;
  classId: string | null;
}): Promise<number> {
  const { schoolId, targetRole, classId } = template;
  if (targetRole === "TEACHER") {
    if (classId) {
      return prisma.teacherClassAssignment.count({ where: { classId } });
    }
    return prisma.teacher.count({ where: { schoolId } });
  }
  if (targetRole === "STUDENT") {
    if (classId) {
      return prisma.enrollment.count({ where: { classId, status: "ACTIVE" } });
    }
    return prisma.student.count({ where: { schoolId, status: "ACTIVE" } });
  }
  // PARENT
  if (classId) {
    const rels = await prisma.parentStudentRelationship.findMany({
      where: { student: { currentClassId: classId } },
      select: { guardianId: true },
      distinct: ["guardianId"],
    });
    return rels.length;
  }
  return prisma.guardian.count({ where: { schoolId } });
}

// ---------------------------------------------------------------------------
// Materialisation — make the recurring actions that are due, idempotently
// ---------------------------------------------------------------------------

export async function ensureUserActions(session: SessionPayload, asOf = new Date()) {
  const role = session.activeRole;
  if (!ACTIONABLE_ROLES.includes(role)) return 0;

  const schoolId = session.schoolId;
  if (!schoolId) return 0;

  const templates = await prisma.actionTemplate.findMany({
    where: { schoolId, targetRole: role, active: true, startDate: { lte: asOf } },
    select: { id: true, code: true, title: true, titleKey: true, description: true, required: true, frequency: true, classId: true, startDate: true },
  });

  let created = 0;
  for (const template of templates) {
    if (!(await userMatchesTemplateClass(session, template.classId))) continue;
    const period = periodFor(template.frequency, asOf, template.startDate);

    if (period.periodStart === null) {
      // ONE_OFF — create once
      const existing = await prisma.actionAssignment.findFirst({
        where: { templateId: template.id, assigneeUserId: session.sub },
        select: { id: true },
      });
      if (existing) continue;
    } else {
      const existing = await prisma.actionAssignment.findUnique({
        where: {
          templateId_assigneeUserId_periodStart: {
            templateId: template.id,
            assigneeUserId: session.sub,
            periodStart: period.periodStart,
          },
        },
        select: { id: true },
      });
      if (existing) continue;
    }

    try {
      await prisma.actionAssignment.create({
        data: {
          schoolId,
          templateId: template.id,
          assigneeUserId: session.sub,
          source: ACTION_SOURCES.APP,
          required: template.required,
          title: template.title,
          titleKey: template.titleKey ?? null,
          description: template.description,
          dueDate: period.dueDate,
          periodStart: period.periodStart,
          periodEnd: period.periodEnd,
          status: ACTION_STATUS.PENDING,
        },
      });
      created += 1;
    } catch (error) {
      // Concurrent materialisation — the unique key (template, assignee, period) already exists.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") continue;
      throw error;
    }
  }
  return created;
}

// ---------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------

export type ActionItem = {
  id: string;
  title: string;
  description: string | null;
  required: string;
  source: string;
  status: string;
  dueDate: string;
  completedAt: string | null;
  completedNote: string | null;
  studentName?: string | null;
};

function serializeAction(a: {
  id: string;
  title: string;
  description: string | null;
  required: string;
  source: string;
  status: string;
  dueDate: Date;
  completedAt: Date | null;
  completedNote: string | null;
  student?: { user?: { firstName?: string | null; lastName?: string | null } | null } | null;
}): ActionItem {
  const student = a.student as { user?: { firstName?: string | null; lastName?: string | null } | null } | null | undefined;
  const name =
    student?.user && (student.user.firstName || student.user.lastName)
      ? `${student.user.firstName ?? ""} ${student.user.lastName ?? ""}`.trim()
      : null;
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    required: a.required,
    source: a.source,
    status: a.status,
    dueDate: a.dueDate.toISOString(),
    completedAt: a.completedAt?.toISOString() ?? null,
    completedNote: a.completedNote,
    studentName: name,
  };
}

const ACTION_INCLUDE = {
  student: { select: { user: { select: { firstName: true, lastName: true } } } },
} as const;

export async function listMyActions(session: SessionPayload) {
  await ensureUserActions(session);

  const [pending, history] = await Promise.all([
    prisma.actionAssignment.findMany({
      where: { assigneeUserId: session.sub, status: ACTION_STATUS.PENDING },
      include: ACTION_INCLUDE,
      orderBy: [{ required: "desc" }, { dueDate: "asc" }],
    }),
    prisma.actionAssignment.findMany({
      where: { assigneeUserId: session.sub, status: { not: ACTION_STATUS.PENDING } },
      include: ACTION_INCLUDE,
      orderBy: { updatedAt: "desc" },
      take: 15,
    }),
  ]);

  return {
    pending: pending.map(serializeAction),
    history: history.map(serializeAction),
    counts: {
      pending: pending.length,
      done: history.filter((h) => h.status === ACTION_STATUS.DONE).length,
      mandatoryOpen: pending.filter((p) => p.required === ACTION_REQUIRED.MANDATORY).length,
    },
  };
}

// ---------------------------------------------------------------------------
// Completing / skipping
// ---------------------------------------------------------------------------

export async function completeAction(session: SessionPayload, id: string, note?: string) {
  const assignment = await prisma.actionAssignment.findFirst({
    where: { id, assigneeUserId: session.sub },
    select: { id: true, schoolId: true, status: true, title: true, studentId: true },
  });
  if (!assignment) throw new Error("NOT_FOUND");
  if (assignment.status !== ACTION_STATUS.PENDING) throw new Error("ALREADY_RESOLVED");

  await prisma.actionAssignment.update({
    where: { id },
    data: { status: ACTION_STATUS.DONE, completedAt: new Date(), completedNote: note ?? null },
  });

  await prisma.activityEvent.create({
    data: {
      schoolId: assignment.schoolId,
      studentId: assignment.studentId ?? null,
      actorId: session.sub,
      type: "ACTION",
      title: assignment.title,
      description: note || "Action completed",
      sentiment: "POSITIVE",
      icon: "check-circle",
      refType: "ActionAssignment",
      refId: id,
      visibility: "SCHOOL_STAFF",
      occurredAt: new Date(),
    },
  }).catch(() => {});

  await audit(session, { action: "ACTION.COMPLETED", entityType: "ActionAssignment", entityId: id });
  return { ok: true };
}

export async function skipAction(session: SessionPayload, id: string) {
  const assignment = await prisma.actionAssignment.findFirst({
    where: { id, assigneeUserId: session.sub },
    select: { id: true, status: true },
  });
  if (!assignment) throw new Error("NOT_FOUND");
  if (assignment.status !== ACTION_STATUS.PENDING) throw new Error("ALREADY_RESOLVED");

  await prisma.actionAssignment.update({
    where: { id },
    data: { status: ACTION_STATUS.SKIPPED, completedAt: new Date() },
  });
  await audit(session, { action: "ACTION.SKIPPED", entityType: "ActionAssignment", entityId: id });
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Manual assignment (admin/principal → anyone in the school, teacher → students/parents)
// ---------------------------------------------------------------------------

export type AssignActionInput = {
  assigneeUserId: string;
  studentId?: string | null;
  title: string;
  description?: string | null;
  dueDate: string;
  required?: string;
};

export async function assignAction(session: SessionPayload, input: AssignActionInput) {
  if (!input.title?.trim()) throw new Error("INVALID");
  if (!input.dueDate) throw new Error("INVALID");

  const assignee = await prisma.user.findUnique({
    where: { id: input.assigneeUserId },
    select: { id: true, schoolId: true, firstName: true, lastName: true, roles: { select: { roleCode: true } } },
  });
  if (!assignee || !assignee.schoolId) throw new Error("NOT_FOUND");

  const actorLeadership = isLeadership(session);
  const actorTeacher = hasRole(session, ROLES.TEACHER);
  if (!actorLeadership && !actorTeacher) throw new Error("FORBIDDEN");

  if (actorLeadership) {
    if (assignee.schoolId !== session.schoolId) throw new Error("FORBIDDEN");
  } else {
    // Teachers may only assign to students they teach (or their parents).
    const assigneeRoles = assignee.roles.map((r) => r.roleCode);
    if (!assigneeRoles.includes(ROLES.STUDENT) && !assigneeRoles.includes(ROLES.PARENT)) {
      throw new Error("FORBIDDEN");
    }
    if (!session.teacherId) throw new Error("FORBIDDEN");
    const accessible = await accessibleClassIds(session);
    if (accessible === "ALL") {
      if (assignee.schoolId !== session.schoolId) throw new Error("FORBIDDEN");
    } else {
      let inScope = false;
      if (assigneeRoles.includes(ROLES.STUDENT)) {
        const student = await prisma.student.findUnique({
          where: { userId: assignee.id },
          select: { currentClassId: true },
        });
        inScope = Boolean(student?.currentClassId && accessible.includes(student.currentClassId));
      } else {
        const links = await prisma.parentStudentRelationship.findMany({
          where: { guardian: { userId: assignee.id } },
          select: { student: { select: { currentClassId: true } } },
        });
        inScope = links.some((l) => l.student.currentClassId && accessible.includes(l.student.currentClassId));
      }
      if (!inScope) throw new Error("FORBIDDEN");
    }
  }

  const student = input.studentId
    ? await prisma.student.findFirst({ where: { id: input.studentId, schoolId: assignee.schoolId }, select: { id: true } })
    : null;

  const created = await prisma.actionAssignment.create({
    data: {
      schoolId: assignee.schoolId,
      assigneeUserId: assignee.id,
      studentId: student?.id ?? null,
      assignedById: session.sub,
      source: actorTeacher ? ACTION_SOURCES.TEACHER : ACTION_SOURCES.ADMIN,
      required: input.required === ACTION_REQUIRED.MANDATORY ? ACTION_REQUIRED.MANDATORY : ACTION_REQUIRED.OPTIONAL,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      dueDate: new Date(input.dueDate),
      periodStart: null,
      periodEnd: null,
      status: ACTION_STATUS.PENDING,
    },
  });

  await audit(session, {
    action: "ACTION.ASSIGNED",
    entityType: "ActionAssignment",
    entityId: created.id,
    studentId: student?.id ?? undefined,
    metadata: { assignee: assignee.id, required: created.required },
  });
  return { ok: true, id: created.id };
}

// ---------------------------------------------------------------------------
// Templates (admin / principal)
// ---------------------------------------------------------------------------

export type TemplateInput = {
  code: string;
  title: string;
  description?: string | null;
  targetRole: string;
  required: string;
  frequency: string;
  classId?: string | null;
  source?: string;
};

export async function listTemplates(session: SessionPayload) {
  if (!session.schoolId) throw new Error("FORBIDDEN");
  const templates = await prisma.actionTemplate.findMany({
    where: { schoolId: session.schoolId },
    orderBy: [{ targetRole: "asc" }, { code: "asc" }],
  });
  return Promise.all(
    templates.map(async (t) => {
      const [generated, eligible] = await Promise.all([
        prisma.actionAssignment.count({ where: { templateId: t.id } }),
        eligibleCountForTemplate(t),
      ]);
      return {
        id: t.id,
        code: t.code,
        title: t.title,
        description: t.description,
        targetRole: t.targetRole,
        required: t.required,
        frequency: t.frequency,
        source: t.source,
        classId: t.classId,
        active: t.active,
        startDate: t.startDate.toISOString(),
        generated,
        eligible,
      };
    }),
  );
}

export async function createTemplate(session: SessionPayload, input: TemplateInput) {
  if (!session.schoolId) throw new Error("FORBIDDEN");
  if (!input.code?.trim() || !input.title?.trim()) throw new Error("INVALID");
  if (!ACTION_TARGET_ROLES.includes(input.targetRole as (typeof ACTION_TARGET_ROLES)[number])) throw new Error("INVALID");
  if (![ACTION_REQUIRED.MANDATORY, ACTION_REQUIRED.OPTIONAL].includes(input.required)) throw new Error("INVALID");
  if (!["DAILY", "WEEKLY", "MONTHLY", "ONE_OFF"].includes(input.frequency)) throw new Error("INVALID");

  if (input.classId) {
    const cls = await prisma.schoolClass.findFirst({
      where: { id: input.classId, schoolId: session.schoolId },
      select: { id: true },
    });
    if (!cls) throw new Error("INVALID");
  }

  const existing = await prisma.actionTemplate.findUnique({
    where: { schoolId_code: { schoolId: session.schoolId, code: input.code.trim() } },
    select: { id: true },
  });
  if (existing) throw new Error("DUPLICATE");

  const created = await prisma.actionTemplate.create({
    data: {
      schoolId: session.schoolId,
      code: input.code.trim().toUpperCase().replace(/\s+/g, "_"),
      title: input.title.trim(),
      titleKey: null,
      description: input.description?.trim() || null,
      targetRole: input.targetRole,
      required: input.required,
      frequency: input.frequency,
      source: input.source ?? ACTION_SOURCES.ADMIN,
      classId: input.classId ?? null,
      createdById: session.sub,
      active: true,
    },
  });
  await audit(session, { action: "ACTION_TEMPLATE.CREATED", entityType: "ActionTemplate", entityId: created.id });
  return { ok: true, id: created.id };
}

export async function toggleTemplate(session: SessionPayload, id: string) {
  if (!session.schoolId) throw new Error("FORBIDDEN");
  const template = await prisma.actionTemplate.findFirst({
    where: { id, schoolId: session.schoolId },
    select: { id: true, active: true },
  });
  if (!template) throw new Error("NOT_FOUND");
  await prisma.actionTemplate.update({ where: { id }, data: { active: !template.active } });
  await audit(session, { action: "ACTION_TEMPLATE.TOGGLED", entityType: "ActionTemplate", entityId: id, metadata: { active: !template.active } });
  return { ok: true, active: !template.active };
}

export async function deleteTemplate(session: SessionPayload, id: string) {
  if (!session.schoolId) throw new Error("FORBIDDEN");
  const template = await prisma.actionTemplate.findFirst({
    where: { id, schoolId: session.schoolId, source: ACTION_SOURCES.ADMIN },
    select: { id: true },
  });
  if (!template) throw new Error("NOT_FOUND");
  await prisma.actionTemplate.delete({ where: { id } });
  await audit(session, { action: "ACTION_TEMPLATE.DELETED", entityType: "ActionTemplate", entityId: id });
  return { ok: true };
}
