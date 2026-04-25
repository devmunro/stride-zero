import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, Vibration, View } from "react-native";
import { useAudioPlayer } from "expo-audio";
import { useKeepAwake } from "expo-keep-awake";
import * as Speech from "expo-speech";
import { Body, Card, GhostButton, InfoLine, PrimaryButton, Title } from "../components/ui/UI";
import { styles } from "../theme/styles";
import { useTheme } from "../theme/theme";

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function cueFlags(mode) {
  if (mode === "Vibration only") return { sound: false, vibration: true };
  if (mode === "Off") return { sound: false, vibration: false };
  return { sound: true, vibration: true };
}

export function RunScreen({ session, cueMode, onBack, onFinished, runMode }) {
  useKeepAwake();
  const theme = useTheme();
  const player = useAudioPlayer(require("../../assets/ding.wav"));
  const [stepIndex, setStepIndex] = useState(0);
  const [remaining, setRemaining] = useState(session.steps[0]?.seconds ?? 0);
  const [running, setRunning] = useState(true);
  const [finished, setFinished] = useState(false);
  const [locked, setLocked] = useState(true);
  const [unlockProgress, setUnlockProgress] = useState(0);
  const [cues, setCues] = useState(cueFlags(cueMode));
  const unlockProgressInterval = useRef(null);
  const unlockStartedAt = useRef(null);
  const cueTimeouts = useRef([]);
  const startedCueRef = useRef(null);
  const countdownCueRef = useRef(null);

  function clearCueTimeouts() {
    cueTimeouts.current.forEach((timeoutId) => clearTimeout(timeoutId));
    cueTimeouts.current = [];
  }

  const playDing = useCallback((delay = 0) => {
    const timeoutId = setTimeout(() => {
      try {
        player.seekTo(0);
        player.play();
      } catch {}
    }, delay);
    cueTimeouts.current.push(timeoutId);
  }, [player]);

  const playSpeechCue = useCallback((message, delay = 60) => {
    clearCueTimeouts();
    Speech.stop();
    const speechTimeout = setTimeout(() => {
      Speech.speak(message, {
        rate: 0.95,
        pitch: 1,
      });
    }, delay);

    cueTimeouts.current.push(speechTimeout);
  }, []);

  const fireCueRef = useRef();
  fireCueRef.current = (isFinish, targetType) => {
    if (cues.sound) {
      playSpeechCue(isFinish ? "Workout completed" : `Start ${targetType === "run" ? "running" : "walking"}`);
    }

    if (cues.vibration) {
      if (isFinish) {
        Vibration.vibrate([0, 220, 120, 280]);
      } else {
        Vibration.vibrate(220);
      }
    }
  };

  const fireCue = useCallback((...args) => fireCueRef.current?.(...args), []);

  useEffect(() => {
    setStepIndex(0);
    setRemaining(session.steps[0]?.seconds ?? 0);
    setRunning(true);
    setFinished(false);
    setLocked(true);
    setUnlockProgress(0);
    setCues(cueFlags(cueMode));
    startedCueRef.current = null;
    countdownCueRef.current = null;
  }, [session.id, session.steps, cueMode]);

  useEffect(() => () => {
    if (unlockProgressInterval.current) {
      clearInterval(unlockProgressInterval.current);
    }
    clearCueTimeouts();
    Speech.stop();
  }, []);

  useEffect(() => {
    if (!running || startedCueRef.current === session.id) return;
    startedCueRef.current = session.id;
    fireCue(false, session.steps[0]?.type ?? "walk");
  }, [running, session.id, session.steps, fireCue]);

  useEffect(() => {
    if (!running || finished || !cues.sound || remaining > 3 || remaining < 1) {
      return;
    }

    const cueKey = `${stepIndex}-${remaining}`;
    if (countdownCueRef.current === cueKey) {
      return;
    }

    countdownCueRef.current = cueKey;
    playDing();
  }, [cues.sound, finished, playDing, remaining, running, stepIndex]);

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
        countdownCueRef.current = null;
        fireCue(false, nextStep.type);
        return nextStep.seconds;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [running, session.steps, stepIndex, fireCue]);

  const currentStep = session.steps[stepIndex] ?? session.steps[session.steps.length - 1];
  const nextStep = session.steps[stepIndex + 1];
  const totalRemaining = useMemo(
    () => remaining + session.steps.slice(stepIndex + 1).reduce((sum, item) => sum + item.seconds, 0),
    [remaining, session.steps, stepIndex]
  );

  function beginHoldUnlock() {
    if (!locked) {
      return;
    }

    unlockStartedAt.current = Date.now();
    setUnlockProgress(0);

    unlockProgressInterval.current = setInterval(() => {
      const elapsed = Date.now() - unlockStartedAt.current;
      const nextProgress = Math.min(1, elapsed / 900);
      setUnlockProgress(nextProgress);

      if (nextProgress >= 1) {
        if (unlockProgressInterval.current) {
          clearInterval(unlockProgressInterval.current);
          unlockProgressInterval.current = null;
        }
        setLocked(false);
      }
    }, 16);
  }

  function cancelHoldUnlock() {
    if (unlockProgressInterval.current) {
      clearInterval(unlockProgressInterval.current);
      unlockProgressInterval.current = null;
    }
    unlockStartedAt.current = null;
    if (locked) {
      setUnlockProgress(0);
    }
  }

  const finishLabel = runMode === "repeat" ? "Save repeat run" : runMode === "recovery" ? "Save recovery run" : "Complete run";

  return (
    <View style={styles.runScreen}>
      {finished ? (
        <>
          <View style={[styles.timerPill, { backgroundColor: theme.chip }]}>
            <Text style={[styles.timerPillText, { color: theme.textMuted }]}>Complete</Text>
          </View>
          <Text style={[styles.timer, { color: theme.text }]}>Done</Text>
          <Title style={[styles.centeredTitle, { color: theme.text }]}>Workout completed</Title>
          <Body style={styles.centeredBody}>Nice work. Save this run and keep moving.</Body>

          <Card>
            <InfoLine title="Workout" value={session.title} first />
            <InfoLine title="Time" value={`${session.totalMinutes} min`} />
            <InfoLine title="Save as" value={runMode === "repeat" ? "Repeat-week run" : runMode === "recovery" ? "Recovery run" : "Plan completion"} />
          </Card>

          <View style={styles.buttonRow}>
            <GhostButton label="Back" onPress={onBack} />
            <PrimaryButton label={finishLabel} onPress={() => onFinished(runMode)} />
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
                <PrimaryButton
                  label="Lock"
                  onPress={() => {
                    setLocked(true);
                    setUnlockProgress(0);
                  }}
                />
              </View>
            </>
          ) : null}

          <View style={styles.unlockWrap}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={locked ? "Hold to unlock controls" : "Controls unlocked"}
              style={[styles.lockHint, { backgroundColor: theme.chip, overflow: "hidden" }]}
              onPressIn={beginHoldUnlock}
              onPressOut={cancelHoldUnlock}
            >
              {locked ? (
                <View
                  pointerEvents="none"
                  style={[
                    styles.unlockButtonFill,
                    {
                      width: `${unlockProgress * 100}%`,
                      backgroundColor: theme.text,
                    },
                  ]}
                />
              ) : null}
              <Text style={[styles.lockHintText, { color: locked ? theme.textSoft : theme.textSoft }]}>
                {locked ? "Hold to unlock" : "Controls unlocked"}
              </Text>
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
