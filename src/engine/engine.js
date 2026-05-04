import { buildPresetPlan, buildCustomPlan, ensureFinalSession } from './builders/index.js';

import foundationThirtyPlan from './plans/foundation-thirty-plan.json';
import beginnerThirtyPlan from './plans/beginner-thirty-plan.json';
import returnToThirtyPlan from './plans/return-to-thirty-plan.json';
import foundationFiveKPlan from './plans/foundation-five-k-plan.json';
import beginnerFiveKPlan from './plans/beginner-five-k-plan.json';
import returnToRunningPlan from './plans/return-to-running-plan.json';
import comfortableFiveKPlan from './plans/comfortable-five-k-plan.json';
import improve5kPlan from './plans/improve5k-plan.json';
import foundationTenKPlan from './plans/foundation-ten-k-plan.json';
import beginnerTenKPlan from './plans/beginner-ten-k-plan.json';
import returnTenKPlan from './plans/return-ten-k-plan.json';
import tenKPlan from './plans/ten-k-plan.json';

const ROUTING_TABLE = {
  "Build to 30 minutes": {
    "Very new to running": { template: foundationThirtyPlan, builder: buildPresetPlan },
    "Getting back into it": { template: returnToThirtyPlan, builder: buildCustomPlan },
    "Already comfortable at 5K": { template: returnToThirtyPlan, builder: buildCustomPlan },
    "default": { template: beginnerThirtyPlan, builder: buildPresetPlan }
  },
  "Finish 5K": {
    "Very new to running": { template: foundationFiveKPlan, builder: buildPresetPlan },
    "Getting back into it": { template: returnToRunningPlan, builder: buildPresetPlan },
    "Already comfortable at 5K": { template: comfortableFiveKPlan, builder: buildCustomPlan },
    "default": { template: beginnerFiveKPlan, builder: buildPresetPlan }
  },
  "Run a better 5K": {
    "default": { template: improve5kPlan, builder: buildCustomPlan }
  },
  "Build to 10K": {
    "Very new to running": { template: foundationTenKPlan, builder: buildPresetPlan },
    "Beginner": { template: beginnerTenKPlan, builder: buildPresetPlan },
    "Getting back into it": { template: returnTenKPlan, builder: buildPresetPlan },
    "default": { template: tenKPlan, builder: buildCustomPlan }
  }
};

/**
 * Core Plan Engine.
 * Responsible for mapping user profiles to data templates, and passing them to standard builders.
 */
export function executeEngine(profile) {
  const category = ROUTING_TABLE[profile.goal];
  if (!category) return ensureFinalSession(buildPresetPlan(profile, beginnerFiveKPlan));

  const route = category[profile.experienceLevel] || category["default"];
  
  return ensureFinalSession(route.builder(profile, route.template));
}

export function getPlanLabel(profile) {
  if (profile.goal === "Build to 30 minutes") {
    return profile.experienceLevel === "Very new to running" ? "Foundation plan" : profile.experienceLevel === "Beginner" ? "30-minute build" : "Return plan";
  }

  if (profile.goal === "Finish 5K") {
    if (profile.experienceLevel === "Very new to running") return "Foundation to 5K";
    if (profile.experienceLevel === "Getting back into it") return "Return-to-running plan";
    if (profile.experienceLevel === "Already comfortable at 5K") return "5K sharpen-up";
    return "First 5K plan";
  }

  if (profile.goal === "Run a better 5K") {
    return "5K improvement plan";
  }

  if (profile.goal === "Build to 10K") {
    if (profile.experienceLevel === "Very new to running") return "Foundation to 10K";
    if (profile.experienceLevel === "Beginner") return "First 10K plan";
    if (profile.experienceLevel === "Getting back into it") return "Return-to-10K plan";
    return "10K build";
  }

  return "First 5K plan";
}
