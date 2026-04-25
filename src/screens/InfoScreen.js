import React from "react";
import { Body, Card, Label, ScreenTransition, SectionHeader, Title } from "../components/ui/UI";
import { INFO_CONTENT } from "../config/product";
import { styles } from "../theme/styles";
import { useTheme } from "../theme/theme";

export function InfoScreen({ screenKey, onBack }) {
  const theme = useTheme();
  const content = INFO_CONTENT[screenKey];

  if (!content) {
    return null;
  }

  return (
    <ScreenTransition style={styles.screenStack}>
      <SectionHeader label={content.label} title={content.title} action="Back" onAction={onBack} />
      <Card highlight style={styles.highlightCard}>
        <Body>{content.intro}</Body>
      </Card>
      {content.sections.map((section) => (
        <Card key={section.heading}>
          <Label>{section.heading}</Label>
          <Title style={[styles.cardTitle, { color: theme.text }]}>{section.heading}</Title>
          <Body>{section.body}</Body>
        </Card>
      ))}
    </ScreenTransition>
  );
}
