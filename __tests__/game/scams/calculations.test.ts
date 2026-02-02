// ABOUTME: Tests for scam calculation functions
// ABOUTME: Validates duration, reward, and upgrade cost scaling formulas

import {
  calculateScamDuration,
  calculateScamReward,
  calculateUpgradeCost,
  calculateBotMultiplier,
  calculateBotPurchasePrice,
} from '../../../src/game/scams/calculations';
import { BOT_FARMS } from '../../../src/game/scams/definitions';
import type { ScamDefinition } from '../../../src/game/scams/types';

describe('Scam Calculations', () => {
  // Create a simple test definition for predictable calculations
  const testScam: ScamDefinition = {
    id: 'test-scam',
    name: 'Test Scam',
    tier: 1,
    baseDuration: 1000, // 1 second
    baseReward: 10,
    resourceType: 'money',
    description: 'Test scam for calculations',
  };

  describe('calculateScamDuration', () => {
    it('should return base duration at level 1', () => {
      const duration = calculateScamDuration(testScam, 1);

      expect(duration).toBe(1000);
    });

    it('should reduce duration at higher levels', () => {
      const durationL1 = calculateScamDuration(testScam, 1);
      const durationL5 = calculateScamDuration(testScam, 5);
      const durationL10 = calculateScamDuration(testScam, 10);

      expect(durationL5).toBeLessThan(durationL1);
      expect(durationL10).toBeLessThan(durationL5);
    });

    it('should never go below a minimum threshold', () => {
      // Even at extremely high levels, duration should stay reasonable
      const duration = calculateScamDuration(testScam, 1000);

      expect(duration).toBeGreaterThan(0);
      // Should be at least 10% of base (100ms minimum for 1000ms base)
      expect(duration).toBeGreaterThanOrEqual(100);
    });

    it('should work with Bot Farms definition', () => {
      const duration = calculateScamDuration(BOT_FARMS, 1);

      expect(duration).toBe(BOT_FARMS.baseDuration);
    });

    it('should scale smoothly without jumps', () => {
      const durations = Array.from({ length: 20 }, (_, i) =>
        calculateScamDuration(testScam, i + 1)
      );

      // Each level should have equal or shorter duration than previous
      for (let i = 1; i < durations.length; i++) {
        expect(durations[i]).toBeLessThanOrEqual(durations[i - 1]);
      }
    });
  });

  describe('calculateScamReward', () => {
    it('should return base reward at level 1 with trust 1', () => {
      const reward = calculateScamReward(testScam, 1, 1);

      expect(reward).toBe(10);
    });

    it('should increase reward at higher levels', () => {
      const rewardL1 = calculateScamReward(testScam, 1, 1);
      const rewardL5 = calculateScamReward(testScam, 5, 1);
      const rewardL10 = calculateScamReward(testScam, 10, 1);

      expect(rewardL5).toBeGreaterThan(rewardL1);
      expect(rewardL10).toBeGreaterThan(rewardL5);
    });

    it('should multiply reward by trust', () => {
      const rewardTrust1 = calculateScamReward(testScam, 1, 1);
      const rewardTrust2 = calculateScamReward(testScam, 1, 2);
      const rewardTrust10 = calculateScamReward(testScam, 1, 10);

      expect(rewardTrust2).toBe(rewardTrust1 * 2);
      expect(rewardTrust10).toBe(rewardTrust1 * 10);
    });

    it('should combine level and trust bonuses', () => {
      // Level 5 should give more than level 1
      // Trust 3 should triple the result
      const rewardL5T3 = calculateScamReward(testScam, 5, 3);
      const rewardL1T1 = calculateScamReward(testScam, 1, 1);

      expect(rewardL5T3).toBeGreaterThan(rewardL1T1);
      // Should be at least 3x due to trust alone
      expect(rewardL5T3).toBeGreaterThanOrEqual(rewardL1T1 * 3);
    });

    it('should work with Bot Farms (generates bots)', () => {
      const reward = calculateScamReward(BOT_FARMS, 1, 1);

      // Bot Farms rewards 1 bot at base
      expect(reward).toBe(1);
    });

    it('should return integer values for bots', () => {
      // Bots should be whole numbers
      const reward = calculateScamReward(BOT_FARMS, 5, 2);

      expect(Number.isInteger(reward)).toBe(true);
    });

    it('should handle fractional trust by flooring the result', () => {
      // Trust can theoretically be fractional if damaged by snitching
      const reward = calculateScamReward(testScam, 1, 1.5);

      expect(Number.isInteger(reward)).toBe(true);
    });
  });

  describe('calculateUpgradeCost', () => {
    it('should return a cost to upgrade from level 1 to level 2', () => {
      const cost = calculateUpgradeCost(testScam, 1);

      expect(cost).toBeGreaterThan(0);
    });

    it('should increase cost at higher levels', () => {
      const costL1 = calculateUpgradeCost(testScam, 1);
      const costL5 = calculateUpgradeCost(testScam, 5);
      const costL10 = calculateUpgradeCost(testScam, 10);

      expect(costL5).toBeGreaterThan(costL1);
      expect(costL10).toBeGreaterThan(costL5);
    });

    it('should scale exponentially (idle game convention)', () => {
      const costL1 = calculateUpgradeCost(testScam, 1);
      const costL2 = calculateUpgradeCost(testScam, 2);
      const costL3 = calculateUpgradeCost(testScam, 3);

      // Growth rate should be roughly consistent (exponential)
      const rate1to2 = costL2 / costL1;
      const rate2to3 = costL3 / costL2;

      // Allow some tolerance for rounding
      expect(Math.abs(rate1to2 - rate2to3)).toBeLessThan(0.1);
    });

    it('should factor in tier (higher tiers cost more)', () => {
      const tier1Scam: ScamDefinition = { ...testScam, tier: 1 };
      const tier3Scam: ScamDefinition = { ...testScam, tier: 3 };
      const tier5Scam: ScamDefinition = { ...testScam, tier: 5 };

      const costTier1 = calculateUpgradeCost(tier1Scam, 1);
      const costTier3 = calculateUpgradeCost(tier3Scam, 1);
      const costTier5 = calculateUpgradeCost(tier5Scam, 1);

      expect(costTier3).toBeGreaterThan(costTier1);
      expect(costTier5).toBeGreaterThan(costTier3);
    });

    it('should return integer values (no fractional money)', () => {
      const cost = calculateUpgradeCost(testScam, 7);

      expect(Number.isInteger(cost)).toBe(true);
    });

    it('should work with Bot Farms (upgrade costs bots)', () => {
      const cost = calculateUpgradeCost(BOT_FARMS, 1);

      expect(cost).toBeGreaterThan(0);
      expect(Number.isInteger(cost)).toBe(true);
    });
  });

  describe('calculateBotMultiplier', () => {
    it('should return 1x with 0 bots', () => {
      const multiplier = calculateBotMultiplier(0);

      expect(multiplier).toBe(1);
    });

    it('should return 1.01x with 1 bot (1% bonus)', () => {
      const multiplier = calculateBotMultiplier(1);

      expect(multiplier).toBe(1.01);
    });

    it('should return 2x with 100 bots (100% bonus)', () => {
      const multiplier = calculateBotMultiplier(100);

      expect(multiplier).toBe(2);
    });

    it('should return 11x with 1000 bots (1000% bonus)', () => {
      const multiplier = calculateBotMultiplier(1000);

      expect(multiplier).toBe(11);
    });

    it('should scale linearly (1% per bot)', () => {
      const mult50 = calculateBotMultiplier(50);
      const mult75 = calculateBotMultiplier(75);

      expect(mult50).toBe(1.5);
      expect(mult75).toBe(1.75);
    });
  });

  describe('calculateBotPurchasePrice', () => {
    it('should cost $100 for first bot (0 owned)', () => {
      const price = calculateBotPurchasePrice(0);

      // $100 × (0 + 1)² = $100
      expect(price).toBe(100);
    });

    it('should cost $400 when you have 1 bot', () => {
      const price = calculateBotPurchasePrice(1);

      // $100 × (1 + 1)² = $100 × 4 = $400
      expect(price).toBe(400);
    });

    it('should cost $900 when you have 2 bots', () => {
      const price = calculateBotPurchasePrice(2);

      // $100 × (2 + 1)² = $100 × 9 = $900
      expect(price).toBe(900);
    });

    it('should cost $10,000 when you have 9 bots', () => {
      const price = calculateBotPurchasePrice(9);

      // $100 × (9 + 1)² = $100 × 100 = $10,000
      expect(price).toBe(10000);
    });

    it('should cost $1,010,000 when you have 100 bots', () => {
      const price = calculateBotPurchasePrice(100);

      // $100 × (100 + 1)² = $100 × 10201 = $1,020,100
      expect(price).toBe(1020100);
    });

    it('should scale quadratically (expensive!)', () => {
      const price10 = calculateBotPurchasePrice(10);
      const price20 = calculateBotPurchasePrice(20);

      // 10 bots: $100 × 11² = $12,100
      // 20 bots: $100 × 21² = $44,100
      expect(price10).toBe(12100);
      expect(price20).toBe(44100);
    });
  });

  describe('calculateScamReward with bot multiplier', () => {
    const botScam: ScamDefinition = {
      id: 'bot-scam',
      name: 'Bot Scam',
      tier: 1,
      baseDuration: 1000,
      baseReward: 10,
      resourceType: 'bots',
      description: 'Generates bots',
    };

    it('should apply bot multiplier to bot-type rewards', () => {
      // With 100 bots, should get 2x rewards
      const rewardNoBots = calculateScamReward(botScam, 1, 1, 0);
      const rewardWithBots = calculateScamReward(botScam, 1, 1, 100);

      expect(rewardWithBots).toBe(rewardNoBots * 2);
    });

    it('should NOT apply bot multiplier to money-type rewards', () => {
      const moneyScam: ScamDefinition = { ...botScam, resourceType: 'money' };

      const rewardNoBots = calculateScamReward(moneyScam, 1, 1, 0);
      const rewardWithBots = calculateScamReward(moneyScam, 1, 1, 100);

      expect(rewardWithBots).toBe(rewardNoBots);
    });

    it('should combine level, trust, and bot bonuses', () => {
      // Level 5: 1 + 4*0.1 = 1.4x
      // Trust 2: 2x
      // Bots 50: 1.5x
      // Base: 10
      // Total: 10 * 1.4 * 2 * 1.5 = 42
      const reward = calculateScamReward(botScam, 5, 2, 50);

      expect(reward).toBe(42);
    });

    it('should default to 0 bots if not provided', () => {
      const rewardDefault = calculateScamReward(botScam, 1, 1);
      const rewardExplicit = calculateScamReward(botScam, 1, 1, 0);

      expect(rewardDefault).toBe(rewardExplicit);
    });
  });
});
