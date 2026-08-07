import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/server";
import { cookieOptions, LOCALE_COOKIE, SESSION_COOKIE, signSession } from "@/lib/auth/session";
import { locales } from "@/i18n/config";

const schema = z.object({ locale: z.enum(locales) });

const YEAR = 60 * 60 * 24 * 365;

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Unsupported locale" }, { status: 400 });

  const locale = parsed.data.locale;
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: YEAR,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  const session = await getSession();
  if (session) {
    await prisma.user.update({ where: { id: session.sub }, data: { locale } });
    const token = await signSession({ ...session, locale });
    await prisma.session.update({ where: { id: session.sid }, data: { token } });
    store.set(SESSION_COOKIE, token, cookieOptions());
  }

  return NextResponse.json({ ok: true, locale });
}
