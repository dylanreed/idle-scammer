// ABOUTME: Animated floating number that drifts up and fades out for reward feedback
// ABOUTME: Used to display +$X rewards when scams complete, providing visual "juice"

import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { FONTS, FONT_SIZES } from './theme';

export interface FloatingNumberProps {
  /** Text to display (e.g. "+$1.5K") */
  value: string;
  /** Color of the floating text */
  color: string;
  /** Called when the animation finishes so the parent can remove this element */
  onComplete: () => void;
  /** Font size override (defaults to FONT_SIZES.lg) */
  fontSize?: number;
  /** Test ID for testing */
  testID?: string;
}

/** Duration of the float + fade animation in ms */
const ANIMATION_DURATION = 1000;

/** Distance in pixels the number drifts upward */
const DRIFT_Y = -50;

/**
 * Animated text that drifts diagonally up-right and fades out.
 * Self-destructs via onComplete callback after the animation finishes.
 */
export function FloatingNumber({
  value,
  color,
  onComplete,
  fontSize,
  testID,
}: FloatingNumberProps): React.ReactElement {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.9)).current;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: DRIFT_Y,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onCompleteRef.current();
      }
    });
  // Run once on mount only — onComplete is tracked via ref
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.container,
        { transform: [{ translateY }], opacity },
      ]}
      pointerEvents="none"
    >
      <Text style={[styles.text, { color }, fontSize != null && { fontSize }]}>
        {value}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: -1,
    top: -1,
    zIndex: 50,
  },
  text: {
    fontFamily: FONTS.mono,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
