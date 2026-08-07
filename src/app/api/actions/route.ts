import { NextResponse } from "next/server";

import { apiSession } from "@/lib/auth/server";
import { assignAction, listMyActions } from "@/lib/actions/service";

export async function GET() {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });
  const data = await listMyActions(session!);
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const body = await req.json().catch(() => null);
  const dueDate = typeof body?.dueDate === "string" ? body.dueDate : null;
  const title = typeof body?.title === "string" ? body.title : "";
  const assigneeUserId = typeof body?.assigneeUserId === "string" ? body.assigneeUserId : "";

  try {
    const result = await assignAction(session!, {
      assigneeUserId,
      title,
      description: typeof body?.description === "string" ? body.description : null,
      dueDate: dueDate ?? "",
      required: typeof body?.required === "string" ? body.required : undefined,
      studentId: typeof body?.studentId === "string" ? body.studentId : null,
    });
    return NextResponse.json(result);
  } catch (e) {
    const code = typeof e === "string" ? e : "ERROR";
    const status = code === "FORBIDDEN" ? 403 : code === "NOT_FOUND" ? 404 : 400;
    return NextResponse.json({ error: code, code }, { status });
  }
}
