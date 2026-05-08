const baseUrl = process.env.MACALTHUB_BASE_URL ?? "http://localhost:3000";

async function check(path, expectedStatus = 200) {
  const response = await fetch(new URL(path, baseUrl), { redirect: "manual" });
  if (response.status !== expectedStatus) {
    throw new Error(`${path} returned ${response.status}; expected ${expectedStatus}`);
  }
  return response;
}

await check("/");
await check("/apps/rectangle");
const download = await check("/api/download/rectangle", 307);
const location = download.headers.get("location") ?? "";
if (!location.includes("github.com/rxhanson/Rectangle")) {
  throw new Error(`Rectangle download resolved to unexpected location: ${location}`);
}

console.log(`Web smoke checks passed against ${baseUrl}`);

