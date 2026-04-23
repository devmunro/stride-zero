import React from "react";
import { ScrollView, View } from "react-native";
import { APPEARANCE_OPTIONS, CUE_MODE_OPTIONS, FOCUS_OPTIONS, START_POINT_OPTIONS, WEEKLY_PATTERN_OPTIONS } from "../config/profileOptions";
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
 * @returns {JSX.Element} Setup screen
 */
export function SetupScreen({ profile, onChange, onContinue, onReset, compact = false }) {
  const content = (
    <ScreenTransition style={styles.screenStack}>
      <Label>{compact ? "Edit setup" : "No login"}</Label>
      <HeroTitle>{compact ? "Keep it simple." : "Set up once. Start right away."}</HeroTitle>
      <Body>Choose a few basics and the plan stays saved on this device.</Body>

      <Card>
        <Label>Starting point</Label>
        <OptionRow value={profile.startPoint} options={START_POINT_OPTIONS} onSelect={(value) => onChange("startPoint", value)} />
      </Card>

      <Card>
        <Label>Weekly rhythm</Label>
        <OptionRow value={profile.weeklyPattern} options={WEEKLY_PATTERN_OPTIONS} onSelect={(value) => onChange("weeklyPattern", value)} />
      </Card>

      <Card>
        <Label>Main focus</Label>
        <OptionRow value={profile.focus} options={FOCUS_OPTIONS} onSelect={(value) => onChange("focus", value)} />
      </Card>

      <Card>
        <Label>Cues</Label>
        <OptionRow value={profile.cueMode} options={CUE_MODE_OPTIONS} onSelect={(value) => onChange("cueMode", value)} />
      </Card>

      <Card>
        <Label>Appearance</Label>
        <OptionRow value={profile.darkMode ? "Dark" : "Light"} options={APPEARANCE_OPTIONS} onSelect={(value) => onChange("darkMode", value === "Dark")} />
      </Card>

      <PrimaryButton label={compact ? "Save settings" : "Start plan"} onPress={onContinue} />
      {compact && onReset ? <GhostButton label="Clear saved data" onPress={onReset} /> : null}
    </ScreenTransition>
  );

  if (compact) {
    return <View style={styles.scrollContent}>{content}</View>;
  }

  return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>{content}</ScrollView>;
}
