import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { verifySession } from "@/lib/auth/session";
import { defaultLocale, isLocale, localizePath } from "@/i18n/config";

export default async function HomePage() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  const locale = isLocale(session?.locale) ? session.locale : defaultLocale;
  if (session) redirect(localizePath("/dashboard", locale));

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-50 px-4 dark:bg-slate-950">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-2xl font-bold text-white shadow-sm">
          360
        </div>
        <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          STUDENT
          <span className="text-primary-600 dark:text-primary-400">360</span>
        </span>
      </div>
      <p className="max-w-md text-center text-lg text-slate-600 dark:text-slate-400">
        The student success intelligence platform for modern schools.
      </p>
      <Link
        href={localizePath("/login", locale)}
        className="rounded-xl bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700"
      >
        Get started
      </Link>
    </div>
  );
}
