/** @typedef {import("../types/models").Achievement} Achievement */
/** @typedef {import("../types/models").Profile} Profile */
/** @typedef {import("../types/models").Session} Session */

function step(type, seconds, label) {
  return { type, seconds, label };
}

function repeatPairs(reps, runSeconds, walkSeconds, runLabel = "Run", walkLabel = "Walk") {
  const steps = [];
  for (let index = 0; index < reps; index += 1) {
    steps.push(step("run", runSeconds, runLabel));
    steps.push(step("walk", walkSeconds, walkLabel));
  }
  return steps;
}

function createSession({
  week,
  run,
  title,
  summary,
  blocks,
  longestRun,
  workSteps,
  isFinal = false,
}) {
  const steps = [step("walk", 300, "Warm up"), ...workSteps, step("walk", 300, "Cool down")];
  const totalSeconds = steps.reduce((sum, item) => sum + item.seconds, 0);

  return {
    id: `${week}-${run}`,
    week,
    run,
    title,
    summary,
    blocks,
    longestRun,
    steps,
    totalMinutes: Math.round(totalSeconds / 60),
    totalSeconds,
    isFinal,
  };
}

function createWeek(week, goal, sessions) {
  return { week, goal, sessions };
}

function buildOptionalSupportRun(referenceSession, week) {
  const easyRunSeconds = Math.max(60, Math.round(referenceSession.longestRun * 0.75) * 60);
  const walkSeconds = Math.max(60, Math.round(easyRunSeconds / 2));

  return {
    ...createSession({
      week,
      run: 4,
      title: "Easy support run",
      summary: "Optional easy session to build comfort without forcing the plan.",
      blocks: [["Main set", `Easy run ${Math.round(easyRunSeconds / 60)} min / Walk ${Math.round(walkSeconds / 60)} min / Easy run ${Math.round(easyRunSeconds / 60)} min`]],
      longestRun: Math.round(easyRunSeconds / 60),
      workSteps: [step("run", easyRunSeconds, "Easy run"), step("walk", walkSeconds, "Walk"), step("run", easyRunSeconds, "Easy run")],
    }),
    countsTowardPlan: false,
    isOptional: true,
  };
}

const scheduleMaps = {
  "2 runs most weeks": ["Run 1", "Run 2"],
  "3 runs most weeks": ["Run 1", "Run 2", "Run 3"],
  "4 runs most weeks": ["Run 1", "Run 2", "Run 3", "Run 4"],
};

const couchBasePlan = [
  createWeek(1, "Start small.", [
    createSession({ week: 1, run: 1, title: "Wake-up run", summary: "Run 60 sec, walk 90 sec x8", blocks: [["Main set", "Run 60 sec / Walk 90 sec x8"]], longestRun: 1, workSteps: repeatPairs(8, 60, 90) }),
    createSession({ week: 1, run: 2, title: "Settle in", summary: "Run 60 sec, walk 90 sec x8", blocks: [["Main set", "Run 60 sec / Walk 90 sec x8"]], longestRun: 1, workSteps: repeatPairs(8, 60, 90) }),
    createSession({ week: 1, run: 3, title: "Find your pace", summary: "Run 60 sec, walk 90 sec x8", blocks: [["Main set", "Run 60 sec / Walk 90 sec x8"]], longestRun: 1, workSteps: repeatPairs(8, 60, 90) }),
  ]),
  createWeek(2, "Build rhythm.", [
    createSession({ week: 2, run: 1, title: "Smooth repeats", summary: "Run 90 sec, walk 2 min x6", blocks: [["Main set", "Run 90 sec / Walk 2 min x6"]], longestRun: 2, workSteps: repeatPairs(6, 90, 120) }),
    createSession({ week: 2, run: 2, title: "Stay relaxed", summary: "Run 90 sec, walk 2 min x6", blocks: [["Main set", "Run 90 sec / Walk 2 min x6"]], longestRun: 2, workSteps: repeatPairs(6, 90, 120) }),
    createSession({ week: 2, run: 3, title: "Hold the rhythm", summary: "Run 90 sec, walk 2 min x6", blocks: [["Main set", "Run 90 sec / Walk 2 min x6"]], longestRun: 2, workSteps: repeatPairs(6, 90, 120) }),
  ]),
  createWeek(3, "Go longer.", [
    createSession({ week: 3, run: 1, title: "Longer efforts", summary: "90 sec run, 3 min run, repeat twice", blocks: [["Round 1", "Run 90 sec / Walk 90 sec / Run 3 min / Walk 3 min"], ["Round 2", "Repeat once"]], longestRun: 3, workSteps: [step("run", 90, "Run"), step("walk", 90, "Walk"), step("run", 180, "Run"), step("walk", 180, "Walk"), step("run", 90, "Run"), step("walk", 90, "Walk"), step("run", 180, "Run"), step("walk", 180, "Walk")] }),
    createSession({ week: 3, run: 2, title: "Confidence builder", summary: "90 sec run, 3 min run, repeat twice", blocks: [["Round 1", "Run 90 sec / Walk 90 sec / Run 3 min / Walk 3 min"], ["Round 2", "Repeat once"]], longestRun: 3, workSteps: [step("run", 90, "Run"), step("walk", 90, "Walk"), step("run", 180, "Run"), step("walk", 180, "Walk"), step("run", 90, "Run"), step("walk", 90, "Walk"), step("run", 180, "Run"), step("walk", 180, "Walk")] }),
    createSession({ week: 3, run: 3, title: "Ready for more", summary: "90 sec run, 3 min run, repeat twice", blocks: [["Round 1", "Run 90 sec / Walk 90 sec / Run 3 min / Walk 3 min"], ["Round 2", "Repeat once"]], longestRun: 3, workSteps: [step("run", 90, "Run"), step("walk", 90, "Walk"), step("run", 180, "Run"), step("walk", 180, "Walk"), step("run", 90, "Run"), step("walk", 90, "Walk"), step("run", 180, "Run"), step("walk", 180, "Walk")] }),
  ]),
  createWeek(4, "Hold steady.", [
    createSession({ week: 4, run: 1, title: "Steady climb", summary: "3 min run, 5 min run, repeat twice", blocks: [["Round 1", "Run 3 min / Walk 90 sec / Run 5 min / Walk 2.5 min"], ["Round 2", "Repeat once"]], longestRun: 5, workSteps: [step("run", 180, "Run"), step("walk", 90, "Walk"), step("run", 300, "Run"), step("walk", 150, "Walk"), step("run", 180, "Run"), step("walk", 90, "Walk"), step("run", 300, "Run"), step("walk", 150, "Walk")] }),
    createSession({ week: 4, run: 2, title: "Strong and light", summary: "3 min run, 5 min run, repeat twice", blocks: [["Round 1", "Run 3 min / Walk 90 sec / Run 5 min / Walk 2.5 min"], ["Round 2", "Repeat once"]], longestRun: 5, workSteps: [step("run", 180, "Run"), step("walk", 90, "Walk"), step("run", 300, "Run"), step("walk", 150, "Walk"), step("run", 180, "Run"), step("walk", 90, "Walk"), step("run", 300, "Run"), step("walk", 150, "Walk")] }),
    createSession({ week: 4, run: 3, title: "Stay smooth", summary: "3 min run, 5 min run, repeat twice", blocks: [["Round 1", "Run 3 min / Walk 90 sec / Run 5 min / Walk 2.5 min"], ["Round 2", "Repeat once"]], longestRun: 5, workSteps: [step("run", 180, "Run"), step("walk", 90, "Walk"), step("run", 300, "Run"), step("walk", 150, "Walk"), step("run", 180, "Run"), step("walk", 90, "Walk"), step("run", 300, "Run"), step("walk", 150, "Walk")] }),
  ]),
  createWeek(5, "Break through.", [
    createSession({ week: 5, run: 1, title: "Five-minute repeats", summary: "Run 5 min, walk 3 min x3", blocks: [["Main set", "Run 5 min / Walk 3 min x3"]], longestRun: 5, workSteps: repeatPairs(3, 300, 180) }),
    createSession({ week: 5, run: 2, title: "Eight-minute focus", summary: "Run 8 min, walk 5 min, run 8 min", blocks: [["Main set", "Run 8 min / Walk 5 min / Run 8 min"]], longestRun: 8, workSteps: [step("run", 480, "Run"), step("walk", 300, "Walk"), step("run", 480, "Run")] }),
    createSession({ week: 5, run: 3, title: "Breakthrough run", summary: "Run 20 min continuous", blocks: [["Main set", "Run 20 min continuous"]], longestRun: 20, workSteps: [step("run", 1200, "Run")] }),
  ]),
  createWeek(6, "Stay calm.", [
    createSession({ week: 6, run: 1, title: "Back it up", summary: "5 min run, 8 min run, 5 min run", blocks: [["Main set", "Run 5 min / Walk 3 min / Run 8 min / Walk 3 min / Run 5 min"]], longestRun: 8, workSteps: [step("run", 300, "Run"), step("walk", 180, "Walk"), step("run", 480, "Run"), step("walk", 180, "Walk"), step("run", 300, "Run")] }),
    createSession({ week: 6, run: 2, title: "Long calm run", summary: "Run 22 min continuous", blocks: [["Main set", "Run 22 min continuous"]], longestRun: 22, workSteps: [step("run", 1320, "Run")] }),
    createSession({ week: 6, run: 3, title: "Hold the line", summary: "Run 25 min continuous", blocks: [["Main set", "Run 25 min continuous"]], longestRun: 25, workSteps: [step("run", 1500, "Run")] }),
  ]),
  createWeek(7, "Run smooth.", [
    createSession({ week: 7, run: 1, title: "Cruise control", summary: "Run 25 min continuous", blocks: [["Main set", "Run 25 min continuous"]], longestRun: 25, workSteps: [step("run", 1500, "Run")] }),
    createSession({ week: 7, run: 2, title: "Stay conversational", summary: "Run 28 min continuous", blocks: [["Main set", "Run 28 min continuous"]], longestRun: 28, workSteps: [step("run", 1680, "Run")] }),
    createSession({ week: 7, run: 3, title: "Strong finish", summary: "Run 28 min continuous", blocks: [["Main set", "Run 28 min continuous"]], longestRun: 28, workSteps: [step("run", 1680, "Run")] }),
  ]),
  createWeek(8, "Get ready.", [
    createSession({ week: 8, run: 1, title: "Thirty-minute rhythm", summary: "Run 30 min continuous", blocks: [["Main set", "Run 30 min continuous"]], longestRun: 30, workSteps: [step("run", 1800, "Run")] }),
    createSession({ week: 8, run: 2, title: "Distance confidence", summary: "Run 30 min continuous", blocks: [["Main set", "Run 30 min continuous"]], longestRun: 30, workSteps: [step("run", 1800, "Run")] }),
    createSession({ week: 8, run: 3, title: "Almost there", summary: "Run 32 min continuous", blocks: [["Main set", "Run 32 min continuous"]], longestRun: 32, workSteps: [step("run", 1920, "Run")] }),
  ]),
  createWeek(9, "Run your 5K.", [
    createSession({ week: 9, run: 1, title: "Dress rehearsal", summary: "Run 30 min continuous", blocks: [["Main set", "Run 30 min continuous"]], longestRun: 30, workSteps: [step("run", 1800, "Run")] }),
    createSession({ week: 9, run: 2, title: "Light sharpen", summary: "Run 20 min continuous", blocks: [["Main set", "Run 20 min continuous"]], longestRun: 20, workSteps: [step("run", 1200, "Run")] }),
    createSession({ week: 9, run: 3, title: "Run your 5K", summary: "Run the full 5K", blocks: [["Main event", "Run 5K continuous"]], longestRun: 35, workSteps: [step("run", 2100, "Run 5K")], isFinal: true }),
  ]),
];

const veryNewToRunningPlan = [
  createWeek(1, "Learn the rhythm.", [
    createSession({ week: 1, run: 1, title: "Walk-first starter", summary: "Run 30 sec, walk 90 sec x8", blocks: [["Main set", "Run 30 sec / Walk 90 sec x8"]], longestRun: 1, workSteps: repeatPairs(8, 30, 90) }),
    createSession({ week: 1, run: 2, title: "Keep it easy", summary: "Run 30 sec, walk 90 sec x8", blocks: [["Main set", "Run 30 sec / Walk 90 sec x8"]], longestRun: 1, workSteps: repeatPairs(8, 30, 90) }),
    createSession({ week: 1, run: 3, title: "Another easy win", summary: "Run 30 sec, walk 90 sec x8", blocks: [["Main set", "Run 30 sec / Walk 90 sec x8"]], longestRun: 1, workSteps: repeatPairs(8, 30, 90) }),
  ]),
  createWeek(2, "Build comfort.", [
    createSession({ week: 2, run: 1, title: "Light pickups", summary: "Run 45 sec, walk 90 sec x8", blocks: [["Main set", "Run 45 sec / Walk 90 sec x8"]], longestRun: 1, workSteps: repeatPairs(8, 45, 90) }),
    createSession({ week: 2, run: 2, title: "Stay relaxed", summary: "Run 45 sec, walk 90 sec x8", blocks: [["Main set", "Run 45 sec / Walk 90 sec x8"]], longestRun: 1, workSteps: repeatPairs(8, 45, 90) }),
    createSession({ week: 2, run: 3, title: "Comfort first", summary: "Run 45 sec, walk 90 sec x8", blocks: [["Main set", "Run 45 sec / Walk 90 sec x8"]], longestRun: 1, workSteps: repeatPairs(8, 45, 90) }),
  ]),
  createWeek(3, "Introduce longer efforts.", [
    createSession({ week: 3, run: 1, title: "One-minute rhythm", summary: "Run 60 sec, walk 90 sec x8", blocks: [["Main set", "Run 60 sec / Walk 90 sec x8"]], longestRun: 1, workSteps: repeatPairs(8, 60, 90) }),
    createSession({ week: 3, run: 2, title: "Steady repeats", summary: "Run 60 sec, walk 90 sec x8", blocks: [["Main set", "Run 60 sec / Walk 90 sec x8"]], longestRun: 1, workSteps: repeatPairs(8, 60, 90) }),
    createSession({ week: 3, run: 3, title: "Keep moving", summary: "Run 60 sec, walk 90 sec x8", blocks: [["Main set", "Run 60 sec / Walk 90 sec x8"]], longestRun: 1, workSteps: repeatPairs(8, 60, 90) }),
  ]),
  createWeek(4, "Settle into routine.", [
    createSession({ week: 4, run: 1, title: "Longer minute", summary: "Run 75 sec, walk 90 sec x7", blocks: [["Main set", "Run 75 sec / Walk 90 sec x7"]], longestRun: 2, workSteps: repeatPairs(7, 75, 90) }),
    createSession({ week: 4, run: 2, title: "Relaxed build", summary: "Run 75 sec, walk 90 sec x7", blocks: [["Main set", "Run 75 sec / Walk 90 sec x7"]], longestRun: 2, workSteps: repeatPairs(7, 75, 90) }),
    createSession({ week: 4, run: 3, title: "Hold the habit", summary: "Run 75 sec, walk 90 sec x7", blocks: [["Main set", "Run 75 sec / Walk 90 sec x7"]], longestRun: 2, workSteps: repeatPairs(7, 75, 90) }),
  ]),
  createWeek(5, "Step forward.", [
    createSession({ week: 5, run: 1, title: "Two-minute confidence", summary: "Run 90 sec, walk 2 min x6", blocks: [["Main set", "Run 90 sec / Walk 2 min x6"]], longestRun: 2, workSteps: repeatPairs(6, 90, 120) }),
    createSession({ week: 5, run: 2, title: "Stay calm", summary: "Run 90 sec, walk 2 min x6", blocks: [["Main set", "Run 90 sec / Walk 2 min x6"]], longestRun: 2, workSteps: repeatPairs(6, 90, 120) }),
    createSession({ week: 5, run: 3, title: "Keep the rhythm", summary: "Run 90 sec, walk 2 min x6", blocks: [["Main set", "Run 90 sec / Walk 2 min x6"]], longestRun: 2, workSteps: repeatPairs(6, 90, 120) }),
  ]),
  createWeek(6, "Touch three minutes.", [
    createSession({ week: 6, run: 1, title: "Three-minute intro", summary: "Run 90 sec, 3 min run, repeat twice", blocks: [["Round 1", "Run 90 sec / Walk 90 sec / Run 3 min / Walk 3 min"], ["Round 2", "Repeat once"]], longestRun: 3, workSteps: [step("run", 90, "Run"), step("walk", 90, "Walk"), step("run", 180, "Run"), step("walk", 180, "Walk"), step("run", 90, "Run"), step("walk", 90, "Walk"), step("run", 180, "Run"), step("walk", 180, "Walk")] }),
    createSession({ week: 6, run: 2, title: "Confidence builder", summary: "Run 90 sec, 3 min run, repeat twice", blocks: [["Round 1", "Run 90 sec / Walk 90 sec / Run 3 min / Walk 3 min"], ["Round 2", "Repeat once"]], longestRun: 3, workSteps: [step("run", 90, "Run"), step("walk", 90, "Walk"), step("run", 180, "Run"), step("walk", 180, "Walk"), step("run", 90, "Run"), step("walk", 90, "Walk"), step("run", 180, "Run"), step("walk", 180, "Walk")] }),
    createSession({ week: 6, run: 3, title: "Stay consistent", summary: "Run 90 sec, 3 min run, repeat twice", blocks: [["Round 1", "Run 90 sec / Walk 90 sec / Run 3 min / Walk 3 min"], ["Round 2", "Repeat once"]], longestRun: 3, workSteps: [step("run", 90, "Run"), step("walk", 90, "Walk"), step("run", 180, "Run"), step("walk", 180, "Walk"), step("run", 90, "Run"), step("walk", 90, "Walk"), step("run", 180, "Run"), step("walk", 180, "Walk")] }),
  ]),
];

const returnToRunningPlan = [
  createWeek(1, "Restart smoothly.", [
    createSession({ week: 1, run: 1, title: "Back in motion", summary: "Run 3 min, walk 90 sec, run 5 min, repeat twice", blocks: [["Round 1", "Run 3 min / Walk 90 sec / Run 5 min / Walk 2.5 min"], ["Round 2", "Repeat once"]], longestRun: 5, workSteps: [step("run", 180, "Run"), step("walk", 90, "Walk"), step("run", 300, "Run"), step("walk", 150, "Walk"), step("run", 180, "Run"), step("walk", 90, "Walk"), step("run", 300, "Run"), step("walk", 150, "Walk")] }),
    createSession({ week: 1, run: 2, title: "Find your stride", summary: "Run 3 min, walk 90 sec, run 5 min, repeat twice", blocks: [["Round 1", "Run 3 min / Walk 90 sec / Run 5 min / Walk 2.5 min"], ["Round 2", "Repeat once"]], longestRun: 5, workSteps: [step("run", 180, "Run"), step("walk", 90, "Walk"), step("run", 300, "Run"), step("walk", 150, "Walk"), step("run", 180, "Run"), step("walk", 90, "Walk"), step("run", 300, "Run"), step("walk", 150, "Walk")] }),
    createSession({ week: 1, run: 3, title: "Stay patient", summary: "Run 3 min, walk 90 sec, run 5 min, repeat twice", blocks: [["Round 1", "Run 3 min / Walk 90 sec / Run 5 min / Walk 2.5 min"], ["Round 2", "Repeat once"]], longestRun: 5, workSteps: [step("run", 180, "Run"), step("walk", 90, "Walk"), step("run", 300, "Run"), step("walk", 150, "Walk"), step("run", 180, "Run"), step("walk", 90, "Walk"), step("run", 300, "Run"), step("walk", 150, "Walk")] }),
  ]),
  createWeek(2, "Rebuild range.", [
    createSession({ week: 2, run: 1, title: "Five-minute repeats", summary: "Run 5 min, walk 3 min x3", blocks: [["Main set", "Run 5 min / Walk 3 min x3"]], longestRun: 5, workSteps: repeatPairs(3, 300, 180) }),
    createSession({ week: 2, run: 2, title: "Controlled eight", summary: "Run 8 min, walk 5 min, run 8 min", blocks: [["Main set", "Run 8 min / Walk 5 min / Run 8 min"]], longestRun: 8, workSteps: [step("run", 480, "Run"), step("walk", 300, "Walk"), step("run", 480, "Run")] }),
    createSession({ week: 2, run: 3, title: "Twenty-minute check-in", summary: "Run 20 min continuous", blocks: [["Main set", "Run 20 min continuous"]], longestRun: 20, workSteps: [step("run", 1200, "Run")] }),
  ]),
  createWeek(3, "Bring back continuity.", [
    createSession({ week: 3, run: 1, title: "Back it up", summary: "5 min run, 8 min run, 5 min run", blocks: [["Main set", "Run 5 min / Walk 3 min / Run 8 min / Walk 3 min / Run 5 min"]], longestRun: 8, workSteps: [step("run", 300, "Run"), step("walk", 180, "Walk"), step("run", 480, "Run"), step("walk", 180, "Walk"), step("run", 300, "Run")] }),
    createSession({ week: 3, run: 2, title: "Long calm run", summary: "Run 22 min continuous", blocks: [["Main set", "Run 22 min continuous"]], longestRun: 22, workSteps: [step("run", 1320, "Run")] }),
    createSession({ week: 3, run: 3, title: "Hold the line", summary: "Run 25 min continuous", blocks: [["Main set", "Run 25 min continuous"]], longestRun: 25, workSteps: [step("run", 1500, "Run")] }),
  ]),
  createWeek(4, "Settle the engine.", [
    createSession({ week: 4, run: 1, title: "Cruise control", summary: "Run 25 min continuous", blocks: [["Main set", "Run 25 min continuous"]], longestRun: 25, workSteps: [step("run", 1500, "Run")] }),
    createSession({ week: 4, run: 2, title: "Stay conversational", summary: "Run 28 min continuous", blocks: [["Main set", "Run 28 min continuous"]], longestRun: 28, workSteps: [step("run", 1680, "Run")] }),
    createSession({ week: 4, run: 3, title: "Strong finish", summary: "Run 28 min continuous", blocks: [["Main set", "Run 28 min continuous"]], longestRun: 28, workSteps: [step("run", 1680, "Run")] }),
  ]),
  createWeek(5, "Reach race shape.", [
    createSession({ week: 5, run: 1, title: "Thirty-minute rhythm", summary: "Run 30 min continuous", blocks: [["Main set", "Run 30 min continuous"]], longestRun: 30, workSteps: [step("run", 1800, "Run")] }),
    createSession({ week: 5, run: 2, title: "Distance confidence", summary: "Run 30 min continuous", blocks: [["Main set", "Run 30 min continuous"]], longestRun: 30, workSteps: [step("run", 1800, "Run")] }),
    createSession({ week: 5, run: 3, title: "Almost there", summary: "Run 32 min continuous", blocks: [["Main set", "Run 32 min continuous"]], longestRun: 32, workSteps: [step("run", 1920, "Run")] }),
  ]),
  createWeek(6, "Run your 5K.", [
    createSession({ week: 6, run: 1, title: "Dress rehearsal", summary: "Run 30 min continuous", blocks: [["Main set", "Run 30 min continuous"]], longestRun: 30, workSteps: [step("run", 1800, "Run")] }),
    createSession({ week: 6, run: 2, title: "Light sharpen", summary: "Run 20 min continuous", blocks: [["Main set", "Run 20 min continuous"]], longestRun: 20, workSteps: [step("run", 1200, "Run")] }),
    createSession({ week: 6, run: 3, title: "Run your 5K", summary: "Run the full 5K", blocks: [["Main event", "Run 5K continuous"]], longestRun: 35, workSteps: [step("run", 2100, "Run 5K")], isFinal: true }),
  ]),
];

const returnToThirtyPlan = [
  createWeek(1, "Restart with comfort.", [
    createSession({ week: 1, run: 1, title: "Back to easy running", summary: "Run 20 min continuous", blocks: [["Main set", "Run 20 min continuous"]], longestRun: 20, workSteps: [step("run", 1200, "Easy run")] }),
    createSession({ week: 1, run: 2, title: "Steady 22", summary: "Run 22 min continuous", blocks: [["Main set", "Run 22 min continuous"]], longestRun: 22, workSteps: [step("run", 1320, "Easy run")] }),
    createSession({ week: 1, run: 3, title: "Steady 24", summary: "Run 24 min continuous", blocks: [["Main set", "Run 24 min continuous"]], longestRun: 24, workSteps: [step("run", 1440, "Easy run")] }),
  ]),
  createWeek(2, "Let it feel normal again.", [
    createSession({ week: 2, run: 1, title: "Easy 24", summary: "Run 24 min continuous", blocks: [["Main set", "Run 24 min continuous"]], longestRun: 24, workSteps: [step("run", 1440, "Easy run")] }),
    createSession({ week: 2, run: 2, title: "Steady 26", summary: "Run 26 min continuous", blocks: [["Main set", "Run 26 min continuous"]], longestRun: 26, workSteps: [step("run", 1560, "Easy run")] }),
    createSession({ week: 2, run: 3, title: "Steady 28", summary: "Run 28 min continuous", blocks: [["Main set", "Run 28 min continuous"]], longestRun: 28, workSteps: [step("run", 1680, "Easy run")] }),
  ]),
  createWeek(3, "Reach the 30-minute mark.", [
    createSession({ week: 3, run: 1, title: "Easy 28", summary: "Run 28 min continuous", blocks: [["Main set", "Run 28 min continuous"]], longestRun: 28, workSteps: [step("run", 1680, "Easy run")] }),
    createSession({ week: 3, run: 2, title: "Thirty-minute rhythm", summary: "Run 30 min continuous", blocks: [["Main set", "Run 30 min continuous"]], longestRun: 30, workSteps: [step("run", 1800, "Easy run")] }),
    createSession({ week: 3, run: 3, title: "Hold 30", summary: "Run 30 min continuous", blocks: [["Main set", "Run 30 min continuous"]], longestRun: 30, workSteps: [step("run", 1800, "Easy run")] }),
  ]),
  createWeek(4, "Lock it in.", [
    createSession({ week: 4, run: 1, title: "Thirty-minute ease", summary: "Run 30 min continuous", blocks: [["Main set", "Run 30 min continuous"]], longestRun: 30, workSteps: [step("run", 1800, "Easy run")] }),
    createSession({ week: 4, run: 2, title: "Easy 32", summary: "Run 32 min continuous", blocks: [["Main set", "Run 32 min continuous"]], longestRun: 32, workSteps: [step("run", 1920, "Easy run")] }),
    createSession({ week: 4, run: 3, title: "Comfortable finish", summary: "Run 30 min continuous", blocks: [["Main set", "Run 30 min continuous"]], longestRun: 30, workSteps: [step("run", 1800, "Easy run")], isFinal: true }),
  ]),
];

const comfortableFiveKPlan = [
  createWeek(1, "Sharpen without overdoing it.", [
    createSession({ week: 1, run: 1, title: "Easy reset", summary: "Run 24 min easy", blocks: [["Main set", "Run 24 min easy"]], longestRun: 24, workSteps: [step("run", 1440, "Easy run")] }),
    createSession({ week: 1, run: 2, title: "5K rhythm", summary: "4 x 4 min steady with 2 min walk", blocks: [["Main set", "4 x 4 min steady / 2 min walk"]], longestRun: 4, workSteps: repeatPairs(4, 240, 120, "Steady run", "Walk reset") }),
    createSession({ week: 1, run: 3, title: "Long easy", summary: "Run 32 min easy", blocks: [["Main set", "Run 32 min easy"]], longestRun: 32, workSteps: [step("run", 1920, "Easy run")] }),
  ]),
  createWeek(2, "Bring back efficiency.", [
    createSession({ week: 2, run: 1, title: "Easy 26", summary: "Run 26 min easy", blocks: [["Main set", "Run 26 min easy"]], longestRun: 26, workSteps: [step("run", 1560, "Easy run")] }),
    createSession({ week: 2, run: 2, title: "Steady ladder", summary: "5 min, 8 min, 5 min steady with 2 min walk", blocks: [["Main set", "5 min / 8 min / 5 min steady with 2 min walk"]], longestRun: 8, workSteps: [step("run", 300, "Steady run"), step("walk", 120, "Walk reset"), step("run", 480, "Steady run"), step("walk", 120, "Walk reset"), step("run", 300, "Steady run")] }),
    createSession({ week: 2, run: 3, title: "Long easy", summary: "Run 34 min easy", blocks: [["Main set", "Run 34 min easy"]], longestRun: 34, workSteps: [step("run", 2040, "Easy run")] }),
  ]),
  createWeek(3, "Freshen up.", [
    createSession({ week: 3, run: 1, title: "Easy 22", summary: "Run 22 min easy", blocks: [["Main set", "Run 22 min easy"]], longestRun: 22, workSteps: [step("run", 1320, "Easy run")] }),
    createSession({ week: 3, run: 2, title: "Quick opener", summary: "6 x 60 sec strong with 90 sec easy jog", blocks: [["Main set", "6 x 60 sec strong / 90 sec easy"]], longestRun: 1, workSteps: repeatPairs(6, 60, 90, "Strong run", "Easy jog") }),
    createSession({ week: 3, run: 3, title: "Easy float", summary: "Run 28 min easy", blocks: [["Main set", "Run 28 min easy"]], longestRun: 28, workSteps: [step("run", 1680, "Easy run")] }),
  ]),
  createWeek(4, "Run your 5K.", [
    createSession({ week: 4, run: 1, title: "Easy 20", summary: "Run 20 min easy", blocks: [["Main set", "Run 20 min easy"]], longestRun: 20, workSteps: [step("run", 1200, "Easy run")] }),
    createSession({ week: 4, run: 2, title: "Race cue", summary: "4 x 60 sec steady with 90 sec walk", blocks: [["Main set", "4 x 60 sec steady / 90 sec walk"]], longestRun: 1, workSteps: repeatPairs(4, 60, 90, "Steady run", "Walk reset") }),
    createSession({ week: 4, run: 3, title: "Controlled 5K", summary: "Run a comfortable, controlled 5K", blocks: [["Main event", "Run a controlled 5K"]], longestRun: 35, workSteps: [step("run", 2100, "Run 5K")], isFinal: true }),
  ]),
];

const improve5kPlan = [
  createWeek(1, "Reset and sharpen.", [
    createSession({ week: 1, run: 1, title: "Easy reset", summary: "Run 24 min easy", blocks: [["Main set", "Run 24 min easy"]], longestRun: 24, workSteps: [step("run", 1440, "Easy run")] }),
    createSession({ week: 1, run: 2, title: "Speed touch", summary: "6 x 2 min strong with 90 sec easy jog", blocks: [["Main set", "6 x 2 min strong / 90 sec easy"]], longestRun: 2, workSteps: repeatPairs(6, 120, 90, "Strong run", "Easy jog") }),
    createSession({ week: 1, run: 3, title: "Long easy", summary: "Run 32 min easy", blocks: [["Main set", "Run 32 min easy"]], longestRun: 32, workSteps: [step("run", 1920, "Easy run")] }),
  ]),
  createWeek(2, "Build speed control.", [
    createSession({ week: 2, run: 1, title: "Easy float", summary: "Run 26 min easy", blocks: [["Main set", "Run 26 min easy"]], longestRun: 26, workSteps: [step("run", 1560, "Easy run")] }),
    createSession({ week: 2, run: 2, title: "Tempo steps", summary: "3 x 6 min steady with 2 min walk", blocks: [["Main set", "3 x 6 min steady / 2 min walk"]], longestRun: 6, workSteps: repeatPairs(3, 360, 120, "Steady run", "Walk reset") }),
    createSession({ week: 2, run: 3, title: "Long easy", summary: "Run 34 min easy", blocks: [["Main set", "Run 34 min easy"]], longestRun: 34, workSteps: [step("run", 2040, "Easy run")] }),
  ]),
  createWeek(3, "Hold quality.", [
    createSession({ week: 3, run: 1, title: "Easy support", summary: "Run 26 min easy", blocks: [["Main set", "Run 26 min easy"]], longestRun: 26, workSteps: [step("run", 1560, "Easy run")] }),
    createSession({ week: 3, run: 2, title: "Short intervals", summary: "8 x 90 sec fast with 90 sec easy jog", blocks: [["Main set", "8 x 90 sec fast / 90 sec easy"]], longestRun: 2, workSteps: repeatPairs(8, 90, 90, "Fast run", "Easy jog") }),
    createSession({ week: 3, run: 3, title: "Long easy", summary: "Run 36 min easy", blocks: [["Main set", "Run 36 min easy"]], longestRun: 36, workSteps: [step("run", 2160, "Easy run")] }),
  ]),
  createWeek(4, "Stay efficient.", [
    createSession({ week: 4, run: 1, title: "Easy run", summary: "Run 28 min easy", blocks: [["Main set", "Run 28 min easy"]], longestRun: 28, workSteps: [step("run", 1680, "Easy run")] }),
    createSession({ week: 4, run: 2, title: "Tempo ladder", summary: "5 min, 8 min, 5 min steady with 2 min walk", blocks: [["Main set", "5 min / 8 min / 5 min steady with 2 min walk"]], longestRun: 8, workSteps: [step("run", 300, "Steady run"), step("walk", 120, "Walk reset"), step("run", 480, "Steady run"), step("walk", 120, "Walk reset"), step("run", 300, "Steady run")] }),
    createSession({ week: 4, run: 3, title: "Long easy", summary: "Run 38 min easy", blocks: [["Main set", "Run 38 min easy"]], longestRun: 38, workSteps: [step("run", 2280, "Easy run")] }),
  ]),
  createWeek(5, "Sharpen the edge.", [
    createSession({ week: 5, run: 1, title: "Easy support", summary: "Run 24 min easy", blocks: [["Main set", "Run 24 min easy"]], longestRun: 24, workSteps: [step("run", 1440, "Easy run")] }),
    createSession({ week: 5, run: 2, title: "Race rhythm", summary: "5 x 3 min strong with 90 sec easy jog", blocks: [["Main set", "5 x 3 min strong / 90 sec easy"]], longestRun: 3, workSteps: repeatPairs(5, 180, 90, "Strong run", "Easy jog") }),
    createSession({ week: 5, run: 3, title: "Long easy", summary: "Run 32 min easy", blocks: [["Main set", "Run 32 min easy"]], longestRun: 32, workSteps: [step("run", 1920, "Easy run")] }),
  ]),
  createWeek(6, "Run stronger.", [
    createSession({ week: 6, run: 1, title: "Freshen up", summary: "Run 20 min easy", blocks: [["Main set", "Run 20 min easy"]], longestRun: 20, workSteps: [step("run", 1200, "Easy run")] }),
    createSession({ week: 6, run: 2, title: "Quick opener", summary: "6 x 60 sec fast with 90 sec easy jog", blocks: [["Main set", "6 x 60 sec fast / 90 sec easy"]], longestRun: 1, workSteps: repeatPairs(6, 60, 90, "Fast run", "Easy jog") }),
    createSession({ week: 6, run: 3, title: "5K effort", summary: "Run a stronger controlled 5K", blocks: [["Main event", "Run a hard but controlled 5K"]], longestRun: 35, workSteps: [step("run", 2100, "Run 5K")], isFinal: true }),
  ]),
];

const tenKPlan = [
  createWeek(1, "Build from your 5K base.", [
    createSession({ week: 1, run: 1, title: "Easy 30", summary: "Run 30 min easy", blocks: [["Main set", "Run 30 min easy"]], longestRun: 30, workSteps: [step("run", 1800, "Easy run")] }),
    createSession({ week: 1, run: 2, title: "Steady 24", summary: "Run 24 min steady", blocks: [["Main set", "Run 24 min steady"]], longestRun: 24, workSteps: [step("run", 1440, "Steady run")] }),
    createSession({ week: 1, run: 3, title: "Long 38", summary: "Run 38 min easy", blocks: [["Main set", "Run 38 min easy"]], longestRun: 38, workSteps: [step("run", 2280, "Long easy run")] }),
  ]),
  createWeek(2, "Stretch the long run.", [
    createSession({ week: 2, run: 1, title: "Easy 30", summary: "Run 30 min easy", blocks: [["Main set", "Run 30 min easy"]], longestRun: 30, workSteps: [step("run", 1800, "Easy run")] }),
    createSession({ week: 2, run: 2, title: "Steady 26", summary: "Run 26 min steady", blocks: [["Main set", "Run 26 min steady"]], longestRun: 26, workSteps: [step("run", 1560, "Steady run")] }),
    createSession({ week: 2, run: 3, title: "Long 42", summary: "Run 42 min easy", blocks: [["Main set", "Run 42 min easy"]], longestRun: 42, workSteps: [step("run", 2520, "Long easy run")] }),
  ]),
  createWeek(3, "Hold the aerobic work.", [
    createSession({ week: 3, run: 1, title: "Easy 32", summary: "Run 32 min easy", blocks: [["Main set", "Run 32 min easy"]], longestRun: 32, workSteps: [step("run", 1920, "Easy run")] }),
    createSession({ week: 3, run: 2, title: "Steady 28", summary: "Run 28 min steady", blocks: [["Main set", "Run 28 min steady"]], longestRun: 28, workSteps: [step("run", 1680, "Steady run")] }),
    createSession({ week: 3, run: 3, title: "Long 45", summary: "Run 45 min easy", blocks: [["Main set", "Run 45 min easy"]], longestRun: 45, workSteps: [step("run", 2700, "Long easy run")] }),
  ]),
  createWeek(4, "Add some rhythm.", [
    createSession({ week: 4, run: 1, title: "Easy 30", summary: "Run 30 min easy", blocks: [["Main set", "Run 30 min easy"]], longestRun: 30, workSteps: [step("run", 1800, "Easy run")] }),
    createSession({ week: 4, run: 2, title: "Tempo steps", summary: "3 x 8 min steady with 2 min walk", blocks: [["Main set", "3 x 8 min steady / 2 min walk"]], longestRun: 8, workSteps: repeatPairs(3, 480, 120, "Steady run", "Walk reset") }),
    createSession({ week: 4, run: 3, title: "Long 48", summary: "Run 48 min easy", blocks: [["Main set", "Run 48 min easy"]], longestRun: 48, workSteps: [step("run", 2880, "Long easy run")] }),
  ]),
  createWeek(5, "Keep building.", [
    createSession({ week: 5, run: 1, title: "Easy 32", summary: "Run 32 min easy", blocks: [["Main set", "Run 32 min easy"]], longestRun: 32, workSteps: [step("run", 1920, "Easy run")] }),
    createSession({ week: 5, run: 2, title: "Steady 30", summary: "Run 30 min steady", blocks: [["Main set", "Run 30 min steady"]], longestRun: 30, workSteps: [step("run", 1800, "Steady run")] }),
    createSession({ week: 5, run: 3, title: "Long 52", summary: "Run 52 min easy", blocks: [["Main set", "Run 52 min easy"]], longestRun: 52, workSteps: [step("run", 3120, "Long easy run")] }),
  ]),
  createWeek(6, "Absorb the work.", [
    createSession({ week: 6, run: 1, title: "Easy 28", summary: "Run 28 min easy", blocks: [["Main set", "Run 28 min easy"]], longestRun: 28, workSteps: [step("run", 1680, "Easy run")] }),
    createSession({ week: 6, run: 2, title: "Cruise blocks", summary: "4 x 6 min steady with 90 sec walk", blocks: [["Main set", "4 x 6 min steady / 90 sec walk"]], longestRun: 6, workSteps: repeatPairs(4, 360, 90, "Steady run", "Walk reset") }),
    createSession({ week: 6, run: 3, title: "Long 46", summary: "Run 46 min easy", blocks: [["Main set", "Run 46 min easy"]], longestRun: 46, workSteps: [step("run", 2760, "Long easy run")] }),
  ]),
  createWeek(7, "Push the range.", [
    createSession({ week: 7, run: 1, title: "Easy 34", summary: "Run 34 min easy", blocks: [["Main set", "Run 34 min easy"]], longestRun: 34, workSteps: [step("run", 2040, "Easy run")] }),
    createSession({ week: 7, run: 2, title: "Steady 32", summary: "Run 32 min steady", blocks: [["Main set", "Run 32 min steady"]], longestRun: 32, workSteps: [step("run", 1920, "Steady run")] }),
    createSession({ week: 7, run: 3, title: "Long 56", summary: "Run 56 min easy", blocks: [["Main set", "Run 56 min easy"]], longestRun: 56, workSteps: [step("run", 3360, "Long easy run")] }),
  ]),
  createWeek(8, "Hold your calm pace.", [
    createSession({ week: 8, run: 1, title: "Easy 34", summary: "Run 34 min easy", blocks: [["Main set", "Run 34 min easy"]], longestRun: 34, workSteps: [step("run", 2040, "Easy run")] }),
    createSession({ week: 8, run: 2, title: "Tempo 24", summary: "2 x 12 min steady with 3 min walk", blocks: [["Main set", "2 x 12 min steady / 3 min walk"]], longestRun: 12, workSteps: repeatPairs(2, 720, 180, "Steady run", "Walk reset") }),
    createSession({ week: 8, run: 3, title: "Long 60", summary: "Run 60 min easy", blocks: [["Main set", "Run 60 min easy"]], longestRun: 60, workSteps: [step("run", 3600, "Long easy run")] }),
  ]),
  createWeek(9, "Stay consistent.", [
    createSession({ week: 9, run: 1, title: "Easy 32", summary: "Run 32 min easy", blocks: [["Main set", "Run 32 min easy"]], longestRun: 32, workSteps: [step("run", 1920, "Easy run")] }),
    createSession({ week: 9, run: 2, title: "Steady 34", summary: "Run 34 min steady", blocks: [["Main set", "Run 34 min steady"]], longestRun: 34, workSteps: [step("run", 2040, "Steady run")] }),
    createSession({ week: 9, run: 3, title: "Long 62", summary: "Run 62 min easy", blocks: [["Main set", "Run 62 min easy"]], longestRun: 62, workSteps: [step("run", 3720, "Long easy run")] }),
  ]),
  createWeek(10, "Fresh but strong.", [
    createSession({ week: 10, run: 1, title: "Easy 30", summary: "Run 30 min easy", blocks: [["Main set", "Run 30 min easy"]], longestRun: 30, workSteps: [step("run", 1800, "Easy run")] }),
    createSession({ week: 10, run: 2, title: "Cruise 24", summary: "3 x 8 min steady with 2 min walk", blocks: [["Main set", "3 x 8 min steady / 2 min walk"]], longestRun: 8, workSteps: repeatPairs(3, 480, 120, "Steady run", "Walk reset") }),
    createSession({ week: 10, run: 3, title: "Long 58", summary: "Run 58 min easy", blocks: [["Main set", "Run 58 min easy"]], longestRun: 58, workSteps: [step("run", 3480, "Long easy run")] }),
  ]),
  createWeek(11, "Ease into race shape.", [
    createSession({ week: 11, run: 1, title: "Easy 28", summary: "Run 28 min easy", blocks: [["Main set", "Run 28 min easy"]], longestRun: 28, workSteps: [step("run", 1680, "Easy run")] }),
    createSession({ week: 11, run: 2, title: "Steady 20", summary: "Run 20 min steady", blocks: [["Main set", "Run 20 min steady"]], longestRun: 20, workSteps: [step("run", 1200, "Steady run")] }),
    createSession({ week: 11, run: 3, title: "Long 46", summary: "Run 46 min easy", blocks: [["Main set", "Run 46 min easy"]], longestRun: 46, workSteps: [step("run", 2760, "Long easy run")] }),
  ]),
  createWeek(12, "Run your 10K.", [
    createSession({ week: 12, run: 1, title: "Easy 24", summary: "Run 24 min easy", blocks: [["Main set", "Run 24 min easy"]], longestRun: 24, workSteps: [step("run", 1440, "Easy run")] }),
    createSession({ week: 12, run: 2, title: "Quick opener", summary: "6 x 60 sec steady with 90 sec walk", blocks: [["Main set", "6 x 60 sec steady / 90 sec walk"]], longestRun: 1, workSteps: repeatPairs(6, 60, 90, "Steady run", "Walk reset") }),
    createSession({ week: 12, run: 3, title: "Run your 10K", summary: "Run the full 10K", blocks: [["Main event", "Run a controlled 10K"]], longestRun: 70, workSteps: [step("run", 4200, "Run 10K")], isFinal: true }),
  ]),
];

const foundationThirtyPlan = [...veryNewToRunningPlan, ...couchBasePlan.slice(2, 8)];
const beginnerThirtyPlan = couchBasePlan.slice(0, 8);
const foundationFiveKPlan = [...veryNewToRunningPlan, ...couchBasePlan.slice(3)];
const beginnerFiveKPlan = couchBasePlan;
const foundationTenKPlan = [...veryNewToRunningPlan, ...couchBasePlan.slice(5), ...tenKPlan.slice(4)];
const beginnerTenKPlan = [...couchBasePlan.slice(4), ...tenKPlan.slice(3)];
const returnTenKPlan = [...returnToRunningPlan.slice(2), ...tenKPlan.slice(4)];

/** @type {Achievement[]} */
export const achievements = [
  { id: "starter", title: "Started", detail: "Complete your first run.", unlockAt: 1 },
  { id: "week-one", title: "Week 1 done", detail: "Finish your first week.", unlockAt: 3 },
  { id: "ten", title: "10 sessions", detail: "Hit double digits.", unlockAt: 10 },
  { id: "twenty", title: "20 minute run", detail: "Run 20 minutes without stopping.", unlockAt: 15 },
  { id: "runner", title: "Continuous runner", detail: "Build steady non-stop runs.", unlockAt: 20 },
  { id: "finish", title: "Plan complete", detail: "Finish the full plan.", unlockAt: 27 },
];

function buildPresetPlan(profile, plan) {
  const labels = scheduleMaps[profile.weeklyPattern] ?? scheduleMaps["3 runs most weeks"];
  return plan.map((sourceWeek, index) => {
    const displayWeek = index + 1;
    let sessions = sourceWeek.sessions;

    if (profile.weeklyPattern === "2 runs most weeks") {
      sessions = [sourceWeek.sessions[0], sourceWeek.sessions[sourceWeek.sessions.length - 1]];
    }

    if (profile.weeklyPattern === "4 runs most weeks") {
      sessions = [...sourceWeek.sessions, buildOptionalSupportRun(sourceWeek.sessions[0], displayWeek)];
    }

    return {
      week: displayWeek,
      goal: sourceWeek.goal,
      sessions: sessions.map((session, runIndex) => ({
        ...session,
        id: `${displayWeek}-${runIndex + 1}`,
        week: displayWeek,
        dayLabel: labels[runIndex],
        sourceWeek: sourceWeek.week,
        countsTowardPlan: session.countsTowardPlan ?? true,
      })),
    };
  });
}

function buildCustomPlan(profile, plan) {
  const labels = scheduleMaps[profile.weeklyPattern] ?? scheduleMaps["3 runs most weeks"];

  return plan.map((week, index) => {
    const displayWeek = index + 1;
    let sessions = week.sessions;

    if (profile.weeklyPattern === "2 runs most weeks") {
      sessions = [week.sessions[0], week.sessions[week.sessions.length - 1]];
    }

    if (profile.weeklyPattern === "4 runs most weeks") {
      sessions = [...week.sessions, buildOptionalSupportRun(week.sessions[0], displayWeek)];
    }

    return {
      ...week,
      week: displayWeek,
      sessions: sessions.map((session, runIndex) => ({
        ...session,
        id: `${displayWeek}-${runIndex + 1}`,
        week: displayWeek,
        dayLabel: labels[runIndex],
        countsTowardPlan: session.countsTowardPlan ?? true,
      })),
    };
  });
}

function ensureFinalSession(plan) {
  if (plan.some((week) => week.sessions.some((session) => session.isFinal))) {
    return plan;
  }

  return plan.map((week, weekIndex) => ({
    ...week,
    sessions: week.sessions.map((session, sessionIndex, sessions) => ({
      ...session,
      isFinal: weekIndex === plan.length - 1 && sessionIndex === sessions.length - 1,
    })),
  }));
}

export function buildTrainingPlan(profile) {
  let sourcePlan = beginnerFiveKPlan;
  let builder = buildPresetPlan;

  if (profile.goal === "Build to 30 minutes") {
    if (profile.experienceLevel === "Very new to running") {
      sourcePlan = foundationThirtyPlan;
    } else if (profile.experienceLevel === "Getting back into it" || profile.experienceLevel === "Already comfortable at 5K") {
      builder = buildCustomPlan;
      sourcePlan = returnToThirtyPlan;
    } else {
      sourcePlan = beginnerThirtyPlan;
    }
  }

  if (profile.goal === "Finish 5K") {
    if (profile.experienceLevel === "Very new to running") {
      sourcePlan = foundationFiveKPlan;
    } else if (profile.experienceLevel === "Getting back into it") {
      sourcePlan = returnToRunningPlan;
    } else if (profile.experienceLevel === "Already comfortable at 5K") {
      builder = buildCustomPlan;
      sourcePlan = comfortableFiveKPlan;
    } else {
      sourcePlan = beginnerFiveKPlan;
    }
  }

  if (profile.goal === "Run a better 5K") {
    builder = buildCustomPlan;
    sourcePlan = improve5kPlan;
  }

  if (profile.goal === "Build to 10K") {
    if (profile.experienceLevel === "Very new to running") {
      sourcePlan = foundationTenKPlan;
    } else if (profile.experienceLevel === "Beginner") {
      sourcePlan = beginnerTenKPlan;
    } else if (profile.experienceLevel === "Getting back into it") {
      sourcePlan = returnTenKPlan;
    } else {
      builder = buildCustomPlan;
      sourcePlan = tenKPlan;
    }
  }

  return ensureFinalSession(builder(profile, sourcePlan));
}

export function buildRecoveryWeek(weekSessions) {
  const coreSessions = weekSessions.filter((session) => session.countsTowardPlan !== false);

  return coreSessions.map((session, index) => {
    const scaledSteps = session.steps.slice(1, -1).map((item) => {
      if (item.type === "run") {
        return step("run", Math.max(45, Math.round(item.seconds * 0.65)), "Easy run");
      }

      return step("walk", Math.max(60, Math.round(item.seconds * 1.15)), "Walk reset");
    });

    const longestRunSeconds = Math.max(60, ...scaledSteps.filter((item) => item.type === "run").map((item) => item.seconds));

    return createSession({
      week: session.week,
      run: index + 1,
      title: `Recovery reset ${index + 1}`,
      summary: `Lighter version of ${session.dayLabel ?? `Run ${session.run}`} so you can recover without losing rhythm.`,
      blocks: [
        ["Based on", session.title],
        ["Why", "Shorter running blocks and more reset time to help you absorb training"],
      ],
      longestRun: Math.round(longestRunSeconds / 60),
      workSteps: scaledSteps,
    });
  });
}

export function getPlanMilestones(profile) {
  if (profile.goal === "Build to 10K") {
    return [
      { id: "thirty", label: "30 minute run", minutes: 30 },
      { id: "forty", label: "40 minute run", minutes: 40 },
      { id: "fifty", label: "50 minute run", minutes: 50 },
      { id: "sixty", label: "60 minute run", minutes: 60 },
      { id: "tenk", label: "10K ready", minutes: 70 },
    ];
  }

  if (profile.goal === "Run a better 5K") {
    return [
      { id: "twenty", label: "20 minute run", minutes: 20 },
      { id: "thirty", label: "30 minute run", minutes: 30 },
      { id: "tempo", label: "Tempo control", minutes: 34 },
      { id: "race", label: "Stronger 5K", minutes: 35 },
    ];
  }

  if (profile.goal === "Build to 30 minutes") {
    return [
      { id: "one", label: "First run minute", minutes: 1 },
      { id: "five", label: "5 minute run", minutes: 5 },
      { id: "ten", label: "10 minute run", minutes: 10 },
      { id: "twenty", label: "20 minute run", minutes: 20 },
      { id: "thirty", label: "30 minute run", minutes: 30 },
    ];
  }

  return [
    { id: "warmup", label: "Getting started", minutes: 1 },
    { id: "five", label: "5 minute run", minutes: 5 },
    { id: "ten", label: "10 minute run", minutes: 10 },
    { id: "twenty", label: "20 minute run", minutes: 20 },
    { id: "thirty", label: "30 minute run", minutes: 30 },
    { id: "finish", label: "5K ready", minutes: 35 },
  ];
}

export function getPlanLabel(profile) {
  if (profile.goal === "Build to 30 minutes") {
    return profile.experienceLevel === "Very new to running" ? "Foundation plan" : profile.experienceLevel === "Beginner" ? "30-minute build" : "Return plan";
  }

  if (profile.goal === "Finish 5K") {
    if (profile.experienceLevel === "Very new to running") return "Foundation to 5K";
    if (profile.experienceLevel === "Getting back into it") return "Return-to-running plan";
    if (profile.experienceLevel === "Already comfortable at 5K") return "5K sharpen-up";
    return "First 5K plan";
  }

  if (profile.goal === "Run a better 5K") {
    return "5K improvement plan";
  }

  if (profile.goal === "Build to 10K") {
    if (profile.experienceLevel === "Very new to running") return "Foundation to 10K";
    if (profile.experienceLevel === "Beginner") return "First 10K plan";
    if (profile.experienceLevel === "Getting back into it") return "Return-to-10K plan";
    return "10K build";
  }

  return "First 5K plan";
}

export const roadTo5KMilestones = getPlanMilestones({
  experienceLevel: "Beginner",
  goal: "Finish 5K",
  weeklyPattern: "3 runs most weeks",
});

export const trainingPlan = buildTrainingPlan({
  experienceLevel: "Beginner",
  goal: "Finish 5K",
  weeklyPattern: "3 runs most weeks",
  cueMode: "Sound + vibration",
  darkMode: false,
  reminderEnabled: false,
  reminderTime: "18:30",
});
