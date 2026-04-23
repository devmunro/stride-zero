/** @typedef {import("../types/models").Achievement} Achievement */
/** @typedef {import("../types/models").Profile} Profile */
/** @typedef {import("../types/models").Session} Session */

/**
 * Creates a single timed workout step.
 *
 * @param {string} type Step type such as run or walk
 * @param {number} seconds Duration in seconds
 * @param {string} label Display label
 * @returns {{type: string, seconds: number, label: string}} Workout step
 */
function step(type, seconds, label) {
  return { type, seconds, label };
}

/**
 * Builds alternating run and walk steps for repeated intervals.
 *
 * @param {number} reps Number of run/walk pairs
 * @param {number} runSeconds Run duration in seconds
 * @param {number} walkSeconds Walk duration in seconds
 * @param {string} [runLabel="Run"] Label for run steps
 * @param {string} [walkLabel="Walk"] Label for walk steps
 * @returns {Object[]} Interval steps
 */
function repeatPairs(reps, runSeconds, walkSeconds, runLabel = "Run", walkLabel = "Walk") {
  const steps = [];
  for (let index = 0; index < reps; index += 1) {
    steps.push(step("run", runSeconds, runLabel));
    steps.push(step("walk", walkSeconds, walkLabel));
  }
  return steps;
}

/**
 * Creates a normalized workout session record.
 *
 * @param {Object} config Session configuration
 * @param {number} config.week Source week number
 * @param {number} config.run Run number within the week
 * @param {string} config.title Session title
 * @param {string} config.summary Short session summary
 * @param {Array[]} config.blocks Readable workout blocks for the UI
 * @param {number} config.longestRun Longest continuous run in minutes
 * @param {Object[]} config.workSteps Timed workout steps excluding warm up and cool down
 * @param {boolean} [config.isFinal=false] Whether this is the final 5K session
 * @returns {Session} Session object
 */
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

/**
 * Creates a training week wrapper.
 *
 * @param {number} week Week number
 * @param {string} goal Week goal text
 * @param {Object[]} sessions Sessions in the week
 * @returns {{week: number, goal: string, sessions: Object[]}} Week object
 */
function createWeek(week, goal, sessions) {
  return { week, goal, sessions };
}

const threeMinuteCombo = [
  step("run", 90, "Run"),
  step("walk", 90, "Walk"),
  step("run", 180, "Run"),
  step("walk", 180, "Walk"),
];

const fourFiveCombo = [
  step("run", 180, "Run"),
  step("walk", 90, "Walk"),
  step("run", 300, "Run"),
  step("walk", 150, "Walk"),
];

const baseTrainingPlan = [
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
    createSession({ week: 3, run: 1, title: "Longer efforts", summary: "90 sec run, 3 min run, repeat twice", blocks: [["Round 1", "Run 90 sec / Walk 90 sec / Run 3 min / Walk 3 min"], ["Round 2", "Repeat once"]], longestRun: 3, workSteps: [...threeMinuteCombo, ...threeMinuteCombo] }),
    createSession({ week: 3, run: 2, title: "Confidence builder", summary: "90 sec run, 3 min run, repeat twice", blocks: [["Round 1", "Run 90 sec / Walk 90 sec / Run 3 min / Walk 3 min"], ["Round 2", "Repeat once"]], longestRun: 3, workSteps: [...threeMinuteCombo, ...threeMinuteCombo] }),
    createSession({ week: 3, run: 3, title: "Ready for more", summary: "90 sec run, 3 min run, repeat twice", blocks: [["Round 1", "Run 90 sec / Walk 90 sec / Run 3 min / Walk 3 min"], ["Round 2", "Repeat once"]], longestRun: 3, workSteps: [...threeMinuteCombo, ...threeMinuteCombo] }),
  ]),
  createWeek(4, "Hold steady.", [
    createSession({ week: 4, run: 1, title: "Steady climb", summary: "3 min run, 5 min run, repeat twice", blocks: [["Round 1", "Run 3 min / Walk 90 sec / Run 5 min / Walk 2.5 min"], ["Round 2", "Repeat once"]], longestRun: 5, workSteps: [...fourFiveCombo, ...fourFiveCombo] }),
    createSession({ week: 4, run: 2, title: "Strong and light", summary: "3 min run, 5 min run, repeat twice", blocks: [["Round 1", "Run 3 min / Walk 90 sec / Run 5 min / Walk 2.5 min"], ["Round 2", "Repeat once"]], longestRun: 5, workSteps: [...fourFiveCombo, ...fourFiveCombo] }),
    createSession({ week: 4, run: 3, title: "Stay smooth", summary: "3 min run, 5 min run, repeat twice", blocks: [["Round 1", "Run 3 min / Walk 90 sec / Run 5 min / Walk 2.5 min"], ["Round 2", "Repeat once"]], longestRun: 5, workSteps: [...fourFiveCombo, ...fourFiveCombo] }),
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

/** @type {Achievement[]} */
export const achievements = [
  { id: "starter", title: "Started", detail: "Complete your first run.", unlockAt: 1 },
  { id: "week-one", title: "Week 1 done", detail: "Finish your first week.", unlockAt: 3 },
  { id: "ten", title: "10 sessions", detail: "Hit double digits.", unlockAt: 10 },
  { id: "twenty", title: "20 minute run", detail: "Run 20 minutes without stopping.", unlockAt: 15 },
  { id: "runner", title: "Continuous runner", detail: "Build steady non-stop runs.", unlockAt: 20 },
  { id: "finish", title: "5K complete", detail: "Finish the full plan.", unlockAt: 27 },
];

const scheduleMaps = {
  "3 days a week": ["Mon", "Wed", "Sat"],
  "Flexible schedule": ["A", "B", "C"],
  "Weekday focused": ["Mon", "Wed", "Fri"],
};

/**
 * Builds the baseline week blueprint for a given training focus.
 *
 * @param {string} focus Selected training focus
 * @returns {{sourceWeek: number}[]} Week blueprint
 */
function buildWeekBlueprint(focus) {
  switch (focus) {
    case "Stay comfortable":
      return [
        { sourceWeek: 1 },
        { sourceWeek: 2 },
        { sourceWeek: 3 },
        { sourceWeek: 4 },
        { sourceWeek: 5 },
        { sourceWeek: 5 },
        { sourceWeek: 6 },
        { sourceWeek: 7 },
        { sourceWeek: 9 },
      ];
    case "Reach 5K":
      return [
        { sourceWeek: 1 },
        { sourceWeek: 2 },
        { sourceWeek: 3 },
        { sourceWeek: 4 },
        { sourceWeek: 5 },
        { sourceWeek: 6 },
        { sourceWeek: 7 },
        { sourceWeek: 8 },
        { sourceWeek: 9 },
      ];
    case "Build consistency":
    default:
      return [
        { sourceWeek: 1 },
        { sourceWeek: 1 },
        { sourceWeek: 2 },
        { sourceWeek: 3 },
        { sourceWeek: 4 },
        { sourceWeek: 5 },
        { sourceWeek: 6 },
        { sourceWeek: 7 },
        { sourceWeek: 9 },
      ];
  }
}

/**
 * Advances early weeks for users who begin from a stronger starting point.
 *
 * @param {{sourceWeek: number}[]} blueprint Focus blueprint
 * @param {number} weeksToAdvance Number of early display weeks to advance
 * @returns {{sourceWeek: number}[]} Adjusted blueprint
 */
function advanceEarlyWeeks(blueprint, weeksToAdvance) {
  return blueprint.map((entry, index) => ({
    sourceWeek: index < weeksToAdvance ? Math.min(8, entry.sourceWeek + 1) : entry.sourceWeek,
  }));
}

/**
 * Applies the selected starting point to the focus blueprint.
 *
 * @param {{sourceWeek: number}[]} blueprint Focus blueprint
 * @param {string} startPoint Selected starting point
 * @returns {{sourceWeek: number}[]} Adjusted blueprint
 */
function applyStartPoint(blueprint, startPoint) {
  switch (startPoint) {
    case "Walking regularly":
      return advanceEarlyWeeks(blueprint, 7);
    case "Coming back":
      return advanceEarlyWeeks(blueprint, 2);
    case "Complete beginner":
    default:
      return blueprint;
  }
}

/**
 * Builds the display-ready training plan for a user profile.
 *
 * @param {Profile} profile Selected user preferences
 * @returns {{week: number, goal: string, sessions: Session[]}[]} Personalized training plan
 */
export function buildTrainingPlan(profile) {
  const mappedWeeks = applyStartPoint(buildWeekBlueprint(profile.focus), profile.startPoint);
  const labels = scheduleMaps[profile.weeklyPattern] ?? scheduleMaps["3 days a week"];

  return mappedWeeks.map((entry, weekIndex) => {
    const sourceWeek = baseTrainingPlan[entry.sourceWeek - 1];
    const displayWeek = weekIndex + 1;

    return {
      week: displayWeek,
      goal: sourceWeek.goal,
      sessions: sourceWeek.sessions.map((session, runIndex) => ({
        ...session,
        id: `${displayWeek}-${runIndex + 1}`,
        week: displayWeek,
        dayLabel: labels[runIndex],
        sourceWeek: entry.sourceWeek,
      })),
    };
  });
}

/**
 * Default training plan used for previews and static references.
 *
 * @type {Object[]}
 */
export const trainingPlan = buildTrainingPlan({
  startPoint: "Complete beginner",
  weeklyPattern: "3 days a week",
  focus: "Build consistency",
});
