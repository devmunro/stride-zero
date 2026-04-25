export const APP_VERSION = "1.2.0";
export const SUPPORT_EMAIL = "support@stridezero.app";
export const PRIVACY_EMAIL = "privacy@stridezero.app";

export const INFO_CONTENT = {
  help: {
    label: "Help",
    title: "How Stride Zero works",
    intro:
      "Stride Zero builds a beginner-friendly running plan around where you are now, what you are building toward, how many runs fit real life, and the kind of workout cues you want.",
    sections: [
      {
        heading: "Adaptive controls",
        body:
          "If training feels heavy, turn on a recovery week for lighter guided sessions based on your current plan. If you want extra confidence, repeat the whole week without moving your core plan progress forward.",
      },
      {
        heading: "Weekly rhythm",
        body:
          "The app does not lock you into fixed weekdays. You pick how many runs you can usually handle, and the plan stays flexible around that rhythm whether you are building to 30 minutes, 5K, or 10K.",
      },
      {
        heading: "Reminders",
        body:
          "Daily reminders can be turned on in Settings. Pick the time you are most likely to train and the app will nudge you when your next guided session is waiting.",
      },
    ],
  },
  safety: {
    label: "Safety",
    title: "Beginner safety notes",
    intro:
      "The plan is designed for new runners, but it should still feel controlled. Easy days should feel conversational, and rest matters as much as effort.",
    sections: [
      {
        heading: "Rest guidance",
        body:
          "Leave at least one recovery day between harder sessions when you can. Walking, mobility work, and light stretching are fine, but soreness, sharp pain, or unusual fatigue are signs to back off.",
      },
      {
        heading: "Recovery week",
        body:
          "Use a recovery week when motivation dips, life gets busy, or your legs feel overloaded. It is there to keep you consistent, not to punish you for needing a step back.",
      },
      {
        heading: "Medical note",
        body:
          "Stride Zero is educational fitness guidance, not medical advice. If you have chest pain, dizziness, injury concerns, or a health condition that affects exercise, talk to a qualified clinician before continuing.",
      },
    ],
  },
  privacy: {
    label: "Privacy",
    title: "Privacy summary",
    intro:
      "Stride Zero keeps your training state on your device. Reminders use local notifications. No account is required and no cloud sync is built into this version.",
    sections: [
      {
        heading: "What is stored",
        body:
          "The app stores your setup choices, completed runs, recovery sessions, repeat-week logs, reminder preferences, and simple progress summaries in local device storage.",
      },
      {
        heading: "What is not collected",
        body:
          "This version does not ask for name, email, payment details, or precise location. It also does not send your workout history to a server.",
      },
      {
        heading: "Questions",
        body: `Privacy requests can be directed to ${PRIVACY_EMAIL}.`,
      },
    ],
  },
  support: {
    label: "Support",
    title: "Support and release readiness",
    intro:
      "Before public launch, support details should be visible both in-app and in the store listing. This build includes a clear contact path and product notes for review.",
    sections: [
      {
        heading: "Support contact",
        body: `Email ${SUPPORT_EMAIL} for product questions, bug reports, or accessibility feedback.`,
      },
      {
        heading: "Version",
        body: `Current app version: ${APP_VERSION}.`,
      },
      {
        heading: "Release note",
        body:
          "This release adds tuned plan families, repeat-week support, deeper progress tracking, countdown workout cues, real reminders, and store-facing legal/support content.",
      },
    ],
  },
};
