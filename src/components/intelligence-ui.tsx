"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CalendarCheck, CheckCircle2, ChevronRight, Clock3, Sparkles } from "lucide-react";
import { FilterBar, InsightCard, MetricCard, PageHeader, ProgressBar, StatusBadge } from "@/components/demo-ui";
import { Card } from "@/components/ui/card";
import { LocalizedLink as Link, useI18n } from "@/i18n/provider";
import { intlLocale } from "@/i18n/config";
import { cn, formatDateShort, relativeTime } from "@/lib/utils";
import type {
  AnalyticsData,
  AnalyticsMetric,
  AnalyticsReason,
  AnalyticsSignal,
  AnalyticsStudent,
  LiveData,
  LiveEvent,
} from "@/lib/intelligence/service";

const signalTone: Record<AnalyticsSignal, "positive" | "neutral" | "watch" | "attention"> = {
  POSITIVE: "positive",
  STABLE: "neutral",
  WATCH: "watch",
  ATTENTION: "attention",
};

const signalLabel: Record<AnalyticsSignal, string> = {
  POSITIVE: "Positive evolution",
  STABLE: "Stable",
  WATCH: "Keep an eye",
  ATTENTION: "Attention suggested",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  CHECK_IN: "Check-in",
  ATTENDANCE: "Attendance",
  OBSERVATION: "Observation",
  HOMEWORK_SUBMITTED: "Homework submitted",
  HOMEWORK_ASSIGNED: "Homework assigned",
  GRADE: "Grade published",
  HELP_REQUEST: "Help requested",
  PARENT_INPUT: "Parent input",
  GOAL: "Goal updated",
  INTERVENTION: "Intervention",
  ACHIEVEMENT: "Achievement",
  MESSAGE: "Message",
  ALERT: "Alert",
};

function reasonText(reason: AnalyticsReason) {
  return `${reason.label}${reason.value ? ` · ${reason.value}` : ""}`;
}

function metricValue(metric: AnalyticsMetric) {
  return metric.value !== null ? (metric.detail === "Completion rate" || metric.label === "Attendance" || metric.label === "Engagement" ? `${metric.value}%` : `${metric.value}`) : "—";
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

function SchoolTrendChart({ data, weeks }: { data: AnalyticsData; weeks: number }) {
  const { t, locale } = useI18n();
  const points = data.trends.slice(-weeks);
  return (
    <Card className="p-5">
      <div className="flex justify-between">
        <div>
          <h2 className="font-bold">{t("School trend")}</h2>
          <p className="text-xs text-slate-500">{t("Independent dimensions")} · {t("Weekly snapshots")}</p>
        </div>
        <StatusBadge tone="positive">{t("Evidence-backed")}</StatusBadge>
      </div>
      <div className="mt-8 grid h-72 items-end gap-3" style={{ gridTemplateColumns: `repeat(${Math.max(points.length, 1)}, minmax(0, 1fr))` }}>
        {points.map((point) => (
          <div key={point.periodStart} className="flex h-full flex-col justify-end gap-1">
            <div className="flex h-48 items-end gap-1.5">
              <div className="w-1/2 rounded-t bg-sky-400" style={{ height: `${Math.max(4, point.attendance ?? 0)}%` }} title={`${t("Attendance")} ${point.attendance}%`} />
              <div className="w-1/2 rounded-t bg-primary-500" style={{ height: `${Math.max(4, point.homework ?? 0)}%` }} title={`${t("Homework")} ${point.homework}%`} />
            </div>
            <div className="mt-2 truncate text-center text-[11px] text-slate-400">{formatDateShort(point.periodStart, intlLocale(locale))}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-5 text-xs text-slate-500">
        <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded bg-sky-400" />{t("Attendance")}</span>
        <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded bg-primary-500" />{t("Homework")}</span>
      </div>
    </Card>
  );
}

function SignalDistribution({ students }: { students: AnalyticsStudent[] }) {
  const { t } = useI18n();
  const total = Math.max(students.length, 1);
  const count = (signal: AnalyticsSignal) => students.filter((s) => s.signal === signal).length;
  const share = (signal: AnalyticsSignal) => Math.round((count(signal) / total) * 100);
  return (
    <Card className="p-5">
      <h2 className="font-bold">{t("Signal distribution")}</h2>
      <p className="text-xs text-slate-500">{t("Students are never reduced to one risk score")}</p>
      <div className="mt-5 space-y-5">
        <ProgressBar label={t("Positive evolution")} value={share("POSITIVE")} />
        <ProgressBar label={t("Stable")} value={share("STABLE")} tone="sky" />
        <ProgressBar label={t("Watch")} value={share("WATCH")} tone="amber" />
        <ProgressBar label={t("Action suggested")} value={share("ATTENTION")} tone="rose" />
      </div>
      <div className="mt-4 text-xs text-slate-400">{total} {t("students")} {t("in view")}</div>
    </Card>
  );
}

export function AnalyticsPage({ data }: { data: AnalyticsData }) {
  const { t } = useI18n();
  const [weeks, setWeeks] = useState(6);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("Whole school");
  const gradeLevels = [...new Set(data.students.map((s) => s.gradeLevel).filter((g) => g !== "—"))];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.students.filter((s) => {
      const matchesQuery = !q || `${s.name} ${s.className} ${s.gradeLevel}`.toLowerCase().includes(q);
      const matchesScope = scope === "Whole school" || s.gradeLevel === scope;
      return matchesQuery && matchesScope;
    });
  }, [data.students, query, scope]);

  const attention = filtered.filter((s) => s.signal === "ATTENTION" || s.signal === "WATCH").slice(0, 5);
  const positives = filtered.filter((s) => s.signal === "POSITIVE").slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Analytics")}
        description={t("Understand trends and weak signals through transparent, evidence-backed explanations.")}
        actions={
          <select value={weeks} onChange={(e) => setWeeks(Number(e.target.value))} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950">
            {[8, 6, 4].map((w) => <option key={w} value={w}>{t("Last")} {w} {t("weeks")}</option>)}
          </select>
        }
      />
      <FilterBar placeholder={t("Search a student, class or signal")} filters={["Whole school", ...gradeLevels]} query={query} onQueryChange={setQuery} active={scope} onActiveChange={setScope} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metricValue(metric)} detail={metric.detail} trend={metric.trend ?? undefined} icon={metric.label === "Attention suggested" ? AlertTriangle : metric.label === "Attendance" ? CalendarCheck : metric.label === "Engagement" ? Sparkles : CheckCircle2} tone={metric.tone} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <SchoolTrendChart data={data} weeks={weeks} />
        <div className="space-y-5">
          <SignalDistribution students={filtered} />
          <InsightCard title={t("Why these students?")} reasons={data.insightReasons.map((r) => `${t(r.label)}${r.value ? ` · ${r.value}` : ""}`)} />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex justify-between">
            <div>
              <h2 className="font-bold">{t("Explainable attention signals")}</h2>
              <p className="text-xs text-slate-500">{t("Open a student to see evidence and possible actions")}</p>
            </div>
            <StatusBadge tone="watch">{attention.length} {t("shown")}</StatusBadge>
          </div>
          <div className="space-y-2">
            {attention.map((student) => (
              <Link key={student.id} href={`/students/${student.id}`} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-rose-400 to-indigo-600 text-xs font-bold text-white">{student.initials}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{student.name}</div>
                  <div className="truncate text-xs text-slate-500">{student.reasons.length ? student.reasons.map((r) => `${t(r.label)} ${r.value}`).join(" · ") : t(student.className)}</div>
                </div>
                <StatusBadge tone={signalTone[student.signal]}>{t(signalLabel[student.signal])}</StatusBadge>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
            ))}
            {!attention.length ? <p className="py-8 text-center text-sm text-slate-500">{t("No attention signals in view.")}</p> : null}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold">{t("Positive progress")}</h2>
          <p className="text-xs text-slate-500">{t("Improvement receives equal visibility")}</p>
          <div className="mt-4 space-y-3">
            {positives.map((student) => (
              <Link key={student.id} href={`/students/${student.id}`} className="flex items-center gap-3 rounded-xl bg-emerald-50/70 p-3 dark:bg-emerald-500/5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-xs font-bold text-white">{student.initials}</div>
                <div className="flex-1">
                  <div className="font-semibold">{student.name}</div>
                  <div className="text-xs text-slate-500">{t(student.className)}</div>
                </div>
                <StatusBadge tone="positive">{student.points !== null ? `${student.points > 0 ? "+" : ""}${student.points} ${t("pts")}` : t("Improving")}</StatusBadge>
              </Link>
            ))}
            {!positives.length ? <p className="py-8 text-center text-sm text-slate-500">{t("No positive signals in view.")}</p> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Live
// ---------------------------------------------------------------------------

function EventRow({ event }: { event: LiveEvent }) {
  const { t, locale } = useI18n();
  const tone = event.sentiment === "ATTENTION" ? "attention" : event.sentiment === "POSITIVE" ? "positive" : "info";
  return (
    <div className="relative flex gap-4 pb-5 last:pb-0">
      <div className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-4", tone === "positive" ? "bg-emerald-500 ring-emerald-100 dark:ring-emerald-500/10" : tone === "attention" ? "bg-rose-500 ring-rose-100 dark:ring-rose-500/10" : "bg-sky-500 ring-sky-100 dark:ring-sky-500/10")} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold">{event.studentId ? <Link href={`/students/${event.studentId}`} className="hover:text-primary-600 hover:underline">{event.studentName}</Link> : event.studentName} <span className="font-normal text-slate-400">· {t(event.className)}</span></h4>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs text-slate-400"><Clock3 className="h-3 w-3" />{relativeTime(event.occurredAt, intlLocale(locale))}</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <StatusBadge tone={tone}>{t(EVENT_TYPE_LABELS[event.type] ?? event.type)}</StatusBadge>
          <p className="text-xs text-slate-500">{event.title}</p>
        </div>
        {event.description ? <p className="mt-1 text-xs text-slate-500">{event.description}</p> : null}
      </div>
    </div>
  );
}

export function LivePage({ data }: { data: LiveData }) {
  const { t, locale } = useI18n();
  const [eventType, setEventType] = useState("All events");
  const [classId, setClassId] = useState<string>(data.pulses[0]?.id ?? "all");
  const selectedClass = data.pulses.find((c) => c.id === classId);

  const events = useMemo(() => {
    const cls = data.pulses.find((c) => c.id === classId);
    return data.events.filter((e) => (eventType === "All events" || e.type === eventType) && (!cls || e.className === cls.name));
  }, [data.events, data.pulses, eventType, classId]);

  const mapStudents = data.map.filter((s) => !selectedClass || s.className === selectedClass.name);

  const aggregate = selectedClass
    ? selectedClass
    : {
        id: "all",
        name: "All classes",
        gradeLevel: "",
        students: data.map.length,
        attendance: data.pulses.length ? Math.round(data.pulses.reduce((a, c) => a + (c.attendance ?? 0), 0) / data.pulses.length) : null,
        homework: data.pulses.length ? Math.round(data.pulses.reduce((a, c) => a + (c.homework ?? 0), 0) / data.pulses.length) : null,
        engagement: data.pulses.length ? Math.round(data.pulses.reduce((a, c) => a + (c.engagement ?? 0), 0) / data.pulses.length) : null,
        checkInRate: data.pulses.length ? Math.round(data.pulses.reduce((a, c) => a + (c.checkInRate ?? 0), 0) / data.pulses.length) : null,
      };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("School live")}
        description={t("A privacy-conscious pulse of attendance, check-ins and learning events.")}
        actions={
          <>
            <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950">
              <option>{t("All events")}</option>
              {data.types.map((type) => <option key={type} value={type}>{t(EVENT_TYPE_LABELS[type] ?? type)}</option>)}
            </select>
            <select value={classId} onChange={(e) => setClassId(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950">
              <option value="all">{t("All classes")}</option>
              {data.classes.map((schoolClass) => <option key={schoolClass.id} value={schoolClass.id}>{t(schoolClass.label)}</option>)}
            </select>
          </>
        }
      />
      <Card className="overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <StatusBadge tone="positive">{t("Last 7 days")}</StatusBadge>
            <h2 className="mt-4 text-3xl font-bold">{data.schoolName ?? t("Student success intelligence")} — {t("Live")}</h2>
            <p className="mt-1 text-sm text-slate-300">{data.metrics.activeClasses} {t("classes")} · {data.metrics.eventsWeek} {t("visible events")}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                [t("Events last 7 days"), String(data.metrics.eventsWeek)],
                [t("Check-ins this week"), String(data.metrics.checkInsWeek)],
                [t("Help requests"), String(data.metrics.helpWeek)],
                [t("Active classes"), String(data.metrics.activeClasses)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-white/10 p-4">
                  <div className="text-2xl font-bold">{value}</div>
                  <div className="text-xs text-slate-300">{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-white/5 p-5">
            <h3 className="font-bold">{t("Class pulse")} · {t(aggregate.gradeLevel ? `${aggregate.gradeLevel} ${aggregate.name}` : "All classes")}</h3>
            <div className="mt-4 space-y-4">
              <ProgressBar label={t("Attendance")} value={aggregate.attendance ?? 0} tone="sky" />
              <ProgressBar label={t("Homework completion")} value={aggregate.homework ?? 0} />
              <ProgressBar label={t("Average engagement")} value={aggregate.engagement ?? 0} tone="amber" />
              <ProgressBar label={t("Student check-ins")} value={aggregate.checkInRate ?? 0} />
            </div>
            <p className="mt-4 text-xs text-slate-400">{aggregate.students} {t("students")} {t("in view")}</p>
          </div>
        </div>
      </Card>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card className="p-5">
          <div className="flex justify-between">
            <div>
              <h2 className="font-bold">{t("Event stream")}</h2>
              <p className="text-xs text-slate-500">{events.length} {t("visible events")} · {t("since")} {formatDateShort(data.since, intlLocale(locale))}</p>
            </div>
            <StatusBadge tone="info">{t("Last 7 days")}</StatusBadge>
          </div>
          <div className="mt-5">
            {events.length ? events.map((event) => <EventRow key={event.id} event={event} />) : <p className="py-12 text-center text-sm text-slate-500">{t("No events match this filter.")}</p>}
          </div>
        </Card>
        <div className="space-y-5">
          <InsightCard positive title={t("Positive pulse")} reasons={[`${data.events.filter((e) => e.sentiment === "POSITIVE").length} ${t("events with positive sentiment")}`, `${data.metrics.helpWeek} ${t("help requests this week")}`]} />
          <InsightCard title={t("Support requests")} reasons={[t("Requests are visible only to authorised staff"), t("Open a student to see the evidence")]} />
          <Card className="p-5">
            <h2 className="font-bold">{t("Class activity map")}</h2>
            <div className="mt-4 grid grid-cols-6 gap-2">
              {mapStudents.map((student) => (
                <Link key={student.id} href={`/students/${student.id}`} title={student.name} className={cn("aspect-square rounded-lg", student.signal === "ATTENTION" ? "bg-rose-400" : student.signal === "WATCH" ? "bg-amber-400" : student.signal === "POSITIVE" ? "bg-emerald-400" : "bg-sky-300")} />
              ))}
            </div>
            {!mapStudents.length ? <p className="py-6 text-center text-sm text-slate-500">{t("No students in view.")}</p> : null}
            <p className="mt-3 text-xs text-slate-500">{t("Colours indicate recent context, not a public student ranking.")}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
