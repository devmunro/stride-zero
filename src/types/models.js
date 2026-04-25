/**
 * User profile choices that influence plan generation and app presentation.
 *
 * @typedef {Object} Profile
 * @property {string} experienceLevel Selected experience level
 * @property {string} goal Selected running goal
 * @property {string} weeklyPattern Selected weekly schedule
 * @property {string} cueMode Cue preference for the timer
 * @property {boolean} darkMode Whether dark mode is enabled
 * @property {boolean} reminderEnabled Whether daily reminders are enabled
 * @property {string} reminderTime Reminder time in HH:MM
 */

/**
 * A single timed step inside a workout session.
 *
 * @typedef {Object} SessionStep
 * @property {"run"|"walk"} type Step type
 * @property {number} seconds Step duration in seconds
 * @property {string} label Display label
 */

/**
 * A display-ready workout session.
 *
 * @typedef {Object} Session
 * @property {string} id Unique session id
 * @property {number} week Display week number
 * @property {number} run Run number within the week
 * @property {string} title Session title
 * @property {string} summary Session summary
 * @property {Array<[string, string]>} blocks Human-readable workout blocks
 * @property {number} longestRun Longest continuous run in minutes
 * @property {SessionStep[]} steps Timer steps
 * @property {number} totalMinutes Rounded workout length in minutes
 * @property {number} totalSeconds Exact workout length in seconds
 * @property {boolean} isFinal Whether this is the final plan session
 * @property {string} [dayLabel] Optional weekly label for the session
 * @property {number} [sourceWeek] Source plan week used to build the session
 * @property {boolean} [countsTowardPlan] Whether this session advances the plan
 * @property {boolean} [isOptional] Whether this session is optional support work
 */

/**
 * Achievement metadata unlocked by completed sessions.
 *
 * @typedef {Object} Achievement
 * @property {string} id Unique achievement id
 * @property {string} title Achievement title
 * @property {string} detail Achievement description
 * @property {number} unlockAt Required completed session count
 */

/**
 * Persisted plan state that tracks navigation inside the active plan.
 *
 * @typedef {Object} PlanState
 * @property {boolean} hasSetup Whether onboarding is complete
 * @property {string} selectedSessionId Selected session id
 * @property {{active: boolean, completedRuns: number, targetSessionId: string|null}} recoveryWeek Recovery-week status
 * @property {{active: boolean, week: number|null, sessionIndex: number}} repeatWeek Repeat-week status
 */

/**
 * Persisted workout progress and derived milestones.
 *
 * @typedef {Object} ProgressState
 * @property {string[]} completedSessionIds Completed session ids
 * @property {Object[]} sessionLogs Workout history
 */

/**
 * Persisted UI state for the single-screen shell.
 *
 * @typedef {Object} UiState
 * @property {string} currentScreen Active screen key
 * @property {string|null} detailScreen Active detail screen key
 * @property {"complete"|"repeat"|"recovery"} [runMode] Current run save mode
 */

/**
 * Full persisted application state grouped by domain.
 *
 * @typedef {Object} AppState
 * @property {Profile} profile Profile domain
 * @property {PlanState} plan Plan domain
 * @property {ProgressState} progress Progress domain
 * @property {UiState} ui UI domain
 */

export const modelDocs = {};
