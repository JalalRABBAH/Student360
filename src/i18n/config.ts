export const locales = ["en", "fr", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  ar: "العربية",
};

export function isLocale(value: string | null | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export function localeDirection(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

export function intlLocale(locale: Locale) {
  if (locale === "ar") return "ar-MA-u-nu-latn";
  return locale === "fr" ? "fr-MA" : "en-MA";
}

export function stripLocale(pathname: string) {
  const segments = pathname.split("/");
  return isLocale(segments[1]) ? `/${segments.slice(2).join("/")}`.replace(/\/$/, "") || "/" : pathname;
}

export function localizePath(pathname: string, locale: Locale) {
  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/")) return pathname;
  const barePath = stripLocale(pathname);
  return `/${locale}${barePath === "/" ? "" : barePath}`;
}