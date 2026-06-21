/** @typedef {import("../types/models").AppState} AppState */
/** @typedef {import("../types/models").Profile} Profile */

/**
 * Default profile used on first launch and during storage recovery.
 *
 * @type {Profile}
 */
export const defaultProfile = {
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
    hasSetup: true,
    selectedSessionId: "wc26-w01-mon",
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
    currentScreen: "dashboard",
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
    },
    plan: {
      ...defaultAppState.plan,
      ...(legacyState.plan ?? {}),
      hasSetup: true,
      selectedSessionId: String(legacyState.plan?.selectedSessionId ?? legacyState.selectedSessionId ?? "").startsWith("wc26-")
        ? legacyState.plan?.selectedSessionId ?? legacyState.selectedSessionId
        : defaultAppState.plan.selectedSessionId,
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
      currentScreen: ["setup", undefined, null].includes(legacyState.ui?.currentScreen ?? legacyState.currentScreen)
        ? defaultAppState.ui.currentScreen
        : legacyState.ui?.currentScreen ?? legacyState.currentScreen,
      detailScreen: legacyState.ui?.detailScreen ?? defaultAppState.ui.detailScreen,
      runMode: legacyState.ui?.runMode ?? defaultAppState.ui.runMode,
    },
  };
}
