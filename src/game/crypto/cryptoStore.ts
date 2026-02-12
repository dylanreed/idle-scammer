// ABOUTME: Zustand store for managing crypto market state, projects, and NFTs
// ABOUTME: Handles market ticks, buy/sell conversion, project investment, and NFT operations

import { create } from 'zustand';
import type {
  MarketState,
  ProjectState,
  NFTItem,
  NFTCollection,
  CryptoSaveData,
  NFTRarity,
} from './types';
import { DEFAULT_MARKET_STATE, DEFAULT_CRYPTO_SAVE_DATA } from './types';
import { tickMarket, calculateCryptoFromMoney, calculateMoneyFromCrypto } from './market';
import { nextSeed, seedToRandom } from './market';
import {
  MAX_ACTIVE_PROJECTS,
  PROJECT_DEFINITIONS,
  MAX_COLLECTIONS,
  NFT_RARITY_WEIGHTS,
  BASE_MINT_COST,
  NFT_RARITY_MULTIPLIERS,
  HYPE_DECAY_RATE,
  HYPE_SHILL_BOOST,
  MAX_HYPE,
  RUG_PULL_FRACTION,
  BASE_FLOOR_PRICE_PER_HYPE,
} from './constants';

/**
 * Actions available on the crypto store.
 */
export interface CryptoStoreActions {
  /** Advance the market by one tick */
  tickMarket: () => void;

  /**
   * Calculate crypto received for a given money amount at current rate.
   * Does NOT modify state — caller coordinates resource changes.
   */
  getBuyQuote: (moneyAmount: number) => number;

  /**
   * Calculate money received for a given crypto amount at current rate.
   * Does NOT modify state — caller coordinates resource changes.
   */
  getSellQuote: (cryptoAmount: number) => number;

  /** Get the current exchange rate */
  getExchangeRate: () => number;

  /** Invest crypto in a project. Returns the created ProjectState or null if invalid. */
  investInProject: (definitionId: string, amount: number) => ProjectState | null;

  /** Check if a project has matured based on current time */
  isProjectMatured: (index: number) => boolean;

  /** Collect a matured project, returning crypto payout (0 if rugged) */
  collectProject: (index: number) => number;

  /** Create a new NFT collection */
  createCollection: (name: string) => NFTCollection | null;

  /** Mint an NFT in a collection. Returns the NFT or null if insufficient crypto. */
  mintNFT: (collectionId: string) => NFTItem | null;

  /** Sell an NFT at floor price. Returns crypto value. */
  sellNFT: (nftId: string) => number;

  /** Rug pull a collection. Returns total crypto drained. */
  rugPullCollection: (collectionId: string) => number;

  /** Set number of shillers for a collection */
  setShillers: (collectionId: string, count: number) => void;

  /** Tick all collection hype decay and shill boost */
  tickCollections: (deltaMs: number) => void;

  /** Get the floor price of a collection based on hype */
  getCollectionFloorPrice: (collectionId: string) => number;

  /** Reset all crypto state (prestige) */
  reset: () => void;

  /** Restore crypto state from save data */
  hydrate: (saveData: CryptoSaveData) => void;

  /** Export current state as save data */
  toSaveData: () => CryptoSaveData;
}

/**
 * Complete crypto store state.
 */
export interface CryptoStoreState extends CryptoStoreActions {
  market: MarketState;
  activeProjects: ProjectState[];
  completedProjects: ProjectState[];
  ownedNFTs: NFTItem[];
  collections: NFTCollection[];
}

/**
 * Roll an NFT rarity using seeded PRNG.
 * Returns [rarity, nextSeed].
 */
function rollRarity(seed: number): [NFTRarity, number] {
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
  // Fallback (shouldn't reach here)
  return ['common', s];
}

/**
 * Generate a unique ID for NFTs and collections using the PRNG seed.
 */
function generateId(prefix: string, seed: number): string {
  return `${prefix}-${(seed >>> 0).toString(36)}`;
}

/**
 * Crypto store using Zustand.
 * Manages the volatile crypto market, investment projects, and NFT collections.
 */
export const useCryptoStore = create<CryptoStoreState>()((set, get) => ({
  market: { ...DEFAULT_MARKET_STATE },
  activeProjects: [],
  completedProjects: [],
  ownedNFTs: [],
  collections: [],

  tickMarket: () => {
    set((state) => ({
      market: tickMarket(state.market),
    }));
  },

  getBuyQuote: (moneyAmount: number) => {
    return calculateCryptoFromMoney(moneyAmount, get().market.exchangeRate);
  },

  getSellQuote: (cryptoAmount: number) => {
    return calculateMoneyFromCrypto(cryptoAmount, get().market.exchangeRate);
  },

  getExchangeRate: () => {
    return get().market.exchangeRate;
  },

  investInProject: (definitionId: string, amount: number) => {
    const state = get();
    if (state.activeProjects.length >= MAX_ACTIVE_PROJECTS) return null;
    if (amount <= 0) return null;

    const definition = PROJECT_DEFINITIONS.find((p) => p.id === definitionId);
    if (!definition) return null;

    // Use market seed for determinism — determine rug pull and return at creation time
    let seed = state.market.seed;

    // Roll for rug pull
    seed = nextSeed(seed);
    const rugRoll = seedToRandom(seed);
    const isRugged = rugRoll < definition.rugChance;

    // Roll for return multiplier
    seed = nextSeed(seed);
    const returnRoll = seedToRandom(seed);
    const returnMultiplier = isRugged
      ? 0
      : definition.minReturn + returnRoll * (definition.maxReturn - definition.minReturn);

    const project: ProjectState = {
      definitionId,
      investedAmount: amount,
      startedAt: Date.now(),
      isRugged,
      returnMultiplier,
    };

    set((s) => ({
      activeProjects: [...s.activeProjects, project],
      market: { ...s.market, seed },
    }));

    return project;
  },

  isProjectMatured: (index: number) => {
    const state = get();
    const project = state.activeProjects[index];
    if (!project) return false;

    const definition = PROJECT_DEFINITIONS.find((p) => p.id === project.definitionId);
    if (!definition) return false;

    return Date.now() >= project.startedAt + definition.durationMs;
  },

  collectProject: (index: number) => {
    const state = get();
    const project = state.activeProjects[index];
    if (!project) return 0;

    const payout = project.isRugged ? 0 : project.investedAmount * project.returnMultiplier;

    set((s) => ({
      activeProjects: s.activeProjects.filter((_, i) => i !== index),
      completedProjects: [...s.completedProjects, project],
    }));

    return payout;
  },

  createCollection: (name: string) => {
    const state = get();
    if (state.collections.length >= MAX_COLLECTIONS) return null;
    if (!name || name.trim().length === 0) return null;

    let seed = state.market.seed;
    seed = nextSeed(seed);
    const id = generateId('col', seed);

    const collection: NFTCollection = {
      id,
      name: name.trim(),
      hype: 50, // start at 50% hype
      shillers: 0,
      isRugged: false,
      rugPullValue: 0,
      createdAt: Date.now(),
    };

    set((s) => ({
      collections: [...s.collections, collection],
      market: { ...s.market, seed },
    }));

    return collection;
  },

  mintNFT: (collectionId: string) => {
    const state = get();
    const collection = state.collections.find((c) => c.id === collectionId);
    if (!collection || collection.isRugged) return null;

    let seed = state.market.seed;
    const [rarity, newSeed] = rollRarity(seed);
    seed = nextSeed(newSeed);
    const id = generateId('nft', seed);

    const nft: NFTItem = {
      id,
      collectionId,
      rarity,
      mintCost: BASE_MINT_COST,
      mintedAt: Date.now(),
    };

    set((s) => ({
      ownedNFTs: [...s.ownedNFTs, nft],
      market: { ...s.market, seed },
    }));

    return nft;
  },

  sellNFT: (nftId: string) => {
    const state = get();
    const nft = state.ownedNFTs.find((n) => n.id === nftId);
    if (!nft) return 0;

    const collection = state.collections.find((c) => c.id === nft.collectionId);
    const hype = collection ? collection.hype : 0;
    const floorPrice = hype * BASE_FLOOR_PRICE_PER_HYPE * NFT_RARITY_MULTIPLIERS[nft.rarity];

    set((s) => ({
      ownedNFTs: s.ownedNFTs.filter((n) => n.id !== nftId),
    }));

    return floorPrice;
  },

  rugPullCollection: (collectionId: string) => {
    const state = get();
    const collection = state.collections.find((c) => c.id === collectionId);
    if (!collection || collection.isRugged) return 0;

    // Calculate total collection value from all NFTs in this collection
    const collectionNFTs = state.ownedNFTs.filter((n) => n.collectionId === collectionId);
    let totalValue = 0;
    for (const nft of collectionNFTs) {
      totalValue += collection.hype * BASE_FLOOR_PRICE_PER_HYPE * NFT_RARITY_MULTIPLIERS[nft.rarity];
    }

    const rugValue = totalValue * RUG_PULL_FRACTION;

    set((s) => ({
      collections: s.collections.map((c) =>
        c.id === collectionId
          ? { ...c, isRugged: true, hype: 0, rugPullValue: rugValue }
          : c
      ),
      // Remove all NFTs from this collection (they're worthless now)
      ownedNFTs: s.ownedNFTs.filter((n) => n.collectionId !== collectionId),
    }));

    return rugValue;
  },

  setShillers: (collectionId: string, count: number) => {
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === collectionId ? { ...c, shillers: Math.max(0, count) } : c
      ),
    }));
  },

  tickCollections: (deltaMs: number) => {
    if (deltaMs <= 0) return;
    const deltaSec = deltaMs / 1000;

    set((state) => ({
      collections: state.collections.map((c) => {
        if (c.isRugged) return c;

        // Exponential decay: hype * exp(-decayRate * deltaSec)
        const decayed = c.hype * Math.exp(-HYPE_DECAY_RATE * deltaSec);
        // Shill boost: additive gain
        const boosted = decayed + c.shillers * HYPE_SHILL_BOOST * deltaSec;
        // Clamp to [0, MAX_HYPE]
        const newHype = Math.max(0, Math.min(MAX_HYPE, boosted));

        return { ...c, hype: newHype };
      }),
    }));
  },

  getCollectionFloorPrice: (collectionId: string) => {
    const collection = get().collections.find((c) => c.id === collectionId);
    if (!collection) return 0;
    return collection.hype * BASE_FLOOR_PRICE_PER_HYPE;
  },

  reset: () => {
    set({
      market: { ...DEFAULT_MARKET_STATE },
      activeProjects: [],
      completedProjects: [],
      ownedNFTs: [],
      collections: [],
    });
  },

  hydrate: (saveData: CryptoSaveData) => {
    set({
      market: saveData.market,
      activeProjects: saveData.activeProjects,
      completedProjects: saveData.completedProjects,
      ownedNFTs: saveData.ownedNFTs,
      collections: saveData.collections,
    });
  },

  toSaveData: (): CryptoSaveData => {
    const state = get();
    return {
      market: state.market,
      activeProjects: state.activeProjects,
      completedProjects: state.completedProjects,
      ownedNFTs: state.ownedNFTs,
      collections: state.collections,
    };
  },
}));
