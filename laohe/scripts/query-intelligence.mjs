import fs from "node:fs/promises";
import path from "node:path";

function usage() {
  return `Usage:
  node query-intelligence.mjs <projectRoot> summary
  node query-intelligence.mjs <projectRoot> endpoints [filter]
  node query-intelligence.mjs <projectRoot> models [filter]
  node query-intelligence.mjs <projectRoot> deps [filter]
  node query-intelligence.mjs <projectRoot> files <filter>
  node query-intelligence.mjs <projectRoot> module <path-or-filter>

Prints small capped slices of .pm/intelligence.json so agents do not dump the full cache into context.`;
}

function includes(value, filter) {
  if (!filter) return true;
  return String(value ?? "").toLowerCase().includes(filter.toLowerCase());
}

function limit(items, max = 30) {
  return items.slice(0, max);
}

async function readIntel(projectRoot) {
  const file = path.join(projectRoot, ".pm", "intelligence.json");
  return JSON.parse(await fs.readFile(file, "utf-8"));
}

function printJson(value) {
  console.log(JSON.stringify(value, null, 2));
}

async function main() {
  const [projectRootArg, mode = "summary", ...rest] = process.argv.slice(2);
  if (!projectRootArg || mode === "help" || mode === "--help") {
    console.log(usage());
    return;
  }

  const projectRoot = path.resolve(projectRootArg);
  const filter = rest.join(" ").trim();
  const intel = await readIntel(projectRoot);

  if (mode === "summary") {
    printJson({
      scanDate: intel.scanDate,
      projectRoot: intel.projectRoot,
      summary: intel.summary,
      techStack: intel.techStack,
      externalDeps: limit(intel.externalDeps ?? [], 60),
    });
    return;
  }

  if (mode === "endpoints") {
    printJson(limit((intel.apiEndpoints ?? []).filter(ep =>
      includes(ep.path, filter) || includes(ep.method, filter) || includes(ep.file, filter)
    ), 80));
    return;
  }

  if (mode === "models") {
    printJson(limit((intel.dataModels ?? []).filter(model => includes(model, filter)), 80));
    return;
  }

  if (mode === "deps") {
    const modules = intel.modules ?? [];
    printJson({
      externalDeps: limit((intel.externalDeps ?? []).filter(dep => includes(dep, filter)), 80),
      matchingModules: limit(modules.filter(m => (m.imports ?? []).some(dep => includes(dep, filter))).map(m => ({
        path: m.path,
        imports: (m.imports ?? []).filter(dep => includes(dep, filter)),
      })), 80),
    });
    return;
  }

  if (mode === "files") {
    if (!filter) throw new Error("files mode requires a filter");
    printJson(limit((intel.modules ?? []).filter(m =>
      includes(m.path, filter) ||
      includes(m.lang, filter) ||
      includes(m.description, filter) ||
      (m.exports ?? []).some(x => includes(x, filter)) ||
      (m.models ?? []).some(x => includes(x, filter))
    ).map(m => ({
      path: m.path,
      lang: m.lang,
      description: m.description,
      exports: m.exports,
      models: m.models,
      lineCount: m.lineCount,
    })), 30));
    return;
  }

  if (mode === "module") {
    if (!filter) throw new Error("module mode requires a path or filter");
    printJson(limit((intel.modules ?? []).filter(m =>
      includes(m.path, filter) ||
      includes(m.description, filter) ||
      (m.exports ?? []).some(x => includes(x, filter)) ||
      (m.models ?? []).some(x => includes(x, filter))
    ), 10));
    return;
  }

  throw new Error(`Unknown mode: ${mode}\n${usage()}`);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
