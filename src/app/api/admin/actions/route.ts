import { NextResponse } from "next/server";

import { apiSession } from "@/lib/auth/server";
import { isLeadership } from "@/lib/auth/rbac";
import { createTemplate, listTemplates } from "@/lib/actions/service";

export async function GET() {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });
  if (!isLeadership(session!)) return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });

  try {
    const templates = await listTemplates(session!);
    return NextResponse.json({ templates });
  } catch (e) {
    const code = typeof e === "string" ? e : "ERROR";
    return NextResponse.json({ error: code, code }, { status: code === "FORBIDDEN" ? 403 : 400 });
  }
}

export async function POST(req: Request) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });
  if (!isLeadership(session!)) return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });

  const body = await req.json().catch(() => null);
  try {
    const result = await createTemplate(session!, {
      code: typeof body?.code === "string" ? body.code : "",
      title: typeof body?.title === "string" ? body.title : "",
      description: typeof body?.description === "string" ? body.description : null,
      targetRole: typeof body?.targetRole === "string" ? body.targetRole : "TEACHER",
      required: typeof body?.required === "string" ? body.required : "OPTIONAL",
      frequency: typeof body?.frequency === "string" ? body.frequency : "WEEKLY",
      classId: typeof body?.classId === "string" ? body.classId : null,
    });
    return NextResponse.json(result);
  } catch (e) {
    const code = typeof e === "string" ? e : "ERROR";
    const status = code === "FORBIDDEN" ? 403 : code === "DUPLICATE" ? 409 : 400;
    return NextResponse.json({ error: code, code }, { status });
  }
}
