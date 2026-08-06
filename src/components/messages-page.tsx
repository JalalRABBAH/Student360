"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  GraduationCap,
  MessageSquare,
  Plus,
  School,
  Search,
  Send,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/demo-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn, initials } from "@/lib/utils";
import { useI18n } from "@/i18n/provider";
import type {
  RecipientDirectory,
  RecipientEntry,
  RecipientType,
  ThreadDetail,
  ThreadMessage,
  ThreadSummary,
} from "@/lib/messages/service";

const CATEGORY_FILTERS = ["ALL", "GENERAL", "ACADEMIC", "WELLBEING", "ATTENDANCE", "HOMEWORK", "ADMIN"];

const CATEGORY_TONE: Record<string, string> = {
  GENERAL: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  ACADEMIC: "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
  WELLBEING: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
  ATTENDANCE: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  HOMEWORK: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  ADMIN: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
};

function timeLabel(iso: string, t: (s: string) => string) {
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const ts = date.getTime();
  if (ts >= startOfToday) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (ts >= startOfToday - 86_400_000) return t("Yesterday");
  if (ts >= startOfToday - 6 * 86_400_000) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { day: "numeric", month: "short" });
}

function entryAvatar(entry: RecipientEntry) {
  if (entry.kind === "class") {
    return (
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
        <Users className="h-4 w-4" />
      </div>
    );
  }
  return (
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 text-xs font-bold text-white">
      {entry.avatarText}
    </div>
  );
}

function Bubble({ message, t }: { message: ThreadMessage; t: (s: string) => string }) {
  const { formatDate } = useI18n();
  return (
    <div className={cn("flex", message.own ? "justify-end" : "justify-start")}>
      <div className="flex max-w-[80%] items-end gap-2">
        {!message.own && (
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {initials(message.sender.name.split(" ")[0], message.sender.name.split(" ").slice(1).join(" "))}
          </div>
        )}
        <div>
          {!message.own && (
            <p className="mb-0.5 ms-1 text-[11px] font-semibold text-slate-500">
              {message.sender.name} · <span className="font-normal text-slate-400">{t(message.sender.role)}</span>
            </p>
          )}
          <div
            className={cn(
              "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
              message.own
                ? "rounded-ee-md bg-primary-600 text-white"
                : "rounded-es-md border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100",
            )}
          >
            {message.body}
            <div className={cn("mt-1 text-[9px]", message.own ? "text-primary-100" : "text-slate-400")}>
              {formatDate(message.sentAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComposeDialog({
  open,
  directory,
  hasStudents,
  hasClasses,
  onClose,
  onSent,
}: {
  open: boolean;
  directory: RecipientDirectory;
  hasStudents: boolean;
  hasClasses: boolean;
  onClose: () => void;
  onSent: (thread: ThreadDetail) => void;
}) {
  const { t } = useI18n();
  const [recipientType, setRecipientType] = useState<RecipientType>("user");
  const [recipientQuery, setRecipientQuery] = useState("");
  const [recipient, setRecipient] = useState<RecipientEntry | null>(null);
  const [aboutStudentId, setAboutStudentId] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setRecipientType("user");
    setRecipientQuery("");
    setRecipient(null);
    setAboutStudentId("");
    setSubject("");
    setCategory("GENERAL");
    setBody("");
    setError("");
  };

  const close = () => {
    if (sending) return;
    reset();
    onClose();
  };

  const entries = recipientType === "class" ? directory.classes : recipientType === "student" ? directory.students : directory.people;
  const query = recipientQuery.trim().toLowerCase();
  const visible = useMemo(
    () => entries.filter((entry) => !query || `${entry.name} ${entry.subtitle}`.toLowerCase().includes(query)),
    [entries, query],
  );

  const typeTabs: { type: RecipientType; label: string; icon: ReactNode; show: boolean }[] = [
    { type: "user", label: t("Person"), icon: <UserRound className="h-4 w-4" />, show: true },
    { type: "student", label: t("Student"), icon: <GraduationCap className="h-4 w-4" />, show: hasStudents },
    { type: "class", label: t("Class"), icon: <School className="h-4 w-4" />, show: hasClasses },
  ];

  const canSend = recipient && subject.trim() && body.trim() && !sending;

  const send = async () => {
    if (!canSend || !recipient) return;
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientType,
          recipientId: recipient.id,
          subject: subject.trim(),
          body: body.trim(),
          category,
          aboutStudentId: aboutStudentId || undefined,
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "send failed");
      }
      const payload = await response.json();
      reset();
      onSent(payload.thread);
    } catch {
      setError(t("Could not send your message. Please try again."));
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex justify-center bg-slate-950/40 px-4 pt-[8vh] pb-8 backdrop-blur-sm" onMouseDown={close}>
      <div
        className="flex max-h-[84vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
          <div>
            <div className="font-bold">{t("New message")}</div>
            <div className="text-xs text-slate-500">{t("Start a conversation")}</div>
          </div>
          <button type="button" onClick={close} aria-label={t("Close")} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">{t("Recipient")}</label>
            <div className="mb-2 flex gap-1 overflow-x-auto">
              {typeTabs.filter((tab) => tab.show).map((tab) => (
                <button
                  key={tab.type}
                  type="button"
                  onClick={() => {
                    setRecipientType(tab.type);
                    setRecipient(null);
                    setRecipientQuery("");
                  }}
                  className={cn(
                    "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                    recipientType === tab.type
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800",
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {recipient ? (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-2 dark:border-slate-800">
                {entryAvatar(recipient)}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{recipient.name}</div>
                  <div className="truncate text-xs text-slate-500">{t(recipient.subtitle)}</div>
                </div>
                <button type="button" onClick={() => setRecipient(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800" aria-label={t("Remove")}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                {recipientType === "class" ? (
                  <p className="mb-2 text-xs text-slate-500">{t("Message all families of this class.")}</p>
                ) : null}
                <div className="relative">
                  <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={recipientQuery}
                    onChange={(event) => setRecipientQuery(event.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 ps-9 pe-3 text-sm outline-none focus:border-primary-400 dark:border-slate-800 dark:bg-slate-900"
                    placeholder={t("Search people…")}
                    autoFocus
                  />
                </div>
                <div className="mt-2 max-h-44 space-y-1 overflow-y-auto">
                  {visible.length ? (
                    visible.map((entry) => (
                      <button
                        key={`${entry.kind}-${entry.id}`}
                        type="button"
                        onClick={() => setRecipient(entry)}
                        className="flex w-full items-center gap-3 rounded-xl p-2 text-start hover:bg-slate-100 dark:hover:bg-slate-900"
                      >
                        {entryAvatar(entry)}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold">{entry.name}</div>
                          <div className="truncate text-xs text-slate-500">{t(entry.subtitle)}</div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="p-3 text-center text-sm text-slate-500">{t("No matching result.")}</p>
                  )}
                </div>
              </>
            )}
          </div>

          {directory.aboutOptions.length > 0 && recipient ? (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500">{t("About (optional)")}</label>
              <select
                value={aboutStudentId}
                onChange={(event) => setAboutStudentId(event.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary-400 dark:border-slate-800 dark:bg-slate-950"
              >
                <option value="">{t("Not specified")}</option>
                {directory.aboutOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">{t("Subject")}</label>
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              maxLength={120}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary-400 dark:border-slate-800 dark:bg-slate-950"
              placeholder={t("Subject")}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">{t("Category")}</label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary-400 dark:border-slate-800 dark:bg-slate-950"
            >
              {["GENERAL", "ACADEMIC", "WELLBEING", "ATTENDANCE", "HOMEWORK", "ADMIN"].map((code) => (
                <option key={code} value={code}>
                  {t(code)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">{t("Message")}</label>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={4000}
              rows={5}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-primary-400 dark:border-slate-800 dark:bg-slate-950"
              placeholder={t("Write a message…")}
            />
          </div>

          {error ? (
            <p className="flex items-center gap-1.5 text-sm text-rose-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 p-4 dark:border-slate-800">
          <Button variant="outline" onClick={close} disabled={sending}>
            {t("Cancel")}
          </Button>
          <Button onClick={send} disabled={!canSend}>
            {sending ? t("Sending…") : (
              <>
                <Send className="h-4 w-4" />
                {t("Send")}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MessagesPage({
  sessionUser,
  initialThreads,
  directory,
}: {
  sessionUser: { id: string; firstName: string; lastName: string };
  initialThreads: ThreadSummary[];
  directory: RecipientDirectory;
}) {
  const { t } = useI18n();
  const [threads, setThreads] = useState<ThreadSummary[]>(initialThreads);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ThreadDetail | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);

  const visibleThreads = useMemo(
    () =>
      threads.filter((thread) => {
        const matchesCategory = category === "ALL" || thread.category === category;
        const matchesQuery = !query.trim() || `${thread.subject} ${thread.lastMessagePreview} ${thread.lastSenderName} ${thread.aboutStudent?.name ?? ""} ${thread.participantNames.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase());
        return matchesCategory && matchesQuery;
      }),
    [threads, query, category],
  );

  const selected = visibleThreads.find((thread) => thread.id === selectedId) ?? null;

  const openThread = async (id: string) => {
    if (selectedId === id && detail) return;
    setSelectedId(id);
    setDetail(null);
    setError("");
    try {
      const response = await fetch(`/api/messages/${id}`);
      if (!response.ok) throw new Error("load failed");
      const payload = await response.json();
      setDetail(payload.thread);
      fetch(`/api/messages/${id}/read`, { method: "POST" }).catch(() => {});
      setThreads((current) => current.map((thread) => (thread.id === id ? { ...thread, unreadCount: 0 } : thread)));
    } catch {
      setError(t("Could not load this conversation."));
    }
  };

  const sendReply = async () => {
    if (!detail || !draft.trim() || sending) return;
    setSending(true);
    setError("");
    try {
      const response = await fetch(`/api/messages/${detail.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "reply failed");
      }
      const payload = await response.json();
      setDetail((current) => (current ? { ...current, messages: [...current.messages, payload.message] } : current));
      setDraft("");
      setThreads((current) =>
        current.map((thread) =>
          thread.id === detail.id
            ? { ...thread, lastMessagePreview: payload.message.body, lastMessageAt: payload.message.sentAt, lastSenderName: payload.message.sender.name }
            : thread,
        ),
      );
    } catch {
      setError(t("Could not send your message. Please try again."));
    }
    setSending(false);
  };

  const onComposeSent = (thread: ThreadDetail) => {
    const summary: ThreadSummary = {
      id: thread.id,
      subject: thread.subject,
      category: thread.category,
      lastMessageAt: thread.messages[thread.messages.length - 1]?.sentAt ?? new Date().toISOString(),
      lastMessagePreview: thread.messages[thread.messages.length - 1]?.body ?? "",
      lastSenderName: sessionUser.firstName ? `${sessionUser.firstName} ${sessionUser.lastName}` : "You",
      unreadCount: 0,
      participantCount: thread.participants.length,
      participantNames: thread.participants.filter((p) => p.userId !== sessionUser.id).map((p) => p.name),
      aboutStudent: thread.aboutStudent,
      status: "OPEN",
    };
    setThreads((current) => [summary, ...current]);
    setSelectedId(thread.id);
    setDetail(thread);
    setComposeOpen(false);
  };

  const conversationTitle = detail?.aboutStudent?.name ?? detail?.participants.filter((p) => p.userId !== sessionUser.id).map((p) => p.name).join(", ") ?? "";
  const conversationSubtitle = detail?.aboutStudent ? detail.participants.filter((p) => p.userId !== sessionUser.id).map((p) => p.name).join(", ") : "";

  const hasStudents = directory.students.length > 0;
  const hasClasses = directory.classes.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Messages")}
        description={t("Secure collaboration between school staff, students and families.")}
        actions={
          <Button onClick={() => setComposeOpen(true)}>
            <Plus className="me-2 h-4 w-4" />
            {t("New message")}
          </Button>
        }
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 ps-9 pe-3 text-sm outline-none focus:border-primary-400 dark:border-slate-800 dark:bg-slate-900"
            placeholder={t("Search conversations")}
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {CATEGORY_FILTERS.map((code) => (
            <button
              key={code}
              onClick={() => setCategory(code)}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition",
                category === code ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800",
              )}
            >
              {t(code)}
            </button>
          ))}
        </div>
      </div>

      <Card className="grid min-h-[650px] overflow-hidden lg:grid-cols-[360px_1fr]">
        <aside className="border-e border-slate-100 dark:border-slate-800">
          {visibleThreads.length ? (
            <div className="max-h-[60vh] overflow-y-auto lg:max-h-[calc(100vh-16rem)]">
              {visibleThreads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => openThread(thread.id)}
                  className={cn(
                    "w-full border-b border-slate-100 p-4 text-start dark:border-slate-800",
                    selected?.id === thread.id ? "bg-primary-50/60 dark:bg-primary-500/5" : "hover:bg-slate-50 dark:hover:bg-slate-900",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate font-semibold">{thread.aboutStudent?.name ?? thread.participantNames[0] ?? t("Conversation")}</div>
                    <div className="shrink-0 text-[10px] text-slate-400">{timeLabel(thread.lastMessageAt, t)}</div>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="truncate text-xs font-medium text-slate-600 dark:text-slate-300">{thread.subject}</span>
                    <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide", CATEGORY_TONE[thread.category] ?? CATEGORY_TONE.GENERAL)}>
                      {t(thread.category)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="min-w-0 flex-1 truncate text-xs text-slate-500">
                      {thread.lastSenderName ? (
                        <span className="font-medium text-slate-600 dark:text-slate-300">{thread.lastSenderName} · </span>
                      ) : null}
                      {thread.lastMessagePreview}
                    </p>
                    {thread.unreadCount > 0 ? (
                      <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white">
                        {thread.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid h-full min-h-[250px] place-items-center p-8 text-center">
              <div>
                <MessageSquare className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700" />
                <p className="mt-3 font-semibold">{t("No conversations yet")}</p>
                <p className="mt-1 text-sm text-slate-500">{t("Start a conversation")}</p>
              </div>
            </div>
          )}
        </aside>

        <section className="flex min-w-0 flex-col">
          {detail ? (
            <>
              <div className="flex items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 text-xs font-bold text-white">
                  {initials(detail.aboutStudent?.name ?? detail.participants.find((p) => p.userId !== sessionUser.id)?.name ?? "", "")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold">{detail.subject}</div>
                  <div className="truncate text-xs text-slate-500">
                    {conversationTitle}
                    {conversationSubtitle ? ` · ${conversationSubtitle}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", CATEGORY_TONE[detail.category] ?? CATEGORY_TONE.GENERAL)}>
                    {t(detail.category)}
                  </span>
                  {detail.participants.length > 2 ? (
                    <span className="hidden items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 sm:flex dark:bg-slate-800 dark:text-slate-300">
                      <Users className="h-3 w-3" />
                      {t(`${detail.participants.length} participants`)}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex-1 space-y-4 bg-slate-50/50 p-5 dark:bg-slate-950/40">
                {detail.messages.map((message) => (
                  <Bubble key={message.id} message={message} t={t} />
                ))}
                {error ? (
                  <p className="flex items-center gap-1.5 text-sm text-rose-600">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </p>
                ) : null}
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  sendReply();
                }}
                className="flex gap-2 border-t border-slate-100 p-4 dark:border-slate-800"
              >
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  maxLength={4000}
                  className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-primary-400 dark:border-slate-800 dark:bg-slate-900"
                  placeholder={t("Write a message…")}
                />
                <Button type="submit" size="icon" disabled={!draft.trim() || sending} aria-label={t("Send")}>
                  {sending ? <AlertCircle className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </>
          ) : (
            <div className="grid h-full min-h-[300px] place-items-center p-8 text-center text-slate-400 dark:text-slate-600">
              <div>
                <MessageSquare className="mx-auto h-10 w-10" />
                <p className="mt-3 font-semibold">{t("Select a conversation")}</p>
                <p className="text-sm">{t("Choose a conversation to start reading.")}</p>
              </div>
            </div>
          )}
        </section>
      </Card>

      <ComposeDialog
        open={composeOpen}
        directory={directory}
        hasStudents={hasStudents}
        hasClasses={hasClasses}
        onClose={() => setComposeOpen(false)}
        onSent={onComposeSent}
      />
    </div>
  );
}
