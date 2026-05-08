const baseUrl = process.env.MACALTHUB_BASE_URL ?? "http://localhost:3000";

async function check(path, expectedStatus = 200) {
  const response = await fetch(new URL(path, baseUrl), { redirect: "manual" });
  if (response.status !== expectedStatus) {
    throw new Error(`${path} returned ${response.status}; expected ${expectedStatus}`);
  }
  return response;
}

const home = await check("/");
const homeText = await home.text();
for (const phrase of [
  "Direct-download alternatives",
  "Sponsor-ready",
  "No Discord gates",
  "verified alternatives"
]) {
  if (!homeText.includes(phrase)) {
    throw new Error(`Homepage did not include expected phrase: ${phrase}`);
  }
}

const detail = await check("/apps/rectangle");
const detailText = await detail.text();
for (const phrase of ["Rectangle", "Verified", "Download"]) {
  if (!detailText.includes(phrase)) {
    throw new Error(`Rectangle detail page did not include expected phrase: ${phrase}`);
  }
}

const download = await check("/api/download/rectangle", 307);
const location = download.headers.get("location") ?? "";
if (!location.includes("github.com/rxhanson/Rectangle")) {
  throw new Error(`Rectangle download resolved to unexpected location: ${location}`);
}

console.log(`Web smoke checks passed against ${baseUrl}`);
