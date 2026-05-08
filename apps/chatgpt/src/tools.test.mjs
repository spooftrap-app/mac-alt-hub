import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const catalog = JSON.parse(readFileSync(new URL("../../../content/catalog.seed.json", import.meta.url)));

function search(query) {
  const q = query.toLowerCase();
  return catalog.filter((app) => [app.name, app.tagline, app.category, ...app.paidAlternatives].join(" ").toLowerCase().includes(q));
}

test("search finds Wspr-style dictation alternatives", () => {
  const results = search("wspr");
  assert.ok(results.some((app) => app.id === "open-wispr"));
});

test("compare ids resolve known apps", () => {
  const ids = new Set(["rectangle", "aerospace", "alt-tab"]);
  const results = catalog.filter((app) => ids.has(app.id));
  assert.equal(results.length, 3);
});

