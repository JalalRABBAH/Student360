"use client";

import { iconMap, type IconName, type ModuleCategory } from "@/lib/modules/registry";
import { PageHeader } from "@/components/demo-ui";
import { Card } from "@/components/ui/card";
import { useI18n, LocalizedLink as Link } from "@/i18n/provider";
import { cn } from "@/lib/utils";

export type LobbyModule = {
  code: string;
  label: string;
  category: ModuleCategory;
  icon: IconName;
  href: string;
  placeholder?: boolean;
};

export function ModuleLobbyPage({
  modules,
  categories,
}: {
  modules: LobbyModule[];
  categories: { key: ModuleCategory; label: string }[];
}) {
  const { t, href } = useI18n();

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("Welcome")}
        description={t("Select a module below to start working.")}
      />

      {categories.map((category) => {
        const catModules = modules.filter((m) => m.category === category.key);
        if (catModules.length === 0) return null;
        return (
          <div key={category.key}>
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {t(category.label)}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {catModules.map((module) => {
                const Icon = iconMap[module.icon];
                return (
                  <Link
                    key={module.code}
                    href={href(module.href)}
                    className={cn(
                      "group flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition hover:border-primary-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-primary-500/30",
                      module.placeholder && "opacity-60",
                    )}
                  >
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-50 text-primary-600 transition group-hover:bg-primary-100 dark:bg-primary-500/10 dark:text-primary-400 dark:group-hover:bg-primary-500/20">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {t(module.label)}
                      </div>
                      {module.placeholder ? (
                        <div className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                          {t("Coming soon")}
                        </div>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
