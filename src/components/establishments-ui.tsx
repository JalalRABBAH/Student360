"use client";

import { useState } from "react";
import { Building2, GraduationCap, Pencil, Trash2, Users } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/demo-ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminEditEstablishmentPanel, AdminEstablishmentsPanel, AdminSchoolAdminPanel, type EstablishmentEditData } from "@/components/admin-panels";
import { useI18n, LocalizedLink as Link } from "@/i18n/provider";
import type { ManagedEstablishment } from "@/lib/platform/service";

function roleLabel(role: string, t: (key: string) => string) {
  if (role === "MANAGER") return t("School group manager");
  if (role === "PRINCIPAL") return t("School management");
  return t("School administration");
}

function toEditData(school: ManagedEstablishment): EstablishmentEditData {
  return {
    id: school.id,
    name: school.name,
    city: school.city,
    country: school.country,
    plan: school.plan,
    seatsLimit: school.seatsLimit,
  };
}

export function EstablishmentsManagementPage({ schools }: { schools: ManagedEstablishment[] }) {
  const { t, href } = useI18n();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Establishments")}
        description={t("Manage the schools in your group: create establishments and delegate administration accounts.")}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminEstablishmentsPanel />
        <AdminSchoolAdminPanel schools={schools.map((s) => ({ id: s.id, name: s.name }))} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">{t("My establishments")}</h2>
        {schools.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {schools.map((school) => {
              const editing = editingId === school.id;
              return (
                <Card key={school.id} className="flex flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{school.name}</div>
                        <div className="text-xs text-slate-500">{school.city ?? "—"} · {t(school.country)}</div>
                      </div>
                    </div>
                    <StatusBadge tone="info">{roleLabel(school.role, t)}</StatusBadge>
                  </div>

                  {editing ? (
                    <AdminEditEstablishmentPanel
                      school={toEditData(school)}
                      onCancel={() => setEditingId(null)}
                      onDeleted={() => setEditingId(null)}
                    />
                  ) : (
                    <>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-xl bg-slate-50 py-2 dark:bg-slate-900">
                          <div className="flex items-center justify-center gap-1 text-xs text-slate-500"><GraduationCap className="h-3.5 w-3.5" />{t("Students")}</div>
                          <div className="text-lg font-bold text-slate-900 dark:text-white">{school.studentCount}</div>
                        </div>
                        <div className="rounded-xl bg-slate-50 py-2 dark:bg-slate-900">
                          <div className="flex items-center justify-center gap-1 text-xs text-slate-500"><Users className="h-3.5 w-3.5" />{t("Teachers")}</div>
                          <div className="text-lg font-bold text-slate-900 dark:text-white">{school.teacherCount}</div>
                        </div>
                        <div className="rounded-xl bg-slate-50 py-2 dark:bg-slate-900">
                          <div className="flex items-center justify-center gap-1 text-xs text-slate-500"><Building2 className="h-3.5 w-3.5" />{t("Classes")}</div>
                          <div className="text-lg font-bold text-slate-900 dark:text-white">{school.classCount}</div>
                        </div>
                      </div>
                      <div className="mt-4 flex-1" />
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(school.id)} title={t("Edit")}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button asChild variant="outline" className="flex-1">
                          <Link href={href("/school")}>{t("Manage")}</Link>
                        </Button>
                      </div>
                    </>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center text-sm text-slate-500">{t("No establishment yet — create your first school above.")}</Card>
        )}
      </div>
    </div>
  );
}
