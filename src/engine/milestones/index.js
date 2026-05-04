/**
 * Provides goals tailored to the user profile.
 */
export function getPlanMilestones(profile) {
  if (profile.goal === "Build to 10K") {
    return [
      { id: "thirty", label: "30 minute run", minutes: 30 },
      { id: "forty", label: "40 minute run", minutes: 40 },
      { id: "fifty", label: "50 minute run", minutes: 50 },
      { id: "sixty", label: "60 minute run", minutes: 60 },
      { id: "tenk", label: "10K ready", minutes: 70 },
    ];
  }

  if (profile.goal === "Run a better 5K") {
    return [
      { id: "twenty", label: "20 minute run", minutes: 20 },
      { id: "thirty", label: "30 minute run", minutes: 30 },
      { id: "tempo", label: "Tempo control", minutes: 34 },
      { id: "race", label: "Stronger 5K", minutes: 35 },
    ];
  }

  if (profile.goal === "Build to 30 minutes") {
    return [
      { id: "one", label: "First run minute", minutes: 1 },
      { id: "five", label: "5 minute run", minutes: 5 },
      { id: "ten", label: "10 minute run", minutes: 10 },
      { id: "twenty", label: "20 minute run", minutes: 20 },
      { id: "thirty", label: "30 minute run", minutes: 30 },
    ];
  }

  return [
    { id: "warmup", label: "Getting started", minutes: 1 },
    { id: "five", label: "5 minute run", minutes: 5 },
    { id: "ten", label: "10 minute run", minutes: 10 },
    { id: "twenty", label: "20 minute run", minutes: 20 },
    { id: "thirty", label: "30 minute run", minutes: 30 },
    { id: "finish", label: "5K ready", minutes: 35 },
  ];
}
