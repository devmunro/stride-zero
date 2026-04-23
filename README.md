# Stride Zero

Stride Zero is a minimal running app for beginners working toward a first 5K.

It is built around a simple idea: black, white, clear structure, and no extra noise. Pick a starting point, follow the plan, run the session, and keep moving.

## What It Does

- Builds a beginner-friendly run-walk plan
- Guides each workout with timed cues
- Saves progress locally on-device
- Tracks simple stats and milestones
- Keeps the interface clean and direct

## Screenshots

The README is set up for the three core screens: dashboard, training plan, and progress.

<p align="center">
  <img src="docs/screenshots/dashboard.jpeg" alt="Dashboard" width="30%" />
  <img src="docs/screenshots/plan.jpeg" alt="Training Plan" width="30%" />
  <img src="docs/screenshots/stats.jpeg" alt="Progress" width="30%" />
</p>

## Run

```bash
npm install
npm run start
```

Shortcuts:

```bash
npm run android
npm run ios
npm run check
```

## Structure

```text
src/
  components/ui/
  config/
  data/
  lib/
  screens/
  theme/
  types/
App.js
```

## Notes

- Native Expo app
- Local storage with AsyncStorage
- Setup changes that reshape the plan can reset progress so the schedule stays accurate

## Repo Description

`Minimal Expo running app for first-5K training with guided sessions, local progress tracking, and a clean black-and-white UI.`
