"use client";

import { LocalizedLink as Link } from "@/i18n/provider";
import { useState } from "react";
import { BookOpen, ChevronRight, GraduationCap, Mail, School, Search, Users } from "lucide-react";
import { FilterBar, MetricCard, PageHeader, ProgressBar, StatusBadge, StudentAvatar } from "@/components/demo-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/provider";
import { AdminAccountsPanel, AdminClassesPanel, AdminEstablishmentsPanel, AdminParentsPanel, AdminStudentsPanel, AdminTeachersPanel } from "@/components/admin-panels";
import type { AdminPanelsData } from "@/lib/admin/panels-data";import type { ChildCard, ClassCard, SchoolOverview, StudentRosterEntry, TeacherEntry } from "@/lib/students/service";

const SIGNAL_TONE = { POSITIVE: "positive", STABLE: "neutral", WATCH: "watch", ATTENTION: "attention" } as const;
const SIGNAL_LABEL = {
  POSITIVE: "Positive progress",
  STABLE: "Stable",
  WATCH: "Watch",
  ATTENTION: "Action suggested",
} as const;

function signalTone(signal: string): "positive" | "neutral" | "watch" | "attention" {
  return SIGNAL_TONE[signal as keyof typeof SIGNAL_TONE] ?? "neutral";
}

function signalLabel(signal: string) {
  return SIGNAL_LABEL[signal as keyof typeof SIGNAL_LABEL] ?? "Stable";
}

// ---------------------------------------------------------------------------
// Students directory
// ---------------------------------------------------------------------------

export function StudentsPage({ students, admin }: { students: StudentRosterEntry[]; admin?: AdminPanelsData }) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const visible = students.filter((student) => {
    const matchesQuery = `${student.name} ${student.className} ${student.studentNumber}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesStatus = status === "All" || signalLabel(student.signal) === status;
    return matchesQuery && matchesStatus;
  });
  const attentionCount = students.filter((s) => s.signal === "ATTENTION").length;
  const avgAcademic = students.length ? Math.round(students.reduce((sum, s) => sum + s.academic, 0) / students.length) : 0;
  const avgAttendance = students.length ? Math.round(students.reduce((sum, s) => sum + s.attendance, 0) / students.length) : 0;

  const canManage = Boolean(admin?.canManage);

  return (
    <div className="space-y-6">
      <PageHeader title={t("Students")} description={t("Search the school roster and open a complete Student 360 profile.")} />
      {canManage ? (
        <div className="space-y-4">
          <AdminStudentsPanel classes={admin!.classes} students={admin!.students} />
          <AdminParentsPanel students={admin!.students} />
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t("Students")} value={students.length} detail={t("Active roster")} icon={Users} />
        <MetricCard label={t("Academic average")} value={`${avgAcademic}%`} detail={t("Across the roster")} icon={GraduationCap} tone="sky" />
        <MetricCard label={t("Attendance")} value={`${avgAttendance}%`} detail={t("School average")} tone="amber" />
        <MetricCard label={t("Need attention")} value={attentionCount} detail={t("Students flagged for follow-up")} icon={BookOpen} tone="violet" />
      </div>
      <FilterBar placeholder={t("Search by name, class or student number")} filters={["All", "Positive progress", "Stable", "Watch", "Action suggested"]} query={query} onQueryChange={setQuery} active={status} onActiveChange={setStatus} />
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800"><div><h3 className="font-bold text-slate-950 dark:text-white">{t("Students")}</h3><p className="text-xs text-slate-500">{visible.length} {t("Students").toLowerCase()}</p></div></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-900"><tr><th className="px-4 py-3">{t("Student")}</th><th className="px-4 py-3">{t("Academic")}</th><th className="px-4 py-3">{t("Homework")}</th><th className="px-4 py-3">{t("Attendance")}</th><th className="px-4 py-3">{t("Signal")}</th><th /></tr></thead>
            <tbody>{visible.map((student) => (
              <tr key={student.id} className="border-t border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/60">
                <td className="px-4 py-3"><div className="flex items-center gap-3"><StudentAvatar student={student} /><div><div className="font-semibold text-slate-900 dark:text-white">{student.name}</div><div className="text-xs text-slate-500">{student.className} · {student.studentNumber}</div></div></div></td>
                <td className="px-4 py-3 font-semibold">{student.academic}%</td>
                <td className="px-4 py-3">{student.homework}%</td>
                <td className="px-4 py-3">{student.attendance}%</td>
                <td className="px-4 py-3"><StatusBadge tone={signalTone(student.signal)}>{t(signalLabel(student.signal))}</StatusBadge></td>
                <td className="px-4 py-3"><Link href={`/students/${student.id}`} className="inline-flex items-center text-xs font-semibold text-primary-600 hover:underline">{t("Open")} <ChevronRight className="h-3.5 w-3.5" /></Link></td>
              </tr>
            ))}</tbody>
          </table>
          {!visible.length ? <p className="p-8 text-center text-sm text-slate-500">{t("No students match your search")}</p> : null}
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Classes directory
// ---------------------------------------------------------------------------

export function ClassesPage({ classes, admin }: { classes: ClassCard[]; admin?: AdminPanelsData }) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState("All grades");
  const visible = classes.filter((item) => {
    const matchesGrade = grade === "All grades" || item.gradeLevel === grade;
    const matchesQuery = `${item.name} ${item.teacherName} ${item.room ?? ""}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesGrade && matchesQuery;
  });
  const studentCount = classes.reduce((sum, c) => sum + c.studentCount, 0);
  const avgAttendance = classes.length ? Math.round(classes.reduce((sum, c) => sum + c.attendance, 0) / classes.length) : 0;
  const avgEngagement = classes.length ? Math.round(classes.reduce((sum, c) => sum + c.engagement, 0) / classes.length) : 0;
  const canManage = Boolean(admin?.canManage);

  return (
    <div className="space-y-6">
      <PageHeader title={t("Classes")} description={t("Browse every class, compare key indicators and open the visual student squad.")} />
      {canManage ? <AdminClassesPanel teachers={admin!.teachers} assignments={admin!.assignments} /> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t("Active classes")} value={classes.length} detail={t("Grades 7 to 9")} icon={School} />
        <MetricCard label={t("Students")} value={studentCount} detail={t("Across active classes")} icon={Users} tone="sky" />
        <MetricCard label={t("Attendance")} value={`${avgAttendance}%`} detail={t("Class average")} icon={BookOpen} />
        <MetricCard label={t("Engagement")} value={`${avgEngagement}%`} detail={t("Observed average")} tone="amber" />
      </div>
      <FilterBar placeholder={t("Search by class, teacher or room")} filters={["All grades", "Grade 7", "Grade 8", "Grade 9"]} query={query} onQueryChange={setQuery} active={grade} onActiveChange={setGrade} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((item) => (
          <Link key={item.id} href={`/classes/${item.id}`}>
            <Card className="group h-full p-5 transition hover:-translate-y-0.5 hover:border-primary-200">
              <div className="flex items-start justify-between"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/10"><School className="h-5 w-5" /></div><StatusBadge tone={item.trend > 1 ? "positive" : item.trend < 0 ? "watch" : "neutral"}>{item.trend > 0 ? `+${item.trend} ${t("pts")}` : item.trend < 0 ? `${item.trend} ${t("pts")}` : t("Stable")}</StatusBadge></div>
              <h2 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">{item.name}</h2>
              <p className="text-sm text-slate-500">{t(item.gradeLevel)}{item.room ? <> · {t("Room")} {item.room}</> : null}</p>
              <div className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">{item.teacherName || t("No homeroom teacher")}</div>
              <div className="mt-5 space-y-3"><ProgressBar label={t("Attendance")} value={item.attendance} tone="sky" /><ProgressBar label={t("Homework")} value={item.homework} /><ProgressBar label={t("Engagement")} value={item.engagement} tone="amber" /></div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm dark:border-slate-800"><span className="text-slate-500">{item.studentCount} {t("Students").toLowerCase()}</span><span className="inline-flex items-center font-semibold text-primary-600">{t("Open squad")} <ChevronRight className="h-4 w-4" /></span></div>
            </Card>
          </Link>
        ))}
      </div>
      {!visible.length ? <p className="p-8 text-center text-sm text-slate-500">{t("No classes match your search")}</p> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Teachers directory
// ---------------------------------------------------------------------------

export function TeachersPage({ teachers, admin }: { teachers: TeacherEntry[]; admin?: AdminPanelsData }) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const visible = teachers.filter((teacher) => `${teacher.name} ${teacher.title} ${teacher.email} ${teacher.classNames.join(" ")} ${teacher.specialties.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()));
  const homeroomCount = teachers.filter((teacher) => teacher.isHomeroom).length;
  const totalAssignments = teachers.reduce((sum, teacher) => sum + teacher.classCount, 0);
  const canManage = Boolean(admin?.canManage);

  return (
    <div className="space-y-6">
      <PageHeader title={t("Teachers")} description={t("Staff directory, class assignments and teaching load.")} />
      {canManage ? <AdminTeachersPanel classes={admin!.classes} teachers={admin!.teachers} subjects={admin!.subjects} /> : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label={t("Teachers")} value={teachers.length} detail={t("All active")} icon={GraduationCap} />
        <MetricCard label={t("Homeroom teachers")} value={homeroomCount} detail={t("One per class")} icon={Users} tone="sky" />
        <MetricCard label={t("Class assignments")} value={totalAssignments} detail={t("Across all teachers")} icon={School} tone="amber" />
      </div>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold">{t("Staff directory")}</h2><p className="text-xs text-slate-500">{teachers.length} {t("active teaching staff")}</p></div><div className="relative"><Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-slate-50 ps-9 pe-3 text-sm dark:border-slate-800 dark:bg-slate-900" placeholder={t("Search teacher")} /></div></div>
        <div className="grid md:grid-cols-2">
          {visible.map((teacher) => (
            <div key={teacher.id} className="flex items-center gap-4 border-b border-r border-slate-100 p-4 dark:border-slate-800">
              <StudentAvatar student={teacher} />
              <div className="min-w-0 flex-1"><div className="font-semibold text-slate-900 dark:text-white">{teacher.title} {teacher.name}</div><div className="text-xs text-slate-500">{teacher.specialties.length ? teacher.specialties.join(" · ") : t("General")} · {teacher.classNames.join(", ") || t("No classes")}</div></div>
              <div className="text-right"><div className="text-sm font-bold">{teacher.classCount}</div><div className="text-[10px] text-slate-400">{teacher.classCount > 1 ? t("classes") : t("class")}</div></div>
              {teacher.email ? <Button size="icon" variant="ghost" title={teacher.email} asChild><a href={`mailto:${teacher.email}`}><Mail className="h-4 w-4" /></a></Button> : null}
            </div>
          ))}
        </div>
        {!visible.length ? <p className="p-8 text-center text-sm text-slate-500">{t("No teachers match your search")}</p> : null}
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Parent children
// ---------------------------------------------------------------------------

export function ChildrenPage({ children }: { children: ChildCard[] }) {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <PageHeader title={t("My children")} description={t("A calm, practical overview of what matters today.")} />
      {!children.length ? <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700">{t("No children linked to your account")}</p> : null}
      <div className="grid gap-5 lg:grid-cols-2">
        {children.map((child) => (
          <Card key={child.id} className="p-5">
            <div className="flex items-center gap-4">
              <StudentAvatar student={child} size="lg" />
              <div className="flex-1"><h2 className="text-lg font-bold text-slate-950 dark:text-white">{child.name}</h2><p className="text-sm text-slate-500">{child.className} · {child.presentToday ? t("Present today") : t("No attendance record yet today")}</p></div>
              <StatusBadge tone={signalTone(child.signal)}>{t(signalLabel(child.signal))}</StatusBadge>
            </div>
            <div className="mt-5 grid grid-cols-4 gap-3 text-center">
              {[["Homework", `${child.homework}%`], ["Attendance", `${child.attendance}%`], ["Academic", `${child.academic}%`], ["Progress", child.trend === "UP" ? t("Improving") : child.trend === "DOWN" ? t("Lower") : t("Stable")]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900"><div className="font-bold text-slate-900 dark:text-white">{value}</div><div className="text-[10px] text-slate-500">{t(label)}</div></div>)}
            </div>
            <div className="mt-4 flex gap-2">
              <Button className="flex-1" asChild><Link href={`/students/${child.id}`}>{t("View profile")}</Link></Button>
              <Button variant="outline" asChild><Link href="/messages">{t("Message teacher")}</Link></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// School overview
// ---------------------------------------------------------------------------

export function SchoolPage({ overview, admin }: { overview: SchoolOverview; admin?: AdminPanelsData }) {
  const { t } = useI18n();
  const canManage = Boolean(admin?.canManage);
  return (
    <div className="space-y-6">
      <PageHeader title={t(overview.schoolName)} description={t("School overview") + (overview.city ? ` · ${overview.city}` : "") + ` · ${overview.country}`} />
      {canManage ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <AdminEstablishmentsPanel />
          <AdminAccountsPanel classes={admin!.classes} students={admin!.students} />
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t("Students")} value={overview.students} detail={t("Active students")} icon={Users} />
        <MetricCard label={t("Teachers")} value={overview.teachers} detail={t("Active teaching staff")} icon={GraduationCap} tone="sky" />
        <MetricCard label={t("Present today")} value={overview.attendanceToday} detail={t("Attendance records today")} icon={BookOpen} />
        <MetricCard label={t("Open support plans")} value={overview.openSupportPlans} detail={t("Active learning plans")} icon={Users} tone="amber" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          <h2 className="font-bold">{t("Grades and classes")}</h2>
          <p className="text-xs text-slate-500">{t("Drill down from school to student")}</p>
          <div className="mt-4 space-y-3">
            {overview.grades.filter((grade) => grade.classes.length).map((grade) => (
              <div key={grade.gradeLevel} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
                <div className="mb-3 flex justify-between"><div><div className="font-bold">{t(grade.gradeLevel)}</div><div className="text-xs text-slate-500">{grade.students} {t("Students").toLowerCase()}</div></div><StatusBadge tone="neutral">{grade.classes.length} {grade.classes.length > 1 ? t("classes") : t("class")}</StatusBadge></div>
                <div className="grid grid-cols-2 gap-3">
                  {grade.classes.map((schoolClass) => (
                    <Link key={schoolClass.id} href={`/classes/${schoolClass.id}`} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
                      <div className="flex justify-between"><span className="font-semibold text-slate-900 dark:text-white">{schoolClass.name}</span><ChevronRight className="h-4 w-4 text-slate-400" /></div>
                      <div className="mt-1 text-xs text-slate-500">{schoolClass.studentCount} {t("Students").toLowerCase()} · {schoolClass.attendance}% {t("attendance").toLowerCase()}</div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-bold">{t("School pulse")}</h2>
            <p className="text-xs text-slate-500">{t("Activity over the last seven days")}</p>
            <div className="mt-5 space-y-5">
              <div className="flex items-center justify-between"><span className="text-sm text-slate-600 dark:text-slate-300">{t("Check-ins today")}</span><span className="text-lg font-bold text-slate-900 dark:text-white">{overview.checkInsToday}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-slate-600 dark:text-slate-300">{t("Homework submissions")}</span><span className="text-lg font-bold text-slate-900 dark:text-white">{overview.homeworkDone7d}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-slate-600 dark:text-slate-300">{t("Teacher observations")}</span><span className="text-lg font-bold text-slate-900 dark:text-white">{overview.observations7d}</span></div>
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="font-bold">{t("Privacy by design")}</h2>
            <p className="mt-1 text-xs text-slate-500">{t("High-level views avoid exposing sensitive individual wellbeing entries.")}</p>
            <Button className="mt-4 w-full" variant="outline" asChild><Link href="/configuration">{t("School settings")}</Link></Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
