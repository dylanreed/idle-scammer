// ABOUTME: Tests for the deterministic market simulation engine
// ABOUTME: Validates seeded PRNG, market ticks, event triggering, bounds, and conversion math

import {
  nextSeed,
  seedToRandom,
  boxMuller,
  tickMarket,
  calculateCryptoFromMoney,
  calculateMoneyFromCrypto,
} from '../../../src/game/crypto/market';
import type { MarketState } from '../../../src/game/crypto/types';
import { DEFAULT_MARKET_STATE } from '../../../src/game/crypto/types';
import {
  MIN_EXCHANGE_RATE,
  MAX_EXCHANGE_RATE,
  EXCHANGE_FEE,
  EVENT_DURATION_TICKS,
} from '../../../src/game/crypto/constants';

describe('Seeded PRNG', () => {
  describe('nextSeed', () => {
    it('should be deterministic (same seed = same output)', () => {
      const seed = 12345;
      expect(nextSeed(seed)).toBe(nextSeed(seed));
    });

    it('should produce different outputs for different seeds', () => {
      expect(nextSeed(1)).not.toBe(nextSeed(2));
    });

    it('should produce non-negative values', () => {
      for (let i = 0; i < 100; i++) {
        expect(nextSeed(i)).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('seedToRandom', () => {
    it('should return values in [0, 1)', () => {
      let seed = 42;
      for (let i = 0; i < 100; i++) {
        seed = nextSeed(seed);
        const val = seedToRandom(seed);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });

    it('should be deterministic', () => {
      expect(seedToRandom(42)).toBe(seedToRandom(42));
    });
  });

  describe('boxMuller', () => {
    it('should return a [normalValue, nextSeed] tuple', () => {
      const [z, newSeed] = boxMuller(42);
      expect(typeof z).toBe('number');
      expect(typeof newSeed).toBe('number');
      expect(Number.isFinite(z)).toBe(true);
    });

    it('should be deterministic', () => {
      const [z1, s1] = boxMuller(42);
      const [z2, s2] = boxMuller(42);
      expect(z1).toBe(z2);
      expect(s1).toBe(s2);
    });

    it('should produce values roughly in normal distribution range', () => {
      // Run many samples and check mean is near 0
      let sum = 0;
      let seed = 42;
      const n = 1000;
      for (let i = 0; i < n; i++) {
        const [z, newSeed] = boxMuller(seed);
        sum += z;
        seed = newSeed;
      }
      const mean = sum / n;
      // Mean should be approximately 0 (within 0.2 for 1000 samples)
      expect(Math.abs(mean)).toBeLessThan(0.2);
    });

    it('should advance the seed by 2 steps', () => {
      const startSeed = 42;
      const [, endSeed] = boxMuller(startSeed);
      // boxMuller calls nextSeed twice internally
      const expected = nextSeed(nextSeed(startSeed));
      expect(endSeed).toBe(expected);
    });
  });
});

describe('tickMarket', () => {
  it('should be deterministic (same state = same output)', () => {
    const state: MarketState = { ...DEFAULT_MARKET_STATE };
    const result1 = tickMarket(state);
    const result2 = tickMarket(state);
    expect(result1.exchangeRate).toBe(result2.exchangeRate);
    expect(result1.seed).toBe(result2.seed);
    expect(result1.totalTicks).toBe(result2.totalTicks);
  });

  it('should increment totalTicks by 1', () => {
    const state: MarketState = { ...DEFAULT_MARKET_STATE, totalTicks: 5 };
    const result = tickMarket(state);
    expect(result.totalTicks).toBe(6);
  });

  it('should update the seed', () => {
    const state: MarketState = { ...DEFAULT_MARKET_STATE };
    const result = tickMarket(state);
    expect(result.seed).not.toBe(state.seed);
  });

  it('should keep exchange rate within bounds over many ticks', () => {
    let state: MarketState = { ...DEFAULT_MARKET_STATE };
    for (let i = 0; i < 10000; i++) {
      state = tickMarket(state);
      expect(state.exchangeRate).toBeGreaterThanOrEqual(MIN_EXCHANGE_RATE);
      expect(state.exchangeRate).toBeLessThanOrEqual(MAX_EXCHANGE_RATE);
    }
  });

  it('should clamp exchange rate at minimum bound', () => {
    // Start very close to minimum
    const state: MarketState = {
      ...DEFAULT_MARKET_STATE,
      exchangeRate: MIN_EXCHANGE_RATE + 0.01,
      activeEvent: {
        type: 'crash',
        driftModifier: -100, // extreme downward pressure
        volatilityModifier: 0.001, // low vol to force downward
      },
      eventTicksRemaining: 100,
    };

    let current = state;
    for (let i = 0; i < 100; i++) {
      current = tickMarket(current);
    }
    expect(current.exchangeRate).toBeGreaterThanOrEqual(MIN_EXCHANGE_RATE);
  });

  it('should change exchange rate over time', () => {
    let state: MarketState = { ...DEFAULT_MARKET_STATE };
    const initialRate = state.exchangeRate;

    // After several ticks, the rate should have moved
    for (let i = 0; i < 100; i++) {
      state = tickMarket(state);
    }
    expect(state.exchangeRate).not.toBe(initialRate);
  });

  describe('market events', () => {
    it('should decrement event ticks when event is active', () => {
      const state: MarketState = {
        ...DEFAULT_MARKET_STATE,
        activeEvent: {
          type: 'bull-run',
          driftModifier: 5,
          volatilityModifier: 1.5,
        },
        eventTicksRemaining: 5,
      };

      const result = tickMarket(state);
      expect(result.eventTicksRemaining).toBe(4);
    });

    it('should clear event when ticks reach 0', () => {
      const state: MarketState = {
        ...DEFAULT_MARKET_STATE,
        activeEvent: {
          type: 'bull-run',
          driftModifier: 5,
          volatilityModifier: 1.5,
        },
        eventTicksRemaining: 1,
      };

      const result = tickMarket(state);
      expect(result.activeEvent).toBeNull();
      expect(result.eventTicksRemaining).toBe(0);
    });

    it('should eventually trigger an event over many ticks', () => {
      let state: MarketState = { ...DEFAULT_MARKET_STATE };
      let eventTriggered = false;

      for (let i = 0; i < 10000; i++) {
        state = tickMarket(state);
        if (state.activeEvent !== null) {
          eventTriggered = true;
          break;
        }
      }

      expect(eventTriggered).toBe(true);
    });

    it('should set event duration to EVENT_DURATION_TICKS when triggered', () => {
      let state: MarketState = { ...DEFAULT_MARKET_STATE };

      for (let i = 0; i < 10000; i++) {
        const prev = state;
        state = tickMarket(state);
        if (state.activeEvent !== null && prev.activeEvent === null) {
          // Just triggered a new event
          expect(state.eventTicksRemaining).toBe(EVENT_DURATION_TICKS);
          break;
        }
      }
    });

    it('should not trigger new event while one is active', () => {
      const state: MarketState = {
        ...DEFAULT_MARKET_STATE,
        activeEvent: {
          type: 'crash',
          driftModifier: -8,
          volatilityModifier: 3,
        },
        eventTicksRemaining: 10,
      };

      const result = tickMarket(state);
      // Should still be the same event type (crash), not replaced
      if (result.activeEvent) {
        expect(result.activeEvent.type).toBe('crash');
      }
    });
  });
});

describe('Conversion math', () => {
  describe('calculateCryptoFromMoney', () => {
    it('should convert money to crypto with fee', () => {
      const crypto = calculateCryptoFromMoney(1000, 1000);
      // 1000 money * (1 - 0.02 fee) / 1000 rate = 0.98 crypto
      expect(crypto).toBeCloseTo(0.98, 5);
    });

    it('should return 0 for zero money', () => {
      expect(calculateCryptoFromMoney(0, 1000)).toBe(0);
    });

    it('should return 0 for negative money', () => {
      expect(calculateCryptoFromMoney(-100, 1000)).toBe(0);
    });

    it('should return 0 for zero exchange rate', () => {
      expect(calculateCryptoFromMoney(1000, 0)).toBe(0);
    });

    it('should return more crypto when exchange rate is low', () => {
      const lowRate = calculateCryptoFromMoney(1000, 100);
      const highRate = calculateCryptoFromMoney(1000, 10000);
      expect(lowRate).toBeGreaterThan(highRate);
    });

    it('should scale linearly with money amount', () => {
      const single = calculateCryptoFromMoney(1000, 1000);
      const double = calculateCryptoFromMoney(2000, 1000);
      expect(double).toBeCloseTo(single * 2, 5);
    });

    it('should apply the correct fee', () => {
      // Without fee: 1000 / 1000 = 1
      // With 2% fee: 1000 * 0.98 / 1000 = 0.98
      const result = calculateCryptoFromMoney(1000, 1000);
      const expectedWithFee = (1000 * (1 - EXCHANGE_FEE)) / 1000;
      expect(result).toBeCloseTo(expectedWithFee, 10);
    });
  });

  describe('calculateMoneyFromCrypto', () => {
    it('should convert crypto to money with fee', () => {
      const money = calculateMoneyFromCrypto(1, 1000);
      // 1 crypto * 1000 rate * (1 - 0.02 fee) = 980 money
      expect(money).toBeCloseTo(980, 5);
    });

    it('should return 0 for zero crypto', () => {
      expect(calculateMoneyFromCrypto(0, 1000)).toBe(0);
    });

    it('should return 0 for negative crypto', () => {
      expect(calculateMoneyFromCrypto(-1, 1000)).toBe(0);
    });

    it('should return 0 for zero exchange rate', () => {
      expect(calculateMoneyFromCrypto(1, 0)).toBe(0);
    });

    it('should return more money when exchange rate is high', () => {
      const lowRate = calculateMoneyFromCrypto(1, 100);
      const highRate = calculateMoneyFromCrypto(1, 10000);
      expect(highRate).toBeGreaterThan(lowRate);
    });

    it('should scale linearly with crypto amount', () => {
      const single = calculateMoneyFromCrypto(1, 1000);
      const double = calculateMoneyFromCrypto(2, 1000);
      expect(double).toBeCloseTo(single * 2, 5);
    });

    it('should apply the correct fee', () => {
      const result = calculateMoneyFromCrypto(1, 1000);
      const expectedWithFee = 1 * 1000 * (1 - EXCHANGE_FEE);
      expect(result).toBeCloseTo(expectedWithFee, 10);
    });
  });

  describe('round-trip conversion', () => {
    it('should lose money on round trip due to fees', () => {
      const startMoney = 10000;
      const crypto = calculateCryptoFromMoney(startMoney, 1000);
      const endMoney = calculateMoneyFromCrypto(crypto, 1000);
      // Double fee: should lose about 3.96%
      expect(endMoney).toBeLessThan(startMoney);
      // (1 - 0.02)^2 = 0.9604, so end should be ~96.04% of start
      expect(endMoney).toBeCloseTo(startMoney * (1 - EXCHANGE_FEE) * (1 - EXCHANGE_FEE), 2);
    });
  });
});
