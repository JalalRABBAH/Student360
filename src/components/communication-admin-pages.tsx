"use client";

import { useState } from "react";
import { BookOpen, Check, ChevronRight, Download, FileSpreadsheet, FileText, MessageSquare, Save, Search, Send, Settings, ShieldCheck, SlidersHorizontal, Users } from "lucide-react";
import { ActionButton, DownloadButton, FilterBar, MetricCard, PageHeader, ProgressBar, StatusBadge } from "@/components/demo-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { demoMessages } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/provider";

type DemoThread = { id: string; name: string; role: string; subject: string; preview: string; time: string; unread: number };

export function MessagesPageDemo() {
  const { t } = useI18n();
  const [threads, setThreads] = useState<DemoThread[]>([...demoMessages]);
  const [selectedId, setSelectedId] = useState<string>(demoMessages[0].id);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<string[]>([]);
  const [compose, setCompose] = useState({ recipient: "", subject: "", message: "" });
  const visibleThreads = threads.filter((thread) =>
    [thread.name, thread.role, thread.subject, thread.preview].join(" ").toLowerCase().includes(query.trim().toLowerCase()),
  );
  const selected = visibleThreads.find((thread) => thread.id === selectedId) ?? visibleThreads[0] ?? threads[0];
  const send = () => { if (draft.trim()) { setSent((current) => [...current, draft]); setDraft(""); setThreads((current) => current.map((thread) => thread.id === selected.id ? { ...thread, preview: draft, time: t("Now"), unread: 0 } : thread)); } };
  const createThread = () => {
    if (!compose.subject.trim() || !compose.message.trim()) return;
    const id = `thread-${threads.length + 1}`;
    setThreads((current) => [{ id, name: compose.recipient.trim() || t("New contact"), role: t("Staff"), subject: compose.subject, preview: compose.message, time: t("Now"), unread: 0 }, ...current]);
    setSelectedId(id);
    setCompose({ recipient: "", subject: "", message: "" });
  };
  return (
    <div className="space-y-6">
      <PageHeader title={t("Messages")} description={t("Secure collaboration between school staff, students and families.")} actions={<ActionButton label={t("New message")} title={t("Start a conversation")} confirmLabel={t("New message")} onConfirm={createThread}><div className="space-y-3"><input value={compose.recipient} onChange={(event) => setCompose({ ...compose, recipient: event.target.value })} className="h-10 w-full rounded-xl border px-3 dark:bg-slate-900" placeholder={t("Recipient")} /><input value={compose.subject} onChange={(event) => setCompose({ ...compose, subject: event.target.value })} className="h-10 w-full rounded-xl border px-3 dark:bg-slate-900" placeholder={t("Subject")} /><textarea value={compose.message} onChange={(event) => setCompose({ ...compose, message: event.target.value })} className="min-h-24 w-full rounded-xl border p-3 dark:bg-slate-900" placeholder={t("Message")} /></div></ActionButton>} />
      <Card className="grid min-h-[650px] overflow-hidden lg:grid-cols-[360px_1fr]">
        <aside className="border-e border-slate-100 dark:border-slate-800"><div className="border-b border-slate-100 p-4 dark:border-slate-800"><div className="relative"><Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 ps-9 pe-3 text-sm dark:border-slate-800 dark:bg-slate-900" placeholder={t("Search conversations")} /></div></div><div>{visibleThreads.map((thread) => <button key={thread.id} onClick={() => setSelectedId(thread.id)} className={cn("w-full border-b border-slate-100 p-4 text-start dark:border-slate-800", selected.id === thread.id ? "bg-primary-50/60 dark:bg-primary-500/5" : "hover:bg-slate-50 dark:hover:bg-slate-900")}><div className="flex items-center justify-between gap-2"><div className="font-semibold">{t(thread.name)}</div><div className="text-[10px] text-slate-400">{t(thread.time)}</div></div><div className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">{t(thread.subject)}</div><div className="mt-1 flex items-center gap-2"><p className="min-w-0 flex-1 truncate text-xs text-slate-500">{t(thread.preview)}</p>{thread.unread ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white">{thread.unread}</span> : null}</div></button>)}</div></aside>
        <section className="flex min-w-0 flex-col"><div className="flex items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800"><div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 text-xs font-bold text-white">{selected.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div><div className="flex-1"><div className="font-bold">{t(selected.subject)}</div><div className="text-xs text-slate-500">{t(selected.name)} · {t(selected.role)}</div></div><StatusBadge tone="positive">{t("Secure")}</StatusBadge></div><div className="flex-1 space-y-4 bg-slate-50/50 p-5 dark:bg-slate-950/40"><Bubble text="Hello, I wanted to share a quick update about the homework routine this week." /><Bubble own text="Thank you. We noticed the improvement too. The planning checklist seems to be helping." /><Bubble text={selected.preview} />{sent.map((text, index) => <Bubble own key={index} text={text} />)}</div><form onSubmit={(event) => { event.preventDefault(); send(); }} className="flex gap-2 border-t border-slate-100 p-4 dark:border-slate-800"><input value={draft} onChange={(event) => setDraft(event.target.value)} className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-900" placeholder={t("Write a message…")} /><Button type="submit" size="icon"><Send className="h-4 w-4" /></Button></form></section>
      </Card>
    </div>
  );
}

function Bubble({ text, own = false }: { text: string; own?: boolean }) {
  const { t } = useI18n();
  return <div className={`flex ${own ? "justify-end" : "justify-start"}`}><div className={`max-w-[75%] rounded-2xl p-3 text-sm ${own ? "bg-primary-600 text-white" : "border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"}`}>{t(text)}<div className={`mt-1 text-[9px] ${own ? "text-primary-100" : "text-slate-400"}`}>{own ? `${t("You")} · ` : ""}12:20</div></div></div>;
}

const reportTypes = [
  ["Student weekly report", "Individual progress, goals, feedback and attendance", "STUDENT"],
  ["Student term report", "Full term academic and competency synthesis", "STUDENT"],
  ["Class weekly report", "Class indicators, progress groups and highlights", "CLASS"],
  ["Attendance report", "Attendance patterns by grade, class and period", "SCHOOL"],
  ["Homework report", "Completion, lateness and support needs", "SCHOOL"],
  ["Intervention report", "Open plans, outcomes and measured progress", "SUPPORT"],
] as const;

const scopeLabel: Record<string, string> = { STUDENT: "Student", CLASS: "Class", SCHOOL: "School", SUPPORT: "Support" };

export function ReportsPageDemo() {
  const { t } = useI18n();
  const [generated, setGenerated] = useState<string[]>([]);
  const [reportFilter, setReportFilter] = useState("All");
  const [reportQuery, setReportQuery] = useState("");
  const visibleReports = reportTypes.filter(([title, description, scope]) => {
    const matchesCategory =
      reportFilter === "All" ||
      scope === reportFilter.toUpperCase() ||
      (reportFilter === "Attendance" && title === "Attendance report") ||
      (reportFilter === "Homework" && title === "Homework report");
    const matchesQuery = `${title} ${description} ${scope}`.toLowerCase().includes(reportQuery.trim().toLowerCase());
    return matchesCategory && matchesQuery;
  });
  return (
    <div className="space-y-6">
      <PageHeader title={t("Reports")} description={t("Generate concise student, class and school reports with privacy-aware content.")} actions={<DownloadButton filename="student360-school-report.csv" />} />
      <div className="grid gap-4 sm:grid-cols-3"><MetricCard label={t("Available templates")} value={8} detail={t("Student, class and school")} icon={FileText} /><MetricCard label={t("Generated this month")} value={42 + generated.length} detail={t("PDF and CSV previews")} icon={FileSpreadsheet} tone="sky" /><MetricCard label={t("Weekly report ready")} value={6} detail={t("One per active class")} icon={Check} tone="amber" /></div>
      <FilterBar placeholder={t("Search report type")} filters={["All", "Student", "Class", "Attendance", "Homework", "Support"]} query={reportQuery} onQueryChange={setReportQuery} active={reportFilter} onActiveChange={setReportFilter} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleReports.map(([title, description, scope]) => <Card key={title} className="p-5"><div className="flex justify-between"><div className="rounded-xl bg-sky-50 p-2.5 text-sky-600 dark:bg-sky-500/10"><FileText className="h-5 w-5" /></div><StatusBadge tone="neutral">{t(scopeLabel[scope])}</StatusBadge></div><h2 className="mt-4 font-bold">{t(title)}</h2><p className="mt-1 min-h-10 text-sm text-slate-500">{t(description)}</p><div className="mt-5 flex gap-2"><Button className="flex-1" variant={generated.includes(title) ? "secondary" : "default"} onClick={() => setGenerated((current) => current.includes(title) ? current : [...current, title])}>{generated.includes(title) ? <><Check className="mr-2 h-4 w-4" />{t("Ready")}</> : t("Generate preview")}</Button><DownloadButton filename={`${title.toLowerCase().replaceAll(" ", "-")}.csv`} /></div></Card>)}</div>
    </div>
  );
}

type ConfigField = { type: "text" | "select" | "checkboxes" | "color" | "number"; lbl: string; opts?: string[]; def?: string };
type ConfigSection = { lbl: string; summary: string; desc: string; fields: ConfigField[] };

function useConfigSections(t: (s: string) => string): ConfigSection[] {
  return [
    {
      lbl: t("Academic years"),
      summary: t("2025–2026 · 3 terms"),
      desc: t("Calendar, terms and current period"),
      fields: [
        { type: "text", lbl: t("Academic year label"), def: "2025–2026" },
        { type: "select", lbl: t("Current term"), opts: [t("Term 1"), t("Term 2"), t("Term 3")], def: t("Term 2") },
        { type: "text", lbl: t("Term 1 dates"), def: "Sep 1 – Nov 30" },
        { type: "text", lbl: t("Term 2 dates"), def: "Dec 1 – Mar 15" },
        { type: "text", lbl: t("Term 3 dates"), def: "Mar 16 – Jun 30" },
        { type: "checkboxes", lbl: t("Active periods"), opts: [t("Term 1"), t("Term 2"), t("Term 3")] },
      ],
    },
    {
      lbl: t("Classes and grades"),
      summary: t("6 classes · Grades 7–9"),
      desc: t("Capacity, rooms and homeroom teachers"),
      fields: [
        { type: "text", lbl: t("Class name"), def: "Grade 8B" },
        { type: "select", lbl: t("Grade level"), opts: [t("Grade 7"), t("Grade 8"), t("Grade 9")], def: t("Grade 8") },
        { type: "number", lbl: t("Capacity"), def: "30" },
        { type: "text", lbl: t("Room number"), def: "201" },
        { type: "text", lbl: t("Homeroom teacher"), def: "Amina Martin" },
      ],
    },
    {
      lbl: t("Subjects"),
      summary: t("9 active subjects"),
      desc: t("Names, codes, colours and ordering"),
      fields: [
        { type: "text", lbl: t("Subject name"), def: t("Mathematics") },
        { type: "text", lbl: t("Subject code"), def: "MATH" },
        { type: "color", lbl: t("Colour"), def: "#3b82f6" },
        { type: "number", lbl: t("Display order"), def: "1" },
        { type: "select", lbl: t("Category"), opts: [t("Core"), t("Elective"), t("Support")], def: t("Core") },
      ],
    },
    {
      lbl: t("Competencies"),
      summary: t("9 core skills"),
      desc: t("School-specific competency framework"),
      fields: [
        { type: "text", lbl: t("Competency name"), def: t("Critical thinking") },
        { type: "text", lbl: t("Description"), def: t("Analysing and evaluating information") },
        { type: "select", lbl: t("Category"), opts: [t("Cognitive"), t("Social"), t("Personal")], def: t("Cognitive") },
        { type: "number", lbl: t("Max score"), def: "4" },
      ],
    },
    {
      lbl: t("Grading system"),
      summary: t("Numeric /20"),
      desc: t("Multiple systems supported"),
      fields: [
        { type: "select", lbl: t("Scale type"), opts: [t("Numeric /20"), t("Numeric /100"), t("Letter A–F"), t("Descriptive")], def: t("Numeric /20") },
        { type: "number", lbl: t("Passing grade"), def: "10" },
        { type: "number", lbl: t("Max grade"), def: "20" },
        { type: "checkboxes", lbl: t("Rounding rules"), opts: [t("Round up from 0.5"), t("Always round down"), t("Truncate decimals")] },
      ],
    },
    {
      lbl: t("Attendance types"),
      summary: t("4 active types"),
      desc: t("Present, absent, late and excused"),
      fields: [
        { type: "text", lbl: t("Type name"), def: t("Present") },
        { type: "text", lbl: t("Code"), def: "P" },
        { type: "select", lbl: t("Category"), opts: [t("Present"), t("Absent"), t("Late"), t("Excused")], def: t("Present") },
        { type: "checkboxes", lbl: t("Counts as attended"), opts: [t("Counts toward attendance rate")] },
      ],
    },
    {
      lbl: t("Check-in questions"),
      summary: t("5 daily dimensions"),
      desc: t("Mood, energy, motivation, workload and understanding"),
      fields: [
        { type: "text", lbl: t("Question"), def: t("How are you feeling today?") },
        { type: "select", lbl: t("Dimension"), opts: [t("Mood"), t("Energy"), t("Motivation"), t("Workload"), t("Understanding")], def: t("Mood") },
        { type: "select", lbl: t("Response type"), opts: [t("Emoji scale"), t("1–5 scale"), t("Open text")], def: t("Emoji scale") },
        { type: "checkboxes", lbl: t("Visibility"), opts: [t("Visible to teacher"), t("Visible to parent"), t("Visible to student")] },
      ],
    },
    {
      lbl: t("Alert thresholds"),
      summary: t("Explainable rules"),
      desc: t("Signal timing and evidence thresholds"),
      fields: [
        { type: "text", lbl: t("Rule name"), def: t("Help request signal") },
        { type: "select", lbl: t("Severity"), opts: [t("Low"), t("Medium"), t("High"), t("Critical")], def: t("Medium") },
        { type: "number", lbl: t("Evidence threshold"), def: "3" },
        { type: "select", lbl: t("Notify"), opts: [t("Teacher only"), t("Teacher + coordinator"), t("All staff")], def: t("Teacher only") },
      ],
    },
    {
      lbl: t("Parent visibility"),
      summary: t("Balanced"),
      desc: t("Fine-grained per-data-type controls"),
      fields: [
        { type: "select", lbl: t("Overall visibility"), opts: [t("Minimal"), t("Balanced"), t("Full")], def: t("Balanced") },
        { type: "checkboxes", lbl: t("Visible data types"), opts: [t("Grades"), t("Attendance"), t("Homework"), t("Behaviour"), t("Check-ins"), t("Messages")] },
        { type: "checkboxes", lbl: t("Always notify parent for"), opts: [t("Low grades"), t("Absences"), t("Behaviour alerts"), t("All changes")] },
      ],
    },
    {
      lbl: t("Languages"),
      summary: t("English, French, Arabic"),
      desc: t("RTL prepared for Arabic"),
      fields: [
        { type: "checkboxes", lbl: t("Enabled languages"), opts: [t("English"), t("French"), t("Arabic")] },
        { type: "select", lbl: t("Default language"), opts: [t("English"), t("French"), t("Arabic")], def: t("English") },
        { type: "select", lbl: t("Date format"), opts: ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"], def: "DD/MM/YYYY" },
        { type: "checkboxes", lbl: t("RTL support"), opts: [t("Enable RTL layout for Arabic")] },
      ],
    },
  ];
}

export function ConfigurationPageDemo() {
  const { t } = useI18n();
  const configSections = useConfigSections(t);
  const [selected, setSelected] = useState<ConfigSection>(configSections[0]);
  const [saved, setSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState<Record<string, string>>({});
  return (
    <div className="space-y-6">
      <PageHeader title={t("Configuration")} description={t("Adapt Student360 to the school's educational system without hard-coded assumptions.")} actions={<Button type="submit" form="config-form">{saved ? <Check className="me-2 h-4 w-4" /> : <Save className="me-2 h-4 w-4" />}{t(saved ? "Saved locally" : "Save changes")}</Button>} />
      <form id="config-form" className="contents" onSubmit={(event) => { event.preventDefault(); const data: Record<string, string> = {}; new FormData(event.currentTarget).forEach((value, key) => { data[key] = String(value); }); setLastSaved(data); setSaved(true); }}>
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <Card className="overflow-hidden"><div className="border-b border-slate-100 p-4 dark:border-slate-800"><h2 className="font-bold">{t("School settings")}</h2><p className="text-xs text-slate-500">Greenwood International School</p></div>{configSections.map((section) => <button key={section.lbl} type="button" onClick={() => { setSelected(section); setSaved(false); }} className={cn("flex w-full items-center gap-3 border-b border-slate-100 p-4 text-left dark:border-slate-800", selected.lbl === section.lbl ? "bg-primary-50 dark:bg-primary-500/5" : "hover:bg-slate-50 dark:hover:bg-slate-900")}><div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800"><Settings className="h-4 w-4" /></div><div className="flex-1"><div className="text-sm font-semibold">{section.lbl}</div><div className="text-xs text-slate-500">{section.summary}</div></div><ChevronRight className="h-4 w-4 text-slate-400" /></button>)}</Card>
        <Card className="p-6"><div className="flex items-center gap-3"><div className="rounded-xl bg-primary-50 p-3 text-primary-600 dark:bg-primary-500/10"><SlidersHorizontal className="h-5 w-5" /></div><div><h2 className="text-xl font-bold">{selected.lbl}</h2><p className="text-sm text-slate-500">{selected.desc}</p></div></div>{Object.keys(lastSaved).length > 0 ? <p className="mt-3 text-xs text-emerald-600">{t("Saved values captured from the form on")} {new Date().toLocaleTimeString()}</p> : null}<div className="mt-6 space-y-5">{selected.fields.map((field, index) => <label key={field.lbl} className="block text-sm font-medium">{field.lbl}{field.type === "checkboxes" && field.opts ? <div className="mt-2 grid gap-2 sm:grid-cols-2">{field.opts.map((option) => <label key={option} className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-800"><input type="checkbox" name={`${field.lbl}-${index}`} value={option} defaultChecked={field.def ? field.opts?.includes(field.def) : true} />{t(option)}</label>)}</div> : field.type === "select" && field.opts ? <select name={field.lbl} defaultValue={field.def} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 dark:border-slate-800 dark:bg-slate-900">{field.opts.map((option) => <option key={option}>{t(option)}</option>)}</select> : field.type === "color" ? <input type="color" name={field.lbl} defaultValue={field.def ?? "#3b82f6"} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 dark:border-slate-800 dark:bg-slate-900" /> : <input type={field.type === "number" ? "number" : "text"} name={field.lbl} defaultValue={field.def} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 dark:border-slate-800 dark:bg-slate-900" />}</label>)}</div><div className="mt-8 rounded-2xl bg-sky-50 p-4 dark:bg-sky-500/5"><div className="flex gap-3"><ShieldCheck className="h-5 w-5 text-sky-600" /><div><div className="font-semibold text-sky-900 dark:text-sky-300">{t("Privacy impact reminder")}</div><p className="mt-1 text-xs text-sky-700 dark:text-sky-400">{t("Changes to visibility should be reviewed by the school's data protection lead before production use.")}</p></div></div></div></Card>
      </div>
      </form>
    </div>
  );
}

export function AuditPageDemo() {
  const { t } = useI18n();
  const logs = [
    ["12:42", "Nadia Bennani", "VIEW_STUDENT", "Opened Adam Benali's profile", "PRINCIPAL"],
    ["12:20", "Amina Martin", "CREATE_OBSERVATION", "Added a positive mathematics observation", "TEACHER"],
    ["11:04", "System", "ALERT_CREATED", "Created explainable help-request signal", "SYSTEM"],
    ["10:13", "Youssef Amrani", "HOMEWORK_SUBMITTED", "Submitted French homework", "STUDENT"],
    ["09:02", "Samir Lahlou", "EXPORT_REPORT", "Exported attendance report", "ADMIN"],
    ["08:11", "Amina Martin", "UPDATE_ATTENDANCE", "Marked one Grade 8B absence", "TEACHER"],
  ];
  const actionCategory: Record<string, string> = {
    VIEW_STUDENT: "Student access",
    CREATE_OBSERVATION: "Data changes",
    ALERT_CREATED: "Data changes",
    HOMEWORK_SUBMITTED: "Data changes",
    EXPORT_REPORT: "Exports",
    UPDATE_ATTENDANCE: "Data changes",
  };
  const [filter, setFilter] = useState("All actions");
  const visibleLogs = logs.filter((log) => filter === "All actions" || actionCategory[log[2]] === filter);
  return (
    <div className="space-y-6">
      <PageHeader title={t("Audit log")} description={t("Security and privacy trail for sensitive access and platform actions.")} actions={<DownloadButton filename="student360-audit-log.csv" />} />
      <div className="grid gap-4 sm:grid-cols-3"><MetricCard label={t("Events today")} value={126} detail={t("Across all authorised roles")} icon={ShieldCheck} /><MetricCard label={t("Sensitive views")} value={18} detail={t("Student profile access")} icon={Users} tone="sky" /><MetricCard label={t("Exports")} value={3} detail={t("All logged with actor and time")} icon={Download} tone="amber" /></div>
      <FilterBar placeholder={t("Search actor, action or entity")} filters={["All actions", "Student access", "Data changes", "Exports", "Authentication"]} active={filter} onActiveChange={setFilter} />
      <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-[11px] uppercase text-slate-500 dark:bg-slate-900"><tr><th className="px-4 py-3">{t("Time")}</th><th className="px-4 py-3">{t("Actor")}</th><th className="px-4 py-3">{t("Action")}</th><th className="px-4 py-3">{t("Details")}</th><th className="px-4 py-3">{t("Role")}</th></tr></thead><tbody>{visibleLogs.map((log) => <tr key={`${log[0]}-${log[2]}`} className="border-t border-slate-100 dark:border-slate-800"><td className="px-4 py-3 text-slate-500">{log[0]}</td><td className="px-4 py-3 font-semibold">{log[1]}</td><td className="px-4 py-3"><StatusBadge tone="info">{log[2]}</StatusBadge></td><td className="px-4 py-3 text-slate-600 dark:text-slate-300">{t(log[3])}</td><td className="px-4 py-3 text-xs text-slate-500">{log[4]}</td></tr>)}</tbody></table></div></Card>
    </div>
  );
}
