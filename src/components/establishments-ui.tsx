"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, GraduationCap, Loader2, Pencil, Plus, Trash2, Users } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/demo-ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AdminEditEstablishmentPanel,
  AssignManagerSheet,
  CreateEstablishmentSheet,
  send,
  type EstablishmentEditData,
} from "@/components/admin-panels";
import { useI18n, LocalizedLink as Link } from "@/i18n/provider";
import type { GroupSummary, ManagedEstablishment } from "@/lib/platform/service";

function accessRoleLabel(role: string, t: (key: string) => string) {
  if (role === "MANAGER" || role === "SCHOOL_MANAGER") return t("School manager");
  if (role === "PRINCIPAL") return t("School management");
  return t("School administration");
}

function cardRoleLabel(role: string, t: (key: string) => string) {
  if (role === "GROUP_MANAGER") return t("School group manager");
  if (role === "MANAGER" || role === "SCHOOL_MANAGER") return t("Manager");
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

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10">
        {icon}
      </div>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-xl font-bold text-slate-900 dark:text-white">{value}</div>
      </div>
    </Card>
  );
}

export function EstablishmentsManagementPage({
  schools,
  summary,
}: {
  schools: ManagedEstablishment[];
  summary: GroupSummary;
}) {
  const { t, href } = useI18n();
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [assigningSchoolId, setAssigningSchoolId] = useState<string | null>(null);
  const [busyManager, setBusyManager] = useState<{ userId: string; action: "update" | "delete" } | null>(null);

  async function updateManager(userId: string, schoolId: string, newRole: "PRINCIPAL" | "ADMIN") {
    setBusyManager({ userId, action: "update" });
    await send("/api/admin/establishment-managers", "PATCH", { userId, schoolId, role: newRole });
    setBusyManager(null);
    router.refresh();
  }

  async function removeManager(userId: string, schoolId: string) {
    if (!confirm(t("Remove this manager from the establishment?"))) return;
    setBusyManager({ userId, action: "delete" });
    await send("/api/admin/establishment-managers", "DELETE", { userId, schoolId });
    setBusyManager(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Establishments")}
        description={t("Manage the schools in your group: create establishments and delegate administration accounts.")}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={<Building2 className="h-5 w-5" />} label={t("Establishments")} value={summary.schoolCount} />
        <SummaryCard icon={<Users className="h-5 w-5" />} label={t("Seats limit")} value={summary.totalSeats} />
        <SummaryCard icon={<GraduationCap className="h-5 w-5" />} label={t("Students")} value={summary.totalStudents} />
        <SummaryCard icon={<Users className="h-5 w-5" />} label={t("Teachers")} value={summary.totalTeachers} />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("My establishments")}</h2>
        <CreateEstablishmentSheet />
      </div>

      <div>
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
                    <StatusBadge tone="info">{cardRoleLabel(school.role, t)}</StatusBadge>
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

                      <div className="mt-4">
                        <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
                          <span>{t("Managers")}</span>
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setAssigningSchoolId(school.id)}>
                            <Plus className="mr-1 h-3 w-3" /> {t("Add")}
                          </Button>
                        </div>
                        {school.managers.length ? (
                          <div className="space-y-1.5">
                            {school.managers.map((manager) => {
                              const isBusy = busyManager?.userId === manager.id;
                              const isLegacy = manager.accessRole === "MANAGER" || manager.accessRole === "SCHOOL_MANAGER";
                              const roleValue: "PRINCIPAL" | "ADMIN" | "" = isLegacy ? "" : manager.accessRole === "ADMIN" ? "ADMIN" : "PRINCIPAL";
                              return (
                                <div key={manager.id} className="flex items-center justify-between gap-2 text-sm">
                                  <span className="truncate">
                                    {manager.firstName} {manager.lastName}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <select
                                      value={roleValue}
                                      disabled={isBusy}
                                      onChange={(e) => {
                                        const value = e.target.value as "PRINCIPAL" | "ADMIN" | "";
                                        if (!value) return;
                                        updateManager(manager.id, school.id, value);
                                      }}
                                      className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                                    >
                                      {isLegacy ? <option value="" disabled>{t("School manager")}</option> : null}
                                      <option value="PRINCIPAL">{t("School management")}</option>
                                      <option value="ADMIN">{t("School administration")}</option>
                                    </select>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 text-rose-600 hover:text-rose-700"
                                      disabled={isBusy}
                                      onClick={() => removeManager(manager.id, school.id)}
                                      title={t("Remove")}
                                    >
                                      {isBusy && busyManager.action === "delete" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-500">{t("Not assigned")}</div>
                        )}
                      </div>

                      <div className="mt-4 flex-1" />
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(school.id)} title={t("Edit")}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button asChild variant="outline" className="flex-1">
                          <Link href={href(`/establishments/${school.id}`)}>{t("Manage")}</Link>
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

      <AssignManagerSheet
        schoolId={assigningSchoolId}
        schools={schools.map((s) => ({ id: s.id, name: s.name }))}
        onClose={() => setAssigningSchoolId(null)}
      />
    </div>
  );
}
