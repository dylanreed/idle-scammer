// ABOUTME: Design tokens and theme constants for the pixel art hacker aesthetic
// ABOUTME: Defines colors, fonts, spacing, and other visual constants used throughout the app

/**
 * Color palette for the CRT monitor / terminal hacker aesthetic.
 * All colors are optimized for dark backgrounds with high contrast green text.
 */
export const COLORS = {
  /** Primary dark background - near black */
  background: '#0a0a0a',

  /** Secondary background for layered elements */
  backgroundSecondary: '#1a1a1a',

  /** Tertiary background for deeper nesting */
  backgroundTertiary: '#2a2a2a',

  /** Primary terminal green - full brightness */
  terminalGreen: '#00ff00',

  /** Dimmed terminal green for secondary text */
  terminalGreenDim: '#00aa00',

  /** Very dim green for disabled/inactive states */
  terminalGreenFaded: '#005500',

  /** Hot pink accent for important actions / warnings */
  hotPink: '#ff00ff',

  /** Warning/danger red */
  warningRed: '#ff0000',

  /** Gold for premium/special items */
  gold: '#ffd700',

  /** Trust resource blue / cyan accent */
  trustBlue: '#00ffff',

  /** Default text color (terminal green) */
  text: '#00ff00',

  /** Dim text for secondary information */
  textDim: '#008800',

  /** Border color for CRT frames */
  border: '#00ff00',

  /** Subtle border for inner elements */
  borderDim: '#004400',

  /** Glow effect color (same as terminal green with alpha applied via shadow) */
  glow: '#00ff00',
} as const;

/**
 * Font families used in the app.
 * Using monospace as fallback until we add a proper pixel font.
 */
export const FONTS = {
  /** Primary monospace font for all terminal-style text */
  mono: 'monospace',
} as const;

/**
 * Font sizes for different text levels.
 * Kept relatively small for that authentic retro feel.
 */
export const FONT_SIZES = {
  /** Small text - labels, hints */
  sm: 12,

  /** Medium text - default body text */
  md: 16,

  /** Large text - headings, important values */
  lg: 24,

  /** Extra large - major headings, resource displays */
  xl: 32,
} as const;

/**
 * Spacing values for consistent layout.
 * Based on an 8px grid for clean alignment.
 */
export const SPACING = {
  /** Extra small spacing - 4px */
  xs: 4,

  /** Small spacing - 8px */
  sm: 8,

  /** Medium spacing - 16px */
  md: 16,

  /** Large spacing - 24px */
  lg: 24,

  /** Extra large spacing - 32px */
  xl: 32,
} as const;

/**
 * Border radius values.
 * Kept small for that chunky pixel aesthetic.
 */
export const BORDER_RADIUS = {
  /** No rounding */
  none: 0,

  /** Subtle rounding - 2px */
  sm: 2,

  /** Default rounding - 4px */
  md: 4,

  /** Larger rounding for CRT monitor frame - 8px */
  lg: 8,
} as const;

/**
 * Shadow/glow effects for that CRT phosphor glow.
 * These are configured for React Native's shadow properties.
 */
export const SHADOWS = {
  /** Subtle green glow for borders */
  glowSm: {
    shadowColor: COLORS.glow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },

  /** Medium green glow for active elements */
  glowMd: {
    shadowColor: COLORS.glow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 8,
  },

  /** Strong green glow for focused/highlighted elements */
  glowLg: {
    shadowColor: COLORS.glow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
    elevation: 16,
  },
} as const;

/**
 * Animation timing values in milliseconds.
 */
export const TIMING = {
  /** Fast animation - button presses, quick feedback */
  fast: 100,

  /** Normal animation - most transitions */
  normal: 200,

  /** Slow animation - emphasis, typing effects */
  slow: 500,

  /** Very slow - dramatic reveals */
  verySlow: 1000,
} as const;

/**
 * Type exports for theme values
 */
export type ColorKey = keyof typeof COLORS;
export type FontKey = keyof typeof FONTS;
export type FontSizeKey = keyof typeof FONT_SIZES;
export type SpacingKey = keyof typeof SPACING;
export type BorderRadiusKey = keyof typeof BORDER_RADIUS;
export type ShadowKey = keyof typeof SHADOWS;
export type TimingKey = keyof typeof TIMING;
