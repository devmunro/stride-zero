/**
 * Main module facade exposing the external APIs for the rest of the application
 */
export { getUnlockedAchievements, achievements } from './achievements/index.js';
export { executeEngine as buildTrainingPlan, getPlanLabel } from './engine.js';
export { getPlanMilestones } from './milestones/index.js';
export { buildRecoveryWeek } from './utils/recoveryHelpers.js';
