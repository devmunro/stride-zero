import React from "react";
import { Text, View } from "react-native";
import { Body, Card, InfoLine, Label, MetricCard, ScreenTransition, SectionHeader, Title } from "../components/ui/UI";
import { styles } from "../theme/styles";
import { useTheme } from "../theme/theme";

/**
 * Summarizes progress using simple visual stats and the next workout cue.
 *
 * @param {Object} props Component props
 * @param {number[]} props.weeklyCompletion Completed sessions per week
 * @param {number} props.longestRun Longest completed continuous run in minutes
 * @param {number} props.totalMinutes Total completed workout minutes
 * @param {Object[]} props.unlocked Unlocked achievements
 * @param {Object} props.nextSession Next recommended session
 * @param {number} props.completedCount Number of completed sessions
 * @returns {JSX.Element} Progress screen
 */
export function ProgressScreen({ weeklyCompletion, longestRun, totalMinutes, unlocked, nextSession, completedCount }) {
  const theme = useTheme();

  if (completedCount === 0) {
    return (
      <ScreenTransition style={styles.screenStack}>
        <SectionHeader label="Progress" title="Simple stats" badge="Saved locally" mutedBadge />
        <Card style={styles.emptyCard}>
          <Title style={[styles.emptyTitle, { color: theme.text }]}>No runs logged yet</Title>
          <Body style={[styles.emptyNote, { color: theme.textMuted }]}>
            Finish your first workout to unlock weekly progress bars, longest-run tracking, and milestone badges.
          </Body>
        </Card>
      </ScreenTransition>
    );
  }

  return (
    <ScreenTransition style={styles.screenStack}>
      <SectionHeader label="Progress" title="Simple stats" badge="Saved locally" mutedBadge />
      <Card>
        <Label>Weeks</Label>
        <View style={styles.chart}>
          {weeklyCompletion.map((count, index) => (
            <View key={`week-${index + 1}`} style={styles.barSlot}>
              <View style={[styles.bar, { height: 22 + count * 32, backgroundColor: theme.text }]} />
              <Text style={[styles.barLabel, { color: theme.textSoft }]}>{`W${index + 1}`}</Text>
            </View>
          ))}
        </View>
      </Card>

      <View style={styles.metricsRow}>
        <MetricCard label="Longest run" value={`${longestRun} min`} note="continuous" />
        <MetricCard label="Time moving" value={`${totalMinutes} min`} note="total" />
      </View>

      <Card>
        <Label>Next up</Label>
        <InfoLine title="Completed" value={`${completedCount}`} first />
        <InfoLine title="Latest badge" value={unlocked[unlocked.length - 1]?.title ?? "Not yet"} />
        <InfoLine title="Next workout" value={`Week ${nextSession.week} - Run ${nextSession.run}`} />
      </Card>
    </ScreenTransition>
  );
}
