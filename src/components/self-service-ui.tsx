"use client";

import { useState } from "react";
import {
  Award,
  BookOpen,
  Check,
  HeartHandshake,
  LifeBuoy,
  MessageSquare,
  Send,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { InsightCard, MetricCard, MiniBars, PageHeader, ProgressBar, StatusBadge, TimelineItem } from "@/components/demo-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LocalizedLink as Link, useI18n } from "@/i18n/provider";
import { intlLocale } from "@/i18n/config";
import { formatDateShort, relativeTime } from "@/lib/utils";
import type {
  AchievementsData,
  FeedbackData,
  GoalsData,
  HelpData,
  ProgressData,
  ProgressSignal,
  ProgressStudent,
} from "@/lib/self-service/service";

const signalTone: Record<ProgressSignal, "positive" | "neutral" | "watch" | "attention"> = {
  POSITIVE: "positive",
  STABLE: "neutral",
  WATCH: "watch",
  ATTENTION: "attention",
};

const signalLabel: Record<ProgressSignal, string> = {
  POSITIVE: "Positive evolution",
  STABLE: "Stable",
  WATCH: "Keep an eye",
  ATTENTION: "Attention suggested",
};

const sentimentTone: Record<string, "positive" | "neutral" | "watch" | "attention"> = {
  POSITIVE: "positive",
  NEUTRAL: "neutral",
  ATTENTION: "attention",
};

const GOAL_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "In progress",
  ACHIEVED: "Achieved",
  PAUSED: "Paused",
  CANCELLED: "Cancelled",
  MISSED: "Not reached",
};

const GOAL_STATUS_TONE: Record<string, "positive" | "neutral" | "watch" | "attention" | "info"> = {
  ACTIVE: "info",
  ACHIEVED: "positive",
  PAUSED: "watch",
  CANCELLED: "neutral",
  MISSED: "attention",
};

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

function StudentProgressList({ students }: { students: ProgressStudent[] }) {
  const { t } = useI18n();
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-[11px] uppercase text-slate-500 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3">{t("Student")}</th>
              <th className="px-4 py-3">{t("Academic")}</th>
              <th className="px-4 py-3">{t("Homework")}</th>
              <th className="px-4 py-3">{t("Engagement")}</th>
              <th className="px-4 py-3">{t("Attendance")}</th>
              <th className="px-4 py-3">{t("Signal")}</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3">
                  <Link href={`/students/${s.id}`} className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-xs font-bold text-white">{s.initials}</div>
                    <div>
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-xs text-slate-500">{t(s.className)}</div>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 font-semibold">{s.indicators.academic !== null ? `${s.indicators.academic}%` : "—"}</td>
                <td className="px-4 py-3">{s.indicators.homework !== null ? `${s.indicators.homework}%` : "—"}</td>
                <td className="px-4 py-3">{s.indicators.engagement !== null ? `${s.indicators.engagement}%` : "—"}</td>
                <td className="px-4 py-3">{s.indicators.attendance !== null ? `${s.indicators.attendance}%` : "—"}</td>
                <td className="px-4 py-3"><StatusBadge tone={signalTone[s.signal]}>{t(signalLabel[s.signal])}</StatusBadge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!students.length ? <p className="py-12 text-center text-sm text-slate-500">{t("No students in view.")}</p> : null}
    </Card>
  );
}

export function ProgressPage({ data }: { data: ProgressData }) {
  const { t } = useI18n();
  const metric = (label: string, value: number | null, detail: string, icon: React.ElementType, tone: "primary" | "sky" | "amber" | "violet") => (
    <MetricCard label={label} value={value !== null ? `${value}%` : "—"} detail={detail} icon={icon} tone={tone} />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.variant === "SELF" ? t("My progress") : t("Progress")}
        description={data.variant === "SELF" ? t("Your growth across multiple dimensions. One number never defines you.") : t("Aggregate growth across the students you can see.")}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metric(t("Academic"), data.metrics.academic, t("Current term"), BookOpen, "primary")}
        {metric(t("Homework"), data.metrics.homework, t("Last 30 days"), BookOpen, "sky")}
        {metric(t("Engagement"), data.metrics.engagement, t("Teacher observations"), Sparkles, "amber")}
        {metric(t("Attendance"), data.metrics.attendance, t("Current term"), BookOpen, "violet")}
      </div>
      {data.weeks ? (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Card className="p-5">
            <h2 className="font-bold">{t("Six-week form")}</h2>
            <p className="text-xs text-slate-500">{t("Your dimensions move independently")}</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <MiniBars values={data.weeks.map((w) => w.homework)} />
                <p className="mt-2 text-xs text-slate-500">{t("Homework consistency")}</p>
              </div>
              <div className="space-y-4">
                <ProgressBar label={t("Academic")} value={data.metrics.academic ?? 0} />
                <ProgressBar label={t("Engagement")} value={data.metrics.engagement ?? 0} tone="amber" />
                <ProgressBar label={t("Motivation")} value={data.metrics.motivation ?? 0} tone="sky" />
              </div>
            </div>
          </Card>
          <div className="space-y-4">
            {data.insights.map((insight) => (
              <InsightCard key={insight.title} positive={insight.tone === "positive"} title={insight.title} reasons={insight.reasons} />
            ))}
          </div>
        </div>
      ) : (
        <StudentProgressList students={data.students} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------

export function GoalsPage({ data }: { data: GoalsData }) {
  const { t, locale } = useI18n();
  const [filter, setFilter] = useState("All");
  const statusOptions = ["All", "ACTIVE", "ACHIEVED", "PAUSED", "CANCELLED", "MISSED"];
  const visible = data.items.filter((item) => filter === "All" || item.status === filter);

  return (
    <div className="space-y-6">
      <PageHeader title={t("Goals")} description={t("Small, practical goals owned by students and supported by adults.")} />
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label={t("Active goals")} value={data.metrics.active} detail={t("In progress")} icon={Target} />
        <MetricCard label={t("Achieved")} value={data.metrics.achieved} detail={t("This term")} icon={Check} tone="sky" />
        <MetricCard label={t("Average progress")} value={`${data.metrics.averageProgress}%`} detail={t("Across visible goals")} tone="amber" />
      </div>
      <div className="flex items-center gap-3">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900">
          {statusOptions.map((option) => <option key={option} value={option}>{t(option === "All" ? "All" : GOAL_STATUS_LABELS[option])}</option>)}
        </select>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visible.length ? (
          visible.map((goal) => (
            <Card key={goal.id} className="p-5">
              <div className="flex justify-between">
                <div className="rounded-xl bg-primary-50 p-2.5 text-primary-600 dark:bg-primary-500/10"><Target className="h-5 w-5" /></div>
                <StatusBadge tone={GOAL_STATUS_TONE[goal.status] ?? "neutral"}>{t(goal.statusLabel)}</StatusBadge>
              </div>
              <h2 className="mt-4 min-h-12 font-bold">{goal.title}</h2>
              <p className="text-xs text-slate-500">
                {t(goal.categoryLabel)}{data.variant === "STAFF" ? ` · ${goal.studentName} · ${t(goal.className)}` : ""}
              </p>
              <div className="mt-5">
                <ProgressBar label={t("Progress")} value={goal.progress} tone={goal.progress >= 100 ? "primary" : "sky"} />
              </div>
              <p className="mt-3 text-xs text-slate-400">{t("Target")} · {formatDateShort(goal.targetDate, intlLocale(locale))}</p>
            </Card>
          ))
        ) : (
          <p className="col-span-full py-12 text-center text-sm text-slate-500">{t("No goals match your search.")}</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------

export function FeedbackPage({ data }: { data: FeedbackData }) {
  const { t, locale } = useI18n();
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [ack, setAck] = useState<string[]>([]);
  const visible = data.items.filter((item) => {
    const matchesFilter =
      filter === "All" || (filter === "Positive" ? item.sentiment === "POSITIVE" : filter === "Attention" ? item.sentiment === "ATTENTION" : item.sentiment === "NEUTRAL");
    const matchesQuery = `${item.studentName} ${item.note ?? ""} ${item.categoryLabel} ${item.subject ?? ""}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t("Feedback")} description={t("Encouragement, useful next steps and teacher comments in one place.")} />
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label={t("Feedback this month")} value={data.metrics.month} detail={t("From teachers")} icon={MessageSquare} />
        <MetricCard label={t("Positive highlights")} value={data.metrics.positive} detail={t("Strengths worth recognising")} icon={Sparkles} tone="sky" />
        <MetricCard label={t("Helpful next steps")} value={data.metrics.nextSteps} detail={t("Actionable and supportive")} icon={HeartHandshake} tone="amber" />
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 dark:border-slate-800">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Search student or note")} className="h-11 flex-1 bg-transparent text-sm outline-none" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs dark:border-slate-800 dark:bg-slate-900">
          {["All", "Positive", "Neutral", "Attention"].map((option) => <option key={option}>{t(option)}</option>)}
        </select>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {visible.length ? (
          visible.map((item) => (
            <Card key={item.id} className="p-5">
              <div className="flex justify-between">
                <StatusBadge tone={sentimentTone[item.sentiment] ?? "neutral"}>{t(item.subject ?? item.categoryLabel)}</StatusBadge>
                <span className="text-xs text-slate-400">{formatDateShort(item.occurredAt, intlLocale(locale))}</span>
              </div>
              <p className="mt-4 text-sm leading-6">{item.note ?? "—"}</p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                <span className="text-slate-500">
                  {item.teacherName}{data.variant === "STAFF" ? ` · ${item.studentName} · ${t(item.className)}` : ""}
                </span>
                <button onClick={() => setAck((current) => (current.includes(item.id) ? current : [...current, item.id]))} className="font-semibold text-primary-600">
                  {ack.includes(item.id) ? `${t("Acknowledged")} ✓` : t("Acknowledge")}
                </button>
              </div>
            </Card>
          ))
        ) : (
          <p className="col-span-full py-12 text-center text-sm text-slate-500">{t("No feedback matches your search.")}</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------

const MEDAL_GRADIENT: Record<string, string> = {
  GOLD: "bg-gradient-to-br from-amber-300 to-orange-500",
  SILVER: "bg-gradient-to-br from-slate-300 to-slate-500",
  BRONZE: "bg-gradient-to-br from-emerald-300 to-teal-600",
};

const MEDAL_LABEL: Record<string, string> = {
  GOLD: "Gold",
  SILVER: "Silver",
  BRONZE: "Bronze",
};

export function AchievementsPage({ data }: { data: AchievementsData }) {
  const { t, locale } = useI18n();
  const gradient = (level: string) => MEDAL_GRADIENT[level] ?? MEDAL_GRADIENT.BRONZE;

  return (
    <div className="space-y-6">
      <PageHeader title={t("Achievements")} description={t("Celebrate progress, effort, competencies and meaningful milestones.")} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t("Achievements")} value={data.metrics.total} detail={t("Awarded this term")} icon={Trophy} />
        <MetricCard label={t("Gold")} value={data.metrics.gold} detail={t("Outstanding recognition")} tone="amber" />
        <MetricCard label={t("Silver")} value={data.metrics.silver} detail={t("Strong and consistent")} tone="sky" />
        <MetricCard label={t("Bronze")} value={data.metrics.bronze} detail={t("Early milestones")} tone="violet" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {data.items.length ? (
          data.items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className={`grid h-32 place-items-center ${gradient(item.level)}`}><Trophy className="h-12 w-12 text-white drop-shadow" /></div>
              <div className="p-5">
                <div className="flex justify-between">
                  <h2 className="font-bold">{item.title}</h2>
                  <StatusBadge tone="positive">{t(MEDAL_LABEL[item.level] ?? item.level)}</StatusBadge>
                </div>
                {item.description ? <p className="mt-2 text-sm text-slate-500">{item.description}</p> : null}
                <p className="mt-4 text-xs text-slate-400">
                  {t("Awarded")} · {formatDateShort(item.awardedAt, intlLocale(locale))}{data.variant === "STAFF" ? ` · ${item.studentName}` : ""}
                </p>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-slate-300 text-center dark:border-slate-700">
              <div>
                <Award className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 text-sm text-slate-500">{t("No achievements yet — effort and milestones will appear here.")}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Help
// ---------------------------------------------------------------------------

function HelpRequestForm() {
  const { t } = useI18n();
  const [sent, setSent] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const options = ["Understanding a lesson", "Homework planning", "Talking to a teacher", "Something with classmates", "Feeling overwhelmed", "Something else"];
  const toggle = (option: string) => setSelected((current) => (current.includes(option) ? current.filter((item) => item !== option) : [...current, option]));

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ options: selected, note }),
      });
      if (!res.ok) throw new Error("request failed");
      setSent(true);
      setSelected([]);
      setNote("");
    } catch {
      setError(t("Something went wrong. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <Card className="grid min-h-96 place-items-center p-6 text-center">
        <div>
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Check className="h-6 w-6" /></div>
          <h2 className="mt-4 text-xl font-bold">{t("Your request was sent")}</h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            {t("A trusted member of staff will review it. If you feel unsafe or need immediate help, speak directly to an adult nearby.")}
          </p>
          <Button className="mt-5" onClick={() => setSent(false)}>{t("Send another request")}</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold">{t("What would help you today?")}</h2>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label key={option} className={`flex items-center gap-2 rounded-xl border p-3 text-sm dark:border-slate-800 ${selected.includes(option) ? "border-primary-400 bg-primary-50/60 dark:bg-primary-500/5" : "border-slate-200"}`}>
            <input type="checkbox" checked={selected.includes(option)} onChange={() => toggle(option)} />
            {t(option)}
          </label>
        ))}
      </div>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} className="mt-4 min-h-32 w-full rounded-xl border border-slate-200 p-3 dark:border-slate-800 dark:bg-slate-900" placeholder={t("You can explain in your own words…")} />
      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
      <div className="mt-5 flex justify-end">
        <Button onClick={submit} disabled={submitting || (!selected.length && !note.trim())}>
          <Send className="me-2 h-4 w-4" />{submitting ? t("Sending") : t("Send request")}
        </Button>
      </div>
    </Card>
  );
}

export function HelpPage({ data }: { data: HelpData }) {
  const { t, locale } = useI18n();
  return (
    <div className="space-y-6">
      <PageHeader title={t("Ask for help")} description={t("Reaching out is a strength. Tell the right adult what would help today.")} />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {data.canRequest ? <HelpRequestForm /> : null}
        <Card className="p-5">
          <div className="flex justify-between">
            <div>
              <h2 className="font-bold">{t("Recent help requests")}</h2>
              <p className="text-xs text-slate-500">{data.thisWeek} {t("this week")}</p>
            </div>
            <div className="rounded-xl bg-primary-50 p-2.5 text-primary-600 dark:bg-primary-500/10"><LifeBuoy className="h-5 w-5" /></div>
          </div>
          <div className="mt-5">
            {data.items.length ? (
              data.items.slice(0, 10).map((item) => (
                <TimelineItem
                  key={item.id}
                  time={relativeTime(item.createdAt, intlLocale(locale))}
                  title={item.title}
                  description={[item.studentName, item.description ?? ""].filter(Boolean).join(" · ")}
                  tone={item.options.length || item.description ? "watch" : "neutral"}
                />
              ))
            ) : (
              <p className="py-10 text-center text-sm text-slate-500">{t("No help requests yet.")}</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
