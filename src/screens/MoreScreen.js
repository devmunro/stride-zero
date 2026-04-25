import React from "react";
import { Pressable, Text, View } from "react-native";
import { Body, Label, ScreenTransition, SectionHeader, Title } from "../components/ui/UI";
import { APP_VERSION } from "../config/product";
import { styles } from "../theme/styles";
import { useTheme } from "../theme/theme";

export function MoreScreen({ onOpenScreen, reminderEnabled }) {
  const theme = useTheme();
  const items = [
    ["settings", "Settings", reminderEnabled ? "Reminders are on. Adjust cues, appearance, and plan settings here." : "Turn on reminders, adjust cues, and edit plan settings."],
    ["achievements", "Achievements", "See unlocked milestones and what is next."],
    ["help", "Help", "Understand the plan, adaptive controls, and reminders."],
    ["safety", "Safety", "Read rest guidance, beginner notes, and the medical disclaimer."],
    ["privacy", "Privacy", "Review what stays on device and where to contact us."],
    ["support", "Support", `Version ${APP_VERSION}, release notes, and support contact.`],
  ];

  return (
    <ScreenTransition style={styles.screenStack}>
      <SectionHeader label="More" title="Product details" badge={`v${APP_VERSION}`} mutedBadge />
      {items.map(([key, title, body], index) => (
        <Pressable
          key={key}
          accessibilityRole="button"
          style={[styles.menuCard, { backgroundColor: theme.surface, borderColor: theme.border }, index === 0 ? null : styles.inlineTopSpacing]}
          onPress={() => onOpenScreen(key)}
        >
          <View style={styles.headerRow}>
            <View style={styles.flex}>
              <Label>{title}</Label>
              <Title style={[styles.cardTitle, { color: theme.text }]}>{title}</Title>
              <Body>{body}</Body>
            </View>
            <Text style={[styles.listMeta, { color: theme.textSoft }]}>Open</Text>
          </View>
        </Pressable>
      ))}
    </ScreenTransition>
  );
}
