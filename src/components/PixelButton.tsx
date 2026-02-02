// ABOUTME: Retro-styled pressable button with pixel art aesthetic
// ABOUTME: Features chunky borders, multiple color variants, and press/disabled states

import React, { useCallback } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
  PressableStateCallbackType,
} from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from './theme';

/**
 * Button variant types that determine the color scheme
 */
export type PixelButtonVariant = 'primary' | 'secondary' | 'danger' | 'gold';

/**
 * Props for the PixelButton component
 */
export interface PixelButtonProps {
  /** Callback when button is pressed */
  onPress: () => void;

  /** Button label text or React nodes */
  children: React.ReactNode;

  /** Whether the button is disabled */
  disabled?: boolean;

  /** Color variant of the button */
  variant?: PixelButtonVariant;

  /** Additional styles to apply to the button container */
  style?: StyleProp<ViewStyle>;

  /** Test ID for testing */
  testID?: string;
}

/**
 * Map variant names to their corresponding border colors
 */
const VARIANT_COLORS: Record<PixelButtonVariant, string> = {
  primary: COLORS.terminalGreen,
  secondary: COLORS.terminalGreenDim,
  danger: COLORS.warningRed,
  gold: COLORS.gold,
};

/**
 * Map variant names to their corresponding text colors
 */
const VARIANT_TEXT_COLORS: Record<PixelButtonVariant, string> = {
  primary: COLORS.terminalGreen,
  secondary: COLORS.terminalGreenDim,
  danger: COLORS.warningRed,
  gold: COLORS.gold,
};

/**
 * A retro-styled button with pixel art aesthetic.
 * Features chunky borders, press state effects, and multiple color variants.
 */
export function PixelButton({
  onPress,
  children,
  disabled = false,
  variant = 'primary',
  style,
  testID,
}: PixelButtonProps): React.ReactElement {
  const borderColor = VARIANT_COLORS[variant];
  const textColor = VARIANT_TEXT_COLORS[variant];

  /**
   * Generate styles based on press state
   */
  const getButtonStyle = useCallback(
    ({ pressed }: PressableStateCallbackType): ViewStyle[] => {
      const baseStyles: ViewStyle[] = [
        styles.button,
        { borderColor },
        disabled && styles.disabled,
      ].filter(Boolean) as ViewStyle[];

      if (pressed && !disabled) {
        baseStyles.push(styles.pressed);
      }

      // Add custom style last so it can override defaults
      if (style) {
        const customStyles = Array.isArray(style) ? style : [style];
        baseStyles.push(...(customStyles.filter(Boolean) as ViewStyle[]));
      }

      return baseStyles;
    },
    [borderColor, disabled, style]
  );

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      style={getButtonStyle}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Text
        style={[
          styles.text,
          { color: textColor },
          disabled && styles.textDisabled,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 3,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    // Pixel art style - slight 3D effect with bottom/right border thicker
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  pressed: {
    // When pressed, flatten the button by reducing bottom/right borders
    borderBottomWidth: 2,
    borderRightWidth: 2,
    // Slight offset to simulate being pushed in
    marginTop: 2,
    marginLeft: 2,
    marginBottom: -2,
    marginRight: -2,
  },
  disabled: {
    opacity: 0.5,
    borderColor: COLORS.terminalGreenFaded,
  },
  text: {
    fontFamily: FONTS.mono,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  textDisabled: {
    color: COLORS.textDim,
  },
});
