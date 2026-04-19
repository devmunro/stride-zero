import React from "react";
import { Text, View } from "react-native";
import { Body, Card, HeroTitle, InfoLine, Label, PrimaryButton, ScreenTransition } from "../components/ui/UI";
import { styles } from "../theme/styles";
import { useTheme } from "../theme/theme";

/**
 * Final completion screen shown after the full 5K plan is finished.
 *
 * @param {Object} props Component props
 * @param {Function} props.onReviewPlan Opens the full plan review
 * @returns {JSX.Element} Finish screen
 */
export function FinishScreen({ onReviewPlan }) {
  const theme = useTheme();
  return (
    <ScreenTransition style={styles.screenStack}>
      <View style={styles.runScreen}>
        <Label>5K complete</Label>
        <View style={styles.finishBadge}>
          <Text style={[styles.finishBadgeText, { color: theme.text }]}>5K</Text>
        </View>
        <HeroTitle style={styles.centeredTitle}>Done.</HeroTitle>
        <Body style={styles.centeredBody}>You followed the plan and finished your first 5K.</Body>
        <Card>
          <InfoLine title="Journey" value="9 weeks" first />
          <InfoLine title="Runs" value="27" />
          <InfoLine title="Result" value="5K complete" />
        </Card>
        <PrimaryButton label="See the full plan" onPress={onReviewPlan} />
      </View>
    </ScreenTransition>
  );
}
