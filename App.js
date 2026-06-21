import React, { useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Alert, Animated, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { STORAGE_KEY } from "./src/config/storage";
import { APP_VERSION } from "./src/config/product";
import { getUnlockedAchievements } from "./src/engine/achievements";
import { buildRecoveryWeek } from "./src/engine/utils/recoveryHelpers";
import { createWorkoutLog, countCompletedWeeks, summarizeProgress } from "./src/lib/progress";
import { syncDailyReminder } from "./src/lib/notifications";
import { defaultAppState, hydrateAppState } from "./src/lib/profileState";
import {
  describePlanUpdate,
  fetchPlanUpdate,
  getBundledPlan,
  getChallengeMilestones,
  loadCachedPlan,
  PLAN_URL,
  preserveCompletedSessions,
  saveCachedPlan,
} from "./src/plan/planService";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
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
  const [planDocument, setPlanDocument] = useState(getBundledPlan());
  const [ready, setReady] = useState(false);
  const [reminderPermissionGranted, setReminderPermissionGranted] = useState(false);
  const [planUpdateStatus, setPlanUpdateStatus] = useState("Using the bundled offline plan.");
  const [toast, setToast] = useState(null);
  const scrollRef = useRef(null);
  const lastScrollY = useRef(0);
  const tabTranslateY = useRef(new Animated.Value(0)).current;

  const trainingPlan = planDocument.weeks;
  const allSessions = useMemo(() => trainingPlan.flatMap((week) => week.sessions), [trainingPlan]);
  const coreSessions = allSessions;
  const completedSet = useMemo(() => new Set(appState.progress.completedSessionIds), [appState.progress.completedSessionIds]);
  const nextSession = coreSessions.find((session) => !completedSet.has(session.id)) ?? coreSessions.at(-1);
  const currentWeekSessions = trainingPlan.find((week) => week.week === nextSession?.week)?.sessions ?? [];
  const recoveryWeekSessions = appState.plan.recoveryWeek.active ? buildRecoveryWeek(currentWeekSessions) : [];
  const repeatWeekSessions = appState.plan.repeatWeek.active
    ? trainingPlan.find((week) => week.week === appState.plan.repeatWeek.week)?.sessions ?? []
    : [];
  const selectedSession = allSessions.find((session) => session.id === appState.plan.selectedSessionId) ?? nextSession;
  const activeSession = appState.plan.recoveryWeek.active
    ? recoveryWeekSessions[appState.plan.recoveryWeek.completedRuns] ?? recoveryWeekSessions[0] ?? selectedSession
    : appState.plan.repeatWeek.active
      ? repeatWeekSessions[appState.plan.repeatWeek.sessionIndex] ?? repeatWeekSessions[0] ?? selectedSession
      : selectedSession;
  const completedCoreCount = appState.progress.completedSessionIds.filter((id) => coreSessions.some((session) => session.id === id)).length;
  const completionPercent = Math.round((completedCoreCount / coreSessions.length) * 100 || 0);
  const streak = countCompletedWeeks(trainingPlan, completedSet);
  const unlocked = getUnlockedAchievements(appState, coreSessions.length, streak);
  const prevUnlockedRef = useRef(unlocked);
  const weeklyCompletion = trainingPlan.map((week) => week.sessions.filter((session) => completedSet.has(session.id)).length);
  const progressSummary = summarizeProgress(appState.progress.sessionLogs, getChallengeMilestones());

  useEffect(() => {
    loadState();
  }, []);

  useEffect(() => {
    if (ready && unlocked.length > prevUnlockedRef.current.length) {
      const newAchievements = unlocked.filter((item) => !prevUnlockedRef.current.some((previous) => previous.id === item.id));
      if (newAchievements.length) {
        setToast(newAchievements.at(-1));
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
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }, [appState, ready]);

  useEffect(() => {
    if (!ready || !nextSession) return;
    syncDailyReminder(appState.profile, nextSession)
      .then((result) => setReminderPermissionGranted(result.permissionGranted))
      .catch(() => {});
  }, [appState.profile, nextSession, ready]);

  async function loadState() {
    let hydrated = defaultAppState;
    let activePlan = getBundledPlan();
    try {
      const [rawState, cachedPlan] = await Promise.all([AsyncStorage.getItem(STORAGE_KEY), loadCachedPlan()]);
      if (rawState) hydrated = hydrateAppState(JSON.parse(rawState));
      if (cachedPlan && cachedPlan.planVersion >= activePlan.planVersion) {
        activePlan = cachedPlan;
        setPlanUpdateStatus(`Using cached plan version ${cachedPlan.planVersion}.`);
      }
      setAppState(hydrated);
      setPlanDocument(activePlan);
    } finally {
      setReady(true);
      setTimeout(() => checkForPlanUpdate(activePlan, hydrated.progress.completedSessionIds, true), 250);
    }
  }

  async function checkForPlanUpdate(currentPlan = planDocument, completedIds = appState.progress.completedSessionIds, quiet = false) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    setPlanUpdateStatus("Checking the published plan...");
    try {
      const candidate = await fetchPlanUpdate(currentPlan.planVersion, controller.signal);
      if (!candidate) {
        setPlanUpdateStatus(`Plan version ${currentPlan.planVersion} is current.`);
        if (!quiet) Alert.alert("Plan is current", `You already have version ${currentPlan.planVersion}.`);
        return;
      }

      const changes = describePlanUpdate(currentPlan, candidate, completedIds);
      const preview = changes.slice(0, 5).map((change) => `• Week ${change.week}: ${change.type} — ${change.title}`).join("\n");
      const more = changes.length > 5 ? `\n• Plus ${changes.length - 5} more change(s)` : "";
      setPlanUpdateStatus(`Version ${candidate.planVersion} is available.`);
      Alert.alert(
        `Run plan update v${candidate.planVersion}`,
        `${candidate.revisionSummary || "A newer run plan is available."}\n\n${changes.length} future session change(s).\n${preview}${more}\n\nCompleted sessions and workout history will be preserved.`,
        [
          { text: "Later", style: "cancel" },
          {
            text: "Install update",
            onPress: async () => {
              const installed = preserveCompletedSessions(currentPlan, candidate, completedIds);
              await saveCachedPlan(installed);
              setPlanDocument(installed);
              setPlanUpdateStatus(`Installed plan version ${installed.planVersion}.`);
            },
          },
        ]
      );
    } catch (error) {
      const message = error?.name === "AbortError" ? "Plan check timed out. The saved offline plan is still available." : `${error.message} The saved offline plan is still available.`;
      setPlanUpdateStatus(message);
      if (!quiet) Alert.alert("Could not update plan", message);
    } finally {
      clearTimeout(timeout);
    }
  }

  function handleScroll(event) {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;
    if (diff > 5 && currentY > 50) {
      Animated.timing(tabTranslateY, { toValue: 120, duration: 250, useNativeDriver: true }).start();
    } else if (diff < -5 || currentY <= 0) {
      Animated.timing(tabTranslateY, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    }
    lastScrollY.current = currentY;
  }

  function setScreen(currentScreen) {
    setAppState((current) => ({ ...current, ui: { ...current.ui, currentScreen } }));
  }

  function updateSavedProfile(key, value) {
    setAppState((current) => ({ ...current, profile: { ...current.profile, [key]: value } }));
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
  }

  function restartCurrentWeek() {
    const currentIds = new Set(currentWeekSessions.map((session) => session.id));
    setAppState((current) => ({
      ...current,
      progress: {
        ...current.progress,
        completedSessionIds: current.progress.completedSessionIds.filter((id) => !currentIds.has(id)),
      },
      ui: { ...current.ui, currentScreen: "dashboard" },
    }));
  }

  function restartProgram() {
    setAppState((current) => ({
      ...current,
      plan: { ...current.plan, selectedSessionId: coreSessions[0]?.id ?? current.plan.selectedSessionId },
      progress: { ...current.progress, completedSessionIds: [], sessionLogs: [] },
      ui: { ...current.ui, currentScreen: "dashboard" },
    }));
  }

  function injectDummyData() {
    setAppState((current) => {
      const logs = coreSessions.slice(0, 10).map((session, index) => {
        const log = createWorkoutLog(session, "complete");
        const date = new Date(Date.now() - (10 - index) * 172800000);
        log.completedAt = date.toISOString();
        log.dateKey = date.toISOString().slice(0, 10);
        return log;
      });
      return {
        ...current,
        progress: {
          completedSessionIds: [...new Set([...current.progress.completedSessionIds, ...logs.map((log) => log.sessionId)])],
          sessionLogs: [...current.progress.sessionLogs, ...logs],
        },
        ui: { ...current.ui, currentScreen: "dashboard" },
      };
    });
  }

  function beginRun(runMode) {
    setAppState((current) => ({ ...current, ui: { ...current.ui, currentScreen: "run", runMode } }));
  }

  function toggleRecoveryWeek() {
    setAppState((current) => ({
      ...current,
      plan: {
        ...current.plan,
        recoveryWeek: current.plan.recoveryWeek.active
          ? { active: false, completedRuns: 0, targetSessionId: null }
          : { active: true, completedRuns: 0, targetSessionId: nextSession.id },
        repeatWeek: { active: false, week: null, sessionIndex: 0 },
      },
      ui: { ...current.ui, currentScreen: "workout" },
    }));
  }

  function activateRepeatWeek(week) {
    setAppState((current) => ({
      ...current,
      plan: {
        ...current.plan,
        recoveryWeek: { active: false, completedRuns: 0, targetSessionId: null },
        repeatWeek: { active: true, week, sessionIndex: 0 },
      },
      ui: { ...current.ui, currentScreen: "workout", runMode: "repeat" },
    }));
  }

  function completeSelectedSession(runMode) {
    const workoutLog = createWorkoutLog(activeSession, runMode);
    setAppState((current) => {
      const nextProgress = { ...current.progress, sessionLogs: [...current.progress.sessionLogs, workoutLog] };
      if (runMode === "recovery") {
        const completedRuns = current.plan.recoveryWeek.completedRuns + 1;
        const finished = completedRuns >= recoveryWeekSessions.length;
        return {
          ...current,
          progress: nextProgress,
          plan: {
            ...current.plan,
            recoveryWeek: finished ? { active: false, completedRuns: 0, targetSessionId: null } : { ...current.plan.recoveryWeek, completedRuns },
          },
          ui: { ...current.ui, currentScreen: "progress", runMode: "complete" },
        };
      }
      if (runMode === "repeat") {
        const sessionIndex = current.plan.repeatWeek.sessionIndex + 1;
        const finished = sessionIndex >= repeatWeekSessions.length;
        return {
          ...current,
          progress: nextProgress,
          plan: {
            ...current.plan,
            repeatWeek: finished ? { active: false, week: null, sessionIndex: 0 } : { ...current.plan.repeatWeek, sessionIndex },
          },
          ui: { ...current.ui, currentScreen: finished ? "progress" : "workout", runMode: "complete" },
        };
      }

      const completedSessionIds = current.progress.completedSessionIds.includes(activeSession.id)
        ? current.progress.completedSessionIds
        : [...current.progress.completedSessionIds, activeSession.id];
      const updatedSet = new Set(completedSessionIds);
      const upcoming = coreSessions.find((session) => !updatedSet.has(session.id));
      return {
        ...current,
        progress: { ...nextProgress, completedSessionIds },
        plan: { ...current.plan, selectedSessionId: upcoming?.id ?? activeSession.id },
        ui: { ...current.ui, currentScreen: activeSession.isFinal ? "finish" : "progress", runMode: "complete" },
      };
    });
  }

  if (!ready || !activeSession || !nextSession) {
    return (
      <ThemeProvider darkMode={false}>
        <SafeAreaProvider><ThemedLoader /></SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider darkMode={appState.profile.darkMode}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <ThemedAppFrame>
            <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} scrollEventThrottle={16} onScroll={handleScroll}>
              {appState.ui.currentScreen === "dashboard" && (
                <DashboardScreen
                  nextSession={activeSession}
                  completionPercent={completionPercent}
                  completedCount={completedCoreCount}
                  streak={streak}
                  onOpenWorkout={() => setScreen("workout")}
                  onOpenSetup={() => setScreen("settings")}
                  onTakeRecoveryWeek={toggleRecoveryWeek}
                  recoveryWeekActive={appState.plan.recoveryWeek.active}
                />
              )}
              {appState.ui.currentScreen === "plan" && (
                <PlanScreen
                  trainingPlan={trainingPlan}
                  completedSet={completedSet}
                  nextSessionId={nextSession.id}
                  nextSessionWeek={nextSession.week}
                  onSelectSession={selectSession}
                  scrollRef={scrollRef}
                  recoveryWeekActive={appState.plan.recoveryWeek.active}
                  repeatWeekWeek={appState.plan.repeatWeek.active ? appState.plan.repeatWeek.week : null}
                  onRepeatWeek={activateRepeatWeek}
                  planLabel="Winter Challenge run plan"
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
                <RunScreen session={activeSession} cueMode={appState.profile.cueMode} onBack={() => setScreen("workout")} onFinished={completeSelectedSession} runMode={appState.ui.runMode} />
              )}
              {appState.ui.currentScreen === "progress" && (
                <ProgressScreen weeklyCompletion={weeklyCompletion} unlocked={unlocked} nextSession={nextSession} completedCount={completedCoreCount} summary={progressSummary} roadTitle="Road to the half-marathon checkpoint" />
              )}
              {appState.ui.currentScreen === "achievements" && <AchievementsScreen unlocked={unlocked} onBack={() => setScreen("more")} />}
              {appState.ui.currentScreen === "finish" && <FinishScreen onReviewPlan={() => setScreen("plan")} summary={progressSummary} finishLabel="26-week run plan" />}
              {appState.ui.currentScreen === "more" && <MoreScreen onOpenScreen={setScreen} reminderEnabled={appState.profile.reminderEnabled} />}
              {appState.ui.currentScreen === "settings" && (
                <SettingsScreen
                  profile={appState.profile}
                  onChange={updateSavedProfile}
                  onBack={() => setScreen("more")}
                  onReset={resetApp}
                  onRestartWeek={restartCurrentWeek}
                  onRestartProgram={restartProgram}
                  onInjectDummyData={injectDummyData}
                  reminderPermissionGranted={reminderPermissionGranted}
                  planVersion={planDocument.planVersion}
                  planPublishedAt={planDocument.publishedAt}
                  planUpdateStatus={`${planUpdateStatus} Source: ${PLAN_URL}`}
                  onCheckPlanUpdate={() => checkForPlanUpdate()}
                />
              )}
              {["help", "privacy", "support", "safety"].includes(appState.ui.currentScreen) && <InfoScreen screenKey={appState.ui.currentScreen} onBack={() => setScreen("more")} />}
            </ScrollView>

            {!["finish", "run"].includes(appState.ui.currentScreen) && <TabBar currentScreen={appState.ui.currentScreen} onChange={setScreen} style={{ transform: [{ translateY: tabTranslateY }] }} />}
            {toast && (
              <View style={styles.toastContainer}>
                <Text style={styles.toastTitle}>Achievement Unlocked</Text>
                <Text style={styles.toastBody}>{toast.title}</Text>
              </View>
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
      {[["dashboard", "Home"], ["plan", "Plan"], ["progress", "Stats"], ["more", "More"]].map(([key, label]) => (
        <Pressable key={key} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: activeKey === key }} style={[styles.tab, activeKey === key && { backgroundColor: theme.text }]} onPress={() => onChange(key)}>
          <Text style={[styles.tabText, { color: theme.textSoft }, activeKey === key && { color: theme.inverseText }]}>{label}</Text>
        </Pressable>
      ))}
    </Animated.View>
  );
}
