// ABOUTME: Tests for NFT helper functions
// ABOUTME: Validates rarity rolling, mint costs, floor prices, hype decay, and rug pull returns

import {
  rollNFTRarity,
  calculateMintCost,
  calculateFloorPrice,
  calculateCollectionFloorPrice,
  tickHype,
  calculateRugPullReturn,
} from '../../../src/game/crypto/nfts';
import { nextSeed } from '../../../src/game/crypto/market';
import type { NFTItem, NFTRarity } from '../../../src/game/crypto/types';
import {
  BASE_MINT_COST,
  NFT_RARITY_WEIGHTS,
  NFT_RARITY_MULTIPLIERS,
  BASE_FLOOR_PRICE_PER_HYPE,
  MAX_HYPE,
  RUG_PULL_FRACTION,
} from '../../../src/game/crypto/constants';

describe('NFT helpers', () => {
  describe('rollNFTRarity', () => {
    it('should be deterministic (same seed = same result)', () => {
      const [r1, s1] = rollNFTRarity(42);
      const [r2, s2] = rollNFTRarity(42);
      expect(r1).toBe(r2);
      expect(s1).toBe(s2);
    });

    it('should return a valid rarity', () => {
      const validRarities: NFTRarity[] = ['common', 'uncommon', 'rare', 'legendary', 'mythic'];
      let seed = 1;
      for (let i = 0; i < 100; i++) {
        const [rarity, newSeed] = rollNFTRarity(seed);
        expect(validRarities).toContain(rarity);
        seed = newSeed;
      }
    });

    it('should produce common most frequently', () => {
      const counts: Record<string, number> = { common: 0, uncommon: 0, rare: 0, legendary: 0, mythic: 0 };
      const trials = 10000;
      let seed = 1;

      for (let i = 0; i < trials; i++) {
        const [rarity, newSeed] = rollNFTRarity(seed);
        counts[rarity]++;
        seed = newSeed;
      }

      // Common should be most frequent (~60%)
      expect(counts.common).toBeGreaterThan(counts.uncommon);
      expect(counts.uncommon).toBeGreaterThan(counts.rare);
      expect(counts.rare).toBeGreaterThan(counts.legendary);
      expect(counts.legendary).toBeGreaterThan(counts.mythic);
    });

    it('should roughly match expected distribution', () => {
      const counts: Record<string, number> = { common: 0, uncommon: 0, rare: 0, legendary: 0, mythic: 0 };
      const trials = 50000;
      let seed = 1;

      for (let i = 0; i < trials; i++) {
        const [rarity, newSeed] = rollNFTRarity(seed);
        counts[rarity]++;
        seed = newSeed;
      }

      // Allow 3% tolerance
      const tolerance = 0.03;
      expect(counts.common / trials).toBeCloseTo(NFT_RARITY_WEIGHTS.common / 100, 1);
      expect(counts.uncommon / trials).toBeCloseTo(NFT_RARITY_WEIGHTS.uncommon / 100, 1);
      expect(counts.rare / trials).toBeCloseTo(NFT_RARITY_WEIGHTS.rare / 100, 1);
    });

    it('should advance the seed', () => {
      const [, newSeed] = rollNFTRarity(42);
      expect(newSeed).not.toBe(42);
    });
  });

  describe('calculateMintCost', () => {
    it('should return the base mint cost', () => {
      expect(calculateMintCost()).toBe(BASE_MINT_COST);
    });

    it('should be positive', () => {
      expect(calculateMintCost()).toBeGreaterThan(0);
    });
  });

  describe('calculateFloorPrice', () => {
    it('should scale with hype and rarity', () => {
      const price = calculateFloorPrice('common', 50);
      expect(price).toBe(50 * BASE_FLOOR_PRICE_PER_HYPE * NFT_RARITY_MULTIPLIERS.common);
    });

    it('should return 0 when hype is 0', () => {
      expect(calculateFloorPrice('mythic', 0)).toBe(0);
    });

    it('should be higher for rarer NFTs', () => {
      const hype = 50;
      const common = calculateFloorPrice('common', hype);
      const uncommon = calculateFloorPrice('uncommon', hype);
      const rare = calculateFloorPrice('rare', hype);
      const legendary = calculateFloorPrice('legendary', hype);
      const mythic = calculateFloorPrice('mythic', hype);

      expect(uncommon).toBeGreaterThan(common);
      expect(rare).toBeGreaterThan(uncommon);
      expect(legendary).toBeGreaterThan(rare);
      expect(mythic).toBeGreaterThan(legendary);
    });

    it('should scale linearly with hype', () => {
      const price50 = calculateFloorPrice('rare', 50);
      const price100 = calculateFloorPrice('rare', 100);
      expect(price100).toBeCloseTo(price50 * 2, 5);
    });
  });

  describe('calculateCollectionFloorPrice', () => {
    it('should return base floor price without rarity multiplier', () => {
      expect(calculateCollectionFloorPrice(50)).toBe(50 * BASE_FLOOR_PRICE_PER_HYPE);
    });

    it('should return 0 when hype is 0', () => {
      expect(calculateCollectionFloorPrice(0)).toBe(0);
    });
  });

  describe('tickHype', () => {
    it('should decay hype over time without shillers', () => {
      const newHype = tickHype(50, 0, 5000);
      expect(newHype).toBeLessThan(50);
      expect(newHype).toBeGreaterThan(0);
    });

    it('should return same hype for 0 deltaMs', () => {
      expect(tickHype(50, 0, 0)).toBe(50);
    });

    it('should return same hype for negative deltaMs', () => {
      expect(tickHype(50, 0, -1000)).toBe(50);
    });

    it('should boost hype with shillers', () => {
      // With enough shillers, hype should increase
      const newHype = tickHype(10, 100, 1000);
      expect(newHype).toBeGreaterThan(10);
    });

    it('should clamp to MAX_HYPE', () => {
      const newHype = tickHype(99, 1000, 10000);
      expect(newHype).toBeLessThanOrEqual(MAX_HYPE);
    });

    it('should clamp to 0 minimum', () => {
      // With 0 hype and 0 shillers, should stay at 0
      expect(tickHype(0, 0, 5000)).toBe(0);
    });

    it('should decay exponentially (faster at higher hype)', () => {
      const highDecay = 50 - tickHype(50, 0, 1000);
      const lowDecay = 10 - tickHype(10, 0, 1000);
      // Higher hype should lose more absolute value
      expect(highDecay).toBeGreaterThan(lowDecay);
    });

    it('should find equilibrium with constant shillers', () => {
      // With shillers, hype should stabilize somewhere
      let hype = 0;
      const shillers = 5;
      for (let i = 0; i < 1000; i++) {
        hype = tickHype(hype, shillers, 1000);
      }
      // After long time, should have stabilized
      const hypeAfterMore = tickHype(hype, shillers, 1000);
      expect(Math.abs(hypeAfterMore - hype)).toBeLessThan(0.1);
    });
  });

  describe('calculateRugPullReturn', () => {
    it('should return 70% of total NFT value', () => {
      const nfts: NFTItem[] = [
        { id: 'n1', collectionId: 'c1', rarity: 'common', mintCost: 0.1, mintedAt: 0 },
        { id: 'n2', collectionId: 'c1', rarity: 'rare', mintCost: 0.1, mintedAt: 0 },
      ];
      const hype = 50;

      const commonValue = 50 * BASE_FLOOR_PRICE_PER_HYPE * NFT_RARITY_MULTIPLIERS.common;
      const rareValue = 50 * BASE_FLOOR_PRICE_PER_HYPE * NFT_RARITY_MULTIPLIERS.rare;
      const expected = (commonValue + rareValue) * RUG_PULL_FRACTION;

      expect(calculateRugPullReturn(nfts, hype)).toBeCloseTo(expected, 5);
    });

    it('should return 0 for empty NFT array', () => {
      expect(calculateRugPullReturn([], 50)).toBe(0);
    });

    it('should return 0 when hype is 0', () => {
      const nfts: NFTItem[] = [
        { id: 'n1', collectionId: 'c1', rarity: 'mythic', mintCost: 0.1, mintedAt: 0 },
      ];
      expect(calculateRugPullReturn(nfts, 0)).toBe(0);
    });

    it('should be more valuable with higher rarity NFTs', () => {
      const commonNFTs: NFTItem[] = [
        { id: 'n1', collectionId: 'c1', rarity: 'common', mintCost: 0.1, mintedAt: 0 },
      ];
      const mythicNFTs: NFTItem[] = [
        { id: 'n2', collectionId: 'c1', rarity: 'mythic', mintCost: 0.1, mintedAt: 0 },
      ];

      expect(calculateRugPullReturn(mythicNFTs, 50)).toBeGreaterThan(
        calculateRugPullReturn(commonNFTs, 50)
      );
    });
  });
});
