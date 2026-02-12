// ABOUTME: Deterministic market simulation engine using seeded PRNG
// ABOUTME: Implements geometric Brownian motion for exchange rate, market events, and buy/sell conversion

import type { MarketState, MarketEvent } from './types';
import {
  BASE_DRIFT,
  BASE_VOLATILITY,
  MIN_EXCHANGE_RATE,
  MAX_EXCHANGE_RATE,
  EVENT_CHANCE_PER_TICK,
  EVENT_DURATION_TICKS,
  MARKET_EVENTS,
  MARKET_EVENT_TYPES,
  EXCHANGE_FEE,
} from './constants';

// ─── Seeded PRNG ─────────────────────────────────────────────────────

/**
 * Linear congruential generator (LCG) constants.
 * Parameters from Numerical Recipes (a=1664525, c=1013904223, m=2^32).
 */
const LCG_A = 1664525;
const LCG_C = 1013904223;
const LCG_M = 0x100000000; // 2^32

/**
 * Advances the LCG seed by one step and returns the next seed.
 * Deterministic: same input seed always produces same output.
 *
 * @param seed - Current seed value
 * @returns Next seed value
 */
export function nextSeed(seed: number): number {
  return ((LCG_A * seed + LCG_C) % LCG_M + LCG_M) % LCG_M;
}

/**
 * Converts a seed to a uniform random number in [0, 1).
 *
 * @param seed - Seed to convert
 * @returns Value in [0, 1)
 */
export function seedToRandom(seed: number): number {
  return (seed >>> 0) / LCG_M;
}

/**
 * Generates two independent standard normal values using Box-Muller transform.
 * Only returns the first value (Z0).
 *
 * @param seed - Current PRNG seed
 * @returns [normalValue, nextSeed] tuple
 */
export function boxMuller(seed: number): [number, number] {
  const s1 = nextSeed(seed);
  const u1 = Math.max(seedToRandom(s1), 1e-10); // clamp away from 0 for log
  const s2 = nextSeed(s1);
  const u2 = seedToRandom(s2);

  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return [z, s2];
}

// ─── Market Tick ─────────────────────────────────────────────────────

/**
 * Advances the market by one tick using geometric Brownian motion.
 * The exchange rate follows: newRate = oldRate * exp(drift + volatility * Z)
 * where Z is a standard normal random variable.
 *
 * Market events temporarily modify drift and volatility.
 * New events are randomly triggered based on EVENT_CHANCE_PER_TICK.
 *
 * @param state - Current market state
 * @returns New market state after one tick
 */
export function tickMarket(state: MarketState): MarketState {
  let { seed, exchangeRate, activeEvent, eventTicksRemaining, totalTicks } = state;

  // Determine effective drift and volatility
  let drift = BASE_DRIFT;
  let volatility = BASE_VOLATILITY;

  if (activeEvent && eventTicksRemaining > 0) {
    drift *= activeEvent.driftModifier;
    volatility *= activeEvent.volatilityModifier;
  }

  // Generate normal random value using Box-Muller
  const [z, newSeed] = boxMuller(seed);
  seed = newSeed;

  // Geometric Brownian motion step
  const logReturn = drift + volatility * z;
  exchangeRate = exchangeRate * Math.exp(logReturn);

  // Clamp to bounds
  exchangeRate = Math.max(MIN_EXCHANGE_RATE, Math.min(MAX_EXCHANGE_RATE, exchangeRate));

  // Update event ticks
  if (activeEvent && eventTicksRemaining > 0) {
    eventTicksRemaining -= 1;
    if (eventTicksRemaining <= 0) {
      activeEvent = null;
      eventTicksRemaining = 0;
    }
  }

  // Roll for new event (only if no active event)
  if (!activeEvent) {
    seed = nextSeed(seed);
    const eventRoll = seedToRandom(seed);
    if (eventRoll < EVENT_CHANCE_PER_TICK) {
      // Pick a random event type
      seed = nextSeed(seed);
      const eventIndex = Math.floor(seedToRandom(seed) * MARKET_EVENT_TYPES.length);
      const eventType = MARKET_EVENT_TYPES[eventIndex];
      activeEvent = { ...MARKET_EVENTS[eventType] };
      eventTicksRemaining = EVENT_DURATION_TICKS;
    }
  }

  totalTicks += 1;

  return {
    exchangeRate,
    seed,
    activeEvent,
    eventTicksRemaining,
    totalTicks,
  };
}

// ─── Conversion Math ─────────────────────────────────────────────────

/**
 * Calculates crypto received when buying with money (after fee).
 *
 * @param moneyAmount - Amount of money to spend
 * @param exchangeRate - Current exchange rate (money per 1 crypto)
 * @returns Amount of crypto received
 */
export function calculateCryptoFromMoney(moneyAmount: number, exchangeRate: number): number {
  if (moneyAmount <= 0 || exchangeRate <= 0) return 0;
  const afterFee = moneyAmount * (1 - EXCHANGE_FEE);
  return afterFee / exchangeRate;
}

/**
 * Calculates money received when selling crypto (after fee).
 *
 * @param cryptoAmount - Amount of crypto to sell
 * @param exchangeRate - Current exchange rate (money per 1 crypto)
 * @returns Amount of money received
 */
export function calculateMoneyFromCrypto(cryptoAmount: number, exchangeRate: number): number {
  if (cryptoAmount <= 0 || exchangeRate <= 0) return 0;
  const grossMoney = cryptoAmount * exchangeRate;
  return grossMoney * (1 - EXCHANGE_FEE);
}
