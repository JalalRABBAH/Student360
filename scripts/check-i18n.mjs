import { readFileSync } from "node:fs";
const config = readFileSync(new URL("../src/i18n/config.ts", import.meta.url), "utf8");
const translations = readFileSync(new URL("../src/i18n/translations.ts", import.meta.url), "utf8");

for (const locale of ["en", "fr", "ar"]) {
  if (!config.includes(`"${locale}"`)) throw new Error(`Missing locale: ${locale}`);
}

const entries = [...translations.matchAll(/^\s*"([^"]+)":\s*\{\s*fr:\s*"([^"]*)",\s*ar:\s*"([^"]*)"\s*\}/gm)];
const duplicateKeys = entries.map((entry) => entry[1]).filter((key, index, keys) => keys.indexOf(key) !== index);
if (duplicateKeys.length) throw new Error(`Duplicate translation keys: ${duplicateKeys.join(", ")}`);

for (const [, key, fr, ar] of entries) {
  if (!fr.trim() || !ar.trim()) throw new Error(`Incomplete translation: ${key}`);
}

console.log(`i18n check passed: ${entries.length} complete FR/AR translation pairs.`);