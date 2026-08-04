import { prisma } from "@/lib/db";
import type { SessionPayload } from "@/lib/auth/session";

type AuditInput = {
  action: string;
  entityType?: string;
  entityId?: string;
  studentId?: string;
  metadata?: unknown;
  ip?: string | null;
  userAgent?: string | null;
};

/**
 * Append-only audit trail. Failures are swallowed on purpose: auditing must
 * never break a legitimate user action, but it is always attempted.
 */
export async function audit(session: SessionPayload | null, input: AuditInput) {
  try {
    await prisma.auditLog.create({
      data: {
        schoolId: session?.schoolId ?? null,
        actorId: session?.sub ?? null,
        actorRole: session?.activeRole ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        studentId: input.studentId,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        ip: input.ip ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
  } catch {
    // intentionally ignored
  }
}
