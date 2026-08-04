// ---------------------------------------------------------------------------
// Seed utilities — deterministic randomness, date maths, bulk insert helpers.
//
// Everything is driven by a single seeded PRNG so that re-running the seed
// produces the exact same demo dataset (stable screenshots, stable tests).
// ---------------------------------------------------------------------------

export type Rng = () => number;

/** Mulberry32 — small, fast, deterministic PRNG. */
export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length) % arr.length];
}

export function pickMany<T>(rng: Rng, arr: readonly T[], n: number): T[] {
  const pool = [...arr];
  const out: T[] = [];
  while (out.length < n && pool.length) {
    out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  }
  return out;
}

export function chance(rng: Rng, p: number): boolean {
  return rng() < p;
}

export function int(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clampRange(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** Symmetric jitter in [-amount, +amount]. */
export function jitter(rng: Rng, amount: number): number {
  return (rng() * 2 - 1) * amount;
}

/** Turn a 1..5 float into a jittered 1..5 integer. */
export function scale5(rng: Rng, value: number, spread = 0.55): number {
  return Math.round(clampRange(value + jitter(rng, spread), 1, 5));
}

/** Turn a 0..100 float into a jittered 0..100 integer. */
export function score100(rng: Rng, value: number, spread = 8): number {
  return Math.round(clampRange(value + jitter(rng, spread), 0, 100));
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

export function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

export function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

/** "08:15" applied to a day. */
export function atTime(day: Date, hhmm: string, minuteOffset = 0): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const c = startOfDay(day);
  c.setHours(h, m + minuteOffset, 0, 0);
  return c;
}

/** The `count` most recent school days (Mon–Fri) ending at `end`, ascending. */
export function schoolDaysBack(end: Date, count: number): Date[] {
  const out: Date[] = [];
  let cursor = startOfDay(end);
  while (out.length < count) {
    if (!isWeekend(cursor)) out.push(new Date(cursor));
    cursor = addDays(cursor, -1);
  }
  return out.reverse();
}

/** The next `count` school days strictly after `start`, ascending. */
export function schoolDaysForward(start: Date, count: number): Date[] {
  const out: Date[] = [];
  let cursor = addDays(startOfDay(start), 1);
  while (out.length < count) {
    if (!isWeekend(cursor)) out.push(new Date(cursor));
    cursor = addDays(cursor, 1);
  }
  return out;
}

/** ISO-ish week key used to group school days into weeks. */
export function weekKey(d: Date): string {
  const c = startOfDay(d);
  const day = (c.getDay() + 6) % 7; // Monday = 0
  const monday = addDays(c, -day);
  return `${monday.getFullYear()}-${monday.getMonth() + 1}-${monday.getDate()}`;
}

/** Group ascending school days into weeks (ascending, oldest first). */
export function groupByWeek(days: Date[]): Date[][] {
  const map = new Map<string, Date[]>();
  for (const d of days) {
    const k = weekKey(d);
    const list = map.get(k);
    if (list) list.push(d);
    else map.set(k, [d]);
  }
  return [...map.values()];
}

export function monday(d: Date): Date {
  const c = startOfDay(d);
  return addDays(c, -((c.getDay() + 6) % 7));
}

// ---------------------------------------------------------------------------
// Identity helpers
// ---------------------------------------------------------------------------

const counters = new Map<string, number>();

/** Stable, readable ids — much easier to debug than cuids in a demo dataset. */
export function nid(prefix: string): string {
  const next = (counters.get(prefix) ?? 0) + 1;
  counters.set(prefix, next);
  return `${prefix}_${String(next).padStart(5, "0")}`;
}

export function resetIds(): void {
  counters.clear();
}

const usedEmails = new Set<string>();

export function slugifyName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "");
}

/** Guarantees a unique email even when two demo students share a name. */
export function uniqueEmail(local: string, domain: string): string {
  const base = `${slugifyName(local)}@${domain}`;
  if (!usedEmails.has(base)) {
    usedEmails.add(base);
    return base;
  }
  let n = 2;
  while (usedEmails.has(`${slugifyName(local)}${n}@${domain}`)) n += 1;
  const email = `${slugifyName(local)}${n}@${domain}`;
  usedEmails.add(email);
  return email;
}

export function reserveEmail(email: string): string {
  usedEmails.add(email.toLowerCase());
  return email.toLowerCase();
}

export function resetEmails(): void {
  usedEmails.clear();
}

// ---------------------------------------------------------------------------
// Bulk insert
// ---------------------------------------------------------------------------

export async function bulk<T>(
  label: string,
  rows: T[],
  insert: (chunk: T[]) => Promise<unknown>,
  size = 600,
): Promise<void> {
  for (let i = 0; i < rows.length; i += size) {
    await insert(rows.slice(i, i + size));
  }
  console.log(`   ${label.padEnd(30, ".")} ${rows.length}`);
}

export function section(title: string): void {
  console.log(`\n▸ ${title}`);
}
