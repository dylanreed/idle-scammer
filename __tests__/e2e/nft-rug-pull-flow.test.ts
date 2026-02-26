// ABOUTME: Integration test for NFT rug pull flow across crypto and game stores
// ABOUTME: Verifies that rug pulling a collection credits TrustCoin (crypto) to the player

import { useCryptoStore } from '../../src/game/crypto/cryptoStore';
import { useGameStore } from '../../src/game/store';
import {
  BASE_FLOOR_PRICE_PER_HYPE,
  BASE_MINT_COST,
  NFT_RARITY_MULTIPLIERS,
  RUG_PULL_FRACTION,
} from '../../src/game/crypto/constants';

// Reset both stores before each test
beforeEach(() => {
  useCryptoStore.getState().reset();
  useGameStore.getState().setResource('crypto', 0);
  useGameStore.getState().setResource('money', 0);
});

describe('NFT Rug Pull Flow (integration)', () => {
  it('should credit crypto to game store when rug pulling a collection with NFTs', () => {
    // Give the player some crypto to mint with
    useGameStore.getState().addCrypto(10);

    // Create a collection (hype starts at 50)
    const collection = useCryptoStore.getState().createCollection('Rug Test');
    expect(collection).not.toBeNull();
    expect(collection!.hype).toBe(50);

    // Mint 3 NFTs (costs 0.1 crypto each via game store)
    const nfts = [];
    for (let i = 0; i < 3; i++) {
      const nft = useCryptoStore.getState().mintNFT(collection!.id);
      expect(nft).not.toBeNull();
      nfts.push(nft!);
      // Deduct mint cost from game store (mirroring CryptoPanel.handleMintNFT)
      useGameStore.getState().addCrypto(-BASE_MINT_COST);
    }

    expect(useCryptoStore.getState().ownedNFTs).toHaveLength(3);
    const cryptoBefore = useGameStore.getState().resources.crypto;

    // Calculate expected rug value
    let expectedTotal = 0;
    for (const nft of nfts) {
      expectedTotal +=
        collection!.hype * BASE_FLOOR_PRICE_PER_HYPE * NFT_RARITY_MULTIPLIERS[nft.rarity];
    }
    const expectedRug = expectedTotal * RUG_PULL_FRACTION;
    expect(expectedRug).toBeGreaterThan(0);

    // Perform rug pull (mirroring CryptoPanel.handleRugPull)
    const cryptoReceived = useCryptoStore.getState().rugPullCollection(collection!.id);
    if (cryptoReceived > 0) {
      useGameStore.getState().addCrypto(cryptoReceived);
    }

    // Verify crypto was credited
    const cryptoAfter = useGameStore.getState().resources.crypto;
    expect(cryptoReceived).toBeCloseTo(expectedRug, 5);
    expect(cryptoAfter).toBeCloseTo(cryptoBefore + expectedRug, 5);
    expect(cryptoAfter).toBeGreaterThan(cryptoBefore);
  });

  it('should return 0 when collection has no NFTs', () => {
    const collection = useCryptoStore.getState().createCollection('Empty Collection');
    expect(collection).not.toBeNull();

    const cryptoBefore = useGameStore.getState().resources.crypto;
    const cryptoReceived = useCryptoStore.getState().rugPullCollection(collection!.id);

    // No NFTs in collection = no value to drain
    expect(cryptoReceived).toBe(0);

    // Mirroring CryptoPanel handler: only addCrypto if > 0
    if (cryptoReceived > 0) {
      useGameStore.getState().addCrypto(cryptoReceived);
    }

    expect(useGameStore.getState().resources.crypto).toBe(cryptoBefore);
  });

  it('should give less value when hype has decayed significantly', () => {
    useGameStore.getState().addCrypto(10);

    const collection = useCryptoStore.getState().createCollection('Decayed');
    const nft = useCryptoStore.getState().mintNFT(collection!.id);
    expect(nft).not.toBeNull();

    // Record value at full hype
    const fullHypeValue =
      collection!.hype * BASE_FLOOR_PRICE_PER_HYPE * NFT_RARITY_MULTIPLIERS[nft!.rarity];

    // Simulate significant hype decay (exponential decay at rate 0.005/sec)
    // After 200s: hype ≈ 50 * exp(-0.005 * 200) ≈ 50 * 0.368 ≈ 18.4
    useCryptoStore.getState().tickCollections(200_000);

    const currentHype = useCryptoStore.getState().collections[0].hype;
    expect(currentHype).toBeLessThan(collection!.hype); // Hype has decayed

    const cryptoReceived = useCryptoStore.getState().rugPullCollection(collection!.id);
    const decayedValue =
      currentHype * BASE_FLOOR_PRICE_PER_HYPE * NFT_RARITY_MULTIPLIERS[nft!.rarity];
    const expectedRug = decayedValue * RUG_PULL_FRACTION;

    // Rug value should match the decayed hype, not the original
    expect(cryptoReceived).toBeCloseTo(expectedRug, 5);
    expect(cryptoReceived).toBeLessThan(fullHypeValue * RUG_PULL_FRACTION);
    // Value should still be positive (hype hasn't fully decayed)
    expect(cryptoReceived).toBeGreaterThan(0);
  });

  it('should only count NFTs still owned (not already sold ones)', () => {
    useGameStore.getState().addCrypto(10);

    const collection = useCryptoStore.getState().createCollection('Partial Rug');
    const nft1 = useCryptoStore.getState().mintNFT(collection!.id);
    const nft2 = useCryptoStore.getState().mintNFT(collection!.id);
    const nft3 = useCryptoStore.getState().mintNFT(collection!.id);

    // Sell 2 of the 3 NFTs individually
    useCryptoStore.getState().sellNFT(nft1!.id);
    useCryptoStore.getState().sellNFT(nft2!.id);

    expect(useCryptoStore.getState().ownedNFTs).toHaveLength(1);

    // Rug pull should only value the 1 remaining NFT
    const hype = useCryptoStore.getState().collections[0].hype;
    const expectedValue =
      hype * BASE_FLOOR_PRICE_PER_HYPE * NFT_RARITY_MULTIPLIERS[nft3!.rarity];
    const expectedRug = expectedValue * RUG_PULL_FRACTION;

    const cryptoReceived = useCryptoStore.getState().rugPullCollection(collection!.id);
    expect(cryptoReceived).toBeCloseTo(expectedRug, 5);
  });

  it('should not credit crypto when rug pulling an already-rugged collection', () => {
    useGameStore.getState().addCrypto(10);

    const collection = useCryptoStore.getState().createCollection('Double Rug');
    useCryptoStore.getState().mintNFT(collection!.id);

    // First rug pull
    const firstRug = useCryptoStore.getState().rugPullCollection(collection!.id);
    if (firstRug > 0) {
      useGameStore.getState().addCrypto(firstRug);
    }

    const cryptoAfterFirst = useGameStore.getState().resources.crypto;

    // Second rug pull attempt on same collection
    const secondRug = useCryptoStore.getState().rugPullCollection(collection!.id);
    expect(secondRug).toBe(0);

    if (secondRug > 0) {
      useGameStore.getState().addCrypto(secondRug);
    }

    expect(useGameStore.getState().resources.crypto).toBe(cryptoAfterFirst);
  });

  it('should handle rug pull with high-rarity NFTs correctly', () => {
    useGameStore.getState().addCrypto(100);

    const collection = useCryptoStore.getState().createCollection('Rare Rug');

    // Mint many NFTs to get a spread of rarities
    const nfts = [];
    for (let i = 0; i < 20; i++) {
      const nft = useCryptoStore.getState().mintNFT(collection!.id);
      expect(nft).not.toBeNull();
      nfts.push(nft!);
    }

    // Calculate expected value using current hype
    const hype = useCryptoStore.getState().collections[0].hype;
    let expectedTotal = 0;
    for (const nft of nfts) {
      expectedTotal += hype * BASE_FLOOR_PRICE_PER_HYPE * NFT_RARITY_MULTIPLIERS[nft.rarity];
    }
    const expectedRug = expectedTotal * RUG_PULL_FRACTION;

    const cryptoBefore = useGameStore.getState().resources.crypto;
    const cryptoReceived = useCryptoStore.getState().rugPullCollection(collection!.id);

    if (cryptoReceived > 0) {
      useGameStore.getState().addCrypto(cryptoReceived);
    }

    expect(cryptoReceived).toBeCloseTo(expectedRug, 5);
    expect(useGameStore.getState().resources.crypto).toBeCloseTo(
      cryptoBefore + expectedRug,
      5
    );
  });
});
