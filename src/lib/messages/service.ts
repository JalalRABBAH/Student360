/**
 * STUDENT360 — Messaging service.
 *
 * Authorization is enforced here, never in the UI:
 *   • A user can only ever see / reply to threads they are a participant of.
 *   • Recipient resolution is role-scoped:
 *       – PARENT / STUDENT may only message school staff (of their own school);
 *       – staff may message anyone in the school, a student's family or a
 *         whole class (teachers only for classes they are assigned to).
 *   • Read receipts are per message per participant (MessageRecipient).
 *   • Every send is recorded in the AuditLog and pushes a Notification to
 *     each recipient participant.
 */

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  accessibleClassIds,
  can,
  canAccessClass,
  canAccessStudent,
  hasRole,
  isStaff,
  resolveStudentScope,
  studentScopeWhere,
} from "@/lib/auth/rbac";
import type { SessionPayload } from "@/lib/auth/session";
import { ROLES, ROLE_LABELS, STAFF_ROLES, type RoleCode } from "@/lib/domain/enums";
import { initials } from "@/lib/utils";

export const MESSAGE_CATEGORIES = ["GENERAL", "ACADEMIC", "WELLBEING", "ATTENDANCE", "HOMEWORK", "ADMIN"] as const;
export type MessageCategory = (typeof MESSAGE_CATEGORIES)[number];

export const MESSAGE_CATEGORY_LABELS: Record<string, string> = {
  GENERAL: "General",
  ACADEMIC: "Academic",
  WELLBEING: "Wellbeing",
  ATTENDANCE: "Attendance",
  HOMEWORK: "Homework",
  ADMIN: "Administrative",
};

export type RecipientType = "user" | "student" | "class";

export class MessageServiceError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "MessageServiceError";
    this.status = status;
    this.code = code;
    this.message = message;
  }
}

export type ThreadSummary = {
  id: string;
  subject: string;
  category: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  lastSenderName: string;
  unreadCount: number;
  participantCount: number;
  participantNames: string[];
  aboutStudent: { id: string; name: string } | null;
  status: string;
};

export type ThreadMessage = {
  id: string;
  body: string;
  sentAt: string;
  own: boolean;
  sender: { id: string; name: string; role: string };
};

export type ThreadDetail = {
  id: string;
  subject: string;
  category: string;
  status: string;
  aboutStudent: { id: string; name: string } | null;
  participants: { userId: string; name: string; role: string }[];
  messages: ThreadMessage[];
};

export type RecipientEntry = {
  kind: RecipientType;
  id: string;
  userId: string | null;
  studentId: string | null;
  classId: string | null;
  name: string;
  subtitle: string;
  avatarText: string;
};

export type RecipientDirectory = {
  people: RecipientEntry[];
  students: RecipientEntry[];
  classes: RecipientEntry[];
  aboutOptions: { id: string; name: string }[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function primaryRoleLabel(roles: { roleCode: string }[]): string {
  const codes = roles.map((r) => r.roleCode);
  if (codes.includes(ROLES.SUPER_ADMIN)) return ROLE_LABELS.SUPER_ADMIN;
  if (codes.includes(ROLES.PRINCIPAL)) return ROLE_LABELS.PRINCIPAL;
  if (codes.includes(ROLES.ADMIN)) return ROLE_LABELS.ADMIN;
  if (codes.includes(ROLES.NURSE)) return ROLE_LABELS.NURSE;
  if (codes.includes(ROLES.TEACHER)) return ROLE_LABELS.TEACHER;
  if (codes.includes(ROLES.PARENT)) return ROLE_LABELS.PARENT;
  if (codes.includes(ROLES.STUDENT)) return ROLE_LABELS.STUDENT;
  return "Staff";
}

function userName(user: { firstName: string; lastName: string }) {
  return `${user.firstName} ${user.lastName}`;
}

function isStaffRole(codes: string[]) {
  return codes.some((code) => (STAFF_ROLES as string[]).includes(code));
}

async function ensureParticipant(threadId: string, userId: string) {
  const participant = await prisma.threadParticipant.findUnique({
    where: { threadId_userId: { threadId, userId } },
    select: { id: true },
  });
  if (!participant) {
    throw new MessageServiceError(403, "NOT_A_PARTICIPANT", "You are not a participant of this conversation");
  }
}

function toError(error: unknown, fallback: MessageServiceError) {
  return error instanceof MessageServiceError ? error : fallback;
}

async function writeAudit(
  session: SessionPayload,
  action: string,
  entityType: string,
  entityId: string,
  studentId: string | null,
  metadata: Record<string, unknown>,
) {
  await prisma.auditLog.create({
    data: {
      schoolId: session.schoolId,
      actorId: session.sub,
      actorRole: session.activeRole,
      action,
      entityType,
      entityId,
      studentId,
      metadata: JSON.stringify(metadata),
    },
  });
}

// ---------------------------------------------------------------------------
// Threads
// ---------------------------------------------------------------------------

export async function listThreadsFor(
  session: SessionPayload,
  opts: { q?: string; category?: string; status?: string } = {},
): Promise<ThreadSummary[]> {
  const userId = session.sub;
  const where: Prisma.MessageThreadWhereInput = { participants: { some: { userId } } };
  if (opts.category && opts.category !== "ALL") where.category = opts.category;
  if (opts.status && opts.status !== "ALL") where.status = opts.status;

  const threads = await prisma.messageThread.findMany({
    where,
    include: {
      participants: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, roles: { select: { roleCode: true } } } },
        },
      },
      aboutStudent: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
      messages: {
        orderBy: { sentAt: "desc" },
        take: 1,
        include: { sender: { select: { id: true, firstName: true, lastName: true } } },
      },
      _count: {
        select: {
          messages: { where: { recipients: { some: { userId, readAt: null } } } },
        },
      },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  const summaries: ThreadSummary[] = threads.map((thread) => {
    const otherNames = thread.participants.filter((p) => p.userId !== userId).map((p) => userName(p.user));
    return {
      id: thread.id,
      subject: thread.subject,
      category: thread.category,
      lastMessageAt: thread.lastMessageAt.toISOString(),
      lastMessagePreview: thread.messages[0]?.body ?? "",
      lastSenderName: thread.messages[0] ? userName(thread.messages[0].sender) : "",
      unreadCount: thread._count.messages,
      participantCount: thread.participants.length,
      participantNames: otherNames,
      aboutStudent: thread.aboutStudent
        ? { id: thread.aboutStudent.id, name: userName(thread.aboutStudent.user) }
        : null,
      status: thread.status,
    };
  });

  const q = opts.q?.trim().toLowerCase();
  if (!q) return summaries;
  return summaries.filter((s) =>
    [
      s.subject,
      s.lastMessagePreview,
      s.lastSenderName,
      s.aboutStudent?.name ?? "",
      ...s.participantNames,
    ]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}

export async function getThread(session: SessionPayload, threadId: string): Promise<ThreadDetail> {
  await ensureParticipant(threadId, session.sub);

  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: {
      participants: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, roles: { select: { roleCode: true } } } },
        },
      },
      aboutStudent: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
      messages: {
        orderBy: { sentAt: "asc" },
        include: { sender: { select: { id: true, firstName: true, lastName: true, roles: { select: { roleCode: true } } } } },
      },
    },
  });

  if (!thread) throw new MessageServiceError(404, "NOT_FOUND", "Conversation not found");

  return {
    id: thread.id,
    subject: thread.subject,
    category: thread.category,
    status: thread.status,
    aboutStudent: thread.aboutStudent
      ? { id: thread.aboutStudent.id, name: userName(thread.aboutStudent.user) }
      : null,
    participants: thread.participants.map((p) => ({
      userId: p.user.id,
      name: userName(p.user),
      role: primaryRoleLabel(p.user.roles),
    })),
    messages: thread.messages.map((m) => ({
      id: m.id,
      body: m.body,
      sentAt: m.sentAt.toISOString(),
      own: m.senderId === session.sub,
      sender: { id: m.sender.id, name: userName(m.sender), role: primaryRoleLabel(m.sender.roles) },
    })),
  };
}

export async function markThreadRead(session: SessionPayload, threadId: string) {
  await ensureParticipant(threadId, session.sub);

  const messages = await prisma.message.findMany({
    where: {
      threadId,
      senderId: { not: session.sub },
      recipients: { some: { userId: session.sub, readAt: null } },
    },
    select: { id: true },
  });

  let updated = 0;
  for (const message of messages) {
    const result = await prisma.messageRecipient.updateMany({
      where: { messageId: message.id, userId: session.sub, readAt: null },
      data: { readAt: new Date() },
    });
    updated += result.count;
  }
  return { updated };
}

// ---------------------------------------------------------------------------
// Recipient resolution & directory
// ---------------------------------------------------------------------------

type ResolvedRecipients = { userIds: string[]; aboutStudentId: string | null };

async function resolveParticipants(session: SessionPayload, input: {
  recipientType: RecipientType;
  recipientId: string;
  aboutStudentId?: string;
}): Promise<ResolvedRecipients> {
  const me = session.sub;
  const { recipientType, recipientId, aboutStudentId } = input;

  if (recipientType === "user") {
    const target = await prisma.user.findFirst({
      where: {
        id: recipientId,
        isActive: true,
        ...(hasRole(session, ROLES.SUPER_ADMIN) ? {} : { schoolId: session.schoolId }),
      },
      select: { id: true, roles: { select: { roleCode: true } } },
    });
    if (!target) throw new MessageServiceError(404, "RECIPIENT_NOT_FOUND", "Recipient not found");
    if (target.id === me) throw new MessageServiceError(400, "SELF_MESSAGE", "You cannot send a message to yourself");

    const callerIsStaff = isStaff(session);
    const targetIsStaff = isStaffRole(target.roles.map((r) => r.roleCode));
    if (!callerIsStaff && !targetIsStaff) {
      throw new MessageServiceError(403, "STAFF_ONLY_RECIPIENT", "You can only message school staff");
    }

    let aboutId: string | null = aboutStudentId ?? null;
    if (aboutId) {
      const accessible = await canAccessStudent(session, aboutId);
      if (!accessible) {
        throw new MessageServiceError(403, "STUDENT_ACCESS_DENIED", "You do not have access to this student");
      }
    }
    return { userIds: [me, target.id], aboutStudentId: aboutId };
  }

  if (recipientType === "student") {
    const accessible = await canAccessStudent(session, recipientId);
    if (!accessible) {
      throw new MessageServiceError(403, "STUDENT_ACCESS_DENIED", "You do not have access to this student");
    }
    const student = await prisma.student.findUnique({
      where: { id: recipientId },
      select: {
        userId: true,
        guardians: {
          where: { receivesNotifications: true },
          select: { guardian: { select: { userId: true } } },
        },
      },
    });
    if (!student) throw new MessageServiceError(404, "STUDENT_NOT_FOUND", "Student not found");
    const userIds = [me, student.userId, ...student.guardians.map((g) => g.guardian.userId)];
    return { userIds: [...new Set(userIds)], aboutStudentId: recipientId };
  }

  // class — staff only, class must be in the caller's scope
  if (!isStaff(session)) {
    throw new MessageServiceError(403, "CLASS_STAFF_ONLY", "Only school staff can message a whole class");
  }
  const classAccessible = await canAccessClass(session, recipientId);
  if (!classAccessible) {
    throw new MessageServiceError(403, "CLASS_ACCESS_DENIED", "You do not have access to this class");
  }
  const enrollments = await prisma.enrollment.findMany({
    where: { classId: recipientId, status: "ACTIVE" },
    select: { studentId: true },
  });
  const relationships = await prisma.parentStudentRelationship.findMany({
    where: { studentId: { in: enrollments.map((e) => e.studentId) }, receivesNotifications: true },
    select: { guardian: { select: { userId: true } } },
  });
  const userIds = [me, ...relationships.map((r) => r.guardian.userId)];
  return { userIds: [...new Set(userIds)], aboutStudentId: null };
}

export async function recipientDirectory(session: SessionPayload, q = ""): Promise<RecipientDirectory> {
  const query = q.trim().toLowerCase();
  const staff = isStaff(session);
  const people: RecipientEntry[] = [];
  const students: RecipientEntry[] = [];
  const classes: RecipientEntry[] = [];
  const matches = (text: string) => !query || text.toLowerCase().includes(query);

  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      id: { not: session.sub },
      ...(hasRole(session, ROLES.SUPER_ADMIN) ? {} : { schoolId: session.schoolId }),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      roles: { select: { roleCode: true } },
    },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    take: 300,
  });

  for (const user of users) {
    const name = userName(user);
    const roleCodes = user.roles.map((r) => r.roleCode as RoleCode);
    if (!matches(`${name} ${user.email}`)) continue;
    // Non-staff callers may only see school staff in the directory.
    if (!staff && !isStaffRole(roleCodes as string[])) continue;
    people.push({
      kind: "user",
      id: user.id,
      userId: user.id,
      studentId: null,
      classId: null,
      name,
      subtitle: primaryRoleLabel(user.roles),
      avatarText: initials(user.firstName, user.lastName),
    });
  }

  if (staff) {
    const scope = await resolveStudentScope(session);
    const studentRows = await prisma.student.findMany({
      where: { ...studentScopeWhere(scope), status: "ACTIVE" },
      select: {
        id: true,
        userId: true,
        currentClass: { select: { name: true } },
        user: { select: { firstName: true, lastName: true } },
      },
      orderBy: [{ user: { firstName: "asc" } }, { user: { lastName: "asc" } }],
      take: 400,
    });
    for (const student of studentRows) {
      const name = userName(student.user);
      if (!matches(name)) continue;
      students.push({
        kind: "student",
        id: student.id,
        userId: student.userId,
        studentId: student.id,
        classId: null,
        name,
        subtitle: student.currentClass?.name ?? "Student",
        avatarText: initials(student.user.firstName, student.user.lastName),
      });
    }

    const classIds = await accessibleClassIds(session);
    if (classIds !== "ALL") {
      const classRows = await prisma.schoolClass.findMany({
        where: { id: { in: classIds } },
        select: { id: true, name: true },
        orderBy: [{ gradeOrder: "asc" }, { section: "asc" }],
      });
      for (const schoolClass of classRows) {
        if (!matches(schoolClass.name)) continue;
        classes.push({
          kind: "class",
          id: schoolClass.id,
          userId: null,
          studentId: null,
          classId: schoolClass.id,
          name: schoolClass.name,
          subtitle: "Class",
          avatarText: schoolClass.name.replace(/^Grade\s+/i, "").toUpperCase(),
        });
      }
    }
  }

  let aboutOptions: RecipientDirectory["aboutOptions"] = [];
  if (hasRole(session, ROLES.PARENT) && session.guardianId) {
    const links = await prisma.parentStudentRelationship.findMany({
      where: { guardianId: session.guardianId },
      select: { student: { select: { id: true, user: { select: { firstName: true, lastName: true } } } } },
    });
    aboutOptions = links.map((l) => ({ id: l.student.id, name: userName(l.student.user) }));
  } else if (hasRole(session, ROLES.STUDENT) && session.studentId) {
    const self = await prisma.student.findUnique({
      where: { id: session.studentId },
      select: { user: { select: { firstName: true, lastName: true } } },
    });
    if (self) aboutOptions = [{ id: session.studentId, name: userName(self.user) }];
  }

  return { people, students, classes, aboutOptions };
}

// ---------------------------------------------------------------------------
// Notifications & audit
// ---------------------------------------------------------------------------

async function notifyRecipients(args: {
  schoolId: string | null;
  threadId: string;
  threadSubject: string;
  senderName: string;
  aboutStudentId: string | null;
  recipients: { userId: string; roles: { roleCode: string }[] }[];
}) {
  if (!args.schoolId) return;
  const rows = args.recipients.map((r) => ({
    schoolId: args.schoolId,
    userId: r.userId,
    type: isStaffRole(r.roles.map((role) => role.roleCode)) ? "TEACHER_FEEDBACK" : "PARENT_MESSAGE",
    title: `New message from ${args.senderName}`,
    body: args.threadSubject,
    linkUrl: "/messages",
    priority: "NORMAL",
    studentId: args.aboutStudentId ?? undefined,
  }));
  if (rows.length) await prisma.notification.createMany({ data: rows });
}

// ---------------------------------------------------------------------------
// Create / reply
// ---------------------------------------------------------------------------

export async function createThread(session: SessionPayload, input: {
  recipientType: RecipientType;
  recipientId: string;
  subject: string;
  body: string;
  category?: string;
  aboutStudentId?: string;
}) {
  if (!can(session, "message:write")) {
    throw new MessageServiceError(403, "FORBIDDEN", "You do not have permission to send messages");
  }
  if (!session.schoolId) {
    throw new MessageServiceError(400, "NO_SCHOOL", "Your account is not attached to a school");
  }

  const category: MessageCategory = MESSAGE_CATEGORIES.includes(input.category as MessageCategory)
    ? (input.category as MessageCategory)
    : "GENERAL";

  const { userIds, aboutStudentId } = await resolveParticipants(session, input);
  const subject = input.subject.trim();
  const body = input.body.trim();

  const thread = await prisma.messageThread.create({
    data: {
      schoolId: session.schoolId,
      subject,
      aboutStudentId,
      category,
      participants: { create: userIds.map((userId) => ({ userId })) },
      messages: {
        create: {
          schoolId: session.schoolId,
          senderId: session.sub,
          body,
          recipients: { create: userIds.filter((id) => id !== session.sub).map((userId) => ({ userId })) },
        },
      },
    },
    include: {
      participants: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, roles: { select: { roleCode: true } } } },
        },
      },
      aboutStudent: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
      messages: {
        orderBy: { sentAt: "asc" },
        include: { sender: { select: { id: true, firstName: true, lastName: true, roles: { select: { roleCode: true } } } } },
      },
    },
  });

  const otherParticipants = thread.participants
    .filter((p) => p.userId !== session.sub)
    .map((p) => ({ userId: p.userId, roles: p.user.roles }));

  await notifyRecipients({
    schoolId: session.schoolId,
    threadId: thread.id,
    threadSubject: subject,
    senderName: userName({ firstName: session.firstName, lastName: session.lastName }),
    aboutStudentId,
    recipients: otherParticipants,
  });

  await writeAudit(session, "CREATE_THREAD", "MessageThread", thread.id, aboutStudentId, {
    recipientType: input.recipientType,
    category,
    participantCount: userIds.length,
  });

  const otherNames = thread.participants.filter((p) => p.userId !== session.sub).map((p) => userName(p.user));
  return {
    id: thread.id,
    subject: thread.subject,
    category: thread.category,
    aboutStudent: thread.aboutStudent
      ? { id: thread.aboutStudent.id, name: userName(thread.aboutStudent.user) }
      : null,
    participants: thread.participants.map((p) => ({ userId: p.user.id, name: userName(p.user), role: primaryRoleLabel(p.user.roles) })),
    messages: thread.messages.map((m) => ({
      id: m.id,
      body: m.body,
      sentAt: m.sentAt.toISOString(),
      own: m.senderId === session.sub,
      sender: { id: m.sender.id, name: userName(m.sender), role: primaryRoleLabel(m.sender.roles) },
    })),
    summary: {
      participantCount: thread.participants.length,
      participantNames: otherNames,
    } satisfies Pick<ThreadSummary, "participantCount" | "participantNames">,
  };
}

export async function replyToThread(session: SessionPayload, threadId: string, body: string) {
  if (!can(session, "message:write")) {
    throw new MessageServiceError(403, "FORBIDDEN", "You do not have permission to send messages");
  }
  await ensureParticipant(threadId, session.sub);

  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: {
      participants: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, roles: { select: { roleCode: true } } } },
        },
      },
    },
  });
  if (!thread) throw new MessageServiceError(404, "NOT_FOUND", "Conversation not found");
  if (thread.status === "ARCHIVED") {
    throw new MessageServiceError(409, "THREAD_ARCHIVED", "This conversation has been archived");
  }

  const otherParticipants = thread.participants.filter((p) => p.userId !== session.sub);
  const message = await prisma.message.create({
    data: {
      schoolId: thread.schoolId,
      threadId,
      senderId: session.sub,
      body: body.trim(),
      recipients: { create: otherParticipants.map((p) => ({ userId: p.userId })) },
    },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, roles: { select: { roleCode: true } } } },
    },
  });

  await prisma.messageThread.update({
    where: { id: threadId },
    data: { lastMessageAt: message.sentAt, status: "OPEN" },
  });

  await notifyRecipients({
    schoolId: thread.schoolId,
    threadId,
    threadSubject: thread.subject,
    senderName: userName(message.sender),
    aboutStudentId: thread.aboutStudentId,
    recipients: otherParticipants.map((p) => ({ userId: p.userId, roles: p.user.roles })),
  });

  await writeAudit(session, "SEND_MESSAGE", "Message", message.id, thread.aboutStudentId, { threadId });

  return {
    id: message.id,
    body: message.body,
    sentAt: message.sentAt.toISOString(),
    own: true,
    sender: { id: message.sender.id, name: userName(message.sender), role: primaryRoleLabel(message.sender.roles) },
  };
}

export { toError };
