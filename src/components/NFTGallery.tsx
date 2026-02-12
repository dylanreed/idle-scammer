// ABOUTME: Displays owned NFTs grouped by collection with sell functionality
// ABOUTME: Shows NFT rarity, collection membership, and floor price sell button

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TerminalText } from './TerminalText';
import { PixelButton } from './PixelButton';
import { COLORS, SPACING } from './theme';
import type { NFTItem, NFTCollection } from '../game/crypto/types';
import { NFT_RARITY_MULTIPLIERS, BASE_FLOOR_PRICE_PER_HYPE } from '../game/crypto/constants';

export interface NFTGalleryProps {
  /** Owned NFT items */
  ownedNFTs: NFTItem[];
  /** All collections for hype/price lookup */
  collections: NFTCollection[];
  /** Called when player sells an NFT */
  onSell: (nftId: string) => void;
  /** Test ID for testing */
  testID?: string;
}

/** Color per rarity tier */
const RARITY_COLORS: Record<string, string> = {
  common: COLORS.terminalGreenDim,
  uncommon: COLORS.terminalGreen,
  rare: '#4488ff',
  legendary: COLORS.gold,
  mythic: '#ff44ff',
};

/**
 * Gallery display of all owned NFTs with sell buttons.
 */
export function NFTGallery({
  ownedNFTs,
  collections,
  onSell,
  testID,
}: NFTGalleryProps): React.ReactElement {
  return (
    <View style={styles.container} testID={testID}>
      <TerminalText size="sm" color={COLORS.terminalGreen}>
        {`MY NFTs (${ownedNFTs.length})`}
      </TerminalText>
      {ownedNFTs.length === 0 ? (
        <TerminalText size="sm" color={COLORS.terminalGreenDim}>
          {'No NFTs yet. Mint some in a collection!'}
        </TerminalText>
      ) : (
        <ScrollView nestedScrollEnabled style={styles.list}>
          {ownedNFTs.map((nft) => {
            const collection = collections.find((c) => c.id === nft.collectionId);
            const hype = collection?.hype ?? 0;
            const floorPrice = hype * BASE_FLOOR_PRICE_PER_HYPE * NFT_RARITY_MULTIPLIERS[nft.rarity];
            const rarityColor = RARITY_COLORS[nft.rarity] ?? COLORS.terminalGreenDim;

            return (
              <View key={nft.id} style={styles.nftRow}>
                <View style={styles.nftInfo}>
                  <TerminalText size="sm" color={rarityColor}>
                    {`[${nft.rarity.toUpperCase()}]`}
                  </TerminalText>
                  <TerminalText size="sm" color={COLORS.terminalGreenDim}>
                    {collection?.name ?? 'Unknown'}
                  </TerminalText>
                </View>
                <View style={styles.nftAction}>
                  <TerminalText size="sm" color={COLORS.terminalGreen}>
                    {`${floorPrice.toFixed(4)} $TRUST`}
                  </TerminalText>
                  <PixelButton
                    onPress={() => onSell(nft.id)}
                    variant="secondary"
                    testID={`sell-nft-${nft.id}`}
                  >
                    {'SELL'}
                  </PixelButton>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  list: {
    maxHeight: 200,
  },
  nftRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.terminalGreenDim,
  },
  nftInfo: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  nftAction: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
});
