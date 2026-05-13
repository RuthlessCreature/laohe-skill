import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, "..");

const SOURCES = {
  profanity: path.join(skillRoot, "references", "profanity-keywords.md"),
  diaohua: path.join(skillRoot, "references", "diaohua-list.md"),
};

function usage() {
  return `Usage:
  node sample-voice.mjs [profanity|diaohua|mixed] [count] [seed]

Returns a small deterministic phrase sample so Laohe keeps high-quality sewer voice without loading full vocab files.`;
}

function hash(input) {
  let h = 2166136261;
  for (const ch of input) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededRandom(seed) {
  let x = seed || 1;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x >>> 0) / 4294967296);
  };
}

async function loadPhrases(file) {
  const raw = await fs.readFile(file, "utf-8");
  return raw
    .split(/\r?\n/)
    .map(line => line.match(/^\s*\d+\.\s*(.+?)\s*$/)?.[1])
    .filter(Boolean);
}

async function main() {
  const mode = process.argv[2] || "mixed";
  if (mode === "help" || mode === "--help") {
    console.log(usage());
    return;
  }

  const count = Math.max(1, Math.min(Number.parseInt(process.argv[3] || "12", 10), 60));
  const seedText = process.argv[4] || `${mode}:${new Date().toISOString().slice(0, 10)}`;
  const rand = seededRandom(hash(seedText));

  const entries = [];
  if (mode === "profanity" || mode === "mixed") {
    const phrases = await loadPhrases(SOURCES.profanity);
    entries.push(...phrases.map(phrase => ({ type: "profanity", phrase })));
  }
  if (mode === "diaohua" || mode === "mixed") {
    const phrases = await loadPhrases(SOURCES.diaohua);
    entries.push(...phrases.map(phrase => ({ type: "diaohua", phrase })));
  }
  if (entries.length === 0) {
    throw new Error(`Unknown mode: ${mode}\n${usage()}`);
  }

  const pool = [...entries];
  const sample = [];
  while (pool.length > 0 && sample.length < count) {
    const index = Math.floor(rand() * pool.length);
    sample.push(pool.splice(index, 1)[0]);
  }

  console.log(JSON.stringify({
    mode,
    count: sample.length,
    seed: seedText,
    phrases: sample,
  }, null, 2));
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
