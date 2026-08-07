import { NextResponse } from "next/server";

import { apiSession } from "@/lib/auth/server";
import { assignTeacherToClass, unassignTeacherFromClass } from "@/lib/admin/service";

export async function POST(req: Request) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload", code: "VALIDATION" }, { status: 400 });
  }

  try {
    const result = await assignTeacherToClass(session!, {
      teacherId: typeof body.teacherId === "string" ? body.teacherId : "",
      classId: typeof body.classId === "string" ? body.classId : "",
      subjectId: typeof body.subjectId === "string" ? body.subjectId : null,
      role: typeof body.role === "string" ? body.role : undefined,
    });
    return NextResponse.json(result);
  } catch (e) {
    const code = typeof e === "string" ? e : "ERROR";
    const status = code === "FORBIDDEN" ? 403 : code === "NOT_FOUND" ? 404 : code === "DUPLICATE" ? 409 : 400;
    return NextResponse.json({ error: code, code }, { status });
  }
}

export async function DELETE(req: Request) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const body = await req.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  try {
    const result = await unassignTeacherFromClass(session!, id);
    return NextResponse.json(result);
  } catch (e) {
    const code = typeof e === "string" ? e : "ERROR";
    return NextResponse.json({ error: code, code }, { status: code === "NOT_FOUND" ? 404 : 400 });
  }
}
