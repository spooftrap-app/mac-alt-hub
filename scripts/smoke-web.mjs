const baseUrl = process.env.MACALTHUB_BASE_URL ?? "http://localhost:3000";
const expectedRectangleDownload =
  "https://github.com/rxhanson/Rectangle/releases/download/v0.95/Rectangle0.95.dmg";

async function check(path, expectedStatus = 200) {
  const response = await fetch(resolvePath(path), { redirect: "manual" });
  if (response.status !== expectedStatus) {
    throw new Error(`${path} returned ${response.status}; expected ${expectedStatus}`);
  }
  return response;
}

function resolvePath(path) {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(path.replace(/^\//, ""), normalizedBase);
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

const detail = await check("/apps/rectangle/");
const detailText = await detail.text();
for (const phrase of ["Rectangle", "Verified", "Download"]) {
  if (!detailText.includes(phrase)) {
    throw new Error(`Rectangle detail page did not include expected phrase: ${phrase}`);
  }
}
if (!detailText.includes(expectedRectangleDownload)) {
  throw new Error("Rectangle detail page does not link to the verified direct download.");
}

console.log(`Web smoke checks passed against ${baseUrl}`);
