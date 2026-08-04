import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/server";
import { cookieOptions, SESSION_COOKIE, signSession } from "@/lib/auth/session";
import { locales } from "@/i18n/config";

const schema = z.object({ locale: z.enum(locales) });

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Unsupported locale" }, { status: 400 });

  const locale = parsed.data.locale;
  await prisma.user.update({ where: { id: session.sub }, data: { locale } });
  const token = await signSession({ ...session, locale });
  await prisma.session.update({ where: { id: session.sid }, data: { token } });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, cookieOptions());

  return NextResponse.json({ ok: true, locale });
}