# Stride Zero

Stride Zero is the guided running companion for the 26-week Winter Challenge plan covering June 22–December 20, 2026.

It intentionally handles only run and run/walk sessions:

- Guided timers with speech, sound and vibration cues
- Local completion history, repeats, recovery runs and reminders
- A bundled offline plan
- Validated, versioned plan updates from a static JSON feed
- Update previews that preserve completed sessions and historical logs

Walking, hiking, gym work, flexibility, health tracking and notes belong in the Winter Challenge tracker.

## Plan source

The canonical plan lives in the Winter Challenge project. Its publishing script generates `public/stride-zero-plan.json`, which is copied into this project as `src/plan/bundled-plan.json` for offline use.

Set `EXPO_PUBLIC_PLAN_URL` to override the default public plan URL.

## Run and verify

```bash
npm install
npm run start
npm run lint
npm run plan-check
npm run smoke
npm run check
```
