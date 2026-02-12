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
  /** Test ID for testing */
  testID?: string;
}

/** Duration of the float-up + fade-out animation in ms */
const ANIMATION_DURATION = 800;

/** Distance in pixels the number drifts upward */
const DRIFT_DISTANCE = -40;

/**
 * Animated text that drifts upward and fades out.
 * Self-destructs via onComplete callback after the animation finishes.
 */
export function FloatingNumber({
  value,
  color,
  onComplete,
  testID,
}: FloatingNumberProps): React.ReactElement {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: DRIFT_DISTANCE,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });
  }, [translateY, opacity, onComplete]);

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.container,
        { transform: [{ translateY }], opacity },
      ]}
      pointerEvents="none"
    >
      <Text style={[styles.text, { color }]}>
        {value}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
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
