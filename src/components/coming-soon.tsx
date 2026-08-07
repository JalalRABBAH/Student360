"use client";

import { useI18n } from "@/i18n/provider";
import { iconMap, type IconName } from "@/lib/modules/registry";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ComingSoonPage({ label, icon }: { label: string; icon: IconName }) {
  const { t, href } = useI18n();
  const Icon = iconMap[icon];
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md p-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
          <Icon className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t(label)}</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {t("This module is on the roadmap and will be available in a future update.")}
        </p>
        <Button asChild className="mt-6">
          <a href={href("/dashboard")}>{t("Back to dashboard")}</a>
        </Button>
      </Card>
    </div>
  );
}
