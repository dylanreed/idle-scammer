// ABOUTME: Number and time formatting utilities for displaying game values
// ABOUTME: Provides compact notation (1K, 1M), percentages, and duration formatting

/**
 * Suffixes for compact number notation.
 * Each entry represents 10^(index*3) threshold.
 */
const NUMBER_SUFFIXES = ['', 'K', 'M', 'B', 'T'];

/**
 * Format a number into compact notation for display.
 * Numbers under 1000 shown as-is, larger numbers get suffixes.
 *
 * Examples:
 * - 999 -> "999"
 * - 1000 -> "1K"
 * - 1500 -> "1.5K"
 * - 1000000 -> "1M"
 * - 1000000000 -> "1B"
 * - 1000000000000 -> "1T"
 *
 * @param n - The number to format
 * @returns Formatted string with appropriate suffix
 */
export function formatNumber(n: number): string {
  const isNegative = n < 0;
  const absValue = Math.abs(n);

  // Find appropriate suffix
  let suffixIndex = 0;
  let scaledValue = absValue;

  // Keep dividing by 1000 until we're under 1000 or out of suffixes
  while (scaledValue >= 1000 && suffixIndex < NUMBER_SUFFIXES.length - 1) {
    scaledValue /= 1000;
    suffixIndex++;
  }

  // Format the scaled value - up to 2 decimal places, no trailing zeros
  let formatted: string;
  if (suffixIndex === 0) {
    // Small numbers: show up to 2 decimal places
    formatted = formatWithPrecision(scaledValue, 2);
  } else {
    // Large numbers with suffix: show up to 2 decimal places
    formatted = formatWithPrecision(scaledValue, 2);
  }

  const suffix = NUMBER_SUFFIXES[suffixIndex];
  const sign = isNegative ? '-' : '';

  return `${sign}${formatted}${suffix}`;
}

/**
 * Format a number with specified decimal precision, removing trailing zeros.
 */
function formatWithPrecision(n: number, precision: number): string {
  // Round to specified precision
  const factor = Math.pow(10, precision);
  const rounded = Math.round(n * factor) / factor;

  // Convert to string with precision, then remove trailing zeros
  const fixed = rounded.toFixed(precision);
  return fixed.replace(/\.?0+$/, '');
}

/**
 * Format a decimal as a percentage string.
 *
 * Examples:
 * - 0.5 -> "50%"
 * - 0.123 -> "12.3%"
 * - 1.5 -> "150%"
 *
 * @param n - Decimal value (0.5 = 50%)
 * @returns Formatted percentage string
 */
export function formatPercent(n: number): string {
  const percentage = n * 100;
  const formatted = formatWithPrecision(percentage, 2);
  return `${formatted}%`;
}

/**
 * Format a duration in milliseconds to human-readable string.
 *
 * Examples:
 * - 5000 -> "5s"
 * - 90000 -> "1m 30s"
 * - 3600000 -> "1h"
 * - 5400000 -> "1h 30m"
 *
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string
 */
export function formatDuration(ms: number): string {
  // Convert to seconds (floored)
  const totalSeconds = Math.floor(ms / 1000);

  if (totalSeconds === 0) {
    return '0s';
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }

  if (seconds > 0) {
    parts.push(`${seconds}s`);
  }

  return parts.join(' ');
}
