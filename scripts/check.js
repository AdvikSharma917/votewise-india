import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const MAX_REPO_SIZE_MB = 10;
const SIZE_CHECK_IGNORED_ENTRIES = new Set([".git", "node_modules", "dist", "build", ".env"]);
const requiredFiles = [
  "public/index.html",
  "public/styles.css",
  "public/app.js",
  "public/lib/electionData.js",
  "public/lib/electionLogic.js",
  "server.js",
  "src/firestore.js",
  "README.md",
  ".env.example",
  "Dockerfile",
  "firebase.json"
];

for (const file of requiredFiles) {
  assert(existsSync(path.join(root, file)), `Missing required file: ${file}`);
}

const index = read("public/index.html");
assert(index.includes("./styles.css"), "index.html must load styles.css");
assert(index.includes("./app.js"), "index.html must load app.js");
assert(index.includes("not an official Election Commission"), "index.html must include the non-official disclaimer");

const publicFiles = walk(path.join(root, "public")).filter((file) => /\.(html|css|js|json)$/i.test(file));
const forbiddenFrontendPatterns = [
  /GEMINI_API_KEY/i,
  /FIRESTORE_ACCESS_TOKEN/i,
  /x-goog-api-key/i,
  /AIza[0-9A-Za-z_-]{20,}/
];

for (const file of publicFiles) {
  const content = readFileSync(file, "utf8");
  for (const pattern of forbiddenFrontendPatterns) {
    assert(!pattern.test(content), `Potential secret/API-key reference found in frontend file: ${path.relative(root, file)}`);
  }
}

const server = read("server.js");
assert(server.includes("Content-Security-Policy"), "server.js must set a Content-Security-Policy");
assert(server.includes("/api/guide"), "server.js must expose the Gemini guide API route");
assert(server.includes("/api/quiz-results"), "server.js must expose the optional quiz results API route");
assert(server.includes("/api/status"), "server.js must expose the safe Google services status API route");

const firebase = JSON.parse(read("firebase.json"));
assert(firebase.hosting?.public === "public", "firebase.json must serve the public frontend");
assert(
  firebase.hosting?.rewrites?.some((rewrite) => rewrite.source === "/api/**" && rewrite.run?.serviceId),
  "firebase.json must include an /api/** rewrite to Cloud Run"
);

const repoSize = getDirectorySize(root, SIZE_CHECK_IGNORED_ENTRIES);
const repoSizeMb = repoSize / 1024 / 1024;
assert(repoSizeMb <= MAX_REPO_SIZE_MB, `Repo size check failed: ${repoSizeMb.toFixed(1)} MB / ${MAX_REPO_SIZE_MB} MB`);

console.log("Build check passed: required files, disclaimers, security headers, and frontend secret scan are clean.");
console.log(`Repo size check passed: ${repoSizeMb.toFixed(1)} MB / ${MAX_REPO_SIZE_MB} MB`);

function read(file) {
  return readFileSync(path.join(root, file), "utf8");
}

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = path.join(dir, entry);
    return statSync(fullPath).isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function getDirectorySize(dir, ignoredNames) {
  return readdirSync(dir).reduce((total, entry) => {
    if (ignoredNames.has(entry) || entry.endsWith(".env")) return total;

    const fullPath = path.join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      return total + getDirectorySize(fullPath, ignoredNames);
    }

    return total + stats.size;
  }, 0);
}

function assert(condition, message) {
  if (!condition) {
    console.error(message);
    process.exit(1);
  }
}
