import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const catalog = JSON.parse(readFileSync(new URL("../../../content/catalog.seed.json", import.meta.url)));

const blockedHosts = [
  "discord.com",
  "discord.gg",
  "x.com",
  "twitter.com",
  "t.me",
  "telegram.me",
  "bit.ly",
  "tinyurl.com",
  "linktr.ee"
];

test("catalog has many useful macOS alternatives", () => {
  assert.ok(catalog.length >= 45, `expected at least 45 apps, received ${catalog.length}`);
});

test("catalog ids are unique", () => {
  const ids = catalog.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("download fallbacks do not use banned community or shortener hosts", () => {
  for (const item of catalog) {
    const url =
      item.resolver.kind === "github-release" || item.resolver.kind === "homebrew-cask"
        ? item.resolver.fallbackUrl
        : item.resolver.url;
    const host = new URL(url).hostname.replace(/^www\./, "");
    assert.ok(
      !blockedHosts.some((blocked) => host === blocked || host.endsWith(`.${blocked}`)),
      `${item.name} uses a blocked host: ${host}`
    );
  }
});

