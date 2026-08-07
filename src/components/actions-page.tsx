"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ClipboardList, History, Loader2, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { MetricCard, PageHeader, StatusBadge } from "@/components/demo-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n/provider";
import type { ActionItem } from "@/lib/actions/service";

export type AdminTemplateRow = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  targetRole: string;
  required: string;
  frequency: string;
  source: string;
  classId: string | null;
  active: boolean;
  startDate: string;
  generated: number;
  eligible: number;
};

export type AssignableUser = { id: string; name: string; role: string };

type Props =
  | {
      mode: "mine";
      pending: ActionItem[];
      history: ActionItem[];
      counts: { pending: number; done: number; mandatoryOpen: number };
    }
  | {
      mode: "admin";
      templates: AdminTemplateRow[];
      users: AssignableUser[];
      classes: { id: string; name: string }[];
    };

async function send(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json().catch(() => ({}));
}

function requiredTone(required: string): "attention" | "neutral" {
  return required === "MANDATORY" ? "attention" : "neutral";
}

function sourceLabel(source: string) {
  return source === "ADMIN" ? "Set by administration" : source === "TEACHER" ? "Set by a teacher" : "Suggested by the app";
}

function dateLabel(iso: string) {
  return iso ? new Date(iso).toLocaleDateString() : "—";
}

// ---------------------------------------------------------------------------
// Personal actions (students / teachers / parents)
// ---------------------------------------------------------------------------

function MineView({ pending, history, counts }: { pending: ActionItem[]; history: ActionItem[]; counts: { pending: number; done: number; mandatoryOpen: number } }) {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<Record<string, string>>({});

  async function resolve(id: string, action: "COMPLETE" | "SKIP") {
    setBusy(id);
    await send(`/api/actions/${id}`, "PATCH", { action, note: note[id] ?? undefined });
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("My actions")} description={t("Recurring tasks that keep the school community connected — complete the ones that are due for you.")} />
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label={t("To do")} value={counts.pending} detail={t("Actions pending")} icon={ClipboardList} />
        <MetricCard label={t("Mandatory open")} value={counts.mandatoryOpen} detail={t("Required this period")} icon={CheckCircle2} tone="amber" />
        <MetricCard label={t("Completed")} value={counts.done} detail={t("Done recently")} icon={History} tone="violet" />
      </div>

      <Card className="p-5">
        <h2 className="font-bold">{t("To do")}</h2>
        <p className="text-xs text-slate-500">{t("Mark them done once completed — the app tracks them automatically.")}</p>
        {!pending.length ? (
          <p className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">{t("Nothing due right now — come back later.")}</p>
        ) : (
          <div className="mt-4 space-y-3">
            {pending.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white">{t(item.title)}</h3>
                      <StatusBadge tone={requiredTone(item.required)}>{item.required === "MANDATORY" ? t("Mandatory") : t("Optional")}</StatusBadge>
                      <StatusBadge tone="neutral">{t(sourceLabel(item.source))}</StatusBadge>
                    </div>
                    {item.studentName ? <p className="mt-1 text-xs text-slate-500">{t("For")} {item.studentName}</p> : null}
                    {item.description ? <p className="mt-1 text-sm text-slate-500">{t(item.description)}</p> : null}
                    <p className="mt-1 text-xs text-slate-400">{t("Due")} {dateLabel(item.dueDate)}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" onClick={() => resolve(item.id, "COMPLETE")} disabled={busy === item.id}>{busy === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} {t("Done")}</Button>
                    <Button size="sm" variant="outline" onClick={() => resolve(item.id, "SKIP")} disabled={busy === item.id}>{t("Skip")}</Button>
                  </div>
                </div>
                <div className="mt-3">
                  <Input value={note[item.id] ?? ""} onChange={(e) => setNote((n) => ({ ...n, [item.id]: e.target.value }))} placeholder={t("Add a short note (optional)")} className="h-9 text-xs" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {history.length ? (
        <Card className="p-5">
          <h2 className="font-bold">{t("Action history")}</h2>
          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {history.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-white">{t(item.title)}</div>
                  <div className="text-xs text-slate-400">{dateLabel(item.completedAt ?? item.dueDate)}{item.completedNote ? ` · ${item.completedNote}` : ""}</div>
                </div>
                <StatusBadge tone={item.status === "DONE" ? "positive" : "neutral"}>{item.status === "DONE" ? t("Done") : t("Skipped")}</StatusBadge>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Administration view (templates + one-off assignment)
// ---------------------------------------------------------------------------

function AdminView({ templates, users, classes }: { templates: AdminTemplateRow[]; users: AssignableUser[]; classes: { id: string; name: string }[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetRole, setTargetRole] = useState("TEACHER");
  const [required, setRequired] = useState("OPTIONAL");
  const [frequency, setFrequency] = useState("WEEKLY");
  const [classId, setClassId] = useState("");

  const [assignRole, setAssignRole] = useState("TEACHER");
  const [assignee, setAssignee] = useState("");
  const [aTitle, setATitle] = useState("");
  const [aDueDate, setADueDate] = useState("");
  const [aRequired, setARequired] = useState("OPTIONAL");

  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createTemplate() {
    setBusy("template");
    setError(null);
    const data = await send("/api/admin/actions", "POST", { code, title, description, targetRole, required, frequency, classId: classId || null });
    if (data.ok) {
      setResult("Template created");
      setCode(""); setTitle(""); setDescription("");
      router.refresh();
    } else {
      setError(data.code ?? "Error");
    }
    setBusy(null);
  }

  async function toggle(id: string) {
    await send(`/api/admin/actions/${id}`, "PATCH", {});
    router.refresh();
  }

  async function remove(id: string) {
    await send(`/api/admin/actions/${id}`, "DELETE", {});
    router.refresh();
  }

  async function assign() {
    setBusy("assign");
    setError(null);
    const data = await send("/api/actions", "POST", {
      assigneeUserId: assignee,
      title: aTitle,
      dueDate: aDueDate,
      required: aRequired,
    });
    if (data.ok) {
      setResult("Action assigned");
      setAssignee(""); setATitle(""); setADueDate("");
      router.refresh();
    } else {
      setError(data.code ?? "Error");
    }
    setBusy(null);
  }

  const filteredUsers = users.filter((u) => u.role === assignRole);

  return (
    <div className="space-y-6">
      <PageHeader title={t("Actions")} description={t("Recurring mandatory and optional actions for teachers, students and parents — assigned by you or suggested by the app.")} />
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label={t("Templates")} value={templates.length} detail={t("Active and inactive")} icon={ClipboardList} />
        <MetricCard label={t("Teachers")} value={templates.filter((tpl) => tpl.targetRole === "TEACHER").length} detail={t("Targeting teachers")} icon={CheckCircle2} tone="sky" />
        <MetricCard label={t("Students & parents")} value={templates.filter((tpl) => tpl.targetRole !== "TEACHER").length} detail={t("Targeting families")} icon={History} tone="amber" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-bold">{t("New recurring action")}</h2>
          <p className="text-xs text-slate-500">{t("The app will assign it automatically to every eligible person, once per period.")}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div><Label>{t("Code")}</Label><Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. WEEKLY_CHECKIN" /></div>
            <div><Label>{t("Title")}</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("What should be done?")} /></div>
            <div className="sm:col-span-2"><Label>{t("Description")}</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("Optional details")} /></div>
            <div><Label>{t("Target")}</Label>
              <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
                <option value="TEACHER">{t("Teachers")}</option><option value="STUDENT">{t("Students")}</option><option value="PARENT">{t("Parents")}</option>
              </select></div>
            <div><Label>{t("Frequency")}</Label>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
                <option value="DAILY">{t("Every day")}</option><option value="WEEKLY">{t("Every week")}</option><option value="MONTHLY">{t("Every month")}</option><option value="ONE_OFF">{t("Once")}</option>
              </select></div>
            <div><Label>{t("Type")}</Label>
              <select value={required} onChange={(e) => setRequired(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
                <option value="OPTIONAL">{t("Optional")}</option><option value="MANDATORY">{t("Mandatory")}</option>
              </select></div>
            <div><Label>{t("Scope")}</Label>
              <select value={classId} onChange={(e) => setClassId(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
                <option value="">{t("Whole school")}</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select></div>
          </div>
          <Button className="mt-4" onClick={createTemplate} disabled={busy === "template" || !title.trim()}>{busy === "template" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {t("Create action")}</Button>
          {error && busy === "template" ? <p className="mt-2 text-xs text-rose-600">{t("Failed — code not unique or invalid.")}</p> : null}
        </Card>

        <Card className="p-5">
          <h2 className="font-bold">{t("Assign a one-off action")}</h2>
          <p className="text-xs text-slate-500">{t("Send a specific task to one person immediately.")}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div><Label>{t("To")}</Label>
              <select value={assignRole} onChange={(e) => { setAssignRole(e.target.value); setAssignee(""); }} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
                <option value="TEACHER">{t("Teachers")}</option><option value="STUDENT">{t("Students")}</option><option value="PARENT">{t("Parents")}</option>
              </select></div>
            <div><Label>{t("Person")}</Label>
              <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
                <option value="">{t("Select…")}</option>
                {filteredUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select></div>
            <div className="sm:col-span-2"><Label>{t("Title")}</Label><Input value={aTitle} onChange={(e) => setATitle(e.target.value)} placeholder={t("What should be done?")} /></div>
            <div><Label>{t("Due date")}</Label><Input type="date" value={aDueDate} onChange={(e) => setADueDate(e.target.value)} /></div>
            <div><Label>{t("Type")}</Label>
              <select value={aRequired} onChange={(e) => setARequired(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
                <option value="OPTIONAL">{t("Optional")}</option><option value="MANDATORY">{t("Mandatory")}</option>
              </select></div>
          </div>
          <Button className="mt-4" onClick={assign} disabled={busy === "assign" || !assignee || !aTitle.trim() || !aDueDate}>{busy === "assign" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {t("Assign")}</Button>
          {error && busy === "assign" ? <p className="mt-2 text-xs text-rose-600">{t("Could not assign — check the recipient.")}</p> : null}
        </Card>
      </div>

      {result ? <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{t(result)}</p> : null}

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 p-4 dark:border-slate-800"><h2 className="font-bold">{t("Recurring actions")}</h2><p className="text-xs text-slate-500">{t("Generated automatically each period for every eligible person.")}</p></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-900">
              <tr><th className="px-4 py-3">{t("Action")}</th><th className="px-4 py-3">{t("Target")}</th><th className="px-4 py-3">{t("Frequency")}</th><th className="px-4 py-3">{t("Coverage")}</th><th className="px-4 py-3">{t("Status")}</th><th className="px-4 py-3" /></tr>
            </thead>
            <tbody>
              {templates.map((tpl) => (
                <tr key={tpl.id} className="border-t border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/60">
                  <td className="px-4 py-3"><div className="font-semibold text-slate-900 dark:text-white">{t(tpl.title)}</div><div className="text-xs text-slate-400">{tpl.code}</div></td>
                  <td className="px-4 py-3"><StatusBadge tone="neutral">{t(tpl.targetRole === "TEACHER" ? "Teachers" : tpl.targetRole === "STUDENT" ? "Students" : "Parents")}</StatusBadge> {tpl.required === "MANDATORY" ? <StatusBadge tone="attention">{t("Mandatory")}</StatusBadge> : null}</td>
                  <td className="px-4 py-3 text-slate-500">{t(tpl.frequency === "DAILY" ? "Every day" : tpl.frequency === "WEEKLY" ? "Every week" : tpl.frequency === "MONTHLY" ? "Every month" : "Once")}</td>
                  <td className="px-4 py-3 text-slate-500">{tpl.generated}/{tpl.eligible} {t("assigned")}</td>
                  <td className="px-4 py-3"><StatusBadge tone={tpl.active ? "positive" : "neutral"}>{tpl.active ? t("Active") : t("Paused")}</StatusBadge></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => toggle(tpl.id)} title={tpl.active ? t("Pause") : t("Activate")}>{tpl.active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}</Button>
                      {tpl.source === "ADMIN" ? <Button size="icon" variant="ghost" onClick={() => remove(tpl.id)} title={t("Delete")}><Trash2 className="h-4 w-4" /></Button> : null}
                    </div>
                  </td>
                </tr>
              ))}
              {!templates.length ? <tr><td colSpan={6} className="p-8 text-center text-sm text-slate-500">{t("No recurring actions yet — create your first one above.")}</td></tr> : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export function ActionsPage(props: Props) {
  if (props.mode === "admin") return <AdminView templates={props.templates} users={props.users} classes={props.classes} />;
  return <MineView pending={props.pending} history={props.history} counts={props.counts} />;
}
