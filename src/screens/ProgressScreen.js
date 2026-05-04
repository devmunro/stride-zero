import React from "react";
import { ScrollView, Text, View } from "react-native";
import { Body, Card, InfoLine, Label, MetricCard, ScreenTransition, SectionHeader, Title } from "../components/ui/UI";
import { styles } from "../theme/styles";
import { useTheme } from "../theme/theme";

/**
 * Summarizes progress using richer visual stats.
 *
 * @param {Object} props Component props
 * @returns {JSX.Element} Progress screen
 */
export function ProgressScreen({ weeklyCompletion, unlocked, nextSession, completedCount, summary, roadTitle = "Road to goal" }) {
  const theme = useTheme();

  if (completedCount === 0) {
    return (
      <ScreenTransition style={styles.screenStack}>
        <SectionHeader label="Progress" title="Simple stats" badge="Saved locally" mutedBadge />
        <Card style={styles.emptyCard}>
          <Title style={[styles.emptyTitle, { color: theme.text }]}>No runs logged yet</Title>
          <Body style={[styles.emptyNote, { color: theme.textMuted }]}>
            Finish your first workout to unlock weekly progress bars, your completion calendar, personal bests, and goal milestones.
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ minWidth: "100%" }}>
          <View style={[styles.chart, { flex: 1 }]}>
            {weeklyCompletion.map((count, index) => (
              <View key={`week-${index + 1}`} style={[styles.barSlot, { minWidth: 28 }]}>
                <View style={[styles.bar, { height: 22 + count * 32, backgroundColor: theme.text }]} />
                <Text style={[styles.barLabel, { color: theme.textSoft }]} numberOfLines={1}>{`W${index + 1}`}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </Card>

      <View style={styles.metricsRow}>
        <MetricCard label="Longest run" value={`${summary.longestRun} min`} note="continuous" />
        <MetricCard label="Time moving" value={`${summary.totalMinutes} min`} note="all logged work" />
      </View>

      <Card>
        <Label>Personal bests</Label>
        {summary.personalBests.map((item, index) => (
          <InfoLine key={item.label} title={item.label} value={item.value} first={index === 0} />
        ))}
      </Card>

      <Card>
        <Label>Run milestones</Label>
        {summary.durationMilestones.map((item, index) => (
          <InfoLine key={item.label} title={item.label} value={item.value} first={index === 0} />
        ))}
      </Card>

      <Card>
        <Label>{roadTitle}</Label>
        <View style={styles.roadList}>
          {summary.road.map((item) => (
            <View key={item.id} style={[styles.roadRow, { borderColor: theme.border, backgroundColor: item.reached ? theme.chip : "transparent" }]}>
              <Text style={[styles.roadTitle, { color: theme.text }]}>{item.label}</Text>
              <Text style={[styles.listMeta, { color: theme.textSoft }]}>{item.reached ? "Reached" : `${item.minutes} min`}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <Label>Completion calendar</Label>
        <View style={styles.calendarGrid}>
          {summary.calendar.map((item) => (
            <View
              key={item.dateKey}
              style={[
                styles.calendarCell,
                {
                  backgroundColor: item.count === 0 ? theme.surfaceMuted : item.count === 1 ? (theme.name === "dark" ? theme.textSoft : theme.chip) : theme.text,
                  borderColor: item.count === 0 ? theme.border : "transparent",
                },
              ]}
            />
          ))}
        </View>
        <Body style={styles.inlineTopSpacing}>Last 35 days. Darker cells mean more sessions on that day.</Body>
      </Card>

      <Card>
        <Label>Next up</Label>
        <InfoLine title="Completed" value={`${completedCount}`} first />
        <InfoLine title="Latest badge" value={unlocked[unlocked.length - 1]?.title ?? "Not yet"} />
        <InfoLine title="Latest log" value={summary.latestLabel} />
        <InfoLine title="Next workout" value={`Week ${nextSession.week} - ${nextSession.dayLabel ?? `Run ${nextSession.run}`}`} />
      </Card>
    </ScreenTransition>
  );
}
