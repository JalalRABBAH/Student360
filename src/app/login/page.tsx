"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/i18n/provider";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, t, href } = useI18n();
  const next = searchParams.get("next") ?? href("/dashboard");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ? "student360" : "",
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, locale }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(t(data.error ?? "Invalid email or password"));
      } else {
        router.push(next);
        router.refresh();
      }
    } catch {
      setError(t("Network error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">{t("Email address")}</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@school.edu"
          required
          autoFocus
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">{t("Password")}</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>
      {error ? <p className="text-sm text-danger-600">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? t("Signing in…") : t("Sign in")}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  const { href, t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
        <LanguageSwitcher authenticated={false} compact />
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{t("Sign in")}</h1>
          <p className="text-sm text-muted">{t("Welcome back. Enter your school email and password.")}</p>
        </div>

        <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />}>
          <LoginForm />
        </Suspense>

        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          <p className="mb-1 font-medium">{t("Demo accounts")} ({t("Password").toLowerCase()}: student360)</p>
          <ul className="space-y-0.5">
            <li dir="ltr">super@student360.demo — {t("Super admin")}</li>
            <li dir="ltr">principal@lesoliviers.edu — {t("Principal")}</li>
            <li dir="ltr">admin@lesoliviers.edu — {t("Admin")}</li>
            <li dir="ltr">amina.martin@lesoliviers.edu — {t("Teacher")}</li>
            <li dir="ltr">charlotte.squalli.1@student360.demo — {t("Parent")}</li>
            <li dir="ltr">ayman.squalli@student360.demo — {t("Student")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
