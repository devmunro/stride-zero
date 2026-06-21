const assert = require("node:assert/strict");
const plan = require("../src/plan/bundled-plan.json");

assert.equal(plan.planId, "dufton-alston-2026");
assert.equal(plan.startDate, "2026-06-22");
assert.equal(plan.challengeDate, "2026-12-20");
assert.equal(plan.weeks.length, 26);

const sessions = plan.weeks.flatMap((week) => week.sessions);
assert.ok(sessions.length > 0);
assert.equal(new Set(sessions.map((session) => session.id)).size, sessions.length);

for (const session of sessions) {
  assert.match(session.date, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(Array.isArray(session.steps) && session.steps.length > 0);
  assert.ok(session.steps.every((step) => ["run", "walk"].includes(step.type)));
  assert.ok(session.steps.every((step) => Number.isFinite(step.seconds) && step.seconds > 0));
  assert.ok(!/\b(hike|strength|mobility|gym)\b/i.test(session.title), `Non-running session leaked into Stride Zero: ${session.title}`);
}

const serialized = JSON.stringify(plan);
for (const privateField of ["weightKg", "sleepHours", "kneePain", "journalEntries", "recoveryEntries"]) {
  assert.ok(!serialized.includes(`"${privateField}"`), `Private tracker field leaked into public plan: ${privateField}`);
}

console.log(`Plan check passed (${sessions.length} guided sessions across 26 weeks).`);
