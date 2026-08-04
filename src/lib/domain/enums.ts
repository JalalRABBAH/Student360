/**
 * STUDENT360 — shared domain vocabulary.
 *
 * The database stores enum-like values as plain strings so that the exact same
 * Prisma schema runs on SQLite (local dev) and PostgreSQL (production).
 * Every allowed value, its human label and its visual treatment live here so
 * the UI, the API validators and the analytics engine never drift apart.
 */

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

export const ROLES = {
  STUDENT: "STUDENT",
  TEACHER: "TEACHER",
  PARENT: "PARENT",
  NURSE: "NURSE",
  ADMIN: "ADMIN",
  PRINCIPAL: "PRINCIPAL",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type RoleCode = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<RoleCode, string> = {
  STUDENT: "Student",
  TEACHER: "Teacher",
  PARENT: "Parent / Guardian",
  NURSE: "School nurse",
  ADMIN: "School administration",
  PRINCIPAL: "School management",
  SUPER_ADMIN: "Platform administrator",
};

export const ROLE_RANK: Record<RoleCode, number> = {
  STUDENT: 10,
  PARENT: 20,
  TEACHER: 30,
  NURSE: 35,
  ADMIN: 40,
  PRINCIPAL: 50,
  SUPER_ADMIN: 100,
};

export const STAFF_ROLES: RoleCode[] = ["TEACHER", "NURSE", "ADMIN", "PRINCIPAL", "SUPER_ADMIN"];
export const LEADERSHIP_ROLES: RoleCode[] = ["ADMIN", "PRINCIPAL", "SUPER_ADMIN"];

// ---------------------------------------------------------------------------
// Visibility (privacy by design)
// ---------------------------------------------------------------------------

export const VISIBILITY = {
  STUDENT_ONLY: "STUDENT_ONLY",
  TEACHER_ONLY: "TEACHER_ONLY",
  SCHOOL_STAFF: "SCHOOL_STAFF",
  INCLUDING_STUDENT: "INCLUDING_STUDENT",
  INCLUDING_PARENTS: "INCLUDING_PARENTS",
  PARTICIPANTS: "PARTICIPANTS",
} as const;

export type Visibility = (typeof VISIBILITY)[keyof typeof VISIBILITY];

export const VISIBILITY_LABELS: Record<string, string> = {
  STUDENT_ONLY: "Private to the student",
  TEACHER_ONLY: "Restricted — recording teacher only",
  SCHOOL_STAFF: "School staff",
  INCLUDING_STUDENT: "School staff + student",
  INCLUDING_PARENTS: "School staff + family",
  PARTICIPANTS: "Conversation participants",
};

// ---------------------------------------------------------------------------
// Check-in / wellbeing
// ---------------------------------------------------------------------------

export const MOOD_SCALE = [
  { value: 5, emoji: "😄", label: "Great", tone: "excellent" },
  { value: 4, emoji: "🙂", label: "Good", tone: "good" },
  { value: 3, emoji: "😐", label: "Neutral", tone: "neutral" },
  { value: 2, emoji: "😟", label: "Difficult", tone: "watch" },
  { value: 1, emoji: "😞", label: "Very difficult", tone: "attention" },
] as const;

export function moodMeta(value?: number | null) {
  if (!value) return { value: 0, emoji: "–", label: "No check-in", tone: "unknown" as const };
  return MOOD_SCALE.find((m) => m.value === Math.round(value)) ?? MOOD_SCALE[2];
}

export const HOMEWORK_STATUS = {
  DONE: "DONE",
  PARTIAL: "PARTIAL",
  NOT_DONE: "NOT_DONE",
  NEED_HELP: "NEED_HELP",
} as const;

export const HOMEWORK_STATUS_LABELS: Record<string, string> = {
  DONE: "Done",
  PARTIAL: "Partially done",
  NOT_DONE: "Not done",
  NEED_HELP: "Need help",
};

export const SUPPORT_OPTIONS = [
  "A short explanation of today's lesson",
  "More time for homework",
  "Someone to study with",
  "A quiet moment",
  "Help organising my work",
  "To talk with my teacher",
] as const;

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------

export const ATTENDANCE_STATUS = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  LATE: "LATE",
  EXCUSED: "EXCUSED",
} as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];

export const ATTENDANCE_LABELS: Record<string, string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LATE: "Late",
  EXCUSED: "Excused",
};

export const ATTENDANCE_TONE: Record<string, "positive" | "neutral" | "warning" | "attention"> = {
  PRESENT: "positive",
  LATE: "warning",
  EXCUSED: "neutral",
  ABSENT: "attention",
};

// ---------------------------------------------------------------------------
// Homework submissions
// ---------------------------------------------------------------------------

export const SUBMISSION_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  PARTIAL: "PARTIAL",
  NOT_DONE: "NOT_DONE",
  LATE: "LATE",
  MISSING: "MISSING",
  NEED_HELP: "NEED_HELP",
} as const;

export const SUBMISSION_LABELS: Record<string, string> = {
  PENDING: "Not submitted yet",
  COMPLETED: "Completed",
  PARTIAL: "Partially completed",
  NOT_DONE: "Not done",
  LATE: "Completed late",
  MISSING: "Missing",
  NEED_HELP: "Help requested",
};

export const SUBMISSION_TONE: Record<string, "positive" | "neutral" | "warning" | "attention"> = {
  COMPLETED: "positive",
  LATE: "warning",
  PARTIAL: "warning",
  PENDING: "neutral",
  NEED_HELP: "warning",
  NOT_DONE: "attention",
  MISSING: "attention",
};

/** Submission statuses that count as "the work was handed in". */
export const SUBMISSION_DONE_STATUSES = ["COMPLETED", "LATE"];

// ---------------------------------------------------------------------------
// Observations
// ---------------------------------------------------------------------------

export const OBSERVATION_CATEGORIES = [
  { code: "PARTICIPATION", label: "Participation", icon: "hand" },
  { code: "ENGAGEMENT", label: "Engagement", icon: "flame" },
  { code: "EFFORT", label: "Effort", icon: "dumbbell" },
  { code: "COLLABORATION", label: "Collaboration", icon: "users" },
  { code: "AUTONOMY", label: "Autonomy", icon: "compass" },
  { code: "UNDERSTANDING", label: "Understanding", icon: "lightbulb" },
  { code: "MASTERY", label: "Academic mastery", icon: "target" },
  { code: "IMPROVEMENT", label: "Improvement", icon: "trending-up" },
  { code: "BEHAVIOR", label: "Positive behaviour", icon: "sparkles" },
  { code: "DIFFICULTY", label: "Difficulty observed", icon: "life-buoy" },
  { code: "SUPPORT_NEEDED", label: "Support needed", icon: "hand-helping" },
] as const;

export const OBSERVATION_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  OBSERVATION_CATEGORIES.map((c) => [c.code, c.label]),
);

export const SENTIMENTS = {
  POSITIVE: "POSITIVE",
  NEUTRAL: "NEUTRAL",
  ATTENTION: "ATTENTION",
} as const;

export const SENTIMENT_LABELS: Record<string, string> = {
  POSITIVE: "Positive",
  NEUTRAL: "Neutral",
  ATTENTION: "Needs attention",
};

// ---------------------------------------------------------------------------
// Engagement dimensions (radar chart)
// ---------------------------------------------------------------------------

export const ENGAGEMENT_DIMENSIONS = [
  { code: "PARTICIPATION", label: "Participation" },
  { code: "ATTENTION", label: "Attention" },
  { code: "EFFORT", label: "Effort" },
  { code: "COLLABORATION", label: "Collaboration" },
  { code: "AUTONOMY", label: "Autonomy" },
  { code: "CURIOSITY", label: "Curiosity" },
  { code: "PERSISTENCE", label: "Persistence" },
] as const;

// ---------------------------------------------------------------------------
// Class dashboard view modes ("view class by …")
// ---------------------------------------------------------------------------

export const CLASS_VIEW_MODES = [
  { code: "OVERVIEW", label: "Overview", hint: "Composite student picture" },
  { code: "ATTENDANCE", label: "Attendance", hint: "Presence over the period" },
  { code: "HOMEWORK", label: "Homework", hint: "Completion rate" },
  { code: "ENGAGEMENT", label: "Engagement", hint: "Observed engagement" },
  { code: "PROGRESS", label: "Academic progress", hint: "Recent academic trend" },
  { code: "MOOD", label: "Mood", hint: "Latest student check-in" },
  { code: "MOTIVATION", label: "Motivation", hint: "Self-reported motivation" },
  { code: "COMPETENCIES", label: "Competencies", hint: "Competency mastery" },
  { code: "SUPPORT", label: "Support required", hint: "Open support signals" },
] as const;

export type ClassViewMode = (typeof CLASS_VIEW_MODES)[number]["code"];

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

export const ALERT_LEVELS = {
  INFO: "INFO",
  WATCH: "WATCH",
  ACTION_SUGGESTED: "ACTION_SUGGESTED",
} as const;

export type AlertLevel = (typeof ALERT_LEVELS)[keyof typeof ALERT_LEVELS];

export const ALERT_LEVEL_LABELS: Record<string, string> = {
  INFO: "Information",
  WATCH: "Keep an eye",
  ACTION_SUGGESTED: "Attention suggested",
};

export const ALERT_LEVEL_ORDER: Record<string, number> = {
  ACTION_SUGGESTED: 3,
  WATCH: 2,
  INFO: 1,
};

export const SIGNAL_CODES = {
  HOMEWORK_DECLINE: "HOMEWORK_DECLINE",
  MISSING_ASSIGNMENTS: "MISSING_ASSIGNMENTS",
  ATTENDANCE_DECLINE: "ATTENDANCE_DECLINE",
  LATENESS: "LATENESS",
  PARTICIPATION_DROP: "PARTICIPATION_DROP",
  MOTIVATION_DROP: "MOTIVATION_DROP",
  ACADEMIC_DROP: "ACADEMIC_DROP",
  MULTIPLE_OBSERVATIONS: "MULTIPLE_OBSERVATIONS",
  REPEATED_HELP_REQUESTS: "REPEATED_HELP_REQUESTS",
  MOOD_DECLINE: "MOOD_DECLINE",
  NO_CHECKINS: "NO_CHECKINS",
  POSITIVE_MOMENTUM: "POSITIVE_MOMENTUM",
  COMBINED: "COMBINED",
} as const;

// ---------------------------------------------------------------------------
// Goals / interventions
// ---------------------------------------------------------------------------

export const GOAL_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "In progress",
  ACHIEVED: "Achieved",
  PAUSED: "Paused",
  CANCELLED: "Cancelled",
  MISSED: "Not reached",
};

export const GOAL_CATEGORY_LABELS: Record<string, string> = {
  ACADEMIC: "Academic",
  HOMEWORK: "Homework",
  ORGANISATION: "Organisation",
  WELLBEING: "Wellbeing",
  BEHAVIOUR: "Class life",
  COMPETENCY: "Competency",
};

export const INTERVENTION_STATUS_LABELS: Record<string, string> = {
  PLANNED: "Planned",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const INTERVENTION_OUTCOME_LABELS: Record<string, string> = {
  IMPROVED: "Improved",
  STABLE: "Stable",
  NO_CHANGE: "No measurable change",
  DECLINED: "Needs a new approach",
};

// ---------------------------------------------------------------------------
// Parent inputs
// ---------------------------------------------------------------------------

export const PARENT_INPUT_TYPES = [
  { code: "HOMEWORK_SUPPORT", label: "Homework support provided", icon: "book-open" },
  { code: "OBSERVATION", label: "General observation", icon: "eye" },
  { code: "COMMENT", label: "Comment", icon: "message-circle" },
  { code: "INFO_FOR_SCHOOL", label: "Information for the school", icon: "info" },
  { code: "ACKNOWLEDGEMENT", label: "Acknowledge school message", icon: "check-check" },
  { code: "MESSAGE_TO_TEACHER", label: "Message to teacher", icon: "send" },
] as const;

export const PARENT_INPUT_LABELS: Record<string, string> = Object.fromEntries(
  PARENT_INPUT_TYPES.map((t) => [t.code, t.label]),
);

// ---------------------------------------------------------------------------
// Activity events
// ---------------------------------------------------------------------------

export const EVENT_TYPE_LABELS: Record<string, string> = {
  CHECK_IN: "Daily check-in",
  ATTENDANCE: "Attendance",
  HOMEWORK_ASSIGNED: "Homework assigned",
  HOMEWORK_SUBMITTED: "Homework",
  OBSERVATION: "Teacher observation",
  GRADE: "Assessment",
  PARENT_INPUT: "Family input",
  HELP_REQUEST: "Support request",
  GOAL: "Goal",
  INTERVENTION: "Support plan",
  ACHIEVEMENT: "Achievement",
  MESSAGE: "Message",
  ALERT: "Signal",
};

export const EVENT_TYPE_ICONS: Record<string, string> = {
  CHECK_IN: "smile",
  ATTENDANCE: "user-check",
  HOMEWORK_ASSIGNED: "clipboard-list",
  HOMEWORK_SUBMITTED: "clipboard-check",
  OBSERVATION: "eye",
  GRADE: "graduation-cap",
  PARENT_INPUT: "home",
  HELP_REQUEST: "life-buoy",
  GOAL: "target",
  INTERVENTION: "hand-helping",
  ACHIEVEMENT: "trophy",
  MESSAGE: "message-square",
  ALERT: "activity",
};

// ---------------------------------------------------------------------------
// Indicators shown on the Student 360 profile
// ---------------------------------------------------------------------------

export const STUDENT_INDICATORS = [
  { code: "academic", label: "Academic", hint: "Weighted assessment performance" },
  { code: "engagement", label: "Engagement", hint: "Observed engagement in class" },
  { code: "homework", label: "Homework", hint: "Assignments handed in" },
  { code: "attendance", label: "Attendance", hint: "Presence rate" },
  { code: "motivation", label: "Motivation", hint: "Self-reported motivation" },
  { code: "wellbeing", label: "Wellbeing", hint: "Self-reported mood & energy" },
] as const;

export type IndicatorCode = (typeof STUDENT_INDICATORS)[number]["code"];

export const TREND = {
  UP: "UP",
  DOWN: "DOWN",
  STABLE: "STABLE",
} as const;

export type Trend = (typeof TREND)[keyof typeof TREND];

// ---------------------------------------------------------------------------
// Grading systems (schools configure their own)
// ---------------------------------------------------------------------------

export const GRADING_SYSTEMS = [
  { code: "NUMERIC_20", label: "Out of 20 (FR / MA)", max: 20 },
  { code: "NUMERIC_100", label: "Percentage (out of 100)", max: 100 },
  { code: "LETTER", label: "Letter grades (A–F)", max: 100 },
  { code: "COMPETENCY_4", label: "Competency levels (0–4)", max: 4 },
] as const;

export const COMPETENCY_LEVELS = [
  { level: 0, label: "Not assessed", short: "–" },
  { level: 1, label: "Emerging", short: "E" },
  { level: 2, label: "Developing", short: "D" },
  { level: 3, label: "Secure", short: "S" },
  { level: 4, label: "Mastered", short: "M" },
] as const;

export function competencyLevelLabel(level: number) {
  return COMPETENCY_LEVELS.find((l) => l.level === level)?.label ?? "Not assessed";
}

export function letterFromPercentage(pct: number) {
  if (pct >= 90) return "A";
  if (pct >= 80) return "B";
  if (pct >= 70) return "C";
  if (pct >= 60) return "D";
  return "E";
}

// ---------------------------------------------------------------------------
// Phase 1 — enriched student file
// ---------------------------------------------------------------------------

export const STUDENT_REGIME = {
  EXTERN: "EXTERN",
  HALF_BOARD: "HALF_BOARD",
  BOARDER: "BOARDER",
} as const;

export const STUDENT_REGIME_LABELS: Record<string, string> = {
  EXTERN: "Day student",
  HALF_BOARD: "Half board",
  BOARDER: "Boarding",
};

export const TRANSPORT_MODES = ["BUS", "WALK", "CAR", "OTHER"] as const;
export const TRANSPORT_MODE_LABELS: Record<string, string> = {
  BUS: "School bus",
  WALK: "On foot",
  CAR: "Dropped off by car",
  OTHER: "Other",
};

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "UNKNOWN"] as const;

export const DISCIPLINE_TYPES = [
  // recognition (encouragement spectrum)
  { code: "HONOR_ROLL", label: "Honor roll", icon: "award", positive: true },
  { code: "COMMENDATION", label: "Commendation", icon: "thumbs-up", positive: true },
  { code: "ENCOURAGEMENT", label: "Encouragement", icon: "sparkles", positive: true },
  // sanctions
  { code: "WARNING", label: "Warning", icon: "alert-triangle", positive: false },
  { code: "BLAME", label: "Blame / reprimand", icon: "alert-circle", positive: false },
  { code: "EXCLUSION", label: "Temporary exclusion", icon: "x-circle", positive: false },
] as const;

export const DISCIPLINE_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  DISCIPLINE_TYPES.map((t) => [t.code, t.label]),
);

export function isDisciplinePositive(type: string) {
  return DISCIPLINE_TYPES.find((t) => t.code === type)?.positive ?? false;
}

export const DISCIPLINE_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  CLOSED: "Closed",
  EXPUNGED: "Expunged",
};

export const LEARNING_PLAN_TYPES = [
  { code: "PAI", label: "PAI — Individual accommodation plan", short: "PAI" },
  { code: "PAP", label: "PAP — Personal support plan", short: "PAP" },
  { code: "PPS", label: "PPS — Personal schooling plan", short: "PPS" },
  { code: "AESH", label: "AESH — School support staff", short: "AESH" },
  { code: "OTHER", label: "Other", short: "Other" },
] as const;

export const LEARNING_PLAN_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  LEARNING_PLAN_TYPES.map((t) => [t.code, t.label]),
);

export const LEARNING_PLAN_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  PAUSED: "Paused",
  CANCELLED: "Cancelled",
};

export const MEETING_STATUS = {
  SCHEDULED: "SCHEDULED",
  DONE: "DONE",
  CANCELLED: "CANCELLED",
} as const;

export const MEETING_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Scheduled",
  DONE: "Held",
  CANCELLED: "Cancelled",
};

export const PICKUP_RELATIONSHIP_LABELS: Record<string, string> = {
  GRANDPARENT: "Grandparent",
  BABYSITTER: "Babysitter",
  SIBLING: "Sibling",
  AUNT: "Aunt / uncle",
  UNCLE: "Aunt / uncle",
  OTHER: "Other",
};

export const DAILY_RATING_CRITERIA = [
  { code: "punctuality", label: "Punctuality", short: "Punct." },
  { code: "participation", label: "Participation", short: "Partic." },
  { code: "classwork", label: "Class work", short: "Class" },
  { code: "homework", label: "Homework", short: "HW" },
  { code: "behavior", label: "Behaviour", short: "Behav." },
  { code: "rules", label: "Class rules", short: "Rules" },
  { code: "concentration", label: "Concentration", short: "Focus" },
  { code: "motivation", label: "Motivation", short: "Motive." },
  { code: "groupWork", label: "Group work", short: "Group" },
  { code: "autonomy", label: "Autonomy", short: "Auton." },
  { code: "organisation", label: "Organisation", short: "Organ." },
] as const;

export type DailyRatingCriterion = (typeof DAILY_RATING_CRITERIA)[number]["code"];

export const DAILY_RATING_LABELS: Record<string, string> = Object.fromEntries(
  DAILY_RATING_CRITERIA.map((c) => [c.code, c.label]),
);

export const CONSENT_TYPE_LABELS: Record<string, string> = {
  DATA_PROCESSING: "Data processing",
  WELLBEING_TRACKING: "Wellbeing tracking",
  PHOTO_USE: "Photo use (image rights)",
  EXTERNAL_SHARING: "Sharing with external parties",
  AI_ASSISTANCE: "AI-assisted follow-up",
  FIELD_TRIP: "Field trips & outings",
  MEDICAL_EMERGENCY: "Emergency medical care",
};
