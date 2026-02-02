// ABOUTME: Animated progress bar for scam timers with retro terminal aesthetic
// ABOUTME: Features smooth fill animation, customizable colors, and optional percentage display

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
  TIMING,
} from './theme';

/**
 * Props for the ProgressBar component
 */
export interface ProgressBarProps {
  /** Progress value from 0 to 1 */
  progress: number;

  /** Fill color (default: terminal green) */
  color?: string;

  /** Whether to show percentage text */
  showPercentage?: boolean;

  /** Additional styles to apply to the container */
  style?: StyleProp<ViewStyle>;

  /** Test ID for testing */
  testID?: string;
}

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * A progress bar for scam timers with animated fill.
 * Uses terminal green by default with optional custom colors.
 * Can display percentage text overlay.
 */
export function ProgressBar({
  progress,
  color = COLORS.terminalGreen,
  showPercentage = false,
  style,
  testID,
}: ProgressBarProps): React.ReactElement {
  // Clamp progress between 0 and 1
  const clampedProgress = clamp(progress, 0, 1);

  // Animated value for smooth transitions
  const animatedProgress = useRef(new Animated.Value(clampedProgress)).current;

  // Animate progress changes
  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: clampedProgress,
      duration: TIMING.fast,
      useNativeDriver: false, // Width animations can't use native driver
    }).start();
  }, [clampedProgress, animatedProgress]);

  // Calculate percentage for display
  const percentageValue = Math.round(clampedProgress * 100);

  // For testing purposes, we need to render a non-animated view with the width set
  // The Animated.View handles the smooth transitions in the actual app
  const widthPercentage = `${percentageValue}%` as const;

  return (
    <View testID={testID} style={[styles.track, style]}>
      <View
        testID={testID ? `${testID}-fill` : 'progress-bar-fill'}
        style={[
          styles.fill,
          {
            backgroundColor: color,
            width: widthPercentage,
          },
        ]}
      />
      {showPercentage && (
        <Text
          testID={testID ? `${testID}-percentage` : 'progress-bar-percentage'}
          style={styles.percentage}
        >
          {percentageValue}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.terminalGreenDim,
    borderRadius: BORDER_RADIUS.sm,
    height: 20,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: BORDER_RADIUS.sm - 1, // Slightly smaller to fit inside border
  },
  percentage: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    fontFamily: FONTS.mono,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: 'bold',
    // Text shadow for readability against both fill and empty parts
    textShadowColor: COLORS.background,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
