import React, { useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Alert, Animated, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { STORAGE_KEY } from "./src/config/storage";
import { APP_VERSION } from "./src/config/product";
import {
  achievements,
  getUnlockedAchievements,
  buildRecoveryWeek,
  buildTrainingPlan,
  getPlanLabel,
  getPlanMilestones,
} from "./src/engine";
import { createWorkoutLog, countCompletedWeeks, summarizeProgress } from "./src/lib/progress";
import { syncDailyReminder } from "./src/lib/notifications";
import { buildSavedSetupState, defaultAppState, defaultProfile, hydrateAppState, shouldResetPlanProgress } from "./src/lib/profileState";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { SetupScreen } from "./src/screens/SetupScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { PlanScreen } from "./src/screens/PlanScreen";
import { WorkoutScreen } from "./src/screens/WorkoutScreen";
import { RunScreen } from "./src/screens/RunScreen";
import { ProgressScreen } from "./src/screens/ProgressScreen";
import { AchievementsScreen } from "./src/screens/AchievementsScreen";
import { FinishScreen } from "./src/screens/FinishScreen";
import { MoreScreen } from "./src/screens/MoreScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { InfoScreen } from "./src/screens/InfoScreen";
import { styles } from "./src/theme/styles";
import { ThemeProvider, useTheme } from "./src/theme/theme";

export default function App() {
  const [appState, setAppState] = useState(defaultAppState);
  const [draftProfile, setDraftProfile] = useState(defaultProfile);
  const [ready, setReady] = useState(false);
  const [reminderPermissionGranted, setReminderPermissionGranted] = useState(false);
  const scrollRef = useRef(null);
  const lastScrollY = useRef(0);
  const tabTranslateY = useRef(new Animated.Value(0)).current;

  const handleScroll = (event) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;
    
    if (diff > 5 && currentY > 50) {
      Animated.timing(tabTranslateY, {
        toValue: 120,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else if (diff < -5 || currentY <= 0) {
      Animated.timing(tabTranslateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
    lastScrollY.current = currentY;
  };

  const trainingPlan = useMemo(() => buildTrainingPlan(appState.profile), [appState.profile]);
  const allSessions = useMemo(() => trainingPlan.flatMap((week) => week.sessions), [trainingPlan]);
  const coreSessions = useMemo(() => allSessions.filter((session) => session.countsTowardPlan !== false), [allSessions]);
  const completedSet = useMemo(() => new Set(appState.progress.completedSessionIds), [appState.progress.completedSessionIds]);
  const [toast, setToast] = useState(null);
  const nextSession = coreSessions.find((session) => !completedSet.has(session.id)) ?? coreSessions[coreSessions.length - 1];
  const currentWeekSessions = useMemo(
    () => trainingPlan.find((week) => week.week === nextSession.week)?.sessions ?? [],
    [trainingPlan, nextSession]
  );
  const recoveryWeekSessions = useMemo(
    () => (appState.plan.recoveryWeek.active ? buildRecoveryWeek(currentWeekSessions) : []),
    [appState.plan.recoveryWeek.active, currentWeekSessions]
  );
  const repeatWeekSessions = useMemo(() => {
    if (!appState.plan.repeatWeek.active || !appState.plan.repeatWeek.week) {
      return [];
    }

    return trainingPlan.find((week) => week.week === appState.plan.repeatWeek.week)?.sessions ?? [];
  }, [appState.plan.repeatWeek, trainingPlan]);
  const selectedSession =
    allSessions.find((session) => session.id === appState.plan.selectedSessionId) ??
    nextSession;
  const activeSession = appState.plan.recoveryWeek.active
    ? recoveryWeekSessions[appState.plan.recoveryWeek.completedRuns] ?? recoveryWeekSessions[0] ?? selectedSession
    : appState.plan.repeatWeek.active
      ? repeatWeekSessions[appState.plan.repeatWeek.sessionIndex] ?? repeatWeekSessions[0] ?? selectedSession
      : selectedSession;
  const completionPercent = Math.round((appState.progress.completedSessionIds.filter((id) => coreSessions.some((session) => session.id === id)).length / coreSessions.length) * 100 || 0);
  const streak = countCompletedWeeks(trainingPlan, completedSet);
  const unlocked = getUnlockedAchievements(appState, coreSessions.length, streak);
  const prevUnlockedRef = useRef(unlocked);
  const weeklyCompletion = trainingPlan.map((week) =>
    week.sessions.filter((session) => session.countsTowardPlan !== false && completedSet.has(session.id)).length
  );
  const planLabel = useMemo(() => getPlanLabel(appState.profile), [appState.profile]);
  const planMilestones = useMemo(() => getPlanMilestones(appState.profile), [appState.profile]);
  const progressSummary = useMemo(() => summarizeProgress(appState.progress.sessionLogs, planMilestones), [appState.progress.sessionLogs, planMilestones]);

  useEffect(() => {
    loadState();
  }, []);

  useEffect(() => {
    if (ready && unlocked.length > prevUnlockedRef.current.length) {
      const newAchievements = unlocked.filter((u) => !prevUnlockedRef.current.some((pu) => pu.id === u.id));
      if (newAchievements.length > 0) {
        setToast(newAchievements[newAchievements.length - 1]);
        setTimeout(() => setToast(null), 4000);
      }
    }
    prevUnlockedRef.current = unlocked;
  }, [unlocked, ready]);

  useEffect(() => {
    NavigationBar.setPositionAsync("absolute").catch(() => {});
    NavigationBar.setBehaviorAsync("overlay-swipe").catch(() => {});
    NavigationBar.setVisibilityAsync("hidden").catch(() => {});
  }, []);

  useEffect(() => {
    if (ready) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    }
  }, [appState, ready]);

  useEffect(() => {
    if (!ready || !nextSession) return;

    syncDailyReminder(appState.profile, nextSession)
      .then((result) => {
        setReminderPermissionGranted(result.permissionGranted);
      })
      .catch(() => {});
  }, [appState.profile, nextSession, ready]);

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

  function setScreen(currentScreen, extraUi = {}) {
    setAppState((current) => ({
      ...current,
      ui: { ...current.ui, currentScreen, ...extraUi },
    }));
  }

  function openSetupEditor() {
    setDraftProfile(appState.profile);
    setScreen("settings");
  }

  function editPlanSetup() {
    setDraftProfile(appState.profile);
    setScreen("setup");
  }

  function updateProfile(key, value) {
    setDraftProfile((current) => ({ ...current, [key]: value }));
  }

  function updateSavedProfile(key, value) {
    setAppState((current) => ({
      ...current,
      profile: { ...current.profile, [key]: value },
    }));
  }

  function finishSetup() {
    setAppState((current) => buildSavedSetupState(current, draftProfile, true));
  }

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

  function selectSession(sessionId) {
    setAppState((current) => ({
      ...current,
      plan: { ...current.plan, selectedSessionId: sessionId },
      ui: { ...current.ui, currentScreen: "workout" },
    }));
  }

  async function resetApp() {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setAppState(defaultAppState);
    setDraftProfile(defaultProfile);
  }

  function restartCurrentWeek() {
    setAppState((current) => {
      // Find the week that the user is currently on
      const week = nextSession ? nextSession.week : null;
      if (!week) return current;
      
      const weekPrefix = `${week}-`;
      const completedSessionIds = current.progress.completedSessionIds.filter(
        (id) => !id.startsWith(weekPrefix)
      );

      return {
        ...current,
        progress: {
          ...current.progress,
          completedSessionIds,
        },
        ui: {
          ...current.ui,
          currentScreen: "dashboard",
        },
      };
    });
  }

  function restartProgram() {
    setAppState((current) => ({
      ...current,
      progress: {
        ...current.progress,
        completedSessionIds: [],
        sessionLogs: [],
      },
      ui: {
        ...current.ui,
        currentScreen: "dashboard",
      },
    }));
  }

  function injectDummyData() {
    setAppState((current) => {
      const dummyLogs = [];
      const dummySessionIds = [];
      const now = new Date();
      
      coreSessions.slice(0, 15).forEach((session, i) => {
         const log = createWorkoutLog(session, "complete");
         const pastDate = new Date(now.getTime() - (15 - i) * 86400000 * 2.3);
         log.completedAt = pastDate.toISOString();
         const month = String(pastDate.getMonth() + 1).padStart(2, "0");
         const day = String(pastDate.getDate()).padStart(2, "0");
         log.dateKey = `${pastDate.getFullYear()}-${month}-${day}`;
         dummyLogs.push(log);
         dummySessionIds.push(session.id);
      });

      return {
        ...current,
        progress: {
          ...current.progress,
          completedSessionIds: [...new Set([...current.progress.completedSessionIds, ...dummySessionIds])],
          sessionLogs: [...current.progress.sessionLogs, ...dummyLogs],
        },
        ui: {
          ...current.ui,
          currentScreen: "dashboard",
        }
      };
    });
  }

  function beginRun(runMode) {
    setAppState((current) => ({
      ...current,
      ui: { ...current.ui, currentScreen: "run", runMode },
    }));
  }

  function toggleRecoveryWeek() {
    setAppState((current) => ({
      ...current,
      plan: {
        ...current.plan,
        recoveryWeek: current.plan.recoveryWeek.active
          ? {
              active: false,
              completedRuns: 0,
              targetSessionId: null,
            }
          : {
              active: true,
              completedRuns: 0,
              targetSessionId: nextSession.id,
            },
        repeatWeek: {
          active: false,
          week: null,
          sessionIndex: 0,
        },
      },
      ui: {
        ...current.ui,
        currentScreen: "workout",
      },
    }));
  }

  function activateRepeatWeek(week) {
    setAppState((current) => ({
      ...current,
      plan: {
        ...current.plan,
        recoveryWeek: {
          active: false,
          completedRuns: 0,
          targetSessionId: null,
        },
        repeatWeek: {
          active: true,
          week,
          sessionIndex: 0,
        },
      },
      ui: {
        ...current.ui,
        currentScreen: "workout",
        runMode: "repeat",
      },
    }));
  }

  function completeSelectedSession(runMode) {
    const workoutLog = createWorkoutLog(activeSession, runMode);

    setAppState((current) => {
      const nextProgress = {
        ...current.progress,
        sessionLogs: [...current.progress.sessionLogs, workoutLog],
      };

      if (runMode === "recovery") {
        const completedRuns = current.plan.recoveryWeek.completedRuns + 1;
        const recoveryFinished = completedRuns >= recoveryWeekSessions.length;

        return {
          ...current,
          progress: nextProgress,
          plan: {
            ...current.plan,
            recoveryWeek: recoveryFinished
              ? { active: false, completedRuns: 0, targetSessionId: null }
              : { ...current.plan.recoveryWeek, completedRuns },
          },
          ui: {
            ...current.ui,
            currentScreen: "progress",
            runMode: "complete",
          },
        };
      }

      if (runMode === "repeat") {
        const nextRepeatIndex = current.plan.repeatWeek.sessionIndex + 1;
        const repeatFinished = nextRepeatIndex >= repeatWeekSessions.length;

        return {
          ...current,
          progress: nextProgress,
          plan: {
            ...current.plan,
            repeatWeek: repeatFinished
              ? { active: false, week: null, sessionIndex: 0 }
              : { ...current.plan.repeatWeek, sessionIndex: nextRepeatIndex },
          },
          ui: {
            ...current.ui,
            currentScreen: repeatFinished ? "progress" : "workout",
            runMode: "complete",
          },
        };
      }

      const isAlreadyComplete = current.progress.completedSessionIds.includes(selectedSession.id);
      const completedSessionIds = isAlreadyComplete ? current.progress.completedSessionIds : [...current.progress.completedSessionIds, selectedSession.id];
      const updatedSet = new Set(completedSessionIds);
      const upcoming = coreSessions.find((session) => !updatedSet.has(session.id));

      return {
        ...current,
        progress: {
          ...nextProgress,
          completedSessionIds,
        },
        plan: {
          ...current.plan,
          selectedSessionId: upcoming?.id ?? selectedSession.id,
        },
        ui: {
          ...current.ui,
          currentScreen: selectedSession.isFinal ? "finish" : "progress",
          runMode: "complete",
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
    <ThemeProvider darkMode={appState.plan.hasSetup && appState.ui.currentScreen !== "setup" ? appState.profile.darkMode : draftProfile.darkMode}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <ThemedAppFrame>
            {appState.plan.hasSetup ? (
              <>
                <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} scrollEventThrottle={16} onScroll={handleScroll}>
                  {appState.ui.currentScreen === "dashboard" && (
                    <DashboardScreen
                      nextSession={activeSession}
                      completionPercent={completionPercent}
                      completedCount={appState.progress.completedSessionIds.length}
                      streak={streak}
                      onOpenWorkout={() => setScreen("workout")}
                      onOpenSetup={openSetupEditor}
                      onTakeRecoveryWeek={toggleRecoveryWeek}
                      recoveryWeekActive={appState.plan.recoveryWeek.active}
                    />
                  )}
                  {appState.ui.currentScreen === "plan" && (
                    <PlanScreen
                      trainingPlan={trainingPlan}
                      completedSet={completedSet}
                      nextSessionId={nextSession.id}
                      onSelectSession={selectSession}
                      scrollRef={scrollRef}
                      recoveryWeekActive={appState.plan.recoveryWeek.active}
                      repeatWeekWeek={appState.plan.repeatWeek.active ? appState.plan.repeatWeek.week : null}
                      onRepeatWeek={activateRepeatWeek}
                      planLabel={planLabel}
                    />
                  )}
                  {appState.ui.currentScreen === "workout" && (
                    <WorkoutScreen
                      session={activeSession}
                      isCompleted={completedSet.has(activeSession.id)}
                      onStartRun={() => beginRun(appState.plan.recoveryWeek.active ? "recovery" : appState.plan.repeatWeek.active ? "repeat" : "complete")}
                      onTakeRecoveryWeek={toggleRecoveryWeek}
                      canTakeRecoveryWeek={!appState.plan.recoveryWeek.active && !appState.plan.repeatWeek.active}
                      isRecoveryMode={appState.plan.recoveryWeek.active}
                      isRepeatWeekMode={appState.plan.repeatWeek.active}
                    />
                  )}
                  {appState.ui.currentScreen === "run" && (
                    <RunScreen
                      session={activeSession}
                      cueMode={appState.profile.cueMode}
                      onBack={() => setScreen("workout")}
                      onFinished={completeSelectedSession}
                      runMode={appState.ui.runMode}
                    />
                  )}
                  {appState.ui.currentScreen === "progress" && (
                    <ProgressScreen
                      weeklyCompletion={weeklyCompletion}
                      unlocked={unlocked}
                      nextSession={nextSession}
                      completedCount={appState.progress.completedSessionIds.length}
                      summary={progressSummary}
                      roadTitle={appState.profile.goal}
                    />
                  )}
                  {appState.ui.currentScreen === "achievements" && <AchievementsScreen unlocked={unlocked} onBack={() => setScreen("more")} />}
                  {appState.ui.currentScreen === "finish" && (
                    <FinishScreen
                      onReviewPlan={() => setScreen("plan")}
                      summary={progressSummary}
                      finishLabel={appState.profile.goal === "Build to 10K" ? "10K" : appState.profile.goal === "Build to 30 minutes" ? "30m" : "5K"}
                    />
                  )}
                  {appState.ui.currentScreen === "more" && (
                    <MoreScreen onOpenScreen={(screen) => setScreen(screen)} reminderEnabled={appState.profile.reminderEnabled} />
                  )}
                  {appState.ui.currentScreen === "settings" && (
                    <SettingsScreen
                      profile={appState.profile}
                      onChange={updateSavedProfile}
                      onOpenSetup={editPlanSetup}
                      onBack={() => setScreen("more")}
                      onReset={resetApp}
                      onRestartWeek={restartCurrentWeek}
                      onRestartProgram={restartProgram}
                      onInjectDummyData={injectDummyData}
                      reminderPermissionGranted={reminderPermissionGranted}
                    />
                  )}
                  {["help", "privacy", "support", "safety"].includes(appState.ui.currentScreen) && (
                    <InfoScreen screenKey={appState.ui.currentScreen} onBack={() => setScreen("more")} />
                  )}
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

                {!["finish", "run"].includes(appState.ui.currentScreen) && <TabBar currentScreen={appState.ui.currentScreen} onChange={setScreen} style={{ transform: [{ translateY: tabTranslateY }] }} />}
                {toast && (
                  <View style={styles.toastContainer}>
                    <Text style={styles.toastTitle}>Achievement Unlocked</Text>
                    <Text style={styles.toastBody}>{toast.title}</Text>
                  </View>
                )}
              </>
            ) : (
              <SetupScreen
                profile={draftProfile}
                onChange={updateProfile}
                onContinue={finishSetup}
              />
            )}
          </ThemedAppFrame>
        </ErrorBoundary>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

function ThemedLoader() {
  const theme = useTheme();
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={["top", "left", "right"]}>
      <StatusBar style={theme.name === "dark" ? "light" : "dark"} translucent={false} />
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="small" color={theme.text} />
        <Text style={[styles.loaderText, { color: theme.textMuted }]}>{`Loading Stride Zero ${APP_VERSION}...`}</Text>
      </View>
    </SafeAreaView>
  );
}

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

function TabBar({ currentScreen, onChange, style }) {
  const theme = useTheme();
  const activeKey = ["settings", "help", "privacy", "support", "safety", "achievements"].includes(currentScreen) ? "more" : currentScreen;

  return (
    <Animated.View style={[styles.tabBar, { backgroundColor: theme.overlay, borderColor: theme.border }, style]}>
      {[
        ["dashboard", "Home"],
        ["plan", "Plan"],
        ["progress", "Stats"],
        ["more", "More"],
      ].map(([key, label]) => (
        <Pressable
          key={key}
          accessibilityRole="tab"
          accessibilityLabel={label}
          accessibilityState={{ selected: activeKey === key }}
          style={[styles.tab, activeKey === key && { backgroundColor: theme.text }]}
          onPress={() => onChange(key)}
        >
          <Text style={[styles.tabText, { color: theme.textSoft }, activeKey === key && { color: theme.inverseText }]}>{label}</Text>
        </Pressable>
      ))}
    </Animated.View>
  );
}
