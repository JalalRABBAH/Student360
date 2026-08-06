import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { apiSession } from "@/lib/auth/server";
import {
  createThread,
  listThreadsFor,
  MESSAGE_CATEGORIES,
  MessageServiceError,
  toError,
  type RecipientType,
} from "@/lib/messages/service";

const listSchema = z.object({
  q: z.string().max(200).optional(),
  category: z.string().max(40).optional(),
  status: z.string().max(40).optional(),
});

export async function GET(req: NextRequest) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const params = listSchema.safeParse({
    q: req.nextUrl.searchParams.get("q") ?? undefined,
    category: req.nextUrl.searchParams.get("category") ?? undefined,
    status: req.nextUrl.searchParams.get("status") ?? undefined,
  });

  try {
    const threads = await listThreadsFor(session!, params.success ? params.data : {});
    return NextResponse.json({ threads });
  } catch (err) {
    const e = toError(err, new MessageServiceError(500, "INTERNAL", "Could not load conversations"));
    return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
  }
}

const createSchema = z.object({
  recipientType: z.enum(["user", "student", "class"]),
  recipientId: z.string().min(1).max(80),
  subject: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(4000),
  category: z.enum(MESSAGE_CATEGORIES).optional(),
  aboutStudentId: z.string().max(80).optional(),
});

export async function POST(req: NextRequest) {
  const { session, error } = await apiSession();
  if (error) return NextResponse.json(error, { status: error.status });

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message data", code: "VALIDATION" }, { status: 400 });
  }

  const input = parsed.data as {
    recipientType: RecipientType;
    recipientId: string;
    subject: string;
    body: string;
    category?: string;
    aboutStudentId?: string;
  };

  try {
    const thread = await createThread(session!, input);
    return NextResponse.json({ thread }, { status: 201 });
  } catch (err) {
    const e = toError(err, new MessageServiceError(500, "INTERNAL", "Could not send message"));
    return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
  }
}
