import React from "react";
import { Pressable, Text, View } from "react-native";
import { Card, GhostButton, Label, Pill, ScreenTransition, SectionHeader, Title } from "../components/ui/UI";
import { styles } from "../theme/styles";
import { useTheme } from "../theme/theme";

/**
 * Renders the full training plan with completion state and quick navigation.
 *
 * @param {Object} props Component props
 * @returns {JSX.Element} Plan screen
 */
export function PlanScreen({ trainingPlan, completedSet, nextSessionId, onSelectSession, scrollRef, recoveryWeekActive, repeatWeekWeek, onRepeatWeek, planLabel }) {
  const theme = useTheme();
  const currentWeek = Number(nextSessionId.split("-")[0]);
  const sessionsPerWeek = trainingPlan[0]?.sessions.filter((session) => session.countsTowardPlan !== false).length || 1;

  return (
    <ScreenTransition style={styles.screenStack}>
      <SectionHeader label={planLabel} title={`${trainingPlan.length} weeks`} badge={recoveryWeekActive ? "Recovery week active" : undefined} mutedBadge />
      {trainingPlan.map((week) => {
        const coreSessions = week.sessions.filter((session) => session.countsTowardPlan !== false);
        const done = coreSessions.filter((session) => completedSet.has(session.id)).length;
        const isFuture = week.week > currentWeek && done === 0;
        const isCurrent = week.week === currentWeek;
        const isRepeatWeek = repeatWeekWeek === week.week;
        const sessionsRequired = Math.max(0, (week.week - 1) * sessionsPerWeek);
        const completedBeforeWeek = trainingPlan
          .filter((candidateWeek) => candidateWeek.week < week.week)
          .flatMap((candidateWeek) => candidateWeek.sessions)
          .filter((session) => session.countsTowardPlan !== false && completedSet.has(session.id)).length;
        const unlockRatio = sessionsRequired === 0 ? 1 : completedBeforeWeek / sessionsRequired;

        return (
          <Card
            key={week.week}
            style={[
              done === coreSessions.length ? styles.doneWeek : null,
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
                {isFuture ? (
                  <View style={styles.unlockWrap}>
                    <Text style={[styles.unlockCopy, { color: theme.textSoft }]}>{`Unlock progress ${completedBeforeWeek}/${sessionsRequired}`}</Text>
                    <View style={[styles.unlockTrack, { backgroundColor: theme.chip }]}>
                      <View
                        style={[
                          styles.unlockFill,
                          {
                            backgroundColor: theme.text,
                            width: `${Math.max(0, Math.min(100, unlockRatio * 100))}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                ) : null}
              </View>
              <Pill label={isRepeatWeek ? "Repeat week" : `${done}/${coreSessions.length}`} muted />
            </View>

            {!isFuture && isCurrent && !recoveryWeekActive ? (
              <GhostButton label={isRepeatWeek ? "Repeating this week" : "Repeat this week"} onPress={() => onRepeatWeek(week.week)} compact />
            ) : null}

            {week.sessions.map((session, index) => (
              <Pressable
                key={session.id}
                disabled={isFuture}
                accessibilityRole="button"
                accessibilityLabel={`${session.dayLabel} ${session.title}. ${
                  completedSet.has(session.id)
                    ? "Completed"
                    : session.id === nextSessionId
                      ? "Next workout"
                      : isFuture
                        ? "Locked"
                        : session.countsTowardPlan === false
                          ? "Optional support run"
                          : `${session.totalMinutes} minutes`
                }`}
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
                  {completedSet.has(session.id)
                    ? "Done"
                    : session.id === nextSessionId
                      ? "Next"
                      : isFuture
                        ? "Locked"
                        : session.countsTowardPlan === false
                          ? "Optional"
                          : `${session.totalMinutes} min`}
                </Text>
              </Pressable>
            ))}
          </Card>
        );
      })}
    </ScreenTransition>
  );
}
