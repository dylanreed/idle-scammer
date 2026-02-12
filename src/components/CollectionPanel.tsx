// ABOUTME: NFT collection management panel with hype display and shill controls
// ABOUTME: Shows collections, hype bars, shiller assignment, and rug pull button

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TerminalText } from './TerminalText';
import { PixelButton } from './PixelButton';
import { COLORS, SPACING } from './theme';
import type { NFTCollection } from '../game/crypto/types';
import { MAX_HYPE, BASE_FLOOR_PRICE_PER_HYPE } from '../game/crypto/constants';

export interface CollectionPanelProps {
  /** All player collections */
  collections: NFTCollection[];
  /** Called when player adjusts shillers on a collection */
  onSetShillers: (collectionId: string, count: number) => void;
  /** Called when player rug pulls a collection */
  onRugPull: (collectionId: string) => void;
  /** Called when player mints an NFT in a collection */
  onMint: (collectionId: string) => void;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Renders a hype bar visualization.
 */
function HypeBar({ hype }: { hype: number }): React.ReactElement {
  const filled = Math.round((hype / MAX_HYPE) * 20);
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(20 - filled);
  const color = hype > 60 ? COLORS.terminalGreen : hype > 30 ? COLORS.gold : COLORS.warningRed;

  return (
    <TerminalText size="sm" color={color}>
      {`HYPE [${bar}] ${Math.round(hype)}%`}
    </TerminalText>
  );
}

/**
 * Collection management panel showing all collections with controls.
 */
export function CollectionPanel({
  collections,
  onSetShillers,
  onRugPull,
  onMint,
  testID,
}: CollectionPanelProps): React.ReactElement {
  return (
    <View style={styles.container} testID={testID}>
      {collections.length === 0 ? (
        <TerminalText size="sm" color={COLORS.terminalGreenDim}>
          {'No collections yet. Create one to start minting!'}
        </TerminalText>
      ) : (
        collections.map((collection) => (
          <View key={collection.id} style={[styles.card, collection.isRugged && styles.ruggedCard]}>
            <View style={styles.header}>
              <TerminalText size="sm" color={collection.isRugged ? COLORS.warningRed : COLORS.terminalGreen}>
                {collection.name}
              </TerminalText>
              {collection.isRugged && (
                <TerminalText size="sm" color={COLORS.warningRed}>
                  {'[RUGGED]'}
                </TerminalText>
              )}
            </View>

            {!collection.isRugged && (
              <>
                <HypeBar hype={collection.hype} />

                <TerminalText size="sm" color={COLORS.terminalGreenDim}>
                  {`Floor: ${(collection.hype * BASE_FLOOR_PRICE_PER_HYPE).toFixed(4)} $TRUST`}
                </TerminalText>

                <View style={styles.shillerRow}>
                  <TerminalText size="sm" color={COLORS.terminalGreenDim}>
                    {`Shillers: ${collection.shillers}`}
                  </TerminalText>
                  <View style={styles.shillerButtons}>
                    <PixelButton
                      onPress={() => onSetShillers(collection.id, Math.max(0, collection.shillers - 1))}
                      disabled={collection.shillers <= 0}
                      variant="secondary"
                      testID={`shill-minus-${collection.id}`}
                    >
                      {'-'}
                    </PixelButton>
                    <PixelButton
                      onPress={() => onSetShillers(collection.id, collection.shillers + 1)}
                      variant="secondary"
                      testID={`shill-plus-${collection.id}`}
                    >
                      {'+'}
                    </PixelButton>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <PixelButton
                    onPress={() => onMint(collection.id)}
                    variant="primary"
                    testID={`mint-btn-${collection.id}`}
                  >
                    {'MINT NFT'}
                  </PixelButton>
                  <PixelButton
                    onPress={() => onRugPull(collection.id)}
                    variant="danger"
                    testID={`rug-btn-${collection.id}`}
                  >
                    {'RUG PULL'}
                  </PixelButton>
                </View>
              </>
            )}

            {collection.isRugged && collection.rugPullValue > 0 && (
              <TerminalText size="sm" color={COLORS.terminalGreenDim}>
                {`Drained: ${collection.rugPullValue.toFixed(2)} $TRUST`}
              </TerminalText>
            )}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  card: {
    borderWidth: 1,
    borderColor: COLORS.terminalGreenDim,
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  ruggedCard: {
    borderColor: COLORS.warningRed,
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shillerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shillerButtons: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'flex-end',
  },
});
