import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const version = (await readFile(resolve(root, "VERSION"), "utf8")).trim();
const today = new Date().toISOString().slice(0, 10);
const repository = process.env.GITHUB_REPOSITORY ?? "spooftrap-app/mac-alt-hub";
const appcastPath = resolve(root, "content/releases/macalthub-appcast.json");
const appcast = JSON.parse(await readFile(appcastPath, "utf8"));

appcast.currentVersion = version;
appcast.generatedAt = new Date().toISOString();

if (!appcast.releases.some((release) => release.version === version)) {
  appcast.releases.unshift({
    version,
    build: String(appcast.releases.length + 1),
    date: today,
    notes: `MacAltHub ${version} release.`,
    downloadUrl: `https://github.com/${repository}/releases/download/v${version}/MacAltHub-${version}.zip`,
    sourceUrl: `https://github.com/${repository}/releases/tag/v${version}`,
    signature: null,
    sha256: null
  });
}

await writeFile(appcastPath, `${JSON.stringify(appcast, null, 2)}\n`);
await mkdir(resolve(root, "dist"), { recursive: true });
await writeFile(
  resolve(root, "dist/release-manifest.json"),
  `${JSON.stringify(
    {
      product: "MacAltHub",
      version,
      generatedAt: appcast.generatedAt,
      repository,
      artifacts: [
        "apps/web/.next",
        "apps/macos/dist/MacAltHub.app",
        "apps/chatgpt"
      ]
    },
    null,
    2
  )}\n`
);

console.log(`Prepared release metadata for ${version}.`);
