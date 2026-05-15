import fs from "node:fs/promises";
import path from "node:path";

const VERSION = 2;
const DEFAULT_MAX_FILE_BYTES = 512 * 1024;
const DEFAULT_CONCURRENCY = 12;
const MAX_MODULE_EXPORTS = 20;
const MAX_MODULE_IMPORTS = 40;
const MAX_MODULE_ENDPOINTS = 40;
const MAX_MODULE_MODELS = 30;

const SKIP_DIRS = new Set([
  ".git", ".hg", ".svn", ".pm", ".opencode", ".codex", ".idea", ".vscode",
  "node_modules", "bower_components", "vendor", "third_party",
  "dist", "build", "out", "coverage", ".nyc_output", ".istanbul",
  ".next", ".nuxt", ".output", ".svelte-kit", ".angular", ".expo",
  ".cache", ".parcel-cache", ".turbo", ".tmp", "tmp", "temp",
  "__pycache__", ".pytest_cache", "venv", ".venv", "env",
  "target", "bin", "obj", "Pods", "$RECYCLE.BIN",
]);

const GENERATED_DIRS = new Set([
  "generated", "gen", "__generated__", "snapshots",
]);

const SKIP_FILE_NAMES = new Set([
  ".DS_Store", "Thumbs.db", "desktop.ini",
  "package-lock.json", "npm-shrinkwrap.json", "yarn.lock", "pnpm-lock.yaml",
  "poetry.lock", "Pipfile.lock", "composer.lock", "Gemfile.lock",
]);

const MANIFEST_FILES = new Set([
  "package.json", "pyproject.toml", "requirements.txt", "go.mod", "Cargo.toml",
  "pom.xml", "build.gradle", "settings.gradle", "Dockerfile", "docker-compose.yml",
  "docker-compose.yaml", "Makefile", "justfile", "tsconfig.json", "vite.config.ts",
  "next.config.js", "next.config.mjs", "nuxt.config.ts",
]);

const CODE_EXT_LANG = {
  ".js": "javascript", ".mjs": "javascript", ".cjs": "javascript", ".jsx": "javascript",
  ".ts": "typescript", ".tsx": "typescript",
  ".py": "python", ".go": "go", ".java": "java", ".cs": "csharp",
  ".rb": "ruby", ".php": "php", ".rs": "rust", ".cpp": "cpp", ".cc": "cpp",
  ".cxx": "cpp", ".c": "c", ".h": "c", ".hpp": "cpp", ".swift": "swift",
  ".kt": "kotlin", ".scala": "scala", ".vue": "vue", ".svelte": "svelte",
};

const COMMENT_PATTERNS = {
  javascript: /^\s*\/\/.*$|\/\*[\s\S]*?\*\//gm,
  typescript: /^\s*\/\/.*$|\/\*[\s\S]*?\*\//gm,
  vue: /^\s*\/\/.*$|\/\*[\s\S]*?\*\//gm,
  svelte: /^\s*\/\/.*$|\/\*[\s\S]*?\*\//gm,
  python: /#.*$/gm,
  go: /^\s*\/\/.*$|\/\*[\s\S]*?\*\//gm,
  java: /^\s*\/\/.*$|\/\*[\s\S]*?\*\//gm,
  csharp: /^\s*\/\/.*$|\/\*[\s\S]*?\*\//gm,
  ruby: /#.*$/gm,
  php: /^\s*\/\/.*$|^\s*#.*$|\/\*[\s\S]*?\*\//gm,
  rust: /^\s*\/\/.*$|\/\*[\s\S]*?\*\//gm,
};

const FUNCTION_PATTERNS = {
  javascript: [
    /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/g,
    /(?:export\s+)?class\s+(\w+)\b/g,
    /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[\w{},\s]+)\s*=>/g,
    /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?function\b/g,
  ],
  typescript: [
    /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/g,
    /(?:export\s+)?class\s+(\w+)\b/g,
    /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[\w{},\s]+)\s*=>/g,
    /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?function\b/g,
  ],
  vue: [],
  svelte: [],
  python: [/^(?:async\s+def|def|class)\s+(\w+)\b/gm],
  go: [/(?:func\s+(?:\([^)]+\)\s+)?(\w+)\s*\(|type\s+(\w+)\s+struct)/g],
  java: [/(?:(?:public|private|protected)\s+(?:static\s+)?(?:final\s+)?[\w<>[\],\s]+\s+(\w+)\s*\(|class\s+(\w+))/g],
  csharp: [/(?:(?:public|private|protected|internal)\s+(?:static\s+)?(?:async\s+)?[\w<>[\],\s]+\s+(\w+)\s*\(|class\s+(\w+))/g],
  rust: [/(?:pub\s+)?fn\s+(\w+)\s*\(|(?:pub\s+)?struct\s+(\w+)\b/g],
};

const IMPORT_PATTERNS = {
  javascript: /(?:import\s+(?:type\s+)?(?:[\w*{},\s]+\s+from\s+)?["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)|require\s*\(\s*["']([^"']+)["']\s*\))/g,
  typescript: /(?:import\s+(?:type\s+)?(?:[\w*{},\s]+\s+from\s+)?["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)|require\s*\(\s*["']([^"']+)["']\s*\))/g,
  vue: /(?:import\s+(?:type\s+)?(?:[\w*{},\s]+\s+from\s+)?["']([^"']+)["']|require\s*\(\s*["']([^"']+)["']\s*\))/g,
  svelte: /(?:import\s+(?:type\s+)?(?:[\w*{},\s]+\s+from\s+)?["']([^"']+)["']|require\s*\(\s*["']([^"']+)["']\s*\))/g,
  python: /(?:^import\s+([\w.]+)|^from\s+([\w.]+)\s+import)/gm,
  go: /import\s+(?:\(\s*)?(?:[\w.]+\s+)?"([^"]+)"/g,
  java: /import\s+([\w.]+);/g,
  csharp: /using\s+([\w.]+);/g,
  rust: /use\s+([\w:]+)(?:\s*::|;)/g,
};

function parseArgs(argv) {
  const args = { projectRoot: process.cwd(), maxFileBytes: DEFAULT_MAX_FILE_BYTES, concurrency: DEFAULT_CONCURRENCY, includeTests: false };
  for (const arg of argv) {
    if (arg === "--include-tests") args.includeTests = true;
    else if (arg.startsWith("--max-size=")) args.maxFileBytes = parseByteSize(arg.slice("--max-size=".length));
    else if (arg.startsWith("--concurrency=")) args.concurrency = Math.max(1, Number.parseInt(arg.slice("--concurrency=".length), 10) || DEFAULT_CONCURRENCY);
    else if (!arg.startsWith("--")) args.projectRoot = arg;
  }
  return args;
}

function parseByteSize(value) {
  const match = String(value).trim().match(/^(\d+(?:\.\d+)?)(kb|mb|b)?$/i);
  if (!match) return DEFAULT_MAX_FILE_BYTES;
  const size = Number.parseFloat(match[1]);
  const unit = (match[2] || "b").toLowerCase();
  if (unit === "mb") return Math.floor(size * 1024 * 1024);
  if (unit === "kb") return Math.floor(size * 1024);
  return Math.floor(size);
}

function slash(file) {
  return file.split(path.sep).join("/");
}

function isTestPath(relPath) {
  return /(^|\/)(test|tests|__tests__|spec|specs)(\/|$)/i.test(relPath) || /\.(test|spec)\.[cm]?[jt]sx?$/i.test(relPath);
}

function isSkippedDir(name, relPath, includeTests) {
  if (SKIP_DIRS.has(name)) return true;
  if (GENERATED_DIRS.has(name.toLowerCase())) return true;
  if (name.startsWith(".") && name !== ".github") return true;
  if (!includeTests && isTestPath(relPath)) return true;
  return false;
}

function isGeneratedFile(name, relPath) {
  const lower = name.toLowerCase();
  return lower.endsWith(".min.js") || lower.endsWith(".map") || lower.endsWith(".snap") ||
    lower.endsWith(".d.ts") || lower.includes("generated") || lower.includes(".gen.") ||
    /(^|\/)(generated|__generated__|gen)\//i.test(relPath);
}

function getLanguage(filename) {
  return CODE_EXT_LANG[path.extname(filename).toLowerCase()] || "unknown";
}

function isCodeFile(filename) {
  return Boolean(CODE_EXT_LANG[path.extname(filename).toLowerCase()]);
}

function isManifestFile(filename) {
  return MANIFEST_FILES.has(path.basename(filename));
}

function extractNamedMatches(content, patterns) {
  const values = [];
  for (const pattern of patterns || []) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const name = match.slice(1).find(Boolean);
      if (name && !name.startsWith("_")) values.push(name);
    }
  }
  return [...new Set(values)];
}

function extractFunctions(content, lang) {
  const normalizedLang = lang === "vue" || lang === "svelte" ? "typescript" : lang;
  return extractNamedMatches(content, FUNCTION_PATTERNS[lang]?.length ? FUNCTION_PATTERNS[lang] : FUNCTION_PATTERNS[normalizedLang]);
}

function extractImports(content, lang) {
  const pattern = IMPORT_PATTERNS[lang] || IMPORT_PATTERNS[lang === "vue" || lang === "svelte" ? "typescript" : ""];
  if (!pattern) return [];
  const imports = new Set();
  pattern.lastIndex = 0;
  let match;
  while ((match = pattern.exec(content)) !== null) {
    const specifier = match.slice(1).find(Boolean);
    if (specifier) imports.add(specifier);
  }
  return [...imports];
}

function extractDescription(content, lang) {
  const commentPattern = COMMENT_PATTERNS[lang] || COMMENT_PATTERNS[lang === "vue" || lang === "svelte" ? "typescript" : ""];
  if (!commentPattern) return "";
  const comments = content.match(commentPattern) || [];
  const meaningful = comments
    .map(cleanComment)
    .filter(c => c.length > 12 && c.length < 240)
    .filter(c => !/copyright|license|eslint|prettier|generated/i.test(c))
    .slice(0, 2);
  return meaningful.join(" ").replace(/\s+/g, " ").trim();
}

function cleanComment(comment) {
  return comment
    .replace(/^\/\*\*?/, "")
    .replace(/\*\/$/, "")
    .replace(/^\s*\/\//gm, "")
    .replace(/^\s*#/gm, "")
    .replace(/^\s*\*/gm, "")
    .trim();
}

function extractApiEndpoints(content, lang) {
  const routes = [];
  if (["javascript", "typescript", "vue", "svelte"].includes(lang)) {
    const patterns = [
      /\b(app|router|server)\s*\.\s*(get|post|put|patch|delete|head|options)\s*\(\s*["']([^"']+)["']/gi,
      /@(Get|Post|Put|Patch|Delete|Head|Options)\s*\(\s*["']([^"']+)["']/g,
    ];
    for (const pattern of patterns) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(content)) !== null) {
        routes.push({ method: (match[2] || match[1]).toUpperCase(), path: match[3] || match[2] });
      }
    }
  }
  if (lang === "python") {
    const pattern = /@(app|router|blueprint)\.route\s*\(\s*["']([^"']+)["'](?:[^)]*methods\s*=\s*\[([^\]]+)\])?/g;
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const methods = match[3]?.match(/["']([A-Z]+)["']/g)?.map(m => m.replace(/["']/g, "")) || ["GET"];
      for (const method of methods) routes.push({ method, path: match[2] });
    }
  }
  return routes;
}

function extractDataModels(content, lang) {
  const models = [];
  if (["typescript", "javascript", "vue", "svelte"].includes(lang)) {
    for (const match of content.matchAll(/(?:interface|type)\s+(\w+)(?:\s*=\s*[^=]+)?\s*[{=]/g)) models.push(match[1]);
    for (const match of content.matchAll(/class\s+(\w+)\b/g)) models.push(match[1]);
  }
  if (lang === "python") {
    for (const match of content.matchAll(/^class\s+(\w+)\b/gm)) models.push(match[1]);
  }
  if (lang === "go") {
    for (const match of content.matchAll(/type\s+(\w+)\s+struct\b/g)) models.push(match[1]);
  }
  if (lang === "rust") {
    for (const match of content.matchAll(/(?:pub\s+)?struct\s+(\w+)\b/g)) models.push(match[1]);
  }
  return [...new Set(models)];
}

async function scanDir(dir, baseDir, options) {
  const files = [];
  const skipped = { dirs: 0, files: 0, largeFiles: 0, generatedFiles: 0 };

  async function walk(current) {
    let entries;
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      const relPath = slash(path.relative(baseDir, fullPath));
      if (entry.isDirectory()) {
        if (isSkippedDir(entry.name, relPath, options.includeTests)) {
          skipped.dirs += 1;
          continue;
        }
        await walk(fullPath);
        continue;
      }
      if (!entry.isFile()) continue;
      if (SKIP_FILE_NAMES.has(entry.name) || isGeneratedFile(entry.name, relPath)) {
        skipped.generatedFiles += 1;
        continue;
      }
      if (!options.includeTests && isTestPath(relPath)) {
        skipped.files += 1;
        continue;
      }
      if (!isCodeFile(entry.name) && !isManifestFile(entry.name)) continue;
      let stat;
      try {
        stat = await fs.stat(fullPath);
      } catch {
        skipped.files += 1;
        continue;
      }
      if (stat.size > options.maxFileBytes && !isManifestFile(entry.name)) {
        skipped.largeFiles += 1;
        continue;
      }
      files.push({ fullPath, relPath, size: stat.size, mtimeMs: Math.trunc(stat.mtimeMs), isCode: isCodeFile(entry.name), isManifest: isManifestFile(entry.name) });
    }
  }

  await walk(baseDir);
  return { files, skipped };
}

async function mapLimit(items, concurrency, worker) {
  const results = new Array(items.length);
  let index = 0;
  async function run() {
    while (index < items.length) {
      const current = index++;
      results[current] = await worker(items[current], current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run));
  return results;
}

async function parseModule(file) {
  if (!file.isCode) return null;
  let content;
  try {
    content = await fs.readFile(file.fullPath, "utf-8");
  } catch {
    return null;
  }
  const lang = getLanguage(file.relPath);
  const exports = extractFunctions(content, lang).slice(0, MAX_MODULE_EXPORTS);
  const imports = extractImports(content, lang).slice(0, MAX_MODULE_IMPORTS);
  const endpoints = extractApiEndpoints(content, lang).slice(0, MAX_MODULE_ENDPOINTS);
  const models = extractDataModels(content, lang).slice(0, MAX_MODULE_MODELS);
  const description = extractDescription(content, lang) || generateDescription(file.relPath, exports);
  const lineCount = countLines(content);

  if (!description && exports.length === 0 && imports.length === 0 && endpoints.length === 0 && models.length === 0) return null;

  return {
    path: file.relPath,
    lang,
    description,
    exports,
    imports,
    endpoints,
    models,
    dependsOn: [],
    usedBy: [],
    lineCount,
    sizeBytes: file.size,
    mtimeMs: file.mtimeMs,
  };
}

function countLines(content) {
  if (content.length === 0) return 0;
  let count = 1;
  for (let index = 0; index < content.length; index += 1) {
    if (content.charCodeAt(index) === 10) count += 1;
  }
  return count;
}

function generateDescription(file, exports) {
  const name = path.basename(file, path.extname(file));
  const parts = name.replace(/[-_]/g, " ").split(" ").filter(Boolean);
  if (parts.length === 0) return "";
  return `模块：${parts.join(" ")}${exports.length > 0 ? `，主要导出：${exports.slice(0, 4).join("、")}` : ""}`;
}

function detectTechStack(files) {
  const stack = new Set();
  for (const file of files) {
    const f = file.relPath;
    if (f.endsWith(".ts") || f.endsWith(".tsx")) stack.add("typescript");
    if (f.endsWith(".js") || f.endsWith(".jsx") || f.endsWith(".mjs") || f.endsWith(".cjs")) stack.add("javascript");
    if (f.endsWith(".py") || f.endsWith("requirements.txt") || f.endsWith("pyproject.toml")) stack.add("python");
    if (f.endsWith(".go") || f.endsWith("go.mod")) stack.add("go");
    if (f.endsWith(".java") || f.endsWith("pom.xml") || f.endsWith("build.gradle")) stack.add("java");
    if (f.endsWith(".cs")) stack.add("csharp");
    if (f.endsWith(".rs") || f.endsWith("Cargo.toml")) stack.add("rust");
    if (f.endsWith("package.json")) stack.add("node");
    if (f.includes("Dockerfile") || f.includes("docker-compose")) stack.add("docker");
    if (f.endsWith("Makefile") || f.endsWith("justfile")) stack.add("task-runner");
  }
  return [...stack].sort();
}

function resolveInternalImports(modules) {
  const fileSet = new Set(modules.map(m => m.path));
  const candidates = ["", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".go", "/index.ts", "/index.tsx", "/index.js", "/index.jsx"];
  const usedBy = new Map(modules.map(m => [m.path, new Set()]));

  for (const module of modules) {
    const deps = new Set();
    for (const specifier of module.imports) {
      if (!specifier.startsWith(".") && !specifier.startsWith("/")) continue;
      const base = slash(path.posix.normalize(path.posix.join(path.posix.dirname(module.path), specifier)));
      const resolved = candidates.map(ext => `${base}${ext}`).find(candidate => fileSet.has(candidate));
      if (resolved) {
        deps.add(resolved);
        usedBy.get(resolved)?.add(module.path);
      }
    }
    module.dependsOn = [...deps].sort();
  }

  for (const module of modules) {
    module.usedBy = [...(usedBy.get(module.path) || [])].sort();
  }
}

function collectExternalDeps(modules) {
  const deps = new Set();
  for (const module of modules) {
    for (const specifier of module.imports) {
      if (specifier.startsWith(".") || specifier.startsWith("/")) continue;
      deps.add(packageName(specifier));
    }
  }
  return [...deps].sort();
}

function packageName(specifier) {
  if (specifier.startsWith("node:")) return specifier;
  const parts = specifier.split("/");
  if (specifier.startsWith("@") && parts.length >= 2) return `${parts[0]}/${parts[1]}`;
  return parts[0];
}

function collectEndpoints(modules) {
  return modules.flatMap(module => module.endpoints.map(endpoint => ({ ...endpoint, file: module.path })));
}

function collectDataModels(modules) {
  const models = new Map();
  for (const module of modules) {
    for (const model of module.models) {
      if (!models.has(model)) models.set(model, []);
      models.get(model).push(module.path);
    }
  }
  return [...models.entries()].map(([name, files]) => ({ name, files: [...new Set(files)].sort() })).sort((a, b) => a.name.localeCompare(b.name));
}

async function writeNdjson(file, items) {
  await fs.writeFile(file, items.map(item => JSON.stringify(item)).join("\n") + (items.length ? "\n" : ""), "utf-8");
}

async function buildIntelligence(projectRoot, options) {
  const root = path.resolve(projectRoot);
  const outputDir = path.join(root, ".pm");
  const shardDir = path.join(outputDir, "intelligence");
  await fs.mkdir(shardDir, { recursive: true });

  const scanDate = new Date().toISOString();
  const { files, skipped } = await scanDir(root, root, options);
  const modules = (await mapLimit(files, options.concurrency, parseModule)).filter(Boolean);
  modules.sort((a, b) => a.path.localeCompare(b.path));
  resolveInternalImports(modules);

  const endpoints = collectEndpoints(modules);
  const dataModels = collectDataModels(modules);
  const externalDeps = collectExternalDeps(modules);
  const manifests = files.filter(file => file.isManifest).map(file => file.relPath).sort();

  const modulesFile = path.join(shardDir, "modules.ndjson");
  const endpointsFile = path.join(shardDir, "endpoints.ndjson");
  const modelsFile = path.join(shardDir, "models.json");
  const depsFile = path.join(shardDir, "external-deps.json");

  await writeNdjson(modulesFile, modules);
  await writeNdjson(endpointsFile, endpoints);
  await fs.writeFile(modelsFile, JSON.stringify(dataModels, null, 2), "utf-8");
  await fs.writeFile(depsFile, JSON.stringify(externalDeps, null, 2), "utf-8");

  const index = {
    version: VERSION,
    scanDate,
    projectRoot: root,
    options: {
      maxFileBytes: options.maxFileBytes,
      concurrency: options.concurrency,
      includeTests: options.includeTests,
    },
    summary: {
      totalFilesSeen: files.length,
      totalModules: modules.length,
      totalEndpoints: endpoints.length,
      totalModels: dataModels.length,
      totalExternalDeps: externalDeps.length,
      skipped,
    },
    techStack: detectTechStack(files),
    manifests,
    files: {
      modules: ".pm/intelligence/modules.ndjson",
      endpoints: ".pm/intelligence/endpoints.ndjson",
      models: ".pm/intelligence/models.json",
      externalDeps: ".pm/intelligence/external-deps.json",
    },
  };

  await fs.writeFile(path.join(outputDir, "intelligence.json"), JSON.stringify(index, null, 2), "utf-8");
  return index;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const intel = await buildIntelligence(options.projectRoot, options);
  console.log(`Project intelligence cached: ${path.join(intel.projectRoot, ".pm", "intelligence.json")}`);
  console.log(`  Version: ${intel.version}`);
  console.log(`  Files seen: ${intel.summary.totalFilesSeen}`);
  console.log(`  Modules documented: ${intel.summary.totalModules}`);
  console.log(`  API endpoints: ${intel.summary.totalEndpoints}`);
  console.log(`  Data models: ${intel.summary.totalModels}`);
  console.log(`  External deps: ${intel.summary.totalExternalDeps}`);
  console.log(`  Skipped: ${JSON.stringify(intel.summary.skipped)}`);
  console.log(`  Tech stack: ${intel.techStack.join(", ")}`);
}

main().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
