// ABOUTME: Type definitions for the crypto market, investment projects, and NFT systems
// ABOUTME: Defines MarketState, ProjectDefinition, ProjectState, NFTItem, NFTCollection, CryptoSaveData

/**
 * State of the volatile crypto exchange rate market.
 * Uses seeded PRNG for deterministic simulation.
 */
export interface MarketState {
  /** Current exchange rate: money per 1 crypto */
  exchangeRate: number;
  /** Current PRNG seed (updated each tick for determinism) */
  seed: number;
  /** Active market event, if any */
  activeEvent: MarketEvent | null;
  /** Ticks remaining on the active event */
  eventTicksRemaining: number;
  /** Total ticks elapsed since last prestige reset */
  totalTicks: number;
}

/**
 * Market events that temporarily modify drift and volatility.
 * Each event has a flavor and mechanical effect.
 */
export interface MarketEvent {
  /** Event type identifier */
  type: MarketEventType;
  /** Multiplier applied to drift during this event */
  driftModifier: number;
  /** Multiplier applied to volatility during this event */
  volatilityModifier: number;
}

/**
 * Possible market event types.
 */
export type MarketEventType =
  | 'bull-run'
  | 'crash'
  | 'whale-dump'
  | 'elon-tweet'
  | 'regulation-scare';

/**
 * Definition of an investment project (static, from constants).
 */
export interface ProjectDefinition {
  /** Unique project ID */
  id: string;
  /** Display name */
  name: string;
  /** Risk tier label */
  risk: 'low' | 'medium' | 'high' | 'extreme';
  /** Minimum return multiplier (e.g., 1.1 = 110%) */
  minReturn: number;
  /** Maximum return multiplier (e.g., 1.5 = 150%) */
  maxReturn: number;
  /** Probability of rug pull (0-1) */
  rugChance: number;
  /** Maturation duration in milliseconds */
  durationMs: number;
  /** Flavor description for UI */
  description: string;
}

/**
 * Runtime state of an active investment project.
 */
export interface ProjectState {
  /** Reference to the project definition ID */
  definitionId: string;
  /** Amount of crypto invested */
  investedAmount: number;
  /** Unix timestamp (ms) when investment was started */
  startedAt: number;
  /** Whether this project was rug-pulled (determined at creation) */
  isRugged: boolean;
  /** Actual return multiplier (determined at creation via PRNG) */
  returnMultiplier: number;
}

/**
 * Rarity tiers for NFTs.
 */
export type NFTRarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythic';

/**
 * A single minted NFT item.
 */
export interface NFTItem {
  /** Unique NFT ID */
  id: string;
  /** ID of the collection this NFT belongs to */
  collectionId: string;
  /** Rarity tier */
  rarity: NFTRarity;
  /** Crypto cost paid to mint this NFT */
  mintCost: number;
  /** Unix timestamp (ms) when minted */
  mintedAt: number;
}

/**
 * A player-created NFT collection with hype mechanics.
 */
export interface NFTCollection {
  /** Unique collection ID */
  id: string;
  /** Player-chosen collection name */
  name: string;
  /** Current hype level (0-100) */
  hype: number;
  /** Number of shill employees assigned */
  shillers: number;
  /** Whether the player has rug-pulled this collection */
  isRugged: boolean;
  /** Total crypto value drained from rug pull */
  rugPullValue: number;
  /** Unix timestamp (ms) when collection was created */
  createdAt: number;
}

/**
 * Complete crypto save data for persistence.
 */
export interface CryptoSaveData {
  /** Market state including exchange rate and PRNG seed */
  market: MarketState;
  /** Active investment projects */
  activeProjects: ProjectState[];
  /** Completed/collected investment projects */
  completedProjects: ProjectState[];
  /** Owned NFT items */
  ownedNFTs: NFTItem[];
  /** Player-created NFT collections */
  collections: NFTCollection[];
}

/**
 * Default market state for new games or prestige reset.
 */
export const DEFAULT_MARKET_STATE: MarketState = {
  exchangeRate: 1000,
  seed: 42,
  activeEvent: null,
  eventTicksRemaining: 0,
  totalTicks: 0,
};

/**
 * Default crypto save data for new games or prestige reset.
 */
export const DEFAULT_CRYPTO_SAVE_DATA: CryptoSaveData = {
  market: { ...DEFAULT_MARKET_STATE },
  activeProjects: [],
  completedProjects: [],
  ownedNFTs: [],
  collections: [],
};
