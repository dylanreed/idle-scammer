// ABOUTME: Displays the current crypto exchange rate with trend arrow
// ABOUTME: Shows money-per-crypto rate and visual indicator of market direction

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TerminalText } from './TerminalText';
import { COLORS, SPACING } from './theme';

export interface MarketDisplayProps {
  /** Current exchange rate (money per 1 crypto) */
  exchangeRate: number;
  /** Previous exchange rate for trend indicator */
  previousRate?: number;
  /** Active market event name, if any */
  activeEvent?: string | null;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Formats a number for display with appropriate precision.
 */
function formatRate(rate: number): string {
  if (rate >= 10000) return Math.floor(rate).toLocaleString();
  if (rate >= 100) return rate.toFixed(1);
  return rate.toFixed(2);
}

/**
 * Displays the current crypto exchange rate with trend arrow and event indicator.
 */
export function MarketDisplay({
  exchangeRate,
  previousRate,
  activeEvent,
  testID,
}: MarketDisplayProps): React.ReactElement {
  const trend = previousRate ? exchangeRate - previousRate : 0;
  const trendArrow = trend > 0 ? '\u25B2' : trend < 0 ? '\u25BC' : '\u25C6';
  const trendColor = trend > 0 ? COLORS.terminalGreen : trend < 0 ? COLORS.warningRed : COLORS.terminalGreenDim;

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.rateRow}>
        <TerminalText size="sm" color={COLORS.terminalGreenDim}>
          {'1 TRUSTCOIN ='}
        </TerminalText>
        <TerminalText size="md" color={COLORS.terminalGreen}>
          {`$${formatRate(exchangeRate)}`}
        </TerminalText>
        <TerminalText size="md" color={trendColor}>
          {trendArrow}
        </TerminalText>
      </View>
      {activeEvent && (
        <TerminalText size="sm" color={COLORS.gold} style={styles.event}>
          {`EVENT: ${activeEvent.toUpperCase().replace(/-/g, ' ')}`}
        </TerminalText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  event: {
    marginTop: SPACING.xs,
  },
});
