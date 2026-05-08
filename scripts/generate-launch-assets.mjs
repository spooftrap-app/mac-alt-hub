import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const docsDir = resolve(root, "docs");
const assetsDir = resolve(root, "assets/brand");
const catalog = JSON.parse(await readFile(resolve(root, "content/catalog.seed.json"), "utf8"));

await mkdir(docsDir, { recursive: true });
await mkdir(assetsDir, { recursive: true });

const categories = [...new Set(catalog.map((app) => app.category))].sort();
const topApps = [...catalog].sort((a, b) => b.popularity - a.popularity).slice(0, 12);

await writeFile(
  resolve(docsDir, "catalog-growth-model.csv"),
  [
    "Metric,Month 1,Month 2,Month 3,Assumption",
    "Catalog apps,55,80,120,Add verified apps weekly",
    "Organic visits,5000,15000,45000,SEO pages per category and app comparison",
    "Download CTA CTR,0.18,0.2,0.22,Users arrive with high intent",
    "EthicalAds RPM,2.5,3,3.5,Subtle single-slot sponsorship",
    "Sponsor slots sold,0,1,2,Category sponsorship after trust baseline",
    "Monthly revenue,12.5,245,757.5,Ads plus conservative sponsorship"
  ].join("\n")
);

await writeFile(
  resolve(docsDir, "launch-deck-outline.md"),
  `# MacAltHub Launch Deck

## 1. Title
MacAltHub: the App Store for paid Mac utility alternatives.

## 2. Problem
Mac users waste time searching Reddit, Discord, stale blog lists, and GitHub pages to find safe alternatives to paid utility apps.

## 3. Product
A clean catalog with direct downloads, verification metadata, and comparison-first discovery.

## 4. Trust Layer
Every app is checked for source, license, platform support, download route, release freshness, and blocked redirect hosts.

## 5. Surfaces
Website, native macOS app, and ChatGPT app all share the same catalog package.

## 6. Launch Catalog
${catalog.length} apps across ${categories.length} categories, led by ${topApps.map((app) => app.name).join(", ")}.

## 7. Monetization
Subtle EthicalAds slot first; later add clearly labeled category sponsorship and pro monitoring for maintainers.

## 8. Roadmap
Automated freshness checks, community submissions, signed download provenance, and personalized recommendation assistant.
`
);

await writeFile(
  resolve(assetsDir, "macalthub-mark.svg"),
  `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="112" fill="#F5F7FB"/>
  <rect x="68" y="84" width="376" height="300" rx="58" fill="white" stroke="#D9E0EA" stroke-width="8"/>
  <circle cx="132" cy="138" r="15" fill="#FF605C"/>
  <circle cx="178" cy="138" r="15" fill="#FFBD44"/>
  <circle cx="224" cy="138" r="15" fill="#00CA4E"/>
  <rect x="110" y="204" width="112" height="112" rx="28" fill="#0A84FF"/>
  <path d="M143 261h46M166 238v46" stroke="white" stroke-width="18" stroke-linecap="round"/>
  <rect x="246" y="214" width="150" height="16" rx="8" fill="#111827"/>
  <rect x="246" y="250" width="116" height="14" rx="7" fill="#667085"/>
  <rect x="246" y="286" width="92" height="32" rx="16" fill="#30D158"/>
  <path d="M166 384l48 44 132-132" stroke="#111827" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
);

console.log(`Generated launch docs and brand assets for ${catalog.length} apps.`);

