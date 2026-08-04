export type DemoStudent = {
  id: string;
  name: string;
  classId: string;
  className: string;
  initials: string;
  academic: number;
  engagement: number;
  homework: number;
  attendance: number;
  motivation: number;
  mood: number;
  trend: "UP" | "DOWN" | "STABLE";
  status: "POSITIVE" | "STABLE" | "WATCH" | "ATTENTION";
  headline: string;
};

export const demoClasses = [
  { id: "grade-7a", name: "Grade 7A", room: "A12", teacher: "Omar Idrissi", students: 24, attendance: 96, homework: 89, engagement: 78, trend: 3 },
  { id: "grade-7b", name: "Grade 7B", room: "A14", teacher: "Salma El Amrani", students: 25, attendance: 94, homework: 83, engagement: 74, trend: 1 },
  { id: "grade-8a", name: "Grade 8A", room: "B08", teacher: "Yassine Alaoui", students: 24, attendance: 97, homework: 91, engagement: 81, trend: 4 },
  { id: "grade-8b", name: "Grade 8B", room: "B10", teacher: "Amina Martin", students: 26, attendance: 92, homework: 86, engagement: 76, trend: 2 },
  { id: "grade-9a", name: "Grade 9A", room: "C03", teacher: "Leila Haddad", students: 24, attendance: 95, homework: 88, engagement: 79, trend: 3 },
  { id: "grade-9b", name: "Grade 9B", room: "C05", teacher: "Karim Mansouri", students: 24, attendance: 93, homework: 84, engagement: 75, trend: -1 },
] as const;

const grade8BNames = [
  "Adam Benali", "Sara El Idrissi", "Lina Alaoui", "Youssef Amrani", "Maya Bennani", "Omar Chraibi",
  "Nour El Fassi", "Ilyas Tazi", "Aya Berrada", "Samir Kadiri", "Salma Lahlou", "Rayane Naciri",
  "Ines Othmani", "Mehdi Qadiri", "Jade Rami", "Amine Saidi", "Lilia Toumi", "Zakaria Wahbi",
  "Malak Zayani", "Anas Belkacem", "Sofia Cherkaoui", "Hamza Drissi", "Rania El Mansour", "Bilal Fakhri",
  "Yasmine Gharbi", "Ismail Hakimi",
];

const headlines = [
  "Clear positive momentum", "Strong contribution in mathematics", "Steady progress this month",
  "Homework routine improving", "Excellent attendance", "Attendance is trending down",
  "Highly engaged in class", "Quiet and academically strong", "Requested support today",
  "Everything looks steady", "Homework completion needs attention", "Motivation is lower this week",
];

const buildStudents = (classId: string, className: string, count: number, offset: number): DemoStudent[] =>
  Array.from({ length: count }, (_, localIndex) => {
  const index = offset + localIndex;
  const name = classId === "grade-8b"
    ? grade8BNames[localIndex]
    : `${["Amal", "Badr", "Camille", "Dina", "Elias", "Farah", "Gabriel", "Hana", "Imran", "Jana", "Khalil", "Lena", "Marwan", "Nadia", "Othman", "Pia", "Rayan", "Sana", "Tariq", "Yara", "Zayn", "Meriem", "Ayoub", "Noor", "Sami"][localIndex % 25]} ${className.replace("Grade ", "")}`;
  const status = index % 9 === 8 ? "ATTENTION" : index % 7 === 5 ? "WATCH" : index % 4 === 0 ? "POSITIVE" : "STABLE";
  const trend = status === "POSITIVE" ? "UP" : status === "ATTENTION" ? "DOWN" : "STABLE";
  return {
    id: classId === "grade-8b" ? `student-${localIndex + 1}` : `${classId}-student-${localIndex + 1}`,
    name,
    classId,
    className,
    initials: name.split(" ").map((part) => part[0]).join("").slice(0, 2),
    academic: 68 + ((index * 7) % 29),
    engagement: 61 + ((index * 9) % 36),
    homework: 58 + ((index * 11) % 42),
    attendance: 82 + ((index * 5) % 19),
    motivation: 55 + ((index * 8) % 42),
    mood: 2 + ((index * 3) % 4),
    trend,
    status,
    headline: headlines[index % headlines.length],
  };
});

export const demoStudents: DemoStudent[] = [
  ...buildStudents("grade-7a", "Grade 7A", 24, 26),
  ...buildStudents("grade-7b", "Grade 7B", 25, 50),
  ...buildStudents("grade-8a", "Grade 8A", 24, 75),
  ...buildStudents("grade-8b", "Grade 8B", 26, 0),
  ...buildStudents("grade-9a", "Grade 9A", 24, 99),
  ...buildStudents("grade-9b", "Grade 9B", 24, 123),
];

export const grade8BStudents = demoStudents.filter((student) => student.classId === "grade-8b");

export const demoEvents = [
  { time: "08:02", type: "CHECK_IN", title: "Adam checked in 🙂", description: "Mood good · Energy 4/5", tone: "positive" },
  { time: "08:11", type: "ATTENDANCE", title: "Lina marked absent", description: "Grade 8B · Family notified", tone: "attention" },
  { time: "09:25", type: "OBSERVATION", title: "Positive observation for Sara", description: "Excellent contribution during mathematics", tone: "positive" },
  { time: "10:13", type: "HOMEWORK", title: "Homework submitted by Youssef", description: "French literature · On time", tone: "neutral" },
  { time: "11:04", type: "HELP", title: "Maya requested assistance", description: "Would like help understanding algebra", tone: "watch" },
  { time: "12:20", type: "MESSAGE", title: "Parent message received", description: "About Adam · Homework support", tone: "neutral" },
  { time: "13:45", type: "ACHIEVEMENT", title: "Achievement awarded to Nour", description: "Collaboration milestone", tone: "positive" },
] as const;

export const demoHomework = [
  { id: "hw-1", subject: "Mathematics", title: "Linear equations practice", className: "Grade 8B", due: "Today, 17:00", completion: 81, submitted: 21, total: 26, status: "DUE_TODAY" },
  { id: "hw-2", subject: "French", title: "Reading reflection — Chapter 4", className: "Grade 8B", due: "Tomorrow", completion: 65, submitted: 17, total: 26, status: "OPEN" },
  { id: "hw-3", subject: "Science", title: "Ecosystem observation sheet", className: "Grade 8A", due: "30 Jul", completion: 92, submitted: 22, total: 24, status: "OPEN" },
  { id: "hw-4", subject: "History", title: "Industrial revolution timeline", className: "Grade 9A", due: "1 Aug", completion: 54, submitted: 13, total: 24, status: "OPEN" },
  { id: "hw-5", subject: "English", title: "Opinion paragraph", className: "Grade 7B", due: "Closed", completion: 88, submitted: 22, total: 25, status: "CLOSED" },
] as const;

export const demoMessages = [
  { id: "thread-1", name: "Amina Martin", role: "Grade 8B teacher", subject: "Adam — homework routine", preview: "Thank you for the update. We will try the new routine…", time: "12:20", unread: 2 },
  { id: "thread-2", name: "Omar Idrissi", role: "Mathematics", subject: "Weekly class review", preview: "Grade 7A showed good progress this week.", time: "10:42", unread: 0 },
  { id: "thread-3", name: "Samira Benali", role: "Adam's parent", subject: "Homework support", preview: "We spent twenty minutes reviewing algebra yesterday.", time: "Yesterday", unread: 1 },
  { id: "thread-4", name: "School leadership", role: "Announcement", subject: "Term report preparation", preview: "Reports will be available for review on Friday.", time: "Mon", unread: 0 },
] as const;

export const demoNotifications = [
  { id: "n1", title: "Student asked for help", body: "Maya would like help with algebra.", href: "/students/student-5", priority: "HIGH" },
  { id: "n2", title: "Parent message received", body: "New message about Adam's homework routine.", href: "/messages", priority: "NORMAL" },
  { id: "n3", title: "Weekly report available", body: "Grade 8B weekly review is ready.", href: "/weekly-review", priority: "NORMAL" },
  { id: "n4", title: "Goal achieved", body: "Sara completed her participation goal.", href: "/students/student-2", priority: "LOW" },
] as const;

export const weeklyTrend = [
  { week: "W1", attendance: 95, homework: 78, engagement: 72, motivation: 74 },
  { week: "W2", attendance: 94, homework: 81, engagement: 74, motivation: 72 },
  { week: "W3", attendance: 96, homework: 80, engagement: 73, motivation: 71 },
  { week: "W4", attendance: 93, homework: 84, engagement: 75, motivation: 70 },
  { week: "W5", attendance: 94, homework: 86, engagement: 76, motivation: 72 },
  { week: "W6", attendance: 92, homework: 88, engagement: 79, motivation: 73 },
] as const;

// ---------------------------------------------------------------------------
// Phase 1 — enriched student file (deterministic demo data)
// ---------------------------------------------------------------------------

export type DemoGuardian = {
  name: string;
  relationship: "FATHER" | "MOTHER" | "GUARDIAN";
  phone: string;
  email: string;
  occupation: string;
  primary: boolean;
};

export type DemoPickupPerson = {
  name: string;
  relationship: string;
  phone: string;
  idNumber?: string;
  notes?: string;
};

export type DemoMedical = {
  bloodType: string;
  allergies: string[];
  chronicDiseases: string[];
  medications: string[];
  physician: string;
  physicianPhone: string;
  sportsRestrictions: string[];
  emergencyProtocol: string;
  protocolVisibleToTeachers: boolean;
  updatedAt: string;
};

export type DemoConsent = {
  type: string;
  status: "GRANTED" | "DENIED" | "PENDING";
  grantedAt: string;
};

export type DemoDisciplineRecord = {
  type: string;
  title: string;
  description: string;
  date: string;
  severity: "MINOR" | "MAJOR";
  status: "ACTIVE" | "CLOSED";
};

export type DemoLearningPlan = {
  type: string;
  title: string;
  description: string;
  accommodations: string[];
  startDate: string;
  endDate?: string;
  assignedTo?: string;
  status: string;
};

export type DemoMeeting = {
  title: string;
  date: string;
  participants: string;
  agenda: string;
  minutes?: string;
  decisions?: string;
  followUp?: string;
  status: "SCHEDULED" | "DONE";
};

export type DemoDailyRating = {
  date: string;
  criteria: { code: string; value: number }[];
  note?: string;
};

export type DemoStudentExtras = {
  studentNumber: string;
  nationality: string;
  birthplace: string;
  address: string;
  regime: string;
  transportMode: string;
  busLine?: string;
  previousSchool?: string;
  transferReason?: string;
  homeLanguage: string;
  languagesSpoken: string[];
  aesh?: string;
  guardians: DemoGuardian[];
  emergencyContact: string;
  pickupPeople: DemoPickupPerson[];
  medical: DemoMedical;
  consents: DemoConsent[];
  discipline: DemoDisciplineRecord[];
  plans: DemoLearningPlan[];
  meetings: DemoMeeting[];
  dailyRatings: DemoDailyRating[];
};

function seededRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NATIONALITIES = ["Moroccan", "Moroccan", "Moroccan", "Moroccan", "French", "French", "British", "Canadian", "Senegalese", "Ivorian", "Lebanese"];
const BIRTHPLACES = ["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Paris", "Lyon", "London", "Montréal", "Dakar", "Abidjan", "Beirut"];
const REGIMES = ["EXTERN", "EXTERN", "EXTERN", "HALF_BOARD", "HALF_BOARD", "BOARDER"];
const TRANSPORTS = ["BUS", "BUS", "CAR", "CAR", "CAR", "WALK", "WALK", "OTHER"];
const PREVIOUS_SCHOOLS = ["École Ibn Batouta", "Groupe Scolaire La Résidence", "École Al Jabr", "Collège Descartes", "Groupe Scolaire Al Manar", "École Léon l'Africain"];
const LANGUAGES = ["French", "Arabic", "English", "Spanish", "Berber"];
const OCCUPATIONS = ["Engineer", "Teacher", "Architect", "Pharmacist", "Business owner", "Doctor", "Banker", "Consultant", "Lawyer", "Nurse"];
const ALLERGIES = ["Peanuts", "Lactose", "Pollen", "Dust mites", "Latex", "Shellfish", "Penicillin"];
const CHRONIC = ["Asthma", "Eczema", "Type 1 diabetes", "Epilepsy", "Migraine"];
const MEDICATIONS: Record<string, string[]> = {
  Asthma: ["Inhaler (salbutamol)"],
  "Type 1 diabetes": ["Insulin pump"],
  Epilepsy: ["Anticonvulsant (prescribed)"],
  Migraine: ["Paracetamol (as needed)"],
  Eczema: ["Emollient cream"],
};
const RESTRICTIONS = ["Avoid contact sports", "No PE when pollen counts are high", "Swimming only with supervision", "No prolonged running"];
const PROTOCOLS = [
  "Contact parents immediately; keep the child lying down and calm.",
  "Administer antihistamine if prescribed, then contact parents.",
  "Give 2 puffs of the inhaler, monitor 10 minutes, then contact parents.",
  "Contact parents; do not administer any medication.",
];
const CONSENT_DEFS = ["DATA_PROCESSING", "WELLBEING_TRACKING", "PHOTO_USE", "EXTERNAL_SHARING", "AI_ASSISTANCE", "FIELD_TRIP", "MEDICAL_EMERGENCY"];
const MEETING_DEFS = [
  { title: "Start-of-year meeting", agenda: "Getting to know each other, school expectations and the digital follow-up tools.", minutes: "Welcomed the family, presented the class team and the year plan.", decisions: "Weekly review of homework completion with the homeroom teacher.", followUp: "First progress check at the end of September." },
  { title: "Term 2 progress meeting", agenda: "Review of assessments, engagement and wellbeing over the term.", minutes: "Reviewed the term's results, discussed the homework routine and sleep schedule.", decisions: "Agreed on an earlier bedtime and a lighter Tuesday workload.", followUp: "Re-assess after the next assessment block." },
  { title: "Parent-teacher conference", agenda: "Individual meeting about recent progress.", minutes: "Highlighted recent improvement in participation and group work.", decisions: "Continue the current support plan.", followUp: "Quarterly check-in by email." },
  { title: "Follow-up on the support plan", agenda: "Review the PAP actions and adjust if needed.", minutes: "The checklist is working well; homework completion is rising.", decisions: "Keep the current arrangements; extend the plan by one term.", followUp: "Review again next term." },
];

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

export function demoStudentExtras(student: DemoStudent): DemoStudentExtras {
  const rng = seededRng((student.id.match(/\d+/) ? Number(student.id.match(/\d+/)![0]) : 0) * 31 + student.name.length * 7);
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rng() * arr.length)];
  const some = <T,>(arr: readonly T[], p: number) => (rng() < p ? pick(arr) : null);
  const lastName = student.name.split(" ").slice(1).join(" ");
  const firstName = student.name.split(" ")[0];
  const regN = pick(REGIMES);
  const transport = pick(TRANSPORTS);
  const hasMedical = rng() < 0.35;
  const chronic = some(CHRONIC, 0.3);
  const allergy = some(ALLERGIES, 0.35);
  const protocol = allergy === "Peanuts"
    ? "Administer epinephrine pen (kept in the infirmary) and call emergency services."
    : chronic === "Asthma"
      ? "Give 2 puffs of the inhaler, monitor 10 minutes, then contact parents."
      : chronic === "Type 1 diabetes"
        ? "Contact parents immediately; do not administer any medication or insulin."
        : pick(PROTOCOLS);
  const needsSupport = student.homework < 65;
  const positive = student.status === "POSITIVE";
  const attention = student.status === "ATTENTION";

  const discipline: DemoDisciplineRecord[] = [];
  if (attention || needsSupport) {
    discipline.push({
      type: rng() < 0.5 ? "WARNING" : "BLAME",
      title: needsSupport ? "Missing homework three days in a row" : "Repeated late arrivals",
      description: "Agreed to use the weekly checklist with the family.",
      date: daysAgo(4 + Math.floor(rng() * 12)),
      severity: rng() < 0.25 ? "MAJOR" : "MINOR",
      status: rng() < 0.25 ? "CLOSED" : "ACTIVE",
    });
    if (rng() < 0.3) {
      discipline.push({ type: "ENCOURAGEMENT", title: "Encouragement — keep it up", description: "Noticeable effort recognised by the class team.", date: daysAgo(30 + Math.floor(rng() * 20)), severity: "MINOR", status: "CLOSED" });
    }
  } else if (positive || rng() < 0.45) {
    discipline.push({
      type: positive ? "COMMENDATION" : "ENCOURAGEMENT",
      title: positive ? "Commendation for group project work" : "Encouragement — keep it up",
      description: positive ? "Praised by the project team for reliability and ideas." : "Noticeable effort recognised by the class team.",
      date: daysAgo(3 + Math.floor(rng() * 20)),
      severity: "MINOR",
      status: "ACTIVE",
    });
    if (positive && rng() < 0.4) {
      discipline.push({ type: "HONOR_ROLL", title: "Honor roll — Term 2", description: "Outstanding conduct and engagement over the term.", date: daysAgo(25 + Math.floor(rng() * 20)), severity: "MINOR", status: "CLOSED" });
    }
  }

  const plans: DemoLearningPlan[] = [];
  if (chronic === "Asthma" || allergy === "Peanuts") {
    plans.push({
      type: "PAI",
      title: `PAI — ${chronic === "Asthma" ? "Asthma" : "Peanut allergy"} accommodation`,
      description: "Individual accommodation plan covering the management of the health condition at school.",
      accommodations: chronic === "Asthma"
        ? ["Inhaler kept in the classroom and infirmary", "PE adapted to pollen counts", "Emergency protocol shared with all teachers"]
        : ["No food sharing policy", "Epinephrine pen in the infirmary", "Canteen menu checked every week"],
      startDate: daysAgo(40 + Math.floor(rng() * 40)),
      status: "ACTIVE",
    });
  }
  if (needsSupport) {
    plans.push({
      type: "PAP",
      title: "PAP — Organisational support",
      description: "Personal support plan coordinated with the family and the class team.",
      accommodations: ["Simplified written instructions", "Checklists for the daily routine", "Extra time on assessments (30%)", "Weekly follow-up with the homeroom teacher"],
      startDate: daysAgo(30 + Math.floor(rng() * 30)),
      endDate: daysAgo(-60),
      status: "ACTIVE",
    });
  }
  const rosterIdx = Number(student.id.match(/\d+/) ? student.id.match(/\d+/)![0] : 0);
  if (rosterIdx === 10 || rosterIdx === 22) {
    plans.push({
      type: "AESH",
      title: "AESH — Learning support",
      description: "Individual support with a school support assistant (AESH) during core lessons.",
      accommodations: ["Support during Mathematics and French", "Reading assistance", "Liaison with the family every week"],
      startDate: daysAgo(50 + Math.floor(rng() * 30)),
      endDate: daysAgo(-150),
      assignedTo: rosterIdx === 10 ? "Ms. R. El Fassi (AESH)" : "Mr. K. Tahiri (AESH)",
      status: "ACTIVE",
    });
  }

  const meetings: DemoMeeting[] = [0, rng() < 0.5 ? 1 : -1].filter((i) => i >= 0).map((i) => {
    const def = MEETING_DEFS[i % MEETING_DEFS.length];
    const scheduled = i === 0 && rng() < 0.15;
    return {
      title: def.title,
      date: scheduled ? daysAgo(-(2 + Math.floor(rng() * 8))) : daysAgo(5 + Math.floor(rng() * 40)),
      participants: `Mr & Mrs ${lastName}, ${student.className} team`,
      agenda: def.agenda,
      minutes: scheduled ? undefined : def.minutes,
      decisions: scheduled ? undefined : def.decisions,
      followUp: scheduled ? undefined : def.followUp,
      status: scheduled ? "SCHEDULED" : "DONE",
    };
  });

  const dailyRatings: DemoDailyRating[] = [];
  if (rng() < 0.55) {
    const flagCount = needsSupport || attention ? 2 + Math.floor(rng() * 2) : 1 + Math.floor(rng() * 2);
    for (let d = 1; d <= 5; d++) {
      if (rng() < 0.45) continue;
      const criteria = ["punctuality", "homework", "behavior", "concentration", "motivation", "organisation"]
        .sort(() => rng() - 0.5)
        .slice(0, flagCount)
        .map((code) => ({ code, value: needsSupport || attention ? 1 + Math.floor(rng() * 2) : rng() < 0.3 ? 5 : 3 + Math.floor(rng() * 2) }));
      dailyRatings.push({
        date: daysAgo(d),
        criteria,
        note: rng() < 0.3 ? (criteria.some((c) => c.value <= 2) ? "Two assignments missing this morning." : "Very involved in group work today.") : undefined,
      });
    }
  }

  return {
    studentNumber: `${student.className.replace("Grade ", "")}-${String(rosterIdx).padStart(2, "0")}`,
    nationality: pick(NATIONALITIES),
    birthplace: pick(BIRTHPLACES),
    address: `${10 + Math.floor(rng() * 170)} ${pick(["Rue Ibn Sina", "Avenue Hassan II", "Boulevard de la Corniche", "Rue de la Liberté", "Boulevard Zerktouni", "Rue du Parc", "Avenue des FAR"] as const)}, ${pick(["Maârif", "Anfa", "Gauthier", "Bourgogne", "Aïn Diab", "Californie", "Palmiers", "Racine"] as const)}, Casablanca`,
    regime: regN,
    transportMode: transport,
    busLine: transport === "BUS" ? `L${1 + Math.floor(rng() * 9)}` : undefined,
    previousSchool: rng() < 0.55 ? pick(PREVIOUS_SCHOOLS) : undefined,
    transferReason: rng() < 0.3 ? "Family move" : undefined,
    homeLanguage: pick(["French", "Arabic", "French", "Arabic", "English"] as const),
    languagesSpoken: [0, 1, 2].slice(0, 1 + Math.floor(rng() * 3)).map(() => pick(LANGUAGES)),
    aesh: plans.some((p) => p.type === "AESH") ? plans.find((p) => p.type === "AESH")!.assignedTo : undefined,
    guardians: [
      { name: `Mr ${lastName}`, relationship: "FATHER", phone: `+212 6${Math.floor(rng() * 90) + 10}-${Math.floor(rng() * 900000) + 100000}`, email: `${lastName.toLowerCase().replace(/[^a-z]/g, "")}.father@mail.com`, occupation: pick(OCCUPATIONS), primary: true },
      { name: `Mrs ${lastName}`, relationship: "MOTHER", phone: `+212 6${Math.floor(rng() * 90) + 10}-${Math.floor(rng() * 900000) + 100000}`, email: `${lastName.toLowerCase().replace(/[^a-z]/g, "")}.mother@mail.com`, occupation: pick(OCCUPATIONS), primary: rng() < 0.2 },
    ],
    emergencyContact: `Mrs ${lastName} · +212 6${Math.floor(rng() * 90) + 10}-${Math.floor(rng() * 900000) + 100000}`,
    pickupPeople: [
      { name: `Mr/Mrs ${lastName} (grandparent)`, relationship: "GRANDPARENT", phone: `+212 6${Math.floor(rng() * 90) + 10}-${Math.floor(rng() * 900000) + 100000}`, idNumber: `C${Math.floor(rng() * 900000) + 100000}`, notes: rng() < 0.3 ? "Shared custody — pick-up allowed by both parents." : undefined },
      ...(rng() < 0.6 ? [{ name: `${pick(["Yassine", "Lina", "Omar", "Salma", "Adam", "Nora"] as const)} ${lastName}`, relationship: "SIBLING", phone: `+212 6${Math.floor(rng() * 90) + 10}-${Math.floor(rng() * 900000) + 100000}` }] : []),
    ],
    medical: {
      bloodType: pick(["A+", "A+", "A-", "B+", "B-", "AB+", "O+", "O-", "O+"] as const),
      allergies: allergy ? [allergy] : [],
      chronicDiseases: chronic ? [chronic] : [],
      medications: chronic ? MEDICATIONS[chronic] : [],
      physician: `Dr. ${pick(["Martin", "El Amrani", "Benali", "Tazi", "Berrada", "Marchand"] as const)}`,
      physicianPhone: `+212 5${Math.floor(rng() * 90) + 10}-${Math.floor(rng() * 900000) + 100000}`,
      sportsRestrictions: hasMedical && rng() < 0.4 ? [pick(RESTRICTIONS)] : [],
      emergencyProtocol: hasMedical ? protocol : PROTOCOLS[0],
      protocolVisibleToTeachers: hasMedical ? rng() < 0.85 : true,
      updatedAt: daysAgo(20 + Math.floor(rng() * 60)),
    },
    consents: CONSENT_DEFS.map((type, i) => ({
      type,
      status: type === "PHOTO_USE" && rng() < 0.2 ? "DENIED" : rng() < 0.08 ? "PENDING" : "GRANTED",
      grantedAt: daysAgo(100 + i * 10 + Math.floor(rng() * 30)),
    })),
    discipline,
    plans,
    meetings,
    dailyRatings,
  };
}