/**
 * STUDENT360 — demo persona definitions.
 *
 * These archetypes drive the generated history so the dashboards tell a real,
 * readable story on first launch (improvement, plateau, emerging concerns,
 * interventions that work…).
 *
 * IMPORTANT PRODUCT RULE
 * ----------------------
 * Archetype keys and designer notes below are **generation metadata only**.
 * They are never persisted on the student and never rendered in the UI.
 * Student360 does not label children.
 */

export type Profile = {
  /** probability of being present on a school day (0..1) */
  attendance: number;
  /** probability of handing homework in on time (0..1) */
  homework: number;
  /** observed engagement level (0..1 → mapped to 1..5 observation ratings) */
  engagement: number;
  /** academic performance as a percentage (0..100) */
  academic: number;
  /** self-reported motivation (1..5) */
  motivation: number;
  /** self-reported mood (1..5) */
  mood: number;
  /** self-reported energy (1..5) */
  energy: number;
  /** perceived workload / stress (1..5 — higher means heavier) */
  stress: number;
  /** probability of completing the daily check-in (0..1) */
  checkin: number;
  /** probability of arriving late on a present day */
  latenessRate?: number;
};

export type Archetype = {
  key: string;
  /** internal design intent — never shown to users */
  note: string;
  /** profile at the beginning of the generated window */
  start: Profile;
  /** profile at the end of the generated window (linearly interpolated) */
  end: Profile;
  /** number of confidential help requests over the window */
  helpRequests?: number;
  /** probability of arriving late on a present day */
  latenessRate?: number;
};

const P = (
  attendance: number,
  homework: number,
  engagement: number,
  academic: number,
  motivation: number,
  mood: number,
  energy: number,
  stress: number,
  checkin: number,
): Profile => ({ attendance, homework, engagement, academic, motivation, mood, energy, stress, checkin });

export const ARCHETYPES: Record<string, Archetype> = {
  HIGH_ACADEMIC_LOW_MOTIVATION: {
    key: "HIGH_ACADEMIC_LOW_MOTIVATION",
    note: "Excellent results, motivation slowly fading — the classic invisible signal.",
    start: P(0.97, 0.9, 0.62, 88, 3.5, 3.6, 3.4, 3.3, 0.78),
    end: P(0.94, 0.74, 0.46, 85, 2.4, 3.0, 2.9, 4.1, 0.55),
    latenessRate: 0.05,
  },
  IMPROVING: {
    key: "IMPROVING",
    note: "Steady, visible improvement across most dimensions.",
    start: P(0.9, 0.58, 0.52, 62, 3.0, 3.2, 3.1, 3.4, 0.7),
    end: P(0.95, 0.86, 0.78, 74, 4.0, 4.0, 3.8, 2.8, 0.88),
    latenessRate: 0.06,
  },
  STRONG_IMPROVEMENT: {
    key: "STRONG_IMPROVEMENT",
    note: "Turned things around — should be celebrated as loudly as concerns are raised.",
    start: P(0.85, 0.44, 0.4, 53, 2.6, 2.9, 2.8, 4.0, 0.52),
    end: P(0.96, 0.9, 0.85, 76, 4.4, 4.2, 4.0, 2.5, 0.92),
    latenessRate: 0.1,
  },
  HOMEWORK_STRUGGLE: {
    key: "HOMEWORK_STRUGGLE",
    note: "Present and willing in class, but homework keeps slipping.",
    start: P(0.93, 0.5, 0.62, 61, 3.1, 3.3, 3.1, 3.6, 0.66),
    end: P(0.91, 0.36, 0.55, 56, 2.6, 3.0, 2.9, 4.2, 0.58),
    latenessRate: 0.12,
  },
  EXCELLENT_ATTENDANCE: {
    key: "EXCELLENT_ATTENDANCE",
    note: "Never misses a day; dependable and consistent.",
    start: P(1.0, 0.88, 0.76, 77, 3.9, 4.0, 3.9, 2.6, 0.92),
    end: P(1.0, 0.91, 0.79, 79, 4.0, 4.1, 3.9, 2.5, 0.94),
    latenessRate: 0.0,
  },
  ATTENDANCE_DECLINE: {
    key: "ATTENDANCE_DECLINE",
    note: "Was reliable, attendance has been slipping for a few weeks.",
    start: P(0.99, 0.85, 0.75, 75, 3.9, 3.9, 3.8, 2.7, 0.88),
    end: P(0.71, 0.56, 0.53, 63, 2.5, 2.8, 2.7, 4.0, 0.5),
    latenessRate: 0.2,
  },
  HIGHLY_ENGAGED: {
    key: "HIGHLY_ENGAGED",
    note: "Drives the classroom energy.",
    start: P(0.97, 0.9, 0.9, 80, 4.3, 4.3, 4.2, 2.4, 0.95),
    end: P(0.98, 0.93, 0.93, 84, 4.5, 4.4, 4.3, 2.3, 0.96),
    latenessRate: 0.03,
  },
  QUIET_STRONG: {
    key: "QUIET_STRONG",
    note: "Academically strong, rarely speaks up — easy to overlook.",
    start: P(0.98, 0.93, 0.44, 86, 3.7, 3.6, 3.4, 2.9, 0.7),
    end: P(0.98, 0.94, 0.57, 88, 3.9, 3.8, 3.5, 2.8, 0.79),
    latenessRate: 0.02,
  },
  NEEDS_SUPPORT: {
    key: "NEEDS_SUPPORT",
    note: "Asked for help; a support plan is in place and is starting to work.",
    start: P(0.9, 0.5, 0.48, 56, 2.5, 2.7, 2.6, 4.3, 0.86),
    end: P(0.93, 0.68, 0.63, 64, 3.3, 3.4, 3.2, 3.5, 0.9),
    helpRequests: 5,
    latenessRate: 0.08,
  },
  STABLE: {
    key: "STABLE",
    note: "Consistent and steady — the healthy majority.",
    start: P(0.95, 0.81, 0.72, 72, 3.5, 3.6, 3.5, 3.0, 0.8),
    end: P(0.96, 0.82, 0.73, 73, 3.5, 3.7, 3.5, 3.0, 0.82),
    latenessRate: 0.05,
  },
};

export type RosterEntry = { first: string; last: string; gender: "F" | "M"; archetype: string };

/**
 * The required demonstration class — Grade 8B, 26 students.
 * Deliberately covers every profile requested in the product brief.
 */
export const CLASS_8B_ROSTER: RosterEntry[] = [
  { first: "Adam", last: "Benali", gender: "M", archetype: "IMPROVING" },
  { first: "Lina", last: "Haddad", gender: "F", archetype: "ATTENDANCE_DECLINE" },
  { first: "Sara", last: "Moreau", gender: "F", archetype: "HIGHLY_ENGAGED" },
  { first: "Youssef", last: "El Amrani", gender: "M", archetype: "STABLE" },
  { first: "Nora", last: "Bensaid", gender: "F", archetype: "QUIET_STRONG" },
  { first: "Omar", last: "Fassi", gender: "M", archetype: "HOMEWORK_STRUGGLE" },
  { first: "Emma", last: "Laurent", gender: "F", archetype: "EXCELLENT_ATTENDANCE" },
  { first: "Rayan", last: "Chraibi", gender: "M", archetype: "HIGH_ACADEMIC_LOW_MOTIVATION" },
  { first: "Salma", last: "Idrissi", gender: "F", archetype: "STRONG_IMPROVEMENT" },
  { first: "Hugo", last: "Petit", gender: "M", archetype: "NEEDS_SUPPORT" },
  { first: "Aya", last: "Tazi", gender: "F", archetype: "STABLE" },
  { first: "Mehdi", last: "Alaoui", gender: "M", archetype: "HIGHLY_ENGAGED" },
  { first: "Chloé", last: "Girard", gender: "F", archetype: "QUIET_STRONG" },
  { first: "Ilyas", last: "Berrada", gender: "M", archetype: "HOMEWORK_STRUGGLE" },
  { first: "Jana", last: "Kettani", gender: "F", archetype: "STABLE" },
  { first: "Lucas", last: "Bernard", gender: "M", archetype: "IMPROVING" },
  { first: "Malak", last: "Ouazzani", gender: "F", archetype: "EXCELLENT_ATTENDANCE" },
  { first: "Ismail", last: "Sekkat", gender: "M", archetype: "ATTENDANCE_DECLINE" },
  { first: "Inès", last: "Rousseau", gender: "F", archetype: "HIGH_ACADEMIC_LOW_MOTIVATION" },
  { first: "Zakaria", last: "Naciri", gender: "M", archetype: "STABLE" },
  { first: "Léa", last: "Dubois", gender: "F", archetype: "STRONG_IMPROVEMENT" },
  { first: "Anas", last: "Belkadi", gender: "M", archetype: "NEEDS_SUPPORT" },
  { first: "Maya", last: "Cherkaoui", gender: "F", archetype: "HIGHLY_ENGAGED" },
  { first: "Karim", last: "Zouhair", gender: "M", archetype: "STABLE" },
  { first: "Sophia", last: "Martins", gender: "F", archetype: "QUIET_STRONG" },
  { first: "Bilal", last: "Doukkali", gender: "M", archetype: "IMPROVING" },
];

/** Archetype pool used for the non-demonstration classes (weighted towards healthy). */
export const BACKGROUND_POOL: string[] = [
  "STABLE",
  "STABLE",
  "STABLE",
  "STABLE",
  "IMPROVING",
  "IMPROVING",
  "HIGHLY_ENGAGED",
  "HIGHLY_ENGAGED",
  "QUIET_STRONG",
  "EXCELLENT_ATTENDANCE",
  "HOMEWORK_STRUGGLE",
  "HIGH_ACADEMIC_LOW_MOTIVATION",
  "ATTENDANCE_DECLINE",
  "NEEDS_SUPPORT",
  "STRONG_IMPROVEMENT",
];

export const FIRST_NAMES_F = [
  "Amira", "Yasmine", "Camille", "Hiba", "Manon", "Rim", "Julie", "Sofia", "Dounia", "Alice",
  "Kenza", "Nada", "Louise", "Imane", "Zineb", "Marwa", "Clara", "Ghita", "Nawal", "Lamia",
  "Sarah", "Assia", "Meryem", "Jade", "Basma", "Wiam", "Charlotte", "Hind", "Rania", "Oumaima",
];

export const FIRST_NAMES_M = [
  "Yahya", "Nabil", "Théo", "Amine", "Walid", "Gabriel", "Sami", "Ayoub", "Noah", "Reda",
  "Jules", "Hamza", "Marwan", "Elias", "Taha", "Nathan", "Anir", "Soufiane", "Aymane", "Raphaël",
  "Badr", "Ilyass", "Nassim", "Ayman", "Ryan", "Mohamed", "Louis", "Zaid", "Othmane", "Iyad",
];

export const LAST_NAMES = [
  "Bennani", "Alami", "Lahlou", "Sabri", "Kabbaj", "Rochdi", "Mansouri", "Guerraoui", "Bouazza",
  "Tahiri", "Benjelloun", "Rifai", "Loudiyi", "Squalli", "Berrada", "Ouazzani", "Hakimi", "Nejjar",
  "Durand", "Lefèvre", "Marchand", "Fontaine", "Perrin", "Renaud", "Colin", "Barbier", "Leroy",
  "Silva", "Ferreira", "Okafor", "Diallo", "Traoré", "Keita", "Mendes",
];

// ---------------------------------------------------------------------------
// Observation note templates — strengths-based, never stigmatising.
// ---------------------------------------------------------------------------

type NoteBank = { positive: string[]; neutral: string[]; attention: string[] };

export const OBSERVATION_NOTES: Record<string, NoteBank> = {
  PARTICIPATION: {
    positive: [
      "Very good contribution during today's lesson.",
      "Volunteered to explain the method to the class.",
      "Asked a sharp question that helped everyone.",
      "Took part confidently in the group discussion.",
    ],
    neutral: [
      "Took part when invited.",
      "Followed the discussion attentively.",
      "Answered correctly when asked directly.",
    ],
    attention: [
      "Spoke up less than usual today — worth inviting in gently.",
      "Stayed quiet during group work; may benefit from a smaller group.",
    ],
  },
  ENGAGEMENT: {
    positive: [
      "Fully engaged from start to finish.",
      "Stayed focused through a demanding activity.",
      "Showed real interest in the topic and asked to go further.",
    ],
    neutral: ["Engaged steadily through the lesson.", "Worked through the tasks as expected."],
    attention: [
      "Attention drifted during the second half of the lesson.",
      "Seemed tired today; engagement lower than usual.",
    ],
  },
  EFFORT: {
    positive: [
      "Excellent effort on a difficult exercise.",
      "Kept trying after a first unsuccessful attempt.",
      "Reworked the exercise without being asked.",
    ],
    neutral: ["Consistent effort throughout the session."],
    attention: ["Gave up quickly on the harder task — could use a scaffolded step."],
  },
  COLLABORATION: {
    positive: [
      "Supported a classmate who was stuck.",
      "Organised the group work fairly and calmly.",
      "Listened well and built on others' ideas.",
    ],
    neutral: ["Worked well within the group."],
    attention: ["Found the group format difficult today; paired work may suit better."],
  },
  AUTONOMY: {
    positive: [
      "Started the task independently and managed time well.",
      "Used the resources available before asking for help.",
    ],
    neutral: ["Needed one prompt to get started, then worked independently."],
    attention: ["Needed frequent reassurance to move forward — a checklist could help."],
  },
  UNDERSTANDING: {
    positive: [
      "Clear grasp of the new concept; explained it in own words.",
      "Transferred yesterday's method to a new problem.",
    ],
    neutral: ["Understanding secure on the routine cases."],
    attention: [
      "Concept not fully secure yet — a short recap would help.",
      "Mixed up two methods; will revisit next lesson.",
    ],
  },
  MASTERY: {
    positive: ["Mastered the target skill for this unit.", "Accurate and confident across all exercises."],
    neutral: ["Progressing towards the unit target."],
    attention: ["Key step still fragile; short targeted practice suggested."],
  },
  IMPROVEMENT: {
    positive: [
      "Clear progress compared with last month.",
      "Noticeable improvement in written work quality.",
      "Best piece of work so far this term.",
    ],
    neutral: ["Holding the level reached last month."],
    attention: ["Slight dip compared with recent work — worth a quick check-in."],
  },
  BEHAVIOR: {
    positive: [
      "Very respectful and helpful attitude today.",
      "Set a calm example during the transition.",
      "Welcomed a new classmate into the group.",
    ],
    neutral: ["Positive and cooperative throughout."],
    attention: ["Found it hard to settle at the start of the lesson."],
  },
  DIFFICULTY: {
    positive: [],
    neutral: ["Some difficulty on the extension task, resolved with a hint."],
    attention: [
      "Struggled with the written instructions — will provide a simplified version.",
      "Difficulty keeping pace with the exercise; extra time given.",
    ],
  },
  SUPPORT_NEEDED: {
    positive: [],
    neutral: ["Asked for help appropriately and used it well."],
    attention: [
      "Would benefit from a short one-to-one on this unit.",
      "Asked for help twice this week — worth scheduling support time.",
    ],
  },
};

export const CHECKIN_NOTES_POSITIVE = [
  "Good day, I understood the maths lesson.",
  "Feeling ready for the week.",
  "Happy with my presentation today.",
  "Finished all my homework yesterday evening.",
  "Slept well and feel focused.",
];

export const CHECKIN_NOTES_NEUTRAL = [
  "Normal day.",
  "A bit tired but okay.",
  "Nothing special today.",
  "Lots of homework but manageable.",
];

export const CHECKIN_NOTES_DIFFICULT = [
  "I didn't sleep much last night.",
  "Too much homework this week.",
  "I did not understand the last exercise.",
  "Feeling a bit stressed about the test.",
  "I would like some help with the maths chapter.",
];

export const HELP_TOPICS = [
  "Mathematics — fractions",
  "Organising my homework",
  "French — written expression",
  "Science — the last chapter",
  "Feeling stressed about the assessment",
];

export const PARENT_INPUT_TEXT: Record<string, string[]> = {
  HOMEWORK_SUPPORT: [
    "We worked together on the maths exercises for about 30 minutes this evening.",
    "Reviewed the vocabulary list before dinner — going better than last week.",
    "Helped with the science project research at the weekend.",
  ],
  OBSERVATION: [
    "Seems more relaxed about school over the last two weeks.",
    "Has been going to bed later than usual; may explain the tiredness.",
    "Talks positively about the group project.",
  ],
  COMMENT: [
    "Thank you for the feedback, it was encouraging to read.",
    "We noticed real progress in reading at home too.",
    "We will keep an eye on the homework routine.",
  ],
  INFO_FOR_SCHOOL: [
    "Medical appointment on Thursday morning, will arrive around 10:00.",
    "Family travel next Monday, absence justified.",
    "Changed contact phone number, updated in the profile.",
  ],
  ACKNOWLEDGEMENT: [
    "Message received, thank you.",
    "Noted, we will discuss it at home this evening.",
  ],
  MESSAGE_TO_TEACHER: [
    "Could we arrange a short meeting to discuss the homework routine?",
    "Is there additional practice material we could use at home?",
    "Thank you for the support plan — what should we do on our side?",
  ],
};

export const GOAL_TEMPLATES = [
  { title: "Complete all mathematics homework this week", category: "HOMEWORK", metric: "Homework completion ≥ 90%" },
  { title: "Ask one question in class every day", category: "ACADEMIC", metric: "Participation observations ≥ 5 / week" },
  { title: "Prepare my school bag the evening before", category: "ORGANISATION", metric: "Self-reported 5 days / week" },
  { title: "Read 20 minutes every evening", category: "ACADEMIC", metric: "20 min × 5 days" },
  { title: "Arrive on time every morning", category: "ORGANISATION", metric: "0 late arrivals for 3 weeks" },
  { title: "Take a short break before homework", category: "WELLBEING", metric: "Stress rating ≤ 3" },
  { title: "Improve my science assessment average", category: "ACADEMIC", metric: "Average ≥ 14/20" },
  { title: "Help a classmate once a week", category: "COMPETENCY", metric: "Collaboration observations ≥ 3" },
];

export const ACHIEVEMENT_TEMPLATES = [
  { title: "Homework streak", description: "Two full weeks with every assignment handed in.", category: "PROGRESS", icon: "flame", level: "SILVER" },
  { title: "Perfect attendance month", description: "Present every single day this month.", category: "ATTENDANCE", icon: "calendar-check", level: "GOLD" },
  { title: "Great collaborator", description: "Repeatedly supported classmates during group work.", category: "COLLABORATION", icon: "users", level: "SILVER" },
  { title: "Big step forward", description: "Clear improvement across several indicators.", category: "PROGRESS", icon: "trending-up", level: "GOLD" },
  { title: "Curious mind", description: "Asked outstanding questions in class this term.", category: "EFFORT", icon: "lightbulb", level: "BRONZE" },
  { title: "Competency secured", description: "Reached a secure level in critical thinking.", category: "COMPETENCY", icon: "target", level: "SILVER" },
  { title: "Consistent effort", description: "Steady effort maintained over the whole term.", category: "EFFORT", icon: "dumbbell", level: "BRONZE" },
];

export const INTERVENTION_TEMPLATES = [
  {
    title: "Homework routine support",
    issue: "Difficulty completing homework regularly.",
    action: "15-minute teacher support every Tuesday plus a shared weekly checklist with the family.",
    responsible: "Teacher + parent",
    successIndicator: "80% homework completion over 4 weeks",
  },
  {
    title: "Morning arrival plan",
    issue: "Repeated late arrivals in the morning.",
    action: "Agreed morning routine with the family, weekly follow-up with the homeroom teacher.",
    responsible: "Homeroom teacher + parent",
    successIndicator: "No late arrival for 3 consecutive weeks",
  },
  {
    title: "Confidence in mathematics",
    issue: "Understanding is fragile and confidence is low in mathematics.",
    action: "Small-group reinforcement twice a week, starting from secured prerequisites.",
    responsible: "Mathematics teacher",
    successIndicator: "Assessment average ≥ 12/20",
  },
  {
    title: "Re-engagement check-ins",
    issue: "Participation and self-reported motivation have declined.",
    action: "Short weekly one-to-one conversation, student chooses one focus for the week.",
    responsible: "Homeroom teacher",
    successIndicator: "Motivation self-report ≥ 3.5 for 3 weeks",
  },
];

export const COMPETENCY_FRAMEWORK = [
  { code: "COMM", name: "Communication", category: "TRANSVERSAL", icon: "message-circle" },
  { code: "CRIT", name: "Critical thinking", category: "TRANSVERSAL", icon: "brain" },
  { code: "CREA", name: "Creativity", category: "TRANSVERSAL", icon: "palette" },
  { code: "COLL", name: "Collaboration", category: "SOCIAL", icon: "users" },
  { code: "PROB", name: "Problem solving", category: "ACADEMIC", icon: "puzzle" },
  { code: "DIGI", name: "Digital skills", category: "DIGITAL", icon: "laptop" },
  { code: "LEAD", name: "Leadership", category: "SOCIAL", icon: "flag" },
  { code: "AUTO", name: "Autonomy", category: "TRANSVERSAL", icon: "compass" },
  { code: "ORGA", name: "Organisation", category: "TRANSVERSAL", icon: "list-checks" },
];

export const SUBJECT_DEFS = [
  { code: "MATH", name: "Mathematics", color: "#3b82f6", icon: "sigma", core: true },
  { code: "FR", name: "French", color: "#8b5cf6", icon: "book-open", core: true },
  { code: "EN", name: "English", color: "#06b6d4", icon: "languages", core: true },
  { code: "AR", name: "Arabic", color: "#10b981", icon: "type", core: true },
  { code: "SCI", name: "Science", color: "#f59e0b", icon: "flask-conical", core: true },
  { code: "HG", name: "History & Geography", color: "#ef4444", icon: "globe", core: true },
  { code: "PE", name: "Physical Education", color: "#22c55e", icon: "activity", core: false },
  { code: "ART", name: "Art", color: "#ec4899", icon: "brush", core: false },
  { code: "ICT", name: "Digital Technology", color: "#6366f1", icon: "monitor", core: false },
];

export const TEACHER_DEFS = [
  { first: "Amina", last: "Martin", title: "Mrs.", subject: "MATH", homeroom: "8B" },
  { first: "Karim", last: "Oulad", title: "Mr.", subject: "FR", homeroom: "7A" },
  { first: "Sofia", last: "Bennani", title: "Ms.", subject: "EN", homeroom: "7B" },
  { first: "Rachid", last: "Amrani", title: "Mr.", subject: "AR", homeroom: "9B" },
  { first: "Laila", last: "Fahmi", title: "Mrs.", subject: "SCI", homeroom: "8A" },
  { first: "Yassine", last: "Ait Ali", title: "Mr.", subject: "HG", homeroom: "9A" },
  { first: "Nadia", last: "Chaoui", title: "Ms.", subject: "PE", homeroom: null },
  { first: "Hamid", last: "Ziani", title: "Mr.", subject: "ART", homeroom: null },
  { first: "Meryem", last: "Saidi", title: "Ms.", subject: "ICT", homeroom: null },
  { first: "Driss", last: "Lamrani", title: "Mr.", subject: "MATH", homeroom: null },
  { first: "Fatima", last: "Ouali", title: "Mrs.", subject: "FR", homeroom: null },
  { first: "Omar", last: "Skalli", title: "Dr.", subject: "SCI", homeroom: null },
];

export const CLASS_DEFS = [
  { name: "7A", gradeLevel: "Grade 7", gradeOrder: 7, section: "A", room: "R-104", size: 24, demo: false },
  { name: "7B", gradeLevel: "Grade 7", gradeOrder: 7, section: "B", room: "R-105", size: 25, demo: false },
  { name: "8A", gradeLevel: "Grade 8", gradeOrder: 8, section: "A", room: "R-201", size: 25, demo: false },
  { name: "8B", gradeLevel: "Grade 8", gradeOrder: 8, section: "B", room: "R-202", size: 26, demo: true },
  { name: "9A", gradeLevel: "Grade 9", gradeOrder: 9, section: "A", room: "R-301", size: 24, demo: false },
  { name: "9B", gradeLevel: "Grade 9", gradeOrder: 9, section: "B", room: "R-302", size: 23, demo: false },
];

export const ASSESSMENT_TITLES: Record<string, string[]> = {
  MATH: ["Fractions quiz", "Linear equations test", "Geometry problems", "Mental arithmetic check", "Unit review"],
  FR: ["Reading comprehension", "Argumentative text", "Grammar assessment", "Dictation", "Oral presentation"],
  EN: ["Vocabulary quiz", "Listening comprehension", "Short essay", "Speaking assessment", "Reading test"],
  AR: ["Reading fluency", "Grammar test", "Text analysis", "Written expression", "Recitation"],
  SCI: ["Cells and organisms", "Energy experiment report", "Chemistry quiz", "Lab practical", "Unit test"],
  HG: ["Map reading", "Industrial revolution", "Climate and regions", "Document analysis", "Term test"],
  PE: ["Endurance assessment", "Team sport evaluation"],
  ART: ["Portfolio review", "Composition project"],
  ICT: ["Spreadsheet skills", "Algorithm basics"],
};

export const HOMEWORK_TITLES: Record<string, string[]> = {
  MATH: ["Exercises 12–18 p.94", "Fraction worksheet", "Problem set: equations", "Geometry construction", "Revision sheet"],
  FR: ["Read chapter 4 and summarise", "Conjugation exercises", "Write a short paragraph", "Vocabulary list", "Prepare oral reading"],
  EN: ["Workbook p.32", "Learn 15 new words", "Write 10 sentences", "Listen and answer", "Read the short story"],
  AR: ["Copy and read the text", "Grammar exercises", "Learn the poem", "Written expression", "Reading practice"],
  SCI: ["Complete the lab sheet", "Diagram of the cell", "Read pages 44–47", "Answer questions 1–6", "Prepare the experiment"],
  HG: ["Label the map", "Read and take notes", "Answer the document questions", "Timeline exercise", "Short research task"],
  PE: ["Stretching routine", "Prepare kit for match"],
  ART: ["Finish the sketch", "Collect reference images"],
  ICT: ["Finish the spreadsheet", "Write the algorithm steps"],
};

export const TEACHER_FEEDBACK_POSITIVE = [
  "Very solid work, keep this method.",
  "Clear presentation and correct reasoning.",
  "Real progress compared with the previous assignment.",
  "Excellent attention to detail.",
];

export const TEACHER_FEEDBACK_SUPPORT = [
  "Good start — review step 2 and hand it back in.",
  "Almost there; the method is right but check the calculations.",
  "Let's go over this together on Tuesday.",
  "Try the simplified version first, then the full exercise.",
];
