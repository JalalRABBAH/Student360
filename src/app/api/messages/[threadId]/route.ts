import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { apiSession } from "@/lib/auth/server";
import { getThread, MessageServiceError, replyToThread, toError } from "@/lib/messages/service";

type RouteParams = { params: Promise<{ threadId: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { threadId } = await params;
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  try {
    const thread = await getThread(session!, threadId);
    return NextResponse.json({ thread });
  } catch (err) {
    const e = toError(err, new MessageServiceError(500, "INTERNAL", "Could not load conversation"));
    return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
  }
}

const replySchema = z.object({ body: z.string().trim().min(1).max(4000) });

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { threadId } = await params;
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const parsed = replySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message", code: "VALIDATION" }, { status: 400 });
  }

  try {
    const message = await replyToThread(session!, threadId, parsed.data.body);
    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    const e = toError(err, new MessageServiceError(500, "INTERNAL", "Could not send message"));
    return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
  }
}
