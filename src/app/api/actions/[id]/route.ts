import { NextResponse } from "next/server";

import { apiSession } from "@/lib/auth/server";
import { completeAction, skipAction } from "@/lib/actions/service";
import { errorCode } from "@/lib/errors";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const action = body?.action === "SKIP" ? "SKIP" : "COMPLETE";

  try {
    const result = action === "SKIP" ? await skipAction(session!, id) : await completeAction(session!, id, typeof body?.note === "string" ? body.note : undefined);
    return NextResponse.json(result);
  } catch (e) {
    const code = errorCode(e);
    const status = code === "NOT_FOUND" ? 404 : code === "ALREADY_RESOLVED" ? 409 : 400;
    return NextResponse.json({ error: code, code }, { status });
  }
}
