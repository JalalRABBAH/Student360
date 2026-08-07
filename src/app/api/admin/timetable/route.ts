import { NextResponse } from "next/server";

import { apiSession } from "@/lib/auth/server";
import { deleteTimetableSlot, saveTimetableSlot } from "@/lib/admin/service";
import { errorCode } from "@/lib/errors";

export async function POST(req: Request) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload", code: "VALIDATION" }, { status: 400 });
  }

  const dayOfWeek = Number(body.dayOfWeek);
  try {
    const result = await saveTimetableSlot(session!, {
      classId: typeof body.classId === "string" ? body.classId : "",
      dayOfWeek: Number.isInteger(dayOfWeek) ? dayOfWeek : 0,
      startTime: typeof body.startTime === "string" ? body.startTime : "",
      endTime: typeof body.endTime === "string" ? body.endTime : "",
      subjectId: typeof body.subjectId === "string" ? body.subjectId : null,
      teacherId: typeof body.teacherId === "string" ? body.teacherId : null,
      room: typeof body.room === "string" ? body.room : null,
    });
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
  const id = typeof body?.id === "string" ? body.id : "";
  try {
    const result = await deleteTimetableSlot(session!, id);
    return NextResponse.json(result);
  } catch (e) {
    const code = errorCode(e);
    return NextResponse.json({ error: code, code }, { status: code === "NOT_FOUND" ? 404 : 400 });
  }
}
