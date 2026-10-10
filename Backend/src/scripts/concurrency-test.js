const { randomUUID } = require("crypto");

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const { TEST_EMAIL, TEST_PASSWORD, ROOM_ID } = process.env;
const REQUESTS = 10;

if (!TEST_EMAIL || !TEST_PASSWORD || !ROOM_ID) {
  console.error("Set TEST_EMAIL, TEST_PASSWORD and ROOM_ID first.");
  process.exit(1);
}

async function login() {
  const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Login failed with status ${res.status}`);
  return res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
}

// A random day 30-330 days ahead, so reruns rarely hit old test data.
function randomFutureDate() {
  const days = 30 + Math.floor(Math.random() * 300);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

async function book(cookie, key, body) {
  const res = await fetch(`${BASE_URL}/api/v1/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
      "Idempotency-Key": key,
    },
    body,
  });
  const json = await res.json();
  const code = json.error
    ? json.error.code
    : json.data.replayed
      ? "REPLAYED"
      : "CREATED";
  return `${res.status} ${code}`;
}

function report(title, date, results) {
  const counts = {};
  for (const r of results) counts[r] = (counts[r] || 0) + 1;
  console.log(`\n=== ${title} ===`);
  console.log(`Slot: ${date} 08:00 PH time (check_in ${date}T00:00:00Z)`);
  for (const [result, n] of Object.entries(counts))
    console.log(`  ${n} x ${result}`);
}

async function main() {
  const cookie = await login();
  console.log(
    "Logged in. Firing",
    REQUESTS,
    "simultaneous requests per scenario...",
  );

  // Scenario A: 10 different people (different keys) race for the same slot.
  const dateA = randomFutureDate();
  const bodyA = JSON.stringify({
    roomId: ROOM_ID,
    date: dateA,
    durationHours: 8,
    startTime: "08:00",
    guestCount: 2,
  });
  const resultsA = await Promise.all(
    Array.from({ length: REQUESTS }, () => book(cookie, randomUUID(), bodyA)),
  );
  report("A: same slot, different keys", dateA, resultsA);

  // Scenario B: one client retries the SAME key 10 times at once.
  const dateB = randomFutureDate();
  const bodyB = JSON.stringify({
    roomId: ROOM_ID,
    date: dateB,
    durationHours: 8,
    startTime: "08:00",
    guestCount: 2,
  });
  const sameKey = randomUUID();
  const resultsB = await Promise.all(
    Array.from({ length: REQUESTS }, () => book(cookie, sameKey, bodyB)),
  );
  report("B: same slot, same key", dateB, resultsB);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
