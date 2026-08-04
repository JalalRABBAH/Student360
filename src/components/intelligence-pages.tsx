"use client";

import { LocalizedLink as Link } from "@/i18n/provider";
import { useMemo, useState } from "react";
import { AlertTriangle, BarChart3, Bot, CalendarCheck, CheckCircle2, ChevronRight, Clock3, Send, Sparkles, Users } from "lucide-react";
import { FilterBar, InsightCard, MetricCard, MiniBars, PageHeader, ProgressBar, StatusBadge, StudentAvatar, TimelineItem } from "@/components/demo-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { demoClasses, demoEvents, demoStudents, weeklyTrend } from "@/lib/demo-data";
import { useI18n } from "@/i18n/provider";

export function LivePageDemo() {
  const { t } = useI18n();
  const [eventType, setEventType] = useState("All events");
  const [classId, setClassId] = useState("grade-8b");
  const selectedClass = demoClasses.find((schoolClass) => schoolClass.id === classId) ?? demoClasses[3];
  const classStudents = demoStudents.filter((student) => student.classId === selectedClass.id);
  const events = eventType === "All events" ? demoEvents : demoEvents.filter((event) => event.type === eventType);
  return (
    <div className="space-y-6">
      <PageHeader title={t("School live")} description={t("A privacy-conscious pulse of attendance, check-ins and learning events happening today.")} actions={<><select value={eventType} onChange={(event) => setEventType(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"><option>{t("All events")}</option><option>CHECK_IN</option><option>ATTENDANCE</option><option>OBSERVATION</option><option>HOMEWORK</option><option>HELP</option></select><select value={classId} onChange={(event) => setClassId(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950">{demoClasses.map((schoolClass) => <option key={schoolClass.id} value={schoolClass.id}>{t(schoolClass.name)}</option>)}</select></>} />
      <Card className="overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_1.2fr]">
    <div><StatusBadge tone="positive">{t("Live now")}</StatusBadge><h2 className="mt-4 text-3xl font-bold">{t(selectedClass.name)} — {t("Today")}</h2><p className="mt-1 text-sm text-slate-300">{selectedClass.students} {t("students")} · {Math.round(selectedClass.students * selectedClass.attendance / 100)} {t("present")}</p><div className="mt-6 grid grid-cols-2 gap-3">{[["Homework", `${selectedClass.homework}%`], ["Engagement", `${selectedClass.engagement}%`], ["Check-ins", `${Math.round(selectedClass.students * 0.81)} / ${selectedClass.students}`], ["Positive events", `${classStudents.filter((student) => student.status === "POSITIVE").length}`]].map(([label, value]) => <div key={label} className="rounded-xl bg-white/10 p-4"><div className="text-2xl font-bold">{value}</div><div className="text-xs text-slate-300">{t(label)}</div></div>)}</div></div>
    <div className="rounded-2xl bg-white/5 p-5"><h3 className="font-bold">{t("Class pulse")}</h3><div className="mt-4 space-y-4"><ProgressBar label={t("Attendance")} value={selectedClass.attendance} tone="sky" /><ProgressBar label={t("Homework completion")} value={selectedClass.homework} /><ProgressBar label={t("Average engagement")} value={selectedClass.engagement} tone="amber" /><ProgressBar label={t("Student check-ins")} value={81} /></div></div>
        </div>
      </Card>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card className="p-5"><div className="flex justify-between"><div><h2 className="font-bold">{t("Event stream")}</h2><p className="text-xs text-slate-500">{events.length} {t("visible events")} · {t("filters update instantly")}</p></div><StatusBadge tone="info">{t("Auto-refresh simulated")}</StatusBadge></div><div className="mt-5">{events.length ? [...events, ...events.slice(0, 3)].map((event, index) => <TimelineItem key={`${event.time}-${index}`} {...event} time={index > events.length - 1 ? `${t("Yesterday")} · ${event.time}` : event.time} />) : <p className="py-12 text-center text-sm text-slate-500">{t("No events match this filter.")}</p>}</div></Card>
<div className="space-y-5"><InsightCard positive title={t("Positive pulse")} reasons={[`${classStudents.filter((student) => student.status === "POSITIVE").length} ${t("students show positive momentum")}`, `${t("Homework completion is")} ${selectedClass.homework}%`]} /><InsightCard title={t("Support requests")} reasons={[t("One student requested help with algebra"), t("The request is visible only to authorised staff")]} /><Card className="p-5"><h2 className="font-bold">{t("Class activity map")}</h2><div className="mt-4 grid grid-cols-6 gap-2">{classStudents.map((student) => <Link href={`/students/${student.id}`} key={student.id} title={student.name} className={`aspect-square rounded-lg ${student.status === "ATTENTION" ? "bg-rose-400" : student.status === "WATCH" ? "bg-amber-400" : student.status === "POSITIVE" ? "bg-emerald-400" : "bg-sky-300"}`} />)}</div><p className="mt-3 text-xs text-slate-500">{t("Colours indicate recent context, not a public student ranking.")}</p></Card></div>
      </div>
    </div>
  );
}

export function AnalyticsPageDemo() {
  const { t } = useI18n();
  const [period, setPeriod] = useState("Last 6 weeks");
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("Whole school");
  const filteredStudents = useMemo(() => demoStudents.filter((student) => {
    const matchesQuery = `${student.name} ${student.className} ${student.headline}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesScope = scope === "Whole school" || (scope.startsWith("Grade ") && student.className.startsWith(scope));
    return matchesQuery && matchesScope;
  }), [query, scope]);
  const concerns = filteredStudents.filter((student) => student.status === "ATTENTION" || student.status === "WATCH").slice(0, 5);
  const positives = filteredStudents.filter((student) => student.status === "POSITIVE").slice(0, 5);
  const statusLabel: Record<string, string> = { POSITIVE: "Positive", STABLE: "Stable", WATCH: "Watch", ATTENTION: "Attention" };
  return (
    <div className="space-y-6">
      <PageHeader title={t("Analytics")} description={t("Understand trends and weak signals through transparent, evidence-backed explanations.")} actions={<select value={period} onChange={(event) => setPeriod(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"><option>{t("Last 6 weeks")}</option><option>{t("Last 30 days")}</option><option>{t("Current term")}</option></select>} />
      <FilterBar placeholder={t("Search a student, class or signal")} filters={["Whole school", "Grade 7", "Grade 8", "Grade 9"]} query={query} onQueryChange={setQuery} active={scope} onActiveChange={setScope} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label={t("Attendance")} value="94.2%" detail={t(period)} trend={0.8} icon={CalendarCheck} /><MetricCard label={t("Homework")} value="86%" detail={t("Completion rate")} trend={6} tone="sky" /><MetricCard label={t("Engagement")} value="78%" detail={t("Observation-based")} trend={4} tone="amber" /><MetricCard label={t("Attention suggested")} value={4} detail={t("Combined explainable signals")} icon={AlertTriangle} tone="violet" /></div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="p-5"><div className="flex justify-between"><div><h2 className="font-bold">{t("School trend")}</h2><p className="text-xs text-slate-500">{t("Independent dimensions")} · {t(period)}</p></div><StatusBadge tone="positive">{t("Improving")}</StatusBadge></div><div className="mt-8 grid h-72 grid-cols-6 items-end gap-4">{weeklyTrend.map((point) => <div key={point.week} className="flex h-full flex-col justify-end gap-1"><div className="rounded-t bg-sky-400" style={{ height: `${point.attendance}%` }} title={`${t("Attendance")} ${point.attendance}%`} /><div className="rounded-t bg-primary-500" style={{ height: `${point.homework}%` }} title={`${t("Homework")} ${point.homework}%`} /><div className="mt-2 text-center text-xs text-slate-400">{point.week}</div></div>)}</div><div className="mt-4 flex gap-5 text-xs text-slate-500"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded bg-sky-400" />{t("Attendance")}</span><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded bg-primary-500" />{t("Homework")}</span></div></Card>
        <Card className="p-5"><h2 className="font-bold">{t("Signal distribution")}</h2><p className="text-xs text-slate-500">{t("Students are never reduced to one risk score")}</p><div className="mt-5 space-y-5"><ProgressBar label={t("Positive evolution")} value={23} /><ProgressBar label={t("Stable")} value={61} tone="sky" /><ProgressBar label={t("Watch")} value={12} tone="amber" /><ProgressBar label={t("Action suggested")} value={4} tone="rose" /></div><div className="mt-6"><InsightCard title={t("Why four students?")} reasons={[t("3 missing assignments during the last 10 days"), t("Motivation decreased in recent check-ins"), t("Two teachers reported reduced participation")]} /></div></Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5"><div className="mb-4 flex justify-between"><div><h2 className="font-bold">{t("Explainable attention signals")}</h2><p className="text-xs text-slate-500">{t("Open a student to see evidence and possible actions")}</p></div><StatusBadge tone="watch">{concerns.length} {t("shown")}</StatusBadge></div><div className="space-y-2">{concerns.map((student) => <Link key={student.id} href={`/students/${student.id}`} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800"><StudentAvatar student={student} /><div className="min-w-0 flex-1"><div className="font-semibold">{student.name}</div><div className="truncate text-xs text-slate-500">{t(student.headline)}</div></div><StatusBadge tone={student.status === "ATTENTION" ? "attention" : "watch"}>{t(statusLabel[student.status])}</StatusBadge><ChevronRight className="h-4 w-4 text-slate-400" /></Link>)}</div></Card>
<Card className="p-5"><h2 className="font-bold">{t("Positive progress")}</h2><p className="text-xs text-slate-500">{t("Improvement receives equal visibility")}</p><div className="mt-4 space-y-3">{positives.map((student) => <Link key={student.id} href={`/students/${student.id}`} className="flex items-center gap-3 rounded-xl bg-emerald-50/70 p-3 dark:bg-emerald-500/5"><StudentAvatar student={student} /><div className="flex-1"><div className="font-semibold">{student.name}</div><div className="text-xs text-slate-500">{t(student.headline)}</div></div><StatusBadge tone="positive">+{5 + student.academic % 4} {t("pts")}</StatusBadge></Link>)}</div></Card>
      </div>
    </div>
  );
}

const promptAnswers: Record<string, string> = {
  "Summarize Grade 8B this week": "Grade 8B maintained stable attendance at 92%. Homework completion improved by 8 points and classroom engagement improved by 4 points. Six students show positive momentum. Four students may benefit from a short check-in; the strongest combined evidence is missing homework plus lower self-reported motivation.",
  "Who should I check in with today?": "Consider checking in with Maya Bennani first because she directly requested help with algebra. Lina Alaoui has a recent attendance change, and Youssef Amrani has repeated incomplete homework. These are suggestions for human review, not automatic classifications.",
  "Show students who improved": "Sara El Idrissi, Adam Benali, Nour El Fassi and Aya Berrada improved across at least two dimensions this month. The strongest improvements are homework consistency, engagement and attendance.",
};

const fallbackAnswer = "Based on the visible demo data, attendance is stable while homework and engagement are improving. I found no basis for a diagnosis or automatic decision. Open the analytics evidence panel to review the underlying observations and check-ins.";

export function CopilotPageDemo() {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([{ role: "assistant", text: "Hello Nadia. I can summarise visible school data, prepare a weekly review, or explain why a student appears in an attention group. I will always show the evidence behind suggestions." }]);
  const [input, setInput] = useState("");
  const ask = (prompt: string) => {
    if (!prompt.trim()) return;
    const answer = promptAnswers[prompt] ?? fallbackAnswer;
    setMessages((current) => [...current, { role: "user", text: prompt }, { role: "assistant", text: answer }]);
    setInput("");
  };
  return (
    <div className="space-y-6">
      <PageHeader title={t("Copilot")} description={t("Authorised summaries and suggestions grounded in visible data. Teacher judgement remains essential.")} />
      <div className="grid gap-6 xl:grid-cols-[1fr_2fr]">
        <div className="space-y-4"><Card className="p-5"><div className="flex items-center gap-3"><div className="rounded-xl bg-violet-50 p-3 text-violet-600 dark:bg-violet-500/10"><Bot className="h-5 w-5" /></div><div><h2 className="font-bold">{t("Suggested prompts")}</h2><p className="text-xs text-slate-500">{t("Try a grounded demo question")}</p></div></div><div className="mt-4 space-y-2">{Object.keys(promptAnswers).map((prompt) => <button key={prompt} onClick={() => ask(prompt)} className="w-full rounded-xl border border-slate-100 p-3 text-left text-sm font-medium transition hover:border-primary-300 hover:bg-primary-50/50 dark:border-slate-800 dark:hover:bg-primary-500/5">{t(prompt)}</button>)}</div></Card><InsightCard positive title={t("Copilot guardrails")} reasons={[t("No medical or psychological diagnosis"), t("No automatic punishment or irreversible decision"), t("Every recommendation must be linked to visible evidence")]} /></div>
        <Card className="flex min-h-[620px] flex-col overflow-hidden"><div className="border-b border-slate-100 p-4 dark:border-slate-800"><div className="font-bold">{t("New conversation")}</div><div className="text-xs text-slate-500">{t("Context: Greenwood International School · authorised principal view")}</div></div><div className="flex-1 space-y-4 overflow-y-auto p-5">{messages.map((message, index) => <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-6 ${message.role === "user" ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>{t(message.text)}{message.role === "assistant" && index > 0 ? <div className="mt-3 flex flex-wrap gap-2"><StatusBadge tone="info">{t("Attendance records")}</StatusBadge><StatusBadge tone="info">{t("Homework submissions")}</StatusBadge><StatusBadge tone="info">{t("Teacher observations")}</StatusBadge></div> : null}</div></div>)}</div><form onSubmit={(event) => { event.preventDefault(); ask(input); }} className="flex gap-2 border-t border-slate-100 p-4 dark:border-slate-800"><input value={input} onChange={(event) => setInput(event.target.value)} className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-900" placeholder={t("Ask about a class, student trend or weekly review…")} /><Button type="submit" size="icon"><Send className="h-4 w-4" /></Button></form></Card>
      </div>
    </div>
  );
}
