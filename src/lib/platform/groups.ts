/**
 * STUDENT360 — School group administration (platform level).
 *
 * Only users holding the `tenant:manage` capability (SUPER_ADMIN) may manage
 * school groups: create/update/delete groups, assign their GROUP_MANAGER
 * accounts, and track the seats-based subscription billing of each group.
 * Every function re-checks the capability defensively.
 */

import { prisma } from "@/lib/db";
import { can, hasRole } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/domain/enums";
import type { SessionPayload } from "@/lib/auth/session";
import { audit } from "@/lib/auth/audit";
import { createAccount } from "@/lib/admin/service";

// ---------------------------------------------------------------------------
// Public types (serializable)
// ---------------------------------------------------------------------------

export type PaymentRecord = {
  id: string;
  billingId: string;
  type: "add" | "charge" | "refund" | "credit";
  amount: number;
  note: string | null;
  pdfFileId: string | null;
  createdAt: string;
};

export type GroupBillingCycle = {
  id: string;
  period: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  dueDate: string | null;
  paidAt: string | null;
  note: string | null;
  seatCount: number;
  pricePerSeat: number;
  amount: number;
  payments: PaymentRecord[];
};

export type GroupManagerEntry = { id: string; firstName: string; lastName: string; email: string };

export type PlatformGroupEntry = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  country: string;
  status: string;
  pricePerSeat: number;
  schoolCount: number;
  totalSeats: number;
  totalStudents: number;
  totalTeachers: number;
  managers: GroupManagerEntry[];
  billing: GroupBillingCycle[];
};

export type GroupsOverview = {
  groups: number;
  activeGroups: number;
  schools: number;
  totalSeats: number;
  totalStudents: number;
  totalTeachers: number;
  outstanding: number;
};

export type BillingRow = GroupBillingCycle & { groupId: string; groupName: string };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function requirePlatform(session: SessionPayload) {
  if (!can(session, "tenant:manage")) throw new Error("FORBIDDEN");
}

function isPeriod(period: string) {
  return /^\d{4}-\d{2}$/.test(period);
}

async function seatCountFor(groupId: string) {
  const rows = await prisma.school.findMany({ where: { groupId }, select: { seatsLimit: true } });
  return rows.reduce((sum, school) => sum + school.seatsLimit, 0);
}

type BillingCycleRow = {
  id: string;
  period: string;
  status: string;
  amount: number;
  dueDate: Date | null;
  paidAt: Date | null;
  note: string | null;
  payments: { id: string; billingId: string; type: string; amount: number; note: string | null; pdfFileId: string | null; createdAt: Date }[];
};

function toPayments(records: BillingCycleRow["payments"]): PaymentRecord[] {
  return records.map((p) => ({
    id: p.id,
    billingId: p.billingId,
    type: p.type as PaymentRecord["type"],
    amount: p.amount,
    note: p.note,
    pdfFileId: p.pdfFileId,
    createdAt: p.createdAt.toISOString(),
  }));
}

function toCycle(cycle: BillingCycleRow, seatCount: number, pricePerSeat: number): GroupBillingCycle {
  return {
    id: cycle.id,
    period: cycle.period,
    status: cycle.status as GroupBillingCycle["status"],
    dueDate: cycle.dueDate?.toISOString() ?? null,
    paidAt: cycle.paidAt?.toISOString() ?? null,
    note: cycle.note,
    seatCount,
    pricePerSeat,
    amount: cycle.amount > 0 ? cycle.amount : seatCount * pricePerSeat,
    payments: toPayments(cycle.payments),
  };
}

// ---------------------------------------------------------------------------
// Group directory
// ---------------------------------------------------------------------------

export async function listPlatformGroups(session: SessionPayload): Promise<PlatformGroupEntry[]> {
  requirePlatform(session);

  const groups = await prisma.schoolGroup.findMany({
    select: { id: true, name: true, slug: true, city: true, country: true, status: true, pricePerSeat: true },
    orderBy: { name: "asc" },
    take: 300,
  });
  if (!groups.length) return [];

  const ids = groups.map((g) => g.id);

  const [schools, students, teachers, managers, billing] = await Promise.all([
    prisma.school.groupBy({ by: ["groupId"], where: { groupId: { in: ids } }, _count: { _all: true }, _sum: { seatsLimit: true } }),
    prisma.student.groupBy({ by: ["schoolId"], where: { school: { groupId: { in: ids } }, status: "ACTIVE" }, _count: { _all: true } }),
    prisma.teacher.groupBy({ by: ["schoolId"], where: { school: { groupId: { in: ids } }, status: "ACTIVE" }, _count: { _all: true } }),
    prisma.user.findMany({
      where: { groupId: { in: ids } },
      select: { id: true, firstName: true, lastName: true, email: true, groupId: true, roles: { select: { roleCode: true } } },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
    prisma.groupBilling.findMany({ where: { groupId: { in: ids } }, orderBy: { period: "desc" }, take: 500, include: { payments: true } }),
  ]);

  const schoolByGroup = new Map(ids.map((id) => [id, { count: 0, seats: 0 }]));
  for (const row of schools) {
    if (!row.groupId) continue;
    const entry = schoolByGroup.get(row.groupId);
    if (entry) {
      entry.count = row._count._all;
      entry.seats = row._sum.seatsLimit ?? 0;
    }
  }

  const studentCountBySchool = new Map(students.map((row) => [row.schoolId, row._count._all]));
  const teacherCountBySchool = new Map(teachers.map((row) => [row.schoolId, row._count._all]));
  const schoolIdsByGroup = new Map<string, Set<string>>();
  const schoolRows = await prisma.school.findMany({ where: { groupId: { in: ids } }, select: { id: true, groupId: true } });
  for (const school of schoolRows) {
    if (!school.groupId) continue;
    const set = schoolIdsByGroup.get(school.groupId) ?? new Set<string>();
    set.add(school.id);
    schoolIdsByGroup.set(school.groupId, set);
  }

  const managersByGroup = new Map<string, GroupManagerEntry[]>();
  for (const user of managers) {
    if (!user.groupId) continue;
    if (!user.roles.some((r) => r.roleCode === ROLES.GROUP_MANAGER)) continue;
    const list = managersByGroup.get(user.groupId) ?? [];
    list.push({ id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email });
    managersByGroup.set(user.groupId, list);
  }

  const billingByGroup = new Map<string, GroupBillingCycle[]>();
  for (const cycle of billing) {
    const group = groups.find((g) => g.id === cycle.groupId);
    if (!group) continue;
    const seats = schoolByGroup.get(group.id)?.seats ?? 0;
    const list = billingByGroup.get(group.id) ?? [];
    list.push(toCycle(cycle, seats, group.pricePerSeat));
    billingByGroup.set(group.id, list);
  }

  return groups.map((group) => {
    const stats = schoolByGroup.get(group.id) ?? { count: 0, seats: 0 };
    const schoolIds = [...(schoolIdsByGroup.get(group.id) ?? [])];
    const studentCount = schoolIds.reduce((sum, id) => sum + (studentCountBySchool.get(id) ?? 0), 0);
    const teacherCount = schoolIds.reduce((sum, id) => sum + (teacherCountBySchool.get(id) ?? 0), 0);
    return {
      id: group.id,
      name: group.name,
      slug: group.slug,
      city: group.city,
      country: group.country,
      status: group.status,
      pricePerSeat: group.pricePerSeat,
      schoolCount: stats.count,
      totalSeats: stats.seats,
      totalStudents: studentCount,
      totalTeachers: teacherCount,
      managers: managersByGroup.get(group.id) ?? [],
      billing: billingByGroup.get(group.id) ?? [],
    };
  });
}

export async function getGroupsOverview(session: SessionPayload): Promise<GroupsOverview> {
  requirePlatform(session);
  const groups = await listPlatformGroups(session);
  const outstanding = groups.reduce(
    (sum, group) => sum + group.billing.filter((c) => c.status !== "PAID").reduce((s, c) => s + c.amount, 0),
    0,
  );
  return {
    groups: groups.length,
    activeGroups: groups.filter((g) => g.status === "ACTIVE").length,
    schools: groups.reduce((sum, g) => sum + g.schoolCount, 0),
    totalSeats: groups.reduce((sum, g) => sum + g.totalSeats, 0),
    totalStudents: groups.reduce((sum, g) => sum + g.totalStudents, 0),
    totalTeachers: groups.reduce((sum, g) => sum + g.totalTeachers, 0),
    outstanding,
  };
}

// ---------------------------------------------------------------------------
// Group CRUD
// ---------------------------------------------------------------------------

export type CreateGroupInput = {
  name: string;
  city?: string | null;
  country?: string;
  pricePerSeat?: number;
};

export async function createSchoolGroup(session: SessionPayload, input: CreateGroupInput): Promise<{ ok: true; id: string; name: string; slug: string }> {
  requirePlatform(session);
  const name = input.name?.trim();
  if (!name) throw new Error("INVALID");

  const existing = await prisma.schoolGroup.findFirst({ where: { name }, select: { id: true } });
  if (existing) throw new Error("NAME_TAKEN");

  let slug = slugify(name) || "group";
  let candidate = slug;
  let index = 1;
  while (await prisma.schoolGroup.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${slug}-${index++}`;
  }

  const group = await prisma.schoolGroup.create({
    data: {
      name,
      slug: candidate,
      city: input.city?.trim() || null,
      country: input.country?.trim() || "MA",
      pricePerSeat: typeof input.pricePerSeat === "number" && input.pricePerSeat > 0 ? Math.round(input.pricePerSeat) : 25,
      status: "ACTIVE",
    },
    select: { id: true, name: true, slug: true },
  });

  await audit(session, { action: "GROUP.CREATED", entityType: "SchoolGroup", entityId: group.id, metadata: { name: group.name } });
  return { ok: true, id: group.id, name: group.name, slug: group.slug };
}

export type UpdateGroupInput = {
  name?: string;
  city?: string | null;
  country?: string;
  status?: string;
  pricePerSeat?: number;
};

export async function updateSchoolGroup(session: SessionPayload, groupId: string, input: UpdateGroupInput): Promise<{ ok: true; name: string }> {
  requirePlatform(session);
  const data: Record<string, unknown> = {};
  if (typeof input.name === "string" && input.name.trim()) {
    const newName = input.name.trim();
    const dup = await prisma.schoolGroup.findFirst({ where: { name: newName, id: { not: groupId } }, select: { id: true } });
    if (dup) throw new Error("NAME_TAKEN");
    data.name = newName;
  }
  if (typeof input.city === "string") data.city = input.city.trim() || null;
  if (typeof input.country === "string") data.country = input.country.trim() || "MA";
  if (typeof input.status === "string") data.status = input.status;
  if (typeof input.pricePerSeat === "number" && input.pricePerSeat > 0) data.pricePerSeat = Math.round(input.pricePerSeat);

  if (!Object.keys(data).length) throw new Error("INVALID");

  const group = await prisma.schoolGroup.update({ where: { id: groupId }, data, select: { name: true } });
  await audit(session, { action: "GROUP.UPDATED", entityType: "SchoolGroup", entityId: groupId, metadata: { ...data } });
  return { ok: true, name: group.name };
}

export async function deleteSchoolGroup(session: SessionPayload, groupId: string): Promise<{ ok: true }> {
  requirePlatform(session);
  const group = await prisma.schoolGroup.findUnique({ where: { id: groupId }, select: { name: true, _count: { select: { schools: true } } } });
  if (!group) throw new Error("NOT_FOUND");
  if (group._count.schools > 0) throw new Error("GROUP_HAS_SCHOOLS");

  await prisma.schoolGroup.delete({ where: { id: groupId } });
  await audit(session, { action: "GROUP.DELETED", entityType: "SchoolGroup", entityId: groupId, metadata: { name: group.name } });
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Group managers
// ---------------------------------------------------------------------------

export type AssignGroupManagerInput = {
  groupId: string;
  mode: "existing" | "new";
  email: string;
  firstName?: string;
  lastName?: string;
};

export async function assignGroupManager(
  session: SessionPayload,
  input: AssignGroupManagerInput,
): Promise<{ ok: true; userId: string; email: string; firstName: string; lastName: string; temporaryPassword?: string }> {
  requirePlatform(session);
  if (!input.groupId?.trim() || !input.email?.trim()) throw new Error("INVALID");

  const group = await prisma.schoolGroup.findUnique({ where: { id: input.groupId }, select: { id: true } });
  if (!group) throw new Error("NOT_FOUND");

  if (input.mode === "new") {
    if (!input.firstName?.trim() || !input.lastName?.trim()) throw new Error("INVALID");
    const created = await createAccount(session, {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email.trim(),
      role: "GROUP_MANAGER",
      groupId: group.id,
    });
    await audit(session, {
      action: "GROUP.MANAGER_CREATED",
      entityType: "User",
      entityId: created.userId,
      metadata: { groupId: group.id },
    });
    return {
      ok: true,
      userId: created.userId,
      email: created.email,
      firstName: created.firstName,
      lastName: created.lastName,
      temporaryPassword: created.temporaryPassword,
    };
  }

  const existing = await prisma.user.findUnique({
    where: { email: input.email.trim().toLowerCase() },
    include: { roles: { select: { roleCode: true } } },
  });
  if (!existing) throw new Error("NOT_FOUND");

  const roleCodes = new Set(existing.roles.map((r) => r.roleCode));
  if (roleCodes.has(ROLES.SUPER_ADMIN)) throw new Error("FORBIDDEN");
  if (roleCodes.has(ROLES.GROUP_MANAGER)) {
    if (existing.groupId === group.id) {
      return { ok: true, userId: existing.id, email: existing.email, firstName: existing.firstName, lastName: existing.lastName };
    }
    throw new Error("ALREADY_MANAGER");
  }

  const hasRole = await prisma.userRole.findUnique({
    where: { userId_roleCode: { userId: existing.id, roleCode: ROLES.GROUP_MANAGER } },
  });
  if (!hasRole) {
    await prisma.userRole.create({ data: { userId: existing.id, roleCode: ROLES.GROUP_MANAGER, schoolId: null } });
  }
  if (existing.groupId !== group.id) {
    await prisma.user.update({ where: { id: existing.id }, data: { groupId: group.id } });
  }

  await audit(session, {
    action: "GROUP.MANAGER_ASSIGNED",
    entityType: "User",
    entityId: existing.id,
    metadata: { groupId: group.id, mode: "existing" },
  });

  return { ok: true, userId: existing.id, email: existing.email, firstName: existing.firstName, lastName: existing.lastName };
}

export async function removeGroupManager(session: SessionPayload, userId: string): Promise<{ ok: true }> {
  requirePlatform(session);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: { select: { roleCode: true } } },
  });
  if (!user) throw new Error("NOT_FOUND");
  if (!user.roles.some((r) => r.roleCode === ROLES.GROUP_MANAGER)) throw new Error("NOT_FOUND");

  await prisma.$transaction([
    prisma.userRole.deleteMany({ where: { userId, roleCode: ROLES.GROUP_MANAGER } }),
    prisma.user.update({ where: { id: userId }, data: { groupId: null } }),
  ]);

  await audit(session, { action: "GROUP.MANAGER_REMOVED", entityType: "User", entityId: userId, metadata: { groupId: user.groupId } });
  return { ok: true };
}

export async function listGroupManagerCandidates(session: SessionPayload, groupId: string) {
  requirePlatform(session);
  const users = await prisma.user.findMany({
    where: {
      NOT: { roles: { some: { roleCode: { in: [ROLES.GROUP_MANAGER, ROLES.SUPER_ADMIN] } } } },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      roles: { select: { roleCode: true } },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    take: 200,
  });
  return users.map((user) => ({ id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email, roles: user.roles.map((r) => r.roleCode) }));
}

// ---------------------------------------------------------------------------
// Seats-based subscription billing
// ---------------------------------------------------------------------------

export async function listGroupBilling(session: SessionPayload): Promise<BillingRow[]> {
  requirePlatform(session);
  const groups = await prisma.schoolGroup.findMany({ select: { id: true, name: true, pricePerSeat: true } });
  if (!groups.length) return [];
  const seatsByGroup = new Map<string, number>();
  for (const group of groups) {
    seatsByGroup.set(group.id, await seatCountFor(group.id));
  }
  const cycles = await prisma.groupBilling.findMany({ orderBy: [{ period: "desc" }, { groupId: "asc" }], take: 500, include: { payments: true } });
  return cycles.flatMap((cycle) => {
    const group = groups.find((g) => g.id === cycle.groupId);
    if (!group) return [];
    return [{ ...toCycle(cycle, seatsByGroup.get(group.id) ?? 0, group.pricePerSeat), groupId: group.id, groupName: group.name }];
  });
}

export type CreateBillingCycleInput = {
  groupId: string;
  period: string;
  status?: string;
  dueDate?: string | null;
  note?: string | null;
  pdfFileId?: string | null;
};

export async function createBillingCycle(session: SessionPayload, input: CreateBillingCycleInput): Promise<{ ok: true; id: string }> {
  requirePlatform(session);
  if (!input.groupId?.trim() || !isPeriod(input.period)) throw new Error("INVALID");
  const group = await prisma.schoolGroup.findUnique({ where: { id: input.groupId }, select: { id: true, pricePerSeat: true } });
  if (!group) throw new Error("NOT_FOUND");

  const seats = await seatCountFor(group.id);
  const amount = seats * group.pricePerSeat;
  const status = input.status === "PAID" || input.status === "OVERDUE" ? input.status : "PENDING";

  const cycle = await prisma.groupBilling.upsert({
    where: { groupId_period: { groupId: input.groupId, period: input.period } },
    update: { status, amount, dueDate: input.dueDate ? new Date(input.dueDate) : null, note: input.note?.trim() || null, pdfFileId: input.pdfFileId?.trim() || null, paidAt: status === "PAID" ? new Date() : null },
    create: { groupId: input.groupId, period: input.period, status, amount, dueDate: input.dueDate ? new Date(input.dueDate) : null, note: input.note?.trim() || null, pdfFileId: input.pdfFileId?.trim() || null, paidAt: status === "PAID" ? new Date() : null },
    select: { id: true },
  });

  await audit(session, { action: "GROUP.BILLING_CREATED", entityType: "GroupBilling", entityId: cycle.id, metadata: { groupId: input.groupId, period: input.period } });
  return { ok: true, id: cycle.id };
}

export type UpdateBillingCycleInput = {
  status?: string;
  dueDate?: string | null;
  note?: string | null;
};

export async function updateBillingCycle(session: SessionPayload, id: string, input: UpdateBillingCycleInput): Promise<{ ok: true }> {
  requirePlatform(session);
  const cycle = await prisma.groupBilling.findUnique({ where: { id }, select: { id: true } });
  if (!cycle) throw new Error("NOT_FOUND");

  const data: Record<string, unknown> = {};
  if (typeof input.status === "string") {
    data.status = input.status;
    if (input.status === "PAID") data.paidAt = new Date();
    if (input.status !== "PAID") data.paidAt = null;
  }
  if (input.hasOwnProperty("dueDate")) data.dueDate = input.dueDate ? new Date(input.dueDate) : null;
  if (typeof input.note === "string") data.note = input.note.trim() || null;

  if (!Object.keys(data).length) throw new Error("INVALID");

  await prisma.groupBilling.update({ where: { id }, data });
  await audit(session, { action: "GROUP.BILLING_UPDATED", entityType: "GroupBilling", entityId: id, metadata: { ...data } });
  return { ok: true };
}

export async function deleteBillingCycle(session: SessionPayload, id: string): Promise<{ ok: true }> {
  requirePlatform(session);
  const cycle = await prisma.groupBilling.findUnique({ where: { id }, select: { id: true } });
  if (!cycle) throw new Error("NOT_FOUND");
  await prisma.groupBilling.delete({ where: { id } });
  await audit(session, { action: "GROUP.BILLING_DELETED", entityType: "GroupBilling", entityId: id });
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Payments ledger (attached to a billing cycle)
// ---------------------------------------------------------------------------

export type RecordPaymentInput = {
  billingId: string;
  type: "add" | "charge" | "refund" | "credit";
  amount: number;
  note?: string | null;
  pdfFileId?: string | null;
};

const PAYMENT_TYPES = ["add", "charge", "refund", "credit"];

export async function recordGroupPayment(session: SessionPayload, input: RecordPaymentInput): Promise<{ ok: true; id: string }> {
  requirePlatform(session);
  const billingId = input.billingId?.trim();
  const amount = Number(input.amount);
  if (!billingId || !PAYMENT_TYPES.includes(input.type)) throw new Error("INVALID");
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("INVALID");

  const billing = await prisma.groupBilling.findUnique({ where: { id: billingId }, select: { id: true } });
  if (!billing) throw new Error("NOT_FOUND");

  const payment = await prisma.groupPayment.create({
    data: {
      billingId,
      type: input.type,
      amount: Math.round(amount),
      note: input.note?.trim() || null,
      pdfFileId: input.pdfFileId?.trim() || null,
    },
    select: { id: true },
  });

  await audit(session, {
    action: "GROUP.PAYMENT_RECORDED",
    entityType: "GroupPayment",
    entityId: payment.id,
    metadata: { billingId, type: input.type, amount: Math.round(amount) },
  });
  return { ok: true, id: payment.id };
}

export type GroupPaymentEntry = {
  id: string;
  billingId: string;
  period: string;
  groupId: string;
  groupName: string;
  type: string;
  amount: number;
  note: string | null;
  pdfFileId: string | null;
  createdAt: string;
};

export async function listGroupPayments(session: SessionPayload): Promise<GroupPaymentEntry[]> {
  requirePlatform(session);
  const payments = await prisma.groupPayment.findMany({
    include: { billing: { select: { period: true, group: { select: { id: true, name: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  return payments.map((p) => ({
    id: p.id,
    billingId: p.billingId,
    period: p.billing.period,
    groupId: p.billing.group.id,
    groupName: p.billing.group.name,
    type: p.type,
    amount: p.amount,
    note: p.note,
    pdfFileId: p.pdfFileId,
    createdAt: p.createdAt.toISOString(),
  }));
}
