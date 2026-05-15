import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import readline from "node:readline";

function usage() {
  return `Usage:
  node query-intelligence.mjs <projectRoot> summary
  node query-intelligence.mjs <projectRoot> endpoints [filter]
  node query-intelligence.mjs <projectRoot> models [filter]
  node query-intelligence.mjs <projectRoot> deps [filter]
  node query-intelligence.mjs <projectRoot> files <filter>
  node query-intelligence.mjs <projectRoot> module <path-or-filter>

Reads tiny slices of .pm/intelligence.json and its shards. Version 2 caches are streamed from NDJSON so agents do not dump the full cache into context.`;
}

function includes(value, filter) {
  if (!filter) return true;
  return String(value ?? "").toLowerCase().includes(filter.toLowerCase());
}

function limit(items, max = 30) {
  return items.slice(0, max);
}

async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(file, "utf-8"));
  } catch {
    return fallback;
  }
}

async function readIndex(projectRoot) {
  const file = path.join(projectRoot, ".pm", "intelligence.json");
  const index = await readJson(file);
  if (!index) throw new Error(`Missing intelligence cache: ${file}`);
  return index;
}

function cachePath(projectRoot, index, key) {
  const rel = index.files?.[key];
  if (!rel) return null;
  return path.join(projectRoot, rel);
}

async function streamNdjson(file, predicate, map, max = 30) {
  const output = [];
  const input = createReadStream(file, { encoding: "utf-8" });
  const lines = readline.createInterface({ input, crlfDelay: Infinity });

  try {
    for await (const line of lines) {
      if (!line.trim()) continue;
      let item;
      try {
        item = JSON.parse(line);
      } catch {
        continue;
      }
      if (!predicate(item)) continue;
      output.push(map(item));
      if (output.length >= max) {
        lines.close();
        input.destroy();
        break;
      }
    }
  } catch {
    return output;
  }

  return output;
}

function printJson(value) {
  console.log(JSON.stringify(value, null, 2));
}

function moduleMatches(module, filter) {
  return includes(module.path, filter) ||
    includes(module.lang, filter) ||
    includes(module.description, filter) ||
    (module.exports ?? []).some(value => includes(value, filter)) ||
    (module.models ?? []).some(value => includes(value, filter)) ||
    (module.imports ?? []).some(value => includes(value, filter)) ||
    (module.dependsOn ?? []).some(value => includes(value, filter)) ||
    (module.usedBy ?? []).some(value => includes(value, filter));
}

function compactModule(module) {
  return {
    path: module.path,
    lang: module.lang,
    description: module.description,
    exports: module.exports,
    models: module.models,
    dependsOn: module.dependsOn,
    usedBy: module.usedBy,
    lineCount: module.lineCount,
    sizeBytes: module.sizeBytes,
  };
}

async function queryV2(projectRoot, mode, filter, index) {
  if (mode === "summary") {
    const deps = await readJson(cachePath(projectRoot, index, "externalDeps"), []);
    printJson({
      version: index.version,
      scanDate: index.scanDate,
      projectRoot: index.projectRoot,
      summary: index.summary,
      techStack: index.techStack,
      manifests: limit(index.manifests ?? [], 80),
      externalDeps: limit(deps, 80),
    });
    return;
  }

  if (mode === "endpoints") {
    const file = cachePath(projectRoot, index, "endpoints");
    printJson(await streamNdjson(file, ep => includes(ep.path, filter) || includes(ep.method, filter) || includes(ep.file, filter), ep => ep, 80));
    return;
  }

  if (mode === "models") {
    const models = await readJson(cachePath(projectRoot, index, "models"), []);
    printJson(limit(models.filter(model => includes(model.name ?? model, filter) || (model.files ?? []).some(file => includes(file, filter))), 80));
    return;
  }

  if (mode === "deps") {
    const deps = await readJson(cachePath(projectRoot, index, "externalDeps"), []);
    const file = cachePath(projectRoot, index, "modules");
    const matchingModules = await streamNdjson(file, module =>
      (module.imports ?? []).some(dep => includes(dep, filter)) ||
      (module.dependsOn ?? []).some(dep => includes(dep, filter)) ||
      (module.usedBy ?? []).some(dep => includes(dep, filter)),
      module => ({
        path: module.path,
        imports: (module.imports ?? []).filter(dep => includes(dep, filter)),
        dependsOn: (module.dependsOn ?? []).filter(dep => includes(dep, filter)),
        usedBy: (module.usedBy ?? []).filter(dep => includes(dep, filter)),
      }),
      80,
    );
    printJson({
      externalDeps: limit(deps.filter(dep => includes(dep, filter)), 80),
      matchingModules,
    });
    return;
  }

  if (mode === "files") {
    if (!filter) throw new Error("files mode requires a filter");
    const file = cachePath(projectRoot, index, "modules");
    printJson(await streamNdjson(file, module => moduleMatches(module, filter), compactModule, 40));
    return;
  }

  if (mode === "module") {
    if (!filter) throw new Error("module mode requires a path or filter");
    const file = cachePath(projectRoot, index, "modules");
    printJson(await streamNdjson(file, module => moduleMatches(module, filter), module => module, 10));
    return;
  }

  throw new Error(`Unknown mode: ${mode}\n${usage()}`);
}

function legacyIndex(index) {
  return {
    scanDate: index.scanDate,
    projectRoot: index.projectRoot,
    summary: index.summary,
    techStack: index.techStack,
    externalDeps: limit(index.externalDeps ?? [], 60),
  };
}

async function queryLegacy(mode, filter, index) {
  if (mode === "summary") return printJson(legacyIndex(index));
  if (mode === "endpoints") return printJson(limit((index.apiEndpoints ?? []).filter(ep => includes(ep.path, filter) || includes(ep.method, filter) || includes(ep.file, filter)), 80));
  if (mode === "models") return printJson(limit((index.dataModels ?? []).filter(model => includes(model.name ?? model, filter)), 80));
  if (mode === "deps") {
    const modules = index.modules ?? [];
    return printJson({
      externalDeps: limit((index.externalDeps ?? []).filter(dep => includes(dep, filter)), 80),
      matchingModules: limit(modules.filter(module => (module.imports ?? []).some(dep => includes(dep, filter))).map(module => ({
        path: module.path,
        imports: (module.imports ?? []).filter(dep => includes(dep, filter)),
      })), 80),
    });
  }
  if (mode === "files") {
    if (!filter) throw new Error("files mode requires a filter");
    return printJson(limit((index.modules ?? []).filter(module => moduleMatches(module, filter)).map(compactModule), 40));
  }
  if (mode === "module") {
    if (!filter) throw new Error("module mode requires a path or filter");
    return printJson(limit((index.modules ?? []).filter(module => moduleMatches(module, filter)), 10));
  }
  throw new Error(`Unknown mode: ${mode}\n${usage()}`);
}

async function main() {
  const [projectRootArg, mode = "summary", ...rest] = process.argv.slice(2);
  if (!projectRootArg || mode === "help" || mode === "--help") {
    console.log(usage());
    return;
  }

  const projectRoot = path.resolve(projectRootArg);
  const filter = rest.join(" ").trim();
  const index = await readIndex(projectRoot);

  if (Number(index.version) >= 2) await queryV2(projectRoot, mode, filter, index);
  else await queryLegacy(mode, filter, index);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
