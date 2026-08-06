import { NextRequest, NextResponse } from "next/server";

import { apiSession } from "@/lib/auth/server";
import { markThreadRead, MessageServiceError, toError } from "@/lib/messages/service";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  try {
    const result = await markThreadRead(session!, threadId);
    return NextResponse.json(result);
  } catch (err) {
    const e = toError(err, new MessageServiceError(500, "INTERNAL", "Could not update read status"));
    return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
  }
}
