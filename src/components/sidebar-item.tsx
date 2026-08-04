"use client";

import { usePathname } from "next/navigation";
import { LocalizedLink as Link } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/i18n/provider";
import { stripLocale } from "@/i18n/config";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number | string;
  children?: { label: string; href: string }[];
};

export function SidebarItem({ item, collapsed }: { item: NavItem; collapsed?: boolean }) {
  const pathname = usePathname();
  const { href } = useI18n();
  const barePathname = pathname ? stripLocale(pathname) : pathname;
  const isActive = barePathname === item.href || barePathname?.startsWith(`${item.href}/`);
  const hasChildren = item.children && item.children.length > 0;
  const [open, setOpen] = useState(isActive);

  if (hasChildren) {
    return (
      <div className="px-2">
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            isActive
              ? "bg-primary-500/10 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
            collapsed && "justify-center",
          )}
        >
          <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-primary-600 dark:text-primary-400" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300")} />
          {!collapsed && (
            <>
              <span className="flex-1 text-start">{item.label}</span>
              <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", open && "rotate-180")} />
            </>
          )}
        </button>
        {!collapsed && open && (
          <div className="mt-1 space-y-0.5 ps-9">
            {item.children!.map((child) => {
              const childActive = barePathname === child.href;
              return (
                <Link
                  key={child.href}
                  href={href(child.href)}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm transition-colors",
                    childActive
                      ? "bg-primary-500/10 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200",
                  )}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={href(item.href)}
      className={cn(
        "group mx-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary-500/10 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
        collapsed && "mx-auto w-fit justify-center",
      )}
      title={collapsed ? item.label : undefined}
    >
      <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-primary-600 dark:text-primary-400" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300")} />
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {item.badge ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1.5 text-[10px] font-semibold text-white">
              {item.badge}
            </span>
          ) : null}
        </>
      )}
    </Link>
  );
}
