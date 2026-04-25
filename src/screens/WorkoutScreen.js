import React from "react";
import { View } from "react-native";
import { Body, Card, GhostButton, InfoLine, Label, PrimaryButton, ScreenTransition, SectionHeader, Title } from "../components/ui/UI";
import { styles } from "../theme/styles";
import { useTheme } from "../theme/theme";

/**
 * Displays the selected workout summary before the timer starts.
 *
 * @param {Object} props Component props
 * @returns {JSX.Element} Workout screen
 */
export function WorkoutScreen({ session, isCompleted, onStartRun, onTakeRecoveryWeek, canTakeRecoveryWeek, isRecoveryMode, isRepeatWeekMode }) {
  const theme = useTheme();

  return (
    <ScreenTransition style={styles.screenStack}>
      <SectionHeader
        label={isRecoveryMode ? "Recovery week" : isRepeatWeekMode ? "Repeat week" : "Workout"}
        title={`Week ${session.week} - ${session.dayLabel ?? `Run ${session.run}`}`}
        badge={isRecoveryMode ? "Lighter load" : isRepeatWeekMode ? "Extra confidence" : isCompleted ? "Done" : "Ready"}
      />

      <Card>
        <Label>Today</Label>
        <Title style={[styles.cardTitle, { color: theme.text }]}>{session.title}</Title>
        <InfoLine title="Time" value={`${session.totalMinutes} min`} first />
        <InfoLine title="Focus" value={session.summary} />
        {session.countsTowardPlan === false ? <InfoLine title="Type" value="Optional support run" /> : null}
      </Card>

      <Card>
        <Label>Blocks</Label>
        {session.blocks.map((block, index) => (
          <InfoLine key={`${session.id}-${block[0]}`} title={block[0]} value={block[1]} first={index === 0} />
        ))}
      </Card>

      {isRecoveryMode || isRepeatWeekMode ? (
        <Card highlight style={styles.highlightCard}>
          <Label>Why this week exists</Label>
          <Body>
            {isRecoveryMode
              ? "Recovery weeks keep the habit alive while lowering the load. After three lighter runs, you return to your regular next session."
              : "Repeat weeks let you re-run the current week for confidence without changing your core plan progress."}
          </Body>
        </Card>
      ) : null}

      <View style={styles.buttonColumn}>
        <PrimaryButton label={isRecoveryMode ? "Start recovery run" : isRepeatWeekMode ? "Start repeat week run" : "Start plan run"} onPress={onStartRun} />
        {!isRepeatWeekMode ? (
          <GhostButton label={isRecoveryMode ? "Turn off recovery week" : "Take recovery week"} onPress={onTakeRecoveryWeek} />
        ) : null}
      </View>
    </ScreenTransition>
  );
}
