"use client";

import { useMemo, useState } from "react";
import { LocalizedLink as Link } from "@/i18n/provider";
import { ArrowLeft, Award, BookOpen, CalendarCheck, FileText, Heart, MapPin, MessageSquare, Phone, ShieldCheck, Stethoscope, Target, TrendingUp, Users } from "lucide-react";
import { InsightCard, MiniBars, PageHeader, ProgressBar, StatusBadge, StudentAvatar, TimelineItem } from "@/components/demo-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/provider";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import {
  DAILY_RATING_LABELS,
  DISCIPLINE_STATUS_LABELS,
  DISCIPLINE_TYPE_LABELS,
  EVENT_TYPE_LABELS,
  GOAL_CATEGORY_LABELS,
  GOAL_STATUS_LABELS,
  INTERVENTION_OUTCOME_LABELS,
  INTERVENTION_STATUS_LABELS,
  isDisciplinePositive,
  LEARNING_PLAN_STATUS_LABELS,
  LEARNING_PLAN_TYPE_LABELS,
  MEETING_STATUS_LABELS,
  PARENT_INPUT_LABELS,
  PICKUP_RELATIONSHIP_LABELS,
  SENTIMENT_LABELS,
  STUDENT_REGIME_LABELS,
  SUBMISSION_LABELS,
  SUBMISSION_TONE,
  TRANSPORT_MODE_LABELS,
} from "@/lib/domain/enums";
import type { StudentProfile } from "@/lib/students/service";

const tabs = ["Overview", "Timeline", "Academics", "Homework", "Attendance", "Wellbeing", "Competencies", "Goals", "Teacher feedback", "Parent input", "Support plan", "Achievements", "Documents", "Identity", "Family", "Medical", "Rights", "Discipline", "Learning plans", "Meetings", "Daily tracking"] as const;

type Tab = (typeof tabs)[number];

function headlineTone(headline: string): "positive" | "neutral" | "watch" | "attention" {
  if (headline === "Action suggested") return "attention";
  if (headline === "Watch") return "watch";
  if (headline === "Positive progress") return "positive";
  return "neutral";
}

export function StudentProfilePage({ profile }: { profile: StudentProfile }) {
  const { t, href } = useI18n();
  const [tab, setTab] = useState<Tab>("Overview");

  const radarData = useMemo(
    () => [
      { attr: t("Academic"), value: profile.indicators.academic, full: 100 },
      { attr: t("Engagement"), value: profile.indicators.engagement, full: 100 },
      { attr: t("Homework"), value: profile.indicators.homework, full: 100 },
      { attr: t("Attendance"), value: profile.indicators.attendance, full: 100 },
      { attr: t("Motivation"), value: profile.indicators.motivation, full: 100 },
      { attr: t("Wellbeing"), value: profile.indicators.wellbeing, full: 100 },
    ],
    [profile.indicators, t],
  );

  const indicatorRows: [string, number][] = [
    [t("Academic"), profile.indicators.academic],
    [t("Engagement"), profile.indicators.engagement],
    [t("Homework"), profile.indicators.homework],
    [t("Attendance"), profile.indicators.attendance],
    [t("Motivation"), profile.indicators.motivation],
    [t("Wellbeing"), profile.indicators.wellbeing],
  ];

  const dotTone = (value: number) => (value >= 80 ? "bg-emerald-400" : value >= 60 ? "bg-amber-400" : "bg-rose-400");

  return (
    <div className="space-y-6">
      <Link href={href("/students")} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary-600"><ArrowLeft className="h-4 w-4" />{t("Student directory")}</Link>
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 p-6 text-white">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <StudentAvatar student={profile} size="lg" />
              <div className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-emerald-800 bg-emerald-500 text-[10px] font-bold text-white">{profile.overall}</div>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold">{profile.name}</h1><StatusBadge tone={headlineTone(profile.headline)}>{t(profile.headline)}</StatusBadge></div>
              <p className="mt-1 text-sm text-slate-300">{profile.className}{profile.gradeLevel ? ` · ${t(profile.gradeLevel)}` : ""}{profile.dateOfBirth ? ` · ${t("Born")} ${profile.dateOfBirth}` : ""}{profile.advisorName ? ` · ${t("Advisor")} ${profile.advisorName}` : ""}</p>
              {profile.recentForm.length ? <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">{profile.recentForm.map((f) => <span key={f.week} className={cn("inline-grid h-6 w-6 place-items-center rounded text-[10px] font-bold", f.tone === "positive" ? "bg-emerald-500/30 text-emerald-300" : f.tone === "attention" ? "bg-amber-500/30 text-amber-300" : "bg-slate-500/30 text-slate-300")}>{f.week.replace("W", "")}</span>)}<span className="ml-1 text-slate-500">{t("Recent form")}</span></div> : null}
            </div>
            <div className="flex gap-2"><Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20" asChild><Link href={href("/messages")}>{t("Message")}</Link></Button></div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {indicatorRows.map(([label, value]) => <div key={label} className="rounded-xl bg-white/10 p-3 backdrop-blur"><div className="flex items-baseline gap-1"><div className="text-xl font-bold">{value}%</div><div className={cn("h-2 w-2 rounded-full", dotTone(value))}></div></div><div className="text-[10px] uppercase tracking-wide text-slate-300">{label}</div></div>)}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-[1fr_auto]">
          <div className="flex gap-1 overflow-x-auto">{tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={cn("whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold", tab === item ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800")}>{t(item)}</button>)}</div>
          <div className="flex items-center gap-3 text-xs text-slate-400">{t("Overall")}: <span className="text-lg font-bold text-slate-800 dark:text-white">{profile.overall}</span><span className="text-slate-300">/100</span></div>
        </div>
      </Card>
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <ProfileTab tab={tab} profile={profile} />
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
            {profile.academics.length ? <div className="space-y-3">{profile.academics.map((s) => <div key={s.subjectId} className="flex items-center gap-2"><div className="flex-1 truncate text-sm text-slate-700 dark:text-slate-200">{s.subject}</div><div className="flex items-center gap-1.5"><span className={cn("text-sm font-bold", s.score >= 80 ? "text-emerald-600" : s.score >= 60 ? "text-amber-600" : "text-rose-600")}>{s.score}<span className="text-xs text-slate-400">%</span></span></div></div>)}</div> : <p className="text-sm text-slate-500">{t("No grades recorded yet")}</p>}
          </Card>
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ tab, profile }: { tab: Tab; profile: StudentProfile }) {
  if (tab === "Timeline") return <Panel title={t("Longitudinal timeline")} description={t("A chronological view of check-ins, attendance, feedback, homework and family input.")}>{profile.timeline.length ? <div className="mt-6 max-w-3xl">{profile.timeline.map((event) => <TimelineItem key={event.id} time={event.occurredAt.slice(0, 10)} title={t(EVENT_TYPE_LABELS[event.type] ?? event.type)} description={event.description ?? event.title} tone={event.sentiment === "POSITIVE" ? "positive" : event.sentiment === "ATTENTION" ? "attention" : "neutral"} />)}</div> : <Empty text={t("No events recorded yet")} />}</Panel>;
  if (tab === "Academics") return <Panel title={t("Academic progress")} description={t("Average percentage per subject")}>{profile.academics.length ? <SectionGrid items={profile.academics.map((s) => [s.subject, `${s.graded} ${t("assessments")}`, s.score])} /> : <Empty text={t("No grades recorded yet")} />}</Panel>;
  if (tab === "Homework") return <Panel title={t("Homework")} description={t("Most recent submissions")}>{profile.homework.length ? <div className="mt-5 space-y-3">{profile.homework.map((item) => <div key={`${item.id}-${item.dueDate}`} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 dark:border-slate-800"><BookOpen className="h-5 w-5 text-primary-500" /><div className="flex-1"><div className="font-semibold text-slate-900 dark:text-white">{item.title}</div><div className="text-xs text-slate-500">{item.subject} · {item.dueDate}</div></div><StatusBadge tone={SUBMISSION_TONE[item.status] === "attention" ? "attention" : SUBMISSION_TONE[item.status] === "warning" ? "watch" : SUBMISSION_TONE[item.status] === "positive" ? "positive" : "neutral"}>{t(SUBMISSION_LABELS[item.status] ?? item.status)}</StatusBadge></div>)}</div> : <Empty text={t("No homework submissions yet")} />}</Panel>;
  if (tab === "Attendance") return <Panel title={t("Attendance patterns")} description={t("Last 30 days")}><SectionGrid items={[["Present", `${profile.attendance.present}`, profile.attendance.present], ["Late", `${profile.attendance.late}`, profile.attendance.late], ["Excused", `${profile.attendance.excused}`, profile.attendance.excused], ["Absent", `${profile.attendance.absent}`, profile.attendance.absent]]} /><div className="mt-4"><ProgressBar label={t("Presence rate")} value={profile.attendance.percent} tone="sky" /></div></Panel>;
  if (tab === "Wellbeing") return <Panel title={t("Student-reported wellbeing")} description={t("Trends are descriptive, not medical or psychological diagnoses.")}><div className="mt-6 grid gap-5 lg:grid-cols-2"><div className="space-y-5">{profile.wellbeing.moodAvg ? <><ProgressBar label={t("Mood")} value={profile.wellbeing.moodAvg * 20} /><ProgressBar label={t("Energy")} value={profile.wellbeing.energyAvg * 20} tone="sky" /><ProgressBar label={t("Motivation")} value={profile.wellbeing.motivationAvg * 20} tone="amber" /><ProgressBar label={t("Perceived stress")} value={profile.wellbeing.stressAvg * 20} /></> : <Empty text={t("No check-ins recorded yet")} />}</div><div>{profile.wellbeing.recent.length ? <><MiniBars values={profile.wellbeing.recent.map((c) => c.mood * 20)} /><p className="mt-3 text-sm text-slate-500">{t("Mood over recent days")}</p></> : null}<InsightCard positive title={t("Supportive framing")} reasons={[t("Based on self-reported check-ins"), t("No diagnosis is inferred from these trends")]} /></div></div></Panel>;
  if (tab === "Competencies") return <Panel title={t("Competency framework")} description={t("Current mastery levels")}>{profile.competencies.length ? <SectionGrid items={profile.competencies.map((c) => [c.name, `${c.level}/4`, c.score])} /> : <Empty text={t("No competencies assessed yet")} />}</Panel>;
  if (tab === "Goals") return <GoalsTab profile={profile} />;
  if (tab === "Teacher feedback") return <Panel title={t("Teacher feedback")} description={t("Recent observations by the class team")}>{profile.feedback.length ? <FeedList items={profile.feedback.map((f) => ({ icon: "observation" as const, text: f.note, meta: `${f.teacherName} · ${t(SENTIMENT_LABELS[f.sentiment] ?? f.sentiment)} · ${f.occurredAt}` }))} /> : <Empty text={t("No teacher feedback yet")} />}</Panel>;
  if (tab === "Parent input") return <Panel title={t("Parent input")} description={t("Messages and observations shared by the family")}>{profile.parentInputs.length ? <FeedList items={profile.parentInputs.map((p) => ({ icon: "parent" as const, text: p.content, meta: `${t(PARENT_INPUT_LABELS[p.type] ?? p.type)} · ${p.occurredAt}` }))} /> : <Empty text={t("No parent input recorded yet")} />}</Panel>;
  if (tab === "Support plan") return <InterventionsTab profile={profile} />;
  if (tab === "Achievements") return <Panel title={t("Achievements")} description={t("Recognitions and milestones")}>{profile.achievements.length ? <SectionGrid items={profile.achievements.map((a) => [a.title, a.level, 100])} /> : <Empty text={t("No achievements yet")} />}</Panel>;
  if (tab === "Documents") return <Panel title={t("Documents")} description={t("Reports, certificates and administrative files")}>{profile.documents.length ? <FeedList items={profile.documents.map((d) => ({ icon: "document" as const, text: d.name, meta: `${d.type} · ${d.createdAt}` }))} /> : <Empty text={t("No documents recorded yet")} />}</Panel>;
  if (tab === "Identity") return <IdentityTab profile={profile} />;
  if (tab === "Family") return <FamilyTab profile={profile} />;
  if (tab === "Medical") return <MedicalTab profile={profile} />;
  if (tab === "Rights") return <RightsTab />;
  if (tab === "Discipline") return <DisciplineTab profile={profile} />;
  if (tab === "Learning plans") return <PlansTab profile={profile} />;
  if (tab === "Meetings") return <MeetingsTab profile={profile} />;
  if (tab === "Daily tracking") return <DailyTrackingTab profile={profile} />;
  return <OverviewTab profile={profile} />;
}

function Panel({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
  const { t } = useI18n();
  return <Card className="p-5"><PageHeader title={title} description={description} />{children}</Card>;
}

function Empty({ text }: { text: string }) {
  return <p className="mt-4 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500 dark:bg-slate-900">{text}</p>;
}

function SectionGrid({ items }: { items: [string, string, number][] }) {
  const { t } = useI18n();
  return <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map(([label, detail, value]) => <div key={label} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800"><div><div className="font-semibold text-slate-900 dark:text-white">{t(label)}</div><div className="text-xs text-slate-500">{detail}</div></div><div className="mt-4"><ProgressBar value={value} /></div></div>)}</div>;
}

function FeedList({ items }: { items: { icon: "observation" | "parent" | "document"; text: string; meta: string }[] }) {
  return <div className="mt-4 space-y-3">{items.map((item, index) => <div key={`${item.text}-${index}`} className="flex gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">{item.icon === "document" ? <FileText className="mt-0.5 h-4 w-4 text-sky-500" /> : <MessageSquare className="mt-0.5 h-4 w-4 text-primary-500" />}<div className="flex-1"><p className="text-sm text-slate-800 dark:text-slate-200">{item.text}</p><p className="mt-1 text-[10px] text-slate-400">{item.meta}</p></div></div>)}</div>;
}

function OverviewTab({ profile }: { profile: StudentProfile }) {
  const { t } = useI18n();
  const rows: [string, number][] = [
    [t("Academic"), profile.indicators.academic],
    [t("Engagement"), profile.indicators.engagement],
    [t("Homework"), profile.indicators.homework],
    [t("Attendance"), profile.indicators.attendance],
    [t("Motivation"), profile.indicators.motivation],
    [t("Wellbeing"), profile.indicators.wellbeing],
  ];
  return <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]"><div className="space-y-6"><Card className="p-5"><div className="flex items-center justify-between"><div><h2 className="font-bold">{t("Student form")}</h2><p className="text-xs text-slate-500">{t("Independent dimensions, not a single student score")}</p></div><div className="flex items-center gap-2 text-sm"><TrendingUp className="h-4 w-4 text-emerald-500" /><span className="font-bold text-emerald-600">{profile.trend === "UP" ? t("Improving") : profile.trend === "DOWN" ? t("Lower") : t("Stable")}</span></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{rows.map(([label, value]) => <ProgressBar key={label} label={label} value={value} tone={value >= 80 ? "primary" : value >= 60 ? "amber" : "rose"} />)}</div></Card><div className="grid gap-4 sm:grid-cols-2">{profile.indicators.academic >= 60 ? <InsightCard positive title={t("Strengths")} reasons={[t("Consistent academic understanding"), t("Positive recent homework trend")]} /> : null}<InsightCard title={t("Support opportunity")} reasons={[t("Motivation is lower than academic progress"), t("A short goal-setting conversation may help")]} /></div></div><Card className="p-5"><h2 className="font-bold">{t("Subject breakdown")}</h2>{profile.academics.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{profile.academics.map((s) => <div key={s.subjectId} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800"><div className="flex items-center justify-between"><div className="text-sm font-semibold text-slate-900 dark:text-white">{s.subject}</div><span className="text-xs text-slate-400">{s.graded} {t("assessments")}</span></div><div className="mt-2 flex items-baseline gap-1"><span className={cn("text-lg font-bold", s.score >= 80 ? "text-emerald-600" : s.score >= 60 ? "text-amber-600" : "text-rose-600")}>{s.score}%</span></div><div className="mt-2"><ProgressBar value={s.score} tone={s.score >= 80 ? "primary" : s.score >= 60 ? "amber" : "rose"} /></div></div>)}</div> : <Empty text={t("No grades recorded yet")} />}</Card></div>;
}

function GoalsTab({ profile }: { profile: StudentProfile }) {
  const { t } = useI18n();
  return <Card className="p-5"><PageHeader title={t("Current goals")} description={t("Student and teacher owned actions")} /><div className="mt-4 space-y-3">{profile.goals.length ? profile.goals.map((goal) => <div key={goal.id} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800"><div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><Target className="h-5 w-5 shrink-0 text-primary-500" /><div className="text-sm font-semibold text-slate-900 dark:text-white">{goal.title}</div></div><StatusBadge tone={goal.status === "ACHIEVED" ? "positive" : goal.status === "ACTIVE" ? "watch" : "neutral"}>{t(GOAL_STATUS_LABELS[goal.status] ?? goal.status)}</StatusBadge></div><p className="mt-1 text-xs text-slate-500">{t(GOAL_CATEGORY_LABELS[goal.category] ?? goal.category)} · {t("Target")} {goal.targetDate}</p><div className="mt-3"><ProgressBar value={goal.progress} /></div></div>) : <Empty text={t("No goals yet")} />}</div></Card>;
}

function InterventionsTab({ profile }: { profile: StudentProfile }) {
  const { t } = useI18n();
  return <Card className="p-5"><PageHeader title={t("Support plan")} description={t("Human-led intervention and measured progress")} /><div className="mt-4 space-y-3">{profile.interventions.length ? profile.interventions.map((item) => <div key={item.id} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800"><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><Heart className="h-5 w-5 text-rose-500" /><div className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</div></div><StatusBadge tone={item.status === "COMPLETED" ? "positive" : item.status === "ACTIVE" || item.status === "PLANNED" ? "watch" : "neutral"}>{t(INTERVENTION_STATUS_LABELS[item.status] ?? item.status)}</StatusBadge></div><p className="mt-1 text-xs text-slate-500">{item.action}</p><p className="mt-1 text-xs text-slate-400">{t("Responsible")}: {item.responsible}{item.frequency ? ` · ${item.frequency}` : ""}</p>{item.outcome ? <div className="mt-2 text-xs text-slate-500">{t("Outcome")}: {t(INTERVENTION_OUTCOME_LABELS[item.outcome] ?? item.outcome)}</div> : null}</div>) : <Empty text={t("No support plan yet")} />}</div></Card>;
}

function DetailRow({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: React.ElementType }) {
  const { t } = useI18n();
  return <div className="flex items-start justify-between gap-4 py-2.5"><div className="flex items-center gap-2 text-sm text-slate-500">{Icon ? <Icon className="h-4 w-4 text-primary-500" /> : null}{t(label)}</div><div className="text-right text-sm font-semibold text-slate-800 dark:text-slate-200">{value}</div></div>;
}

function IdentityTab({ profile }: { profile: StudentProfile }) {
  const { t } = useI18n();
  const id = profile.identity;
  return <Card className="p-5"><PageHeader title={t("Identity & schooling")} description={t("Civil status and daily logistics.")} /><div className="mt-2 grid gap-x-8 border-t border-slate-100 dark:border-slate-800 sm:grid-cols-2"><DetailRow label={t("Student number")} value={profile.studentNumber} icon={FileText} /><DetailRow label={t("Nationality")} value={id.nationality ?? t("None")} icon={Users} /><DetailRow label={t("Birthplace")} value={id.birthplace ?? t("None")} icon={MapPin} /><DetailRow label={t("Address")} value={<span className="text-sm">{id.address ?? t("None")}</span>} icon={MapPin} /><DetailRow label={t("Regime")} value={t(STUDENT_REGIME_LABELS[id.regime ?? "EXTERN"] ?? id.regime ?? "EXTERN")} icon={CalendarCheck} /><DetailRow label={t("Transport")} value={<>{t(TRANSPORT_MODE_LABELS[id.transportMode ?? "OTHER"] ?? id.transportMode ?? "OTHER")}{id.busLine ? <> · {t("Bus line")} {id.busLine}</> : null}</>} icon={CalendarCheck} /><DetailRow label={t("Home language")} value={id.homeLanguage ?? t("None")} icon={MessageSquare} /><DetailRow label={t("Languages spoken")} value={id.languagesSpoken.length ? id.languagesSpoken.join(", ") : t("None")} icon={MessageSquare} /><DetailRow label={t("Previous school")} value={id.previousSchool ?? t("None")} icon={BookOpen} /><DetailRow label={t("Transfer reason")} value={id.transferReason ?? t("None")} icon={BookOpen} /><DetailRow label={t("AESH support")} value={<>{id.aeshName ?? t("None")}{id.aeshName && id.aeshSchedule ? <div className="text-xs font-normal text-slate-400">{id.aeshSchedule}</div> : null}</>} icon={Heart} /><DetailRow label={t("Emergency contact")} value={<span className="text-sm">{id.emergencyContact ?? t("None")}</span>} icon={Phone} /></div></Card>;
}

function FamilyTab({ profile }: { profile: StudentProfile }) {
  const { t } = useI18n();
  const primary = profile.family.guardians.find((g) => g.isPrimary) ?? profile.family.guardians[0];
  return <div className="space-y-6"><Card className="p-5"><PageHeader title={t("Guardians")} description={t("Contacts linked to this student's record.")} /><div className="mt-4 grid gap-4 sm:grid-cols-2">{profile.family.guardians.length ? profile.family.guardians.map((g) => <div key={g.name} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800"><div className="flex items-center justify-between"><div className="font-semibold text-slate-900 dark:text-white">{g.name}</div>{g.isPrimary ? <StatusBadge tone="positive">{t("Primary contact")}</StatusBadge> : null}</div><div className="mt-2 space-y-1 text-xs text-slate-500"><div>{t(g.relationship === "FATHER" ? "Father" : g.relationship === "MOTHER" ? "Mother" : "Guardian")}{g.occupation ? ` · ${g.occupation}` : ""}</div>{g.phone ? <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{g.phone}</div> : null}<div className="truncate">{g.email}</div></div></div>) : <Empty text={t("No guardians linked yet")} />}</div><div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"><div className="font-semibold">{t("Emergency contact")}</div><div className="mt-1 text-xs">{primary ? `${primary.name} · ${primary.phone ?? t("No phone")}` : profile.family.emergencyContact ?? t("None")}</div></div></Card><Card className="p-5"><PageHeader title={t("Authorised pickup persons")} description={t("People allowed to pick the student up at school.")} /><div className="mt-4 space-y-3">{profile.family.pickupPeople.length ? profile.family.pickupPeople.map((p) => <div key={p.name} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800"><Users className="h-5 w-5 text-primary-500" /><div className="flex-1"><div className="text-sm font-semibold text-slate-900 dark:text-white">{p.name}</div><div className="text-xs text-slate-500">{t("Relationship")}: {t(PICKUP_RELATIONSHIP_LABELS[p.relationship] ?? p.relationship)}{p.idNumber ? <> · {t("ID")}: {p.idNumber}</> : null}</div></div><div className="flex items-center gap-1.5 text-xs text-slate-500"><Phone className="h-3 w-3" />{p.phone ?? t("No phone")}</div>{p.notes ? <div className="w-full rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-500 dark:bg-slate-900">{p.notes}</div> : null}</div>) : <Empty text={t("No pickup persons yet")} />}</div></Card></div>;
}

function MedicalTab({ profile }: { profile: StudentProfile }) {
  const { t } = useI18n();
  const m = profile.medical;
  if (!m) return <Card className="p-5"><PageHeader title={t("Medical")} description={t("Restricted medical record")} /><Empty text={t("Only available to authorised school staff.")} /></Card>;
  return <div className="space-y-6"><Card className="p-5"><div className="flex items-center gap-3 rounded-2xl bg-sky-50 p-4 text-sm text-sky-800 dark:bg-sky-500/10 dark:text-sky-300"><Stethoscope className="h-5 w-5 shrink-0" /><div><div className="font-semibold">{t("Restricted medical record")}</div><div className="text-xs">{t("Visible to the school nurse and administration; teachers only see the emergency protocol.")}</div></div></div><div className="mt-4 grid gap-x-8 sm:grid-cols-2"><DetailRow label={t("Blood type")} value={m.bloodType ?? t("Unknown")} /><DetailRow label={t("Allergies")} value={m.allergies.length ? m.allergies.join(", ") : t("None")} /><DetailRow label={t("Chronic conditions")} value={m.chronicDiseases.length ? m.chronicDiseases.join(", ") : t("None")} /><DetailRow label={t("Medications")} value={m.medications.length ? m.medications.join(", ") : t("None")} /><DetailRow label={t("Sports restrictions")} value={m.sportsRestrictions.length ? m.sportsRestrictions.join(", ") : t("None")} /><DetailRow label={t("Treating physician")} value={m.treatingPhysician ?? t("None")} /><DetailRow label={t("Physician phone")} value={<span className="text-sm">{m.physicianPhone ?? t("None")}</span>} /></div><div className="mt-4 rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 dark:border-rose-500/30 dark:bg-rose-500/10"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400"><ShieldCheck className="h-4 w-4" />{t("Emergency protocol")} {m.protocolVisibleToTeachers ? <span className="font-normal normal-case text-rose-500/70">· {t("Visible to teachers")}</span> : null}</div><p className="mt-1.5 text-sm text-rose-900 dark:text-rose-200">{m.emergencyProtocol}</p></div></Card></div>;
}

function RightsTab() {
  const { t } = useI18n();
  return <Card className="p-5"><PageHeader title={t("Consents & authorisations")} description={t("Signed agreements and pick-up authorisations.")} /><Empty text={t("No consents recorded yet")} /></Card>;
}

function DisciplineTab({ profile }: { profile: StudentProfile }) {
  const { t } = useI18n();
  return <Card className="p-5"><PageHeader title={t("Recognition & discipline register")} description={t("Both encouraging and corrective entries, in a constructive tone.")} /><div className="mt-4 space-y-3">{profile.discipline.length ? profile.discipline.map((d) => <div key={d.id} className={cn("flex gap-3 rounded-xl border p-4", isDisciplinePositive(d.type) ? "border-emerald-100 dark:border-emerald-500/20" : "border-amber-100 dark:border-amber-500/20")}><Award className={cn("mt-0.5 h-5 w-5 shrink-0", isDisciplinePositive(d.type) ? "text-emerald-500" : "text-amber-500")} /><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold text-slate-900 dark:text-white">{t(DISCIPLINE_TYPE_LABELS[d.type] ?? d.type)}</span><StatusBadge tone={isDisciplinePositive(d.type) ? "positive" : d.status === "CLOSED" ? "neutral" : "watch"}>{t(DISCIPLINE_STATUS_LABELS[d.status] ?? d.status)}</StatusBadge></div><div className="mt-1 text-sm text-slate-700 dark:text-slate-200">{d.title}</div>{d.description ? <p className="mt-0.5 text-xs text-slate-500">{d.description}</p> : null}</div><div className="shrink-0 text-xs text-slate-400">{d.decidedAt}</div></div>) : <Empty text={t("No entries yet")} />}</div></Card>;
}

function PlansTab({ profile }: { profile: StudentProfile }) {
  const { t } = useI18n();
  return <Card className="p-5"><PageHeader title={t("Learning plans")} description={t("PAI, PAP, PPS and AESH arrangements.")} /><div className="mt-4 space-y-4">{profile.plans.length ? profile.plans.map((p) => <div key={p.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800"><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><span className="rounded-lg bg-primary-50 px-2 py-1 text-xs font-bold text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">{t((LEARNING_PLAN_TYPE_LABELS[p.type] ?? p.type).split(" — ")[0])}</span><span className="text-sm font-semibold text-slate-900 dark:text-white">{p.title}</span></div><StatusBadge tone={p.status === "ACTIVE" ? "positive" : "neutral"}>{t(LEARNING_PLAN_STATUS_LABELS[p.status] ?? p.status)}</StatusBadge></div>{p.description ? <p className="mt-2 text-xs text-slate-500">{p.description}</p> : null}{p.assignedTo ? <p className="mt-1 text-xs text-slate-500">{t("Assigned to")}: {p.assignedTo}</p> : null}<div className="mt-3 flex flex-wrap gap-1.5">{p.accommodations.map((a) => <span key={a} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">{a}</span>)}</div><div className="mt-3 text-[11px] text-slate-400">{p.startDate}{p.endDate ? ` → ${p.endDate}` : ""}</div></div>) : <Empty text={t("No plans yet")} />}</div></Card>;
}

function MeetingsTab({ profile }: { profile: StudentProfile }) {
  const { t } = useI18n();
  return <Card className="p-5"><PageHeader title={t("Parent meetings")} description={t("Meetings with the family and the class team.")} /><div className="mt-4 space-y-4">{profile.meetings.length ? profile.meetings.map((mtg) => <div key={mtg.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800"><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><CalendarCheck className="h-4 w-4 text-primary-500" /><span className="text-sm font-semibold text-slate-900 dark:text-white">{mtg.title}</span></div><div className="flex items-center gap-2"><span className="text-xs text-slate-400">{mtg.date}</span><StatusBadge tone={mtg.status === "DONE" ? "positive" : mtg.status === "CANCELLED" ? "neutral" : "watch"}>{t(MEETING_STATUS_LABELS[mtg.status] ?? mtg.status)}</StatusBadge></div></div>{mtg.participants ? <div className="mt-1 text-xs text-slate-500">{t("Participants")}: {mtg.participants}</div> : null}<div className="mt-2 grid gap-2 text-xs lg:grid-cols-2">{mtg.agenda ? <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900"><span className="font-semibold">{t("Agenda")}: </span>{mtg.agenda}</div> : null}{mtg.minutes ? <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900"><span className="font-semibold">{t("Minutes")}: </span>{mtg.minutes}</div> : null}{mtg.decisions ? <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-500/10"><span className="font-semibold">{t("Decisions")}: </span>{mtg.decisions}</div> : null}{mtg.followUp ? <div className="rounded-lg bg-sky-50 p-3 dark:bg-sky-500/10"><span className="font-semibold">{t("Follow-up")}: </span>{mtg.followUp}</div> : null}</div></div>) : <Empty text={t("No meetings yet")} />}</div></Card>;
}

function DailyTrackingTab({ profile }: { profile: StudentProfile }) {
  const { t } = useI18n();
  return <Card className="p-5"><PageHeader title={t("Recent daily tracking")} description={t("By-exception entries: only criteria that deviated from expectations are recorded (1–2 flagged, 5 excellent).")} /><div className="mt-4 overflow-x-auto">{profile.dailyRatings.length ? <table className="w-full min-w-[560px] text-sm"><thead><tr className="border-b border-slate-100 text-left text-xs text-slate-500 dark:border-slate-800"><th className="pb-2 pr-4 font-semibold">{t("Date")}</th>{profile.dailyRatings[0]?.criteria.map((c) => <th key={c.code} className="pb-2 pr-4 font-semibold">{t(DAILY_RATING_LABELS[c.code] ?? c.code)}</th>)}<th className="pb-2 font-semibold">{t("Note")}</th></tr></thead><tbody>{profile.dailyRatings.map((r, index) => <tr key={`${r.date}-${index}`} className="border-b border-slate-50 dark:border-slate-800/60"><td className="py-3 pr-4 whitespace-nowrap text-xs text-slate-500">{r.date}</td>{r.criteria.map((c) => <td key={c.code} className="py-3 pr-4"><span className={cn("inline-grid h-6 w-6 place-items-center rounded text-[11px] font-bold", c.value <= 2 ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300" : c.value === 5 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300")}>{c.value}</span></td>)}<td className="py-3 text-xs text-slate-500">{r.note ?? "–"}</td></tr>)}</tbody></table> : <Empty text={t("No exceptions recorded — everything on track")} />}</div></Card>;
}
