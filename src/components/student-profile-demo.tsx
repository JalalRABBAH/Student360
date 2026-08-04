"use client";

import { useState, useMemo } from "react";
import { LocalizedLink as Link } from "@/i18n/provider";
import { ArrowLeft, Award, BookOpen, CalendarCheck, FileText, Heart, MapPin, MessageSquare, Phone, Plus, ShieldCheck, Sparkles, Stethoscope, Target, TrendingUp, Users } from "lucide-react";
import { ActionButton, InsightCard, MiniBars, PageHeader, ProgressBar, StatusBadge, StudentAvatar, TimelineItem } from "@/components/demo-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { demoEvents, demoHomework, demoStudents, demoStudentExtras, weeklyTrend, type DemoStudentExtras } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/provider";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import { DISCIPLINE_TYPE_LABELS, LEARNING_PLAN_TYPE_LABELS, MEETING_STATUS_LABELS, STUDENT_REGIME_LABELS, TRANSPORT_MODE_LABELS, CONSENT_TYPE_LABELS, DAILY_RATING_LABELS } from "@/lib/domain/enums";

const tabs = ["Overview", "Timeline", "Academics", "Homework", "Attendance", "Engagement", "Wellbeing", "Competencies", "Goals", "Teacher feedback", "Parent input", "Support plan", "Achievements", "Documents", "Identity", "Family", "Medical", "Rights", "Discipline", "Learning plans", "Meetings", "Daily tracking"] as const;

const subjectNames = ["Mathematics", "French", "Science", "History", "English", "Arabic"];

function studentSubjects(academic: number) {
  return subjectNames.map((name, i) => ({
    name,
    score: Math.min(20, Math.round(10 + ((academic + i * 5) % 40) / 100 * 10)),
    trend: i % 3 === 0 ? "up" : i % 3 === 1 ? "stable" : "down",
  }));
}

function overallRating(student: (typeof demoStudents)[number]) {
  return Math.round((student.academic + student.engagement + student.homework + student.attendance + student.motivation + student.mood * 20) / 6);
}

const radarAttrs = [
  { key: "academic", label: "Academic" },
  { key: "engagement", label: "Engagement" },
  { key: "homework", label: "Homework" },
  { key: "attendance", label: "Attendance" },
  { key: "motivation", label: "Motivation" },
  { key: "mood", label: "Wellbeing" },
] as const;

export function StudentProfileDemo({ studentId }: { studentId: string }) {
  const { t, href } = useI18n();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  const student = demoStudents.find((item) => item.id === studentId);
  if (!student) return null;
  const subjects = useMemo(() => studentSubjects(student.academic), [student.academic]);
  const overall = overallRating(student);
  const radarData = radarAttrs.map((attr) => ({
    attr: t(attr.label),
    value: attr.key === "mood" ? student.mood * 20 : student[attr.key],
    full: 100,
  }));
  const formBadges = weeklyTrend.map((w) => ({
    week: w.week,
    status: (w.attendance + w.homework + w.engagement) / 3 >= student.academic ? "positive" as const : w.attendance >= 90 ? "neutral" as const : "attention" as const,
  }));

  return (
    <div className="space-y-6">
      <Link href={href("/students")} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary-600"><ArrowLeft className="h-4 w-4" />{t("Student directory")}</Link>
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 p-6 text-white">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <StudentAvatar student={student} size="lg" />
              <div className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-emerald-800 bg-emerald-500 text-[10px] font-bold text-white">{overall}</div>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold">{student.name}</h1><StatusBadge tone={student.status === "POSITIVE" ? "positive" : student.status === "ATTENTION" ? "attention" : student.status === "WATCH" ? "watch" : "neutral"}>{t(student.headline)}</StatusBadge></div>
              <p className="mt-1 text-sm text-slate-300">{t(student.className)} · {t("Age")} 13 · {t("School year")} 2025–2026 · {t("Advisor")} Amina Martin</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">{formBadges.map((f) => <span key={f.week} className={cn("inline-grid h-6 w-6 place-items-center rounded text-[10px] font-bold", f.status === "positive" ? "bg-emerald-500/30 text-emerald-300" : f.status === "attention" ? "bg-amber-500/30 text-amber-300" : "bg-slate-500/30 text-slate-300")}>{f.week.replace("W", "")}</span>)}<span className="ml-1 text-slate-500">{t("Recent form")}</span></div>
            </div>
            <div className="flex gap-2"><ActionButton label="Add action" title={`Create an action for ${student.name}`}><textarea className="min-h-28 w-full rounded-xl border p-3 text-slate-900 dark:bg-slate-900 dark:text-white" placeholder={t("Support action or follow-up")} /></ActionButton><Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20" asChild><Link href={href("/messages")}>{t("Message")}</Link></Button></div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {([["Academic", student.academic], ["Engagement", student.engagement], ["Homework", student.homework], ["Attendance", student.attendance], ["Motivation", student.motivation], ["Wellbeing", student.mood * 20]] as [string, number][]).map(([label, value]) => <div key={label} className="rounded-xl bg-white/10 p-3 backdrop-blur"><div className="flex items-baseline gap-1"><div className="text-xl font-bold">{value}%</div><div className={cn("h-2 w-2 rounded-full", value >= 80 ? "bg-emerald-400" : value >= 60 ? "bg-amber-400" : "bg-rose-400")}></div></div><div className="text-[10px] uppercase tracking-wide text-slate-300">{label}</div></div>)}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-[1fr_auto]">
          <div className="flex gap-1 overflow-x-auto">{tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={cn("whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold", tab === item ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800")}>{t(item)}</button>)}</div>
          <div className="flex items-center gap-3 text-xs text-slate-400">{t("Overall")}: <span className="text-lg font-bold text-slate-800 dark:text-white">{overall}</span><span className="text-slate-300">/100</span></div>
        </div>
      </Card>
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <ProfileTab tab={tab} student={student} subjects={subjects} />
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">{t("Attribute profile")}</h3>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(220 20% 85%)" />
                <PolarAngleAxis dataKey="attr" tick={{ fontSize: 10, fill: "hsl(220 10% 60%)" }} />
                <Radar dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{t("Subjects")}</h3>
            <div className="space-y-3">{subjects.map((s) => <div key={s.name} className="flex items-center gap-2"><div className="flex-1 truncate text-sm">{s.name}</div><div className="flex items-center gap-1.5"><span className={cn("text-sm font-bold", s.score >= 15 ? "text-emerald-600" : s.score >= 10 ? "text-amber-600" : "text-rose-600")}>{s.score}<span className="text-xs text-slate-400">/20</span></span><TrendingUp className={cn("h-3.5 w-3.5", s.trend === "up" ? "text-emerald-500" : s.trend === "down" ? "text-rose-400 rotate-180" : "text-slate-400")} /></div></div>)}</div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ tab, student, subjects }: { tab: (typeof tabs)[number]; student: (typeof demoStudents)[number]; subjects: { name: string; score: number; trend: string }[] }) {
  const extras = useMemo(() => demoStudentExtras(student), [student]);
  if (tab === "Timeline") return <Card className="p-5"><PageHeader title="Longitudinal timeline" description="A chronological view of check-ins, attendance, feedback, homework and family input." /><div className="mt-6 max-w-3xl">{[...demoEvents, ...demoEvents.slice(0, 4)].map((event, index) => <TimelineItem key={`${event.time}-${index}`} {...event} time={index > 6 ? `26 Jul · ${event.time}` : `Today · ${event.time}`} />)}</div></Card>;
  if (tab === "Academics") return <SectionGrid title="Academic progress" icon={BookOpen} items={subjects.map((s) => [s.name, `${s.score} / 20`, Math.round(s.score / 20 * 100)] as [string, string, number])} />;
  if (tab === "Homework") return <Card className="p-5"><PageHeader title="Homework" description={`${student.homework}% completion over the last 30 days.`} /><div className="mt-5 space-y-3">{demoHomework.map((item, index) => <div key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 dark:border-slate-800"><BookOpen className="h-5 w-5 text-primary-500" /><div className="flex-1"><div className="font-semibold">{item.title}</div><div className="text-xs text-slate-500">{item.subject} · {item.due}</div></div><StatusBadge tone={index === 3 ? "watch" : "positive"}>{index === 3 ? "Needs review" : "Completed"}</StatusBadge></div>)}</div></Card>;
  if (tab === "Attendance") return <SectionGrid title="Attendance patterns" icon={CalendarCheck} items={[["Present", "52 sessions", 92], ["Late", "3 sessions", 12], ["Excused", "1 session", 5], ["Absent", "2 sessions", 8]]} />;
  if (tab === "Engagement") return <SectionGrid title="Engagement dimensions" icon={Sparkles} items={[["Participation", "Strong", student.engagement], ["Attention", "Steady", 78], ["Effort", "Improving", 84], ["Collaboration", "Strong", 89], ["Autonomy", "Developing", 68], ["Curiosity", "Strong", 86]]} />;
  if (tab === "Wellbeing") return <Card className="p-5"><PageHeader title="Student-reported wellbeing" description="Trends are descriptive, not medical or psychological diagnoses." /><div className="mt-6 grid gap-5 lg:grid-cols-2"><div className="space-y-5"><ProgressBar label="Mood" value={student.mood * 20} /><ProgressBar label="Energy" value={80} tone="sky" /><ProgressBar label="Motivation" value={student.motivation} tone="amber" /><ProgressBar label="Perceived calm" value={68} /></div><div><MiniBars values={[70, 65, 80, 75, 62, 78, 82]} /><p className="mt-3 text-sm text-slate-500">Mood has remained broadly stable over the past two weeks.</p><InsightCard positive title="Supportive framing" reasons={["Based on self-reported check-ins", "No diagnosis is inferred from these trends"]} /></div></div></Card>;
  if (tab === "Competencies") return <SectionGrid title="Competency framework" icon={Users} items={[["Communication", "Level 3", 76], ["Critical thinking", "Level 4", 88], ["Creativity", "Level 3", 72], ["Collaboration", "Level 4", 90], ["Problem solving", "Level 3", 81], ["Organisation", "Level 2", 61]]} />;
  if (tab === "Goals") return <GoalSupport type="goals" />;
  if (tab === "Teacher feedback") return <Feed title="Teacher feedback" items={["Excellent reasoning during mathematics today.", "Asked thoughtful questions in science.", "Keep using the planning checklist for homework."]} />;
  if (tab === "Parent input") return <Feed title="Parent input" items={["We reviewed algebra together for twenty minutes.", "Homework routine felt easier this week.", "Acknowledged the upcoming science deadline."]} />;
  if (tab === "Support plan") return <GoalSupport type="support" />;
  if (tab === "Achievements") return <SectionGrid title="Achievements" icon={Award} items={[["Collaboration champion", "Gold", 100], ["Homework streak", "Silver", 82], ["Positive momentum", "Silver", 75], ["Perfect week", "Bronze", 60]]} />;
  if (tab === "Documents") return <Feed title="Documents" items={["Term 2 student report.pdf", "Mathematics work sample.pdf", "Support plan review.pdf"]} />;
  if (tab === "Identity") return <IdentityTab extras={extras} />;
  if (tab === "Family") return <FamilyTab extras={extras} student={student} />;
  if (tab === "Medical") return <MedicalTab extras={extras} />;
  if (tab === "Rights") return <RightsTab extras={extras} />;
  if (tab === "Discipline") return <DisciplineTab extras={extras} />;
  if (tab === "Learning plans") return <PlansTab extras={extras} />;
  if (tab === "Meetings") return <MeetingsTab extras={extras} />;
  if (tab === "Daily tracking") return <DailyTrackingTab extras={extras} />;
  return <Overview student={student} subjects={subjects} />;
}

function Overview({ student, subjects }: { student: (typeof demoStudents)[number]; subjects: { name: string; score: number; trend: string }[] }) {
  return <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]"><div className="space-y-6"><Card className="p-5"><div className="flex items-center justify-between"><div><h2 className="font-bold">Student form · last six weeks</h2><p className="text-xs text-slate-500">Independent dimensions, not a single student score</p></div><div className="flex items-center gap-2 text-sm"><TrendingUp className="h-4 w-4 text-emerald-500" /><span className="font-bold text-emerald-600">{student.trend === "UP" ? "+3.1%" : student.trend === "DOWN" ? "-1.4%" : "+0.2%"}</span><span className="text-xs text-slate-400">vs last period</span></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><ProgressBar label="Academic" value={student.academic} /><ProgressBar label="Engagement" value={student.engagement} tone="amber" /><ProgressBar label="Homework" value={student.homework} /><ProgressBar label="Attendance" value={student.attendance} tone="sky" /><ProgressBar label="Motivation" value={student.motivation} tone="amber" /><ProgressBar label="Competencies" value={student.academic - 3} /></div></Card><div className="grid gap-4 sm:grid-cols-2"><InsightCard positive title="Strengths" reasons={["Consistent academic understanding", "Strong collaboration with peers", "Positive recent homework trend"]} /><InsightCard title="Support opportunity" reasons={["Motivation is lower than academic progress", "A short goal-setting conversation may help"]} /></div><Card className="p-5"><h2 className="font-bold">Subject breakdown</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{subjects.map((s) => <div key={s.name} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800"><div className="flex items-center justify-between"><div className="text-sm font-semibold">{s.name}</div><TrendingUp className={cn("h-4 w-4", s.trend === "up" ? "text-emerald-500" : s.trend === "down" ? "text-rose-400 rotate-180" : "text-slate-400")} /></div><div className="mt-2 flex items-baseline gap-1"><span className={cn("text-2xl font-bold", s.score >= 15 ? "text-emerald-600" : s.score >= 10 ? "text-amber-600" : "text-rose-600")}>{s.score}</span><span className="text-xs text-slate-400">/20</span></div><ProgressBar value={Math.round(s.score / 20 * 100)} /></div>)}</div></Card><Card className="p-5"><h2 className="font-bold">Recent activity</h2><div className="mt-4">{demoEvents.slice(0, 5).map((event) => <TimelineItem key={event.time} {...event} />)}</div></Card></div><div className="space-y-6"><GoalSupport type="goals" /><Feed title="Latest feedback" items={["Excellent reasoning during mathematics.", "Good collaboration during group work.", "Remember to use the homework planner."]} /><Card className="p-5"><h2 className="font-bold">Upcoming</h2><div className="mt-3 space-y-3">{demoHomework.slice(0, 3).map((item) => <div key={item.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900"><div className="text-sm font-semibold">{item.title}</div><div className="text-xs text-slate-500">{item.subject} · {item.due}</div></div>)}</div></Card></div></div>;
}

function SectionGrid({ title, icon: Icon, items }: { title: string; icon: React.ElementType; items: [string, string, number][] }) {
  return <Card className="p-5"><PageHeader title={title} description="Current term evidence and recent evolution." actions={<Button variant="outline"><Plus className="mr-2 h-4 w-4" />Add evidence</Button>} /><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map(([label, detail, value]) => <div key={label} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800"><div className="flex items-center gap-3"><div className="rounded-xl bg-primary-50 p-2 text-primary-600 dark:bg-primary-500/10"><Icon className="h-4 w-4" /></div><div><div className="font-semibold">{label}</div><div className="text-xs text-slate-500">{detail}</div></div></div><div className="mt-4"><ProgressBar value={value} /></div></div>)}</div></Card>;
}

function GoalSupport({ type }: { type: "goals" | "support" }) {
  const goal = type === "goals";
  return <Card className="p-5"><div className="flex items-center justify-between"><div><h2 className="font-bold">{goal ? "Current goals" : "Support plan"}</h2><p className="text-xs text-slate-500">{goal ? "Student and teacher owned actions" : "Human-led intervention and measured progress"}</p></div><StatusBadge tone={goal ? "positive" : "watch"}>{goal ? "On track" : "Active"}</StatusBadge></div><div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-900"><div className="flex gap-3">{goal ? <Target className="h-5 w-5 text-primary-500" /> : <Heart className="h-5 w-5 text-rose-500" />}<div><div className="text-sm font-semibold">{goal ? "Complete all mathematics homework this week" : "Weekly organisation check-in"}</div><p className="mt-1 text-xs text-slate-500">{goal ? "Owner: Student + teacher · Target: Friday" : "15-minute teacher support every Tuesday · Review after 4 weeks"}</p></div></div><div className="mt-4"><ProgressBar value={goal ? 72 : 65} /></div></div></Card>;
}

function Feed({ title, items }: { title: string; items: string[] }) {
  return <Card className="p-5"><div className="flex items-center justify-between"><h2 className="font-bold">{title}</h2><Button size="sm" variant="outline"><Plus className="mr-1 h-3.5 w-3.5" />Add</Button></div><div className="mt-4 space-y-3">{items.map((item, index) => <div key={item} className="flex gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">{title === "Documents" ? <FileText className="mt-0.5 h-4 w-4 text-sky-500" /> : <MessageSquare className="mt-0.5 h-4 w-4 text-primary-500" />}<div className="flex-1"><p className="text-sm">{item}</p><p className="mt-1 text-[10px] text-slate-400">{index + 1} day{index ? "s" : ""} ago</p></div></div>)}</div></Card>;
}

// ---------------------------------------------------------------------------
// Phase 1 — enriched student file tabs
// ---------------------------------------------------------------------------

function DetailRow({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: React.ElementType }) {
  return <div className="flex items-start justify-between gap-4 py-2.5"><div className="flex items-center gap-2 text-sm text-slate-500">{Icon ? <Icon className="h-4 w-4 text-primary-500" /> : null}{label}</div><div className="text-right text-sm font-semibold">{value}</div></div>;
}

function IdentityTab({ extras }: { extras: DemoStudentExtras }) {
  const { t } = useI18n();
  return <Card className="p-5"><PageHeader title="Identity & schooling" description="Civil status and daily logistics." actions={<Button variant="outline"><Plus className="mr-2 h-4 w-4" />Edit</Button>} />
    <div className="mt-2 grid gap-x-8 border-t border-slate-100 dark:border-slate-800 sm:grid-cols-2">
      <DetailRow label={t("Student number")} value={extras.studentNumber} icon={FileText} />
      <DetailRow label={t("Nationality")} value={extras.nationality} icon={Users} />
      <DetailRow label={t("Birthplace")} value={extras.birthplace} icon={MapPin} />
      <DetailRow label={t("Address")} value={<span className="text-sm">{extras.address}</span>} icon={MapPin} />
      <DetailRow label={t("Regime")} value={t(STUDENT_REGIME_LABELS[extras.regime] ?? extras.regime)} icon={CalendarCheck} />
      <DetailRow label={t("Transport")} value={<>{t(TRANSPORT_MODE_LABELS[extras.transportMode] ?? extras.transportMode)}{extras.busLine ? <> · {t("Bus line")} {extras.busLine}</> : null}</>} icon={CalendarCheck} />
      <DetailRow label={t("Home language")} value={extras.homeLanguage} icon={MessageSquare} />
      <DetailRow label={t("Languages spoken")} value={extras.languagesSpoken.join(", ")} icon={MessageSquare} />
      <DetailRow label={t("Previous school")} value={extras.previousSchool ?? t("None")} icon={BookOpen} />
      <DetailRow label={t("Transfer reason")} value={extras.transferReason ?? t("None")} icon={BookOpen} />
      <DetailRow label={t("AESH support")} value={extras.aesh ?? t("None")} icon={Heart} />
      <DetailRow label={t("Emergency contact")} value={<span className="text-sm">{extras.emergencyContact}</span>} icon={Phone} />
    </div>
  </Card>;
}

function FamilyTab({ extras, student }: { extras: DemoStudentExtras; student: (typeof demoStudents)[number] }) {
  const { t } = useI18n();
  const primary = extras.guardians.find((g) => g.primary) ?? extras.guardians[0];
  return <div className="space-y-6">
    <Card className="p-5"><PageHeader title="Guardians" description={`Contacts linked to ${student.name}'s record.`} actions={<Button variant="outline"><Plus className="mr-2 h-4 w-4" />Add</Button>} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{extras.guardians.map((g) => <div key={g.name} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800"><div className="flex items-center justify-between"><div className="font-semibold">{g.name}</div>{g.primary ? <StatusBadge tone="positive">{t("Primary contact")}</StatusBadge> : null}</div><div className="mt-2 space-y-1 text-xs text-slate-500"><div>{t(g.relationship === "FATHER" ? "Father" : g.relationship === "MOTHER" ? "Mother" : "Guardian")} · {g.occupation}</div><div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{g.phone}</div><div className="truncate">{g.email}</div></div></div>)}</div>
      <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"><div className="font-semibold">{t("Emergency contact")}</div><div className="mt-1 text-xs">{primary ? `${primary.name} · ${primary.phone}` : extras.emergencyContact}</div></div>
    </Card>
    <Card className="p-5"><PageHeader title="Authorised pickup persons" description="People allowed to pick the student up at school." actions={<Button variant="outline"><Plus className="mr-2 h-4 w-4" />Add</Button>} />
      <div className="mt-4 space-y-3">{extras.pickupPeople.map((p) => <div key={p.name} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800"><Users className="h-5 w-5 text-primary-500" /><div className="flex-1"><div className="text-sm font-semibold">{p.name}</div><div className="text-xs text-slate-500">{t("Relationship")}: {t(PICKUP_LABELS[p.relationship] ?? p.relationship)}{p.idNumber ? <> · {t("ID")}: {p.idNumber}</> : null}</div></div><div className="flex items-center gap-1.5 text-xs text-slate-500"><Phone className="h-3 w-3" />{p.phone}</div>{p.notes ? <div className="w-full rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-500 dark:bg-slate-900">{p.notes}</div> : null}</div>)}</div>
    </Card>
  </div>;
}

const PICKUP_LABELS: Record<string, string> = { GRANDPARENT: "Grandparent", BABYSITTER: "Babysitter", SIBLING: "Sibling", AUNT: "Aunt / uncle", UNCLE: "Aunt / uncle", OTHER: "Other" };

function MedicalTab({ extras }: { extras: DemoStudentExtras }) {
  const { t } = useI18n();
  const m = extras.medical;
  return <div className="space-y-6">
    <Card className="p-5"><div className="flex items-center gap-3 rounded-2xl bg-sky-50 p-4 text-sm text-sky-800 dark:bg-sky-500/10 dark:text-sky-300"><Stethoscope className="h-5 w-5 shrink-0" /><div><div className="font-semibold">{t("Restricted medical record")}</div><div className="text-xs">{t("Visible to the school nurse and administration; teachers only see the emergency protocol.")}</div></div></div>
      <div className="mt-4 grid gap-x-8 sm:grid-cols-2">
        <DetailRow label={t("Blood type")} value={m.bloodType} />
        <DetailRow label={t("Updated")} value={m.updatedAt} />
        <DetailRow label={t("Allergies")} value={m.allergies.length ? m.allergies.join(", ") : t("None")} />
        <DetailRow label={t("Chronic conditions")} value={m.chronicDiseases.length ? m.chronicDiseases.join(", ") : t("None")} />
        <DetailRow label={t("Medications")} value={m.medications.length ? m.medications.join(", ") : t("None")} />
        <DetailRow label={t("Sports restrictions")} value={m.sportsRestrictions.length ? m.sportsRestrictions.join(", ") : t("None")} />
        <DetailRow label={t("Treating physician")} value={m.physician} />
        <DetailRow label={t("Physician phone")} value={<span className="text-sm">{m.physicianPhone}</span>} />
      </div>
      <div className="mt-4 rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 dark:border-rose-500/30 dark:bg-rose-500/10"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400"><ShieldCheck className="h-4 w-4" />{t("Emergency protocol")} {m.protocolVisibleToTeachers ? <span className="font-normal normal-case text-rose-500/70">· {t("Visible to teachers")}</span> : null}</div><p className="mt-1.5 text-sm text-rose-900 dark:text-rose-200">{m.emergencyProtocol}</p></div>
    </Card>
  </div>;
}

function RightsTab({ extras }: { extras: DemoStudentExtras }) {
  const { t } = useI18n();
  return <Card className="p-5"><PageHeader title="Consents & authorisations" description="Signed agreements and pick-up authorisations." actions={<Button variant="outline"><Plus className="mr-2 h-4 w-4" />Add</Button>} />
    <div className="mt-4 space-y-3">{extras.consents.map((c) => <div key={c.type} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800"><ShieldCheck className="h-5 w-5 text-primary-500" /><div className="flex-1"><div className="text-sm font-semibold">{t(CONSENT_TYPE_LABELS[c.type] ?? c.type)}</div><div className="text-xs text-slate-500">{t("Signed")} {c.grantedAt}</div></div><StatusBadge tone={c.status === "GRANTED" ? "positive" : c.status === "PENDING" ? "watch" : "attention"}>{t(c.status === "GRANTED" ? "Granted" : c.status === "PENDING" ? "Pending" : "Denied")}</StatusBadge></div>)}</div>
  </Card>;
}

function DisciplineTab({ extras }: { extras: DemoStudentExtras }) {
  const { t } = useI18n();
  return <Card className="p-5"><PageHeader title="Recognition & discipline register" description="Both encouraging and corrective entries, in a constructive tone." actions={<Button variant="outline"><Plus className="mr-2 h-4 w-4" />Add</Button>} />
    <div className="mt-4 space-y-3">{extras.discipline.length ? extras.discipline.map((d, i) => <div key={i} className={cn("flex gap-3 rounded-xl border p-4", d.type === "COMMENDATION" || d.type === "HONOR_ROLL" || d.type === "ENCOURAGEMENT" ? "border-emerald-100 dark:border-emerald-500/20" : "border-amber-100 dark:border-amber-500/20")}><Award className={cn("mt-0.5 h-5 w-5 shrink-0", d.type === "COMMENDATION" || d.type === "HONOR_ROLL" || d.type === "ENCOURAGEMENT" ? "text-emerald-500" : "text-amber-500")} /><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold">{t(DISCIPLINE_TYPE_LABELS[d.type] ?? d.type)}</span><StatusBadge tone={d.type === "COMMENDATION" || d.type === "HONOR_ROLL" || d.type === "ENCOURAGEMENT" ? "positive" : d.status === "CLOSED" ? "neutral" : "watch"}>{d.status === "ACTIVE" ? t("Active") : t("Closed")}</StatusBadge></div><div className="mt-1 text-sm">{d.title}</div><p className="mt-0.5 text-xs text-slate-500">{d.description}</p></div><div className="shrink-0 text-xs text-slate-400">{d.date}</div></div>) : <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500 dark:bg-slate-900">{t("No entries yet")}</p>}</div>
  </Card>;
}

function PlansTab({ extras }: { extras: DemoStudentExtras }) {
  const { t } = useI18n();
  return <Card className="p-5"><PageHeader title="Learning plans" description="PAI, PAP, PPS and AESH arrangements." actions={<Button variant="outline"><Plus className="mr-2 h-4 w-4" />Add</Button>} />
    <div className="mt-4 space-y-4">{extras.plans.length ? extras.plans.map((p, i) => <div key={i} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800"><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><span className="rounded-lg bg-primary-50 px-2 py-1 text-xs font-bold text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">{t(LEARNING_PLAN_TYPE_LABELS[p.type]?.split(" — ")[0] ?? p.type)}</span><span className="text-sm font-semibold">{p.title}</span></div><StatusBadge tone={p.status === "ACTIVE" ? "positive" : "neutral"}>{t("Active")}</StatusBadge></div><p className="mt-2 text-xs text-slate-500">{p.description}</p>{p.assignedTo ? <p className="mt-1 text-xs text-slate-500">{t("Assigned to")}: {p.assignedTo}</p> : null}<div className="mt-3 flex flex-wrap gap-1.5">{p.accommodations.map((a) => <span key={a} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">{a}</span>)}</div><div className="mt-3 text-[11px] text-slate-400">{p.startDate}{p.endDate ? ` → ${p.endDate}` : ""}</div></div>) : <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500 dark:bg-slate-900">{t("No plans yet")}</p>}</div>
  </Card>;
}

function MeetingsTab({ extras }: { extras: DemoStudentExtras }) {
  const { t } = useI18n();
  return <Card className="p-5"><PageHeader title="Parent meetings" description="Meetings with the family and the class team." actions={<Button variant="outline"><Plus className="mr-2 h-4 w-4" />Schedule</Button>} />
    <div className="mt-4 space-y-4">{extras.meetings.map((mtg, i) => <div key={i} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800"><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><CalendarCheck className="h-4 w-4 text-primary-500" /><span className="text-sm font-semibold">{mtg.title}</span></div><div className="flex items-center gap-2"><span className="text-xs text-slate-400">{mtg.date}</span><StatusBadge tone={mtg.status === "DONE" ? "positive" : "watch"}>{t(mtg.status === "DONE" ? "Held" : "Scheduled")}</StatusBadge></div></div><div className="mt-1 text-xs text-slate-500">{t("Participants")}: {mtg.participants}</div><div className="mt-2 grid gap-2 text-xs lg:grid-cols-2"><div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900"><span className="font-semibold">{t("Agenda")}: </span>{mtg.agenda}</div>{mtg.minutes ? <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900"><span className="font-semibold">{t("Minutes")}: </span>{mtg.minutes}</div> : null}{mtg.decisions ? <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-500/10"><span className="font-semibold">{t("Decisions")}: </span>{mtg.decisions}</div> : null}{mtg.followUp ? <div className="rounded-lg bg-sky-50 p-3 dark:bg-sky-500/10"><span className="font-semibold">{t("Follow-up")}: </span>{mtg.followUp}</div> : null}</div></div>)}</div>
  </Card>;
}

function DailyTrackingTab({ extras }: { extras: DemoStudentExtras }) {
  const { t } = useI18n();
  return <Card className="p-5"><PageHeader title="Recent daily tracking" description="By-exception entries: only criteria that deviated from expectations are recorded (1–2 flagged, 5 excellent)." actions={<Button variant="outline"><Plus className="mr-2 h-4 w-4" />Record today</Button>} />
    <div className="mt-4 overflow-x-auto">{extras.dailyRatings.length ? <table className="w-full min-w-[560px] text-sm"><thead><tr className="border-b border-slate-100 text-left text-xs text-slate-500 dark:border-slate-800"><th className="pb-2 pr-4 font-semibold">{t("Date")}</th>{extras.dailyRatings[0]?.criteria.map((c) => <th key={c.code} className="pb-2 pr-4 font-semibold">{t(DAILY_RATING_LABELS[c.code] ?? c.code)}</th>)}<th className="pb-2 font-semibold">{t("Note")}</th></tr></thead><tbody>{extras.dailyRatings.map((r, i) => <tr key={i} className="border-b border-slate-50 dark:border-slate-800/60"><td className="py-3 pr-4 whitespace-nowrap text-xs text-slate-500">{r.date}</td>{r.criteria.map((c) => <td key={c.code} className="py-3 pr-4"><span className={cn("inline-grid h-6 w-6 place-items-center rounded text-[11px] font-bold", c.value <= 2 ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300" : c.value === 5 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300")}>{c.value}</span></td>)}<td className="py-3 text-xs text-slate-500">{r.note ?? "–"}</td></tr>)}</tbody></table> : <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500 dark:bg-slate-900">{t("No exceptions recorded — everything on track")}</p>}</div>
  </Card>;
}