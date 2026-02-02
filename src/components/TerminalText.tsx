// ABOUTME: Styled monospace text component with terminal aesthetic
// ABOUTME: Features optional typing animation effect for that authentic hacker feel

import React, { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet, TextStyle, StyleProp } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, TIMING } from './theme';

/**
 * Available text sizes
 */
export type TerminalTextSize = 'sm' | 'md' | 'lg';

/**
 * Props for the TerminalText component
 */
export interface TerminalTextProps {
  /** Text content to display */
  children: string;

  /** Text color (default: terminal green) */
  color?: string;

  /** Font size (default: md) */
  size?: TerminalTextSize;

  /** Whether to show typing animation effect */
  animate?: boolean;

  /** Additional styles to apply to the text */
  style?: StyleProp<TextStyle>;

  /** Test ID for testing */
  testID?: string;
}

/**
 * Map size names to font size values
 */
const SIZE_MAP: Record<TerminalTextSize, number> = {
  sm: FONT_SIZES.sm,
  md: FONT_SIZES.md,
  lg: FONT_SIZES.lg,
};

/**
 * Speed of typing animation in milliseconds per character
 */
const TYPING_SPEED = 50;

/**
 * Cursor character for typing animation
 */
const CURSOR = '\u2588'; // Full block character

/**
 * A styled text component with monospace font and terminal aesthetics.
 * Can optionally show a typing animation effect for flavor text.
 */
export function TerminalText({
  children,
  color = COLORS.terminalGreen,
  size = 'md',
  animate = false,
  style,
  testID,
}: TerminalTextProps): React.ReactElement {
  // Track displayed characters for animation
  const [displayedLength, setDisplayedLength] = useState(animate ? 0 : children.length);
  const [showCursor, setShowCursor] = useState(animate);

  // Keep track of the animation interval
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Handle typing animation
  useEffect(() => {
    if (!animate) {
      setDisplayedLength(children.length);
      setShowCursor(false);
      return;
    }

    // Reset animation when children change
    setDisplayedLength(0);
    setShowCursor(true);

    // Start typing animation
    intervalRef.current = setInterval(() => {
      setDisplayedLength((prev) => {
        if (prev >= children.length) {
          // Animation complete - clear interval and hide cursor
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setShowCursor(false);
          return children.length;
        }
        return prev + 1;
      });
    }, TYPING_SPEED);

    // Cleanup interval on unmount or when animation prop changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [animate, children]);

  // Get the portion of text to display
  const displayedText = animate
    ? children.slice(0, displayedLength)
    : children;

  // Build the final text with optional cursor
  const finalText = showCursor && displayedLength < children.length
    ? displayedText + CURSOR
    : displayedText;

  return (
    <Text
      testID={testID}
      style={[
        styles.text,
        {
          color,
          fontSize: SIZE_MAP[size],
        },
        style,
      ]}
    >
      {finalText}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: FONTS.mono,
    // Slight text shadow for CRT glow effect
    textShadowColor: COLORS.terminalGreenDim,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
});
