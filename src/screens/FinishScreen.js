import React from "react";
import { Text, View } from "react-native";
import { Body, Card, HeroTitle, InfoLine, Label, PrimaryButton, ScreenTransition } from "../components/ui/UI";
import { styles } from "../theme/styles";
import { useTheme } from "../theme/theme";

export function FinishScreen({ onReviewPlan, summary, finishLabel }) {
  const theme = useTheme();

  return (
    <ScreenTransition style={styles.screenStack}>
      <View style={styles.runScreen}>
        <Label>Plan complete</Label>
        <View style={styles.finishBadge}>
          <Text style={[styles.finishBadgeText, { color: theme.text }]}>{finishLabel}</Text>
        </View>
        <HeroTitle style={styles.centeredTitle}>You made it.</HeroTitle>
        <Body style={styles.centeredBody}>You followed the plan, logged the work, and finished this build with a real training history behind it.</Body>
        <Card>
          <InfoLine title="Longest run" value={`${summary.longestRun} min`} first />
          <InfoLine title="Time moving" value={`${summary.totalMinutes} min`} />
          <InfoLine title="Result" value={`${finishLabel} complete`} />
        </Card>
        <PrimaryButton label="See the full plan" onPress={onReviewPlan} />
      </View>
    </ScreenTransition>
  );
}
