import { NextResponse } from "next/server";

import { apiSession } from "@/lib/auth/server";
import { createParent } from "@/lib/admin/service";

export async function POST(req: Request) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload", code: "VALIDATION" }, { status: 400 });
  }

  try {
    const created = await createParent(session!, {
      firstName: typeof body.firstName === "string" ? body.firstName : "",
      lastName: typeof body.lastName === "string" ? body.lastName : "",
      email: typeof body.email === "string" ? body.email : "",
      studentIds: Array.isArray(body.studentIds) ? body.studentIds.map(String) : [],
      relationship: typeof body.relationship === "string" ? body.relationship : undefined,
    });
    return NextResponse.json({ ok: true, ...created });
  } catch (e) {
    const code = typeof e === "string" ? e : "ERROR";
    const status = code === "FORBIDDEN" ? 403 : code === "EMAIL_TAKEN" ? 409 : 400;
    return NextResponse.json({ error: code, code }, { status });
  }
}
