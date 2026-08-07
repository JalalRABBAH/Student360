"use client";

import { useState } from "react";
import { Check, ChevronRight, Save, Settings, ShieldCheck, SlidersHorizontal, TriangleAlert } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/demo-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import type { ConfigField, ConfigSection, ConfigurationData } from "@/lib/admin/reports-data";

export function ConfigurationPage({ data }: { data: ConfigurationData }) {
  const { t } = useI18n();
  const [selected, setSelected] = useState<ConfigSection>(data.sections[0] ?? emptySection());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!data.available) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("Configuration")} description={t("Adapt Student360 to the school's educational system without hard-coded assumptions.")} />
        <Card className="p-8 text-center text-sm text-slate-500">
          <TriangleAlert className="mx-auto mb-2 h-6 w-6 text-amber-500" />
          {t("Configuration is available from a school context only.")}
        </Card>
      </div>
    );
  }

  const save = async () => {
    if (!selected.key) return;
    setSaving(true);
    setError(null);
    const form = new FormData(document.getElementById("config-fields") as HTMLFormElement);
    const values: Record<string, string | string[]> = {};
    for (const field of selected.fields) {
      const names = field.type === "checkboxes" ? form.getAll(field.name).map(String) : [];
      values[field.name] = field.type === "checkboxes" ? names : String(form.get(field.name) ?? "");
    }
    const response = await fetch("/api/configuration", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: selected.key, values }),
    });
    setSaving(false);
    if (response.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setError(t("Could not save settings. Please try again."));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Configuration")}
        description={t("Adapt Student360 to the school's educational system without hard-coded assumptions.")}
        actions={
          selected.key ? (
            <Button onClick={save} disabled={saving}>
              {saved ? <Check className="me-2 h-4 w-4" /> : <Save className="me-2 h-4 w-4" />}
              {t(saved ? "Saved" : saving ? "Saving…" : "Save changes")}
            </Button>
          ) : undefined
        }
      />
      {error ? <Card className="border-amber-200 p-4 text-sm text-amber-700 dark:border-amber-500/30 dark:text-amber-300">{error}</Card> : null}
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 p-4 dark:border-slate-800">
            <h2 className="font-bold">{t("School settings")}</h2>
            <p className="text-xs text-slate-500">{data.schoolName}</p>
          </div>
          {data.sections.map((section) => (
            <button
              key={section.label}
              type="button"
              onClick={() => { setSelected(section); setSaved(false); setError(null); }}
              className={cn(
                "flex w-full items-center gap-3 border-b border-slate-100 p-4 text-left dark:border-slate-800",
                selected.label === section.label ? "bg-primary-50 dark:bg-primary-500/5" : "hover:bg-slate-50 dark:hover:bg-slate-900",
              )}
            >
              <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800"><Settings className="h-4 w-4" /></div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{t(section.label)}</div>
                <div className="text-xs text-slate-500">{section.summary}</div>
              </div>
              {section.key ? null : <StatusBadge tone="info">{t("Live")}</StatusBadge>}
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          ))}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary-50 p-3 text-primary-600 dark:bg-primary-500/10"><SlidersHorizontal className="h-5 w-5" /></div>
            <div>
              <h2 className="text-xl font-bold">{t(selected.label)}</h2>
              <p className="text-sm text-slate-500">{t(selected.description)}</p>
            </div>
          </div>

          {selected.rows.length ? (
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
              {selected.rows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-0 dark:border-slate-800">
                  <span className="text-slate-500">{t(row.label)}</span>
                  <span className="font-semibold">{row.value}</span>
                </div>
              ))}
            </div>
          ) : null}

          {selected.key ? (
            <form id="config-fields" className="mt-6 space-y-5">
              {selected.fields.map((field) => (
                <ConfigInput key={field.name} field={field} />
              ))}
            </form>
          ) : null}

          <div className="mt-8 rounded-2xl bg-sky-50 p-4 dark:bg-sky-500/5">
            <div className="flex gap-3">
              <ShieldCheck className="h-5 w-5 text-sky-600" />
              <div>
                <div className="font-semibold text-sky-900 dark:text-sky-300">{t("Privacy and persistence")}</div>
                <p className="mt-1 text-sm text-sky-700/80 dark:text-sky-300/70">
                  {t("Changes are saved to this school's configuration and every change is recorded in the audit log.")}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ConfigInput({ field }: { field: ConfigField }) {
  const { t } = useI18n();
  if (field.type === "checkboxes") {
    return (
      <label className="block text-sm font-medium">
        {t(field.label)}
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {(field.options ?? []).map((option) => (
            <label key={option} className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <input type="checkbox" name={field.name} value={option} defaultChecked={field.checked?.includes(option)} />
              {t(option)}
            </label>
          ))}
        </div>
      </label>
    );
  }
  if (field.type === "select") {
    return (
      <label className="block text-sm font-medium">
        {t(field.label)}
        <select name={field.name} defaultValue={field.value} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 dark:border-slate-800 dark:bg-slate-900">
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>{t(option)}</option>
          ))}
        </select>
      </label>
    );
  }
  return (
    <label className="block text-sm font-medium">
      {t(field.label)}
      <input
        name={field.name}
        type={field.type === "number" ? "number" : "text"}
        defaultValue={field.value}
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 dark:border-slate-800 dark:bg-slate-900"
      />
    </label>
  );
}

function emptySection(): ConfigSection {
  return { key: null, label: "School settings", summary: "", description: "", rows: [], fields: [] };
}
