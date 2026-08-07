"use client";

import { useState } from "react";
import { Building2, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

export function EstablishmentSwitcher({
  schools,
  currentSchoolId,
}: {
  schools: { id: string; name: string }[];
  currentSchoolId: string | null;
}) {
  const { t } = useI18n();
  const [switching, setSwitching] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const switchTo = async (schoolId: string) => {
    if (schoolId === currentSchoolId || switching) return;
    setSwitching(schoolId);
    setError(false);
    try {
      const res = await fetch("/api/schools/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId }),
      });
      if (!res.ok) throw new Error("switch failed");
      window.location.reload();
    } catch {
      setSwitching(null);
      setError(true);
    }
  };

  if (!schools.length) return null;

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 bg-slate-50/80 px-4 py-1.5 dark:border-slate-800 dark:bg-slate-900/50 sm:px-6 lg:px-8">
      <span className="me-2 flex shrink-0 items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        <Building2 className="h-3.5 w-3.5" />
        {t("Establishments")}
      </span>
      {schools.map((school) => {
        const active = school.id === currentSchoolId;
        const busy = switching === school.id;
        return (
          <button
            key={school.id}
            type="button"
            onClick={() => switchTo(school.id)}
            disabled={busy || active}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition",
              active
                ? "bg-primary-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-60 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
            )}
          >
            {busy ? <Loader2 className="mr-1 inline h-3 w-3 animate-spin" /> : null}
            {school.name}
          </button>
        );
      })}
      {error ? <span className="ms-2 shrink-0 text-xs font-medium text-rose-600">{t("Could not switch establishment")}</span> : null}
    </div>
  );
}
