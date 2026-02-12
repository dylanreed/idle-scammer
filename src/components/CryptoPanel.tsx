// ABOUTME: Top-level crypto tab container with market, exchange, projects, and NFT subsections
// ABOUTME: Orchestrates all crypto UI components in a scrollable panel with CRT frame

import React, { useRef, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { CRTFrame } from './CRTFrame';
import { TerminalText } from './TerminalText';
import { MarketDisplay } from './MarketDisplay';
import { ConversionPanel } from './ConversionPanel';
import { ProjectList } from './ProjectList';
import { NFTGallery } from './NFTGallery';
import { CollectionPanel } from './CollectionPanel';
import { NFTMintPanel } from './NFTMintPanel';
import { COLORS, SPACING } from './theme';
import { useCryptoStore } from '../game/crypto/cryptoStore';
import { useGameStore } from '../game/store';
import { BASE_MINT_COST } from '../game/crypto/constants';

export interface CryptoPanelProps {
  /** Test ID for testing */
  testID?: string;
}

/**
 * Top-level crypto panel containing market, exchange, projects, and NFTs.
 * Reads directly from crypto and game stores.
 */
export function CryptoPanel({ testID }: CryptoPanelProps): React.ReactElement {
  const market = useCryptoStore((s) => s.market);
  const activeProjects = useCryptoStore((s) => s.activeProjects);
  const ownedNFTs = useCryptoStore((s) => s.ownedNFTs);
  const collections = useCryptoStore((s) => s.collections);
  const resources = useGameStore((s) => s.resources);

  // Track previous exchange rate for trend arrow
  const prevRateRef = useRef(market.exchangeRate);
  const previousRate = prevRateRef.current;
  // Update previous rate after render (ref doesn't trigger re-render)
  prevRateRef.current = market.exchangeRate;

  const handleBuyCrypto = useCallback((moneyAmount: number) => {
    const cryptoReceived = useCryptoStore.getState().getBuyQuote(moneyAmount);
    if (cryptoReceived <= 0) return;
    if (useGameStore.getState().resources.money < moneyAmount) return;
    useGameStore.getState().addMoney(-moneyAmount);
    useGameStore.getState().addCrypto(cryptoReceived);
  }, []);

  const handleSellCrypto = useCallback((cryptoAmount: number) => {
    const moneyReceived = useCryptoStore.getState().getSellQuote(cryptoAmount);
    if (moneyReceived <= 0) return;
    if (useGameStore.getState().resources.crypto < cryptoAmount) return;
    useGameStore.getState().addCrypto(-cryptoAmount);
    useGameStore.getState().addMoney(moneyReceived);
  }, []);

  const handleInvest = useCallback((definitionId: string, amount: number) => {
    if (useGameStore.getState().resources.crypto < amount) return;
    const project = useCryptoStore.getState().investInProject(definitionId, amount);
    if (project) {
      useGameStore.getState().addCrypto(-amount);
    }
  }, []);

  const handleCollect = useCallback((index: number) => {
    const payout = useCryptoStore.getState().collectProject(index);
    if (payout > 0) {
      useGameStore.getState().addCrypto(payout);
    }
  }, []);

  const handleCreateCollection = useCallback((name: string) => {
    useCryptoStore.getState().createCollection(name);
  }, []);

  const handleMintNFT = useCallback((collectionId: string) => {
    if (useGameStore.getState().resources.crypto < BASE_MINT_COST) return;
    const nft = useCryptoStore.getState().mintNFT(collectionId);
    if (nft) {
      useGameStore.getState().addCrypto(-BASE_MINT_COST);
    }
  }, []);

  const handleSellNFT = useCallback((nftId: string) => {
    const cryptoReceived = useCryptoStore.getState().sellNFT(nftId);
    if (cryptoReceived > 0) {
      useGameStore.getState().addCrypto(cryptoReceived);
    }
  }, []);

  const handleRugPull = useCallback((collectionId: string) => {
    const cryptoReceived = useCryptoStore.getState().rugPullCollection(collectionId);
    if (cryptoReceived > 0) {
      useGameStore.getState().addCrypto(cryptoReceived);
    }
  }, []);

  const handleSetShillers = useCallback((collectionId: string, count: number) => {
    useCryptoStore.getState().setShillers(collectionId, count);
  }, []);

  return (
    <CRTFrame testID={testID} style={styles.frame} accentColor={COLORS.secondary}>
      <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <TerminalText size="lg" color={COLORS.textPrimary}>
            {'TRUSTCOIN EXCHANGE'}
          </TerminalText>

          {/* Market Display */}
          <MarketDisplay
            exchangeRate={market.exchangeRate}
            previousRate={previousRate}
            activeEvent={market.activeEvent?.type}
            testID="market-display"
          />

          {/* Buy/Sell */}
          <CRTFrame showScanlines={false} style={styles.section}>
            <ConversionPanel
              money={resources.money}
              crypto={resources.crypto}
              getBuyQuote={useCryptoStore.getState().getBuyQuote}
              getSellQuote={useCryptoStore.getState().getSellQuote}
              onBuy={handleBuyCrypto}
              onSell={handleSellCrypto}
              testID="conversion-panel"
            />
          </CRTFrame>

          {/* Investment Projects */}
          <CRTFrame showScanlines={false} style={styles.section}>
            <ProjectList
              activeProjects={activeProjects}
              crypto={resources.crypto}
              isProjectMatured={useCryptoStore.getState().isProjectMatured}
              onInvest={handleInvest}
              onCollect={handleCollect}
              testID="project-list"
            />
          </CRTFrame>

          {/* NFT Section */}
          <CRTFrame showScanlines={false} style={styles.section}>
            <TerminalText size="md" color={COLORS.textPrimary}>
              {'NFT MARKETPLACE'}
            </TerminalText>

            <NFTMintPanel
              collectionCount={collections.length}
              onCreate={handleCreateCollection}
              testID="nft-mint-panel"
            />

            <CollectionPanel
              collections={collections}
              onSetShillers={handleSetShillers}
              onRugPull={handleRugPull}
              onMint={handleMintNFT}
              testID="collection-panel"
            />

            <NFTGallery
              ownedNFTs={ownedNFTs}
              collections={collections}
              onSell={handleSellNFT}
              testID="nft-gallery"
            />
          </CRTFrame>
        </View>
      </ScrollView>
    </CRTFrame>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  section: {
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
});
