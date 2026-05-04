/**
 * Utility helpers formatting standard data schemas.
 */

/**
 * Builds a stable session ID purely based on the display week and semantic logical identity.
 * This guarantees updates or changes in plan frequency won't wipe progress locally. 
 * 
 * @param {number} displayWeek e.g 1
 * @param {string} logicalId e.g 'wake-up-run'
 * @returns {string} e.g 'wk1-wake-up-run'
 */
export function buildId(displayWeek, logicalId) {
  return `wk${displayWeek}-${logicalId}`;
}
