import { NextResponse } from "next/server";

import { apiSession } from "@/lib/auth/server";
import { isLeadership } from "@/lib/auth/rbac";
import { deleteTemplate, toggleTemplate } from "@/lib/actions/service";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });
  if (!isLeadership(session!)) return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });

  const { id } = await params;
  try {
    const result = await toggleTemplate(session!, id);
    return NextResponse.json(result);
  } catch (e) {
    const code = typeof e === "string" ? e : "ERROR";
    return NextResponse.json({ error: code, code }, { status: code === "NOT_FOUND" ? 404 : 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });
  if (!isLeadership(session!)) return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });

  const { id } = await params;
  try {
    const result = await deleteTemplate(session!, id);
    return NextResponse.json(result);
  } catch (e) {
    const code = typeof e === "string" ? e : "ERROR";
    return NextResponse.json({ error: code, code }, { status: code === "NOT_FOUND" ? 404 : 400 });
  }
}
