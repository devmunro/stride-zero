import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, Vibration, View } from "react-native";
import { useAudioPlayer } from "expo-audio";
import { useKeepAwake } from "expo-keep-awake";
import * as Speech from "expo-speech";
import { Body, Card, GhostButton, InfoLine, PrimaryButton, Title } from "../components/ui/UI";
import { styles } from "../theme/styles";
import { useTheme } from "../theme/theme";

/**
 * Formats seconds as MM:SS for the workout timer display.
 *
 * @param {number} totalSeconds Remaining time in seconds
 * @returns {string} Formatted timer text
 */
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Resolves cue preferences into sound and vibration flags.
 *
 * @param {string} mode Cue mode selected in setup
 * @returns {{sound: boolean, vibration: boolean}} Cue flags
 */
function cueFlags(mode) {
  if (mode === "Vibration only") return { sound: false, vibration: true };
  if (mode === "Off") return { sound: false, vibration: false };
  return { sound: true, vibration: true };
}

/**
 * Runs the active workout timer, cues, and lock controls.
 *
 * @param {Object} props Component props
 * @param {Object} props.session Active workout session
 * @param {string} props.cueMode Current cue preference
 * @param {Function} props.onBack Returns to the workout summary
 * @param {Function} props.onFinished Saves the workout as complete
 * @returns {JSX.Element} Run screen
 */
export function RunScreen({ session, cueMode, onBack, onFinished }) {
  useKeepAwake();
  const theme = useTheme();
  const player = useAudioPlayer(require("../../assets/ding.wav"));
  const [stepIndex, setStepIndex] = useState(0);
  const [remaining, setRemaining] = useState(session.steps[0]?.seconds ?? 0);
  const [running, setRunning] = useState(true);
  const [finished, setFinished] = useState(false);
  const [locked, setLocked] = useState(true);
  const [cues, setCues] = useState(cueFlags(cueMode));
  const unlockTimeout = useRef(null);
  const cueTimeouts = useRef([]);
  const startedCueRef = useRef(null);

  useEffect(() => {
    setStepIndex(0);
    setRemaining(session.steps[0]?.seconds ?? 0);
    setRunning(true);
    setFinished(false);
    setLocked(true);
    setCues(cueFlags(cueMode));
    startedCueRef.current = null;
  }, [session.id, cueMode]);

  useEffect(() => {
    return () => {
      if (unlockTimeout.current) {
        clearTimeout(unlockTimeout.current);
      }
      clearCueTimeouts();
      Speech.stop();
    };
  }, []);

  useEffect(() => {
    if (!running || startedCueRef.current === session.id) return;
    startedCueRef.current = session.id;
    fireCue(false, session.steps[0]?.type ?? "walk");
  }, [running, session.id]);

  useEffect(() => {
    if (!running) return undefined;

    const timer = setInterval(() => {
      setRemaining((current) => {
        if (current > 1) return current - 1;

        const nextIndex = stepIndex + 1;
        const nextStep = session.steps[nextIndex];

        if (!nextStep) {
          clearInterval(timer);
          setRunning(false);
          fireCue(true, null);
          setFinished(true);
          return 0;
        }

        setStepIndex(nextIndex);
        fireCue(false, nextStep.type);
        return nextStep.seconds;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [running, session.steps, stepIndex]);

  const currentStep = session.steps[stepIndex] ?? session.steps[session.steps.length - 1];
  const nextStep = session.steps[stepIndex + 1];
  const totalRemaining = useMemo(
    () => remaining + session.steps.slice(stepIndex + 1).reduce((sum, item) => sum + item.seconds, 0),
    [remaining, session.steps, stepIndex]
  );

  function fireCue(isFinish, targetType) {
    if (cues.sound) {
      playCuePattern(isFinish ? "Workout completed" : `Start ${targetType === "run" ? "running" : "walking"}`);
    }

    if (cues.vibration) {
      if (isFinish) {
        Vibration.vibrate([0, 220, 120, 280]);
      } else {
        Vibration.vibrate(220);
      }
    }
  }

  /**
   * Clears any pending cue timers before scheduling a new cue pattern.
   *
   * @returns {void}
   */
  function clearCueTimeouts() {
    cueTimeouts.current.forEach((timeoutId) => clearTimeout(timeoutId));
    cueTimeouts.current = [];
  }

  /**
   * Schedules a short ding sound after the provided delay.
   *
   * @param {number} delay Delay in milliseconds
   * @returns {void}
   */
  function playDing(delay) {
    const timeoutId = setTimeout(() => {
      try {
        player.seekTo(0);
        player.play();
      } catch {}
    }, delay);
    cueTimeouts.current.push(timeoutId);
  }

  /**
   * Plays the cue sequence and follows it with spoken guidance.
   *
   * @param {string} message Spoken cue message
   * @returns {void}
   */
  function playCuePattern(message) {
    clearCueTimeouts();
    Speech.stop();
    playDing(0);
    playDing(240);
    playDing(520);

    const speechTimeout = setTimeout(() => {
      Speech.speak(message, {
        rate: 0.95,
        pitch: 1,
      });
    }, 760);

    cueTimeouts.current.push(speechTimeout);
  }

  function beginHoldUnlock() {
    unlockTimeout.current = setTimeout(() => setLocked(false), 850);
  }

  function cancelHoldUnlock() {
    if (unlockTimeout.current) {
      clearTimeout(unlockTimeout.current);
      unlockTimeout.current = null;
    }
  }

  return (
    <View style={styles.runScreen}>
      {finished ? (
        <>
          <View style={[styles.timerPill, { backgroundColor: theme.chip }]}>
            <Text style={[styles.timerPillText, { color: theme.textMuted }]}>Complete</Text>
          </View>
          <Text style={[styles.timer, { color: theme.text }]}>Done</Text>
          <Title style={[styles.centeredTitle, { color: theme.text }]}>Workout completed</Title>
          <Body style={styles.centeredBody}>Nice work. Save this run and move on.</Body>

          <Card>
            <InfoLine title="Workout" value={session.title} first />
            <InfoLine title="Time" value={`${session.totalMinutes} min`} />
            <InfoLine title="Status" value="Ready to save" />
          </Card>

          <View style={styles.buttonRow}>
            <GhostButton label="Back" onPress={onBack} />
            <PrimaryButton label="Complete run" onPress={onFinished} />
          </View>
        </>
      ) : (
        <>
          <View style={[styles.timerPill, { backgroundColor: theme.chip }]}>
            <Text style={[styles.timerPillText, { color: theme.textMuted }]}>{currentStep.type === "run" ? "Run" : "Walk"}</Text>
          </View>
          <Text style={[styles.timer, { color: theme.text }]}>{formatTime(remaining)}</Text>
          <Title style={[styles.centeredTitle, { color: theme.text }]}>{currentStep.label}</Title>
          <Body style={styles.centeredBody}>{nextStep ? `Next: ${nextStep.label}` : "Last block. Finish strong."}</Body>

          <Card>
            <InfoLine title="Now" value={currentStep.label} first />
            <InfoLine title="Next" value={nextStep ? nextStep.label : "Done"} />
            <InfoLine title="Left" value={formatTime(totalRemaining)} />
          </Card>

          {!locked ? (
            <>
              <View style={styles.buttonRow}>
                <GhostButton label={cues.sound ? "Sound on" : "Sound off"} onPress={() => setCues((value) => ({ ...value, sound: !value.sound }))} />
                <GhostButton label={cues.vibration ? "Vibe on" : "Vibe off"} onPress={() => setCues((value) => ({ ...value, vibration: !value.vibration }))} />
              </View>
              <View style={styles.buttonRow}>
                <GhostButton label={running ? "Pause" : "Resume"} onPress={() => setRunning((value) => !value)} />
                <PrimaryButton label="Lock" onPress={() => setLocked(true)} />
              </View>
            </>
          ) : null}

          <View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={locked ? "Hold to unlock controls" : "Controls unlocked"}
              style={[styles.lockHint, { backgroundColor: theme.chip }]}
              onPressIn={beginHoldUnlock}
              onPressOut={cancelHoldUnlock}
            >
              <Text style={{ color: theme.textSoft, fontWeight: "600" }}>{locked ? "Hold to unlock" : "Controls unlocked"}</Text>
            </Pressable>
            {!locked ? (
              <Pressable accessibilityRole="button" accessibilityLabel="Stop workout" onPress={onBack}>
                <Text style={[styles.stopHint, { color: theme.textSoft }]}>Stop workout</Text>
              </Pressable>
            ) : null}
          </View>
        </>
      )}
    </View>
  );
}
