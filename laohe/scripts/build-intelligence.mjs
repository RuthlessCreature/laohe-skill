import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SKIP_DIRS = new Set([
  "node_modules", ".git", ".svn", ".hg", "dist", "build", "out",
  "__pycache__", ".pytest_cache", "venv", ".venv", "env",
  ".next", ".nuxt", ".output", ".cache", ".tmp",
  "coverage", ".nyc_output", ".istanbul",
  ".DS_Store", ".AppleDouble", ".LSOverride",
  "Thumbs.db", "desktop.ini", "$RECYCLE.BIN",
]);

const SKIP_FILES = new Set([
  ".DS_Store", "Thumbs.db", "desktop.ini", ".gitignore",
  ".npmignore", ".eslintignore", ".prettierignore",
  "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
  "poetry.lock", " Pipfile.lock", "composer.lock",
]);

const EXT_LANG = {
  ".js": "javascript", ".mjs": "javascript", ".cjs": "javascript",
  ".jsx": "javascript", ".ts": "typescript", ".tsx": "typescript",
  ".py": "python", ".go": "go", ".java": "java",
  ".cs": "csharp", ".rb": "ruby", ".php": "php",
  ".rs": "rust", ".cpp": "cpp", ".c": "c",
  ".h": "c", ".hpp": "cpp", ".swift": "swift",
  ".kt": "kotlin", ".scala": "scala", ".vue": "vue",
  ".svelte": "svelte", ".css": "css", ".scss": "scss",
  ".html": "html", ".htm": "html", ".xml": "xml",
  ".yaml": "yaml", ".yml": "yaml", ".json": "json",
  ".md": "markdown", ".sql": "sql", ".sh": "shell",
};

const COMMENT_PATTERNS = {
  javascript: /\/\/.*$|\/\*[\s\S]*?\*\//gm,
  typescript: /\/\/.*$|\/\*[\s\S]*?\*\//gm,
  python: /#.*$/gm,
  go: /\/\/.*$|\/\*[\s\S]*?\*\//gm,
  java: /\/\/.*$|\/\*[\s\S]*?\*\//gm,
  csharp: /\/\/.*$|\/\*[\s\S]*?\*\//gm,
  ruby: /#.*$/gm,
  php: /\/\/.*$|#.*$|\/\*[\s\S]*?\*\//gm,
  rust: /\/\/.*$|\/\*[\s\S]*?\*\//gm,
};

const FUNCTION_PATTERNS = {
  javascript: /(?:export\s+)?(?:async\s+)?function\s+(\w+)|(?:export\s+)?(?:async\s+)?(?:const|let|var)\s+(\w+)\s*=/g,
  typescript: /(?:export\s+)?(?:async\s+)?function\s+(\w+)|(?:export\s+)?(?:async\s+)?(?:const|let|var)\s+(\w+)\s*=/g,
  python: /(?:^def\s+(\w+)|(?:^class\s+(\w+))|(?:^async\s+def\s+(\w+)))/gm,
  go: /(?:func\s+(?:\([^)]+\)\s+)?(\w+)|type\s+(\w+)\s+struct)/g,
  java: /(?:(?:public|private|protected)\s+(?:static\s+)?(?:final\s+)?(?:[\w<>[\],\s]+)\s+(\w+)\s*\(|class\s+(\w+))/g,
};

const IMPORT_PATTERNS = {
  javascript: /(?:import\s+(?:[\w*{},\s]+\s+from\s+)?['"]([^'"]+)['"]|require\s*\(['"]([^'"]+)['"]\))/g,
  typescript: /(?:import\s+(?:[\w*{},\s]+\s+from\s+)?['"]([^'"]+)['"]|require\s*\(['"]([^'"]+)['"]\))/g,
  python: /(?:^import\s+(\w+)|^from\s+(\w+)\s+import)/gm,
  go: /(?:import\s+"(?:[^"]+)"|:\s+"?(\w+)"?\s+\w+)/g,
  java: /(?:import\s+([\w.]+))/g,
};

function isSkippedDir(name, parent) {
  if (SKIP_DIRS.has(name)) return true;
  if (name.startsWith(".") && parent === ".") return true;
  if (name === "test" || name === "tests") return true;
  return false;
}

function getLanguage(filename) {
  const ext = path.extname(filename).toLowerCase();
  return EXT_LANG[ext] || "unknown";
}

function extractFunctions(content, lang) {
  const pattern = FUNCTION_PATTERNS[lang];
  if (!pattern) return [];
  const matches = [];
  let match;
  pattern.lastIndex = 0;
  while ((match = pattern.exec(content)) !== null) {
    const name = match[1] || match[2] || match[3];
    if (name && !name.startsWith("_")) {
      matches.push(name);
    }
  }
  return [...new Set(matches)];
}

function extractImports(content, lang) {
  const pattern = IMPORT_PATTERNS[lang];
  if (!pattern) return [];
  const imports = new Set();
  let match;
  pattern.lastIndex = 0;
  while ((match = pattern.exec(content)) !== null) {
    const imp = match[1] || match[2];
    if (imp && !imp.startsWith(".") && !imp.startsWith("@")) {
      imports.add(imp);
    }
  }
  return [...imports];
}

function extractDescription(content, lang) {
  const commentPattern = COMMENT_PATTERNS[lang];
  if (!commentPattern) return "";
  const comments = content.match(commentPattern) || [];
  const meaningful = comments
    .map(c => c.replace(/^\/\*\*?/, "").replace(/\*\/$/, "").trim())
    .filter(c => c.length > 10 && c.length < 200)
    .slice(0, 3);
  return meaningful.join(" ").replace(/\s+/g, " ").trim();
}

function extractApiEndpoints(content, lang) {
  const routes = [];
  if (lang === "javascript" || lang === "typescript") {
    const methodPatterns = [
      /\b(app|router)\s*\.\s*(get|post|put|patch|delete|head|options)\s*\(\s*['"]([^'"]+)['"]/gi,
      /(@Get|@Post|@Put|@Patch|@Delete|@Head|@Options)\s*\(\s*['"]([^'"]+)['"]/g,
    ];
    for (const p of methodPatterns) {
      let m;
      while ((m = p.exec(content)) !== null) {
        routes.push({
          method: (m[2] || m[1]).toUpperCase(),
          path: m[3],
        });
      }
    }
  }
  return routes;
}

function extractDataModels(content, lang) {
  const models = [];
  if (lang === "typescript" || lang === "javascript") {
    const interfaceMatch = content.matchAll(/(?:interface|type)\s+(\w+)(?:\s*=\s*[^=]+)?\s*{/g);
    for (const m of interfaceMatch) {
      models.push(m[1]);
    }
    const classMatch = content.matchAll(/class\s+(\w+)(?:\s+extends\s+\w+)?(?:\s+implements\s+[\w,\s]+)?/g);
    for (const m of classMatch) {
      models.push(m[1]);
    }
  }
  return [...new Set(models)];
}

async function scanDir(dir, baseDir) {
  const result = { files: [], dirs: [] };
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return result;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath);
    if (entry.isDirectory()) {
      if (!isSkippedDir(entry.name, path.basename(dir))) {
        result.dirs.push(relPath);
        const sub = await scanDir(fullPath, baseDir);
        result.files.push(...sub.files);
        result.dirs.push(...sub.dirs);
      }
    } else if (!SKIP_FILES.has(entry.name)) {
      const ext = path.extname(entry.name).toLowerCase();
      if (EXT_LANG[ext]) {
        result.files.push(relPath);
      }
    }
  }
  return result;
}

async function buildIntelligence(projectRoot) {
  const scanDate = new Date().toISOString();
  const { files } = await scanDir(projectRoot, projectRoot);

  const modules = [];
  const apiEndpoints = [];
  const dataModels = new Set();
  const allImports = new Set();

  for (const file of files) {
    const fullPath = path.join(projectRoot, file);
    let content;
    try {
      content = await fs.readFile(fullPath, "utf-8");
    } catch {
      continue;
    }

    const lang = getLanguage(file);
    const functions = extractFunctions(content, lang);
    const description = extractDescription(content, lang) || generateDescription(file, functions, lang);
    const imports = extractImports(content, lang);
    const endpoints = extractApiEndpoints(content, lang);
    const models = extractDataModels(content, lang);

    for (const imp of imports) allImports.add(imp);
    for (const m of models) dataModels.add(m);

    const module = {
      path: file,
      lang,
      description,
      exports: functions.slice(0, 10),
      endpoints: endpoints.slice(0, 20),
      models: models.slice(0, 10),
      imports: imports.slice(0, 20),
      lineCount: content.split("\n").length,
    };

    if (description || functions.length > 0 || endpoints.length > 0 || models.length > 0) {
      modules.push(module);
    }

    for (const ep of endpoints) {
      apiEndpoints.push({
        path: ep.path,
        method: ep.method,
        file,
      });
    }
  }

  return {
    scanDate,
    projectRoot,
    summary: {
      totalFiles: files.length,
      totalModules: modules.length,
      totalEndpoints: apiEndpoints.length,
      totalModels: dataModels.size,
    },
    techStack: detectTechStack(files),
    modules,
    apiEndpoints,
    dataModels: [...dataModels],
    externalDeps: [...allImports].filter(d => !d.startsWith(".") && !d.startsWith("/")),
  };
}

function generateDescription(file, functions, lang) {
  const name = path.basename(file, path.extname(file));
  const parts = name.replace(/[-_]/g, " ").split(" ").filter(Boolean);
  if (parts.length > 0) {
    return `模块：${parts.join(" ")}${functions.length > 0 ? `，主要函数：${functions.slice(0, 3).join("、")}` : ""}`;
  }
  return "";
}

function detectTechStack(files) {
  const stack = new Set();
  for (const f of files) {
    if (f.endsWith(".ts") || f.endsWith(".tsx")) stack.add("typescript");
    if (f.endsWith(".js") || f.endsWith(".jsx") || f.endsWith(".mjs")) stack.add("javascript");
    if (f.endsWith(".py")) stack.add("python");
    if (f.endsWith(".go")) stack.add("go");
    if (f.endsWith(".java")) stack.add("java");
    if (f.endsWith(".cs")) stack.add("csharp");
    if (f.endsWith(".rs")) stack.add("rust");
    if (f.includes("package.json")) stack.add("node");
    if (f.includes("requirements.txt") || f.includes("pyproject.toml")) stack.add("python");
    if (f.includes("go.mod")) stack.add("go");
    if (f.includes("Cargo.toml")) stack.add("rust");
    if (f.includes("Dockerfile") || f.includes("docker-compose")) stack.add("docker");
    if (f.includes(".env")) stack.add("env");
    if (f.includes("Makefile") || f.includes("makefile")) stack.add("make");
  }
  return [...stack];
}

async function main() {
  const projectRoot = process.argv[2] || process.cwd();
  const outputDir = path.join(projectRoot, ".pm");
  const outputPath = path.join(outputDir, "intelligence.json");

  await fs.mkdir(outputDir, { recursive: true });

  const intel = await buildIntelligence(projectRoot);

  await fs.writeFile(outputPath, JSON.stringify(intel, null, 2), "utf-8");
  console.log(`Project intelligence cached: ${outputPath}`);
  console.log(`  Files scanned: ${intel.summary.totalFiles}`);
  console.log(`  Modules documented: ${intel.summary.totalModules}`);
  console.log(`  API endpoints: ${intel.summary.totalEndpoints}`);
  console.log(`  Data models: ${intel.summary.totalModels}`);
  console.log(`  Tech stack: ${intel.techStack.join(", ")}`);
}

main().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
