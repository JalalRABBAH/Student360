"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/i18n/provider";

export default function ForbiddenPage() {
  const { href, t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <Link href={href("/")} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-bold text-white">
              360
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              STUDENT
              <span className="text-primary-600 dark:text-primary-400">360</span>
            </span>
          </Link>
          <LanguageSwitcher compact />
        </div>

        <div className="flex flex-col items-center gap-4 pt-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-50 text-danger-500 dark:bg-danger-500/10 dark:text-danger-400">
            <ShieldAlert className="h-9 w-9" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold tracking-widest text-danger-500 dark:text-danger-400">403</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{t("Access denied")}</h1>
            <p className="text-sm text-muted">{t("You don't have permission to view this page.")}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {t("If you believe this is a mistake, please contact your school administrator.")}
            </p>
          </div>

          <div className="flex w-full flex-col gap-2">
            <Button asChild className="w-full">
              <Link href={href("/dashboard")}>{t("Back to dashboard")}</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href={href("/login")}>{t("Sign in")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
