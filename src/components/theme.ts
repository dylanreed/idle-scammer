// ABOUTME: Design tokens and theme constants for the pixel art hacker aesthetic
// ABOUTME: Defines colors, fonts, spacing, and other visual constants used throughout the app

/**
 * Color palette: Pixel art game UI — dark navy backgrounds, warm accent colors,
 * with legacy terminal green kept for money/success indicators.
 */
export const COLORS = {
  /** Primary dark background - near-black so cards pop */
  background: '#0d1117',

  /** Secondary background - panel backgrounds */
  backgroundSecondary: '#16213e',

  /** Tertiary background - accent panels */
  backgroundTertiary: '#0f3460',

  /** Primary action color - warm red-pink */
  primary: '#e94560',

  /** Secondary accent - purple */
  secondary: '#533483',

  /** Info/highlight accent - cyan */
  accent: '#00b4d8',

  /** Main text color - near-white */
  textPrimary: '#edf2f4',

  /** Dimmed text for secondary info */
  textSecondary: '#8d99ae',

  /** Terminal green - kept for money/success indicators */
  terminalGreen: '#00ff41',

  /** Dimmed terminal green for secondary money text */
  terminalGreenDim: '#00b33c',

  /** Very dim green for disabled/inactive states */
  terminalGreenFaded: '#004d2a',

  /** Spray paint pink accent for important actions */
  hotPink: '#ff2d6b',

  /** Street-red for warnings */
  warningRed: '#ff4444',

  /** Highlighter yellow for premium/special items */
  gold: '#ffb800',

  /** Trust resource blue / cyan accent */
  trustBlue: '#41ffff',

  /** Default text color (near-white for readability) */
  text: '#edf2f4',

  /** Dim text for secondary information */
  textDim: '#8d99ae',

  /** Border color for panels */
  border: '#0f3460',

  /** Subtle border for inner elements */
  borderDim: '#16213e',

  /** Secondary border for inner dividers within panels */
  borderSecondary: '#1a1a2e',

  /** Glow effect color (subtle dark shadow instead of green phosphor) */
  glow: '#000000',
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

  /** Standardized gap between game cards */
  cardGap: 20,
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
 * Shadow effects for pixel art panels.
 * Subtle dark drop shadows instead of green phosphor glow.
 */
export const SHADOWS = {
  /** Subtle shadow for panels */
  glowSm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  /** Medium shadow for active/elevated elements */
  glowMd: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },

  /** Strong shadow for modal overlays and focused elements */
  glowLg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
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
