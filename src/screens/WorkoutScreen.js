import React from "react";
import { Card, InfoLine, Label, PrimaryButton, ScreenTransition, SectionHeader, Title } from "../components/ui/UI";
import { styles } from "../theme/styles";
import { useTheme } from "../theme/theme";

/**
 * Displays the selected workout summary before the timer starts.
 *
 * @param {Object} props Component props
 * @param {Object} props.session Selected workout session
 * @param {boolean} props.isCompleted Whether the session is already completed
 * @param {Function} props.onStartRun Starts the run timer
 * @returns {JSX.Element} Workout screen
 */
export function WorkoutScreen({ session, isCompleted, onStartRun }) {
  const theme = useTheme();
  return (
    <ScreenTransition style={styles.screenStack}>
      <SectionHeader label="Workout" title={`Week ${session.week} - Run ${session.run}`} badge={isCompleted ? "Done" : "Ready"} />
      <Card>
        <Label>Today</Label>
        <Title style={[styles.cardTitle, { color: theme.text }]}>{session.title}</Title>
        <InfoLine title="Time" value={`${session.totalMinutes} min`} first />
        <InfoLine title="Focus" value={session.summary} />
      </Card>

      <Card>
        <Label>Blocks</Label>
        {session.blocks.map((block, index) => (
          <InfoLine key={`${session.id}-${block[0]}`} title={block[0]} value={block[1]} first={index === 0} />
        ))}
      </Card>
      <PrimaryButton label="Start timer" onPress={onStartRun} />
    </ScreenTransition>
  );
}
