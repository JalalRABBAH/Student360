import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = new URL("../src", import.meta.url).pathname;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (extname(full) === ".tsx" || extname(full) === ".ts") out.push(full);
  }
  return out;
}

const translations = readFileSync(new URL("../src/i18n/translations.ts", import.meta.url), "utf8");
const defined = new Set();
for (const m of translations.matchAll(/^\s*"([^"]+)":\s*\{\s*fr:/gm)) defined.add(m[1]);
for (const m of translations.matchAll(/phrases\["([^"]+)"\]\s*=/g)) defined.add(m[1]);

const used = new Map();
for (const file of walk(ROOT)) {
  if (file.includes("/i18n/")) continue;
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(/\bt\(["'`]([^"'`]+)["'`]\)/g)) {
    const key = m[1];
    if (!used.has(key)) used.set(key, []);
    used.get(key).push(file.replace(ROOT, ""));
  }
}

const missing = [...used.entries()].filter(([key]) => !defined.has(key)).sort((a, b) => a[0].localeCompare(b[0]));
console.log(`Defined keys: ${defined.size}; t() literal keys used: ${used.size}; MISSING: ${missing.length}`);
for (const [key, files] of missing) {
  console.log(`${key}  [${files[0]}]`);
}
