"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Building2, GraduationCap, Loader2, Network, Pencil, Plus, Trash2, Users, Wallet } from "lucide-react";
import { MetricCard, PageHeader, StatusBadge } from "@/components/demo-ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { send } from "@/components/admin-panels";
import { useI18n } from "@/i18n/provider";
import type { BillingRow, GroupBillingCycle, GroupsOverview, PlatformGroupEntry } from "@/lib/platform/groups";

const inputClass = "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100";

const COUNTRY_OPTIONS = [
  { code: "MA", label: "Morocco" },
  { code: "FR", label: "France" },
  { code: "ES", label: "Spain" },
  { code: "BE", label: "Belgium" },
  { code: "CA", label: "Canada" },
  { code: "SN", label: "Senegal" },
  { code: "US", label: "United States" },
];

const GROUP_STATUS_OPTIONS = ["ACTIVE", "SUSPENDED", "ARCHIVED"];

function statusTone(status: string): "positive" | "neutral" | "watch" | "attention" {
  if (status === "ACTIVE") return "positive";
  if (status === "SUSPENDED") return "attention";
  return "neutral";
}

function statusLabel(status: string) {
  if (status === "ACTIVE") return "Active";
  if (status === "SUSPENDED") return "Suspended";
  if (status === "ARCHIVED") return "Archived";
  return "Inactive";
}

function cycleTone(status: string): "positive" | "neutral" | "watch" | "attention" {
  if (status === "PAID") return "positive";
  if (status === "OVERDUE") return "attention";
  return "watch";
}

function cycleLabel(status: string) {
  if (status === "PAID") return "Paid";
  if (status === "OVERDUE") return "Overdue";
  return "Pending";
}

function CredentialBox({ accounts }: { accounts: { name: string; email: string; password: string }[] }) {
  const { t } = useI18n();
  if (!accounts.length) return null;
  return (
    <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs dark:border-emerald-500/30 dark:bg-emerald-500/10">
      <div className="font-semibold text-emerald-700 dark:text-emerald-300">{t("Account created")}</div>
      <p className="mt-1 text-emerald-700/70 dark:text-emerald-300/70">{t("Temporary passwords — share them once. Each person will change theirs at first login.")}</p>
      <div className="mt-2 space-y-1 font-mono">
        {accounts.map((a) => <div key={a.email} className="text-emerald-700 dark:text-emerald-300">{a.name} · {a.email} · {a.password}</div>)}
      </div>
    </div>
  );
}

function Amount({ value }: { value: number }) {
  const { formatNumber } = useI18n();
  return <span dir="ltr">{formatNumber(value)} DH</span>;
}

// ---------------------------------------------------------------------------
// Create a school group
// ---------------------------------------------------------------------------

export function CreateGroupSheet() {
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ name: string; slug: string } | null>(null);

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("MA");
  const [pricePerSeat, setPricePerSeat] = useState("25");

  async function submit() {
    setBusy(true); setError(null); setCreated(null);
    const data = await send("/api/admin/groups", "POST", {
      name, city: city || null, country, pricePerSeat: Number(pricePerSeat) || 25,
    });
    setBusy(false);
    if (data.ok) {
      setCreated({ name: data.name, slug: data.slug });
      setName(""); setCity(""); setCountry("MA"); setPricePerSeat("25");
      router.refresh();
      setOpen(false);
    } else {
      setError(data.code === "NAME_TAKEN" ? "Name already used" : "Could not create the group");
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 h-4 w-4" />
          {t("New group")}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold">{t("Create a school group")}</h2>
            <p className="text-xs text-slate-500">{t("Creates a new group of schools with its own seats-based billing subscription.")}</p>
          </div>
          <div className="space-y-3">
            <div><Label>{t("Group name")}</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Groupe Scolaire Atlas" /></div>
            <div><Label>{t("City")}</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
            <div><Label>{t("Country")}</Label>
              <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass}>{COUNTRY_OPTIONS.map((c) => <option key={c.code} value={c.code}>{t(c.label)}</option>)}</select></div>
            <div><Label>{t("Price per seat")}</Label><Input type="number" value={pricePerSeat} onChange={(e) => setPricePerSeat(e.target.value)} /></div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={submit} disabled={busy || !name.trim()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {t("Create group")}</Button>
            <SheetClose asChild><Button variant="ghost">{t("Cancel")}</Button></SheetClose>
          </div>
          {error ? <span className="text-xs font-medium text-rose-600">{t(error)}</span> : null}
          {created ? (
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs dark:border-sky-500/30 dark:bg-sky-500/10">
              <div className="font-semibold text-sky-700 dark:text-sky-300">{t("Group created")}</div>
              <div className="mt-1 text-sky-700/70 dark:text-sky-300/70">{created.name} · {created.slug}</div>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Edit / delete a group card
// ---------------------------------------------------------------------------

export function GroupEditPanel({ group, onCancel }: { group: PlatformGroupEntry; onCancel: () => void }) {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [name, setName] = useState(group.name);
  const [city, setCity] = useState(group.city ?? "");
  const [country, setCountry] = useState(group.country);
  const [status, setStatus] = useState(group.status);
  const [pricePerSeat, setPricePerSeat] = useState(String(group.pricePerSeat));

  async function save() {
    setBusy(true); setError(null);
    const data = await send("/api/admin/groups", "PATCH", {
      id: group.id, name, city: city || null, country, status, pricePerSeat: Number(pricePerSeat) || 25,
    });
    setBusy(false);
    if (data.ok) {
      router.refresh();
      onCancel();
    } else {
      setError(data.code === "NAME_TAKEN" ? "Name already used" : "Could not update the group");
    }
  }

  async function remove() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setBusy(true); setError(null);
    const data = await send("/api/admin/groups", "DELETE", { id: group.id });
    setBusy(false);
    if (data.ok) {
      router.refresh();
      onCancel();
    } else {
      setError(data.code === "GROUP_HAS_SCHOOLS" ? "This group still has schools attached — move them first." : "Could not delete the group");
      setConfirmDelete(false);
    }
  }

  return (
    <div className="space-y-3 border-t border-slate-100 pt-3 dark:border-slate-800">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>{t("Group name")}</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><Label>{t("City")}</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
        <div><Label>{t("Country")}</Label>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass}>{COUNTRY_OPTIONS.map((c) => <option key={c.code} value={c.code}>{t(c.label)}</option>)}</select></div>
        <div><Label>{t("Status")}</Label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>{GROUP_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{t(statusLabel(s))}</option>)}</select></div>
        <div><Label>{t("Price per seat")}</Label><Input type="number" value={pricePerSeat} onChange={(e) => setPricePerSeat(e.target.value)} /></div>
      </div>
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={save} disabled={busy || !name.trim()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} {t("Save")}</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>{t("Cancel")}</Button>
        <div className="flex-1" />
        <Button size="sm" variant="destructive" onClick={remove} disabled={busy}>
          {confirmDelete ? t("Confirm delete") : <Trash2 className="h-4 w-4" />}
        </Button>
      </div>
      {error ? <span className="text-xs font-medium text-rose-600">{t(error)}</span> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Assign a group manager
// ---------------------------------------------------------------------------

type Candidate = { id: string; name: string; email: string; roles: string[] };

export function AssignGroupManagerSheet({
  groupId,
  groups,
  onClose,
}: {
  groupId: string | null;
  groups: { id: string; name: string }[];
  onClose: () => void;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ name: string; email: string; password: string } | null>(null);

  const [selectedGroupId, setSelectedGroupId] = useState(groupId ?? groups[0]?.id ?? "");
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidateId, setCandidateId] = useState("");
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  useEffect(() => {
    setSelectedGroupId(groupId ?? groups[0]?.id ?? "");
  }, [groupId, groups]);

  useEffect(() => {
    if (mode !== "existing" || !selectedGroupId) {
      setCandidates([]);
      setCandidateId("");
      return;
    }
    let cancelled = false;
    setLoadingCandidates(true);
    send(`/api/admin/group-managers?groupId=${encodeURIComponent(selectedGroupId)}`, "GET")
      .then((data) => {
        if (cancelled) return;
        const list = (data.candidates ?? []) as Candidate[];
        setCandidates(list);
        setCandidateId(list[0]?.id ?? "");
      })
      .finally(() => {
        if (!cancelled) setLoadingCandidates(false);
      });
    return () => { cancelled = true; };
  }, [mode, selectedGroupId]);

  useEffect(() => {
    const selected = candidates.find((c) => c.id === candidateId);
    setEmail(selected?.email ?? "");
  }, [candidateId, candidates]);

  async function submit() {
    setBusy(true); setError(null); setResult(null);
    const data = await send("/api/admin/group-managers", "POST", {
      groupId: selectedGroupId, mode, firstName, lastName, email,
    });
    setBusy(false);
    if (data.ok) {
      if (data.temporaryPassword) {
        setResult({ name: `${data.firstName} ${data.lastName}`, email: data.email, password: data.temporaryPassword });
      }
      setFirstName(""); setLastName(""); setCandidateId(""); setCandidates([]);
      router.refresh();
      if (!data.temporaryPassword) onClose();
    } else {
      setError(
        data.code === "EMAIL_TAKEN" ? "Email already used"
          : data.code === "NOT_FOUND" ? "No account found with this email"
            : data.code === "ALREADY_MANAGER" ? "Already a manager of another group"
              : "Could not assign manager",
      );
    }
  }

  return (
    <Sheet open={!!groupId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md">
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold">{t("Assign a group manager")}</h2>
            <p className="text-xs text-slate-500">{t("Assign a group manager account that will oversee all the schools of this group.")}</p>
          </div>
          <div className="space-y-3">
            <div><Label>{t("Group")}</Label>
              <select value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)} className={inputClass}>
                {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div><Label>{t("Account source")}</Label>
              <select value={mode} onChange={(e) => setMode(e.target.value as "existing" | "new")} className={inputClass}>
                <option value="existing">{t("Use an existing account")}</option>
                <option value="new">{t("Create a new account")}</option>
              </select>
            </div>
            {mode === "existing" ? (
              <div>
                <Label>{t("Existing account")}</Label>
                <select value={candidateId} onChange={(e) => setCandidateId(e.target.value)} className={inputClass}>
                  {loadingCandidates ? <option>{t("Loading…")}</option> : candidates.length ? candidates.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.email}</option>) : <option value="">{t("No account available")}</option>}
                </select>
                {candidateId ? <div className="mt-1 text-xs text-slate-500">{email}</div> : null}
              </div>
            ) : (
              <>
                <div><Label>{t("First name")}</Label><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
                <div><Label>{t("Last name")}</Label><Input value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
                <div><Label>{t("Email")}</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="manager@group.com" /></div>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={submit} disabled={busy || !email.trim() || !selectedGroupId || (mode === "new" && (!firstName.trim() || !lastName.trim()))}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {t("Assign")}
            </Button>
            <SheetClose asChild><Button variant="ghost" onClick={onClose}>{t("Cancel")}</Button></SheetClose>
          </div>
          {error ? <span className="text-xs font-medium text-rose-600">{t(error)}</span> : null}
          <CredentialBox accounts={result ? [result] : []} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Billing cycle management
// ---------------------------------------------------------------------------

export function GroupBillingPanel({ cycles, groups }: { cycles: BillingRow[]; groups: { id: string; name: string }[] }) {
  const { t, formatDate, formatNumber } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [recording, setRecording] = useState<BillingRow | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function patch(id: string, body: Record<string, unknown>) {
    setBusy(id);
    await send("/api/admin/group-billing", "PATCH", { id, ...body });
    setBusy(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm(t("Remove this billing cycle?"))) return;
    setBusy(id);
    await send("/api/admin/group-billing", "DELETE", { id });
    setBusy(null);
    router.refresh();
  }

  function sendInvoice(id: string) {
    setNotice(t("Invoice sending is not implemented yet — it will be sent via WhatsApp or email."));
    window.setTimeout(() => setNotice(null), 5000);
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"><Wallet className="h-5 w-5" /></div>
        <div className="flex-1">
          <h2 className="font-bold">{t("Billing")}</h2>
          <p className="text-xs text-slate-500">{t("Seats-based subscription — amounts are computed from each group's total seat limit.")}</p>
        </div>
        <CreateBillingSheet groups={groups} />
      </div>

      {notice ? (
        <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300">{notice}</div>
      ) : null}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-2 py-2">{t("Group")}</th>
              <th className="px-2 py-2">{t("Period")}</th>
              <th className="px-2 py-2">{t("Seats")}</th>
              <th className="px-2 py-2">{t("Price/seat")}</th>
              <th className="px-2 py-2">{t("Amount")}</th>
              <th className="px-2 py-2">{t("Status")}</th>
              <th className="px-2 py-2">{t("Due date")}</th>
              <th className="px-2 py-2">{t("Paid on")}</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {cycles.map((cycle) => {
              const isBusy = busy === cycle.id;
              return (
                <>
                <tr key={cycle.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-2 py-2 font-semibold">{cycle.groupName}</td>
                  <td className="px-2 py-2" dir="ltr">{cycle.period}</td>
                  <td className="px-2 py-2">{cycle.seatCount}</td>
                  <td className="px-2 py-2"><Amount value={cycle.pricePerSeat} /></td>
                  <td className="px-2 py-2 font-semibold"><Amount value={cycle.amount} /></td>
                  <td className="px-2 py-2"><StatusBadge tone={cycleTone(cycle.status)}>{cycleLabel(cycle.status)}</StatusBadge></td>
                  <td className="px-2 py-2 text-slate-500">{cycle.dueDate ? formatDate(cycle.dueDate) : "—"}</td>
                  <td className="px-2 py-2 text-slate-500">{cycle.paidAt ? formatDate(cycle.paidAt) : "—"}</td>
                  <td className="px-2 py-2">
                    <div className="flex items-center justify-end gap-1">
                      {cycle.status !== "PAID" ? (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" disabled={isBusy} onClick={() => patch(cycle.id, { status: "PAID" })}>
                          {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} {t("Mark as paid")}
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" disabled={isBusy} onClick={() => patch(cycle.id, { status: "PENDING" })}>
                          {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} {t("Reopen")}
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" disabled={isBusy} onClick={() => setRecording(cycle)}>
                        {t("Record payment")}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" disabled={isBusy} onClick={() => sendInvoice(cycle.id)}>
                        {t("Send invoice")}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-600 hover:text-rose-700" disabled={isBusy} onClick={() => remove(cycle.id)} title={t("Remove")}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
                {cycle.payments.length ? (
                  <tr className="border-t border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40">
                    <td colSpan={9} className="px-4 py-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-semibold text-slate-500">{t("Payments")}:</span>
                        {cycle.payments.map((payment) => (
                          <span key={payment.id} className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2 py-1 dark:border-slate-700">
                            <span className={payment.type === "charge" ? "text-rose-600" : "text-emerald-600"}>{t(paymentLabel(payment.type))}</span>
                            <span dir="ltr" className="font-semibold text-slate-700 dark:text-slate-200">{formatNumber(payment.amount)} DH</span>
                            {payment.note ? <span className="text-slate-400">· {payment.note}</span> : null}
                            <span className="text-slate-400">{formatDate(payment.createdAt)}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ) : null}
                </>
              );
            })}
          </tbody>
        </table>
        {!cycles.length ? <p className="p-8 text-center text-sm text-slate-500">{t("No billing cycle yet")}</p> : null}
      </div>

      <RecordPaymentSheet cycle={recording} onClose={() => setRecording(null)} />
    </Card>
  );
}

function paymentLabel(type: string) {
  if (type === "add") return "Payment";
  if (type === "charge") return "Add charge";
  if (type === "refund") return "Add refund";
  if (type === "credit") return "Add credit";
  return "Payment";
}

function RecordPaymentSheet({ cycle, onClose }: { cycle: BillingRow | null; onClose: () => void }) {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [type, setType] = useState<"add" | "charge" | "refund" | "credit">("add");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (cycle) {
      setType("add");
      setAmount("");
      setNote("");
      setError(null);
      setSuccess(false);
    }
  }, [cycle]);

  async function submit() {
    if (!cycle) return;
    setBusy(true); setError(null); setSuccess(false);
    const data = await send("/api/admin/group-payments", "POST", {
      billingId: cycle.id,
      type,
      amount: Number(amount) || 0,
      note: note || null,
    });
    setBusy(false);
    if (data.ok) {
      setSuccess(true);
      setAmount("");
      setNote("");
      router.refresh();
    } else {
      setError(t("Could not record the payment"));
    }
  }

  return (
    <Sheet open={!!cycle} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md">
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold">{t("Record payment")}</h2>
            <p className="text-xs text-slate-500">
              {cycle ? <>{cycle.groupName} · <span dir="ltr">{cycle.period}</span></> : ""}
            </p>
          </div>
          <div className="space-y-3">
            <div><Label>{t("Payment type")}</Label>
              <select value={type} onChange={(e) => setType(e.target.value as "add" | "charge" | "refund" | "credit")} className={inputClass}>
                <option value="add">{t("Payment")}</option>
                <option value="charge">{t("Add charge")}</option>
                <option value="refund">{t("Add refund")}</option>
                <option value="credit">{t("Add credit")}</option>
              </select>
            </div>
            <div><Label>{t("Payment amount")}</Label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" /></div>
            <div><Label>{t("Note")}</Label><Input value={note} onChange={(e) => setNote(e.target.value)} /></div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={submit} disabled={busy || !Number(amount) || Number(amount) <= 0}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} {t("Record")}
            </Button>
            <SheetClose asChild><Button variant="ghost">{t("Cancel")}</Button></SheetClose>
          </div>
          {error ? <span className="text-xs font-medium text-rose-600">{t(error)}</span> : null}
          {success ? <span className="text-xs font-medium text-emerald-600">{t("Payment recorded")}</span> : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CreateBillingSheet({ groups }: { groups: { id: string; name: string }[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [note, setNote] = useState("");

  async function submit() {
    setBusy(true); setError(null);
    const data = await send("/api/admin/group-billing", "POST", {
      groupId, period, dueDate: dueDate || null, status, note: note || null,
    });
    setBusy(false);
    if (data.ok) {
      setDueDate(""); setNote("");
      router.refresh();
      setOpen(false);
    } else {
      setError("Could not create the billing cycle");
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="mr-1 h-4 w-4" />
          {t("New billing cycle")}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold">{t("Create a billing cycle")}</h2>
            <p className="text-xs text-slate-500">{t("Seats-based subscription — amounts are computed from each group's total seat limit.")}</p>
          </div>
          <div className="space-y-3">
            <div><Label>{t("Group")}</Label>
              <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className={inputClass}>{groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
            <div><Label>{t("Period")}</Label><Input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} /></div>
            <div><Label>{t("Due date")}</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
            <div><Label>{t("Status")}</Label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
                <option value="PENDING">{t("Pending")}</option>
                <option value="PAID">{t("Paid")}</option>
                <option value="OVERDUE">{t("Overdue")}</option>
              </select></div>
            <div><Label>{t("Note")}</Label><Input value={note} onChange={(e) => setNote(e.target.value)} /></div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={submit} disabled={busy || !groupId || !period}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {t("Create")}</Button>
            <SheetClose asChild><Button variant="ghost">{t("Cancel")}</Button></SheetClose>
          </div>
          {error ? <span className="text-xs font-medium text-rose-600">{t(error)}</span> : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function GroupsPage({ groups, overview, billing }: { groups: PlatformGroupEntry[]; overview: GroupsOverview; billing: BillingRow[] }) {
  const { t, formatDate, formatNumber } = useI18n();
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [assigningGroupId, setAssigningGroupId] = useState<string | null>(null);
  const [busyManager, setBusyManager] = useState<string | null>(null);

  async function removeManager(userId: string) {
    if (!confirm(t("Remove this group manager?"))) return;
    setBusyManager(userId);
    await send("/api/admin/group-managers", "DELETE", { userId });
    setBusyManager(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("School groups")}
        description={t("Manage the school groups of the platform: create groups, delegate group managers and track their seats-based billing.")}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t("Groups")} value={overview.groups} detail={t("Active")} icon={Network} />
        <MetricCard label={t("Schools")} value={overview.schools} detail={t("Total seats") + `: ${overview.totalSeats}`} icon={Building2} tone="sky" />
        <MetricCard label={t("Students")} value={overview.totalStudents} detail={t("Across all groups")} icon={GraduationCap} tone="amber" />
        <MetricCard label={t("Outstanding")} value={`${formatNumber(overview.outstanding)} DH`} detail={t("Unpaid billing cycles")} icon={Wallet} tone="violet" />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("School groups")}</h2>
        <CreateGroupSheet />
      </div>

      <div>
        {groups.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => {
              const editing = editingId === group.id;
              const latest = group.billing[0] ?? null;
              return (
                <Card key={group.id} className="flex flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10">
                        <Network className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{group.name}</div>
                        <div className="text-xs text-slate-500">{group.city ?? "—"} · {t(group.country)}</div>
                      </div>
                    </div>
                    <StatusBadge tone={statusTone(group.status)}>{statusLabel(group.status)}</StatusBadge>
                  </div>

                  {editing ? (
                    <GroupEditPanel group={group} onCancel={() => setEditingId(null)} />
                  ) : (
                    <>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-xl bg-slate-50 py-2 dark:bg-slate-900">
                          <div className="flex items-center justify-center gap-1 text-xs text-slate-500"><Building2 className="h-3.5 w-3.5" />{t("Schools")}</div>
                          <div className="text-lg font-bold text-slate-900 dark:text-white">{group.schoolCount}</div>
                        </div>
                        <div className="rounded-xl bg-slate-50 py-2 dark:bg-slate-900">
                          <div className="flex items-center justify-center gap-1 text-xs text-slate-500"><Users className="h-3.5 w-3.5" />{t("Seats")}</div>
                          <div className="text-lg font-bold text-slate-900 dark:text-white">{group.totalSeats}</div>
                        </div>
                        <div className="rounded-xl bg-slate-50 py-2 dark:bg-slate-900">
                          <div className="flex items-center justify-center gap-1 text-xs text-slate-500"><GraduationCap className="h-3.5 w-3.5" />{t("Students")}</div>
                          <div className="text-lg font-bold text-slate-900 dark:text-white">{group.totalStudents}</div>
                        </div>
                      </div>

                      {latest ? (
                        <div className="mt-4 rounded-xl border border-slate-100 px-3 py-2 text-xs dark:border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">{t("Latest cycle")} · <span dir="ltr">{latest.period}</span></span>
                            <span className="flex items-center gap-2">
                              <Amount value={latest.amount} />
                              <StatusBadge tone={cycleTone(latest.status)}>{cycleLabel(latest.status)}</StatusBadge>
                            </span>
                          </div>
                          <div className="mt-1 text-slate-400">
                            {t("Due date")}: {latest.dueDate ? formatDate(latest.dueDate) : "—"}
                          </div>
                        </div>
                      ) : null}

                      <div className="mt-4">
                        <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
                          <span>{t("Managers")}</span>
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setAssigningGroupId(group.id)}>
                            <Plus className="mr-1 h-3 w-3" /> {t("Add")}
                          </Button>
                        </div>
                        {group.managers.length ? (
                          <div className="space-y-1.5">
                            {group.managers.map((manager) => {
                              const isBusy = busyManager === manager.id;
                              return (
                                <div key={manager.id} className="flex items-center justify-between gap-2 text-sm">
                                  <span className="truncate">{manager.firstName} {manager.lastName}</span>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-rose-600 hover:text-rose-700"
                                    disabled={isBusy}
                                    onClick={() => removeManager(manager.id)}
                                    title={t("Remove")}
                                  >
                                    {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                  </Button>
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
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(group.id)} title={t("Edit")}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => setAssigningGroupId(group.id)}>
                          <Plus className="mr-1 h-3.5 w-3.5" /> {t("Assign manager")}
                        </Button>
                      </div>
                    </>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center text-sm text-slate-500">{t("No group yet — create your first group above.")}</Card>
        )}
      </div>

      <GroupBillingPanel cycles={billing} groups={groups.map((g) => ({ id: g.id, name: g.name }))} />

      <AssignGroupManagerSheet
        groupId={assigningGroupId}
        groups={groups.map((g) => ({ id: g.id, name: g.name }))}
        onClose={() => setAssigningGroupId(null)}
      />
    </div>
  );
}
