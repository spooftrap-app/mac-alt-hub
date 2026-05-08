import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const version = (await readFile(resolve(root, "VERSION"), "utf8")).trim();
const pkg = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
const appcast = JSON.parse(await readFile(resolve(root, "content/releases/macalthub-appcast.json"), "utf8"));

const mismatches = [];

if (pkg.version !== version) {
  mismatches.push(`package.json version ${pkg.version} does not match VERSION ${version}`);
}

if (appcast.currentVersion !== version) {
  mismatches.push(`appcast currentVersion ${appcast.currentVersion} does not match VERSION ${version}`);
}

if (!appcast.releases.some((release) => release.version === version)) {
  mismatches.push(`appcast does not include release ${version}`);
}

if (mismatches.length) {
  console.error(mismatches.join("\n"));
  process.exit(1);
}

console.log(`Version ${version} is consistent.`);

