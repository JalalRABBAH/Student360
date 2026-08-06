import { NextResponse } from "next/server";
import { z } from "zod";

import { apiSession } from "@/lib/auth/server";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  options: z.array(z.string().trim().min(1).max(80)).max(8).default([]),
  note: z.string().trim().max(1000).optional(),
});

export async function POST(req: Request) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  if (!session!.studentId || !session!.schoolId) {
    return NextResponse.json({ error: "Only students can request help" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid help request", code: "VALIDATION" }, { status: 400 });
  }

  const input = parsed.data;
  const description = input.note?.trim() || input.options.join(", ") || null;

  const event = await prisma.activityEvent.create({
    data: {
      schoolId: session!.schoolId,
      studentId: session!.studentId,
      actorId: session!.sub,
      type: "HELP_REQUEST",
      title: "Student requested assistance",
      description,
      sentiment: "ATTENTION",
      icon: "life-buoy",
      visibility: "SCHOOL_STAFF",
      metadata: JSON.stringify({ options: input.options }),
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, id: event.id }, { status: 201 });
}
