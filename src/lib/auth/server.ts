import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE, type SessionPayload, verifySession } from "@/lib/auth/session";
import { type Capability, can } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { defaultLocale, isLocale, localizePath } from "@/i18n/config";

async function localizedPath(path: string) {
  const requestHeaders = await headers();
  const localeValue = requestHeaders.get("x-s360-locale");
  return localizePath(path, isLocale(localeValue) ? localeValue : defaultLocale);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  if (!session || !token) return null;

  const activeSession = await prisma.session.findFirst({
    where: {
      id: session.sid,
      userId: session.sub,
      token,
      expiresAt: { gt: new Date() },
      user: { isActive: true },
    },
    select: { id: true },
  });

  return activeSession ? session : null;
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect(await localizedPath("/login"));
  return session;
}

export async function requireCapability(capability: Capability): Promise<SessionPayload> {
  const session = await requireSession();
  if (!can(session, capability)) redirect(await localizedPath("/forbidden"));
  return session;
}

/** API-route variant: returns 401/403 payloads instead of redirecting. */
export async function apiSession() {
  const session = await getSession();
  if (!session) return { session: null as null, error: { status: 401, message: "Authentication required" } };
  return { session, error: null };
}

export function apiForbidden(message = "You do not have access to this resource") {
  return Response.json({ error: message }, { status: 403 });
}

export function apiUnauthorized(message = "Authentication required") {
  return Response.json({ error: message }, { status: 401 });
}
