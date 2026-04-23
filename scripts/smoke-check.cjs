const fs = require("fs");
const path = require("path");

/**
 * Reads and parses a JSON file from the project root.
 *
 * @param {string} relativePath Project-relative JSON path
 * @returns {unknown} Parsed JSON payload
 */
function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8"));
}

/**
 * Throws when a project-relative file path does not exist.
 *
 * @param {string} relativePath Project-relative file path
 * @returns {void}
 */
function ensureExists(relativePath) {
  const fullPath = path.join(__dirname, "..", relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing required file: ${relativePath}`);
  }
}

const packageJson = readJson("package.json");
const appJson = readJson("app.json");
const expo = appJson.expo ?? {};

if (packageJson.name !== "stride-zero") {
  throw new Error(`Expected package name "stride-zero", received "${packageJson.name}"`);
}

if (expo.slug !== "stride-zero") {
  throw new Error(`Expected Expo slug "stride-zero", received "${expo.slug}"`);
}

if (expo.android?.package !== "com.stridezero.app") {
  throw new Error(`Expected Android package "com.stridezero.app", received "${expo.android?.package}"`);
}

[
  "README.md",
  "LICENSE",
  "CONTRIBUTING.md",
  "docs/screenshots/dashboard.jpeg",
  "docs/screenshots/plan.jpeg",
  "docs/screenshots/stats.jpeg",
].forEach(ensureExists);

console.log("Smoke check passed.");
