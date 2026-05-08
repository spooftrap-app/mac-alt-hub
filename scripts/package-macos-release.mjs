import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const version = (await readFile(resolve(root, "VERSION"), "utf8")).trim();
const buildNumber = process.env.BUILD_NUMBER ?? "1";
const repository = process.env.GITHUB_REPOSITORY ?? "spooftrap-app/mac-alt-hub";
const archiveName = `MacAltHub-${version}.zip`;
const archivePath = resolve(root, "dist", archiveName);
const appPath = resolve(root, "apps/macos/dist/MacAltHub.app");
const appcastPath = resolve(root, "content/releases/macalthub-appcast.json");

function run(command, args, cwd = root) {
  execFileSync(command, args, { cwd, stdio: "inherit" });
}

await mkdir(resolve(root, "dist"), { recursive: true });

run("./script/build_and_run.sh", ["--package-only"], resolve(root, "apps/macos"));
run("ditto", ["-c", "-k", "--sequesterRsrc", "--keepParent", appPath, archivePath]);

const archiveBuffer = await readFile(archivePath);
const sha256 = createHash("sha256").update(archiveBuffer).digest("hex");
await writeFile(`${archivePath}.sha256`, `${sha256}  ${archiveName}\n`);

const appcast = JSON.parse(await readFile(appcastPath, "utf8"));
appcast.currentVersion = version;
appcast.generatedAt = new Date().toISOString();

const downloadUrl = `https://github.com/${repository}/releases/download/v${version}/${archiveName}`;
const tagUrl = `https://github.com/${repository}/releases/tag/v${version}`;
let release = appcast.releases.find((candidate) => candidate.version === version);

if (!release) {
  release = {
    version,
    build: buildNumber,
    date: new Date().toISOString().slice(0, 10),
    notes: `MacAltHub ${version} release.`,
    downloadUrl,
    signature: null,
    sha256
  };
  appcast.releases.unshift(release);
}

release.build = buildNumber;
release.downloadUrl = downloadUrl;
release.sourceUrl = tagUrl;
release.sha256 = sha256;

await writeFile(appcastPath, `${JSON.stringify(appcast, null, 2)}\n`);
await writeFile(
  resolve(root, "apps/macos/Sources/MacAltHub/Resources/appcast.json"),
  `${JSON.stringify(appcast, null, 2)}\n`
);
await writeFile(
  resolve(root, "dist/release-manifest.json"),
  `${JSON.stringify(
    {
      product: "MacAltHub",
      version,
      build: buildNumber,
      generatedAt: appcast.generatedAt,
      repository,
      artifacts: [
        "apps/web/.next",
        "apps/macos/dist/MacAltHub.app",
        `dist/${archiveName}`,
        `dist/${archiveName}.sha256`,
        "apps/chatgpt"
      ],
      macos: {
        archive: `dist/${archiveName}`,
        sha256,
        appcast: "content/releases/macalthub-appcast.json",
        downloadUrl
      }
    },
    null,
    2
  )}\n`
);

console.log(`Packaged ${archiveName}`);
console.log(`SHA-256 ${sha256}`);
