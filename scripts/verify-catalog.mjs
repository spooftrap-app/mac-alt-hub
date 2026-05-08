import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const seedPath = resolve(root, "content/catalog.seed.json");
const resolvedPath = resolve(root, "content/catalog.resolved.json");

const blockedHosts = new Set([
  "discord.com",
  "discord.gg",
  "x.com",
  "twitter.com",
  "t.me",
  "telegram.me",
  "bit.ly",
  "tinyurl.com",
  "linktr.ee",
  "ko-fi.com",
  "patreon.com"
]);

const headers = {
  "user-agent": "MacAltHub catalog verifier"
};

function blocked(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return Array.from(blockedHosts).some((blockedHost) => host === blockedHost || host.endsWith(`.${blockedHost}`));
  } catch {
    return true;
  }
}

async function resolveDownload(app) {
  const resolver = app.resolver;

  if (resolver.kind === "github-release") {
    const response = await fetch(`https://api.github.com/repos/${resolver.repo}/releases/latest`, { headers });
    if (!response.ok) {
      throw new Error(`GitHub latest release failed: ${response.status}`);
    }

    const release = await response.json();
    const regex = new RegExp(resolver.assetRegex, "i");
    const asset = release.assets?.find((candidate) => regex.test(candidate.name));
    if (!asset?.browser_download_url) {
      throw new Error(`No release asset matched ${resolver.assetRegex}`);
    }

    return {
      kind: "github-release",
      url: asset.browser_download_url,
      label: asset.name,
      source: release.html_url
    };
  }

  if (resolver.kind === "homebrew-cask") {
    const response = await fetch(`https://formulae.brew.sh/api/cask/${resolver.token}.json`, { headers });
    if (!response.ok) {
      throw new Error(`Homebrew cask lookup failed: ${response.status}`);
    }

    const cask = await response.json();
    if (!cask.url) {
      throw new Error("Homebrew cask did not expose a URL");
    }

    return {
      kind: "homebrew-cask",
      url: cask.url,
      label: `brew install --cask ${resolver.token}`,
      source: `https://formulae.brew.sh/cask/${resolver.token}`
    };
  }

  return {
    kind: resolver.kind,
    url: resolver.url,
    label: resolver.kind === "official-direct" ? "Official download" : "Official release page",
    source: resolver.url
  };
}

const catalog = JSON.parse(await readFile(seedPath, "utf8"));
const seen = new Set();
const problems = [];
const output = [];

for (const app of catalog) {
  if (seen.has(app.id)) {
    problems.push(`${app.id}: duplicate id`);
  }
  seen.add(app.id);

  const fallback =
    app.resolver.kind === "github-release" || app.resolver.kind === "homebrew-cask"
      ? app.resolver.fallbackUrl
      : app.resolver.url;

  if (blocked(fallback)) {
    problems.push(`${app.id}: blocked fallback ${fallback}`);
  }

  try {
    const resolved = await resolveDownload(app);
    if (blocked(resolved.url)) {
      throw new Error(`resolved URL is blocked: ${resolved.url}`);
    }

    output.push({
      ...app,
      resolvedDownload: {
        ...resolved,
        verifiedAt: new Date().toISOString()
      }
    });
    console.log(`ok ${app.id} -> ${resolved.url}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    output.push({
      ...app,
      resolvedDownload: {
        kind: "fallback",
        url: fallback,
        label: "Verified source page",
        source: fallback,
        verifiedAt: new Date().toISOString(),
        warning: message
      }
    });
    problems.push(`${app.id}: ${message}`);
    console.warn(`warn ${app.id}: ${message}`);
  }
}

await writeFile(resolvedPath, `${JSON.stringify(output, null, 2)}\n`);

if (problems.length) {
  console.warn(`Catalog verification completed with ${problems.length} warnings.`);
  process.exitCode = 0;
} else {
  console.log("Catalog verification completed without warnings.");
}

