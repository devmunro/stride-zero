import React from "react";
import { Pressable, Text, View } from "react-native";
import { Card, Label, Pill, ScreenTransition, SectionHeader, Title } from "../components/ui/UI";
import { styles } from "../theme/styles";
import { useTheme } from "../theme/theme";

/**
 * Renders the full training plan with completion state and quick navigation.
 *
 * @param {Object} props Component props
 * @param {Object[]} props.trainingPlan Display-ready training plan
 * @param {Set<string>} props.completedSet Completed session ids
 * @param {string} props.nextSessionId Next recommended session id
 * @param {Function} props.onSelectSession Opens a selected session
 * @param {Object} props.scrollRef Parent scroll view ref
 * @returns {JSX.Element} Plan screen
 */
export function PlanScreen({ trainingPlan, completedSet, nextSessionId, onSelectSession, scrollRef }) {
  const theme = useTheme();
  const currentWeek = Number(nextSessionId.split("-")[0]);

  return (
    <ScreenTransition style={styles.screenStack}>
      <SectionHeader label="Training plan" title="9 weeks" />
      {trainingPlan.map((week) => {
        const done = week.sessions.filter((session) => completedSet.has(session.id)).length;
        const isFuture = week.week > currentWeek && done === 0;
        const isCurrent = week.week === currentWeek;
        return (
          <Card
            key={week.week}
            style={[
              done === 3 ? styles.doneWeek : null,
              isFuture ? styles.futureWeek : null,
              isCurrent ? [styles.currentWeek, { borderColor: theme.text }] : null,
            ]}
            onLayout={(event) => {
              if (isCurrent && scrollRef?.current) {
                const y = event.nativeEvent.layout.y;
                requestAnimationFrame(() => {
                  scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
                });
              }
            }}
          >
            <View style={styles.headerRow}>
              <View style={styles.flex}>
                <Label>{`Week ${week.week}`}</Label>
                <Title style={[styles.cardTitle, { color: theme.text }]}>{week.goal}</Title>
              </View>
              <Pill label={`${done}/3`} muted />
            </View>

            {week.sessions.map((session, index) => (
              <Pressable
                key={session.id}
                disabled={isFuture}
                accessibilityRole="button"
                accessibilityLabel={`${session.dayLabel} ${session.title}. ${completedSet.has(session.id) ? "Completed" : session.id === nextSessionId ? "Next workout" : isFuture ? "Locked" : `${session.totalMinutes} minutes`}`}
                accessibilityState={{ disabled: isFuture }}
                style={[styles.listRow, index === 0 && styles.listRowFirst]}
                onPress={() => {
                  if (!isFuture) onSelectSession(session.id);
                }}
              >
                <View style={styles.flex}>
                  <Text style={[styles.listTitle, { color: theme.text }]}>{`${session.dayLabel} - ${session.title}`}</Text>
                  <Text style={[styles.listCopy, { color: theme.textMuted }]}>{session.summary}</Text>
                </View>
                <Text style={[isFuture ? styles.lockedText : styles.listMeta, { color: theme.textSoft }]}>
                  {completedSet.has(session.id) ? "Done" : session.id === nextSessionId ? "Next" : isFuture ? "Locked" : `${session.totalMinutes} min`}
                </Text>
              </Pressable>
            ))}
          </Card>
        );
      })}
    </ScreenTransition>
  );
}
