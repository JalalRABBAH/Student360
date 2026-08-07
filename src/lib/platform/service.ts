/**
 * STUDENT360 — Platform directory service (multi-tenant).
 *
 * Only users holding the `tenant:manage` capability (SUPER_ADMIN) may read
 * platform-wide user and school directories. Every function re-checks the
 * capability defensively; the pages also gate with `requireCapability`.
 */

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { can, canManageSchool, hasRole } from "@/lib/auth/rbac";
import type { SessionPayload } from "@/lib/auth/session";
import { ROLES, ROLE_LABELS, type RoleCode } from "@/lib/domain/enums";
import { fullName, initials } from "@/lib/utils";
import { audit } from "@/lib/auth/audit";

const THIRTY_DAYS = 30 * 86_400_000;

const ROLE_PRIORITY: RoleCode[] = [
  ROLES.SUPER_ADMIN,
  ROLES.PRINCIPAL,
  ROLES.ADMIN,
  ROLES.NURSE,
  ROLES.TEACHER,
  ROLES.PARENT,
  ROLES.STUDENT,
];

function primaryRole(roles: { roleCode: string }[]): string {
  for (const code of ROLE_PRIORITY) {
    if (roles.some((role) => role.roleCode === code)) return ROLE_LABELS[code];
  }
  return "Staff";
}

// ---------------------------------------------------------------------------
// Public types (serializable — no Date instances)
// ---------------------------------------------------------------------------

export type PlatformUserEntry = {
  id: string;
  name: string;
  initials: string;
  email: string;
  schoolName: string | null;
  roleCodes: string[];
  roleLabel: string;
  status: "ACTIVE" | "INACTIVE";
  lastLoginAt: string | null;
};

export type PlatformSchoolEntry = {
  id: string;
  name: string;
  city: string | null;
  country: string;
  plan: string;
  status: string;
  seatsLimit: number;
  userCount: number;
  studentCount: number;
  teacherCount: number;
  createdAt: string;
};

export type PlatformOverview = {
  totalUsers: number;
  activeUsers: number;
  schools: number;
  activeSchools: number;
  seatsUsed: number;
  seatsLimit: number;
  students: number;
  teachers: number;
};

// ---------------------------------------------------------------------------
// Platform users
// ---------------------------------------------------------------------------

export async function listPlatformUsers(
  session: SessionPayload,
  opts: { q?: string; role?: string } = {},
): Promise<PlatformUserEntry[]> {
  if (!can(session, "tenant:manage")) return [];

  const where: Prisma.UserWhereInput = {};
  if (opts.role && opts.role !== "ALL") where.roles = { some: { roleCode: opts.role } };

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      isActive: true,
      lastLoginAt: true,
      roles: { select: { roleCode: true } },
      school: { select: { name: true } },
    },
    orderBy: [{ school: { name: "asc" } }, { lastName: "asc" }, { firstName: "asc" }],
    take: 500,
  });

  const query = opts.q?.trim().toLowerCase();
  return users
    .map((user) => ({
      id: user.id,
      name: fullName(user),
      initials: initials(user.firstName, user.lastName),
      email: user.email,
      schoolName: user.school?.name ?? null,
      roleCodes: user.roles.map((role) => role.roleCode),
      roleLabel: primaryRole(user.roles),
      status: (user.isActive ? "ACTIVE" : "INACTIVE") as "ACTIVE" | "INACTIVE",
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    }))
    .filter((entry) => {
      if (!query) return true;
      return `${entry.name} ${entry.email} ${entry.roleLabel} ${entry.schoolName ?? ""}`
        .toLowerCase()
        .includes(query);
    });
}

// ---------------------------------------------------------------------------
// Platform schools
// ---------------------------------------------------------------------------

export async function listPlatformSchools(
  session: SessionPayload,
  opts: { q?: string; status?: string } = {},
): Promise<PlatformSchoolEntry[]> {
  if (!can(session, "tenant:manage")) return [];

  const where: Prisma.SchoolWhereInput = {};
  if (opts.status && opts.status !== "ALL") where.status = opts.status;

  const schools = await prisma.school.findMany({
    where,
    select: {
      id: true,
      name: true,
      city: true,
      country: true,
      plan: true,
      status: true,
      seatsLimit: true,
      createdAt: true,
      _count: { select: { users: true, students: true, teachers: true } },
    },
    orderBy: { name: "asc" },
    take: 300,
  });

  const query = opts.q?.trim().toLowerCase();
  return schools
    .map((school) => ({
      id: school.id,
      name: school.name,
      city: school.city,
      country: school.country,
      plan: school.plan,
      status: school.status,
      seatsLimit: school.seatsLimit,
      userCount: school._count.users,
      studentCount: school._count.students,
      teacherCount: school._count.teachers,
      createdAt: school.createdAt.toISOString().slice(0, 10),
    }))
    .filter((entry) => {
      if (!query) return true;
      return `${entry.name} ${entry.city ?? ""} ${entry.country} ${entry.plan}`
        .toLowerCase()
        .includes(query);
    });
}

// ---------------------------------------------------------------------------
// Platform overview metrics
// ---------------------------------------------------------------------------

export async function getPlatformOverview(): Promise<PlatformOverview> {
  const since = new Date(Date.now() - THIRTY_DAYS);

  const [totalUsers, schoolUsers, activeUsers, schools, activeSchools, seats] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { schoolId: { not: null } } }),
    prisma.user.count({ where: { lastLoginAt: { gte: since } } }),
    prisma.school.count(),
    prisma.school.count({ where: { status: "ACTIVE" } }),
    prisma.school.findMany({ select: { seatsLimit: true } }),
  ]);

  const [students, teachers] = await Promise.all([
    prisma.student.count({ where: { status: "ACTIVE" } }),
    prisma.teacher.count({ where: { status: "ACTIVE" } }),
  ]);

  return {
    totalUsers,
    activeUsers,
    schools,
    activeSchools,
    seatsUsed: schoolUsers,
    seatsLimit: seats.reduce((sum, school) => sum + school.seatsLimit, 0),
    students,
    teachers,
  };
}

// ---------------------------------------------------------------------------
// Create establishment (leadership: ADMIN / PRINCIPAL / SUPER_ADMIN)
// ---------------------------------------------------------------------------

export type CreateEstablishmentInput = {
  name: string;
  city?: string | null;
  country?: string;
  plan?: string;
  seatsLimit?: number;
};

export type CreatedEstablishment = { ok: true; id: string; name: string; slug: string };

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function createEstablishment(session: SessionPayload, input: CreateEstablishmentInput): Promise<CreatedEstablishment> {
  if (!can(session, "school:configure") && !can(session, "establishment:manage")) throw new Error("FORBIDDEN");
  const name = input.name?.trim();
  if (!name) throw new Error("INVALID");

  let slug = slugify(name) || "school";
  let candidate = slug;
  let index = 1;
  while (await prisma.school.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${slug}-${index++}`;
  }

  const now = new Date();
  const yearName = `${now.getFullYear()}-${now.getFullYear() + 1}`;

  let school: { id: string; name: string; slug: string };
  try {
    school = await prisma.school.create({
      data: {
        name,
        slug: candidate,
        city: input.city?.trim() || null,
        country: input.country?.trim() || "MA",
        plan: input.plan || "PRO",
        status: "ACTIVE",
        seatsLimit: input.seatsLimit || 500,
        campuses: { create: { name, isMain: true } },
        academicYears: {
          create: { name: yearName, startDate: new Date(now.getFullYear(), 8, 1), endDate: new Date(now.getFullYear() + 1, 6, 31), isCurrent: true },
        },
      },
      select: { id: true, name: true, slug: true },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new Error("SLUG_TAKEN");
    throw error;
  }

  await audit(session, { action: "ESTABLISHMENT.CREATED", entityType: "School", entityId: school.id, metadata: { name: school.name } });

  // The creator manages the new establishment (school group manager flow).
  await prisma.establishmentAccess.upsert({
    where: { userId_schoolId: { userId: session.sub, schoolId: school.id } },
    update: {},
    create: { userId: session.sub, schoolId: school.id, role: hasRole(session, ROLES.SCHOOL_MANAGER) ? "MANAGER" : "ADMIN" },
  });

  return { ok: true, id: school.id, name: school.name, slug: school.slug };
}

// ---------------------------------------------------------------------------
// Managed establishments (for the top switcher + group manager page)
// ---------------------------------------------------------------------------

export type ManagedEstablishment = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  country: string;
  role: string;
  studentCount: number;
  teacherCount: number;
  classCount: number;
};

/** Establishments the caller may manage (own school + EstablishmentAccess; all for SUPER_ADMIN). */
export async function managedSchoolsFor(session: SessionPayload): Promise<{ id: string; name: string }[]> {
  if (hasRole(session, ROLES.SUPER_ADMIN)) {
    const rows = await prisma.school.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" }, take: 300 });
    return rows;
  }

  const access = await prisma.establishmentAccess.findMany({
    where: { userId: session.sub },
    select: { schoolId: true, school: { select: { id: true, name: true } } },
    orderBy: { school: { name: "asc" } },
  });
  const map = new Map<string, { id: string; name: string }>();
  access.forEach((row) => map.set(row.schoolId, { id: row.school.id, name: row.school.name }));

  if (session.schoolId && !map.has(session.schoolId)) {
    const own = await prisma.school.findUnique({ where: { id: session.schoolId }, select: { id: true, name: true } });
    if (own) map.set(own.id, { id: own.id, name: own.name });
  }
  return [...map.values()];
}

/** Detail list for the "Establishments" group-management page. */
export async function listManagedEstablishments(session: SessionPayload): Promise<ManagedEstablishment[]> {
  if (!can(session, "establishment:manage") && !can(session, "school:configure")) return [];

  const schools = await managedSchoolsFor(session);
  if (!schools.length) return [];

  const withCounts = await prisma.establishmentAccess.findMany({
    where: { userId: session.sub },
    select: { schoolId: true, role: true },
  });
  const roleBySchool = new Map(withCounts.map((row) => [row.schoolId, row.role]));

  const ids = schools.map((s) => s.id);
  const [students, teachers, classes] = await Promise.all([
    prisma.student.groupBy({ by: ["schoolId"], where: { schoolId: { in: ids }, status: "ACTIVE" }, _count: { _all: true } }),
    prisma.teacher.groupBy({ by: ["schoolId"], where: { schoolId: { in: ids }, status: "ACTIVE" }, _count: { _all: true } }),
    prisma.schoolClass.groupBy({ by: ["schoolId"], where: { schoolId: { in: ids } }, _count: { _all: true } }),
  ]);
  const count = (rows: { schoolId: string; _count: { _all: number } }[], id: string) => rows.find((r) => r.schoolId === id)?._count._all ?? 0;

  const details = await prisma.school.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, slug: true, city: true, country: true },
    orderBy: { name: "asc" },
  });

  return details.map((school) => ({
    id: school.id,
    name: school.name,
    slug: school.slug,
    city: school.city,
    country: school.country,
    role: roleBySchool.get(school.id) ?? "ADMIN",
    studentCount: count(students, school.id),
    teacherCount: count(teachers, school.id),
    classCount: count(classes, school.id),
  }));
}
