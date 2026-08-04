"use client";

import { LocalizedLink as Link } from "@/i18n/provider";
import { useState } from "react";
import { BookOpen, Building2, ChevronRight, GraduationCap, Mail, Plus, School, Search, Users } from "lucide-react";
import { ActionButton, FilterBar, MetricCard, PageHeader, ProgressBar, StatusBadge, StudentTable } from "@/components/demo-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { demoClasses, demoStudents } from "@/lib/demo-data";
import { useI18n } from "@/i18n/provider";

export function ClassesPageDemo() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState("All grades");
  const visibleClasses = demoClasses.filter((item) => {
    const matchesGrade = grade === "All grades" || item.name.startsWith(grade);
    const matchesQuery = `${item.name} ${item.teacher} ${item.room}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesGrade && matchesQuery;
  });
  return (
    <div className="space-y-6">
      <PageHeader title={t("Classes")} description={t("Browse every class, compare key indicators and open the visual student squad.")} actions={<ActionButton label={t("Add class")} title={t("Create a class")}><FormFields fields={["Class name", "Grade level", "Room", "Homeroom teacher"]} /></ActionButton>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t("Active classes")} value={6} detail={t("Grades 7 to 9")} icon={School} />
        <MetricCard label={t("Students")} value={147} detail={t("24.5 average class size")} icon={Users} tone="sky" />
        <MetricCard label={t("Attendance")} value="94.2%" detail={t("School average today")} trend={0.8} />
        <MetricCard label={t("Engagement")} value="77%" detail={t("Up over six weeks")} trend={4} tone="amber" />
      </div>
      <FilterBar placeholder={t("Search by class, teacher or room")} filters={["All grades", "Grade 7", "Grade 8", "Grade 9"]} query={query} onQueryChange={setQuery} active={grade} onActiveChange={setGrade} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleClasses.map((item) => (
          <Link key={item.id} href={`/classes/${item.id}`}>
            <Card className="group h-full p-5 transition hover:-translate-y-0.5 hover:border-primary-200">
              <div className="flex items-start justify-between"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/10"><School className="h-5 w-5" /></div><StatusBadge tone={item.trend > 1 ? "positive" : item.trend < 0 ? "watch" : "neutral"}>{item.trend > 0 ? `+${item.trend} ${t("pts")}` : t("Stable")}</StatusBadge></div>
              <h2 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">{item.name}</h2>
              <p className="text-sm text-slate-500">{item.teacher} · {t("Room")} {item.room}</p>
              <div className="mt-5 space-y-3"><ProgressBar label={t("Attendance")} value={item.attendance} tone="sky" /><ProgressBar label={t("Homework")} value={item.homework} /><ProgressBar label={t("Engagement")} value={item.engagement} tone="amber" /></div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm dark:border-slate-800"><span className="text-slate-500">{item.students} {t("students")}</span><span className="inline-flex items-center font-semibold text-primary-600">{t("Open squad")} <ChevronRight className="h-4 w-4" /></span></div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function StudentsPageDemo() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const visibleStudents = demoStudents.filter((student) => {
    const matchesQuery = `${student.name} ${student.className} ${student.headline}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesStatus = status === "All" || (status === "Positive progress" ? student.status === "POSITIVE" : status === "Stable" ? student.status === "STABLE" : status === "Watch" ? student.status === "WATCH" : student.status === "ATTENTION");
    return matchesQuery && matchesStatus;
  });
  return (
    <div className="space-y-6">
      <PageHeader title={t("Students")} description={t("Search the school roster and open a complete Student 360 profile.")} actions={<ActionButton label={t("Add student")} title={t("Add a student")}><FormFields fields={["First name", "Last name", "Class", "Student number"]} /></ActionButton>} />
      <FilterBar placeholder={t("Search by name, class or student number")} filters={["All", "Positive progress", "Stable", "Watch", "Action suggested"]} query={query} onQueryChange={setQuery} active={status} onActiveChange={setStatus} />
      <StudentTable students={visibleStudents} />
    </div>
  );
}

const teachers = [
  ["Amina Martin", "Mathematics", "Grade 8B", "6 classes", "96%"],
  ["Omar Idrissi", "Mathematics", "Grade 7A", "5 classes", "92%"],
  ["Salma El Amrani", "French", "Grade 7B", "6 classes", "89%"],
  ["Yassine Alaoui", "Science", "Grade 8A", "5 classes", "94%"],
  ["Leila Haddad", "History", "Grade 9A", "4 classes", "91%"],
  ["Karim Mansouri", "English", "Grade 9B", "6 classes", "87%"],
  ["Nadia Bennis", "Arabic", "Grade 8B", "5 classes", "93%"],
  ["Rachid Saadi", "Physical Education", "Grade 7A", "6 classes", "85%"],
];

export function TeachersPageDemo() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  return (
    <div className="space-y-6">
      <PageHeader title={t("Teachers")} description={t("Staff directory, class assignments and activity completion.")} actions={<ActionButton label={t("Invite teacher")} title={t("Invite a teacher")}><FormFields fields={["Email", "First name", "Last name", "Subject"]} /></ActionButton>} />
      <div className="grid gap-4 sm:grid-cols-3"><MetricCard label={t("Teachers")} value={12} detail={t("All active")} icon={GraduationCap} /><MetricCard label={t("Homeroom teachers")} value={6} detail={t("One per class")} icon={Users} tone="sky" /><MetricCard label={t("Data completion")} value="91%" detail={t("Attendance and observations")} trend={3} tone="amber" /></div>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold">{t("Staff directory")}</h2><p className="text-xs text-slate-500">{t("12 active teaching staff")}</p></div><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm dark:border-slate-800 dark:bg-slate-900" placeholder={t("Search teacher")} /></div></div>
        <div className="grid md:grid-cols-2">{teachers.filter((teacher) => teacher.join(" ").toLowerCase().includes(query.toLowerCase())).map((teacher, index) => <div key={teacher[0]} className="flex items-center gap-4 border-b border-r border-slate-100 p-4 dark:border-slate-800"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-600 text-xs font-bold text-white">{teacher[0].split(" ").map((part) => part[0]).join("")}</div><div className="min-w-0 flex-1"><div className="font-semibold">{teacher[0]}</div><div className="text-xs text-slate-500">{t(teacher[1])} · {t(teacher[2])}</div></div><div className="text-right"><div className="text-sm font-bold">{teacher[4]}</div><div className="text-[10px] text-slate-400">{t("completion")}</div></div><Button size="icon" variant="ghost"><Mail className="h-4 w-4" /></Button></div>)}</div>
      </Card>
    </div>
  );
}

export function SchoolPageDemo() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <PageHeader title={t("Greenwood International School")} description={t("School overview · Casablanca campus · Academic year 2025–2026")} actions={<Button variant="outline" asChild><Link href="/configuration">{t("School settings")}</Link></Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label={t("Students")} value={147} detail={t("6 active classes")} icon={Users} /><MetricCard label={t("Teachers")} value={12} detail={t("9 subject areas")} icon={GraduationCap} tone="sky" /><MetricCard label={t("Parent engagement")} value="82%" detail={t("Active in last 30 days")} trend={5} tone="amber" /><MetricCard label={t("Open support plans")} value={8} detail={t("3 due for review")} icon={BookOpen} tone="violet" /></div>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="p-5"><h2 className="font-bold">{t("Grades and classes")}</h2><p className="text-xs text-slate-500">{t("Drill down from school to student")}</p><div className="mt-4 space-y-3">{["Grade 7", "Grade 8", "Grade 9"].map((grade, gradeIndex) => <div key={grade} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800"><div className="mb-3 flex justify-between"><div><div className="font-bold">{t(grade)}</div><div className="text-xs text-slate-500">{gradeIndex === 1 ? 50 : 49} {t("students")}</div></div><StatusBadge tone={gradeIndex === 1 ? "positive" : "neutral"}>{gradeIndex === 1 ? t("Improving") : t("Stable")}</StatusBadge></div><div className="grid grid-cols-2 gap-3">{demoClasses.slice(gradeIndex * 2, gradeIndex * 2 + 2).map((schoolClass) => <Link key={schoolClass.id} href={`/classes/${schoolClass.id}`} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900"><div className="flex justify-between"><span className="font-semibold">{schoolClass.name}</span><ChevronRight className="h-4 w-4" /></div><div className="mt-1 text-xs text-slate-500">{schoolClass.students} {t("students")} · {schoolClass.attendance}% {t("attendance")}</div></Link>)}</div></div>)}</div></Card>
        <Card className="p-5"><h2 className="font-bold">{t("Data completion")}</h2><p className="text-xs text-slate-500">{t("This week across all classes")}</p><div className="mt-5 space-y-5"><ProgressBar label={t("Attendance entered")} value={98} tone="sky" /><ProgressBar label={t("Student check-ins")} value={82} /><ProgressBar label={t("Homework updates")} value={91} tone="amber" /><ProgressBar label={t("Teacher observations")} value={76} /></div><div className="mt-6 rounded-2xl bg-primary-50 p-4 dark:bg-primary-500/5"><div className="text-sm font-bold text-primary-800 dark:text-primary-300">{t("Privacy by design")}</div><p className="mt-1 text-xs text-primary-700 dark:text-primary-400">{t("High-level views avoid exposing sensitive individual wellbeing entries.")}</p></div></Card>
      </div>
    </div>
  );
}

export function ChildrenPageDemo() {
  const { t } = useI18n();
  const children = [demoStudents[0], demoStudents[4]];
  return (
    <div className="space-y-6">
      <PageHeader title={t("My children")} description={t("A calm, practical overview of what matters today.")} />
      <div className="grid gap-5 lg:grid-cols-2">{children.map((student) => <Card key={student.id} className="p-5"><div className="flex items-center gap-4"><div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 font-bold text-white">{student.initials}</div><div className="flex-1"><h2 className="text-lg font-bold">{student.name}</h2><p className="text-sm text-slate-500">{t(student.className)} · {t("Present today")}</p></div><StatusBadge tone="positive">{t("Doing well")}</StatusBadge></div><div className="mt-5 grid grid-cols-3 gap-3 text-center">{[["Homework", `${student.homework}%`], ["Attendance", `${student.attendance}%`], ["Progress", student.trend === "UP" ? t("Improving") : t("Stable")]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900"><div className="font-bold">{value}</div><div className="text-[10px] text-slate-500">{t(label)}</div></div>)}</div><div className="mt-4 flex gap-2"><Button className="flex-1" asChild><Link href={`/students/${student.id}`}>{t("View profile")}</Link></Button><Button variant="outline" asChild><Link href="/messages">{t("Message teacher")}</Link></Button></div></Card>)}</div>
    </div>
  );
}

export function PlatformDirectoryDemo({ type }: { type: "schools" | "users" }) {
  const { t } = useI18n();
  const isSchools = type === "schools";
  return (
    <div className="space-y-6">
      <PageHeader title={t(isSchools ? "Schools" : "Users")} description={t(isSchools ? "Multi-tenant platform health and subscription management." : "Platform-wide user directory and access overview.")} actions={<ActionButton label={t(isSchools ? "Add school" : "Invite user")} title={t(isSchools ? "Add a school tenant" : "Invite a platform user")}><FormFields fields={isSchools ? ["School name", "Country", "Plan", "Administrator email"] : ["Email", "Name", "Role", "School"]} /></ActionButton>} />
      <div className="grid gap-4 sm:grid-cols-3"><MetricCard label={t(isSchools ? "Active schools" : "Total users")} value={isSchools ? 1 : 430} detail={t("Demo environment")} icon={isSchools ? Building2 : Users} /><MetricCard label={t("Active this month")} value={isSchools ? "100%" : "87%"} detail={t("Healthy adoption")} trend={4} tone="sky" /><MetricCard label={t(isSchools ? "Seats used" : "Pending invites")} value={isSchools ? "430 / 2,000" : 12} detail={t("Within plan limits")} tone="amber" /></div>
      <FilterBar placeholder={t(isSchools ? "Search schools" : "Search name, email or role")} filters={isSchools ? ["All", "Active", "Trial", "Suspended"] : ["All", "Student", "Teacher", "Parent", "Admin"]} />
      <Card className="p-5"><div className="flex items-center gap-4 rounded-2xl border border-slate-100 p-5 dark:border-slate-800"><div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10">{isSchools ? <Building2 className="h-5 w-5" /> : <Users className="h-5 w-5" />}</div><div className="flex-1"><div className="font-bold">{t(isSchools ? "Greenwood International School" : "Nadia Bennani")}</div><div className="text-sm text-slate-500">{t(isSchools ? "Casablanca, Morocco · PRO plan" : "Principal · Greenwood International School")}</div></div><StatusBadge tone="positive">{t("Active")}</StatusBadge><Button variant="outline" asChild><Link href={isSchools ? "/school" : "/configuration"}>{t("Manage")}</Link></Button></div></Card>
    </div>
  );
}

function FormFields({ fields }: { fields: string[] }) {
  const { t } = useI18n();
  return <div className="space-y-3">{fields.map((field) => <label key={field} className="block text-sm font-medium text-slate-700 dark:text-slate-200">{t(field)}<input className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900" placeholder={t(field)} /></label>)}</div>;
}
