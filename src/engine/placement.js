const PLACEMENT_FIELDS = [
  "continuousRunLevel",
  "recentRunPattern",
  "fiveKStatus",
  "comebackStatus",
];

function hasComfortableFiveKBase(profile) {
  return (
    profile.fiveKStatus === "Comfortably finish 5K" &&
    (profile.continuousRunLevel === "20 to 30 minutes" || profile.continuousRunLevel === "30+ minutes")
  );
}

function deriveExperienceLevel(profile) {
  if (profile.comebackStatus && profile.comebackStatus !== "No comeback") {
    return "Getting back into it";
  }

  if (hasComfortableFiveKBase(profile)) {
    return "Already comfortable at 5K";
  }

  if (
    profile.continuousRunLevel === "Not running yet" ||
    (profile.continuousRunLevel === "Up to 10 minutes" && profile.recentRunPattern === "No runs in last 4 weeks")
  ) {
    return "Very new to running";
  }

  return "Beginner";
}

function getRedirectReasons(profile, effectiveExperienceLevel) {
  if (profile.goal === "Run a better 5K") {
    const reasons = ["A better-5K plan is meant for runners who can already finish 5K comfortably."];

    if (effectiveExperienceLevel !== "Already comfortable at 5K") {
      reasons.push("Your current running base is still better matched to building toward a stronger first 5K.");
    }

    if (profile.recentRunPattern === "No runs in last 4 weeks") {
      reasons.push("A recent gap in running usually needs a rebuild before sharper 5K sessions.");
    }

    if (profile.comebackStatus !== "No comeback") {
      reasons.push("Comeback runners are safer on a build plan before speed-focused work.");
    }

    return reasons;
  }

  if (profile.goal === "Build to 10K") {
    const reasons = ["A 10K plan works best once you already have a steady 5K base."];

    if (effectiveExperienceLevel !== "Already comfortable at 5K") {
      reasons.push("Your current answers point to building 5K strength first rather than stretching to 10K.");
    }

    if (profile.recentRunPattern === "No runs in last 4 weeks") {
      reasons.push("A recent break in running is a sign to rebuild consistency before moving to 10K.");
    }

    if (!(profile.continuousRunLevel === "20 to 30 minutes" || profile.continuousRunLevel === "30+ minutes")) {
      reasons.push("The 10K path assumes you can already handle at least a 20-minute continuous run.");
    }

    return reasons;
  }

  return [];
}

export function hasPlacementAnswers(profile) {
  return PLACEMENT_FIELDS.every((field) => typeof profile[field] === "string" && profile[field].length > 0);
}

export function resolvePlanPlacement(profile) {
  if (!hasPlacementAnswers(profile)) {
    return {
      effectiveProfile: profile,
      placementMode: "direct",
      reasons: [],
    };
  }

  const effectiveExperienceLevel = deriveExperienceLevel(profile);
  let resolvedGoal = profile.goal;

  if (
    profile.goal === "Run a better 5K" &&
    (
      effectiveExperienceLevel !== "Already comfortable at 5K" ||
      profile.recentRunPattern === "No runs in last 4 weeks" ||
      profile.comebackStatus !== "No comeback"
    )
  ) {
    resolvedGoal = "Finish 5K";
  }

  if (
    profile.goal === "Build to 10K" &&
    (
      effectiveExperienceLevel !== "Already comfortable at 5K" ||
      profile.recentRunPattern === "No runs in last 4 weeks" ||
      !(profile.continuousRunLevel === "20 to 30 minutes" || profile.continuousRunLevel === "30+ minutes")
    )
  ) {
    resolvedGoal = "Finish 5K";
  }

  return {
    effectiveProfile: {
      ...profile,
      experienceLevel: effectiveExperienceLevel,
      goal: resolvedGoal,
    },
    placementMode: resolvedGoal === profile.goal ? "direct" : "redirected",
    reasons: resolvedGoal === profile.goal ? [] : getRedirectReasons(profile, effectiveExperienceLevel),
  };
}
