import React from "react";
import { View } from "react-native";
import { Body, Card, GhostButton, Label, MetricCard, ScreenTransition, SecondaryButton, SectionHeader, Title } from "../components/ui/UI";
import { styles } from "../theme/styles";
import { useTheme } from "../theme/theme";

/**
 * Shows the next workout and a compact summary of current progress.
 *
 * @param {Object} props Component props
 * @returns {JSX.Element} Dashboard screen
 */
export function DashboardScreen({
  nextSession,
  completionPercent,
  completedCount,
  streak,
  onOpenWorkout,
  onOpenSetup,
  onTakeRecoveryWeek,
  recoveryWeekActive,
}) {
  const theme = useTheme();

  return (
    <ScreenTransition style={styles.screenStack}>
      <SectionHeader label="Dashboard" title="Ready for your next run" action="Settings" onAction={onOpenSetup} />

      <Card dark>
        <View style={styles.headerRow}>
          <View style={styles.flex}>
            <Label style={[styles.darkLabel, { color: theme.heroMutedText }]}>{recoveryWeekActive ? "Recovery week active" : "Up next"}</Label>
            <Title style={[styles.darkTitle, { color: theme.heroText }]}>{`Week ${nextSession.week} - ${nextSession.dayLabel ?? `Run ${nextSession.run}`}`}</Title>
          </View>
        </View>
        <Body style={[styles.darkBody, { color: theme.heroMutedText }]}>{nextSession.summary}</Body>
        <View style={styles.buttonColumn}>
          <SecondaryButton label="Start workout" light onPress={onOpenWorkout} />
          <GhostButton label={recoveryWeekActive ? "Turn off recovery week" : "Take recovery week"} onPress={onTakeRecoveryWeek} compact />
        </View>
      </Card>

      <View style={styles.metricsRow}>
        <MetricCard label="Done" value={`${completionPercent}%`} note={`${completedCount} core runs`} />
        <MetricCard label="Streak" value={`${streak}`} note="full weeks" />
      </View>

      {completedCount === 0 ? (
        <Card style={styles.emptyCard}>
          <Title style={[styles.emptyTitle, { color: theme.text }]}>First run coming up</Title>
          <Body style={[styles.emptyNote, { color: theme.textMuted }]}>
            Start your first guided workout to unlock the completion calendar, personal bests, and your road-to-goal progress.
          </Body>
        </Card>
      ) : null}
    </ScreenTransition>
  );
}
