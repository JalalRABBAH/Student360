import { NextResponse } from "next/server";

import { apiSession } from "@/lib/auth/server";
import { createStudent, isAdminActionError } from "@/lib/admin/service";
import { errorCode } from "@/lib/errors";

export async function POST(req: Request) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload", code: "VALIDATION" }, { status: 400 });
  }

  try {
    const created = await createStudent(session!, {
      firstName: typeof body.firstName === "string" ? body.firstName : "",
      lastName: typeof body.lastName === "string" ? body.lastName : "",
      email: typeof body.email === "string" ? body.email : "",
      classId: typeof body.classId === "string" ? body.classId : null,
      dateOfBirth: typeof body.dateOfBirth === "string" ? body.dateOfBirth : null,
      gender: typeof body.gender === "string" ? body.gender : null,
      studentNumber: typeof body.studentNumber === "string" ? body.studentNumber : null,
      guardians: Array.isArray(body.guardians) ? body.guardians : [],
    });
    return NextResponse.json({ ok: true, ...created });
  } catch (e) {
    const code = errorCode(e);
    if (code !== "FORBIDDEN" && !isAdminActionError(code)) {
      console.error("createStudent failed", e);
    }
    const status = code === "FORBIDDEN" ? 403 : code === "EMAIL_TAKEN" ? 409 : 400;
    return NextResponse.json({ error: code, code }, { status });
  }
}
