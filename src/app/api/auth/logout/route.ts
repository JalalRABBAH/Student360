import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { cookieOptions, SESSION_COOKIE, verifySession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  if (session) {
    await prisma.session.deleteMany({
      where: { id: session.sid, userId: session.sub },
    });
  }

  store.set(SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
  return NextResponse.json({ ok: true });
}