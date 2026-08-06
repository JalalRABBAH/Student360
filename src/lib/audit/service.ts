/**
 * STUDENT360 — Audit trail service.
 *
 * Reads the append-only AuditLog table within the caller's RBAC scope:
 *   • SUPER_ADMIN → every tenant + platform-level events
 *   • ADMIN / PRINCIPAL → their own school only
 *
 * Every function re-checks the `audit:read` capability defensively; the pages
 * also gate with `requireCapability`.
 */

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { can } from "@/lib/auth/rbac";
import type { SessionPayload } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/domain/enums";
import { fullName } from "@/lib/utils";

const DAY_MS = 86_400_000;

/** Action code → category label (i18n key). */
const ACTION_CATEGORY: Record<string, string> = {
  LOGIN: "Authentication",
  LOGOUT: "Authentication",
  SEND_MESSAGE: "Communication",
  CREATE_THREAD: "Communication",
  EXPORT_REPORT: "Exports",
  UPDATE_SETTINGS: "Configuration",
};

/** Action code → human detail label (i18n key). */
const ACTION_DETAIL: Record<string, string> = {
  LOGIN: "Signed in",
  LOGOUT: "Signed out",
  SEND_MESSAGE: "Sent a message",
  CREATE_THREAD: "Started a conversation",
  EXPORT_REPORT: "Exported a report",
  UPDATE_SETTINGS: "Updated school settings",
};

export const AUDIT_CATEGORIES = ["All actions", "Authentication", "Communication", "Exports", "Configuration"] as const;

export type AuditEntry = {
  id: string;
  action: string;
  category: string;
  detail: string | null;
  actorName: string | null;
  actorRole: string | null;
  schoolName: string | null;
  entityType: string | null;
  ip: string | null;
  createdAt: string;
};

export type AuditOverview = {
  eventsToday: number;
  loginsToday: number;
  messagesToday: number;
  activeSessions: number;
};

function scopeWhere(session: SessionPayload): Prisma.AuditLogWhereInput {
  return session.schoolId ? { schoolId: session.schoolId } : {};
}

// ---------------------------------------------------------------------------
// Logs
// ---------------------------------------------------------------------------

export async function listAuditLogs(
  session: SessionPayload,
  opts: { q?: string; category?: string } = {},
): Promise<AuditEntry[]> {
  if (!can(session, "audit:read")) return [];

  const where: Prisma.AuditLogWhereInput = { ...scopeWhere(session) };
  if (opts.category && opts.category !== "All actions") {
    const actions = Object.entries(ACTION_CATEGORY)
      .filter(([, category]) => category === opts.category)
      .map(([action]) => action);
    if (actions.length) where.action = { in: actions };
  }

  const rows = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 500,
    include: {
      actor: { select: { firstName: true, lastName: true, roles: { select: { roleCode: true } } } },
      school: { select: { name: true } },
    },
  });

  const query = opts.q?.trim().toLowerCase();
  return rows
    .map((log) => {
      const actorRole =
        log.actorRole && ROLE_LABELS[log.actorRole as keyof typeof ROLE_LABELS]
          ? ROLE_LABELS[log.actorRole as keyof typeof ROLE_LABELS]
          : log.actorRole;
      return {
        id: log.id,
        action: log.action,
        category: ACTION_CATEGORY[log.action] ?? "Other",
        detail: ACTION_DETAIL[log.action] ?? null,
        actorName: log.actor ? fullName(log.actor) : null,
        actorRole: actorRole ?? null,
        schoolName: log.school?.name ?? null,
        entityType: log.entityType ?? null,
        ip: log.ip || null,
        createdAt: log.createdAt.toISOString(),
      };
    })
    .filter((entry) => {
      if (!query) return true;
      return [entry.actorName, entry.actorRole, entry.action, entry.category, entry.detail, entry.schoolName, entry.entityType]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
}

// ---------------------------------------------------------------------------
// Overview metrics
// ---------------------------------------------------------------------------

export async function getAuditOverview(session: SessionPayload): Promise<AuditOverview> {
  if (!can(session, "audit:read")) {
    return { eventsToday: 0, loginsToday: 0, messagesToday: 0, activeSessions: 0 };
  }

  const today = new Date(Date.now() - Date.now() % DAY_MS);
  const base: Prisma.AuditLogWhereInput = { ...scopeWhere(session), createdAt: { gte: today } };
  const sessionWhere: Prisma.SessionWhereInput = { expiresAt: { gt: new Date() } };
  if (session.schoolId) {
    sessionWhere.user = { schoolId: session.schoolId };
  }

  const [eventsToday, loginsToday, messagesToday, activeSessions] = await Promise.all([
    prisma.auditLog.count({ where: base }),
    prisma.auditLog.count({ where: { ...base, action: "LOGIN" } }),
    prisma.auditLog.count({ where: { ...base, action: "SEND_MESSAGE" } }),
    prisma.session.count({ where: sessionWhere }),
  ]);

  return { eventsToday, loginsToday, messagesToday, activeSessions };
}
