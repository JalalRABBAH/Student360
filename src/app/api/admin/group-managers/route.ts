import { NextResponse } from "next/server";

import { apiSession } from "@/lib/auth/server";
import { assignGroupManager, listGroupManagerCandidates, removeGroupManager } from "@/lib/platform/groups";
import { errorCode } from "@/lib/errors";

export async function POST(req: Request) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload", code: "VALIDATION" }, { status: 400 });
  }

  try {
    const result = await assignGroupManager(session!, {
      groupId: typeof body.groupId === "string" ? body.groupId : "",
      mode: body.mode === "new" ? "new" : "existing",
      email: typeof body.email === "string" ? body.email : "",
      firstName: typeof body.firstName === "string" ? body.firstName : undefined,
      lastName: typeof body.lastName === "string" ? body.lastName : undefined,
    });
    return NextResponse.json(result);
  } catch (e) {
    const code = errorCode(e);
    const status =
      code === "FORBIDDEN" ? 403
        : code === "NOT_FOUND" ? 404
          : code === "EMAIL_TAKEN" ? 409
            : code === "ALREADY_MANAGER" ? 409
              : 400;
    return NextResponse.json({ error: code, code }, { status });
  }
}

export async function DELETE(req: Request) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const body = await req.json().catch(() => null);
  const userId = typeof body?.userId === "string" ? body.userId : "";
  if (!userId) return NextResponse.json({ error: "Missing userId", code: "INVALID" }, { status: 400 });

  try {
    const result = await removeGroupManager(session!, userId);
    return NextResponse.json(result);
  } catch (e) {
    const code = errorCode(e);
    const status = code === "FORBIDDEN" ? 403 : code === "NOT_FOUND" ? 404 : 400;
    return NextResponse.json({ error: code, code }, { status });
  }
}

export async function GET(req: Request) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("groupId") ?? "";
  if (!groupId) {
    return NextResponse.json({ error: "Missing groupId", code: "VALIDATION" }, { status: 400 });
  }

  try {
    const candidates = await listGroupManagerCandidates(session!, groupId);
    return NextResponse.json({ candidates });
  } catch (e) {
    const code = errorCode(e);
    const status = code === "FORBIDDEN" ? 403 : 400;
    return NextResponse.json({ error: code, code }, { status });
  }
}
