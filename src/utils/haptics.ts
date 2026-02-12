// ABOUTME: Haptic feedback utility wrapping expo-haptics with three intensity levels
// ABOUTME: Provides light/medium/heavy feedback with graceful fallback on web/test

import * as Haptics from 'expo-haptics';

/**
 * Haptic intensity levels for different interaction types.
 * - light: button taps, card selections
 * - medium: scam completions, unlocks, hires
 * - heavy: prestige, milestones, origin confirm, reset
 */
export type HapticLevel = 'light' | 'medium' | 'heavy';

const LEVEL_MAP: Record<HapticLevel, Haptics.ImpactFeedbackStyle> = {
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
};

/**
 * Trigger haptic feedback at the specified intensity.
 * Silently fails on platforms without haptic support (web, test).
 */
export function triggerHaptic(level: HapticLevel): void {
  try {
    Haptics.impactAsync(LEVEL_MAP[level]).catch(() => {
      // Silently ignore async failures (e.g. web platform)
    });
  } catch {
    // expo-haptics is native-only; silently ignore on web/test
  }
}
