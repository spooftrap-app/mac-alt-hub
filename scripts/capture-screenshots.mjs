import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.MACALTHUB_BASE_URL ?? "http://localhost:3000";
const outputDir = resolve(import.meta.dirname, "..", "docs", "screenshots");

const shots = [
  {
    name: "homepage-desktop.png",
    path: "/",
    viewport: { width: 1440, height: 1150 },
    reducedMotion: "no-preference"
  },
  {
    name: "homepage-mobile.png",
    path: "/",
    viewport: { width: 390, height: 1100 },
    reducedMotion: "no-preference"
  },
  {
    name: "detail-rectangle.png",
    path: "/apps/rectangle/",
    viewport: { width: 1280, height: 960 },
    reducedMotion: "reduce"
  }
];

async function assertReady(page) {
  await page.waitForLoadState("load", { timeout: 15000 }).catch(() => {});
  await page.getByText("Direct-download alternatives").first().waitFor({ timeout: 15000 });
  await page.getByText("Quiet sponsor slot available").first().waitFor({ timeout: 15000 });
}

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();

try {
  for (const shot of shots) {
    const context = await browser.newContext({
      viewport: shot.viewport,
      colorScheme: "light",
      reducedMotion: shot.reducedMotion
    });
    const page = await context.newPage();
    await page.goto(resolvePath(shot.path), { waitUntil: "domcontentloaded" });
    if (shot.path === "/") {
      await assertReady(page);
    } else {
      await page.waitForLoadState("load", { timeout: 15000 }).catch(() => {});
      await page.getByRole("heading", { name: "Rectangle" }).waitFor({ timeout: 15000 });
    }
    await page.waitForTimeout(1200);
    await page.screenshot({
      path: resolve(outputDir, shot.name),
      fullPage: true
    });
    await context.close();
    console.log(`Captured docs/screenshots/${shot.name}`);
  }
} finally {
  await browser.close();
}

function resolvePath(path) {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(path.replace(/^\//, ""), normalizedBase).toString();
}
