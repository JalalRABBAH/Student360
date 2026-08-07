import { NextResponse } from "next/server";

import { apiSession } from "@/lib/auth/server";
import { createTeacher } from "@/lib/admin/service";
import { errorCode } from "@/lib/errors";

export async function POST(req: Request) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload", code: "VALIDATION" }, { status: 400 });
  }

  try {
    const created = await createTeacher(session!, {
      firstName: typeof body.firstName === "string" ? body.firstName : "",
      lastName: typeof body.lastName === "string" ? body.lastName : "",
      email: typeof body.email === "string" ? body.email : "",
      title: typeof body.title === "string" ? body.title : undefined,
      specialtyCode: typeof body.specialtyCode === "string" ? body.specialtyCode : null,
      classIds: Array.isArray(body.classIds) ? body.classIds.map(String) : [],
    });
    return NextResponse.json({ ok: true, ...created });
  } catch (e) {
    const code = errorCode(e);
    const status = code === "FORBIDDEN" ? 403 : code === "EMAIL_TAKEN" ? 409 : 400;
    return NextResponse.json({ error: code, code }, { status });
  }
}
