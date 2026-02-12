// ABOUTME: Chunky panel container component with pixel art game aesthetic
// ABOUTME: Features solid borders, dark panel background, and optional colored top accent

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from './theme';

/**
 * Props for the CRTFrame component
 */
export interface CRTFrameProps {
  /** Content to render inside the panel */
  children: React.ReactNode;

  /** Whether to show scanline overlay effect (kept for API compat, no longer renders) */
  showScanlines?: boolean;

  /** Optional accent color for the top border highlight */
  accentColor?: string;

  /** Additional styles to apply to the frame container */
  style?: StyleProp<ViewStyle>;

  /** Test ID for testing */
  testID?: string;
}

/**
 * A chunky panel container with pixel art game styling.
 * Solid 3px border, dark panel background, optional colored top-border accent.
 */
export function CRTFrame({
  children,
  accentColor,
  style,
  testID,
}: CRTFrameProps): React.ReactElement {
  return (
    <View
      testID={testID}
      style={[
        styles.frame,
        accentColor ? { borderTopColor: accentColor, borderTopWidth: 4 } : undefined,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 3,
    borderColor: COLORS.border,
    borderStyle: 'solid',
    padding: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.glowSm,
  },
});
