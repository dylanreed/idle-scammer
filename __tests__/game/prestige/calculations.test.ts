// ABOUTME: Tests for prestige calculation functions
// ABOUTME: Covers heat generation, prestige trigger, and escape result calculations

import {
  calculateHeatFromScam,
  calculateHeatDecay,
  getEffectiveDecayRate,
  isPrestigeForced,
  calculateCleanEscapeResult,
  calculateSnitchResult,
  calculatePerformanceTrustGain,
} from '../../../src/game/prestige/calculations';
import {
  MAX_HEAT,
  MIN_HEAT_PER_COMPLETION,
  MAX_HEAT_PER_COMPLETION,
  HEAT_TIER_DISCOUNT,
  HEAT_DECAY_RATE,
  TRUST_DECAY_BOOST,
  TRUST_MONEY_WEIGHT,
  TRUST_COMPLETION_WEIGHT,
  TRUST_LEVEL_WEIGHT,
  MIN_TRUST_GAIN,
  SNITCH_TRUST_PERCENT,
  SNITCH_RESOURCE_KEEP_PERCENT,
} from '../../../src/game/prestige/constants';
import type { ScamDefinition } from '../../../src/game/scams/types';
import type { GameResources } from '../../../src/game/types';
import type { PerformanceMetrics } from '../../../src/game/prestige/types';

describe('Prestige Calculations', () => {
  describe('calculateHeatFromScam', () => {
    it('should return low heat for cheap T1 scams (free scam, uses tier baseCost)', () => {
      const cheapScam: ScamDefinition = {
        id: 'test-scam',
        name: 'Test Scam',
        tier: 1,
        baseDuration: 1000,
        baseReward: 10,
        resourceType: 'money',
        description: 'A test scam',
        // No unlockCost → uses tier baseCost ($10)
      };

      const heat = calculateHeatFromScam(cheapScam);
      // T1 baseCost=$10, log10(10)=1, t=0 → MIN_HEAT * 1.0 discount
      expect(heat).toBeCloseTo(MIN_HEAT_PER_COMPLETION * HEAT_TIER_DISCOUNT[1]);
    });

    it('should return higher heat for expensive scams', () => {
      const cheapScam: ScamDefinition = {
        id: 'cheap',
        name: 'Cheap',
        tier: 1,
        baseDuration: 1000,
        baseReward: 10,
        resourceType: 'money',
        description: 'Cheap',
      };

      const expensiveScam: ScamDefinition = {
        id: 'expensive',
        name: 'Expensive',
        tier: 1,
        baseDuration: 1000,
        baseReward: 10,
        resourceType: 'money',
        description: 'Expensive',
        unlockCost: 1_000_000, // $1M
      };

      expect(calculateHeatFromScam(expensiveScam)).toBeGreaterThan(
        calculateHeatFromScam(cheapScam)
      );
    });

    it('should apply tier discount (higher tier = less heat per dollar)', () => {
      // Same unlockCost, different tiers
      const makeScam = (tier: 1 | 2 | 3 | 4 | 5): ScamDefinition => ({
        id: `test-t${tier}`,
        name: `Test T${tier}`,
        tier,
        baseDuration: 1000,
        baseReward: 10,
        resourceType: 'money',
        description: 'Test',
        unlockCost: 100_000, // Same cost across tiers
      });

      const t1Heat = calculateHeatFromScam(makeScam(1));
      const t2Heat = calculateHeatFromScam(makeScam(2));
      const t3Heat = calculateHeatFromScam(makeScam(3));
      const t5Heat = calculateHeatFromScam(makeScam(5));

      expect(t1Heat).toBeGreaterThan(t2Heat);
      expect(t2Heat).toBeGreaterThan(t3Heat);
      expect(t3Heat).toBeGreaterThan(t5Heat);
    });

    it('should scale heat between MIN and MAX based on log10(baseCost)', () => {
      // At max log cost (10^36), heat should approach MAX_HEAT_PER_COMPLETION * tier discount
      const maxCostScam: ScamDefinition = {
        id: 'max-cost',
        name: 'Max Cost',
        tier: 1,
        baseDuration: 1000,
        baseReward: 10,
        resourceType: 'money',
        description: 'Max',
        unlockCost: 1e36,
      };

      const heat = calculateHeatFromScam(maxCostScam);
      expect(heat).toBeCloseTo(MAX_HEAT_PER_COMPLETION * HEAT_TIER_DISCOUNT[1]);
    });

    it('should use unlockCost when available, falling back to tier baseCost', () => {
      const withUnlockCost: ScamDefinition = {
        id: 'with-cost',
        name: 'With Cost',
        tier: 1,
        baseDuration: 1000,
        baseReward: 10,
        resourceType: 'money',
        description: 'Test',
        unlockCost: 1_000_000,
      };

      const withoutUnlockCost: ScamDefinition = {
        id: 'without-cost',
        name: 'Without Cost',
        tier: 1,
        baseDuration: 1000,
        baseReward: 10,
        resourceType: 'money',
        description: 'Test',
        // No unlockCost → uses T1 baseCost ($10)
      };

      // $1M scam should generate much more heat than $10 scam
      expect(calculateHeatFromScam(withUnlockCost)).toBeGreaterThan(
        calculateHeatFromScam(withoutUnlockCost) * 5
      );
    });

    it('should always return positive heat', () => {
      const scam: ScamDefinition = {
        id: 'test',
        name: 'Test',
        tier: 5,
        baseDuration: 1000,
        baseReward: 10,
        resourceType: 'money',
        description: 'Test',
      };

      expect(calculateHeatFromScam(scam)).toBeGreaterThan(0);
    });
  });

  describe('calculateHeatDecay', () => {
    it('should return same heat when deltaSeconds is 0', () => {
      expect(calculateHeatDecay(50, 0)).toBe(50);
    });

    it('should return same heat when currentHeat is 0', () => {
      expect(calculateHeatDecay(0, 100)).toBe(0);
    });

    it('should return same heat when currentHeat is negative', () => {
      expect(calculateHeatDecay(-5, 100)).toBe(-5);
    });

    it('should decay heat over time', () => {
      const decayed = calculateHeatDecay(50, 60);
      expect(decayed).toBeLessThan(50);
      expect(decayed).toBeGreaterThan(0);
    });

    it('should decay using exponential formula: heat * exp(-rate * seconds)', () => {
      const heat = 80;
      const seconds = 100;
      const expected = heat * Math.exp(-HEAT_DECAY_RATE * seconds);
      expect(calculateHeatDecay(heat, seconds)).toBeCloseTo(expected);
    });

    it('should decay more for longer time periods', () => {
      const short = calculateHeatDecay(50, 60);
      const long = calculateHeatDecay(50, 600);
      expect(long).toBeLessThan(short);
    });

    it('should approach 0 with very large time deltas', () => {
      // 10,000 seconds → heat should be very low
      const decayed = calculateHeatDecay(100, 10_000);
      expect(decayed).toBeLessThan(0.01);
    });

    it('should return same result with default trust=1 as without trust param (backward compat)', () => {
      const withoutTrust = calculateHeatDecay(50, 60);
      const withTrust1 = calculateHeatDecay(50, 60, 1);
      expect(withTrust1).toBe(withoutTrust);
    });

    it('should decay faster with higher trust', () => {
      const trust1Decay = calculateHeatDecay(50, 60, 1);
      const trust11Decay = calculateHeatDecay(50, 60, 11);
      expect(trust11Decay).toBeLessThan(trust1Decay);
    });

    it('should follow exact formula at trust 21', () => {
      const heat = 80;
      const seconds = 100;
      const effectiveRate = HEAT_DECAY_RATE * (1 + Math.log(21) * TRUST_DECAY_BOOST);
      const expected = heat * Math.exp(-effectiveRate * seconds);
      expect(calculateHeatDecay(heat, seconds, 21)).toBeCloseTo(expected);
    });

    it('should still handle edge cases with high trust', () => {
      // Zero heat
      expect(calculateHeatDecay(0, 100, 41)).toBe(0);
      // Negative heat
      expect(calculateHeatDecay(-5, 100, 41)).toBe(-5);
      // Zero time
      expect(calculateHeatDecay(50, 0, 41)).toBe(50);
    });
  });

  describe('getEffectiveDecayRate', () => {
    it('should return HEAT_DECAY_RATE at trust 1 (ln(1)=0)', () => {
      expect(getEffectiveDecayRate(1)).toBe(HEAT_DECAY_RATE);
    });

    it('should return higher rate at trust > 1', () => {
      expect(getEffectiveDecayRate(11)).toBeGreaterThan(HEAT_DECAY_RATE);
    });

    it('should follow exact formula at trust 21', () => {
      const expected = HEAT_DECAY_RATE * (1 + Math.log(21) * TRUST_DECAY_BOOST);
      expect(getEffectiveDecayRate(21)).toBeCloseTo(expected);
    });

    it('should increase monotonically (11 < 21 < 41)', () => {
      const rate11 = getEffectiveDecayRate(11);
      const rate21 = getEffectiveDecayRate(21);
      const rate41 = getEffectiveDecayRate(41);
      expect(rate21).toBeGreaterThan(rate11);
      expect(rate41).toBeGreaterThan(rate21);
    });

    it('should show diminishing returns (gain 11→21 > gain 31→41)', () => {
      const rate11 = getEffectiveDecayRate(11);
      const rate21 = getEffectiveDecayRate(21);
      const rate31 = getEffectiveDecayRate(31);
      const rate41 = getEffectiveDecayRate(41);
      const gain11to21 = rate21 - rate11;
      const gain31to41 = rate41 - rate31;
      expect(gain11to21).toBeGreaterThan(gain31to41);
    });

    it('should clamp trust < 1 to 1 (defensive)', () => {
      expect(getEffectiveDecayRate(0)).toBe(HEAT_DECAY_RATE);
      expect(getEffectiveDecayRate(-5)).toBe(HEAT_DECAY_RATE);
    });

    it('should produce expected half-life values', () => {
      // Half-life = ln(2) / effectiveRate
      const ln2 = Math.log(2);

      // Trust 1: half-life ≈ 693s (~11.5 min)
      const hl1 = ln2 / getEffectiveDecayRate(1);
      expect(hl1).toBeCloseTo(693, -1);

      // Trust 11: ~3.4x decay → half-life ≈ 204s (~3.4 min)
      const hl11 = ln2 / getEffectiveDecayRate(11);
      expect(hl11).toBeLessThan(hl1);
      expect(hl11).toBeCloseTo(ln2 / (HEAT_DECAY_RATE * (1 + Math.log(11) * TRUST_DECAY_BOOST)));
    });
  });

  describe('isPrestigeForced', () => {
    it('should return false when heat is 0', () => {
      expect(isPrestigeForced(0)).toBe(false);
    });

    it('should return false when heat is below MAX_HEAT', () => {
      expect(isPrestigeForced(50)).toBe(false);
      expect(isPrestigeForced(99)).toBe(false);
      expect(isPrestigeForced(99.9)).toBe(false);
    });

    it('should return true when heat equals MAX_HEAT', () => {
      expect(isPrestigeForced(MAX_HEAT)).toBe(true);
    });

    it('should return true when heat exceeds MAX_HEAT', () => {
      expect(isPrestigeForced(101)).toBe(true);
      expect(isPrestigeForced(150)).toBe(true);
    });
  });

  describe('calculatePerformanceTrustGain', () => {
    it('should return MIN_TRUST_GAIN for zero metrics', () => {
      const result = calculatePerformanceTrustGain({
        money: 0,
        totalCompletions: 0,
        totalLevels: 0,
      });
      expect(result).toBe(MIN_TRUST_GAIN);
    });

    it('should return higher trust for higher money', () => {
      const low = calculatePerformanceTrustGain({
        money: 100,
        totalCompletions: 10,
        totalLevels: 5,
      });
      const high = calculatePerformanceTrustGain({
        money: 100_000,
        totalCompletions: 10,
        totalLevels: 5,
      });
      expect(high).toBeGreaterThan(low);
    });

    it('should return higher trust for more completions', () => {
      const low = calculatePerformanceTrustGain({
        money: 1000,
        totalCompletions: 5,
        totalLevels: 5,
      });
      const high = calculatePerformanceTrustGain({
        money: 1000,
        totalCompletions: 500,
        totalLevels: 5,
      });
      expect(high).toBeGreaterThan(low);
    });

    it('should return higher trust for more levels', () => {
      const low = calculatePerformanceTrustGain({
        money: 1000,
        totalCompletions: 10,
        totalLevels: 2,
      });
      const high = calculatePerformanceTrustGain({
        money: 1000,
        totalCompletions: 10,
        totalLevels: 50,
      });
      expect(high).toBeGreaterThan(low);
    });

    it('should follow exact formula for known values', () => {
      // Mid-game scenario: $100K, 500 completions, 60 levels
      const metrics: PerformanceMetrics = {
        money: 100_000,
        totalCompletions: 500,
        totalLevels: 60,
      };
      const expected = Math.max(
        MIN_TRUST_GAIN,
        Math.floor(
          TRUST_MONEY_WEIGHT * Math.log10(Math.max(metrics.money, 1)) +
          TRUST_COMPLETION_WEIGHT * Math.sqrt(metrics.totalCompletions) +
          TRUST_LEVEL_WEIGHT * metrics.totalLevels
        )
      );
      expect(calculatePerformanceTrustGain(metrics)).toBe(expected);
    });

    it('should show logarithmic diminishing returns on money', () => {
      const base: PerformanceMetrics = { money: 0, totalCompletions: 0, totalLevels: 0 };
      const gain100to1k = calculatePerformanceTrustGain({ ...base, money: 1_000 }) -
        calculatePerformanceTrustGain({ ...base, money: 100 });
      const gain100kto1m = calculatePerformanceTrustGain({ ...base, money: 1_000_000 }) -
        calculatePerformanceTrustGain({ ...base, money: 100_000 });
      // The absolute gain from 100→1K should equal the gain from 100K→1M (log scale)
      // Both are 1 order of magnitude, so gains should be roughly equal
      expect(Math.abs(gain100to1k - gain100kto1m)).toBeLessThanOrEqual(1);
    });

    it('should show sqrt diminishing returns on completions', () => {
      // sqrt produces diminishing *marginal* returns: each additional fixed block
      // of completions adds less. Going from 0→100 adds more than 900→1000.
      const rawScore = (completions: number) =>
        TRUST_COMPLETION_WEIGHT * Math.sqrt(completions);
      const gain0to100 = rawScore(100) - rawScore(0);
      const gain900to1000 = rawScore(1000) - rawScore(900);
      // First 100 completions add more than the 100 from 900→1000
      expect(gain0to100).toBeGreaterThan(gain900to1000);
    });

    it('should be monotonically increasing in each dimension', () => {
      const base: PerformanceMetrics = { money: 1000, totalCompletions: 50, totalLevels: 10 };

      // Increasing money
      for (const multiplier of [1, 10, 100, 1000]) {
        const lower = calculatePerformanceTrustGain({ ...base, money: base.money * multiplier });
        const higher = calculatePerformanceTrustGain({ ...base, money: base.money * multiplier * 10 });
        expect(higher).toBeGreaterThanOrEqual(lower);
      }

      // Increasing completions
      for (const add of [0, 50, 100, 500]) {
        const lower = calculatePerformanceTrustGain({ ...base, totalCompletions: base.totalCompletions + add });
        const higher = calculatePerformanceTrustGain({ ...base, totalCompletions: base.totalCompletions + add + 100 });
        expect(higher).toBeGreaterThanOrEqual(lower);
      }

      // Increasing levels
      for (const add of [0, 10, 50, 100]) {
        const lower = calculatePerformanceTrustGain({ ...base, totalLevels: base.totalLevels + add });
        const higher = calculatePerformanceTrustGain({ ...base, totalLevels: base.totalLevels + add + 50 });
        expect(higher).toBeGreaterThanOrEqual(lower);
      }
    });
  });

  describe('calculateCleanEscapeResult', () => {
    it('should return trust gain from clean escape based on performance', () => {
      const currentTrust = 50;
      const metrics: PerformanceMetrics = { money: 10000, totalCompletions: 20, totalLevels: 5 };
      const result = calculateCleanEscapeResult(currentTrust, metrics);
      const expectedGain = calculatePerformanceTrustGain(metrics);

      expect(result.choice).toBe('clean-escape');
      expect(result.previousTrust).toBe(50);
      expect(result.newTrust).toBe(50 + expectedGain);
      expect(result.bonuses).toBeUndefined();
    });

    it('should work with initial trust of 1', () => {
      const metrics: PerformanceMetrics = { money: 500, totalCompletions: 5, totalLevels: 2 };
      const result = calculateCleanEscapeResult(1, metrics);
      const expectedGain = calculatePerformanceTrustGain(metrics);

      expect(result.previousTrust).toBe(1);
      expect(result.newTrust).toBe(1 + expectedGain);
    });

    it('should work with high trust values', () => {
      const metrics: PerformanceMetrics = { money: 1_000_000_000, totalCompletions: 5000, totalLevels: 300 };
      const result = calculateCleanEscapeResult(1000, metrics);
      const expectedGain = calculatePerformanceTrustGain(metrics);

      expect(result.previousTrust).toBe(1000);
      expect(result.newTrust).toBe(1000 + expectedGain);
    });
  });

  describe('calculateSnitchResult', () => {
    const makeResources = (overrides: Partial<GameResources> = {}): GameResources => ({
      money: 0,
      reputation: 0,
      heat: 0,
      bots: 0,
      skillPoints: 0,
      crypto: 0,
      trust: 1,
      snitchCount: 0,
      ...overrides,
    });

    it('should return trust penalty from snitching', () => {
      const resources = makeResources({ money: 10000, trust: 50 });
      const result = calculateSnitchResult(50, resources);

      expect(result.choice).toBe('snitch');
      expect(result.previousTrust).toBe(50);
      // max(1, floor(50 * 0.5)) = 25
      expect(result.newTrust).toBe(25);
    });

    it('should not reduce trust below 1', () => {
      const resources = makeResources({ money: 10000, trust: 2 });
      const result = calculateSnitchResult(2, resources);

      // max(1, floor(2 * 0.5)) = 1
      expect(result.newTrust).toBe(1);
    });

    it('should keep 10% of money as bonus', () => {
      const resources = makeResources({ money: 10000 });
      const result = calculateSnitchResult(50, resources);

      const moneyBonus = result.bonuses?.find((b) => b.type === 'money');
      expect(moneyBonus).toBeDefined();
      expect(moneyBonus!.amount).toBe(10000 * SNITCH_RESOURCE_KEEP_PERCENT);
    });

    it('should keep 10% of bots as bonus', () => {
      const resources = makeResources({ bots: 500 });
      const result = calculateSnitchResult(50, resources);

      const botsBonus = result.bonuses?.find((b) => b.type === 'bots');
      expect(botsBonus).toBeDefined();
      expect(botsBonus!.amount).toBe(500 * SNITCH_RESOURCE_KEEP_PERCENT);
    });

    it('should keep 10% of reputation as bonus', () => {
      const resources = makeResources({ reputation: 200 });
      const result = calculateSnitchResult(50, resources);

      const repBonus = result.bonuses?.find((b) => b.type === 'reputation');
      expect(repBonus).toBeDefined();
      expect(repBonus!.amount).toBe(200 * SNITCH_RESOURCE_KEEP_PERCENT);
    });

    it('should keep 10% of crypto as bonus', () => {
      const resources = makeResources({ crypto: 100 });
      const result = calculateSnitchResult(50, resources);

      const cryptoBonus = result.bonuses?.find((b) => b.type === 'crypto');
      expect(cryptoBonus).toBeDefined();
      expect(cryptoBonus!.amount).toBe(100 * SNITCH_RESOURCE_KEEP_PERCENT);
    });

    it('should keep 10% of skill points as bonus', () => {
      const resources = makeResources({ skillPoints: 30 });
      const result = calculateSnitchResult(50, resources);

      const spBonus = result.bonuses?.find((b) => b.type === 'skill-points');
      expect(spBonus).toBeDefined();
      expect(spBonus!.amount).toBe(30 * SNITCH_RESOURCE_KEEP_PERCENT);
    });

    it('should not include bonus for resources with 0 amount', () => {
      const resources = makeResources({ money: 1000, bots: 0 });
      const result = calculateSnitchResult(50, resources);

      const botsBonus = result.bonuses?.find((b) => b.type === 'bots');
      expect(botsBonus).toBeUndefined();
    });

    it('should floor decimal bonus amounts for integer resources', () => {
      // 33 * 0.1 = 3.3, should floor to 3 for skill points
      const resources = makeResources({ skillPoints: 33 });
      const result = calculateSnitchResult(50, resources);

      const spBonus = result.bonuses?.find((b) => b.type === 'skill-points');
      expect(spBonus!.amount).toBe(3);
    });

    it('should keep decimal amounts for crypto', () => {
      // 15.5 * 0.1 = 1.55
      const resources = makeResources({ crypto: 15.5 });
      const result = calculateSnitchResult(50, resources);

      const cryptoBonus = result.bonuses?.find((b) => b.type === 'crypto');
      expect(cryptoBonus!.amount).toBeCloseTo(1.55);
    });

    it('should calculate all bonuses for full resources', () => {
      const resources = makeResources({
        money: 10000,
        bots: 500,
        reputation: 200,
        crypto: 100,
        skillPoints: 30,
      });
      const result = calculateSnitchResult(50, resources);

      expect(result.bonuses).toHaveLength(5);
    });
  });
});
