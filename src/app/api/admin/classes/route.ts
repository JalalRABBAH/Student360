import { NextResponse } from "next/server";

import { apiSession } from "@/lib/auth/server";
import { createClass } from "@/lib/admin/service";

export async function POST(req: Request) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload", code: "VALIDATION" }, { status: 400 });
  }

  try {
    const result = await createClass(session!, {
      name: typeof body.name === "string" ? body.name : "",
      gradeLevel: typeof body.gradeLevel === "string" ? body.gradeLevel : "",
      section: typeof body.section === "string" ? body.section : null,
      room: typeof body.room === "string" ? body.room : null,
      capacity: typeof body.capacity === "number" ? body.capacity : 30,
      homeroomTeacherId: typeof body.homeroomTeacherId === "string" ? body.homeroomTeacherId : null,
    });
    return NextResponse.json(result);
  } catch (e) {
    const code = typeof e === "string" ? e : "ERROR";
    const status = code === "FORBIDDEN" ? 403 : code === "CLASS_TAKEN" ? 409 : code === "NO_ACADEMIC_YEAR" ? 400 : 400;
    return NextResponse.json({ error: code, code }, { status });
  }
}
