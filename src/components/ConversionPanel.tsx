// ABOUTME: Buy/sell crypto conversion interface
// ABOUTME: Allows players to convert between money and crypto at the current exchange rate

import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { TerminalText } from './TerminalText';
import { PixelButton } from './PixelButton';
import { COLORS, SPACING } from './theme';

export interface ConversionPanelProps {
  /** Current player money */
  money: number;
  /** Current player crypto */
  crypto: number;
  /** Get crypto quote for a money amount */
  getBuyQuote: (money: number) => number;
  /** Get money quote for a crypto amount */
  getSellQuote: (crypto: number) => number;
  /** Called when player buys crypto (passes money amount to spend) */
  onBuy: (moneyAmount: number) => void;
  /** Called when player sells crypto (passes crypto amount to sell) */
  onSell: (cryptoAmount: number) => void;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Buy/sell crypto conversion panel with amount input and quote preview.
 */
export function ConversionPanel({
  money,
  crypto,
  getBuyQuote,
  getSellQuote,
  onBuy,
  onSell,
  testID,
}: ConversionPanelProps): React.ReactElement {
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');

  const buyNum = parseFloat(buyAmount) || 0;
  const sellNum = parseFloat(sellAmount) || 0;

  const buyQuote = buyNum > 0 ? getBuyQuote(buyNum) : 0;
  const sellQuote = sellNum > 0 ? getSellQuote(sellNum) : 0;

  const canBuy = buyNum > 0 && buyNum <= money;
  const canSell = sellNum > 0 && sellNum <= crypto;

  return (
    <View style={styles.container} testID={testID}>
      {/* Buy Section */}
      <View style={styles.section}>
        <TerminalText size="sm" color={COLORS.terminalGreen}>
          {'BUY TRUSTCOIN'}
        </TerminalText>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={buyAmount}
            onChangeText={setBuyAmount}
            placeholder="$ amount"
            placeholderTextColor={COLORS.terminalGreenDim}
            keyboardType="numeric"
            testID="buy-input"
          />
          <PixelButton
            onPress={() => {
              if (canBuy) {
                onBuy(buyNum);
                setBuyAmount('');
              }
            }}
            disabled={!canBuy}
            variant="primary"
            testID="buy-btn"
          >
            {'BUY'}
          </PixelButton>
        </View>
        {buyNum > 0 && (
          <TerminalText size="sm" color={COLORS.terminalGreenDim}>
            {`\u2192 ${buyQuote.toFixed(4)} $TRUST`}
          </TerminalText>
        )}
      </View>

      {/* Sell Section */}
      <View style={styles.section}>
        <TerminalText size="sm" color={COLORS.terminalGreen}>
          {'SELL TRUSTCOIN'}
        </TerminalText>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={sellAmount}
            onChangeText={setSellAmount}
            placeholder="$TRUST amount"
            placeholderTextColor={COLORS.terminalGreenDim}
            keyboardType="numeric"
            testID="sell-input"
          />
          <PixelButton
            onPress={() => {
              if (canSell) {
                onSell(sellNum);
                setSellAmount('');
              }
            }}
            disabled={!canSell}
            variant="danger"
            testID="sell-btn"
          >
            {'SELL'}
          </PixelButton>
        </View>
        {sellNum > 0 && (
          <TerminalText size="sm" color={COLORS.terminalGreenDim}>
            {`\u2192 $${sellQuote.toFixed(2)}`}
          </TerminalText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.md,
  },
  section: {
    gap: SPACING.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.terminalGreen,
    color: COLORS.terminalGreen,
    fontFamily: 'monospace',
    fontSize: 14,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
  },
});
