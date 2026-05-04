import { walk, run } from './stepHelpers.js';

export function buildRecoveryWeek(weekSessions) {
  const coreSessions = weekSessions.filter((session) => session.countsTowardPlan !== false);

  return coreSessions.map((session, index) => {
    const scaledSteps = session.steps.slice(1, -1).map((item) => {
      if (item.type === "run") {
        return run(Math.max(45, Math.round(item.seconds * 0.65)), "Easy run");
      }

      return walk(Math.max(60, Math.round(item.seconds * 1.15)), "Walk reset");
    });

    const longestRunSeconds = Math.max(60, ...scaledSteps.filter((item) => item.type === "run").map((item) => item.seconds));
    
    // Recovery resets shouldn't throw off UI formatting length expectations
    const totalSecs = 300 + 300 + scaledSteps.reduce((acc, step) => acc + step.seconds, 0);

    return {
      logicalId: `recovery-reset-${index + 1}`,
      id: `wk${session.week}-recovery-reset-${index + 1}`,
      week: session.week,
      run: index + 1,
      title: `Recovery reset ${index + 1}`,
      summary: `Lighter version of ${session.dayLabel ?? `Run ${session.run}`} so you can recover without losing rhythm.`,
      blocks: [
        ["Based on", session.title],
        ["Why", "Shorter running blocks and more reset time to help you absorb training"],
      ],
      longestRun: Math.round(longestRunSeconds / 60),
      steps: [
        walk(300, "Warm up"),
        ...scaledSteps,
        walk(300, "Cool down")
      ],
      totalMinutes: Math.round(totalSecs / 60),
      totalSeconds: totalSecs
    };
  });
}
