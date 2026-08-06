import { NextResponse } from "next/server";
import { z } from "zod";

import { apiSession } from "@/lib/auth/server";
import { can } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db";

const VALID_KEYS = ["GRADING_SYSTEM", "ATTENDANCE_TYPES", "CHECKIN_QUESTIONS", "ALERT_THRESHOLDS", "PARENT_VISIBILITY", "LANGUAGES"] as const;

const updateSchema = z.object({
  key: z.enum(VALID_KEYS),
  values: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
});

export async function PUT(req: Request) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const schoolId = session!.schoolId;
  if (!schoolId) return NextResponse.json({ error: "No school context", code: "NO_SCHOOL" }, { status: 403 });
  if (!can(session!, "school:configure")) {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
  }

  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid configuration payload", code: "VALIDATION" }, { status: 400 });
  }

  const { key, values } = parsed.data;

  const row = await prisma.schoolConfig.upsert({
    where: { schoolId_key: { schoolId, key } },
    create: { schoolId, key, value: JSON.stringify(values), updatedById: session!.sub },
    update: { value: JSON.stringify(values), updatedById: session!.sub },
    select: { id: true },
  });

  await prisma.auditLog.create({
    data: {
      schoolId,
      actorId: session!.sub,
      actorRole: session!.roles[0] ?? null,
      action: "UPDATE_SETTINGS",
      entityType: "SCHOOL_CONFIG",
      entityId: key,
      metadata: JSON.stringify({ keys: Object.keys(values) }),
    },
  });

  return NextResponse.json({ ok: true, id: row.id }, { status: 200 });
}
