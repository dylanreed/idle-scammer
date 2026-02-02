// ABOUTME: Individual resource display component showing icon, value, and optional label
// ABOUTME: Color-coded per resource type with compact number formatting

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING } from './theme';
import { formatNumber } from '../utils/formatters';
import type { ResourceKey } from '../game/types';

/**
 * Color mapping for each resource type.
 * Based on the game's visual design system.
 */
const RESOURCE_COLORS: Record<ResourceKey, string> = {
  money: COLORS.gold,
  reputation: COLORS.hotPink,
  heat: COLORS.warningRed,
  bots: COLORS.terminalGreen,
  skillPoints: COLORS.trustBlue,
  crypto: COLORS.hotPink,
  trust: COLORS.trustBlue,
};

/**
 * Display labels for each resource (uppercase terminal style).
 */
const RESOURCE_LABELS: Record<ResourceKey, string> = {
  money: 'MONEY',
  reputation: 'REP',
  heat: 'HEAT',
  bots: 'BOTS',
  skillPoints: 'SP',
  crypto: 'CRYPTO',
  trust: 'TRUST',
};

/**
 * Props for the ResourceIcon component
 */
export interface ResourceIconProps {
  /** Which resource to display */
  resourceKey: ResourceKey;

  /** Current value of the resource */
  value: number;

  /** Whether to show the resource label below the value (default: false) */
  showLabel?: boolean;

  /** Additional styles for the container */
  style?: StyleProp<ViewStyle>;

  /** Test ID for testing */
  testID?: string;
}

/**
 * Individual resource display component.
 * Shows an icon placeholder, the formatted value, and optionally the resource name.
 * Color-coded based on resource type for quick visual identification.
 */
export function ResourceIcon({
  resourceKey,
  value,
  showLabel = false,
  style,
  testID,
}: ResourceIconProps): React.ReactElement {
  const color = RESOURCE_COLORS[resourceKey];
  const label = RESOURCE_LABELS[resourceKey];
  const formattedValue = formatNumber(value);

  return (
    <View testID={testID} style={[styles.container, style]}>
      <View testID="resource-icon-placeholder" style={[styles.iconPlaceholder, { borderColor: color }]}>
        {/* Icon placeholder - will be replaced with actual icons later */}
        <Text style={[styles.iconText, { color }]}>{label[0]}</Text>
      </View>
      <Text testID="resource-value" style={[styles.value, { color }]}>
        {formattedValue}
      </Text>
      {showLabel && (
        <Text style={[styles.label, { color }]}>{label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    minWidth: 48,
  },
  iconPlaceholder: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  iconText: {
    fontFamily: FONTS.mono,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  value: {
    fontFamily: FONTS.mono,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  label: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    marginTop: 2,
    opacity: 0.8,
  },
});
