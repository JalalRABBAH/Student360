"use client";

import { Building2, ChevronLeft, GraduationCap, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, StatusBadge } from "@/components/demo-ui";
import { useI18n, LocalizedLink as Link } from "@/i18n/provider";

type Manager = { firstName: string; lastName: string; email: string } | null;

export function EstablishmentSupervisionPage({
  school,
}: {
  school: {
    id: string;
    name: string;
    slug: string;
    city: string | null;
    country: string;
    plan: string;
    status: string;
    seatsLimit: number;
    studentCount: number;
    teacherCount: number;
    classCount: number;
    manager: Manager;
  };
}) {
  const { t, href } = useI18n();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link href={href("/establishments")} className="hover:text-slate-700 dark:hover:text-slate-300">
          {t("My establishments")}
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-900 dark:text-white">{school.name}</span>
      </div>

      <PageHeader
        title={school.name}
        description={t("Supervision view for this establishment. Detailed operations remain with the school administration.")}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Building2 className="h-4 w-4" />
            {t("Classes")}
          </div>
          <div className="mt-1 text-2xl font-bold">{school.classCount}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <GraduationCap className="h-4 w-4" />
            {t("Students")}
          </div>
          <div className="mt-1 text-2xl font-bold">{school.studentCount}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Users className="h-4 w-4" />
            {t("Teachers")}
          </div>
          <div className="mt-1 text-2xl font-bold">{school.teacherCount}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Users className="h-4 w-4" />
            {t("Seats limit")}
          </div>
          <div className="mt-1 text-2xl font-bold">{school.seatsLimit}</div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold">{t("Establishment information")}</h3>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">{t("City")}</dt>
            <dd>{school.city ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">{t("Country")}</dt>
            <dd>{t(school.country)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">{t("Plan")}</dt>
            <dd><StatusBadge tone="info">{school.plan}</StatusBadge></dd>
          </div>
          <div>
            <dt className="text-slate-500">{t("Status")}</dt>
            <dd><StatusBadge tone={school.status === "ACTIVE" ? "positive" : "neutral"}>{school.status}</StatusBadge></dd>
          </div>
          <div>
            <dt className="text-slate-500">{t("Manager")}</dt>
            <dd>{school.manager ? `${school.manager.firstName} ${school.manager.lastName}` : t("Not assigned")}</dd>
          </div>
        </dl>
      </Card>

      <Button asChild variant="outline">
        <Link href={href("/establishments")}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          {t("Back to my establishments")}
        </Link>
      </Button>
    </div>
  );
}
