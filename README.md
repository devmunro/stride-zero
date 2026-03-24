# Stride Zero

Stride Zero is a focused Expo / React Native running app that guides a beginner from short run-walk intervals to a first 5K.

## What It Does

- Builds a personalized 9-week plan from onboarding choices
- Saves progress locally on the device
- Includes a guided run timer with sound, speech, and vibration cues
- Tracks completion stats and achievement milestones
- Supports light and dark appearance modes

## Stack

- Expo
- React Native
- AsyncStorage
- expo-audio
- expo-speech
- expo-navigation-bar

## Project Structure

```text
src/
  components/ui/   shared UI primitives
  config/          option lists and storage keys
  data/            training plan data
  lib/             profile and state helpers
  screens/         app screens
  theme/           theme tokens and shared styles
App.js             app entry and screen orchestration
```

## Getting Started

```bash
npm install
npm run start
```

Native shortcuts:

```bash
npm run android
npm run ios
```

Validation:

```bash
npm run check
```

## Notes

- This project is currently scoped as a native Expo app.
- App state is stored locally on-device with AsyncStorage.
- Changing plan-shaping setup options resets progress intentionally so completed runs always match the active training plan.

## Showcase Focus

This repo is meant to demonstrate:

- product thinking around a narrow, clear use case
- clean React Native screen composition
- shared theme and component organization
- safer local-state handling for persisted user progress
