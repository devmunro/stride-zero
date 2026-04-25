import React from "react";
import { Text, View } from "react-native";
import { achievements } from "../data/trainingPlan";
import { Body, Card, ScreenTransition, SectionHeader, Title } from "../components/ui/UI";
import { styles } from "../theme/styles";
import { useTheme } from "../theme/theme";

/**
 * Lists all achievement milestones and highlights unlocked ones.
 *
 * @param {Object} props Component props
 * @param {Object[]} props.unlocked Achievements unlocked by the user
 * @param {Function} props.onBack Back navigation handler
 * @returns {JSX.Element} Achievements screen
 */
export function AchievementsScreen({ unlocked, onBack }) {
  const theme = useTheme();
  return (
    <ScreenTransition style={styles.screenStack}>
      <SectionHeader label="Achievements" title="Milestones" action="Back" onAction={onBack}  />
      {unlocked.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Title style={[styles.emptyTitle, { color: theme.text }]}>Milestones will show up here</Title>
          <Body style={[styles.emptyNote, { color: theme.textMuted }]}>
            Complete your first guided run to start unlocking badges and visible progress markers.
          </Body>
        </Card>
      ) : null}
      {achievements.map((item, index) => {
        const isUnlocked = unlocked.some((entry) => entry.id === item.id);
        return (
          <Card key={item.id} style={!isUnlocked ? styles.lockedCard : null}>
            <View style={styles.headerRow}>
              <View style={styles.badgeRow}>
                <View style={styles.badgeDot}>
                  <Text style={[styles.badgeDotText, { color: theme.text }]}>{String(index + 1).padStart(2, "0")}</Text>
                </View>
                <View style={styles.flex}>
                  <Title style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Title>
                  <Body>{item.detail}</Body>
                </View>
              </View>
              <Text style={[styles.listMeta, { color: theme.textSoft }]}>{isUnlocked ? "Done" : `At ${item.unlockAt}`}</Text>
            </View>
          </Card>
        );
      })}
    </ScreenTransition>
  );
}
