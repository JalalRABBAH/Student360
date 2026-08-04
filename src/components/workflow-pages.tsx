"use client";

import { LocalizedLink as Link } from "@/i18n/provider";
import { useMemo, useState } from "react";
import {
  BarChart3, BookOpen, CalendarCheck, CalendarDays, Check, CheckCircle2, ChevronRight, Clock3,
  MessageSquare, Plus, Sparkles, Users,
} from "lucide-react";
import {
  ActionButton, FilterBar, InsightCard, MetricCard, PageHeader, ProgressBar, StatusBadge,
  StudentAvatar, TimelineItem,
} from "@/components/demo-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { demoEvents, demoHomework, grade8BStudents } from "@/lib/demo-data";
import { useI18n } from "@/i18n/provider";
const demoStudents = grade8BStudents;
import { cn } from "@/lib/utils";

export function TodayPageDemo() {
  const { t, href } = useI18n();
  const [quick, setQuick] = useState({ student: demoStudents[0].name, kind: "Positive observation", note: "" });
  const schedule = [
    ["08:00", "Grade 8B", "Mathematics", "Room B10", "Completed"],
    ["09:15", "Grade 7A", "Mathematics", "Room A12", "In progress"],
    ["10:30", "Planning", "Homework review", "Staff room", "Next"],
    ["11:30", "Grade 8A", "Mathematics", "Room B08", "Upcoming"],
    ["14:00", "Grade 9B", "Mathematics", "Room C05", "Upcoming"],
  ];
  return (
    <div className="space-y-6">
      <PageHeader title={t("Today")} description={t("Monday, 27 July · Your schedule, class pulse and priority actions.")} actions={<ActionButton label={t("Add quick input")} title={t("Add quick input")} onConfirm={() => setQuick({ student: demoStudents[0].name, kind: "Positive observation", note: "" })}><QuickForm value={quick} onChange={setQuick} /></ActionButton>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t("Classes today")} value={4} detail={t("76 students")} icon={CalendarDays} />
        <MetricCard label={t("Attendance entered")} value="3 / 4" detail={t("Grade 9B pending")} icon={CalendarCheck} tone="sky" />
        <MetricCard label={t("Homework to review")} value={8} detail={t("Across 3 assignments")} icon={BookOpen} tone="amber" />
        <MetricCard label={t("Students to check in")} value={4} detail={t("Reasons available")} icon={MessageSquare} tone="violet" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between"><div><h2 className="font-bold">{t("Schedule")}</h2><p className="text-xs text-slate-500">{t("Tap a class to open its squad view")}</p></div><StatusBadge tone="info">{t("Current: Grade 7A")}</StatusBadge></div>
          <div className="mt-5 space-y-2">{schedule.map((item, index) => <Link href={index < 4 ? `/classes/${index === 0 ? "grade-8b" : index === 1 ? "grade-7a" : "grade-8a"}` : "/classes/grade-9b"} key={item[0]} className={cn("flex items-center gap-4 rounded-xl border p-3 dark:border-slate-800", index === 1 ? "border-primary-300 bg-primary-50/50 dark:bg-primary-500/5" : "border-slate-100")}><div className="w-12 text-sm font-bold">{item[0]}</div><div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800"><CalendarDays className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="font-semibold">{t(item[1])} · {t(item[2])}</div><div className="text-xs text-slate-500">{t(item[3])}</div></div><StatusBadge tone={item[4] === "Completed" ? "positive" : item[4] === "In progress" ? "info" : "neutral"}>{t(item[4])}</StatusBadge><ChevronRight className="h-4 w-4 text-slate-400" /></Link>)}</div>
        </Card>
        <Card className="p-5"><div className="flex justify-between"><div><h2 className="font-bold">{t("Live pulse")}</h2><p className="text-xs text-slate-500">{t("Latest events from your classes")}</p></div><Link href="/live" className="text-xs font-semibold text-primary-600">{t("View all")}</Link></div><div className="mt-5">{demoEvents.slice(0, 6).map((event) => <TimelineItem key={event.time} {...event} />)}</div></Card>
      </div>
      <Card className="p-5"><h2 className="font-bold">{t("Priority actions")}</h2><div className="mt-4 grid gap-3 md:grid-cols-3">{[["Respond to Maya's help request", "/messages"], ["Review 8 homework submissions", "/homework"], ["Complete Grade 9B attendance", "/attendance"]].map(([action, path], index) => <div key={action} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900"><div className="flex justify-between"><Clock3 className="h-4 w-4 text-primary-500" /><StatusBadge tone={index === 0 ? "attention" : "neutral"}>{t(index === 0 ? "Priority" : "Today")}</StatusBadge></div><div className="mt-3 text-sm font-semibold">{t(action)}</div><Button size="sm" variant="outline" className="mt-3 w-full" asChild><Link href={href(path)}>{t("Open action")}</Link></Button></div>)}</div></Card>
    </div>
  );
}

export function HomeworkPageDemo() {
  const { t } = useI18n();
  const [items, setItems] = useState<Array<{ id: string; subject: string; title: string; className: string; due: string; completion: number; submitted: number; total: number; status: string }>>([...demoHomework]);
  const [reviewed, setReviewed] = useState<string[]>([]);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState({ title: "", className: "Grade 8B", subject: "Mathematics", due: "" });
  const visibleItems = items.filter((item) => {
    const matchesFilter = filter === "All" || (filter === "Due today" ? item.status === "DUE_TODAY" : filter === "Open" ? item.status === "OPEN" : filter === "Closed" ? item.status === "CLOSED" : item.status === "NEEDS_REVIEW");
    const matchesQuery = `${item.title} ${item.subject} ${item.className}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesFilter && matchesQuery;
  });
  const createAssignment = () => {
    if (!draft.title.trim()) return;
    setItems((current) => [...current, { id: `hw-${current.length + 1}`, subject: draft.subject, title: draft.title, className: draft.className, due: draft.due || "—", completion: 0, submitted: 0, total: 26, status: "OPEN" }]);
    setDraft({ title: "", className: "Grade 8B", subject: "Mathematics", due: "" });
  };
  return (
    <div className="space-y-6">
      <PageHeader title={t("Homework")} description={t("Assignments, submission progress, feedback and completion patterns.")} actions={<ActionButton label={t("Create assignment")} title={t("Create homework assignment")} confirmLabel={t("Create assignment")} onConfirm={createAssignment}><div className="space-y-3"><FormInput label="Title" value={draft.title} onChange={(value) => setDraft({ ...draft, title: value })} /><FormInput label="Class" value={draft.className} onChange={(value) => setDraft({ ...draft, className: value })} /><FormInput label="Subject" value={draft.subject} onChange={(value) => setDraft({ ...draft, subject: value })} /><FormInput label="Due date" value={draft.due} onChange={(value) => setDraft({ ...draft, due: value })} /></div></ActionButton>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label={t("Open assignments")} value={4} detail={t("Across 4 classes")} icon={BookOpen} /><MetricCard label={t("Due today")} value={1} detail={t("21 / 26 submitted")} icon={Clock3} tone="amber" /><MetricCard label={t("Completion")} value="86%" detail={t("Last 30 days")} trend={6} tone="sky" /><MetricCard label={t("Need feedback")} value={8 - reviewed.length} detail={t("Teacher review queue")} icon={MessageSquare} tone="violet" /></div>
      <FilterBar placeholder={t("Search assignments")} filters={["All", "Due today", "Open", "Closed", "Needs review"]} query={query} onQueryChange={setQuery} active={filter} onActiveChange={setFilter} />
      <div className="grid gap-4 lg:grid-cols-2">{visibleItems.map((item) => <Card key={item.id} className="p-5"><div className="flex items-start justify-between"><div className="rounded-xl bg-primary-50 p-2.5 text-primary-600 dark:bg-primary-500/10"><BookOpen className="h-5 w-5" /></div><StatusBadge tone={item.status === "DUE_TODAY" ? "watch" : item.status === "CLOSED" ? "neutral" : "info"}>{t(item.status.replaceAll("_", " "))}</StatusBadge></div><h2 className="mt-4 font-bold">{item.title}</h2><p className="text-sm text-slate-500">{t(item.subject)} · {t(item.className)} · {item.due}</p><div className="mt-5"><ProgressBar label={`${item.submitted} ${t("of")} ${item.total} ${t("submitted")}`} value={item.completion} /></div><div className="mt-4 flex gap-2"><Button className="flex-1" variant={reviewed.includes(item.id) ? "secondary" : "default"} onClick={() => setReviewed((current) => current.includes(item.id) ? current : [...current, item.id])}>{reviewed.includes(item.id) ? <Check className="mr-2 h-4 w-4" /> : null}{reviewed.includes(item.id) ? t("Reviewed") : t("Review submissions")}</Button><Button variant="outline" onClick={() => setItems((current) => current.map((row) => row.id === item.id ? { ...row, status: "CLOSED" } : row))}>{t("Close")}</Button></div></Card>)}</div>
    </div>
  );
}

export function AttendancePageDemo() {
  const { t } = useI18n();
  const [statuses, setStatuses] = useState<Record<string, string>>(() => Object.fromEntries(demoStudents.map((student, index) => [student.id, index === 5 ? "ABSENT" : index === 9 ? "LATE" : "PRESENT"])));
  const [saved, setSaved] = useState(false);
  const [classFilter, setClassFilter] = useState("Grade 8B");
  const counts = useMemo(() => Object.values(statuses).reduce((acc, status) => ({ ...acc, [status]: (acc[status] ?? 0) + 1 }), {} as Record<string, number>), [statuses]);
  const visibleStudents = demoStudents.filter((student) => student.className === classFilter);
  const statusLabel: Record<string, string> = { PRESENT: "Present", ABSENT: "Absent", LATE: "Late", EXCUSED: "Excused" };
  return (
    <div className="space-y-6">
      <PageHeader title={t("Attendance")} description={t("Grade 8B · Daily register and attendance patterns.")} actions={<><Button variant="outline" onClick={() => { setStatuses(Object.fromEntries(demoStudents.map((student) => [student.id, "PRESENT"]))); setSaved(false); }}><CheckCircle2 className="mr-2 h-4 w-4" />{t("Mark all present")}</Button><Button onClick={() => setSaved(true)}>{saved ? <Check className="mr-2 h-4 w-4" /> : null}{saved ? t("Saved locally") : t("Save register")}</Button></>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label={t("Present")} value={counts.PRESENT ?? 0} detail={t("Today")} icon={CheckCircle2} /><MetricCard label={t("Absent")} value={counts.ABSENT ?? 0} detail={t("Family notification available")} tone="amber" /><MetricCard label={t("Late")} value={counts.LATE ?? 0} detail={t("Average 8 minutes")} icon={Clock3} tone="sky" /><MetricCard label={t("30-day attendance")} value="92%" detail={t("Grade 8B average")} trend={-1.5} tone="violet" /></div>
      <FilterBar placeholder={t("Search student")} filters={["Grade 8B", "Grade 7A", "Grade 8A", "Grade 9A"]} active={classFilter} onActiveChange={setClassFilter} />
      <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-[11px] uppercase text-slate-500 dark:bg-slate-900"><tr><th className="px-4 py-3">{t("Student")}</th><th className="px-4 py-3">{t("Status")}</th><th className="px-4 py-3">{t("30 days")}</th><th className="px-4 py-3">{t("Pattern")}</th></tr></thead><tbody>{visibleStudents.map((student) => <tr key={student.id} className="border-t border-slate-100 dark:border-slate-800"><td className="px-4 py-3"><div className="flex items-center gap-3"><StudentAvatar student={student} /><div><div className="font-semibold">{student.name}</div><div className="text-xs text-slate-500">{t(student.className)}</div></div></div></td><td className="px-4 py-3"><div className="flex gap-1">{["PRESENT", "ABSENT", "LATE", "EXCUSED"].map((status) => <button key={status} onClick={() => setStatuses((current) => ({ ...current, [student.id]: status }))} className={cn("rounded-lg px-2 py-1.5 text-[10px] font-semibold", statuses[student.id] === status ? status === "PRESENT" ? "bg-emerald-600 text-white" : status === "ABSENT" ? "bg-rose-600 text-white" : "bg-amber-500 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800")}>{t(statusLabel[status])}</button>)}</div></td><td className="px-4 py-3 font-semibold">{student.attendance}%</td><td className="px-4 py-3"><StatusBadge tone={student.attendance < 88 ? "watch" : "positive"}>{student.attendance < 88 ? t("Monitor") : t("Steady")}</StatusBadge></td></tr>)}</tbody></table>{visibleStudents.length === 0 ? <p className="py-12 text-center text-sm text-slate-500">{t("No students in this class.")}</p> : null}</div></Card>
    </div>
  );
}

export function ObservationsPageDemo() {
  const { t } = useI18n();
  const [observations, setObservations] = useState<Array<[string, string, string, string, string]>>([
    ["Sara El Idrissi", "PARTICIPATION", "POSITIVE", "Very good contribution during mathematics.", "09:25"],
    ["Maya Bennani", "SUPPORT NEEDED", "ATTENTION", "Requested help understanding algebra.", "11:04"],
    ["Adam Benali", "EFFORT", "POSITIVE", "Stayed focused throughout independent practice.", "Yesterday"],
    ["Omar Chraibi", "COLLABORATION", "POSITIVE", "Helped peers organise the group task.", "Yesterday"],
  ]);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState({ student: demoStudents[0].name, kind: "Positive observation", note: "" });
  const categoryLabel: Record<string, string> = { PARTICIPATION: "Participation", "SUPPORT NEEDED": "Support needed", EFFORT: "Effort", COLLABORATION: "Collaboration" };
  const kindTone: Record<string, "POSITIVE" | "ATTENTION"> = { "Positive observation": "POSITIVE", "Attendance update": "POSITIVE", "Homework status": "POSITIVE", "Support needed": "ATTENTION" };
  const addObservation = () => {
    if (!draft.note.trim() && draft.kind !== "Support needed") return;
    setObservations((current) => [[draft.student, draft.kind.toUpperCase(), kindTone[draft.kind] ?? "POSITIVE", draft.note || t("No note"), "Now"], ...current]);
    setDraft({ student: demoStudents[0].name, kind: "Positive observation", note: "" });
  };
  const visibleObservations = observations.filter((item) => {
    const matchesFilter = filter === "All" || (filter === "Positive" ? item[2] === "POSITIVE" : filter === "Attention" ? item[2] === "ATTENTION" : filter === "Neutral" ? item[2] === "NEUTRAL" : item[2] === "FOLLOWUP");
    const matchesQuery = `${item[0]} ${item[3]}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesFilter && matchesQuery;
  });
  return (
    <div className="space-y-6">
      <PageHeader title={t("Observations")} description={t("Fast teacher input that automatically feeds the longitudinal student profile.")} actions={<ActionButton label={t("New observation")} title={t("Detailed observation")} confirmLabel={t("New observation")} onConfirm={addObservation}><QuickForm value={draft} onChange={setDraft} /></ActionButton>} />
      <div className="grid gap-4 sm:grid-cols-3"><MetricCard label={t("This week")} value={28 + observations.length} detail={t("Across your classes")} icon={MessageSquare} /><MetricCard label={t("Positive")} value="71%" detail={t("Recognition and strengths")} trend={5} tone="sky" /><MetricCard label={t("Follow-ups due")} value={3} detail={t("Support actions")} tone="amber" /></div>
      <FilterBar placeholder={t("Search student or note")} filters={["All", "Positive", "Neutral", "Attention", "Follow-up due"]} query={query} onQueryChange={setQuery} active={filter} onActiveChange={setFilter} />
      <div className="grid gap-4 lg:grid-cols-2">{visibleObservations.map((item, index) => <Card key={`${item[0]}-${index}`} className="p-4"><div className="flex items-center gap-3"><StudentAvatar student={demoStudents.find((student) => student.name === item[0]) ?? demoStudents[index % demoStudents.length]} /><div className="flex-1"><div className="font-semibold">{item[0]}</div><div className="text-xs text-slate-500">{t(categoryLabel[item[1]] ?? item[1])} · {t("Grade 8B")}</div></div><StatusBadge tone={item[2] === "POSITIVE" ? "positive" : "attention"}>{t(item[2] === "POSITIVE" ? "Positive" : "Needs attention")}</StatusBadge></div><p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-900">{t(item[3])}</p><div className="mt-3 flex justify-between text-xs text-slate-400"><span>Amina Martin</span><span>{t(item[4] === "Yesterday" ? "Yesterday" : item[4])}</span></div></Card>)}</div>
    </div>
  );
}

export function AssessmentsPageDemo() {
  const { t } = useI18n();
  const [created, setCreated] = useState<Array<[string, string, string, string, string, number]>>([]);
  const assessments: Array<[string, string, string, string, string, number]> = [
    ...created,
    ["Mathematics", "Algebra quiz", "Grade 8B", "27 Jul", "17 / 20", 85],
    ["Science", "Ecosystems project", "Grade 8A", "25 Jul", "15.8 / 20", 79],
    ["French", "Reading comprehension", "Grade 7B", "23 Jul", "14.6 / 20", 73],
    ["History", "Industrial revolution test", "Grade 9A", "20 Jul", "16.2 / 20", 81],
  ];
  const [graded, setGraded] = useState<string[]>([]);
  const [filter, setFilter] = useState("All subjects");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState({ title: "", subject: "Mathematics", className: "Grade 8B", date: "" });
  const visibleAssessments = assessments.filter((item) => {
    const matchesFilter = filter === "All subjects" || item[0] === filter;
    const matchesQuery = `${item[0]} ${item[1]} ${item[2]}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesFilter && matchesQuery;
  });
  const createAssessment = () => {
    if (!draft.title.trim()) return;
    setCreated((current) => [[draft.subject, draft.title, draft.className, draft.date || "—", "—", 0], ...current]);
    setDraft({ title: "", subject: "Mathematics", className: "Grade 8B", date: "" });
  };
  return (
    <div className="space-y-6">
      <PageHeader title={t("Assessments")} description={t("Quizzes, tests and projects with fast grade entry and progress context.")} actions={<ActionButton label={t("Create assessment")} title={t("Create assessment")} confirmLabel={t("Create assessment")} onConfirm={createAssessment}><div className="space-y-3"><FormInput label="Title" value={draft.title} onChange={(value) => setDraft({ ...draft, title: value })} /><FormInput label="Class and subject" value={`${draft.className} · ${draft.subject}`} onChange={(value) => { const [className, subject] = value.split(" · "); setDraft({ ...draft, className: className || "", subject: subject || "" }); }} /><FormInput label="Date" value={draft.date} onChange={(value) => setDraft({ ...draft, date: value })} /></div></ActionButton>} />
      <div className="grid gap-4 sm:grid-cols-3"><MetricCard label={t("This term")} value={180} detail={t("Across all classes")} icon={BarChart3} /><MetricCard label={t("Awaiting grades")} value={26 - graded.length * 6} detail={t("Student results")} tone="amber" /><MetricCard label={t("Academic trend")} value="+3.2 pts" detail={t("School average")} trend={3.2} tone="sky" /></div>
      <FilterBar placeholder={t("Search assessments")} filters={["All subjects", "Mathematics", "Science", "French", "History"]} query={query} onQueryChange={setQuery} active={filter} onActiveChange={setFilter} />
      <div className="grid gap-4 md:grid-cols-2">{visibleAssessments.map((item) => <Card key={item[1]} className="p-5"><div className="flex justify-between"><div className="rounded-xl bg-violet-50 p-2 text-violet-600 dark:bg-violet-500/10"><BarChart3 className="h-5 w-5" /></div><StatusBadge tone={graded.includes(item[1]) ? "positive" : "watch"}>{graded.includes(item[1]) ? t("Grades complete") : t("Grade entry open")}</StatusBadge></div><h2 className="mt-4 font-bold">{item[1]}</h2><p className="text-sm text-slate-500">{t(item[0])} · {t(item[2])} · {item[3]}</p><div className="mt-5 flex items-end justify-between"><div><div className="text-2xl font-bold">{item[4]}</div><div className="text-[10px] text-slate-400">{t("Class average")}</div></div><div className="w-1/2"><ProgressBar value={Number(item[5])} /></div></div><Button className="mt-4 w-full" variant={graded.includes(item[1]) ? "secondary" : "default"} onClick={() => setGraded((current) => current.includes(item[1]) ? current : [...current, item[1]])}>{graded.includes(item[1]) ? t("Review grades") : t("Enter grades")}</Button></Card>)}</div>
    </div>
  );
}

export function WeeklyReviewPageDemo() {
  const { t } = useI18n();
  const [group, setGroup] = useState("All");
  const [reviewed, setReviewed] = useState(false);
  const groups = { Positive: demoStudents.filter((student) => student.status === "POSITIVE"), Stable: demoStudents.filter((student) => student.status === "STABLE"), Watch: demoStudents.filter((student) => student.status === "WATCH"), Attention: demoStudents.filter((student) => student.status === "ATTENTION") };
  const visible = group === "All" ? demoStudents : groups[group as keyof typeof groups];
  return (
    <div className="space-y-6">
      <PageHeader title={t("Weekly Review")} description={t("Automatic summary grounded in attendance, homework, observations and student check-ins.")} actions={<><Button variant="outline" asChild><Link href="/messages">{t("Share summary")}</Link></Button><Button onClick={() => setReviewed(true)}>{reviewed ? <Check className="mr-2 h-4 w-4" /> : null}{reviewed ? t("Reviewed") : t("Mark reviewed")}</Button></>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label={t("Homework")} value="+8 pts" detail={t("Versus last week")} trend={8} icon={BookOpen} /><MetricCard label={t("Attendance")} value={t("Stable")} detail={t("92% this week")} icon={CalendarCheck} tone="sky" /><MetricCard label={t("Engagement")} value="+4 pts" detail={t("Based on observations")} trend={4} tone="amber" /><MetricCard label={t("Check-ins")} value="81%" detail={t("21 of 26 students")} tone="violet" /></div>
      <Card className="p-5"><div className="flex items-start gap-3"><div className="rounded-xl bg-primary-50 p-3 text-primary-600 dark:bg-primary-500/10"><Sparkles className="h-5 w-5" /></div><div><h2 className="font-bold">{t("Automatic class summary")}</h2><p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600 dark:text-slate-300">{t("Grade 8B has maintained stable attendance while homework completion and engagement improved. Six students show clear positive momentum. Four students have one or more signals worth checking in on; each suggestion includes its evidence and requires teacher judgement.")}</p></div></div></Card>
      <div className="grid gap-4 sm:grid-cols-4">{Object.entries(groups).map(([label, students]) => <button key={label} onClick={() => setGroup(label)} className={cn("rounded-2xl border p-4 text-left transition dark:border-slate-800", group === label ? "border-primary-400 bg-primary-50 dark:bg-primary-500/5" : "border-slate-200 bg-white dark:bg-slate-900")}><div className="text-2xl font-bold">{students.length}</div><div className="text-sm font-semibold">{label === "Attention" ? t("Attention suggested") : t(label)}</div></button>)}</div>
      <Card className="p-5"><div className="mb-4 flex justify-between"><h2 className="font-bold">{t(group)} · {visible.length} {t("students")}</h2><button onClick={() => setGroup("All")} className="text-xs font-semibold text-primary-600">{t("Show all")}</button></div><div className="grid gap-3 md:grid-cols-2">{visible.map((student) => <Link href={`/students/${student.id}`} key={student.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800"><StudentAvatar student={student} /><div className="min-w-0 flex-1"><div className="font-semibold">{student.name}</div><div className="truncate text-xs text-slate-500">{t(student.headline)}</div></div><ChevronRight className="h-4 w-4 text-slate-400" /></Link>)}</div></Card>
    </div>
  );
}

function FormInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const { t } = useI18n();
  return <label className="block text-sm font-medium">{t(label)}<input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 dark:border-slate-800 dark:bg-slate-900" placeholder={t(label)} /></label>;
}

function QuickForm({ value, onChange }: { value: { student: string; kind: string; note: string }; onChange: (next: { student: string; kind: string; note: string }) => void }) {
  const { t } = useI18n();
  return <div className="space-y-3"><select value={value.student} onChange={(event) => onChange({ ...value, student: event.target.value })} className="h-10 w-full rounded-xl border border-slate-200 px-3 dark:border-slate-800 dark:bg-slate-900">{demoStudents.slice(0, 10).map((student) => <option key={student.id}>{student.name}</option>)}</select><select value={value.kind} onChange={(event) => onChange({ ...value, kind: event.target.value })} className="h-10 w-full rounded-xl border border-slate-200 px-3 dark:border-slate-800 dark:bg-slate-900">{[["Positive observation", "Positive observation"], ["Attendance update", "Attendance update"], ["Homework status", "Homework status"], ["Support needed", "Support needed"]].map(([key]) => <option key={key} value={key}>{t(key)}</option>)}</select><textarea value={value.note} onChange={(event) => onChange({ ...value, note: event.target.value })} className="min-h-24 w-full rounded-xl border border-slate-200 p-3 dark:border-slate-800 dark:bg-slate-900" placeholder={t("Optional note")} /></div>;
}
