/**
 * STUDENT360 — main seed orchestrator.
 *
 * Produces a deterministic, fully populated demo school with:
 *   • 1 school, 1 academic year, 3 terms
 *   • 6 classes (7A, 7B, 8A, 8B demo, 9A, 9B)
 *   • ~147 students, ~12 teachers, ~147 guardians
 *   • 14 weeks of realistic historical data for the demo class 8B
 *   • goals, interventions, achievements, parent inputs, alerts, events
 *
 * Run with: npm run setup   (resets DB + seeds)
 * Or:       npm run seed     (after prisma db push)
 */

import { PrismaClient, type Prisma } from "@prisma/client";
import { hashPassword } from "@/lib/auth/password";
import {
  ATTENDANCE_STATUS,
  HOMEWORK_STATUS,
  SUBMISSION_STATUS,
  OBSERVATION_CATEGORY_LABELS,
  SENTIMENTS,
  ALERT_LEVELS,
  SIGNAL_CODES,
  VISIBILITY,
  ROLES,
  DAILY_RATING_CRITERIA,
  type RoleCode,
} from "@/lib/domain/enums";
import * as P from "./seed/personas";
import {
  addDays,
  atTime,
  bulk,
  chance,
  clampRange,
  groupByWeek,
  int,
  isWeekend,
  jitter,
  lerp,
  makeRng,
  monday,
  nid,
  pick,
  pickMany,
  resetEmails,
  resetIds,
  reserveEmail,
  scale5,
  schoolDaysBack,
  score100,
  section,
  slugifyName,
  startOfDay,
  uniqueEmail,
  weekKey,
} from "./seed/util";

const rng = makeRng(20260203);
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const TODAY = startOfDay(new Date());
const DEMO_HISTORY_WEEKS = 14;
const HISTORY_DAYS = schoolDaysBack(TODAY, DEMO_HISTORY_WEEKS * 5); // ~70 school days
const HISTORY_FROM = HISTORY_DAYS[0];
const HISTORY_TO = TODAY;
const DOMAIN = "student360.demo";
const DEMO_PASSWORD = "student360";

// Time blocks for timetable generation
const TIME_BLOCKS = [
  { start: "08:00", end: "08:55" },
  { start: "09:00", end: "09:55" },
  { start: "10:10", end: "11:05" }, // short break after 2nd
  { start: "11:10", end: "12:05" },
  { start: "12:05", end: "13:00" }, // lunch
  { start: "13:00", end: "13:55" },
  { start: "14:00", end: "14:55" },
];

// ---------------------------------------------------------------------------
// Helper state (caches)
// ---------------------------------------------------------------------------

type SchoolContext = {
  schoolId: string;
  yearId: string;
  termId: string;
  termIds: string[];
  subjects: Map<string, { id: string; code: string; name: string; core: boolean }>;
  competencies: Map<string, { id: string; code: string; name: string }>;
  classes: Map<
    string,
    {
      id: string;
      name: string;
      gradeOrder: number;
      teacherId: string;
      studentCount: number;
      demo: boolean;
      subjectIds: string[];
      slotSubjects: string[];
    }
  >;
  teachers: Map<string, { id: string; userId: string; first: string; last: string; subjectCode: string }>;
  students: Map<string, { id: string; userId: string; first: string; last: string; classId: string; className: string; archetype: P.Archetype; gender: string }>;
  guardians: Map<string, { id: string; userId: string; first: string; last: string }>;
  homeroomTeacherId: string;
};

// ---------------------------------------------------------------------------
// Phase 1 — School, year, terms, subjects, competencies
// ---------------------------------------------------------------------------

async function seedTenant(): Promise<SchoolContext> {
  resetIds();
  resetEmails();

  const school = await prisma.school.create({
    data: {
      id: nid("sch"),
      name: "Collège International Les Oliviers",
      slug: "les-oliviers",
      legalName: "Groupe Scolaire Les Oliviers SARL",
      country: "MA",
      city: "Casablanca",
      address: "12 Rue des Écoles, Casablanca",
      phone: "+212 5XX-XXXXXX",
      email: "contact@lesoliviers.edu",
      website: "https://lesoliviers.edu",
      primaryColor: "#16a34a",
      accentColor: "#f59e0b",
      defaultLocale: "en",
      supportedLocales: "en,fr,ar",
      timezone: "Africa/Casablanca",
      plan: "PRO",
      status: "ACTIVE",
      seatsLimit: 2000,
    },
  });

  const campus = await prisma.campus.create({
    data: {
      id: nid("camp"),
      schoolId: school.id,
      name: "Main Campus",
      address: "12 Rue des Écoles",
      isMain: true,
    },
  });

  const yearStart = addDays(TODAY, -150);
  const yearEnd = addDays(TODAY, 120);
  const academicYear = await prisma.academicYear.create({
    data: {
      id: nid("year"),
      schoolId: school.id,
      name: `${yearStart.getFullYear()}-${yearEnd.getFullYear()}`,
      startDate: yearStart,
      endDate: yearEnd,
      isCurrent: true,
    },
  });

  const termLength = Math.floor((yearEnd.getTime() - yearStart.getTime()) / 3 / 86_400_000);
  const terms = await Promise.all(
    [0, 1, 2].map(async (i) => {
      const start = addDays(yearStart, i * termLength);
      const end = addDays(start, termLength - 1);
      return prisma.term.create({
        data: {
          id: nid("term"),
          academicYearId: academicYear.id,
          name: `Term ${i + 1}`,
          sequence: i + 1,
          startDate: start,
          endDate: end,
          isCurrent: i === 1,
        },
      });
    }),
  );
  const currentTerm = terms[1];

  const subjectsData = P.SUBJECT_DEFS.map((s, i) => ({
    id: nid("sub"),
    schoolId: school.id,
    name: s.name,
    code: s.code,
    color: s.color,
    icon: s.icon,
    order: i,
    isActive: true,
  }));
  await bulk("Subjects", subjectsData, (chunk) => prisma.subject.createMany({ data: chunk }));

  const competenciesData = P.COMPETENCY_FRAMEWORK.map((c, i) => ({
    id: nid("comp"),
    schoolId: school.id,
    framework: "CORE_SKILLS",
    code: c.code,
    name: c.name,
    description: `${c.name} — ${c.category.toLowerCase()} competency`,
    category: c.category,
    icon: c.icon,
    order: i,
    isActive: true,
  }));
  await bulk("Competencies", competenciesData, (chunk) => prisma.competency.createMany({ data: chunk }));

  const subjects = new Map(subjectsData.map((s) => [s.code, { id: s.id, code: s.code, name: s.name, core: P.SUBJECT_DEFS.find((d) => d.code === s.code)?.core ?? true }]));
  const competencies = new Map(competenciesData.map((c) => [c.code, { id: c.id, code: c.code, name: c.name }]));

  return {
    schoolId: school.id,
    yearId: academicYear.id,
    termId: currentTerm.id,
    termIds: terms.map((t) => t.id),
    subjects,
    competencies,
    classes: new Map(),
    teachers: new Map(),
    students: new Map(),
    guardians: new Map(),
    homeroomTeacherId: "",
  };
};

// ---------------------------------------------------------------------------
// Phase 2 — Roles, users, teachers, guardians, principal, admin
// ---------------------------------------------------------------------------

async function createUser(ctx: SchoolContext, input: {
  first: string;
  last: string;
  email: string;
  role: RoleCode;
  locale?: string;
  theme?: string;
}) {
  reserveEmail(input.email);
  const user = await prisma.user.create({
    data: {
      id: nid("usr"),
      schoolId: ctx.schoolId,
      email: input.email,
      passwordHash: await hashPassword(DEMO_PASSWORD),
      firstName: input.first,
      lastName: input.last,
      locale: input.locale ?? "en",
      theme: input.theme ?? "dark",
      isActive: true,
      roles: {
        create: {
          id: nid("urole"),
          roleCode: input.role,
          schoolId: ctx.schoolId,
        },
      },
    },
  });
  return user;
}

async function seedStaff(ctx: SchoolContext) {
  section("Staff & users");

  // Ensure roles exist
  const roles: Prisma.RoleCreateManyInput[] = [
    { code: ROLES.STUDENT, name: "Student", rank: 10 },
    { code: ROLES.TEACHER, name: "Teacher", rank: 30 },
    { code: ROLES.PARENT, name: "Parent / Guardian", rank: 20 },
    { code: ROLES.NURSE, name: "School Nurse", rank: 35 },
    { code: ROLES.ADMIN, name: "School Administration", rank: 40 },
    { code: ROLES.PRINCIPAL, name: "School Management", rank: 50 },
    { code: ROLES.SUPER_ADMIN, name: "Platform Administrator", rank: 100 },
  ];
  await prisma.role.createMany({ data: roles });

  // Principal & admin
  const principal = await createUser(ctx, { first: "Nadia", last: "Bennani", email: "principal@lesoliviers.edu", role: "PRINCIPAL" });
  const admin = await createUser(ctx, { first: "Samir", last: "Lahlou", email: "admin@lesoliviers.edu", role: "ADMIN" });
  const superAdmin = await createUser(ctx, { first: "Platform", last: "Admin", email: "super@student360.demo", role: "SUPER_ADMIN", theme: "light" });

  // School nurse (Phase 1)
  const nurse = await createUser(ctx, { first: "Khadija", last: "Berrada", email: "nurse@lesoliviers.edu", role: "NURSE" });

  // Teachers
  const teacherUsers: Prisma.TeacherCreateManyInput[] = [];
  let teacherIdx = 1;
  for (const def of P.TEACHER_DEFS) {
    const email = uniqueEmail(`${def.first}.${def.last}`, "lesoliviers.edu");
    const user = await createUser(ctx, { first: def.first, last: def.last, email, role: "TEACHER" });
    teacherUsers.push({
      id: nid("tch"),
      userId: user.id,
      schoolId: ctx.schoolId,
      employeeNumber: `T${String(teacherIdx++).padStart(3, "0")}`,
      title: def.title,
      specialties: def.subject,
      isHomeroom: !!def.homeroom,
      status: "ACTIVE",
    });
  }
  await bulk("Teachers", teacherUsers, (chunk) => prisma.teacher.createMany({ data: chunk }));

  // Re-query to populate cache
  const createdTeachers = await prisma.teacher.findMany({
    where: { schoolId: ctx.schoolId },
    include: { user: true },
  });
  for (const t of createdTeachers) {
    ctx.teachers.set(t.id, {
      id: t.id,
      userId: t.userId,
      first: t.user.firstName,
      last: t.user.lastName,
      subjectCode: t.specialties?.split(",")[0] ?? "MATH",
    });
  }

  // Map homeroom teacher for 8B
  const homeroomDef = P.TEACHER_DEFS.find((d) => d.homeroom === "8B")!;
  const homeroomTeacher = createdTeachers.find((t) => t.user.firstName === homeroomDef.first && t.user.lastName === homeroomDef.last)!;
  ctx.homeroomTeacherId = homeroomTeacher.id;

  return { principal, admin, superAdmin };
}

// ---------------------------------------------------------------------------
// Phase 3 — Classes + class-teacher assignments
// ---------------------------------------------------------------------------

function buildTimetableSubjects(subjectIds: string[]) {
  // 7 slots × 5 days = 35 slots. Fill mostly core subjects (MATH, FR, EN, AR, SCI, HG)
  // plus 2 PE, 2 ART/ICT spread across the week.
  const core = subjectIds.filter((id) => {
    const code = [...subjectsCodeById.entries()].find(([, v]) => v === id)?.[0] ?? "";
    return ["MATH", "FR", "EN", "AR", "SCI", "HG"].includes(code);
  });
  const specials = subjectIds.filter((id) => {
    const code = [...subjectsCodeById.entries()].find(([, v]) => v === id)?.[0] ?? "";
    return ["PE", "ART", "ICT"].includes(code);
  });

  const slots: string[] = [];
  for (let d = 0; d < 5; d++) {
    for (let p = 0; p < TIME_BLOCKS.length; p++) {
      // Make Friday afternoon lighter with specials
      if (d === 4 && (p === 5 || p === 6)) {
        slots.push(pick(rng, specials));
      } else if ((d === 1 || d === 3) && p === 6) {
        slots.push(pick(rng, specials));
      } else {
        slots.push(pick(rng, core));
      }
    }
  }
  return slots;
}

let subjectsCodeById = new Map<string, string>();

async function seedClasses(ctx: SchoolContext) {
  section("Classes & timetable");

  subjectsCodeById = new Map([...ctx.subjects.entries()].map(([code, s]) => [code, s.id]));
  const subjectIdList = [...ctx.subjects.values()].map((s) => s.id);

  const classRows: Prisma.SchoolClassCreateManyInput[] = [];
  for (const def of P.CLASS_DEFS) {
    const homeroomDef = P.TEACHER_DEFS.find((t) => t.homeroom === def.name);
    const teacher = homeroomDef
      ? [...ctx.teachers.values()].find((t) => t.first === homeroomDef.first && t.last === homeroomDef.last)!
      : pick(rng, [...ctx.teachers.values()]);

    classRows.push({
      id: nid("cls"),
      schoolId: ctx.schoolId,
      campusId: (await prisma.campus.findFirst({ where: { schoolId: ctx.schoolId } }))!.id,
      academicYearId: ctx.yearId,
      name: def.name,
      gradeLevel: def.gradeLevel,
      gradeOrder: def.gradeOrder,
      section: def.section,
      room: def.room,
      capacity: 30,
      isDemo: def.demo,
    });
  }
  await bulk("Classes", classRows, (chunk) => prisma.schoolClass.createMany({ data: chunk }));

  const createdClasses = await prisma.schoolClass.findMany({ where: { schoolId: ctx.schoolId } });
  for (const c of createdClasses) {
    const def = P.CLASS_DEFS.find((d) => d.name === c.name)!;
    const homeroomDef = P.TEACHER_DEFS.find((t) => t.homeroom === def.name);
    const teacher = homeroomDef
      ? [...ctx.teachers.values()].find((t) => t.first === homeroomDef.first && t.last === homeroomDef.last)!
      : pick(rng, [...ctx.teachers.values()]);

    // Assign all teachers to each class (one primary subject per teacher)
    const assignments: Prisma.TeacherClassAssignmentCreateManyInput[] = [];
    for (const t of ctx.teachers.values()) {
      const subjectId = subjectsCodeById.get(t.subjectCode);
      assignments.push({
        id: nid("tca"),
        teacherId: t.id,
        classId: c.id,
        subjectId: subjectId ?? subjectIdList[0],
        isHomeroom: t.id === teacher.id,
        role: t.id === teacher.id ? "HOMEROOM" : "SUBJECT_TEACHER",
      });
    }
    await prisma.teacherClassAssignment.createMany({ data: assignments });

    const slotSubjects = buildTimetableSubjects(subjectIdList);
    const slotRows: Prisma.TimetableSlotCreateManyInput[] = [];
    for (let d = 0; d < 5; d++) {
      for (let p = 0; p < TIME_BLOCKS.length; p++) {
        const subjectId = slotSubjects[d * TIME_BLOCKS.length + p];
        const subjectCode = [...subjectsCodeById.entries()].find(([, v]) => v === subjectId)?.[0] ?? "MATH";
        const teacher = [...ctx.teachers.values()].find((t) => t.subjectCode === subjectCode) ?? pick(rng, [...ctx.teachers.values()]);
        slotRows.push({
          id: nid("slot"),
          classId: c.id,
          subjectId,
          teacherId: teacher.id,
          dayOfWeek: d + 1,
          startTime: TIME_BLOCKS[p].start,
          endTime: TIME_BLOCKS[p].end,
          room: c.room ?? undefined,
        });
      }
    }
    await prisma.timetableSlot.createMany({ data: slotRows });

    ctx.classes.set(c.id, {
      id: c.id,
      name: c.name,
      gradeOrder: c.gradeOrder,
      teacherId: teacher.id,
      studentCount: def.size,
      demo: def.demo,
      subjectIds: subjectIdList,
      slotSubjects,
    });
  }
}

// ---------------------------------------------------------------------------
// Phase 4 — Students + guardians + enrollments
// ---------------------------------------------------------------------------

function makeStudentName(def: P.RosterEntry | null, index: number): { first: string; last: string; gender: "F" | "M" } {
  if (def) return { first: def.first, last: def.last, gender: def.gender };
  const g = chance(rng, 0.52) ? "F" : "M";
  const first = g === "F" ? pick(rng, P.FIRST_NAMES_F) : pick(rng, P.FIRST_NAMES_M);
  const last = pick(rng, P.LAST_NAMES);
  return { first, last, gender: g };
}

function profileForDay(archetype: P.Archetype, day: Date, from: Date, to: Date): P.Profile {
  const total = to.getTime() - from.getTime();
  const t = total === 0 ? 1 : clampRange((day.getTime() - from.getTime()) / total, 0, 1);
  const s = archetype.start;
  const e = archetype.end;
  return {
    attendance: lerp(s.attendance, e.attendance, t),
    homework: lerp(s.homework, e.homework, t),
    engagement: lerp(s.engagement, e.engagement, t),
    academic: lerp(s.academic, e.academic, t),
    motivation: lerp(s.motivation, e.motivation, t),
    mood: lerp(s.mood, e.mood, t),
    energy: lerp(s.energy, e.energy, t),
    stress: lerp(s.stress, e.stress, t),
    checkin: lerp(s.checkin, e.checkin, t),
  };
}

async function seedStudentsAndGuardians(ctx: SchoolContext) {
  section("Students, guardians & enrollments");

  const studentUsers: Prisma.UserCreateManyInput[] = [];
  const guardianUsers: Prisma.UserCreateManyInput[] = [];
  const students: Prisma.StudentCreateManyInput[] = [];
  const guardians: Prisma.GuardianCreateManyInput[] = [];
  const relationships: Prisma.ParentStudentRelationshipCreateManyInput[] = [];
  const enrollments: Prisma.EnrollmentCreateManyInput[] = [];

  let rosterIndex = 0;
  for (const cls of ctx.classes.values()) {
    const demoRoster = cls.demo ? P.CLASS_8B_ROSTER : null;
    for (let i = 0; i < cls.studentCount; i++) {
      const rosterEntry = demoRoster ? demoRoster[i] : null;
      const name = makeStudentName(rosterEntry, i);
      const archetypeKey = rosterEntry?.archetype ?? pick(rng, P.BACKGROUND_POOL);
      const archetype = P.ARCHETYPES[archetypeKey];
      const dob = addDays(TODAY, -(12 * 365 + int(rng, 0, 300)));

      const userId = nid("usr");
      const studentId = nid("std");
      const email = uniqueEmail(`${name.first}.${name.last}`, DOMAIN);

      studentUsers.push({
        id: userId,
        schoolId: ctx.schoolId,
        email,
        passwordHash: "PLACEHOLDER",
        firstName: name.first,
        lastName: name.last,
        locale: "en",
        theme: "dark",
        isActive: true,
      });
      students.push({
        id: studentId,
        userId,
        schoolId: ctx.schoolId,
        studentNumber: `${cls.name}-${String(i + 1).padStart(2, "0")}`,
        dateOfBirth: dob,
        gender: name.gender,
        currentClassId: cls.id,
        advisorTeacherId: cls.teacherId,
        enrolledAt: HISTORY_FROM,
        status: "ACTIVE",
      });
      enrollments.push({
        id: nid("enr"),
        studentId,
        classId: cls.id,
        academicYearId: ctx.yearId,
        status: "ACTIVE",
        joinedAt: HISTORY_FROM,
      });

      // One or two guardians
      const guardianCount = chance(rng, 0.78) ? 2 : 1;
      for (let g = 0; g < guardianCount; g++) {
        const gFirst = chance(rng, 0.5) ? pick(rng, P.FIRST_NAMES_F) : pick(rng, P.FIRST_NAMES_M);
        const gLast = name.last;
        const gEmail = uniqueEmail(`${gFirst}.${gLast}.${String(g + 1)}`, DOMAIN);
        const gUserId = nid("usr");
        const gId = nid("grd");

        guardianUsers.push({
          id: gUserId,
          schoolId: ctx.schoolId,
          email: gEmail,
          passwordHash: "PLACEHOLDER",
          firstName: gFirst,
          lastName: gLast,
          locale: "en",
          theme: "light",
          isActive: true,
        });
        guardians.push({
          id: gId,
          userId: gUserId,
          schoolId: ctx.schoolId,
          preferredContact: "EMAIL",
          status: "ACTIVE",
        });
        relationships.push({
          id: nid("psr"),
          guardianId: gId,
          studentId,
          relationship: g === 0 ? "PARENT" : "GUARDIAN",
          isPrimary: g === 0,
        });
      }
    }
  }

  // Hash passwords in bulk-friendly chunks (createMany won't run hooks, so we pre-hash)
  const hashes = await Promise.all(Array(studentUsers.length + guardianUsers.length).fill(0).map(() => hashPassword(DEMO_PASSWORD)));
  let hashIdx = 0;
  for (const u of studentUsers) u.passwordHash = hashes[hashIdx++];
  for (const u of guardianUsers) u.passwordHash = hashes[hashIdx++];

  await bulk("Student users", studentUsers, (chunk) => prisma.user.createMany({ data: chunk }));
  await bulk("Guardian users", guardianUsers, (chunk) => prisma.user.createMany({ data: chunk }));
  await bulk("Students", students, (chunk) => prisma.student.createMany({ data: chunk }));
  await bulk("Guardians", guardians, (chunk) => prisma.guardian.createMany({ data: chunk }));

  // Create roles for students and guardians
  const userRoles: Prisma.UserRoleCreateManyInput[] = [
    ...studentUsers.map((u) => ({ id: nid("urole"), userId: u.id!, roleCode: ROLES.STUDENT, schoolId: ctx.schoolId })),
    ...guardianUsers.map((u) => ({ id: nid("urole"), userId: u.id!, roleCode: ROLES.PARENT, schoolId: ctx.schoolId })),
  ];
  await bulk("User roles", userRoles, (chunk) => prisma.userRole.createMany({ data: chunk }));

  await bulk("Relationships", relationships, (chunk) => prisma.parentStudentRelationship.createMany({ data: chunk }));
  await bulk("Enrollments", enrollments, (chunk) => prisma.enrollment.createMany({ data: chunk }));

  // Build caches
  const createdStudents = await prisma.student.findMany({
    where: { schoolId: ctx.schoolId },
    include: { user: true },
  });
  const createdGuardians = await prisma.guardian.findMany({
    where: { schoolId: ctx.schoolId },
    include: { user: true },
  });

  for (const s of createdStudents) {
    const cls = [...ctx.classes.values()].find((c) => c.id === s.currentClassId)!;
    const demoEntry = cls.demo ? P.CLASS_8B_ROSTER.find((r) => r.first === s.user.firstName && r.last === s.user.lastName) : null;
    const archetypeKey = demoEntry?.archetype ?? "STABLE";
    ctx.students.set(s.id, {
      id: s.id,
      userId: s.userId,
      first: s.user.firstName,
      last: s.user.lastName,
      classId: s.currentClassId!,
      className: cls.name,
      archetype: P.ARCHETYPES[archetypeKey],
      gender: s.gender ?? "OTHER",
    });
  }
  for (const g of createdGuardians) {
    ctx.guardians.set(g.id, { id: g.id, userId: g.userId, first: g.user.firstName, last: g.user.lastName });
  }
}

// ---------------------------------------------------------------------------
// Phase 5 — Historical data
// ---------------------------------------------------------------------------

async function seedCheckIns(ctx: SchoolContext) {
  section("Daily check-ins");
  const rows: Prisma.DailyCheckInCreateManyInput[] = [];
  for (const student of ctx.students.values()) {
    for (const day of HISTORY_DAYS) {
      const profile = profileForDay(student.archetype, day, HISTORY_FROM, HISTORY_TO);
      if (!chance(rng, profile.checkin)) continue;

      const mood = scale5(rng, profile.mood);
      const energy = scale5(rng, profile.energy);
      const motivation = scale5(rng, profile.motivation);
      const stress = scale5(rng, profile.stress);
      const understanding = scale5(rng, 3.0 + (profile.academic - 50) / 50);

      let homeworkStatus: string;
      const h = rng();
      if (h < profile.homework) homeworkStatus = HOMEWORK_STATUS.DONE;
      else if (h < profile.homework + 0.2) homeworkStatus = HOMEWORK_STATUS.PARTIAL;
      else if (h < profile.homework + 0.35) homeworkStatus = HOMEWORK_STATUS.NOT_DONE;
      else homeworkStatus = HOMEWORK_STATUS.NEED_HELP;

      const needsHelp = homeworkStatus === HOMEWORK_STATUS.NEED_HELP || chance(rng, 0.03);
      const notePool = mood >= 4 ? P.CHECKIN_NOTES_POSITIVE : mood <= 2 ? P.CHECKIN_NOTES_DIFFICULT : P.CHECKIN_NOTES_NEUTRAL;

      rows.push({
        id: nid("cin"),
        schoolId: ctx.schoolId,
        studentId: student.id,
        date: day,
        mood,
        energy,
        motivation,
        stress,
        understanding,
        homeworkStatus,
        needsHelp,
        helpTopic: needsHelp ? pick(rng, P.HELP_TOPICS) : null,
        helpMessage: needsHelp && chance(rng, 0.4) ? pick(rng, P.CHECKIN_NOTES_DIFFICULT) : null,
        supportOptions: needsHelp
          ? JSON.stringify(
              pickMany(
                rng,
                ["A short explanation of today's lesson", "More time for homework", "Someone to study with", "A quiet moment", "Help organising my work", "To talk with my teacher"],
                int(rng, 1, 2),
              ),
            )
          : null,
        note: chance(rng, 0.25) ? pick(rng, notePool) : null,
        visibility: VISIBILITY.SCHOOL_STAFF,
        source: "STUDENT_APP",
        status: "SUBMITTED",
      });
    }
  }
  await bulk("Check-ins", rows, (chunk) => prisma.dailyCheckIn.createMany({ data: chunk }));
}

async function seedAttendance(ctx: SchoolContext) {
  section("Attendance");
  const rows: Prisma.AttendanceRecordCreateManyInput[] = [];
  for (const student of ctx.students.values()) {
    for (const day of HISTORY_DAYS) {
      const profile = profileForDay(student.archetype, day, HISTORY_FROM, HISTORY_TO);
      const present = chance(rng, profile.attendance);
      let status = present ? ATTENDANCE_STATUS.PRESENT : ATTENDANCE_STATUS.ABSENT;
      let minutesLate = 0;
      let justified = false;
      let reason: string | null = null;

      if (present && chance(rng, profile.latenessRate ?? 0.05)) {
        status = ATTENDANCE_STATUS.LATE as typeof ATTENDANCE_STATUS.PRESENT;
        minutesLate = int(rng, 5, 25);
      }
      if (!present && chance(rng, 0.25)) {
        status = ATTENDANCE_STATUS.EXCUSED as typeof ATTENDANCE_STATUS.ABSENT;
        justified = true;
        reason = "Family appointment / illness";
      }

      rows.push({
        id: nid("att"),
        schoolId: ctx.schoolId,
        studentId: student.id,
        classId: student.classId,
        date: day,
        period: null,
        status,
        minutesLate,
        reason,
        justified,
        recordedById: ctx.homeroomTeacherId,
        source: "TEACHER_APP",
      });
    }
  }
  await bulk("Attendance records", rows, (chunk) => prisma.attendanceRecord.createMany({ data: chunk }));
}

async function seedHomeworkAndSubmissions(ctx: SchoolContext) {
  section("Homework & submissions");
  const homeworkRows: Prisma.HomeworkCreateManyInput[] = [];
  const homeworkByClass = new Map<string, { id: string; subjectId: string; dueDate: Date }[]>();

  // Generate homework per class, per subject, ~2 per week
  for (const cls of ctx.classes.values()) {
    const list: { id: string; subjectId: string; dueDate: Date }[] = [];
    const weeks = groupByWeek(HISTORY_DAYS);
    for (const week of weeks) {
      const subjectIds = pickMany(rng, cls.subjectIds, 5);
      for (const subjectId of subjectIds) {
        const subjectCode = [...subjectsCodeById.entries()].find(([, v]) => v === subjectId)?.[0] ?? "MATH";
        const assigned = week[int(rng, 0, week.length - 1)];
        const due = addDays(assigned, int(rng, 2, 4));
        const id = nid("hw");
        const title = pick(rng, P.HOMEWORK_TITLES[subjectCode] ?? P.HOMEWORK_TITLES.MATH);
        homeworkRows.push({
          id,
          schoolId: ctx.schoolId,
          classId: cls.id,
          subjectId,
          title,
          assignedDate: assigned,
          dueDate: due,
          estimatedMinutes: int(rng, 15, 45),
          createdById: [...ctx.teachers.values()].find((t) => t.subjectCode === subjectCode)?.id ?? cls.teacherId,
          status: "PUBLISHED",
          weight: 1,
        });
        list.push({ id, subjectId, dueDate: due });
      }
    }
    homeworkByClass.set(cls.id, list);
  }
  await bulk("Homework", homeworkRows, (chunk) => prisma.homework.createMany({ data: chunk }));

  // Submissions
  const submissionRows: Prisma.HomeworkSubmissionCreateManyInput[] = [];
  for (const student of ctx.students.values()) {
    const homeworks = homeworkByClass.get(student.classId) ?? [];
    for (const hw of homeworks) {
      const profile = profileForDay(student.archetype, hw.dueDate, HISTORY_FROM, HISTORY_TO);
      const h = rng();
      let status: string;
      if (h < profile.homework * 0.85) status = SUBMISSION_STATUS.COMPLETED;
      else if (h < profile.homework * 0.85 + 0.12) status = SUBMISSION_STATUS.PARTIAL;
      else if (h < profile.homework * 0.85 + 0.22) status = SUBMISSION_STATUS.NOT_DONE;
      else if (h < profile.homework * 0.85 + 0.32) status = SUBMISSION_STATUS.LATE;
      else status = SUBMISSION_STATUS.MISSING;

      const submittedAt = status === SUBMISSION_STATUS.COMPLETED || status === SUBMISSION_STATUS.LATE
        ? addDays(hw.dueDate, status === SUBMISSION_STATUS.LATE ? int(rng, 1, 2) : int(rng, -1, 0))
        : null;

      submissionRows.push({
        id: nid("subm"),
        schoolId: ctx.schoolId,
        homeworkId: hw.id,
        studentId: student.id,
        status,
        submittedAt,
        minutesSpent: status === SUBMISSION_STATUS.COMPLETED || status === SUBMISSION_STATUS.LATE ? int(rng, 20, 60) : null,
        qualityScore: status === SUBMISSION_STATUS.COMPLETED ? score100(rng, profile.academic) : status === SUBMISSION_STATUS.PARTIAL ? score100(rng, profile.academic * 0.7) : null,
        teacherFeedback: (status === SUBMISSION_STATUS.PARTIAL || status === SUBMISSION_STATUS.LATE) && chance(rng, 0.5)
          ? pick(rng, P.TEACHER_FEEDBACK_SUPPORT)
          : status === SUBMISSION_STATUS.COMPLETED && chance(rng, 0.3)
            ? pick(rng, P.TEACHER_FEEDBACK_POSITIVE)
            : null,
      });
    }
  }
  await bulk("Submissions", submissionRows, (chunk) => prisma.homeworkSubmission.createMany({ data: chunk }));
}

async function seedAssessmentsAndGrades(ctx: SchoolContext) {
  section("Assessments & grades");
  const assessmentRows: Prisma.AssessmentCreateManyInput[] = [];
  const assessmentsByClass = new Map<string, { id: string; subjectId: string; date: Date }[]>();

  for (const cls of ctx.classes.values()) {
    const list: { id: string; subjectId: string; date: Date }[] = [];
    const weeks = groupByWeek(HISTORY_DAYS);
    for (const week of weeks) {
      // ~2 assessments per week per class
      const subjectIds = pickMany(rng, cls.subjectIds, 2);
      for (const subjectId of subjectIds) {
        const subjectCode = [...subjectsCodeById.entries()].find(([, v]) => v === subjectId)?.[0] ?? "MATH";
        const date = week[int(rng, 0, week.length - 1)];
        const id = nid("ass");
        assessmentRows.push({
          id,
          schoolId: ctx.schoolId,
          classId: cls.id,
          subjectId,
          termId: ctx.termId,
          title: pick(rng, P.ASSESSMENT_TITLES[subjectCode] ?? P.ASSESSMENT_TITLES.MATH),
          type: pick(rng, ["QUIZ", "TEST", "PROJECT", "ORAL"]),
          date,
          maxScore: 20,
          weight: 1,
          gradingSystem: "NUMERIC_20",
          status: "PUBLISHED",
        });
        list.push({ id, subjectId, date });
      }
    }
    assessmentsByClass.set(cls.id, list);
  }
  await bulk("Assessments", assessmentRows, (chunk) => prisma.assessment.createMany({ data: chunk }));

  const gradeRows: Prisma.GradeCreateManyInput[] = [];
  for (const student of ctx.students.values()) {
    const assessments = assessmentsByClass.get(student.classId) ?? [];
    for (const a of assessments) {
      const profile = profileForDay(student.archetype, a.date, HISTORY_FROM, HISTORY_TO);
      const score = Math.min(20, Math.max(0, (profile.academic / 100) * 20 + jitter(rng, 3)));
      gradeRows.push({
        id: nid("grd"),
        schoolId: ctx.schoolId,
        assessmentId: a.id,
        studentId: student.id,
        score,
        percentage: Math.round((score / 20) * 100),
        comment: chance(rng, 0.1) ? pick(rng, [...P.TEACHER_FEEDBACK_POSITIVE, ...P.TEACHER_FEEDBACK_SUPPORT]) : null,
        visibility: VISIBILITY.INCLUDING_PARENTS,
      });
    }
  }
  await bulk("Grades", gradeRows, (chunk) => prisma.grade.createMany({ data: chunk }));
}

async function seedObservations(ctx: SchoolContext) {
  section("Teacher observations");
  const rows: Prisma.TeacherObservationCreateManyInput[] = [];
  const categories = Object.keys(P.OBSERVATION_NOTES);

  for (const student of ctx.students.values()) {
    // ~2 observations per week for demo class, ~1 for others
    const cls = ctx.classes.get(student.classId)!;
    const obsPerWeek = cls.demo ? 2 : 1;
    const weeks = groupByWeek(HISTORY_DAYS);
    for (const week of weeks) {
      for (let i = 0; i < obsPerWeek; i++) {
        const day = week[int(rng, 0, week.length - 1)];
        const profile = profileForDay(student.archetype, day, HISTORY_FROM, HISTORY_TO);
        const category = pick(rng, categories);
        const base = P.OBSERVATION_NOTES[category];

        // Choose sentiment biased by archetype trajectory
        const improving = profile.motivation > student.archetype.start.motivation + 0.2;
        let sentiment: "POSITIVE" | "NEUTRAL" | "ATTENTION" = "NEUTRAL";
        if (category === "IMPROVEMENT" || improving) {
          sentiment = chance(rng, 0.6) ? "POSITIVE" : "NEUTRAL";
        } else if (profile.motivation < 2.8 || profile.homework < 0.5) {
          sentiment = chance(rng, 0.45) ? "ATTENTION" : "NEUTRAL";
        } else {
          sentiment = chance(rng, 0.35) ? "POSITIVE" : "NEUTRAL";
        }

        const notes = base[sentiment.toLowerCase() as keyof typeof base] ?? base.neutral;
        const note = notes.length ? pick(rng, notes) : base.neutral[0];
        const value = Math.round(clampRange(profile.engagement * 5 + jitter(rng, 0.7), 1, 5));

        rows.push({
          id: nid("obs"),
          schoolId: ctx.schoolId,
          studentId: student.id,
          teacherId: cls.teacherId,
          classId: student.classId,
          subjectId: pick(rng, cls.subjectIds),
          category,
          sentiment,
          value,
          note,
          followUpAction: sentiment === SENTIMENTS.ATTENTION && chance(rng, 0.3) ? "Check in with student this week" : null,
          isQuickInput: chance(rng, 0.4),
          visibility: VISIBILITY.SCHOOL_STAFF,
          occurredAt: atTime(day, `${int(rng, 8, 15)}:${int(rng, 0, 5)}0`),
        });
      }
    }
  }
  await bulk("Observations", rows, (chunk) => prisma.teacherObservation.createMany({ data: chunk }));
}

// ---------------------------------------------------------------------------
// Phase 6 — Goals, interventions, achievements, parent inputs
// ---------------------------------------------------------------------------

async function seedGoalsAndInterventions(ctx: SchoolContext) {
  section("Goals, interventions & achievements");
  const goalRows: Prisma.StudentGoalCreateManyInput[] = [];
  const interventionRows: Prisma.InterventionCreateManyInput[] = [];
  const achievementRows: Prisma.AchievementCreateManyInput[] = [];

  for (const student of ctx.students.values()) {
    const cls = ctx.classes.get(student.classId)!;
    const profile = profileForDay(student.archetype, HISTORY_TO, HISTORY_FROM, HISTORY_TO);

    // 1–2 goals per student
    const goalCount = int(rng, 1, 2);
    const templates = pickMany(rng, P.GOAL_TEMPLATES, goalCount);
    for (const tpl of templates) {
      const start = addDays(HISTORY_TO, -45);
      const target = addDays(HISTORY_TO, 21);
      const progress = int(rng, 30, 80);
      goalRows.push({
        id: nid("goal"),
        schoolId: ctx.schoolId,
        studentId: student.id,
        title: tpl.title,
        ownerType: pick(rng, ["STUDENT", "TEACHER", "SHARED"]),
        createdById: cls.teacherId,
        category: tpl.category,
        startDate: start,
        targetDate: target,
        progress,
        status: progress >= 100 ? "ACHIEVED" : "ACTIVE",
        metric: tpl.metric,
        visibility: VISIBILITY.INCLUDING_STUDENT,
      });
    }

    // Interventions for students with support archetypes or declining profiles
    if (student.archetype.key === "HOMEWORK_STRUGGLE" || student.archetype.key === "ATTENDANCE_DECLINE" || student.archetype.key === "NEEDS_SUPPORT") {
      const tpl = pick(rng, P.INTERVENTION_TEMPLATES);
      interventionRows.push({
        id: nid("intv"),
        schoolId: ctx.schoolId,
        studentId: student.id,
        title: tpl.title,
        issue: tpl.issue,
        action: tpl.action,
        responsible: tpl.responsible,
        frequency: "WEEKLY",
        startDate: addDays(HISTORY_TO, -35),
        endDate: addDays(HISTORY_TO, 30),
        successIndicator: tpl.successIndicator,
        baselineValue: student.archetype.start.homework * 100,
        targetValue: 80,
        currentValue: profile.homework * 100,
        status: "ACTIVE",
        visibility: VISIBILITY.INCLUDING_PARENTS,
      });
    }

    // Achievements for strong / improving students
    if (student.archetype.key === "STRONG_IMPROVEMENT" || student.archetype.key === "HIGHLY_ENGAGED" || student.archetype.key === "EXCELLENT_ATTENDANCE") {
      const tpl = pick(rng, P.ACHIEVEMENT_TEMPLATES);
      achievementRows.push({
        id: nid("ach"),
        schoolId: ctx.schoolId,
        studentId: student.id,
        title: tpl.title,
        description: tpl.description,
        category: tpl.category,
        icon: tpl.icon,
        level: tpl.level,
        awardedById: cls.teacherId,
        awardedAt: addDays(HISTORY_TO, -int(rng, 1, 14)),
        visibility: VISIBILITY.INCLUDING_PARENTS,
      });
    }
  }

  await bulk("Goals", goalRows, (chunk) => prisma.studentGoal.createMany({ data: chunk }));
  await bulk("Interventions", interventionRows, (chunk) => prisma.intervention.createMany({ data: chunk }));
  await bulk("Achievements", achievementRows, (chunk) => prisma.achievement.createMany({ data: chunk }));
}

async function seedParentInputs(ctx: SchoolContext) {
  section("Parent inputs");
  const rows: Prisma.ParentInputCreateManyInput[] = [];
  const relationships = await prisma.parentStudentRelationship.findMany({
    where: { studentId: { in: [...ctx.students.keys()] } },
  });
  for (const student of ctx.students.values()) {
    const studentGuardians = [...ctx.guardians.values()].filter((g) => relationships.some((r) => r.studentId === student.id && r.guardianId === g.id));
    const guardianPool = studentGuardians.length ? studentGuardians : [...ctx.guardians.values()].slice(0, 2);
    const count = int(rng, 2, 5);
    for (let i = 0; i < count; i++) {
      const day = pick(rng, HISTORY_DAYS);
      const typeDef = pick(rng, [
        { code: "HOMEWORK_SUPPORT", label: "Homework support provided", icon: "book-open" },
        { code: "OBSERVATION", label: "General observation", icon: "eye" },
        { code: "COMMENT", label: "Comment", icon: "message-circle" },
        { code: "INFO_FOR_SCHOOL", label: "Information for the school", icon: "info" },
        { code: "ACKNOWLEDGEMENT", label: "Acknowledge school message", icon: "check-check" },
        { code: "MESSAGE_TO_TEACHER", label: "Message to teacher", icon: "send" },
      ]);
      const type = typeDef.code;
      rows.push({
        id: nid("pin"),
        schoolId: ctx.schoolId,
        guardianId: pick(rng, guardianPool).id,
        studentId: student.id,
        type,
        content: pick(rng, P.PARENT_INPUT_TEXT[type] ?? P.PARENT_INPUT_TEXT.COMMENT),
        minutesSupported: type === "HOMEWORK_SUPPORT" ? int(rng, 15, 60) : null,
        moodAtHome: type === "OBSERVATION" ? int(rng, 2, 5) : null,
        visibility: VISIBILITY.SCHOOL_STAFF,
        occurredAt: atTime(day, "19:00"),
      });
    }
  }
  await bulk("Parent inputs", rows, (chunk) => prisma.parentInput.createMany({ data: chunk }));
}

// ---------------------------------------------------------------------------
// Phase 7 — Alerts, snapshots, activity events
// ---------------------------------------------------------------------------

async function seedAlerts(ctx: SchoolContext) {
  section("Alerts");
  const rows: Prisma.AlertCreateManyInput[] = [];

  for (const student of ctx.students.values()) {
    const profileStart = profileForDay(student.archetype, HISTORY_FROM, HISTORY_FROM, HISTORY_TO);
    const profileEnd = profileForDay(student.archetype, HISTORY_TO, HISTORY_FROM, HISTORY_TO);

    const reasons: { label: string; detail: string; metric?: string; from?: number; to?: number }[] = [];
    let code: string | null = null;
    let level: string = ALERT_LEVELS.WATCH;
    let title = "";

    if (profileEnd.homework < profileStart.homework - 0.15) {
      code = SIGNAL_CODES.HOMEWORK_DECLINE;
      level = ALERT_LEVELS.ACTION_SUGGESTED;
      title = "Homework completion has declined";
      reasons.push({ label: "Homework completion", detail: `Dropped from ${Math.round(profileStart.homework * 100)}% to ${Math.round(profileEnd.homework * 100)}%`, metric: "%", from: Math.round(profileStart.homework * 100), to: Math.round(profileEnd.homework * 100) });
    }
    if (profileEnd.attendance < profileStart.attendance - 0.15) {
      code = SIGNAL_CODES.ATTENDANCE_DECLINE;
      level = ALERT_LEVELS.ACTION_SUGGESTED;
      title = "Attendance has declined";
      reasons.push({ label: "Attendance", detail: `Dropped from ${Math.round(profileStart.attendance * 100)}% to ${Math.round(profileEnd.attendance * 100)}%`, metric: "%", from: Math.round(profileStart.attendance * 100), to: Math.round(profileEnd.attendance * 100) });
    }
    if (profileEnd.motivation < profileStart.motivation - 0.6) {
      code = code ?? SIGNAL_CODES.MOTIVATION_DROP;
      level = ALERT_LEVELS.WATCH;
      title = title || "Motivation has declined";
      reasons.push({ label: "Self-reported motivation", detail: `From ${profileStart.motivation.toFixed(1)} to ${profileEnd.motivation.toFixed(1)}`, from: profileStart.motivation, to: profileEnd.motivation });
    }

    if (code) {
      rows.push({
        id: nid("alr"),
        schoolId: ctx.schoolId,
        studentId: student.id,
        level,
        code,
        title,
        summary: reasons.map((r) => r.detail).join("; "),
        reasons: JSON.stringify(reasons),
        signalCount: reasons.length,
        confidence: reasons.length > 1 ? "HIGH" : "MEDIUM",
        status: "OPEN",
        detectedAt: HISTORY_TO,
        visibility: VISIBILITY.SCHOOL_STAFF,
      });
    }
  }
  await bulk("Alerts", rows, (chunk) => prisma.alert.createMany({ data: chunk }));
}

async function seedSnapshots(ctx: SchoolContext) {
  section("Indicator snapshots");
  const rows: Prisma.StudentIndicatorSnapshotCreateManyInput[] = [];
  const weeks = groupByWeek(HISTORY_DAYS);

  for (const student of ctx.students.values()) {
    for (const week of weeks) {
      const mid = week[Math.floor(week.length / 2)];
      const profile = profileForDay(student.archetype, mid, HISTORY_FROM, HISTORY_TO);
      const prevWeek = weeks[weeks.indexOf(week) - 1];
      const prevProfile = prevWeek ? profileForDay(student.archetype, prevWeek[0], HISTORY_FROM, HISTORY_TO) : profile;
      const start = monday(week[0]);
      const end = addDays(start, 6);

      rows.push({
        id: nid("snap"),
        schoolId: ctx.schoolId,
        studentId: student.id,
        periodStart: start,
        periodEnd: end,
        granularity: "WEEK",
        academic: Math.round(profile.academic),
        engagement: Math.round(profile.engagement * 100),
        homework: Math.round(profile.homework * 100),
        attendance: Math.round(profile.attendance * 100),
        motivation: Math.round(profile.motivation * 20),
        wellbeing: Math.round(profile.mood * 20),
        participation: Math.round(profile.engagement * 100),
        overallTrend: profile.academic > prevProfile.academic + 3 ? "UP" : profile.academic < prevProfile.academic - 3 ? "DOWN" : "STABLE",
      });
    }
  }
  await bulk("Snapshots", rows, (chunk) => prisma.studentIndicatorSnapshot.createMany({ data: chunk }));
}

async function seedActivityEvents(ctx: SchoolContext) {
  section("Activity events");
  const rows: Prisma.ActivityEventCreateManyInput[] = [];

  // One event per check-in
  const checkIns = await prisma.dailyCheckIn.findMany({ where: { schoolId: ctx.schoolId } });
  for (const ci of checkIns) {
    rows.push({
      id: nid("evt"),
      schoolId: ctx.schoolId,
      studentId: ci.studentId,
      type: ci.needsHelp ? "HELP_REQUEST" : "CHECK_IN",
      title: ci.needsHelp ? "Student requested assistance" : "Student daily check-in",
      description: ci.note ?? undefined,
      sentiment: ci.mood >= 4 ? "POSITIVE" : ci.mood <= 2 ? "ATTENTION" : "NEUTRAL",
      icon: ci.needsHelp ? "life-buoy" : "smile",
      refType: "DailyCheckIn",
      refId: ci.id,
      visibility: VISIBILITY.SCHOOL_STAFF,
      occurredAt: atTime(ci.date, `${int(rng, 7, 8)}:${int(rng, 0, 5)}${int(rng, 0, 9)}`),
    });
  }

  // One event per observation
  const observations = await prisma.teacherObservation.findMany({ where: { schoolId: ctx.schoolId } });
  for (const obs of observations) {
    rows.push({
      id: nid("evt"),
      schoolId: ctx.schoolId,
      studentId: obs.studentId,
      actorId: ctx.teachers.get(obs.teacherId)?.userId,
      type: "OBSERVATION",
      title: `${OBSERVATION_CATEGORY_LABELS[obs.category] ?? "Observation"} — ${obs.sentiment.toLowerCase()}`,
      description: obs.note ?? undefined,
      sentiment: obs.sentiment,
      icon: "eye",
      refType: "TeacherObservation",
      refId: obs.id,
      visibility: VISIBILITY.SCHOOL_STAFF,
      occurredAt: obs.occurredAt,
    });
  }

  // One event per achievement
  const achievements = await prisma.achievement.findMany({ where: { schoolId: ctx.schoolId } });
  for (const a of achievements) {
    rows.push({
      id: nid("evt"),
      schoolId: ctx.schoolId,
      studentId: a.studentId,
      type: "ACHIEVEMENT",
      title: a.title,
      description: a.description ?? undefined,
      sentiment: "POSITIVE",
      icon: a.icon,
      refType: "Achievement",
      refId: a.id,
      visibility: VISIBILITY.INCLUDING_PARENTS,
      occurredAt: a.awardedAt,
    });
  }

  await bulk("Activity events", rows, (chunk) => prisma.activityEvent.createMany({ data: chunk }));
}

// ---------------------------------------------------------------------------
// Phase 8 — Enriched student file (Phase 1)
// ---------------------------------------------------------------------------

const NATIONALITIES = ["MA", "MA", "MA", "MA", "FR", "FR", "GB", "US", "CA", "SN", "CI", "LB"];
const CITIES_MA = ["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Meknès"];
const CITIES_ABROAD = ["Paris", "Lyon", "Londres", "Montréal", "Dakar", "Abidjan", "Beyrouth"];
const STREET_NAMES = [
  "Rue Ibn Sina",
  "Avenue Hassan II",
  "Boulevard de la Corniche",
  "Rue de la Liberté",
  "Boulevard Zerktouni",
  "Rue du Parc",
  "Avenue des FAR",
  "Rue Al Qods",
  "Boulevard Moulay Youssef",
  "Rue de l'Atlas",
];
const DISTRICTS = ["Maârif", "Anfa", "Gauthier", "Bourgogne", "Aïn Diab", "Californie", "Palmiers", "Racine", "CIL", "Val d'Anfa"];
const PREVIOUS_SCHOOLS = [
  "École Ibn Batouta",
  "Groupe Scolaire La Résidence",
  "École Al Jabr",
  "Collège Descartes",
  "Groupe Scolaire Al Manar",
  "École Léon l'Africain",
  "Collège Paul Valéry",
  "Lycée Maupassant",
];
const TRANSFER_REASONS = ["Family move", "New schooling project", "Change of neighbourhood", "Recommendation from a family member"];
const LANGUAGE_NAMES = ["French", "Arabic", "English", "Spanish", "Berber"];

const ALLERGY_POOL = ["Peanuts", "Lactose", "Pollen", "Dust mites", "Latex", "Shellfish", "Penicillin"];
const CHRONIC_POOL = ["Asthma", "Eczema", "Type 1 diabetes", "Epilepsy", "Migraine"];
const MEDICATION_BY_DISEASE: Record<string, string[]> = {
  Asthma: ["Inhaler (salbutamol)"],
  "Type 1 diabetes": ["Insulin pump"],
  Epilepsy: ["Anticonvulsant (prescribed)"],
  Migraine: ["Paracetamol (as needed)"],
  Eczema: ["Emollient cream"],
};
const SPORTS_RESTRICTIONS = ["Avoid contact sports", "No PE when pollen counts are high", "Swimming only with supervision", "No prolonged running"];
const EMERGENCY_PROTOCOLS = [
  "Contact parents immediately; keep the child lying down and calm.",
  "Administer antihistamine if prescribed, then contact parents.",
  "Give 2 puffs of the inhaler, monitor 10 minutes, then contact parents.",
  "Contact parents; do not administer any medication.",
];

async function seedPhase1Identity(ctx: SchoolContext) {
  section("Phase 1 — Student identity & logistics");
  const studentRows = await prisma.student.findMany({
    where: { schoolId: ctx.schoolId },
    include: { user: true },
  });
  const homes: Prisma.StudentUncheckedUpdateInput[] = [];
  for (const s of studentRows) {
    const nationality = pick(rng, NATIONALITIES);
    const cityPool = nationality === "MA" ? CITIES_MA : [...CITIES_MA.slice(0, 2), ...CITIES_ABROAD];
    const regime = chance(rng, 0.7) ? "EXTERN" : chance(rng, 0.7) ? "HALF_BOARD" : "BOARDER";
    const transportRoll = rng();
    const transportMode = transportRoll < 0.35 ? "BUS" : transportRoll < 0.75 ? "CAR" : transportRoll < 0.95 ? "WALK" : "OTHER";
    const previousSchool = chance(rng, 0.55) ? pick(rng, PREVIOUS_SCHOOLS) : null;
    const homeLanguageRoll = rng();
    const homeLanguage = homeLanguageRoll < 0.35 ? "fr" : homeLanguageRoll < 0.7 ? "ar" : homeLanguageRoll < 0.9 ? "en" : "es";
    homes.push({
      nationality,
      birthplace: pick(rng, cityPool),
      address: `${int(rng, 3, 180)} ${pick(rng, STREET_NAMES)}, ${pick(rng, DISTRICTS)}, Casablanca`,
      regime,
      transportMode,
      busLine: transportMode === "BUS" ? `L${int(rng, 1, 9)}` : null,
      previousSchool,
      transferReason: previousSchool && chance(rng, 0.5) ? pick(rng, TRANSFER_REASONS) : null,
      homeLanguage,
      languagesSpoken: pickMany(rng, LANGUAGE_NAMES, int(rng, 1, 3)).join(", "),
    });
  }
  for (let i = 0; i < studentRows.length; i += 40) {
    const chunkRows = studentRows.slice(i, i + 40);
    const chunkData = homes.slice(i, i + 40);
    await Promise.all(chunkRows.map((s, j) => prisma.student.update({ where: { id: s.id }, data: chunkData[j] })));
  }
}

async function seedPhase1Medical(ctx: SchoolContext) {
  section("Phase 1 — Medical records");
  const rows: Prisma.MedicalRecordCreateManyInput[] = [];
  for (const student of ctx.students.values()) {
    if (!chance(rng, 0.15)) continue;
    const bloodType = pick(rng, ["A+", "A+", "A-", "B+", "B-", "AB+", "O+", "O-", "O+"]);
    const allergy = chance(rng, 0.35) ? pick(rng, ALLERGY_POOL) : null;
    const chronic = chance(rng, 0.3) ? pick(rng, CHRONIC_POOL) : null;
    let protocol = pick(rng, EMERGENCY_PROTOCOLS);
    if (allergy === "Peanuts") protocol = "Administer epinephrine pen (kept in the infirmary) and call emergency services.";
    else if (chronic === "Asthma") protocol = "Give 2 puffs of the inhaler, monitor 10 minutes, then contact parents.";
    else if (chronic === "Type 1 diabetes") protocol = "Contact parents immediately; do not administer any medication or insulin.";
    rows.push({
      id: nid("med"),
      schoolId: ctx.schoolId,
      studentId: student.id,
      bloodType,
      allergies: allergy,
      chronicDiseases: chronic,
      medications: chronic ? pick(rng, MEDICATION_BY_DISEASE[chronic]) : null,
      treatingPhysician: `Dr. ${pick(rng, P.FIRST_NAMES_M)} ${pick(rng, P.LAST_NAMES)}`,
      physicianPhone: `+212 6${int(rng, 10, 99)}-${int(rng, 100000, 999999)}`,
      sportsRestrictions: chance(rng, 0.3) ? pickMany(rng, SPORTS_RESTRICTIONS, int(rng, 1, 2)).join(", ") : null,
      emergencyProtocol: protocol,
      emergencyProtocolVisibleToTeachers: chance(rng, 0.85),
    });
  }
  await bulk("Medical records", rows, (chunk) => prisma.medicalRecord.createMany({ data: chunk }));
}

async function seedPhase1DailyRatings(ctx: SchoolContext) {
  section("Phase 1 — Daily ratings (by exception)");
  const rows: Prisma.DailyRatingCreateManyInput[] = [];
  const recentDays = schoolDaysBack(TODAY, 10);
  const problemArchetypes = ["HOMEWORK_STRUGGLE", "ATTENDANCE_DECLINE", "HIGH_ACADEMIC_LOW_MOTIVATION"];
  const strongArchetypes = ["HIGHLY_ENGAGED", "EXCELLENT_ATTENDANCE", "STRONG_IMPROVEMENT", "IMPROVING", "QUIET_STRONG"];

  for (const student of ctx.students.values()) {
    const dayChance = problemArchetypes.includes(student.archetype.key) ? 0.3 : strongArchetypes.includes(student.archetype.key) ? 0.12 : 0.15;
    const recordedBy = [...ctx.teachers.values()].find((t) => t.id === [...ctx.classes.values()].find((c) => c.id === student.classId)?.teacherId)?.userId;
    for (const day of recentDays) {
      if (!chance(rng, dayChance)) continue;
      const row: Prisma.DailyRatingCreateManyInput = {
        id: nid("rate"),
        schoolId: ctx.schoolId,
        studentId: student.id,
        date: day,
        recordedById: recordedBy,
        note: chance(rng, 0.3)
          ? pick(rng, ["Two assignments missing this morning.", "Arrived late; homework not handed in.", "Very involved in group work today.", "Focused all day — great concentration."])
          : null,
      };
      const flagged = pickMany(rng, [...DAILY_RATING_CRITERIA], int(rng, 1, 3)).map((c) => c.code);
      const positiveDay = strongArchetypes.includes(student.archetype.key) && chance(rng, 0.35);
      for (const c of flagged) {
        const value = positiveDay ? 5 : rng() < 0.55 ? int(rng, 1, 2) : int(rng, 3, 4);
        (row as unknown as Record<string, number>)[c] = value;
      }
      rows.push(row);
    }
  }
  await bulk("Daily ratings", rows, (chunk) => prisma.dailyRating.createMany({ data: chunk }));
}

async function seedPhase1Discipline(ctx: SchoolContext) {
  section("Phase 1 — Discipline & recognition register");
  const rows: Prisma.DisciplineRecordCreateManyInput[] = [];
  const positiveArchetypes = ["HIGHLY_ENGAGED", "EXCELLENT_ATTENDANCE", "STRONG_IMPROVEMENT", "IMPROVING", "QUIET_STRONG"];
  const problemArchetypes = ["HOMEWORK_STRUGGLE", "ATTENDANCE_DECLINE", "HIGH_ACADEMIC_LOW_MOTIVATION"];

  const POSITIVE_DEFS = [
    { type: "HONOR_ROLL", title: "Honor roll — Term 2", description: "Outstanding conduct and engagement over the term." },
    { type: "COMMENDATION", title: "Commendation for group project work", description: "Praised by the project team for reliability and ideas." },
    { type: "ENCOURAGEMENT", title: "Encouragement — keep it up", description: "Noticeable effort recognised by the class team." },
    { type: "COMMENDATION", title: "Praised by the science teacher", description: "Excellent handling of the lab practical." },
  ];
  const WARNING_DEFS = [
    { type: "WARNING", title: "Missing homework three days in a row", description: "Agreed to use the weekly checklist with the family." },
    { type: "WARNING", title: "Repeated late arrivals", description: "Morning routine discussed; monitored over two weeks." },
    { type: "BLAME", title: "Disruption during class", description: "Two reminders during the lesson; resolved with a short talk." },
    { type: "WARNING", title: "Work left unfinished twice this week", description: "Support plan adjusted to include a planning check." },
  ];

  for (const student of ctx.students.values()) {
    const cls = ctx.classes.get(student.classId)!;
    const decidedBy = cls.teacherId;
    const positive = positiveArchetypes.includes(student.archetype.key);
    const problem = problemArchetypes.includes(student.archetype.key);
    const n = positive ? (chance(rng, 0.6) ? int(rng, 1, 2) : 0) : problem ? (chance(rng, 0.5) ? int(rng, 1, 2) : 0) : chance(rng, 0.2) ? 1 : 0;
    for (let i = 0; i < n; i++) {
      const def = pick(rng, positive ? POSITIVE_DEFS : problem ? WARNING_DEFS : [...POSITIVE_DEFS, ...WARNING_DEFS]);
      const isExclusion = !positive && chance(rng, 0.02);
      rows.push({
        id: nid("disc"),
        schoolId: ctx.schoolId,
        studentId: student.id,
        type: isExclusion ? "EXCLUSION" : def.type,
        severity: def.type === "BLAME" || isExclusion ? "MAJOR" : "MINOR",
        title: isExclusion ? "Temporary exclusion — incident report" : def.title,
        description: def.description,
        decidedById: decidedBy,
        decidedAt: addDays(TODAY, -int(rng, 1, 60)),
        visibleToParents: chance(rng, 0.8),
        status: chance(rng, 0.2) ? "CLOSED" : "ACTIVE",
        closedAt: null,
      });
    }
  }
  await bulk("Discipline records", rows, (chunk) => prisma.disciplineRecord.createMany({ data: chunk }));
}

async function seedPhase1PickupPersons(ctx: SchoolContext) {
  section("Phase 1 — Authorised pickup persons");
  const rows: Prisma.PickupPersonCreateManyInput[] = [];
  const RELATIONS = ["GRANDPARENT", "GRANDPARENT", "SIBLING", "SIBLING", "BABYSITTER", "AUNT", "UNCLE"];
  const SIBLING_NAMES = ["Yassine", "Lina", "Omar", "Salma", "Adam", "Nora", "Mehdi", "Aya", "Rayan", "Jana"];

  for (const student of ctx.students.values()) {
    const cls = ctx.classes.get(student.classId)!;
    if (!cls.demo && !chance(rng, 0.3)) continue;
    const count = int(rng, 1, 2);
    for (let i = 0; i < count; i++) {
      const rel = pick(rng, RELATIONS);
      let name: string;
      if (rel === "GRANDPARENT") name = `Mr/Mrs ${student.last}`;
      else if (rel === "SIBLING") name = `${pick(rng, SIBLING_NAMES)} ${student.last}`;
      else if (rel === "AUNT") name = `Aunt ${pick(rng, P.FIRST_NAMES_F)} ${student.last}`;
      else if (rel === "UNCLE") name = `Uncle ${pick(rng, P.FIRST_NAMES_M)} ${student.last}`;
      else name = `${pick(rng, P.FIRST_NAMES_F)} ${pick(rng, P.LAST_NAMES)}`;
      rows.push({
        id: nid("pick"),
        schoolId: ctx.schoolId,
        studentId: student.id,
        name,
        idNumber: chance(rng, 0.6) ? `C${int(rng, 100000, 999999)}` : null,
        relationship: rel,
        phone: `+212 6${int(rng, 10, 99)}-${int(rng, 100000, 999999)}`,
        isActive: chance(rng, 0.9),
        notes: chance(rng, 0.15) ? "Shared custody — pick-up allowed by both parents." : null,
      });
    }
  }
  await bulk("Pickup persons", rows, (chunk) => prisma.pickupPerson.createMany({ data: chunk }));
}

async function seedPhase1LearningPlans(ctx: SchoolContext) {
  section("Phase 1 — Learning plans (PAI / PAP / PPS / AESH)");
  const rows: Prisma.LearningPlanCreateManyInput[] = [];
  const aeshNames = ["Ms. R. El Fassi (AESH)", "Mr. K. Tahiri (AESH)"];
  const medical = await prisma.medicalRecord.findMany({ where: { schoolId: ctx.schoolId } });
  const medicalByStudent = new Map(medical.map((m) => [m.studentId, m]));
  const NEEDS_AESH = new Set(["Hugo Petit", "Anas Belkadi"]);

  for (const student of ctx.students.values()) {
    const cls = ctx.classes.get(student.classId)!;
    const fullName = `${student.first} ${student.last}`;
    const med = medicalByStudent.get(student.id);
    const asthmaOrAllergy = med && (med.chronicDiseases === "Asthma" || med.allergies === "Peanuts");

    if (asthmaOrAllergy) {
      rows.push({
        id: nid("plan"),
        schoolId: ctx.schoolId,
        studentId: student.id,
        type: "PAI",
        title: `PAI — ${med!.chronicDiseases === "Asthma" ? "Asthma" : "Peanut allergy"} accommodation`,
        description: "Individual accommodation plan covering the management of the health condition at school.",
        accommodations: JSON.stringify(
          med!.chronicDiseases === "Asthma"
            ? ["Inhaler kept in the classroom and infirmary", "PE adapted to pollen counts", "Emergency protocol shared with all teachers"]
            : ["No food sharing policy", "Epinephrine pen in the infirmary", "Canteen menu checked every week"],
        ),
        startDate: addDays(TODAY, -int(rng, 30, 90)),
        endDate: null,
        createdById: cls.teacherId,
        status: "ACTIVE",
      });
    }

    if (student.archetype.key === "NEEDS_SUPPORT") {
      rows.push({
        id: nid("plan"),
        schoolId: ctx.schoolId,
        studentId: student.id,
        type: "PAP",
        title: "PAP — Organisational support",
        description: "Personal support plan coordinated with the family and the class team.",
        accommodations: JSON.stringify(["Simplified written instructions", "Checklists for the daily routine", "Extra time on assessments (30%)", "Weekly follow-up with the homeroom teacher"]),
        startDate: addDays(TODAY, -int(rng, 20, 60)),
        endDate: addDays(TODAY, 90),
        createdById: cls.teacherId,
        status: "ACTIVE",
      });
    }

    if (NEEDS_AESH.has(fullName)) {
      rows.push({
        id: nid("plan"),
        schoolId: ctx.schoolId,
        studentId: student.id,
        type: "AESH",
        title: "AESH — Learning support",
        description: "Individual support with a school support assistant (AESH) during core lessons.",
        accommodations: JSON.stringify(["Support during Mathematics and French", "Reading assistance", "Liaison with the family every week"]),
        startDate: addDays(TODAY, -int(rng, 40, 80)),
        endDate: addDays(TODAY, 150),
        assignedTo: pick(rng, aeshNames),
        createdById: cls.teacherId,
        status: "ACTIVE",
      });
    }

    if (student.archetype.key === "HOMEWORK_STRUGGLE" && chance(rng, 0.4)) {
      rows.push({
        id: nid("plan"),
        schoolId: ctx.schoolId,
        studentId: student.id,
        type: "PAP",
        title: "PAP — Homework routine",
        description: "Shared checklist between school and home to stabilise the homework routine.",
        accommodations: JSON.stringify(["Weekly checklist signed by the family", "Homework started at school (20 min)", "15-minute support session on Tuesdays"]),
        startDate: addDays(TODAY, -int(rng, 15, 45)),
        endDate: addDays(TODAY, 60),
        createdById: cls.teacherId,
        status: "ACTIVE",
      });
    }
  }
  await bulk("Learning plans", rows, (chunk) => prisma.learningPlan.createMany({ data: chunk }));

  // Keep AESH attribution on the student record in sync
  if (rows.length) {
    const aeshPlan = rows.find((r) => r.type === "AESH");
    if (aeshPlan) {
      const student = [...ctx.students.values()].find((s) => s.id === aeshPlan.studentId);
      if (student) {
        await prisma.student.update({
          where: { id: student.id },
          data: { aeshName: aeshPlan.assignedTo ?? null, aeshSchedule: "Mornings — core lessons" },
        });
      }
    }
  }
}

async function seedPhase1Meetings(ctx: SchoolContext) {
  section("Phase 1 — Parent meetings");
  const rows: Prisma.MeetingCreateManyInput[] = [];
  const MEETING_DEFS = [
    {
      title: "Start-of-year meeting",
      agenda: "Getting to know each other, school expectations and the digital follow-up tools.",
      minutes: "Welcomed the family, presented the class team and the year plan.",
      decisions: "Weekly review of homework completion with the homeroom teacher.",
      followUp: "First progress check at the end of September.",
    },
    {
      title: "Term 2 progress meeting",
      agenda: "Review of assessments, engagement and wellbeing over the term.",
      minutes: "Reviewed the term's results, discussed the homework routine and sleep schedule.",
      decisions: "Agreed on an earlier bedtime and a lighter Tuesday workload.",
      followUp: "Re-assess after the next assessment block.",
    },
    {
      title: "Parent-teacher conference",
      agenda: "Individual meeting about recent progress.",
      minutes: "Highlighted recent improvement in participation and group work.",
      decisions: "Continue the current support plan.",
      followUp: "Quarterly check-in by email.",
    },
    {
      title: "Follow-up on the support plan",
      agenda: "Review the PAP actions and adjust if needed.",
      minutes: "The checklist is working well; homework completion is rising.",
      decisions: "Keep the current arrangements; extend the plan by one term.",
      followUp: "Review again next term.",
    },
  ];

  for (const student of ctx.students.values()) {
    const cls = ctx.classes.get(student.classId)!;
    if (!cls.demo && !chance(rng, 0.25)) continue;
    const count = int(rng, 1, 2);
    for (let i = 0; i < count; i++) {
      const def = pick(rng, MEETING_DEFS);
      const isScheduled = i === 0 && chance(rng, 0.15);
      rows.push({
        id: nid("meet"),
        schoolId: ctx.schoolId,
        studentId: student.id,
        title: def.title,
        date: isScheduled ? addDays(TODAY, int(rng, 2, 10)) : addDays(TODAY, -int(rng, 1, 50)),
        participants: `Mr & Mrs ${student.last}, ${cls.name} team`,
        agenda: def.agenda,
        minutes: def.minutes,
        decisions: def.decisions,
        followUp: def.followUp,
        createdById: cls.teacherId,
        status: isScheduled ? "SCHEDULED" : "DONE",
      });
    }
  }
  await bulk("Meetings", rows, (chunk) => prisma.meeting.createMany({ data: chunk }));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("\nSTUDENT360 seed started\n");
  const start = Date.now();

  const ctx = await seedTenant();
  await seedStaff(ctx);
  await seedClasses(ctx);
  await seedStudentsAndGuardians(ctx);
  await seedCheckIns(ctx);
  await seedAttendance(ctx);
  await seedHomeworkAndSubmissions(ctx);
  await seedAssessmentsAndGrades(ctx);
  await seedObservations(ctx);
  await seedGoalsAndInterventions(ctx);
  await seedParentInputs(ctx);
  await seedAlerts(ctx);
  await seedSnapshots(ctx);
  await seedActivityEvents(ctx);
  await seedPhase1Identity(ctx);
  await seedPhase1Medical(ctx);
  await seedPhase1DailyRatings(ctx);
  await seedPhase1Discipline(ctx);
  await seedPhase1PickupPersons(ctx);
  await seedPhase1LearningPlans(ctx);
  await seedPhase1Meetings(ctx);

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nSeed complete in ${duration}s`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
