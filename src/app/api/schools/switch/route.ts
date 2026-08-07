import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { apiSession } from "@/lib/auth/server";
import { canManageSchool } from "@/lib/auth/rbac";
import { SESSION_COOKIE, cookieOptions, signSession, type SessionPayload } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const body = await req.json().catch(() => null);
  const schoolId = typeof body?.schoolId === "string" ? body.schoolId.trim() : "";
  if (!schoolId) return NextResponse.json({ error: "Missing schoolId", code: "INVALID" }, { status: 400 });

  const allowed = await canManageSchool(session!, schoolId);
  if (!allowed) return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });

  const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { name: true } });
  if (!school) return NextResponse.json({ error: "School not found", code: "NOT_FOUND" }, { status: 404 });

  const payload: SessionPayload = {
    sub: session!.sub,
    email: session!.email,
    firstName: session!.firstName,
    lastName: session!.lastName,
    avatarUrl: session!.avatarUrl ?? null,
    schoolId,
    schoolName: school.name,
    roles: session!.roles,
    activeRole: session!.activeRole,
    studentId: null,
    teacherId: null,
    guardianId: null,
    locale: session!.locale,
    sid: session!.sid,
  };

  const token = await signSession(payload);
  await prisma.session.update({ where: { id: session!.sid }, data: { token } });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, cookieOptions());

  return NextResponse.json({ ok: true, schoolId, schoolName: school.name });
}
