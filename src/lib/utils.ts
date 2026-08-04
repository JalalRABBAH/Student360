import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---------------------------------------------------------------------------
// Numbers
// ---------------------------------------------------------------------------

export function pct(value: number | null | undefined, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return "–";
  return `${value.toFixed(digits)}%`;
}

export function round(value: number | null | undefined, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

export function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

export function avg(values: (number | null | undefined)[]) {
  const nums = values.filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function sum(values: (number | null | undefined)[]) {
  return values.reduce<number>((a, b) => a + (typeof b === "number" ? b : 0), 0);
}

/** Safe division returning null instead of NaN/Infinity. */
export function ratio(numerator: number, denominator: number) {
  if (!denominator) return null;
  return numerator / denominator;
}

export function percentOf(numerator: number, denominator: number) {
  const r = ratio(numerator, denominator);
  return r === null ? null : r * 100;
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

export function startOfDay(date: Date | string) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date | string) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(date: Date | string, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function daysBetween(a: Date | string, b: Date | string) {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86_400_000);
}

export function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isSameDay(a: Date | string, b: Date | string) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function isoDate(date: Date | string) {
  return startOfDay(date).toISOString().slice(0, 10);
}

export function formatDate(date: Date | string | null | undefined, locale = "en-GB") {
  if (!date) return "–";
  return new Date(date).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateShort(date: Date | string | null | undefined, locale = "en-GB") {
  if (!date) return "–";
  return new Date(date).toLocaleDateString(locale, { day: "2-digit", month: "short" });
}

export function formatTime(date: Date | string | null | undefined, locale = "en-GB") {
  if (!date) return "–";
  return new Date(date).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function formatDateTime(date: Date | string | null | undefined, locale = "en-GB") {
  if (!date) return "–";
  return `${formatDateShort(date, locale)} · ${formatTime(date, locale)}`;
}

export function relativeTime(date: Date | string | null | undefined) {
  if (!date) return "–";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks} w ago`;
  return formatDate(date);
}

export function weekNumber(date: Date | string) {
  const d = new Date(Date.UTC(new Date(date).getFullYear(), new Date(date).getMonth(), new Date(date).getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

export function startOfWeek(date: Date | string) {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday first
  return addDays(d, diff);
}

export function greetingFor(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// ---------------------------------------------------------------------------
// Strings
// ---------------------------------------------------------------------------

export function initials(firstName?: string | null, lastName?: string | null) {
  return `${(firstName ?? "").charAt(0)}${(lastName ?? "").charAt(0)}`.toUpperCase() || "?";
}

export function fullName(p?: { firstName?: string | null; lastName?: string | null } | null) {
  if (!p) return "–";
  return `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim();
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function truncate(value: string, max = 120) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

export function ageFrom(dateOfBirth?: Date | string | null) {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const diff = Date.now() - dob.getTime();
  return Math.floor(diff / (365.25 * 86_400_000));
}

// ---------------------------------------------------------------------------
// JSON helpers (SQLite stores JSON payloads as text)
// ---------------------------------------------------------------------------

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function stringifyJson(value: unknown) {
  return JSON.stringify(value ?? null);
}

// ---------------------------------------------------------------------------
// Deterministic pseudo-random helpers (used by the demo seed + avatars)
// ---------------------------------------------------------------------------

export function hashString(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const AVATAR_GRADIENTS = [
  "from-emerald-400 to-teal-600",
  "from-sky-400 to-indigo-600",
  "from-amber-400 to-orange-600",
  "from-fuchsia-400 to-purple-600",
  "from-rose-400 to-pink-600",
  "from-lime-400 to-green-600",
  "from-cyan-400 to-blue-600",
  "from-violet-400 to-indigo-700",
];

export function avatarGradient(seed: string) {
  return AVATAR_GRADIENTS[hashString(seed) % AVATAR_GRADIENTS.length];
}

// ---------------------------------------------------------------------------
// Indicator visuals
// ---------------------------------------------------------------------------

export type Tone = "excellent" | "good" | "neutral" | "watch" | "attention" | "unknown";

export function toneForScore(score: number | null | undefined): Tone {
  if (score === null || score === undefined) return "unknown";
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 55) return "neutral";
  if (score >= 40) return "watch";
  return "attention";
}

export const TONE_TEXT: Record<Tone, string> = {
  excellent: "text-emerald-500 dark:text-emerald-400",
  good: "text-teal-500 dark:text-teal-300",
  neutral: "text-sky-500 dark:text-sky-300",
  watch: "text-amber-500 dark:text-amber-400",
  attention: "text-rose-500 dark:text-rose-400",
  unknown: "text-slate-400 dark:text-slate-500",
};

export const TONE_BG: Record<Tone, string> = {
  excellent: "bg-emerald-500",
  good: "bg-teal-500",
  neutral: "bg-sky-500",
  watch: "bg-amber-500",
  attention: "bg-rose-500",
  unknown: "bg-slate-400",
};

export const TONE_SOFT: Record<Tone, string> = {
  excellent: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300 ring-emerald-500/25",
  good: "bg-teal-500/12 text-teal-600 dark:text-teal-300 ring-teal-500/25",
  neutral: "bg-sky-500/12 text-sky-600 dark:text-sky-300 ring-sky-500/25",
  watch: "bg-amber-500/14 text-amber-700 dark:text-amber-300 ring-amber-500/25",
  attention: "bg-rose-500/12 text-rose-600 dark:text-rose-300 ring-rose-500/25",
  unknown: "bg-slate-500/10 text-slate-500 dark:text-slate-400 ring-slate-500/20",
};

export function trendFromDelta(delta: number | null | undefined, threshold = 3): "UP" | "DOWN" | "STABLE" {
  if (delta === null || delta === undefined) return "STABLE";
  if (delta >= threshold) return "UP";
  if (delta <= -threshold) return "DOWN";
  return "STABLE";
}
