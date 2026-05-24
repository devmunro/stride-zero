import React from "react";
import { ScrollView, View } from "react-native";
import {
  APPEARANCE_OPTIONS,
  COMEBACK_STATUS_OPTIONS,
  CONTINUOUS_RUN_LEVEL_OPTIONS,
  CUE_MODE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  FIVE_K_STATUS_OPTIONS,
  GOAL_OPTIONS,
  RECENT_RUN_PATTERN_OPTIONS,
  WEEKLY_PATTERN_OPTIONS,
} from "../config/profileOptions";
import { Body, Card, GhostButton, HeroTitle, Label, OptionRow, PrimaryButton, ScreenTransition } from "../components/ui/UI";
import { styles } from "../theme/styles";

/**
 * Collects onboarding and preference selections for the running plan.
 *
 * @param {Object} props Component props
 * @param {Object} props.profile Current profile state
 * @param {Function} props.onChange Field update callback
 * @param {Function} props.onContinue Continue/save handler
 * @param {Function} [props.onReset] Optional reset handler
 * @param {boolean} [props.compact=false] Whether to render the embedded edit version
 * @param {boolean} [props.canContinue=false] Whether the setup submission is ready
 * @returns {JSX.Element} Setup screen
 */
export function SetupScreen({ profile, onChange, onContinue, onReset, compact = false, canContinue = false }) {
  const content = (
    <ScreenTransition style={styles.screenStack}>
      <View style={styles.flex}>
        <Label>{compact ? "Plan settings" : "Coach-built setup"}</Label>
        <HeroTitle>{compact ? "Update your plan." : "Start with the right plan."}</HeroTitle>
        <Body>Keep it simple. Tell us where you are now, what you want next, and how many runs fit your week.</Body>
      </View>

      <Card>
        <Label>Where are you right now?</Label>
        <OptionRow value={profile.experienceLevel} options={EXPERIENCE_LEVEL_OPTIONS} onSelect={(value) => onChange("experienceLevel", value)} />
      </Card>

      <Card>
        <Label>What are you building toward?</Label>
        <OptionRow value={profile.goal} options={GOAL_OPTIONS} onSelect={(value) => onChange("goal", value)} />
        <Body style={styles.inlineTopSpacing}>We use your current base to keep sharper 5K and 10K plans reserved for runners who are already ready for them.</Body>
      </Card>

      <Card>
        <Label>How long can you run right now?</Label>
        <OptionRow value={profile.continuousRunLevel} options={CONTINUOUS_RUN_LEVEL_OPTIONS} onSelect={(value) => onChange("continuousRunLevel", value)} />
      </Card>

      <Card>
        <Label>How consistent have you been lately?</Label>
        <OptionRow value={profile.recentRunPattern} options={RECENT_RUN_PATTERN_OPTIONS} onSelect={(value) => onChange("recentRunPattern", value)} />
      </Card>

      <Card>
        <Label>What is your 5K background?</Label>
        <OptionRow value={profile.fiveKStatus} options={FIVE_K_STATUS_OPTIONS} onSelect={(value) => onChange("fiveKStatus", value)} />
      </Card>

      <Card>
        <Label>Are you coming back from time off?</Label>
        <OptionRow value={profile.comebackStatus} options={COMEBACK_STATUS_OPTIONS} onSelect={(value) => onChange("comebackStatus", value)} />
      </Card>

      <Card>
        <Label>Runs most weeks</Label>
        <OptionRow value={profile.weeklyPattern} options={WEEKLY_PATTERN_OPTIONS} onSelect={(value) => onChange("weeklyPattern", value)} />
      </Card>

      <Card>
        <Label>Cues</Label>
        <OptionRow value={profile.cueMode} options={CUE_MODE_OPTIONS} onSelect={(value) => onChange("cueMode", value)} />
      </Card>

      <Card>
        <Label>Appearance</Label>
        <OptionRow value={profile.darkMode ? "Dark" : "Light"} options={APPEARANCE_OPTIONS} onSelect={(value) => onChange("darkMode", value === "Dark")} />
      </Card>

      <PrimaryButton label={compact ? "Save settings" : "Build my plan"} onPress={onContinue} disabled={!canContinue} />
      {compact && onReset ? <GhostButton label="Clear saved data" onPress={onReset} /> : null}
    </ScreenTransition>
  );

  if (compact) {
    return <View style={styles.scrollContent}>{content}</View>;
  }

  return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>{content}</ScrollView>;
}
