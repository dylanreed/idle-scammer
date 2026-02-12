// ABOUTME: Constants for the crypto market, investment projects, and NFT systems
// ABOUTME: Defines volatility params, project definitions, NFT rarity weights, and hype decay

import type { ProjectDefinition, MarketEventType, MarketEvent, NFTRarity } from './types';

// ─── Market Constants ────────────────────────────────────────────────

/** Starting and reset exchange rate: 1000 money = 1 crypto */
export const BASE_EXCHANGE_RATE = 1000;

/** How often the market ticks in milliseconds */
export const MARKET_TICK_INTERVAL_MS = 2000;

/** Base volatility per tick (2% standard deviation) */
export const BASE_VOLATILITY = 0.02;

/** Base drift per tick (0.1% upward bias to reward holding) */
export const BASE_DRIFT = 0.001;

/** Probability of a market event starting each tick */
export const EVENT_CHANCE_PER_TICK = 0.005;

/** Duration of market events in ticks */
export const EVENT_DURATION_TICKS = 15;

/** Minimum exchange rate (money per 1 crypto) */
export const MIN_EXCHANGE_RATE = 10;

/** Maximum exchange rate (money per 1 crypto) */
export const MAX_EXCHANGE_RATE = 1_000_000;

/** Exchange fee as a fraction (2% fee on buy/sell) */
export const EXCHANGE_FEE = 0.02;

// ─── Market Events ───────────────────────────────────────────────────

/**
 * Market event definitions with their drift/volatility modifiers.
 * Drift modifier: multiplied against BASE_DRIFT (>1 = more upward, <0 = downward).
 * Volatility modifier: multiplied against BASE_VOLATILITY (>1 = more wild swings).
 */
export const MARKET_EVENTS: Record<MarketEventType, MarketEvent> = {
  'bull-run': {
    type: 'bull-run',
    driftModifier: 5,
    volatilityModifier: 1.5,
  },
  'crash': {
    type: 'crash',
    driftModifier: -8,
    volatilityModifier: 3,
  },
  'whale-dump': {
    type: 'whale-dump',
    driftModifier: -4,
    volatilityModifier: 2,
  },
  'elon-tweet': {
    type: 'elon-tweet',
    driftModifier: 10,
    volatilityModifier: 4,
  },
  'regulation-scare': {
    type: 'regulation-scare',
    driftModifier: -6,
    volatilityModifier: 2.5,
  },
};

/**
 * All market event types for random selection.
 */
export const MARKET_EVENT_TYPES: MarketEventType[] = [
  'bull-run',
  'crash',
  'whale-dump',
  'elon-tweet',
  'regulation-scare',
];

// ─── Investment Projects ─────────────────────────────────────────────

/** Maximum number of concurrent active projects */
export const MAX_ACTIVE_PROJECTS = 5;

/**
 * Investment project definitions across 4 risk tiers.
 */
export const PROJECT_DEFINITIONS: ProjectDefinition[] = [
  {
    id: 'stable-coins',
    name: '"Stable" Coins',
    risk: 'low',
    minReturn: 1.1,
    maxReturn: 1.5,
    rugChance: 0.02,
    durationMs: 60_000,
    description: 'Totally backed 1:1 by real assets. Trust us.',
  },
  {
    id: 'new-altcoins',
    name: 'New Altcoins',
    risk: 'medium',
    minReturn: 0.5,
    maxReturn: 3,
    rugChance: 0.15,
    durationMs: 120_000,
    description: 'The next Bitcoin, probably. We have a whitepaper and everything.',
  },
  {
    id: 'meme-coins',
    name: 'Meme Coins',
    risk: 'high',
    minReturn: 0,
    maxReturn: 10,
    rugChance: 0.35,
    durationMs: 180_000,
    description: 'Named after a dog wearing a hat. To the moon!',
  },
  {
    id: 'guaranteed-returns',
    name: '"Guaranteed" Returns',
    risk: 'extreme',
    minReturn: 0,
    maxReturn: 20,
    rugChance: 0.80,
    durationMs: 300_000,
    description: 'Absolutely NOT a Ponzi scheme. 10000% APY guaranteed.',
  },
];

// ─── NFT Constants ───────────────────────────────────────────────────

/** Maximum number of player-created NFT collections */
export const MAX_COLLECTIONS = 10;

/**
 * NFT rarity weights for mint rolls.
 * Weights sum to 100 for easy percentage mapping.
 */
export const NFT_RARITY_WEIGHTS: Record<NFTRarity, number> = {
  common: 60,
  uncommon: 25,
  rare: 10,
  legendary: 4,
  mythic: 1,
};

/**
 * Base mint cost in crypto per NFT rarity tier.
 */
export const NFT_MINT_COSTS: Record<NFTRarity, number> = {
  common: 0.1,
  uncommon: 0.1,
  rare: 0.1,
  legendary: 0.1,
  mythic: 0.1,
};

/** Base mint cost in crypto (all rarities cost the same to mint — rarity is luck) */
export const BASE_MINT_COST = 0.1;

/**
 * Value multiplier per rarity tier (applied to floor price when selling).
 */
export const NFT_RARITY_MULTIPLIERS: Record<NFTRarity, number> = {
  common: 1,
  uncommon: 2.5,
  rare: 8,
  legendary: 25,
  mythic: 100,
};

/** Hype decay rate per millisecond (exponential decay constant) */
export const HYPE_DECAY_RATE = 0.005;

/** Hype boost per shiller per second */
export const HYPE_SHILL_BOOST = 0.5;

/** Maximum hype value */
export const MAX_HYPE = 100;

/** Fraction of total collection value returned on rug pull (70%) */
export const RUG_PULL_FRACTION = 0.7;

/** Base floor price per hype point in crypto */
export const BASE_FLOOR_PRICE_PER_HYPE = 0.001;
