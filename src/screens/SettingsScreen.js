import React from "react";
import { View } from "react-native";
import { APPEARANCE_OPTIONS, CUE_MODE_OPTIONS, REMINDER_TIME_OPTIONS } from "../config/profileOptions";
import { Body, Card, GhostButton, Label, OptionRow, PrimaryButton, ScreenTransition, SectionHeader } from "../components/ui/UI";
import { styles } from "../theme/styles";

export function SettingsScreen({ profile, onChange, onOpenSetup, onBack, onReset, reminderPermissionGranted }) {
  return (
    <ScreenTransition style={styles.screenStack}>
      <SectionHeader label="Settings" title="Coaching preferences" action="Back" onAction={onBack} />

      <Card>
        <Label>Daily reminders</Label>
        <OptionRow value={profile.reminderEnabled ? "On" : "Off"} options={["On", "Off"]} onSelect={(value) => onChange("reminderEnabled", value === "On")} />
        {profile.reminderEnabled ? (
          <>
            <Body style={styles.inlineTopSpacing}>Choose when you usually want the nudge.</Body>
            <OptionRow value={profile.reminderTime} options={REMINDER_TIME_OPTIONS} onSelect={(value) => onChange("reminderTime", value)} />
            <Body style={styles.inlineTopSpacing}>
              {reminderPermissionGranted ? "Notifications are ready on this device." : "Permission will be requested the first time reminders are enabled."}
            </Body>
          </>
        ) : null}
      </Card>

      <Card>
        <Label>Workout cues</Label>
        <OptionRow value={profile.cueMode} options={CUE_MODE_OPTIONS} onSelect={(value) => onChange("cueMode", value)} />
      </Card>

      <Card>
        <Label>Appearance</Label>
        <OptionRow value={profile.darkMode ? "Dark" : "Light"} options={APPEARANCE_OPTIONS} onSelect={(value) => onChange("darkMode", value === "Dark")} />
      </Card>

      <View style={styles.buttonColumn}>
        <PrimaryButton label="Edit plan setup" onPress={onOpenSetup} />
        <GhostButton label="Clear saved data" onPress={onReset} />
      </View>
    </ScreenTransition>
  );
}
