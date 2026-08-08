import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { signSession, cookieOptions, SESSION_COOKIE, sessionMaxAge } from "@/lib/auth/session";
import { audit } from "@/lib/auth/audit";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { RoleCode } from "@/lib/domain/enums";
import { locales } from "@/i18n/config";

const bodySchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(6),
  locale: z.enum(locales).optional(),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password format" }, { status: 400 });
  }

  const { email, password, locale } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      school: true,
      roles: { select: { roleCode: true } },
      student: { select: { id: true } },
      teacher: { select: { id: true } },
      guardian: { select: { id: true } },
    },
  });

  if (!user || !user.isActive) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const roles = user.roles.map((r) => r.roleCode) as RoleCode[];
  const activeRole = roles[0] ?? "TEACHER";
  const maxAge = sessionMaxAge();
  const activeLocale = locale ?? user.locale;

  await prisma.user.update({
    where: { id: user.id },
    data: { locale: locale ?? user.locale, lastLoginAt: new Date() },
  });

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token: "placeholder",
      expiresAt: new Date(Date.now() + maxAge * 1000),
      ip: req.headers.get("x-forwarded-for") ?? "",
      userAgent: req.headers.get("user-agent") ?? "",
    },
  });

  const payload = {
    sub: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
    schoolId: user.schoolId,
    schoolName: user.school?.name ?? null,
    groupId: user.groupId,
    roles,
    activeRole,
    studentId: user.student?.id ?? null,
    teacherId: user.teacher?.id ?? null,
    guardianId: user.guardian?.id ?? null,
    locale: activeLocale,
    sid: session.id,
  };

  const token = await signSession(payload);

  await prisma.session.update({
    where: { id: session.id },
    data: { token },
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, cookieOptions());

  await audit(
    {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      schoolId: user.schoolId,
      groupId: user.groupId,
      roles,
      activeRole,
      locale: activeLocale,
      sid: session.id,
    },
    {
      action: "LOGIN",
      entityType: "User",
      entityId: user.id,
      metadata: { schoolName: user.school?.name ?? null },
      ip: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
    },
  );

  return NextResponse.json({ ok: true, user: { firstName: user.firstName, role: activeRole } });
}
