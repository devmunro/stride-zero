/** @typedef {import("../types/models").AppState} AppState */
/** @typedef {import("../types/models").Profile} Profile */

/**
 * Default profile used on first launch and during storage recovery.
 *
 * @type {Profile}
 */
export const defaultProfile = {
  experienceLevel: "Beginner",
  goal: "Finish 5K",
  weeklyPattern: "3 runs most weeks",
  cueMode: "Sound + vibration",
  darkMode: false,
  reminderEnabled: false,
  reminderTime: "18:30",
};

/**
 * Default persisted app state used for first launch and reset flows.
 *
 * @type {AppState}
 */
export const defaultAppState = {
  profile: defaultProfile,
  plan: {
    hasSetup: false,
    selectedSessionId: "1-1",
    recoveryWeek: {
      active: false,
      completedRuns: 0,
      targetSessionId: null,
    },
    repeatWeek: {
      active: false,
      week: null,
      sessionIndex: 0,
    },
  },
  progress: {
    completedSessionIds: [],
    sessionLogs: [],
  },
  ui: {
    currentScreen: "setup",
    detailScreen: null,
    runMode: "complete",
  },
};

/**
 * Merges persisted state over the current schema so new releases can recover
 * older saved data safely.
 *
 * @param {Partial<AppState>|Object|null|undefined} parsed Persisted app state
 * @returns {AppState} Normalized app state
 */
export function hydrateAppState(parsed) {
  const legacyState = parsed ?? {};

  return {
    ...defaultAppState,
    profile: {
      ...defaultProfile,
      ...(legacyState.profile ?? {}),
      experienceLevel:
        legacyState.profile?.experienceLevel ??
        mapLegacyExperience(legacyState.profile?.startPoint) ??
        defaultProfile.experienceLevel,
      goal:
        legacyState.profile?.goal ??
        mapLegacyGoal(legacyState.profile?.focus) ??
        defaultProfile.goal,
    },
    plan: {
      ...defaultAppState.plan,
      ...(legacyState.plan ?? {}),
      hasSetup: legacyState.plan?.hasSetup ?? legacyState.hasSetup ?? defaultAppState.plan.hasSetup,
      selectedSessionId: legacyState.plan?.selectedSessionId ?? legacyState.selectedSessionId ?? defaultAppState.plan.selectedSessionId,
    },
    progress: {
      ...defaultAppState.progress,
      ...(legacyState.progress ?? {}),
      completedSessionIds: legacyState.progress?.completedSessionIds ?? legacyState.completedSessionIds ?? defaultAppState.progress.completedSessionIds,
      sessionLogs: legacyState.progress?.sessionLogs ?? defaultAppState.progress.sessionLogs,
    },
    ui: {
      ...defaultAppState.ui,
      ...(legacyState.ui ?? {}),
      currentScreen: legacyState.ui?.currentScreen ?? legacyState.currentScreen ?? defaultAppState.ui.currentScreen,
      detailScreen: legacyState.ui?.detailScreen ?? defaultAppState.ui.detailScreen,
      runMode: legacyState.ui?.runMode ?? defaultAppState.ui.runMode,
    },
  };
}

/**
 * Returns whether a profile change should reset plan progress because it alters
 * the actual training plan rather than just presentation preferences.
 *
 * @param {Profile} previousProfile Previously saved profile
 * @param {Profile} nextProfile Pending profile draft
 * @returns {boolean} Whether progress should be reset
 */
export function shouldResetPlanProgress(previousProfile, nextProfile) {
  return (
    previousProfile.experienceLevel !== nextProfile.experienceLevel ||
    previousProfile.goal !== nextProfile.goal ||
    previousProfile.weeklyPattern !== nextProfile.weeklyPattern
  );
}

/**
 * Creates the saved state after onboarding or setup editing is confirmed.
 *
 * @param {AppState} currentState Current app state
 * @param {Profile} nextProfile Profile selected in setup
 * @param {boolean} isFirstSetup Whether this is the first completion of setup
 * @returns {AppState} Updated app state
 */
export function buildSavedSetupState(currentState, nextProfile, isFirstSetup) {
  if (isFirstSetup || shouldResetPlanProgress(currentState.profile, nextProfile)) {
    return {
      ...currentState,
      profile: nextProfile,
      plan: {
        ...currentState.plan,
        hasSetup: true,
        selectedSessionId: "1-1",
        recoveryWeek: {
          active: false,
          completedRuns: 0,
          targetSessionId: null,
        },
        repeatWeek: {
          active: false,
          week: null,
          sessionIndex: 0,
        },
      },
      progress: {
        ...currentState.progress,
        completedSessionIds: [],
        sessionLogs: [],
      },
      ui: {
        ...currentState.ui,
        currentScreen: "dashboard",
        detailScreen: null,
      },
    };
  }

  return {
    ...currentState,
    profile: nextProfile,
    plan: {
      ...currentState.plan,
      hasSetup: true,
    },
    ui: {
      ...currentState.ui,
      currentScreen: "dashboard",
      detailScreen: null,
    },
  };
}

function mapLegacyExperience(startPoint) {
  switch (startPoint) {
    case "Complete beginner":
      return "Very new to running";
    case "Walking regularly":
      return "Beginner";
    case "Coming back":
      return "Getting back into it";
    default:
      return null;
  }
}

function mapLegacyGoal(focus) {
  switch (focus) {
    case "Stay comfortable":
      return "Build to 30 minutes";
    case "Reach 5K":
      return "Finish 5K";
    case "Build consistency":
    default:
      return null;
  }
}
