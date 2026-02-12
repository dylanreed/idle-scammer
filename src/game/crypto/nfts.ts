// ABOUTME: NFT helper functions for rarity rolling, mint costs, floor prices, and hype mechanics
// ABOUTME: Standalone pure functions used by the crypto store for NFT operations

import type { NFTRarity, NFTItem, NFTCollection } from './types';
import {
  NFT_RARITY_WEIGHTS,
  BASE_MINT_COST,
  NFT_RARITY_MULTIPLIERS,
  HYPE_DECAY_RATE,
  HYPE_SHILL_BOOST,
  MAX_HYPE,
  RUG_PULL_FRACTION,
  BASE_FLOOR_PRICE_PER_HYPE,
} from './constants';
import { nextSeed, seedToRandom } from './market';

/**
 * Rolls an NFT rarity tier using seeded PRNG.
 * Uses weighted random selection based on NFT_RARITY_WEIGHTS.
 *
 * @param seed - Current PRNG seed
 * @returns [rarity, nextSeed] tuple
 */
export function rollNFTRarity(seed: number): [NFTRarity, number] {
  const s = nextSeed(seed);
  const roll = seedToRandom(s) * 100;

  let cumulative = 0;
  const rarities: NFTRarity[] = ['common', 'uncommon', 'rare', 'legendary', 'mythic'];
  for (const rarity of rarities) {
    cumulative += NFT_RARITY_WEIGHTS[rarity];
    if (roll < cumulative) {
      return [rarity, s];
    }
  }
  // Fallback (shouldn't reach due to weights summing to 100)
  return ['common', s];
}

/**
 * Calculates the mint cost for an NFT.
 * All rarities cost the same to mint — rarity is determined by luck.
 *
 * @returns Mint cost in crypto
 */
export function calculateMintCost(): number {
  return BASE_MINT_COST;
}

/**
 * Calculates the floor price of an NFT based on its rarity and collection hype.
 *
 * @param rarity - The NFT's rarity tier
 * @param hype - The collection's current hype level (0-100)
 * @returns Floor price in crypto
 */
export function calculateFloorPrice(rarity: NFTRarity, hype: number): number {
  return hype * BASE_FLOOR_PRICE_PER_HYPE * NFT_RARITY_MULTIPLIERS[rarity];
}

/**
 * Calculates the floor price for a collection (base, without rarity multiplier).
 *
 * @param hype - The collection's current hype level (0-100)
 * @returns Base floor price in crypto
 */
export function calculateCollectionFloorPrice(hype: number): number {
  return hype * BASE_FLOOR_PRICE_PER_HYPE;
}

/**
 * Advances hype for a collection by deltaMs milliseconds.
 * Hype decays exponentially and is boosted by shillers.
 *
 * Formula: newHype = hype * exp(-HYPE_DECAY_RATE * deltaSec) + shillers * HYPE_SHILL_BOOST * deltaSec
 * Clamped to [0, MAX_HYPE].
 *
 * @param hype - Current hype level
 * @param shillers - Number of shill employees assigned
 * @param deltaMs - Time elapsed in milliseconds
 * @returns New hype level
 */
export function tickHype(hype: number, shillers: number, deltaMs: number): number {
  if (deltaMs <= 0) return hype;
  const deltaSec = deltaMs / 1000;

  const decayed = hype * Math.exp(-HYPE_DECAY_RATE * deltaSec);
  const boosted = decayed + shillers * HYPE_SHILL_BOOST * deltaSec;
  return Math.max(0, Math.min(MAX_HYPE, boosted));
}

/**
 * Calculates the crypto return from rug-pulling a collection.
 * Returns RUG_PULL_FRACTION (70%) of the total value of all NFTs in the collection.
 *
 * @param nfts - All NFTs belonging to this collection
 * @param hype - The collection's current hype level
 * @returns Crypto value received from rug pull
 */
export function calculateRugPullReturn(nfts: NFTItem[], hype: number): number {
  let totalValue = 0;
  for (const nft of nfts) {
    totalValue += calculateFloorPrice(nft.rarity, hype);
  }
  return totalValue * RUG_PULL_FRACTION;
}
