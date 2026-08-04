"use client";

import { LocalizedLink as Link } from "@/i18n/provider";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Check, ChevronRight, LogOut, Search, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { demoClasses, demoNotifications, demoStudents } from "@/lib/demo-data";
import { cn, initials } from "@/lib/utils";
import { useI18n } from "@/i18n/provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { SessionUser } from "@/components/app-shell";

export function GlobalSearch() {
  const { t, href } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);
  const results = useMemo(() => {
    if (!normalizedQuery) return [];
    const text = normalizedQuery;
    return [
      ...demoStudents.filter((student) => student.name.toLowerCase().includes(text)).slice(0, 5).map((student) => ({ label: student.name, meta: student.className, href: `/students/${student.id}` })),
      ...demoClasses.filter((item) => item.name.toLowerCase().includes(text) || item.teacher.toLowerCase().includes(text)).map((item) => ({ label: item.name, meta: item.teacher, href: `/classes/${item.id}` })),
    ];
  }, [normalizedQuery]);

  return (
    <>
      <Button variant="ghost" size="icon" className="hidden text-slate-500 sm:flex" onClick={() => setOpen(true)} aria-label={t("Search students, classes or teachers…")}>
        <Search className="h-[18px] w-[18px]" />
      </Button>
      {open ? (
        <div className="fixed inset-0 z-[80] flex justify-center bg-slate-950/40 px-4 pt-[12vh] backdrop-blur-sm" onMouseDown={() => setOpen(false)}>
          <div className="h-fit w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
              <Search className="h-5 w-5 text-slate-400" />
              <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 min-w-0 flex-1 bg-transparent text-base outline-none" placeholder={t("Search students, classes or teachers…")} />
              <button type="button" aria-label={t("Close search")} onClick={() => setOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="max-h-[55vh] overflow-y-auto p-2">
              {!normalizedQuery ? <div className="p-6 text-center text-sm text-slate-500">{t("Start typing a student, class or teacher name.")}</div> : results.length ? results.map((result) => <Link key={result.href} href={href(result.href)} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-100 dark:hover:bg-slate-900"><div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10"><UserRound className="h-4 w-4" /></div><div className="flex-1"><div className="text-sm font-semibold">{result.label}</div><div className="text-xs text-slate-500">{t(result.meta)}</div></div><ChevronRight className="h-4 w-4 text-slate-400" /></Link>) : <div className="p-6 text-center text-sm text-slate-500">{t("No matching result.")}</div>}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function NotificationCenter() {
  const { t, href } = useI18n();
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const unread = demoNotifications.length - read.length;
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event instanceof MouseEvent && event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", dismiss);
    document.addEventListener("keydown", dismiss);
    return () => {
      document.removeEventListener("mousedown", dismiss);
      document.removeEventListener("keydown", dismiss);
    };
  }, [open]);
  return (
    <div ref={containerRef} className="relative">
      <Button variant="ghost" size="icon" className="relative text-slate-500" onClick={() => setOpen((value) => !value)} aria-label={t(open ? "Close notifications" : "Open notifications")} aria-expanded={open}>
        <Bell className="h-[18px] w-[18px]" />
        {unread ? <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white dark:ring-slate-950" /> : null}
      </Button>
      {open ? (
        <div className="absolute end-0 top-12 z-[70] w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800"><div><div className="font-bold">{t("Notifications")}</div><div className="text-xs text-slate-500">{t(`${unread} unread`)}</div></div><button type="button" disabled={!unread} onClick={() => setRead(demoNotifications.map((item) => item.id))} className="text-xs font-semibold text-primary-600 disabled:opacity-40">{t("Mark all read")}</button></div>
          <div>{demoNotifications.map((item) => <Link key={item.id} href={href(item.href)} onClick={() => { setRead((current) => current.includes(item.id) ? current : [...current, item.id]); setOpen(false); }} className={cn("flex gap-3 border-b border-slate-100 p-4 dark:border-slate-800", !read.includes(item.id) && "bg-primary-50/60 dark:bg-primary-500/5")}><div className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", item.priority === "HIGH" ? "bg-rose-500" : item.priority === "LOW" ? "bg-emerald-500" : "bg-sky-500")} /><div className="flex-1"><div className="text-sm font-semibold">{t(item.title)}</div><div className="mt-1 text-xs text-slate-500">{t(item.body)}</div></div>{read.includes(item.id) ? <Check className="h-4 w-4 text-emerald-500" /> : null}</Link>)}</div>
        </div>
      ) : null}
    </div>
  );
}

export function UserMenu({ user }: { user: SessionUser }) {
  const { href, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event instanceof MouseEvent && event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", dismiss);
    document.addEventListener("keydown", dismiss);
    return () => {
      document.removeEventListener("mousedown", dismiss);
      document.removeEventListener("keydown", dismiss);
    };
  }, [open]);
  const logout = async () => {
    if (signingOut) return;
    setSigningOut(true);
    setLogoutError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed");
      window.location.assign(href("/login"));
    } catch {
      setSigningOut(false);
      setLogoutError(t("Could not sign out. Please try again."));
    }
  };
  return (
    <div ref={containerRef} className="relative">
      <button type="button" aria-label="Open account menu" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 text-xs font-bold text-white">{initials(user.firstName, user.lastName)}</button>
      {open ? <div className="absolute end-0 top-12 z-[70] w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-950"><div className="p-3"><div className="font-semibold">{user.firstName} {user.lastName}</div><div className="truncate text-xs text-slate-500">{user.email}</div><div className="mt-2 text-[10px] font-semibold uppercase text-primary-600">{user.roles.join(", ")}</div></div><div className="border-t border-slate-100 py-2 dark:border-slate-800"><Link href={href("/configuration")} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-900"><UserRound className="h-4 w-4" />Account preferences</Link><div className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm"><span>Language</span><LanguageSwitcher compact /></div><button type="button" disabled={signingOut} onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-60 dark:hover:bg-rose-500/5"><LogOut className="h-4 w-4" />{signingOut ? "Signing out…" : "Sign out"}</button>{logoutError ? <p className="px-3 py-1 text-xs text-rose-600">{logoutError}</p> : null}</div></div> : null}
    </div>
  );
}