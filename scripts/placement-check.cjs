const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");

async function loadModule(relativePath) {
  const absolutePath = path.join(__dirname, "..", relativePath);
  const code = fs.readFileSync(absolutePath, "utf8");
  const dataUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(code)}`;
  return import(dataUrl);
}

function createProfile(defaultProfile, overrides = {}) {
  return {
    ...defaultProfile,
    experienceLevel: "Beginner",
    goal: "Finish 5K",
    continuousRunLevel: "10 to 20 minutes",
    recentRunPattern: "1 to 4 runs in last 4 weeks",
    fiveKStatus: "Never finished 5K",
    comebackStatus: "No comeback",
    ...overrides,
  };
}

(async () => {
  const { resolvePlanPlacement } = await loadModule("src/engine/placement.js");
  const { defaultProfile, hydrateAppState, shouldResetPlanProgress } = await loadModule("src/lib/profileState.js");

  const veryNew = resolvePlanPlacement(createProfile(defaultProfile, {
    goal: "Finish 5K",
    continuousRunLevel: "Not running yet",
    recentRunPattern: "No runs in last 4 weeks",
  }));
  assert.equal(veryNew.placementMode, "direct");
  assert.equal(veryNew.effectiveProfile.goal, "Finish 5K");
  assert.equal(veryNew.effectiveProfile.experienceLevel, "Very new to running");

  const beginnerImprove = resolvePlanPlacement(createProfile(defaultProfile, {
    goal: "Run a better 5K",
    continuousRunLevel: "10 to 20 minutes",
  }));
  assert.equal(beginnerImprove.placementMode, "redirected");
  assert.equal(beginnerImprove.effectiveProfile.goal, "Finish 5K");
  assert.equal(beginnerImprove.effectiveProfile.experienceLevel, "Beginner");

  const comebackImprove = resolvePlanPlacement(createProfile(defaultProfile, {
    goal: "Run a better 5K",
    continuousRunLevel: "30+ minutes",
    recentRunPattern: "5+ runs in last 4 weeks",
    fiveKStatus: "Comfortably finish 5K",
    comebackStatus: "Back after time off",
  }));
  assert.equal(comebackImprove.placementMode, "redirected");
  assert.equal(comebackImprove.effectiveProfile.goal, "Finish 5K");
  assert.equal(comebackImprove.effectiveProfile.experienceLevel, "Getting back into it");

  const comfortableImprove = resolvePlanPlacement(createProfile(defaultProfile, {
    goal: "Run a better 5K",
    continuousRunLevel: "30+ minutes",
    recentRunPattern: "5+ runs in last 4 weeks",
    fiveKStatus: "Comfortably finish 5K",
  }));
  assert.equal(comfortableImprove.placementMode, "direct");
  assert.equal(comfortableImprove.effectiveProfile.goal, "Run a better 5K");
  assert.equal(comfortableImprove.effectiveProfile.experienceLevel, "Already comfortable at 5K");

  const noRecentTenK = resolvePlanPlacement(createProfile(defaultProfile, {
    goal: "Build to 10K",
    continuousRunLevel: "30+ minutes",
    recentRunPattern: "No runs in last 4 weeks",
    fiveKStatus: "Comfortably finish 5K",
  }));
  assert.equal(noRecentTenK.placementMode, "redirected");
  assert.equal(noRecentTenK.effectiveProfile.goal, "Finish 5K");

  const comfortableTenK = resolvePlanPlacement(createProfile(defaultProfile, {
    goal: "Build to 10K",
    continuousRunLevel: "30+ minutes",
    recentRunPattern: "5+ runs in last 4 weeks",
    fiveKStatus: "Comfortably finish 5K",
  }));
  assert.equal(comfortableTenK.placementMode, "direct");
  assert.equal(comfortableTenK.effectiveProfile.goal, "Build to 10K");
  assert.equal(comfortableTenK.effectiveProfile.experienceLevel, "Already comfortable at 5K");

  const hydratedLegacyState = hydrateAppState({
    profile: {
      experienceLevel: "Beginner",
      goal: "Finish 5K",
      weeklyPattern: "3 runs most weeks",
    },
    plan: {
      hasSetup: true,
      selectedSessionId: "wk1-wake-up-run",
    },
    ui: {
      currentScreen: "dashboard",
    },
  });
  assert.equal(hydratedLegacyState.profile.continuousRunLevel, null);
  assert.equal(hydratedLegacyState.profile.recentRunPattern, null);
  assert.equal(hydratedLegacyState.profile.fiveKStatus, null);
  assert.equal(hydratedLegacyState.profile.comebackStatus, null);
  assert.equal(resolvePlanPlacement(hydratedLegacyState.profile).placementMode, "direct");

  const previousProfile = createProfile(defaultProfile);
  assert.equal(shouldResetPlanProgress(previousProfile, {
    ...previousProfile,
    weeklyPattern: "4 runs most weeks",
  }), true);
  assert.equal(shouldResetPlanProgress(previousProfile, {
    ...previousProfile,
    recentRunPattern: "5+ runs in last 4 weeks",
  }), true);

  console.log("Placement check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
