// ABOUTME: CRT monitor styled container component with retro aesthetic
// ABOUTME: Features dark background, green glow border, and optional scanline overlay

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from './theme';

/**
 * Props for the CRTFrame component
 */
export interface CRTFrameProps {
  /** Content to render inside the CRT frame */
  children: React.ReactNode;

  /** Whether to show scanline overlay effect (default: true) */
  showScanlines?: boolean;

  /** Additional styles to apply to the frame container */
  style?: StyleProp<ViewStyle>;

  /** Test ID for testing */
  testID?: string;
}

/**
 * A container that looks like a CRT monitor screen.
 * Features a dark background with rounded corners, subtle green glow/border effect,
 * and an optional scanline overlay for that authentic retro feel.
 */
export function CRTFrame({
  children,
  showScanlines = true,
  style,
  testID,
}: CRTFrameProps): React.ReactElement {
  return (
    <View testID={testID} style={[styles.frame, style]}>
      {children}
      {showScanlines && <ScanlineOverlay />}
    </View>
  );
}

/**
 * Scanline overlay component that creates horizontal lines
 * reminiscent of old CRT monitors.
 */
function ScanlineOverlay(): React.ReactElement {
  return (
    <View testID="crt-scanlines" style={styles.scanlines} pointerEvents="none">
      {/* The scanline effect is achieved through a semi-transparent overlay
          with repeating horizontal lines. In a production app, we might use
          a tiled image or shader for better performance on large screens. */}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.terminalGreenDim,
    padding: SPACING.md,
    overflow: 'hidden',
    // Apply the glow effect
    ...SHADOWS.glowSm,
  },
  scanlines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Create a subtle scanline pattern using a repeating gradient-like effect
    // This is a simplified version - real scanlines would use a tiled image
    backgroundColor: 'transparent',
    // Use a semi-transparent dark overlay with striped pattern simulation
    opacity: 0.1,
    // The actual scanline pattern would typically be achieved with:
    // 1. A tiled PNG image of horizontal lines
    // 2. Or a linear gradient pattern (not natively supported in RN)
    // For now, we're using a subtle darkening overlay
    // that can be enhanced with a background image later
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
});
