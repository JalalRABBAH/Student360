"use client";

import { useState } from "react";
import { Check, Languages, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { localeLabels, locales, localizePath, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<Locale | null>(null);
  const [error, setError] = useState("");

  const choose = async (nextLocale: Locale) => {
    if (nextLocale === locale) {
      setOpen(false);
      return;
    }
    setPending(nextLocale);
    setError("");
    try {
      const response = await fetch("/api/account/locale", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale: nextLocale }),
      });
      if (!response.ok) throw new Error("locale");
      const target = localizePath(pathname, nextLocale);
      const query = window.location.search.slice(1);
      router.push(query ? `${target}?${query}` : target);
      router.refresh();
      setOpen(false);
    } catch {
      setError(t("Could not save language. Please try again."));
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t("Language")}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 text-sm font-semibold text-slate-600 transition hover:border-primary-300 hover:text-primary-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
          compact && "w-9 px-0",
        )}
      >
        <Languages className="h-4 w-4" />
        {!compact ? <span>{locale.toUpperCase()}</span> : null}
      </button>
      {open ? (
        <div className="absolute end-0 top-11 z-[90] w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-950">
          {locales.map((item) => (
            <button
              key={item}
              type="button"
              disabled={Boolean(pending)}
              onClick={() => choose(item)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-sm hover:bg-slate-100 disabled:opacity-60 dark:hover:bg-slate-900"
            >
              {pending === item ? <Loader2 className="h-4 w-4 animate-spin" /> : item === locale ? <Check className="h-4 w-4 text-primary-600" /> : <span className="w-4" />}
              <span lang={item} dir={item === "ar" ? "rtl" : "ltr"}>{localeLabels[item]}</span>
            </button>
          ))}
          {error ? <p className="px-3 py-2 text-xs text-rose-600">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
