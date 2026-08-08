import { SignJWT, jwtVerify } from "jose";

import type { RoleCode } from "@/lib/domain/enums";

export const SESSION_COOKIE = "s360_session";
export const THEME_COOKIE = "s360_theme";
export const LOCALE_COOKIE = "s360_locale";

export type SessionPayload = {
  /** user id */
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  schoolId: string | null;
  schoolName?: string | null;
  groupId?: string | null;
  roles: RoleCode[];
  activeRole: RoleCode;
  /** linked domain ids for fast authorisation */
  studentId?: string | null;
  teacherId?: string | null;
  guardianId?: string | null;
  locale: string;
  /** session id (matches the Session table row for revocation / audit) */
  sid: string;
};

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is required in production");
  }
  return new TextEncoder().encode(
    (value ?? "student360-development-secret-key-change-me").padEnd(32, "0"),
  );
}

export function sessionMaxAge() {
  const value = Number(process.env.AUTH_SESSION_MAX_AGE ?? 43_200);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("AUTH_SESSION_MAX_AGE must be a positive number");
  }
  return Math.floor(value);
}

export async function signSession(payload: SessionPayload) {
  const maxAge = sessionMaxAge();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("student360")
    .setAudience("student360-app")
    .setExpirationTime(`${maxAge}s`)
    .sign(secret());
}

export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), {
      issuer: "student360",
      audience: "student360-app",
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAge(),
  };
}
