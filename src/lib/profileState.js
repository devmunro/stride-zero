/** @typedef {import("../types/models").AppState} AppState */
/** @typedef {import("../types/models").Profile} Profile */

/**
 * Default profile used on first launch and during storage recovery.
 *
 * @type {Profile}
 */
export const defaultProfile = {
  startPoint: "Complete beginner",
  weeklyPattern: "3 days a week",
  focus: "Build consistency",
  cueMode: "Sound + vibration",
  darkMode: false,
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
  },
  progress: {
    completedSessionIds: [],
  },
  ui: {
    currentScreen: "setup",
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
    profile: { ...defaultProfile, ...(legacyState.profile ?? {}) },
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
    },
    ui: {
      ...defaultAppState.ui,
      ...(legacyState.ui ?? {}),
      currentScreen: legacyState.ui?.currentScreen ?? legacyState.currentScreen ?? defaultAppState.ui.currentScreen,
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
    previousProfile.startPoint !== nextProfile.startPoint ||
    previousProfile.weeklyPattern !== nextProfile.weeklyPattern ||
    previousProfile.focus !== nextProfile.focus
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
      },
      progress: {
        ...currentState.progress,
        completedSessionIds: [],
      },
      ui: {
        ...currentState.ui,
        currentScreen: "dashboard",
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
    },
  };
}
