import { NextResponse } from "next/server";

import { apiSession } from "@/lib/auth/server";
import { createBillingCycle, deleteBillingCycle, listGroupBilling, updateBillingCycle } from "@/lib/platform/groups";
import { errorCode } from "@/lib/errors";

export async function GET() {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });
  try {
    const cycles = await listGroupBilling(session!);
    return NextResponse.json({ cycles });
  } catch (e) {
    const code = errorCode(e);
    const status = code === "FORBIDDEN" ? 403 : 400;
    return NextResponse.json({ error: code, code }, { status });
  }
}

export async function POST(req: Request) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload", code: "VALIDATION" }, { status: 400 });
  }

  try {
    const result = await createBillingCycle(session!, {
      groupId: typeof body.groupId === "string" ? body.groupId : "",
      period: typeof body.period === "string" ? body.period : "",
      status: typeof body.status === "string" ? body.status : undefined,
      dueDate: typeof body.dueDate === "string" ? body.dueDate : null,
      note: typeof body.note === "string" ? body.note : null,
    });
    return NextResponse.json(result);
  } catch (e) {
    const code = errorCode(e);
    const status = code === "FORBIDDEN" ? 403 : code === "NOT_FOUND" ? 404 : 400;
    return NextResponse.json({ error: code, code }, { status });
  }
}

export async function PATCH(req: Request) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const body = await req.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Missing id", code: "INVALID" }, { status: 400 });

  try {
    const result = await updateBillingCycle(session!, id, {
      status: typeof body.status === "string" ? body.status : undefined,
      dueDate: body.hasOwnProperty("dueDate") ? (typeof body.dueDate === "string" ? body.dueDate : null) : undefined,
      note: typeof body.note === "string" ? body.note : undefined,
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
  if (!id) return NextResponse.json({ error: "Missing id", code: "INVALID" }, { status: 400 });

  try {
    const result = await deleteBillingCycle(session!, id);
    return NextResponse.json(result);
  } catch (e) {
    const code = errorCode(e);
    const status = code === "FORBIDDEN" ? 403 : code === "NOT_FOUND" ? 404 : 400;
    return NextResponse.json({ error: code, code }, { status });
  }
}
