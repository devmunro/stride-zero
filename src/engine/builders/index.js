import { buildId } from '../utils/sessionHelpers.js';
import { walk, run } from '../utils/stepHelpers.js';

const scheduleMaps = {
  "2 runs most weeks": ["Run 1", "Run 2"],
  "3 runs most weeks": ["Run 1", "Run 2", "Run 3"],
  "4 runs most weeks": ["Run 1", "Run 2", "Run 3", "Run 4"],
};

function buildOptionalSupportRun(referenceSession, displayWeek) {
  const easyRunSeconds = Math.max(60, Math.round(referenceSession.longestRun * 0.75) * 60);
  const walkSeconds = Math.max(60, Math.round(easyRunSeconds / 2));

  return {
    logicalId: "easy-support-run",
    run: 4,
    title: "Easy support run",
    summary: "Optional easy session to build comfort without forcing the plan.",
    blocks: [["Main set", `Easy run ${Math.round(easyRunSeconds / 60)} min / Walk ${Math.round(walkSeconds / 60)} min / Easy run ${Math.round(easyRunSeconds / 60)} min`]],
    longestRun: Math.round(easyRunSeconds / 60),
    steps: [
      walk(300, "Warm up"),
      run(easyRunSeconds, "Easy run"),
      walk(walkSeconds, "Walk"),
      run(easyRunSeconds, "Easy run"),
      walk(300, "Cool down")
    ],
    totalMinutes: Math.round(((300 * 2) + (easyRunSeconds * 2) + walkSeconds) / 60),
    totalSeconds: (300 * 2) + (easyRunSeconds * 2) + walkSeconds,
    countsTowardPlan: false,
    isOptional: true,
  };
}

/**
 * Manipulates a raw preset JSON structure to append/omit runs dynamically based on the schedule rules.
 */
export function buildPresetPlan(profile, rawPlanData) {
  const labels = scheduleMaps[profile.weeklyPattern] ?? scheduleMaps["3 runs most weeks"];
  return rawPlanData.weeks.map((sourceWeek, index) => {
    const displayWeek = index + 1;
    let sessions = sourceWeek.sessions;

    if (profile.weeklyPattern === "2 runs most weeks" && sessions.length >= 2) {
      sessions = [sessions[0], sessions[sessions.length - 1]];
    }

    if (profile.weeklyPattern === "4 runs most weeks" && sessions.length > 0) {
      sessions = [...sessions, buildOptionalSupportRun(sessions[0], displayWeek)];
    }

    return {
      week: displayWeek,
      goal: sourceWeek.goal,
      sessions: sessions.map((session, runIndex) => ({
        ...session,
        id: buildId(displayWeek, session.logicalId),
        week: displayWeek,
        dayLabel: labels[runIndex],
        sourceWeek: sourceWeek.week,
        countsTowardPlan: session.countsTowardPlan ?? true,
      })),
    };
  });
}

/**
 * Builds custom plans enforcing specific data overlays via JSON structures.
 */
export function buildCustomPlan(profile, rawPlanData) {
  const labels = scheduleMaps[profile.weeklyPattern] ?? scheduleMaps["3 runs most weeks"];
  return rawPlanData.weeks.map((sourceWeek, index) => {
    const displayWeek = index + 1;
    let sessions = sourceWeek.sessions;

    if (profile.weeklyPattern === "2 runs most weeks" && sessions.length >= 2) {
      sessions = [sessions[0], sessions[sessions.length - 1]];
    }

    if (profile.weeklyPattern === "4 runs most weeks" && sessions.length > 0) {
      sessions = [...sessions, buildOptionalSupportRun(sessions[0], displayWeek)];
    }

    return {
      ...sourceWeek,
      week: displayWeek,
      sessions: sessions.map((session, runIndex) => ({
        ...session,
        id: buildId(displayWeek, session.logicalId),
        week: displayWeek,
        dayLabel: labels[runIndex],
        countsTowardPlan: session.countsTowardPlan ?? true,
      })),
    };
  });
}

export function ensureFinalSession(plan) {
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
