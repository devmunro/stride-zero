import fs from 'fs';
import path from 'path';

// Since trainingPlan.js uses ES6 modules, we might need a workaround if node doesn't support it directly.
// Given Expo project, babel-node or manual regex extraction might be simpler.
// Actually, let's just parse the file via Babel or simply regex.
import {
  couchBasePlan,
  veryNewToRunningPlan,
  returnToRunningPlan,
  returnToThirtyPlan,
  comfortableFiveKPlan,
  improve5kPlan,
  tenKPlan,
  foundationThirtyPlan,
  beginnerThirtyPlan,
  foundationFiveKPlan,
  beginnerFiveKPlan,
  foundationTenKPlan,
  beginnerTenKPlan,
  returnTenKPlan,
} from '../src/data/trainingPlan.js';

function toKebabCase(str) {
  return str.replace(/[^a-zA-Z0-9$]+/g, '-').toLowerCase().replace(/(^-|-$)/g, '');
}

function processPlan(plan) {
  return plan.map(week => ({
    week: week.week,
    goal: week.goal,
    sessions: week.sessions.map((sess, i) => ({
      logicalId: toKebabCase(sess.title),
      run: sess.run,
      title: sess.title,
      summary: sess.summary,
      blocks: sess.blocks,
      longestRun: sess.longestRun,
      steps: sess.steps,
      totalMinutes: sess.totalMinutes,
      totalSeconds: sess.totalSeconds,
      isFinal: sess.isFinal
    }))
  }));
}

const plans = {
  couchBasePlan,
  veryNewToRunningPlan,
  returnToRunningPlan,
  returnToThirtyPlan,
  comfortableFiveKPlan,
  improve5kPlan,
  tenKPlan,
  foundationThirtyPlan,
  beginnerThirtyPlan,
  foundationFiveKPlan,
  beginnerFiveKPlan,
  foundationTenKPlan,
  beginnerTenKPlan,
  returnTenKPlan,
};

const outputDir = path.resolve('./src/engine/plans/');

for (const [name, plan] of Object.entries(plans)) {
  const processed = processPlan(plan);
  const kebabName = name.replace(/([A-Z])/g, '-$1').toLowerCase() + '.json';
  fs.writeFileSync(path.join(outputDir, kebabName), JSON.stringify({ id: name, name, weeks: processed }, null, 2));
}

console.log('DONE');
