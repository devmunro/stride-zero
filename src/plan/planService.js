import AsyncStorage from "@react-native-async-storage/async-storage";
import bundledPlan from "./bundled-plan.json";

const PLAN_CACHE_KEY = "stride-zero-run-plan-v1";
const DEFAULT_PLAN_URL = "https://raw.githubusercontent.com/devmunro/stride-zero/main/src/plan/bundled-plan.json";
export const PLAN_URL = process.env.EXPO_PUBLIC_PLAN_URL || DEFAULT_PLAN_URL;

export function validatePlanDocument(plan) {
  const errors = [];
  if (!plan || typeof plan !== "object") return ["Plan payload is missing."];
  if (typeof plan.planId !== "string" || !plan.planId) errors.push("planId is required.");
  if (!Number.isInteger(plan.planVersion) || plan.planVersion < 1) errors.push("planVersion must be a positive integer.");
  if (plan.startDate !== "2026-06-22") errors.push("Plan must start on 2026-06-22.");
  if (plan.challengeDate !== "2026-12-20") errors.push("Plan must end on 2026-12-20.");
  if (!Array.isArray(plan.weeks) || plan.weeks.length !== 26) errors.push("Plan must contain exactly 26 weeks.");

  const ids = new Set();
  for (const [index, week] of (plan.weeks || []).entries()) {
    if (week.week !== index + 1) errors.push(`Invalid week number at position ${index + 1}.`);
    if (!Array.isArray(week.sessions)) errors.push(`Week ${week.week || index + 1} is missing sessions.`);
    for (const session of week.sessions || []) {
      if (!session.id || ids.has(session.id)) errors.push(`Duplicate or missing session ID in week ${week.week}.`);
      ids.add(session.id);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(session.date || "")) errors.push(`Invalid date for ${session.id || "unknown session"}.`);
      if (!Array.isArray(session.steps) || !session.steps.length) errors.push(`Timer steps are required for ${session.id}.`);
      for (const step of session.steps || []) {
        if (!["run", "walk"].includes(step.type) || !Number.isFinite(step.seconds) || step.seconds <= 0) {
          errors.push(`Invalid timer step in ${session.id}.`);
        }
      }
    }
  }

  return errors;
}

export function getBundledPlan() {
  const errors = validatePlanDocument(bundledPlan);
  if (errors.length) throw new Error(`Bundled plan is invalid: ${errors.join(" ")}`);
  return bundledPlan;
}

export async function loadCachedPlan() {
  try {
    const raw = await AsyncStorage.getItem(PLAN_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return validatePlanDocument(parsed).length ? null : parsed;
  } catch {
    return null;
  }
}

export async function saveCachedPlan(plan) {
  const errors = validatePlanDocument(plan);
  if (errors.length) throw new Error(errors.join(" "));
  await AsyncStorage.setItem(PLAN_CACHE_KEY, JSON.stringify(plan));
}

export async function fetchPlanUpdate(currentVersion, signal) {
  const response = await fetch(PLAN_URL, {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) throw new Error(`Plan server returned HTTP ${response.status}.`);
  const candidate = await response.json();
  const errors = validatePlanDocument(candidate);
  if (errors.length) throw new Error(`Downloaded plan rejected: ${errors.join(" ")}`);
  return candidate.planVersion > currentVersion ? candidate : null;
}

const comparableSession = (session) => ({
  week: session.week,
  date: session.date,
  title: session.title,
  summary: session.summary,
  purpose: session.purpose,
  effort: session.effort,
  coachingNotes: session.coachingNotes,
  blocks: session.blocks,
  steps: session.steps,
});

export function describePlanUpdate(currentPlan, candidatePlan, completedSessionIds = []) {
  const completed = new Set(completedSessionIds);
  const current = new Map(currentPlan.weeks.flatMap((week) => week.sessions).map((session) => [session.id, session]));
  const candidate = new Map(candidatePlan.weeks.flatMap((week) => week.sessions).map((session) => [session.id, session]));
  const changes = [];

  for (const [id, session] of candidate) {
    if (completed.has(id)) continue;
    const previous = current.get(id);
    if (!previous) changes.push({ id, type: "added", title: session.title, week: session.week });
    else if (JSON.stringify(comparableSession(previous)) !== JSON.stringify(comparableSession(session))) {
      changes.push({ id, type: "changed", title: session.title, week: session.week });
    }
  }

  for (const [id, session] of current) {
    if (!completed.has(id) && !candidate.has(id)) changes.push({ id, type: "removed", title: session.title, week: session.week });
  }

  return changes.sort((left, right) => left.week - right.week);
}

export function preserveCompletedSessions(currentPlan, candidatePlan, completedSessionIds = []) {
  const completed = new Set(completedSessionIds);
  const currentSessions = new Map(currentPlan.weeks.flatMap((week) => week.sessions).map((session) => [session.id, session]));
  const candidateIds = new Set(candidatePlan.weeks.flatMap((week) => week.sessions).map((session) => session.id));
  const weeks = candidatePlan.weeks.map((week) => ({
    ...week,
    sessions: week.sessions.map((session) => (completed.has(session.id) && currentSessions.has(session.id) ? currentSessions.get(session.id) : session)),
  }));

  for (const [id, session] of currentSessions) {
    if (!completed.has(id) || candidateIds.has(id)) continue;
    const targetWeek = weeks.find((week) => week.week === session.week);
    if (targetWeek) targetWeek.sessions = [...targetWeek.sessions, session].sort((left, right) => left.date.localeCompare(right.date));
  }

  return { ...candidatePlan, weeks };
}

export function getChallengeMilestones() {
  return [
    { id: "first", label: "First guided run", minutes: 1 },
    { id: "twenty", label: "20 minute run", minutes: 20 },
    { id: "forty", label: "40 minute run", minutes: 40 },
    { id: "eighty", label: "Long run/walk confidence", minutes: 80 },
    { id: "half", label: "Half marathon checkpoint", minutes: 165 },
  ];
}
