import React from "react";
import { View } from "react-native";
import { Body, Card, Label, MetricCard, ScreenTransition, SecondaryButton, SectionHeader, Title } from "../components/ui/UI";
import { styles } from "../theme/styles";
import { useTheme } from "../theme/theme";

/**
 * Shows the next workout and a compact summary of current progress.
 *
 * @param {Object} props Component props
 * @param {Object} props.profile Active user profile
 * @param {Object} props.nextSession Next recommended session
 * @param {number} props.completionPercent Plan completion percentage
 * @param {number} props.completedCount Number of completed sessions
 * @param {number} props.streak Number of fully completed weeks
 * @param {Function} props.onOpenWorkout Opens the workout screen
 * @param {Function} props.onOpenSetup Opens the setup editor
 * @returns {JSX.Element} Dashboard screen
 */
export function DashboardScreen({ profile, nextSession, completionPercent, completedCount, streak, onOpenWorkout, onOpenSetup }) {
  const theme = useTheme();
  return (
    <ScreenTransition style={styles.screenStack}>
      <SectionHeader label="Dashboard" title="Ready for your next run" action="Edit setup" onAction={onOpenSetup} />

      <Card dark>
        <Label style={[styles.darkLabel, { color: theme.heroMutedText }]}>Up next</Label>
        <Title style={[styles.darkTitle, { color: theme.heroText }]}>{`Week ${nextSession.week} - Run ${nextSession.run}`}</Title>
        <Body style={[styles.darkBody, { color: theme.heroMutedText }]}>{nextSession.summary}</Body>
        <SecondaryButton label="Start workout" light onPress={onOpenWorkout} />
      </Card>

      <View style={styles.metricsRow}>
        <MetricCard label="Done" value={`${completionPercent}%`} note={`${completedCount} sessions`} />
        <MetricCard label="Streak" value={`${streak}`} note="full weeks" />
      </View>

      {completedCount === 0 ? (
        <Card style={styles.emptyCard}>
          <Title style={[styles.emptyTitle, { color: theme.text }]}>First run coming up</Title>
          <Body style={[styles.emptyNote, { color: theme.textMuted }]}>
            Start your next guided workout and the app will begin building your streak, stats, and unlocked milestones.
          </Body>
        </Card>
      ) : null}

    </ScreenTransition>
  );
}
