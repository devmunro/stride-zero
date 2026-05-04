/**
 * Utility functions for generating workout steps safely.
 * Allows decoupling UI text representations from exact execution seconds.
 */

export const run = (seconds, label = "Run") => ({ type: "run", seconds, label });
export const walk = (seconds, label = "Walk") => ({ type: "walk", seconds, label });

export function buildRepeatPairs(reps, runSec, walkSec, runLabel = "Run", walkLabel = "Walk") {
  const steps = [];
  for (let i = 0; i < reps; i++) {
    steps.push(run(runSec, runLabel));
    steps.push(walk(walkSec, walkLabel));
  }
  return steps;
}
