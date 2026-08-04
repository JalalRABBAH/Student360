import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { I18nProvider } from "@/i18n/provider";
import { defaultLocale, isLocale, localeDirection } from "@/i18n/config";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "STUDENT360 — Student Success Intelligence",
  description: "Observe · Understand · Support · Act · Measure · Improve",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get("x-s360-locale");
  const locale = isLocale(localeHeader) ? localeHeader : defaultLocale;
  return (
    <html lang={locale} dir={localeDirection(locale)} suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} font-sans`}>
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
