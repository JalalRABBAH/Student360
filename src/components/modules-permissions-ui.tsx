"use client";

import { PageHeader, StatusBadge } from "@/components/demo-ui";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/i18n/provider";
import { iconMap, type IconName, type ModuleAccess, type ModuleCategory, type ModuleCode } from "@/lib/modules/registry";
import type { RoleCode } from "@/lib/domain/enums";
import { ROLE_LABELS } from "@/lib/domain/enums";
import { cn } from "@/lib/utils";

export type PermissionsMatrixProps = {
  categories: { key: ModuleCategory; label: string }[];
  modules: { code: ModuleCode; label: string; category: ModuleCategory; icon: IconName }[];
  roles: RoleCode[];
  matrix: Record<string, Partial<Record<ModuleCode, ModuleAccess>>>;
};

export function ModulesPermissionsPage({ categories, modules, roles, matrix }: PermissionsMatrixProps) {
  const { t } = useI18n();

  const accessFor = (role: RoleCode, code: ModuleCode): ModuleAccess => matrix[role]?.[code] ?? "none";

  const badge = (access: ModuleAccess) =>
    access === "write" ? (
      <StatusBadge tone="positive">{t("Write")}</StatusBadge>
    ) : access === "read" ? (
      <StatusBadge tone="info">{t("Read")}</StatusBadge>
    ) : (
      <StatusBadge tone="neutral">{t("None")}</StatusBadge>
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Modules & Permissions")}
        description={t("Every profile accesses the platform through modules, each granted read or write access. This matrix is read-only and defines what each profile can see and do.")}
      />

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <StatusBadge tone="positive">{t("Write")}</StatusBadge>
            <span>{t("Create, edit and manage")}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <StatusBadge tone="info">{t("Read")}</StatusBadge>
            <span>{t("View and consult")}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <StatusBadge tone="neutral">{t("None")}</StatusBadge>
            <span>{t("No access")}</span>
          </span>
        </div>
      </Card>

      {categories.map((category) => {
        const categoryModules = modules.filter((m) => m.category === category.key);
        if (categoryModules.length === 0) return null;
        return (
          <Card key={category.key} className="overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
              {t(category.label)}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <th className="px-5 py-2.5 font-medium">{t("Module")}</th>
                    {roles.map((role) => (
                      <th key={role} className="px-3 py-2.5 text-center font-medium">
                        {t(ROLE_LABELS[role])}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categoryModules.map((module, index) => {
                    const Icon = iconMap[module.icon];
                    return (
                      <tr
                        key={module.code}
                        className={cn("border-b border-slate-50 last:border-0 dark:border-slate-800/60", index % 2 === 1 && "bg-slate-50/50 dark:bg-slate-900/30")}
                      >
                        <td className="px-5 py-2.5">
                          <span className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                            <Icon className="h-4 w-4 text-primary-500" />
                            {t(module.label)}
                          </span>
                        </td>
                        {roles.map((role) => (
                          <td key={role} className="px-3 py-2.5 text-center">
                            {badge(accessFor(role, module.code))}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
