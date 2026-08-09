import { NextResponse } from "next/server";

import { apiSession } from "@/lib/auth/server";
import {
  assignEstablishmentManager,
  removeEstablishmentManager,
  updateEstablishmentManager,
} from "@/lib/admin/service";
import { canManageSchool } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db";
import { ROLES } from "@/lib/domain/enums";
import { errorCode } from "@/lib/errors";

export async function POST(req: Request) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload", code: "VALIDATION" }, { status: 400 });
  }

  const role = body.role === "ADMIN" || body.role === "PRINCIPAL" ? body.role : "";
  if (!role) {
    return NextResponse.json({ error: "Invalid role", code: "VALIDATION" }, { status: 400 });
  }

  try {
    const result = await assignEstablishmentManager(session!, {
      schoolId: typeof body.schoolId === "string" ? body.schoolId : "",
      role,
      mode: body.mode === "new" ? "new" : "existing",
      email: typeof body.email === "string" ? body.email : "",
      firstName: typeof body.firstName === "string" ? body.firstName : undefined,
      lastName: typeof body.lastName === "string" ? body.lastName : undefined,
    });
    return NextResponse.json(result);
  } catch (e) {
    const code = errorCode(e);
    const status =
      code === "FORBIDDEN" ? 403 : code === "NOT_FOUND" ? 404 : code === "EMAIL_TAKEN" ? 409 : 400;
    return NextResponse.json({ error: code, code }, { status });
  }
}

export async function PATCH(req: Request) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload", code: "VALIDATION" }, { status: 400 });
  }

  const role = body.role === "ADMIN" || body.role === "PRINCIPAL" ? body.role : "";
  const userId = typeof body.userId === "string" ? body.userId : "";
  const schoolId = typeof body.schoolId === "string" ? body.schoolId : "";

  if (!userId || !schoolId || !role) {
    return NextResponse.json({ error: "Missing fields", code: "VALIDATION" }, { status: 400 });
  }

  try {
    const result = await updateEstablishmentManager(session!, { userId, schoolId, role });
    return NextResponse.json(result);
  } catch (e) {
    const code = errorCode(e);
    const status = code === "FORBIDDEN" ? 403 : code === "NOT_FOUND" ? 404 : 400;
    return NextResponse.json({ error: code, code }, { status });
  }
}

export async function DELETE(req: Request) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload", code: "VALIDATION" }, { status: 400 });
  }

  const userId = typeof body.userId === "string" ? body.userId : "";
  const schoolId = typeof body.schoolId === "string" ? body.schoolId : "";

  if (!userId || !schoolId) {
    return NextResponse.json({ error: "Missing fields", code: "VALIDATION" }, { status: 400 });
  }

  try {
    await removeEstablishmentManager(session!, { userId, schoolId });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const code = errorCode(e);
    const status = code === "FORBIDDEN" ? 403 : code === "NOT_FOUND" ? 404 : 400;
    return NextResponse.json({ error: code, code }, { status });
  }
}

export async function GET(req: Request) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get("schoolId") ?? "";
  const role = searchParams.get("role") === "ADMIN" || searchParams.get("role") === "PRINCIPAL" ? searchParams.get("role")! : "";

  if (!schoolId || !role) {
    return NextResponse.json({ error: "Missing schoolId or role", code: "VALIDATION" }, { status: 400 });
  }

  const allowed = await canManageSchool(session!, schoolId);
  if (!allowed) {
    return NextResponse.json({ error: "FORBIDDEN", code: "FORBIDDEN" }, { status: 403 });
  }

  const accessRole = role;
  const [alreadyAssigned, candidates] = await Promise.all([
    prisma.establishmentAccess.findMany({
      where: { schoolId, role: accessRole },
      select: { userId: true },
    }),
    prisma.user.findMany({
      where: {
        OR: [{ schoolId }, { groupId: session!.groupId ?? "__none__" }],
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
    }),
  ]);

  const assignedIds = new Set(alreadyAssigned.map((a) => a.userId));
  const filtered = candidates
    .filter((user) => !assignedIds.has(user.id))
    .map((user) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      roles: user.roles.map((r) => r.roleCode),
    }));

  return NextResponse.json({ candidates: filtered });
}
