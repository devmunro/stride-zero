import React, { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { styles } from "../../theme/styles";
import { useTheme } from "../../theme/theme";

/**
 * Shared surface wrapper for cards throughout the app.
 *
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children Card content
 * @param {Object|Object[]} [props.style] Additional style overrides
 * @param {boolean} [props.dark=false] Whether to use the hero card treatment
 * @param {boolean} [props.highlight=false] Whether to use the highlighted support treatment
 * @returns {JSX.Element} Card container
 */
export function Card({ children, style, dark = false, highlight = false, ...props }) {
  const theme = useTheme();
  const backgroundColor = dark ? theme.heroSurface : highlight ? theme.highlightSurface : theme.surface;
  return <View style={[styles.card, { backgroundColor, borderColor: theme.border }, style]} {...props}>{children}</View>;
}

/**
 * Adds a lightweight entrance animation to a screen section.
 *
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children Wrapped content
 * @param {number} [props.delay=0] Animation delay in milliseconds
 * @param {Object|Object[]} [props.style] Additional style overrides
 * @returns {JSX.Element} Animated wrapper
 */
export function ScreenTransition({ children, delay = 0, style }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 320,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, translateY]);

  return <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

/**
 * Small uppercase label text used above sections and cards.
 *
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children Label content
 * @param {Object|Object[]} [props.style] Additional style overrides
 * @returns {JSX.Element} Label text
 */
export function Label({ children, style }) {
  const theme = useTheme();
  return <Text style={[styles.label, { color: theme.textSoft }, style]}>{children}</Text>;
}

/**
 * Primary heading text for section titles.
 *
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children Title content
 * @param {Object|Object[]} [props.style] Additional style overrides
 * @returns {JSX.Element} Title text
 */
export function Title({ children, style }) {
  const theme = useTheme();
  return <Text style={[styles.title, { color: theme.text }, style]}>{children}</Text>;
}

/**
 * Large hero heading used on onboarding and completion screens.
 *
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children Heading content
 * @param {Object|Object[]} [props.style] Additional style overrides
 * @returns {JSX.Element} Hero title text
 */
export function HeroTitle({ children, style }) {
  const theme = useTheme();
  return <Text style={[styles.heroTitle, { color: theme.text }, style]}>{children}</Text>;
}

/**
 * Default body copy component.
 *
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children Body content
 * @param {Object|Object[]} [props.style] Additional style overrides
 * @returns {JSX.Element} Body text
 */
export function Body({ children, style }) {
  const theme = useTheme();
  return <Text style={[styles.body, { color: theme.textMuted }, style]}>{children}</Text>;
}

/**
 * Small pill badge used for counts and compact status labels.
 *
 * @param {Object} props Component props
 * @param {string} props.label Badge text
 * @param {boolean} [props.muted=false] Whether to use the muted badge style
 * @returns {JSX.Element} Pill badge
 */
export function Pill({ label, muted = false }) {
  const theme = useTheme();
  return <Text style={[styles.pill, { backgroundColor: muted ? theme.chip : theme.text, color: muted ? theme.textMuted : theme.inverseText }]}>{label}</Text>;
}

/**
 * Shared section header with optional action and badge.
 *
 * @param {Object} props Component props
 * @param {string} props.label Eyebrow label
 * @param {string} props.title Main section title
 * @param {string} [props.action] Optional action label
 * @param {Function} [props.onAction] Optional action handler
 * @param {string} [props.badge] Optional badge text
 * @param {boolean} [props.mutedBadge] Whether the badge should use muted styling
 * @returns {JSX.Element} Section header
 */
export function SectionHeader({ label, title, action, onAction, badge, mutedBadge }) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.flex}>
        <Label>{label}</Label>
        <Title>{title}</Title>
      </View>
      {action ? <GhostButton label={action} onPress={onAction} compact /> : null}
      {badge ? <Pill label={badge} muted={mutedBadge} /> : null}
    </View>
  );
}

/**
 * Two-column information row used in detail cards.
 *
 * @param {Object} props Component props
 * @param {string} props.title Left-side label
 * @param {string} props.value Right-side value
 * @param {boolean} [props.first] Removes the divider for the first row
 * @returns {JSX.Element} Info row
 */
export function InfoLine({ title, value, first }) {
  const theme = useTheme();
  return (
    <View style={[styles.infoLine, { borderTopColor: theme.border }, first && styles.infoLineFirst]}>
      <Text style={[styles.infoTitle, { color: theme.textMuted }]}>{title}</Text>
      <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

/**
 * Compact stat card used in dashboard and progress summaries.
 *
 * @param {Object} props Component props
 * @param {string} props.label Metric label
 * @param {string} props.value Metric value
 * @param {string} props.note Supporting note
 * @returns {JSX.Element} Metric card
 */
export function MetricCard({ label, value, note }) {
  const theme = useTheme();
  return (
    <Card style={styles.flex}>
      <Label>{label}</Label>
      <Text style={[styles.metricValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.metricNote, { color: theme.textSoft }]}>{note}</Text>
    </Card>
  );
}

/**
 * Selectable chip row for small fixed option sets.
 *
 * @param {Object} props Component props
 * @param {string} props.value Current selected option
 * @param {string[]} props.options Available options
 * @param {Function} props.onSelect Selection callback
 * @returns {JSX.Element} Option row
 */
export function OptionRow({ value, options, onSelect }) {
  const theme = useTheme();
  return (
    <View accessibilityRole="radiogroup" style={styles.optionGrid}>
      {options.map((option) => (
        <Pressable
          key={option}
          accessibilityRole="radio"
          accessibilityState={{ selected: value === option }}
          accessibilityLabel={`${option}${value === option ? ", selected" : ""}`}
          style={[
            styles.optionChip,
            { backgroundColor: theme.chip, borderColor: theme.border },
            value === option && { backgroundColor: theme.text, borderColor: theme.text, borderWidth: 2 },
          ]}
          onPress={() => onSelect(option)}
        >
          <Text style={[styles.optionText, { color: theme.textMuted }, value === option && { color: theme.inverseText }]}>{option}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/**
 * Primary call-to-action button.
 *
 * @param {Object} props Component props
 * @param {string} props.label Button text
 * @param {Function} props.onPress Press handler
 * @returns {JSX.Element} Primary button
 */
export function PrimaryButton({ label, onPress }) {
  const theme = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} style={[styles.button, { backgroundColor: theme.text }]} onPress={onPress}>
      <Text style={[styles.primaryButtonText, { color: theme.inverseText }]}>{label}</Text>
    </Pressable>
  );
}

/**
 * Secondary button that can render as either a filled or light variant.
 *
 * @param {Object} props Component props
 * @param {string} props.label Button text
 * @param {Function} props.onPress Press handler
 * @param {boolean} [props.light] Whether to use the light variant
 * @returns {JSX.Element} Secondary button
 */
export function SecondaryButton({ label, onPress, light }) {
  const theme = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} style={[styles.button, { backgroundColor: light ? theme.buttonSecondarySurface : theme.text, borderWidth: light ? 1 : 0, borderColor: theme.border }]} onPress={onPress}>
      <Text style={light ? [styles.lightButtonText, { color: theme.buttonSecondaryText }] : [styles.primaryButtonText, { color: theme.inverseText }]}>{label}</Text>
    </Pressable>
  );
}

/**
 * Neutral action button for supporting controls.
 *
 * @param {Object} props Component props
 * @param {string} props.label Button text
 * @param {Function} props.onPress Press handler
 * @param {boolean} [props.compact=false] Whether to use the compact layout
 * @returns {JSX.Element} Ghost button
 */
export function GhostButton({ label, onPress, compact = false }) {
  const theme = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} style={[styles.button, compact ? styles.compactGhostButton : styles.ghostButton, { backgroundColor: theme.chip, borderColor: theme.border }]} onPress={onPress}>
      <Text style={[styles.ghostButtonText, { color: theme.text }]}>{label}</Text>
    </Pressable>
  );
}
