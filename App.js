import React, { useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { STORAGE_KEY } from "./src/config/storage";
import { achievements, buildTrainingPlan } from "./src/data/trainingPlan";
import { buildSavedSetupState, defaultAppState, defaultProfile, hydrateAppState, shouldResetPlanProgress } from "./src/lib/profileState";
import { SetupScreen } from "./src/screens/SetupScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { PlanScreen } from "./src/screens/PlanScreen";
import { WorkoutScreen } from "./src/screens/WorkoutScreen";
import { RunScreen } from "./src/screens/RunScreen";
import { ProgressScreen } from "./src/screens/ProgressScreen";
import { AchievementsScreen } from "./src/screens/AchievementsScreen";
import { FinishScreen } from "./src/screens/FinishScreen";
import { styles } from "./src/theme/styles";
import { ThemeProvider, useTheme } from "./src/theme/theme";

/**
 * Main application shell that coordinates setup, plan state, and navigation.
 *
 * @returns {JSX.Element} App root
 */
export default function App() {
  const [appState, setAppState] = useState(defaultAppState);
  const [draftProfile, setDraftProfile] = useState(defaultProfile);
  const [ready, setReady] = useState(false);
  const scrollRef = useRef(null);
  const trainingPlan = useMemo(() => buildTrainingPlan(appState.profile), [appState.profile]);
  const allSessions = useMemo(() => trainingPlan.flatMap((week) => week.sessions), [trainingPlan]);

  useEffect(() => {
    loadState();
  }, []);

  useEffect(() => {
    // Hide the Android system navigation by default, while still allowing
    // a swipe from the edge to reveal it temporarily when the user needs it.
    NavigationBar.setPositionAsync("absolute").catch(() => {});
    NavigationBar.setBehaviorAsync("overlay-swipe").catch(() => {});
    NavigationBar.setVisibilityAsync("hidden").catch(() => {});
  }, []);

  useEffect(() => {
    if (ready) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    }
  }, [appState, ready]);

  /**
   * Loads any previously saved app state from async storage.
   *
   * @returns {Promise<void>} Storage load promise
   */
  async function loadState() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const hydratedState = hydrateAppState(JSON.parse(raw));
        setAppState(hydratedState);
        setDraftProfile(hydratedState.profile);
      } else {
        setDraftProfile(defaultProfile);
      }
    } finally {
      setReady(true);
    }
  }

  const completedSet = useMemo(() => new Set(appState.progress.completedSessionIds), [appState.progress.completedSessionIds]);
  const nextSession = allSessions.find((session) => !completedSet.has(session.id)) ?? allSessions[allSessions.length - 1];
  const selectedSession = allSessions.find((session) => session.id === appState.plan.selectedSessionId) ?? nextSession;
  const completionPercent = Math.round((appState.progress.completedSessionIds.length / allSessions.length) * 100);
  const streakCounts = trainingPlan.map((week) => week.sessions.filter((session) => completedSet.has(session.id)).length);
  const streak = streakCounts.findIndex((count) => count < 3) === -1 ? trainingPlan.length : Math.max(0, streakCounts.findIndex((count) => count < 3));
  const unlocked = achievements.filter((item) => appState.progress.completedSessionIds.length >= item.unlockAt);
  const weeklyCompletion = trainingPlan.map((week) => week.sessions.filter((session) => completedSet.has(session.id)).length);
  const longestRun = Math.max(0, ...allSessions.filter((session) => completedSet.has(session.id)).map((session) => session.longestRun));
  const totalMinutes = allSessions.filter((session) => completedSet.has(session.id)).reduce((sum, session) => sum + session.totalMinutes, 0);

  /**
   * Updates the active screen inside the single-screen app shell.
   *
   * @param {string} currentScreen Screen identifier
   * @returns {void}
   */
  function setScreen(currentScreen) {
    setAppState((current) => ({
      ...current,
      ui: { ...current.ui, currentScreen },
    }));
  }

  /**
   * Opens the setup editor using the currently saved profile as the draft base.
   *
   * @returns {void}
   */
  function openSetupEditor() {
    setDraftProfile(appState.profile);
    setScreen("setup");
  }

  /**
   * Updates a single profile field while preserving the rest of the profile.
   *
   * @param {string} key Profile field name
   * @param {*} value New field value
   * @returns {void}
   */
  function updateProfile(key, value) {
    setDraftProfile((current) => ({ ...current, [key]: value }));
  }

  /**
   * Completes first-time setup and initializes the plan state.
   *
   * @returns {void}
   */
  function finishSetup() {
    setAppState((current) => buildSavedSetupState(current, draftProfile, true));
  }

  /**
   * Saves edited setup values and resets progress only when the plan changes.
   *
   * @returns {void}
   */
  function saveSetup() {
    const willResetProgress =
      appState.progress.completedSessionIds.length > 0 &&
      shouldResetPlanProgress(appState.profile, draftProfile);

    if (willResetProgress) {
      Alert.alert(
        "Reset current progress?",
        "Changing your starting point, weekly rhythm, or focus will rebuild the plan and clear completed runs so the schedule stays accurate.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Save and reset",
            style: "destructive",
            onPress: () => {
              setAppState((current) => buildSavedSetupState(current, draftProfile, false));
            },
          },
        ]
      );
      return;
    }

    setAppState((current) => buildSavedSetupState(current, draftProfile, false));
  }

  /**
   * Opens the selected session in the workout preview screen.
   *
   * @param {string} sessionId Session identifier
   * @returns {void}
   */
  function selectSession(sessionId) {
    setAppState((current) => ({
      ...current,
      plan: { ...current.plan, selectedSessionId: sessionId },
      ui: { ...current.ui, currentScreen: "workout" },
    }));
  }

  /**
   * Clears persisted state and returns the app to its initial defaults.
   *
   * @returns {Promise<void>} Reset promise
   */
  async function resetApp() {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setAppState(defaultAppState);
    setDraftProfile(defaultProfile);
  }

  /**
   * Marks the selected session complete and advances to the next screen.
   *
   * @returns {void}
   */
  function completeSelectedSession() {
    setAppState((current) => {
      if (current.progress.completedSessionIds.includes(selectedSession.id)) {
        return {
          ...current,
          ui: { ...current.ui, currentScreen: selectedSession.isFinal ? "finish" : "progress" },
        };
      }

      const completedSessionIds = [...current.progress.completedSessionIds, selectedSession.id];
      const updatedSet = new Set(completedSessionIds);
      const upcoming = allSessions.find((session) => !updatedSet.has(session.id));

      return {
        ...current,
        progress: {
          ...current.progress,
          completedSessionIds,
        },
        plan: {
          ...current.plan,
          selectedSessionId: upcoming?.id ?? selectedSession.id,
        },
        ui: {
          ...current.ui,
          currentScreen: selectedSession.isFinal ? "finish" : "progress",
        },
      };
    });
  }

  if (!ready) {
    return (
      <ThemeProvider darkMode={false}>
        <SafeAreaProvider>
          <ThemedLoader />
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider darkMode={appState.profile.darkMode}>
      <SafeAreaProvider>
        <ThemedAppFrame>
          {appState.plan.hasSetup ? (
            <>
              <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {appState.ui.currentScreen === "dashboard" && (
                  <DashboardScreen
                    profile={appState.profile}
                    nextSession={nextSession}
                    completionPercent={completionPercent}
                    completedCount={appState.progress.completedSessionIds.length}
                    streak={streak}
                    onOpenWorkout={() => selectSession(nextSession.id)}
                    onOpenSetup={openSetupEditor}
                  />
                )}
                {appState.ui.currentScreen === "plan" && (
                  <PlanScreen
                    trainingPlan={trainingPlan}
                    completedSet={completedSet}
                    nextSessionId={nextSession.id}
                    onSelectSession={selectSession}
                    scrollRef={scrollRef}
                  />
                )}
                {appState.ui.currentScreen === "workout" && (
                  <WorkoutScreen
                    session={selectedSession}
                    isCompleted={completedSet.has(selectedSession.id)}
                    onStartRun={() => setScreen("run")}
                  />
                )}
                {appState.ui.currentScreen === "run" && (
                  <RunScreen
                    session={selectedSession}
                    cueMode={appState.profile.cueMode}
                    onBack={() => setScreen("workout")}
                    onFinished={completeSelectedSession}
                  />
                )}
                {appState.ui.currentScreen === "progress" && (
                  <ProgressScreen
                    weeklyCompletion={weeklyCompletion}
                    longestRun={longestRun}
                    totalMinutes={totalMinutes}
                    unlocked={unlocked}
                    nextSession={nextSession}
                    completedCount={appState.progress.completedSessionIds.length}
                  />
                )}
                {appState.ui.currentScreen === "achievements" && <AchievementsScreen unlocked={unlocked} />}
                {appState.ui.currentScreen === "finish" && <FinishScreen onReviewPlan={() => setScreen("plan")} />}
                {appState.ui.currentScreen === "setup" && (
                  <SetupScreen
                    profile={draftProfile}
                    onChange={updateProfile}
                    onContinue={saveSetup}
                    onReset={resetApp}
                    compact
                  />
                )}
              </ScrollView>

              {!["finish", "run"].includes(appState.ui.currentScreen) && (
                <TabBar currentScreen={appState.ui.currentScreen} onChange={setScreen} />
              )}
            </>
          ) : (
            <SetupScreen profile={draftProfile} onChange={updateProfile} onContinue={finishSetup} />
          )}
        </ThemedAppFrame>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

/**
 * Lightweight loading shell shown while persisted state is being restored.
 *
 * @returns {JSX.Element} Loading screen
 */
function ThemedLoader() {
  const theme = useTheme();
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={["top", "left", "right"]}>
      <StatusBar style={theme.name === "dark" ? "light" : "dark"} translucent={false} />
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="small" color={theme.text} />
        <Text style={[styles.loaderText, { color: theme.textMuted }]}>Loading...</Text>
      </View>
    </SafeAreaView>
  );
}

/**
 * Applies the shared safe-area and phone-shell layout around the app.
 *
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children Nested screen content
 * @returns {JSX.Element} App frame
 */
function ThemedAppFrame({ children }) {
  const theme = useTheme();
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={["top", "left", "right"]}>
      <StatusBar style={theme.name === "dark" ? "light" : "dark"} translucent={false} />
      <View style={styles.appFrame}>
        <View style={[styles.phoneShell, { backgroundColor: theme.surface, borderColor: theme.border }]}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

/**
 * Bottom navigation for the main non-timer screens.
 *
 * @param {Object} props Component props
 * @param {string} props.currentScreen Active screen key
 * @param {Function} props.onChange Navigation callback
 * @returns {JSX.Element} Tab bar
 */
function TabBar({ currentScreen, onChange }) {
  const theme = useTheme();
  return (
    <View style={[styles.tabBar, { backgroundColor: theme.overlay, borderColor: theme.border }]}>
      {[
        ["dashboard", "Home"],
        ["plan", "Plan"],
        ["progress", "Stats"],
        ["achievements", "Wins"],
      ].map(([key, label]) => (
        <Pressable
          key={key}
          accessibilityRole="tab"
          accessibilityLabel={label}
          accessibilityState={{ selected: currentScreen === key }}
          style={[styles.tab, currentScreen === key && { backgroundColor: theme.text }]}
          onPress={() => onChange(key)}
        >
          <Text style={[styles.tabText, { color: theme.textSoft }, currentScreen === key && { color: theme.inverseText }]}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
