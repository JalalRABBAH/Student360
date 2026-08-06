import { NextRequest, NextResponse } from "next/server";

import { apiSession } from "@/lib/auth/server";
import { MessageServiceError, recipientDirectory, toError } from "@/lib/messages/service";

export async function GET(req: NextRequest) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const q = req.nextUrl.searchParams.get("q") ?? "";
  try {
    const directory = await recipientDirectory(session!, q.slice(0, 200));
    return NextResponse.json(directory);
  } catch (err) {
    const e = toError(err, new MessageServiceError(500, "INTERNAL", "Could not load recipients"));
    return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
  }
}
