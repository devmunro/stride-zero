/**
 * Registry of all available achievements.
 * Each achievement declares its own condition logic purely based on context.
 */
export const achievements = [
  { 
    id: "starter", 
    title: "First Run", 
    detail: "Complete your first run.", 
    condition: (context) => context.completedRuns >= 1 
  },
  { 
    id: "first-week", 
    title: "First Week", 
    detail: "Finish a full week of training.", 
    condition: (context) => context.completedRuns >= 3 || context.streak >= 1 
  },
  { 
    id: "five", 
    title: "5 Sessions", 
    detail: "Complete 5 runs.", 
    condition: (context) => context.completedRuns >= 5 
  },
  { 
    id: "ten", 
    title: "10 Sessions", 
    detail: "Hit double digits.", 
    condition: (context) => context.completedRuns >= 10 
  },
  { 
    id: "halfway", 
    title: "Halfway There", 
    detail: "Complete 50% of your plan.", 
    condition: (context) => context.completedRuns > 0 && context.completedRuns >= Math.floor(context.totalPlanSessions / 2) 
  },
  { 
    id: "twenty-min", 
    title: "20-Minute Run", 
    detail: "Run 20 minutes continuously.", 
    condition: (context) => context.longestRunCache >= 20 
  },
  { 
    id: "thirty-min", 
    title: "30-Minute Run", 
    detail: "Run 30 minutes continuously.", 
    condition: (context) => context.longestRunCache >= 30 
  },
  { 
    id: "perfect-week", 
    title: "Perfect Week", 
    detail: "Nail all scheduled runs for the week without delay.", 
    condition: (context) => context.streak >= 1 
  },
  { 
    id: "comeback", 
    title: "Comeback", 
    detail: "Log a run after a missed session or taking a recovery week.", 
    condition: (context) => context.hasLoggedRecoveryOrRepeat === true 
  },
];

export function getUnlockedAchievements(appState, coreSessionsLength, streak) {
  const context = {
    completedRuns: appState.progress.completedSessionIds.length,
    longestRunCache: Math.max(0, ...appState.progress.sessionLogs.map(log => log.longestRun), 0),
    hasLoggedRecoveryOrRepeat: appState.progress.sessionLogs.some(log => log.kind === "recovery" || log.kind === "repeat"),
    streak,
    totalPlanSessions: coreSessionsLength,
  };

  return achievements.filter(ach => ach.condition(context));
}
