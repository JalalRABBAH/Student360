"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import Link, { type LinkProps } from "next/link";
import { intlLocale, localizePath, type Locale } from "@/i18n/config";
import { translateText } from "@/i18n/translations";

type I18nContextValue = {
  locale: Locale;
  direction: "ltr" | "rtl";
  t: (text: string) => string;
  href: (path: string) => string;
  formatNumber: (value: number) => string;
  formatPercent: (value: number) => string;
  formatDate: (value: Date | string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);
export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo<I18nContextValue>(() => {
    const localeTag = intlLocale(locale);
    return {
      locale,
      direction: locale === "ar" ? "rtl" : "ltr",
      t: (text) => translateText(text, locale),
      href: (path) => localizePath(path, locale),
      formatNumber: (number) => new Intl.NumberFormat(localeTag).format(number),
      formatPercent: (number) => new Intl.NumberFormat(localeTag, { style: "percent", maximumFractionDigits: 1 }).format(number),
      formatDate: (date) => new Intl.DateTimeFormat(localeTag, { dateStyle: "medium" }).format(new Date(date)),
    };
  }, [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}

export function LocalizedLink({
  href,
  ...props
}: Omit<React.ComponentProps<typeof Link>, "href"> & { href: LinkProps["href"] }) {
  const { href: localize } = useI18n();
  const localizedHref = typeof href === "string" && href.startsWith("/") ? localize(href) : href;
  return <Link href={localizedHref} {...props} />;
}