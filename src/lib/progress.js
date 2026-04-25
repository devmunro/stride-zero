import { formatDateLabel, getDateKey, getRecentDateKeys, getWeekBucket } from "./date";

/**
 * Creates a stable workout log entry.
 *
 * @param {Object} session Session metadata
 * @param {"complete"|"repeat"|"recovery"} kind Log type
 * @returns {Object} Workout log
 */
export function createWorkoutLog(session, kind) {
  const completedAt = new Date().toISOString();
  const dateKey = getDateKey(completedAt);

  return {
    id: `${kind}-${session.id}-${completedAt}`,
    sessionId: session.id,
    title: session.title,
    week: session.week,
    run: session.run,
    totalMinutes: session.totalMinutes,
    longestRun: session.longestRun,
    kind,
    completedAt,
    dateKey,
  };
}

/**
 * Builds progress metrics and visual data from raw logs.
 *
 * @param {Object[]} logs Workout logs
 * @param {Object[]} milestones Road-to-5K milestones
 * @returns {Object} Summary object
 */
export function summarizeProgress(logs, milestones) {
  const longestRun = Math.max(0, ...logs.map((item) => item.longestRun));
  const totalMinutes = logs.reduce((sum, item) => sum + item.totalMinutes, 0);
  const sessionsCompleted = logs.filter((item) => item.kind === "complete").length;
  const repeats = logs.filter((item) => item.kind === "repeat").length;
  const recoveryRuns = logs.filter((item) => item.kind === "recovery").length;
  const weekCounts = logs.reduce((accumulator, item) => {
    const key = getWeekBucket(item.dateKey);
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});
  const busiestWeekCount = Math.max(0, ...Object.values(weekCounts));
  const lastRun = logs.at(-1);

  return {
    longestRun,
    totalMinutes,
    sessionsCompleted,
    repeats,
    recoveryRuns,
    personalBests: [
      { label: "Longest run", value: `${longestRun} min`, note: "best continuous effort" },
      { label: "Longest workout", value: `${Math.max(0, ...logs.map((item) => item.totalMinutes))} min`, note: "biggest single session" },
      { label: "Best week", value: `${busiestWeekCount} runs`, note: "most sessions in one week" },
    ],
    calendar: buildCalendar(logs),
    road: milestones.map((item) => ({ ...item, reached: longestRun >= item.minutes })),
    latestLabel: lastRun ? `${capitalize(lastRun.kind)} ${formatDateLabel(lastRun.dateKey)}` : "No runs yet",
  };
}

/**
 * Converts workout logs into a simple completion heatmap.
 *
 * @param {Object[]} logs Workout logs
 * @returns {Object[]} Calendar cells
 */
export function buildCalendar(logs) {
  const counts = logs.reduce((accumulator, item) => {
    accumulator[item.dateKey] = (accumulator[item.dateKey] ?? 0) + 1;
    return accumulator;
  }, {});

  return getRecentDateKeys(35).map((dateKey) => ({
    dateKey,
    count: counts[dateKey] ?? 0,
  }));
}

/**
 * Returns the number of fully completed plan weeks.
 *
 * @param {Object[]} trainingPlan Display plan
 * @param {Set<string>} completedSet Completed ids
 * @returns {number} Full-week streak count
 */
export function countCompletedWeeks(trainingPlan, completedSet) {
  let count = 0;

  for (const week of trainingPlan) {
    const coreSessions = week.sessions.filter((session) => session.countsTowardPlan !== false);
    if (coreSessions.every((session) => completedSet.has(session.id))) {
      count += 1;
      continue;
    }
    break;
  }

  return count;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
