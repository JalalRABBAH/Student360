"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Building2, CalendarDays, Loader2, Pencil, Plus, Trash2, UserCog, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n/provider";
import { ROLE_LABELS } from "@/lib/domain/enums";

export type AdminClassOption = { id: string; name: string };
export type AdminStudentOption = { id: string; name: string };
export type AdminTeacherOption = { id: string; name: string };
export type AdminSubjectOption = { id: string; name: string; code: string };
export type AssignmentRow = { id: string; className: string; teacherName: string; subjectName: string | null; role: string; isHomeroom: boolean };
export type TimetableSlotRow = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subjectName: string | null;
  teacherName: string | null;
  room: string | null;
};

async function send(url: string, method: string, body?: unknown) {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  return res.json().catch(() => ({}));
}

const inputClass = "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100";

function CredentialBox({ title, accounts }: { title: string; accounts: { name: string; email: string; password: string }[] }) {
  const { t } = useI18n();
  if (!accounts.length) return null;
  return (
    <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs dark:border-emerald-500/30 dark:bg-emerald-500/10">
      <div className="font-semibold text-emerald-700 dark:text-emerald-300">{title}</div>
      <p className="mt-1 text-emerald-700/70 dark:text-emerald-300/70">{t("Temporary passwords — share them once. Each person will change theirs at first login.")}</p>
      <div className="mt-2 space-y-1 font-mono">
        {accounts.map((a) => <div key={a.email} className="text-emerald-700 dark:text-emerald-300">{a.name} · {a.email} · {a.password}</div>)}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create student (+ linked guardians) & create/link parents
// ---------------------------------------------------------------------------

export function AdminStudentsPanel({ classes, students }: { classes: AdminClassOption[]; students: AdminStudentOption[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ name: string; email: string; password: string }[]>([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [classId, setClassId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [guardians, setGuardians] = useState<{ firstName: string; lastName: string; email: string; relationship: string }[]>([{ firstName: "", lastName: "", email: "", relationship: "PARENT" }]);

  async function submit() {
    setBusy(true); setError(null); setResult([]);
    const data = await send("/api/admin/students", "POST", {
      firstName, lastName, email, classId: classId || null, dateOfBirth: dateOfBirth || null,
      guardians: guardians.filter((g) => g.email.trim()),
    });
    setBusy(false);
    if (data.ok) {
      const accounts = [{ name: `${data.firstName} ${data.lastName}`, email: data.email, password: data.temporaryPassword }];
      for (const g of data.guardians ?? []) accounts.push({ name: `${g.firstName} ${g.lastName}`, email: g.email, password: g.temporaryPassword });
      setResult(accounts);
      setFirstName(""); setLastName(""); setEmail(""); setClassId(""); setDateOfBirth("");
      setGuardians([{ firstName: "", lastName: "", email: "", relationship: "PARENT" }]);
      router.refresh();
    } else {
      setError(data.code === "EMAIL_TAKEN" ? "Email already used" : "Could not create the student");
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10"><UserPlus className="h-5 w-5" /></div><div><h2 className="font-bold">{t("Add a student")}</h2><p className="text-xs text-slate-500">{t("Creates the student account and optionally their parents.")}</p></div></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div><Label>{t("First name")}</Label><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
        <div><Label>{t("Last name")}</Label><Input value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
        <div><Label>{t("Email")}</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@school.com" /></div>
        <div><Label>{t("Class")}</Label>
          <select value={classId} onChange={(e) => setClassId(e.target.value)} className={inputClass}><option value="">{t("No class yet")}</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><Label>{t("Date of birth")}</Label><Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} /></div>
      </div>
      <div className="mt-4">
        <div className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">{t("Parents / guardians")}</div>
        <div className="space-y-2">
          {guardians.map((g, i) => (
            <div key={i} className="flex flex-col gap-2 sm:flex-row">
              <Input placeholder={t("First name")} value={g.firstName} onChange={(e) => setGuardians((list) => list.map((x, j) => j === i ? { ...x, firstName: e.target.value } : x))} />
              <Input placeholder={t("Last name")} value={g.lastName} onChange={(e) => setGuardians((list) => list.map((x, j) => j === i ? { ...x, lastName: e.target.value } : x))} />
              <Input placeholder={t("Email")} value={g.email} onChange={(e) => setGuardians((list) => list.map((x, j) => j === i ? { ...x, email: e.target.value } : x))} />
              <select value={g.relationship} onChange={(e) => setGuardians((list) => list.map((x, j) => j === i ? { ...x, relationship: e.target.value } : x))} className={inputClass + " sm:w-40"}>
                <option value="PARENT">Parent</option><option value="MOTHER">Mother</option><option value="FATHER">Father</option><option value="GUARDIAN">Guardian</option>
              </select>
              {guardians.length > 1 ? <Button size="icon" variant="ghost" onClick={() => setGuardians((list) => list.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button> : null}
            </div>
          ))}
        </div>
        <Button size="sm" variant="ghost" className="mt-2" onClick={() => setGuardians((list) => [...list, { firstName: "", lastName: "", email: "", relationship: "PARENT" }])}><Plus className="h-4 w-4" /> {t("Add guardian")}</Button>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button onClick={submit} disabled={busy || !firstName.trim() || !lastName.trim() || !email.trim()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {t("Create student")}</Button>
        {error ? <span className="text-xs font-medium text-rose-600">{t(error)}</span> : null}
      </div>
      <CredentialBox title={t("Accounts created")} accounts={result} />
    </Card>
  );
}

export function AdminParentsPanel({ students }: { students: AdminStudentOption[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ name: string; email: string; password: string }[]>([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [studentIds, setStudentIds] = useState<string[]>([]);

  function toggleStudent(id: string) {
    setStudentIds((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  }

  async function submit() {
    setBusy(true); setError(null); setResult([]);
    const data = await send("/api/admin/parents", "POST", { firstName, lastName, email, studentIds });
    setBusy(false);
    if (data.ok) {
      setResult([{ name: `${data.firstName} ${data.lastName}`, email: data.email, password: data.temporaryPassword }]);
      setFirstName(""); setLastName(""); setEmail(""); setStudentIds([]);
      router.refresh();
    } else {
      setError(data.code === "EMAIL_TAKEN" ? "Email already used" : "Could not create the parent");
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/10"><Users className="h-5 w-5" /></div><div><h2 className="font-bold">{t("Add a parent")}</h2><p className="text-xs text-slate-500">{t("Create the parent account and link them to children.")}</p></div></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div><Label>{t("First name")}</Label><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
        <div><Label>{t("Last name")}</Label><Input value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
        <div><Label>{t("Email")}</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="parent@school.com" /></div>
      </div>
      <div className="mt-3">
        <Label>{t("Link to children")}</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {students.length ? students.map((s) => (
            <button key={s.id} type="button" onClick={() => toggleStudent(s.id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${studentIds.includes(s.id) ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{s.name}</button>
          )) : <span className="text-xs text-slate-500">{t("No students yet")}</span>}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button onClick={submit} disabled={busy || !firstName.trim() || !lastName.trim() || !email.trim()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {t("Create parent")}</Button>
        {error ? <span className="text-xs font-medium text-rose-600">{t(error)}</span> : null}
      </div>
      <CredentialBox title={t("Account created")} accounts={result} />
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Create teacher + assign to classes
// ---------------------------------------------------------------------------

export function AdminTeachersPanel({ classes, teachers, subjects }: { classes: AdminClassOption[]; teachers: AdminTeacherOption[]; subjects: AdminSubjectOption[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ name: string; email: string; password: string }[]>([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [classIds, setClassIds] = useState<string[]>([]);

  const [assignTeacher, setAssignTeacher] = useState("");
  const [assignClass, setAssignClass] = useState("");
  const [assignSubject, setAssignSubject] = useState("");
  const [assignRole, setAssignRole] = useState("SUBJECT_TEACHER");

  function toggleClass(id: string) {
    setClassIds((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  }

  async function submit() {
    setBusy(true); setError(null); setResult([]);
    const data = await send("/api/admin/teachers", "POST", { firstName, lastName, email, classIds });
    setBusy(false);
    if (data.ok) {
      setResult([{ name: `${data.firstName} ${data.lastName}`, email: data.email, password: data.temporaryPassword }]);
      setFirstName(""); setLastName(""); setEmail(""); setClassIds([]);
      router.refresh();
    } else {
      setError(data.code === "EMAIL_TAKEN" ? "Email already used" : "Could not create the teacher");
    }
  }

  async function assign() {
    setBusy(true); setError(null);
    const data = await send("/api/admin/assignments", "POST", { teacherId: assignTeacher, classId: assignClass, subjectId: assignSubject || null, role: assignRole });
    setBusy(false);
    if (data.ok) { setAssignTeacher(""); setAssignClass(""); setAssignSubject(""); router.refresh(); }
    else setError(data.code === "DUPLICATE" ? "Already assigned" : "Could not assign");
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10"><UserPlus className="h-5 w-5" /></div><div><h2 className="font-bold">{t("Add a teacher")}</h2><p className="text-xs text-slate-500">{t("Creates the account and assigns the chosen classes.")}</p></div></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div><Label>{t("First name")}</Label><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
        <div><Label>{t("Last name")}</Label><Input value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
        <div><Label>{t("Email")}</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teacher@school.com" /></div>
      </div>
      <div className="mt-3">
        <Label>{t("Assign to classes")}</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {classes.map((c) => (
            <button key={c.id} type="button" onClick={() => toggleClass(c.id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${classIds.includes(c.id) ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{c.name}</button>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button onClick={submit} disabled={busy || !firstName.trim() || !lastName.trim() || !email.trim()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {t("Create teacher")}</Button>
        {error && !assignClass ? <span className="text-xs font-medium text-rose-600">{t(error)}</span> : null}
      </div>
      <CredentialBox title={t("Account created")} accounts={result} />

      <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
        <h3 className="font-bold">{t("Assign an existing teacher")}</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <div><Label>{t("Teacher")}</Label>
            <select value={assignTeacher} onChange={(e) => setAssignTeacher(e.target.value)} className={inputClass}><option value="">{t("Select…")}</option>{teachers.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
          <div><Label>{t("Class")}</Label>
            <select value={assignClass} onChange={(e) => setAssignClass(e.target.value)} className={inputClass}><option value="">{t("Select…")}</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><Label>{t("Subject")}</Label>
            <select value={assignSubject} onChange={(e) => setAssignSubject(e.target.value)} className={inputClass}><option value="">{t("Any")}</option>{subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div><Label>{t("Role")}</Label>
            <select value={assignRole} onChange={(e) => setAssignRole(e.target.value)} className={inputClass}><option value="SUBJECT_TEACHER">{t("Subject teacher")}</option><option value="HOMEROOM">{t("Homeroom teacher")}</option></select></div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Button onClick={assign} disabled={busy || !assignTeacher || !assignClass}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {t("Assign")}</Button>
          {error && assignClass ? <span className="text-xs font-medium text-rose-600">{t(error)}</span> : null}
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Create class + manage teacher assignments
// ---------------------------------------------------------------------------

export function AdminClassesPanel({ teachers, assignments }: { teachers: AdminTeacherOption[]; assignments: AssignmentRow[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("Grade 7");
  const [section, setSection] = useState("");
  const [room, setRoom] = useState("");
  const [capacity, setCapacity] = useState("30");
  const [homeroom, setHomeroom] = useState("");

  async function submit() {
    setBusy(true); setError(null);
    const data = await send("/api/admin/classes", "POST", { name, gradeLevel, section: section || null, room: room || null, capacity: Number(capacity) || 30, homeroomTeacherId: homeroom || null });
    setBusy(false);
    if (data.ok) { setName(""); setSection(""); setRoom(""); setHomeroom(""); router.refresh(); }
    else setError(data.code === "CLASS_TAKEN" ? "A class with this name already exists this year" : "Could not create the class");
  }

  async function unassign(id: string) {
    await send("/api/admin/assignments", "DELETE", { id });
    router.refresh();
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10"><Users className="h-5 w-5" /></div><div><h2 className="font-bold">{t("Create a class")}</h2><p className="text-xs text-slate-500">{t("Adds a class to the current school year.")}</p></div></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div><Label>{t("Class name")}</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 9B" /></div>
        <div><Label>{t("Grade level")}</Label>
          <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className={inputClass}><option>Grade 7</option><option>Grade 8</option><option>Grade 9</option></select></div>
        <div><Label>{t("Room")}</Label><Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g. 204" /></div>
        <div><Label>{t("Section")}</Label><Input value={section} onChange={(e) => setSection(e.target.value)} placeholder="e.g. B" /></div>
        <div><Label>{t("Capacity")}</Label><Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} /></div>
        <div><Label>{t("Homeroom teacher")}</Label>
          <select value={homeroom} onChange={(e) => setHomeroom(e.target.value)} className={inputClass}><option value="">{t("None")}</option>{teachers.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button onClick={submit} disabled={busy || !name.trim()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {t("Create class")}</Button>
        {error ? <span className="text-xs font-medium text-rose-600">{t(error)}</span> : null}
      </div>

      {assignments.length ? (
        <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
          <h3 className="font-bold">{t("Current assignments")}</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wide text-slate-400"><tr><th className="px-2 py-2">{t("Class")}</th><th className="px-2 py-2">{t("Teacher")}</th><th className="px-2 py-2">{t("Subject")}</th><th className="px-2 py-2">{t("Role")}</th><th className="px-2 py-2" /></tr></thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-2 py-2 font-semibold">{a.className}</td>
                    <td className="px-2 py-2">{a.teacherName}</td>
                    <td className="px-2 py-2 text-slate-500">{a.subjectName ?? t("Any")}</td>
                    <td className="px-2 py-2 text-slate-500">{a.isHomeroom ? t("Homeroom teacher") : t("Subject teacher")}</td>
                    <td className="px-2 py-2 text-end"><Button size="icon" variant="ghost" onClick={() => unassign(a.id)} title={t("Remove")}><Trash2 className="h-4 w-4" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Timetable (per class)
// ---------------------------------------------------------------------------

const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function ClassTimetablePanel({ classId, subjects, teachers, slots }: { classId: string; subjects: AdminSubjectOption[]; teachers: AdminTeacherOption[]; slots: TimetableSlotRow[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [day, setDay] = useState("1");
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("09:00");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [room, setRoom] = useState("");

  async function submit() {
    setBusy(true); setError(null);
    const data = await send("/api/admin/timetable", "POST", { classId, dayOfWeek: Number(day), startTime: start, endTime: end, subjectId: subjectId || null, teacherId: teacherId || null, room: room || null });
    setBusy(false);
    if (data.ok) { setStart("08:00"); setEnd("09:00"); setSubjectId(""); setTeacherId(""); setRoom(""); router.refresh(); }
    else setError("Could not add the slot");
  }

  async function remove(id: string) {
    await send("/api/admin/timetable", "DELETE", { id });
    router.refresh();
  }

  const byDay = slots.reduce<Record<number, TimetableSlotRow[]>>((acc, slot) => {
    (acc[slot.dayOfWeek] ??= []).push(slot);
    return acc;
  }, {});

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"><CalendarDays className="h-5 w-5" /></div><div><h2 className="font-bold">{t("Weekly timetable")}</h2><p className="text-xs text-slate-500">{t("Manage the class weekly schedule.")}</p></div></div>

      <div className="mt-4 grid gap-3 sm:grid-cols-6">
        <div><Label>{t("Day")}</Label>
          <select value={day} onChange={(e) => setDay(e.target.value)} className={inputClass}>{DAY_LABELS.map((d, i) => <option key={i} value={String(i + 1)}>{t(d)}</option>)}</select></div>
        <div><Label>{t("Start")}</Label><Input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></div>
        <div><Label>{t("End")}</Label><Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
        <div><Label>{t("Subject")}</Label>
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className={inputClass}><option value="">{t("Any")}</option>{subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><Label>{t("Teacher")}</Label>
          <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className={inputClass}><option value="">{t("Any")}</option>{teachers.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
        <div><Label>{t("Room")}</Label><Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="204" /></div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Button onClick={submit} disabled={busy || !start || !end}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {t("Add slot")}</Button>
        {error ? <span className="text-xs font-medium text-rose-600">{t(error)}</span> : null}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {DAY_LABELS.map((label, i) => {
          const daySlots = (byDay[i + 1] ?? []).slice().sort((a, b) => a.startTime.localeCompare(b.startTime));
          return (
            <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t(label)}</div>
              <div className="space-y-1.5">
                {daySlots.map((slot) => (
                  <div key={slot.id} className="group flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 text-xs shadow-sm dark:bg-slate-950">
                    <div><div className="font-semibold text-slate-900 dark:text-white">{slot.startTime}–{slot.endTime}</div><div className="text-[10px] text-slate-500">{slot.subjectName ?? t("Any")}{slot.teacherName ? ` · ${slot.teacherName}` : ""}{slot.room ? ` · ${slot.room}` : ""}</div></div>
                    <button onClick={() => remove(slot.id)} className="text-slate-300 hover:text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
                {!daySlots.length ? <div className="text-[11px] text-slate-400">{t("No slots")}</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Create a generic account (staff / parent profile)
// ---------------------------------------------------------------------------

const ACCOUNT_ROLES = ["ADMIN", "PRINCIPAL", "TEACHER", "NURSE", "PARENT"] as const;

export function AdminAccountsPanel({ classes, students }: { classes: AdminClassOption[]; students: AdminStudentOption[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ name: string; email: string; password: string }[]>([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("TEACHER");
  const [classIds, setClassIds] = useState<string[]>([]);
  const [studentIds, setStudentIds] = useState<string[]>([]);

  function toggleClass(id: string) {
    setClassIds((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  }
  function toggleStudent(id: string) {
    setStudentIds((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  }

  async function submit() {
    setBusy(true); setError(null); setResult([]);
    const data = await send("/api/admin/accounts", "POST", {
      firstName, lastName, email, role, classIds: role === "TEACHER" ? classIds : [], studentIds: role === "PARENT" ? studentIds : [],
    });
    setBusy(false);
    if (data.ok) {
      setResult([{ name: `${data.firstName} ${data.lastName}`, email: data.email, password: data.temporaryPassword }]);
      setFirstName(""); setLastName(""); setEmail(""); setClassIds([]); setStudentIds([]);
      router.refresh();
    } else {
      setError(data.code === "EMAIL_TAKEN" ? "Email already used" : "Could not create the account");
    }
  }

  const chip = (active: boolean, key: string, onClick: () => void, children: ReactNode) => (
    <button key={key} type="button" onClick={onClick} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${active ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{children}</button>
  );

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10"><UserCog className="h-5 w-5" /></div><div><h2 className="font-bold">{t("Create an account")}</h2><p className="text-xs text-slate-500">{t("Creates a staff or parent account with a temporary password.")}</p></div></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <div><Label>{t("First name")}</Label><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
        <div><Label>{t("Last name")}</Label><Input value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
        <div><Label>{t("Email")}</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="account@school.com" /></div>
        <div><Label>{t("Profile")}</Label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>{ACCOUNT_ROLES.map((r) => <option key={r} value={r}>{t(ROLE_LABELS[r])}</option>)}</select></div>
      </div>
      {role === "TEACHER" ? (
        <div className="mt-3">
          <Label>{t("Assign to classes")}</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {classes.length ? classes.map((c) => chip(classIds.includes(c.id), c.id, () => toggleClass(c.id), c.name)) : <span className="text-xs text-slate-500">{t("No classes yet")}</span>}
          </div>
        </div>
      ) : null}
      {role === "PARENT" ? (
        <div className="mt-3">
          <Label>{t("Link to children")}</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {students.length ? students.map((s) => chip(studentIds.includes(s.id), s.id, () => toggleStudent(s.id), s.name)) : <span className="text-xs text-slate-500">{t("No students yet")}</span>}
          </div>
        </div>
      ) : null}
      <div className="mt-4 flex items-center gap-3">
        <Button onClick={submit} disabled={busy || !firstName.trim() || !lastName.trim() || !email.trim()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {t("Create account")}</Button>
        {error ? <span className="text-xs font-medium text-rose-600">{t(error)}</span> : null}
      </div>
      <CredentialBox title={t("Account created")} accounts={result} />
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Create an establishment (school)
// ---------------------------------------------------------------------------

const COUNTRY_OPTIONS = [
  { code: "MA", label: "Morocco" },
  { code: "FR", label: "France" },
  { code: "ES", label: "Spain" },
  { code: "BE", label: "Belgium" },
  { code: "CA", label: "Canada" },
  { code: "SN", label: "Senegal" },
  { code: "US", label: "United States" },
];

const PLAN_OPTIONS = [
  { code: "TRIAL", label: "Trial" },
  { code: "PRO", label: "Pro" },
  { code: "ENTERPRISE", label: "Enterprise" },
];

export function AdminEstablishmentsPanel() {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ name: string; slug: string } | null>(null);

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("MA");
  const [plan, setPlan] = useState("PRO");
  const [seatsLimit, setSeatsLimit] = useState("500");

  async function submit() {
    setBusy(true); setError(null); setCreated(null);
    const data = await send("/api/admin/establishments", "POST", { name, city: city || null, country, plan, seatsLimit: Number(seatsLimit) || 500 });
    setBusy(false);
    if (data.ok) {
      setCreated({ name: data.name, slug: data.slug });
      setName(""); setCity("");
      router.refresh();
    } else {
      setError(data.code === "NAME_TAKEN" ? "Name already used" : "Could not create the establishment");
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/10"><Building2 className="h-5 w-5" /></div><div><h2 className="font-bold">{t("Create an establishment")}</h2><p className="text-xs text-slate-500">{t("Adds a new school to the platform with its own campus and school year.")}</p></div></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-5">
        <div><Label>{t("School name")}</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Lycée Al Amal" /></div>
        <div><Label>{t("City")}</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
        <div><Label>{t("Country")}</Label>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass}>{COUNTRY_OPTIONS.map((c) => <option key={c.code} value={c.code}>{t(c.label)}</option>)}</select></div>
        <div><Label>{t("Plan")}</Label>
          <select value={plan} onChange={(e) => setPlan(e.target.value)} className={inputClass}>{PLAN_OPTIONS.map((p) => <option key={p.code} value={p.code}>{t(p.label)}</option>)}</select></div>
        <div><Label>{t("Seats limit")}</Label><Input type="number" value={seatsLimit} onChange={(e) => setSeatsLimit(e.target.value)} /></div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button onClick={submit} disabled={busy || !name.trim()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {t("Create establishment")}</Button>
        {error ? <span className="text-xs font-medium text-rose-600">{t(error)}</span> : null}
      </div>
      {created ? (
        <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs dark:border-sky-500/30 dark:bg-sky-500/10">
          <div className="font-semibold text-sky-700 dark:text-sky-300">{t("Establishment created")}</div>
          <div className="mt-1 text-sky-700/70 dark:text-sky-300/70">{created.name} · {created.slug}</div>
        </div>
      ) : null}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Edit / delete an establishment card
// ---------------------------------------------------------------------------

export type EstablishmentEditData = {
  id: string;
  name: string;
  city: string | null;
  country: string;
  plan: string;
  seatsLimit: number;
};

export function AdminEditEstablishmentPanel({
  school,
  onCancel,
  onDeleted,
}: {
  school: EstablishmentEditData;
  onCancel: () => void;
  onDeleted?: () => void;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [name, setName] = useState(school.name);
  const [city, setCity] = useState(school.city ?? "");
  const [country, setCountry] = useState(school.country);
  const [plan, setPlan] = useState(school.plan);
  const [seatsLimit, setSeatsLimit] = useState(String(school.seatsLimit));

  async function save() {
    setBusy(true); setError(null);
    const data = await send("/api/admin/establishments", "PATCH", {
      id: school.id, name, city: city || null, country, plan, seatsLimit: Number(seatsLimit) || 500,
    });
    setBusy(false);
    if (data.ok) {
      router.refresh();
      onCancel();
    } else {
      setError(data.code === "NAME_TAKEN" ? "Name already used" : "Could not update the establishment");
    }
  }

  async function remove() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setBusy(true); setError(null);
    const data = await send("/api/admin/establishments", "DELETE", { id: school.id });
    setBusy(false);
    if (data.ok) {
      router.refresh();
      onDeleted?.();
    } else {
      setError("Could not delete the establishment");
    }
  }

  return (
    <div className="space-y-3 border-t border-slate-100 pt-3 dark:border-slate-800">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>{t("School name")}</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><Label>{t("City")}</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
        <div><Label>{t("Plan")}</Label>
          <select value={plan} onChange={(e) => setPlan(e.target.value)} className={inputClass}>{PLAN_OPTIONS.map((p) => <option key={p.code} value={p.code}>{t(p.label)}</option>)}</select></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>{t("Country")}</Label>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass}>{COUNTRY_OPTIONS.map((c) => <option key={c.code} value={c.code}>{t(c.label)}</option>)}</select></div>
        <div><Label>{t("Seats limit")}</Label><Input type="number" value={seatsLimit} onChange={(e) => setSeatsLimit(e.target.value)} /></div>
      </div>
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={save} disabled={busy || !name.trim()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} {t("Save")}</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>{t("Cancel")}</Button>
        <div className="flex-1" />
        <Button size="sm" variant="destructive" onClick={remove} disabled={busy}>
          {confirmDelete ? t("Confirm delete") : <Trash2 className="h-4 w-4" />}
        </Button>
      </div>
      {error ? <span className="text-xs font-medium text-rose-600">{t(error)}</span> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create an administration account for a chosen establishment (group manager)
// ---------------------------------------------------------------------------

export function AdminSchoolAdminPanel({ schools }: { schools: { id: string; name: string }[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ name: string; email: string; password: string }[]>([]);

  const [schoolId, setSchoolId] = useState(schools[0]?.id ?? "");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("ADMIN");

  async function submit() {
    setBusy(true); setError(null); setResult([]);
    const data = await send("/api/admin/accounts", "POST", { firstName, lastName, email, role, schoolId });
    setBusy(false);
    if (data.ok) {
      setResult([{ name: `${data.firstName} ${data.lastName}`, email: data.email, password: data.temporaryPassword }]);
      setFirstName(""); setLastName(""); setEmail("");
      router.refresh();
    } else {
      setError(data.code === "EMAIL_TAKEN" ? "Email already used" : "Could not create the account");
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10"><UserCog className="h-5 w-5" /></div><div><h2 className="font-bold">{t("Create an administration account")}</h2><p className="text-xs text-slate-500">{t("Creates an account that will manage the chosen establishment.")}</p></div></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div><Label>{t("Establishment")}</Label>
          <select value={schoolId} onChange={(e) => setSchoolId(e.target.value)} className={inputClass}>{schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        <div><Label>{t("Profile")}</Label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}><option value="ADMIN">{t(ROLE_LABELS.ADMIN)}</option><option value="PRINCIPAL">{t(ROLE_LABELS.PRINCIPAL)}</option></select></div>
        <div><Label>{t("First name")}</Label><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
        <div><Label>{t("Last name")}</Label><Input value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
        <div className="sm:col-span-2"><Label>{t("Email")}</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@school.com" /></div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button onClick={submit} disabled={busy || !firstName.trim() || !lastName.trim() || !email.trim() || !schoolId}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {t("Create account")}</Button>
        {error ? <span className="text-xs font-medium text-rose-600">{t(error)}</span> : null}
      </div>
      <CredentialBox title={t("Account created")} accounts={result} />
    </Card>
  );
}
