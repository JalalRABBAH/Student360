import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";
import { defaultLocale, isLocale, localizePath, type Locale } from "@/i18n/config";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/logout", "/api/auth/demo-accounts", "/forbidden", "/welcome"];

function isPublic(pathname: string) {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return true;
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/images") ||
    pathname === "/robots.txt" ||
    pathname === "/manifest.webmanifest"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  const segments = pathname.split("/");
  const urlLocale = isLocale(segments[1]) ? segments[1] : null;
  const sessionLocale = isLocale(session?.locale) ? session.locale : defaultLocale;
  const locale: Locale = urlLocale ?? sessionLocale;
  const internalPath = urlLocale ? `/${segments.slice(2).join("/")}`.replace(/\/$/, "") || "/" : pathname;

  if (!urlLocale && !pathname.startsWith("/api/") && !isPublic(pathname)) {
    return NextResponse.redirect(new URL(localizePath(pathname, locale), request.url));
  }

  if (!urlLocale && (pathname === "/" || pathname === "/login" || pathname === "/forbidden" || pathname === "/welcome")) {
    const target = session && (pathname === "/" || pathname === "/login") ? "/dashboard" : pathname === "/" ? "/login" : pathname;
    return NextResponse.redirect(new URL(localizePath(target, locale), request.url));
  }

  if (session && (internalPath === "/login" || internalPath === "/")) {
    return NextResponse.redirect(new URL(localizePath("/dashboard", locale), request.url));
  }

  if (isPublic(internalPath)) {
    if (!urlLocale) {
      const response = NextResponse.next();
      response.headers.set("x-s360-locale", locale);
      return response;
    }
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = internalPath;
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-s360-locale", locale);
    const response = NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
    return response;
  }

  if (!session) {
    if (internalPath.startsWith("/api/")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const url = new URL(localizePath("/login", locale), request.url);
    if (internalPath !== "/") url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = internalPath;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-s360-locale", locale);
  const response = urlLocale
    ? NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } })
    : NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("x-s360-user", session.sub);
  response.headers.set("x-s360-role", session.activeRole);
  response.headers.set("x-s360-locale", locale);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
