import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const resolvedCatalog = resolve(root, "content/catalog.resolved.json");
const seedCatalog = resolve(root, "content/catalog.seed.json");
const appcastPath = resolve(root, "content/releases/macalthub-appcast.json");
const versionPath = resolve(root, "VERSION");
const targetDir = resolve(root, "apps/macos/Sources/MacAltHub/Resources");
const targetFile = resolve(targetDir, "catalog.json");
const targetAppcast = resolve(targetDir, "appcast.json");
const targetVersion = resolve(targetDir, "version.json");
const sourceFile = existsSync(resolvedCatalog) ? resolvedCatalog : seedCatalog;

await mkdir(targetDir, { recursive: true });

const seedApps = JSON.parse(await readFile(seedCatalog, "utf8"));
const resolvedApps = existsSync(resolvedCatalog)
  ? JSON.parse(await readFile(resolvedCatalog, "utf8"))
  : [];
const resolvedById = new Map(resolvedApps.map((app) => [app.id, app.resolvedDownload]));
const apps = seedApps.map((app) => ({
  ...app,
  ...(resolvedById.get(app.id) ? { resolvedDownload: resolvedById.get(app.id) } : {})
}));

await writeFile(targetFile, `${JSON.stringify(apps, null, 2)}\n`);
const version = (await readFile(versionPath, "utf8")).trim();
const appcast = JSON.parse(await readFile(appcastPath, "utf8"));
await writeFile(targetAppcast, `${JSON.stringify(appcast, null, 2)}\n`);
await writeFile(targetVersion, `${JSON.stringify({ version, build: "1" }, null, 2)}\n`);
await writeFile(resolve(targetDir, "catalog-summary.json"), `${JSON.stringify({
  count: apps.length,
  version,
  generatedAt: new Date().toISOString(),
  source: sourceFile.endsWith("catalog.resolved.json") ? "resolved" : "seed"
}, null, 2)}\n`);

console.log(`Synced ${apps.length} catalog apps to ${targetFile}`);
