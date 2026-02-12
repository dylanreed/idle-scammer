// ABOUTME: Tests for scam calculation functions
// ABOUTME: Validates duration, reward, and upgrade cost scaling formulas

import {
  calculateScamDuration,
  calculateScamReward,
  calculateUpgradeCost,
  getMilestoneMultiplier,
  isMilestoneLevel,
  calculateMilestoneBonus,
  calculateManagerCost,
  getScamCostRate,
  calculateMaxBuyCount,
  calculateMaxBuyCost,
  getMaxUsefulSpeedBots,
  isTierFullyUnlocked,
} from '../../../src/game/scams/calculations';
import type { ScamDefinition } from '../../../src/game/scams/types';
import type { ScamState } from '../../../src/game/scams/types';

describe('Scam Calculations', () => {
  // Create a test definition with larger values for bracket-based calculations
  // Kongregate economy: unlockCost = baseReward for testing
  const testScam: ScamDefinition = {
    id: 'test-scam',
    name: 'Test Scam',
    tier: 1,
    baseDuration: 1000, // 1 second
    baseReward: 100, // Legacy field (new system uses unlockCost)
    resourceType: 'money',
    description: 'Test scam for calculations',
    unlockCost: 100, // Kongregate: this determines reward at L1
  };

  describe('calculateScamDuration', () => {
    it('should return base duration at level 1', () => {
      const duration = calculateScamDuration(testScam, 1);

      expect(duration).toBe(1000);
    });

    it('should reduce duration at higher bracket levels', () => {
      // Speed is bracket-based: levels 1-9 = 1.0x, 10-24 = 1.25x, 25-49 = 2.0x
      const durationL1 = calculateScamDuration(testScam, 1);
      const durationL10 = calculateScamDuration(testScam, 10);
      const durationL25 = calculateScamDuration(testScam, 25);

      // Higher brackets should be faster
      expect(durationL10).toBeLessThan(durationL1);
      expect(durationL25).toBeLessThan(durationL10);
    });

    it('should never go below a minimum threshold', () => {
      // Even at extremely high levels, duration should stay reasonable
      const duration = calculateScamDuration(testScam, 1000);

      expect(duration).toBeGreaterThan(0);
      // Should be at least 10% of base (100ms minimum for 1000ms base)
      expect(duration).toBeGreaterThanOrEqual(100);
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

      expect(reward).toBe(100);
    });

    it('should increase reward at higher levels', () => {
      const rewardL1 = calculateScamReward(testScam, 1, 1);
      const rewardL5 = calculateScamReward(testScam, 5, 1);
      const rewardL10 = calculateScamReward(testScam, 10, 1);

      expect(rewardL5).toBeGreaterThan(rewardL1);
      expect(rewardL10).toBeGreaterThan(rewardL5);
    });

    it('should multiply reward by trust^0.3', () => {
      const rewardTrust1 = calculateScamReward(testScam, 1, 1);
      const rewardTrust2 = calculateScamReward(testScam, 1, 2);
      const rewardTrust10 = calculateScamReward(testScam, 1, 10);

      // At level 1 with baseReward 100
      // trust^0.3: 1^0.3 = 1, 2^0.3 ≈ 1.2311, 10^0.3 ≈ 1.9953
      // 100 × 1 = 100
      // 100 × 1.2311 ≈ 123.11
      // 100 × 1.9953 ≈ 199.53
      expect(rewardTrust1).toBe(100);
      expect(rewardTrust2).toBeCloseTo(123.11, 1);
      expect(rewardTrust10).toBeCloseTo(199.53, 1);
    });

    it('should combine level and trust bonuses', () => {
      // Level 5 should give more than level 1
      // Trust 3 (3^0.3 ≈ 1.3903) multiplies the result
      const rewardL5T3 = calculateScamReward(testScam, 5, 3);
      const rewardL1T1 = calculateScamReward(testScam, 1, 1);

      expect(rewardL5T3).toBeGreaterThan(rewardL1T1);
      // Should be at least 1.39x due to trust alone
      expect(rewardL5T3).toBeGreaterThanOrEqual(rewardL1T1 * 1.39);
    });

    it('should handle fractional trust', () => {
      // Trust can theoretically be fractional if damaged by snitching
      const reward = calculateScamReward(testScam, 1, 1.5);

      // 100 × 1.5^0.3 ≈ 100 × 1.1293 ≈ 112.93
      expect(reward).toBeCloseTo(112.93, 1);
    });
  });

  describe('getScamCostRate', () => {
    it('should return minimum rate (1.07) for cheapest scam ($10)', () => {
      const rate = getScamCostRate(10);
      expect(rate).toBeCloseTo(1.07, 4);
    });

    it('should return maximum rate (1.10) for most expensive scam (~$10^36)', () => {
      const rate = getScamCostRate(Math.pow(10, 36));
      expect(rate).toBeCloseTo(1.10, 4);
    });

    it('should return intermediate rate for $10Qi scam (10^19)', () => {
      const rate = getScamCostRate(10_000_000_000_000_000_000);
      // With MAX_LOG_COST=36, log10(10^19)=19, t = (19-1)/(36-1) = 18/35 ≈ 0.5143
      // interpolated across range [1, 36]: t = 18/35
      // rate = 1.07 + 0.5143 * 0.03 ≈ 1.08543
      expect(rate).toBeCloseTo(1.08543, 4);
    });

    it('should return a rate between min and max for mid-range scams', () => {
      const rate = getScamCostRate(1_000_000_000); // $1B
      expect(rate).toBeGreaterThan(1.07);
      expect(rate).toBeLessThan(1.10);
    });

    it('should increase monotonically with baseCost', () => {
      const rates = [10, 1000, 100000, 10000000, 1000000000, 10000000000000000000].map(
        (cost) => getScamCostRate(cost)
      );
      for (let i = 1; i < rates.length; i++) {
        expect(rates[i]).toBeGreaterThan(rates[i - 1]);
      }
    });

    it('should clamp values below $10 to minimum rate', () => {
      const rate = getScamCostRate(1);
      expect(rate).toBeCloseTo(1.07, 4);
    });
  });

  describe('calculateUpgradeCost', () => {
    it('should return a cost to upgrade from level 1 to level 2', () => {
      const cost = calculateUpgradeCost(testScam, 1);

      expect(cost).toBeGreaterThan(0);
    });

    it('should increase cost at higher levels', () => {
      // Use tier 3 ($1000 base) to see meaningful level scaling
      // Tier 1 ($1 base) costs floor to same value at low levels
      const tier3Scam: ScamDefinition = { ...testScam, tier: 3 };
      const costL1 = calculateUpgradeCost(tier3Scam, 1);
      const costL5 = calculateUpgradeCost(tier3Scam, 5);
      const costL10 = calculateUpgradeCost(tier3Scam, 10);

      expect(costL5).toBeGreaterThan(costL1);
      expect(costL10).toBeGreaterThan(costL5);
    });

    it('should scale exponentially (idle game convention)', () => {
      // Use tier 3 ($1000 base) to see meaningful level scaling
      const tier3Scam: ScamDefinition = { ...testScam, tier: 3 };
      const costL1 = calculateUpgradeCost(tier3Scam, 1);
      const costL2 = calculateUpgradeCost(tier3Scam, 2);
      const costL3 = calculateUpgradeCost(tier3Scam, 3);

      // Growth rate should be roughly consistent (exponential)
      const rate1to2 = costL2 / costL1;
      const rate2to3 = costL3 / costL2;

      // Allow some tolerance for rounding and bracket-based scaling
      // With bracket system, growth rates are approximately consistent within a bracket
      expect(Math.abs(rate1to2 - rate2to3)).toBeLessThan(0.15);
    });

    it('should factor in tier (higher tiers cost more)', () => {
      // Create scams WITHOUT unlockCost so they use tier's baseCost
      const tier1Scam: ScamDefinition = {
        ...testScam,
        tier: 1,
        unlockCost: undefined,
      };
      const tier3Scam: ScamDefinition = {
        ...testScam,
        tier: 3,
        unlockCost: undefined,
      };
      const tier5Scam: ScamDefinition = {
        ...testScam,
        tier: 5,
        unlockCost: undefined,
      };

      const costTier1 = calculateUpgradeCost(tier1Scam, 1);
      const costTier3 = calculateUpgradeCost(tier3Scam, 1);
      const costTier5 = calculateUpgradeCost(tier5Scam, 1);

      // Tier baseCosts: T1=$10, T3=$100K, T5=$1B
      expect(costTier3).toBeGreaterThan(costTier1);
      expect(costTier5).toBeGreaterThan(costTier3);
    });

    it('should return integer values (no fractional money)', () => {
      const cost = calculateUpgradeCost(testScam, 7);

      expect(Number.isInteger(cost)).toBe(true);
    });

  });

  describe('calculateMaxBuyCount', () => {
    it('should return 0 when money is 0', () => {
      expect(calculateMaxBuyCount(testScam, 1, 0)).toBe(0);
    });

    it('should return 0 when money is less than first upgrade cost', () => {
      // At level 1, first upgrade cost is baseCost (100)
      expect(calculateMaxBuyCount(testScam, 1, 50)).toBe(0);
    });

    it('should return 1 when money equals exactly one upgrade cost', () => {
      // At level 1, upgrade cost = 100 (baseCost * costRate^0 = 100)
      const cost = calculateUpgradeCost(testScam, 1);
      expect(calculateMaxBuyCount(testScam, 1, cost)).toBe(1);
    });

    it('should return correct count for affordable upgrades at level 1', () => {
      // Give generous money to buy 3 upgrades; maxBuyCost floors so add padding
      const costFor3 = calculateMaxBuyCost(testScam, 1, 3);
      const costFor4 = calculateMaxBuyCost(testScam, 1, 4);

      // With enough money for 3 upgrades but not 4
      const money = costFor3 + 1; // +1 to overcome floor rounding
      expect(calculateMaxBuyCount(testScam, 1, money)).toBe(3);

      // Verify count increases with more money
      expect(calculateMaxBuyCount(testScam, 1, costFor4 + 1)).toBe(4);
    });

    it('should return correct count at higher levels (level 10)', () => {
      // At level 10, costs are higher so fewer upgrades for same money
      const costFor2 = calculateMaxBuyCost(testScam, 10, 2);
      const costFor1 = calculateMaxBuyCost(testScam, 10, 1);

      // With enough money for 2 upgrades from level 10
      expect(calculateMaxBuyCount(testScam, 10, costFor2 + 1)).toBe(2);

      // With less than the first upgrade cost at level 10
      expect(calculateMaxBuyCount(testScam, 10, costFor1 - 1)).toBe(0);
    });
  });

  describe('calculateMaxBuyCost', () => {
    it('should return 0 for count 0', () => {
      expect(calculateMaxBuyCost(testScam, 1, 0)).toBe(0);
    });

    it('should return upgrade cost for count 1', () => {
      const singleCost = calculateUpgradeCost(testScam, 1);
      expect(calculateMaxBuyCost(testScam, 1, 1)).toBe(singleCost);
    });

    it('should equal sum of individual upgrades for count 3', () => {
      const cost1 = calculateUpgradeCost(testScam, 1);
      const cost2 = calculateUpgradeCost(testScam, 2);
      const cost3 = calculateUpgradeCost(testScam, 3);
      const expectedSum = cost1 + cost2 + cost3;

      // Both use Math.floor so there may be a small rounding difference
      // The geometric sum floors the total, individual costs floor each one
      const maxBuyCost = calculateMaxBuyCost(testScam, 1, 3);

      // Allow for rounding: geometric series floors once vs summing floors
      expect(Math.abs(maxBuyCost - expectedSum)).toBeLessThanOrEqual(3);
    });

    it('should satisfy round trip: maxBuyCost(count) <= money when count = maxBuyCount(money)', () => {
      const money = 5000;
      const count = calculateMaxBuyCount(testScam, 1, money);
      if (count > 0) {
        const cost = calculateMaxBuyCost(testScam, 1, count);
        expect(cost).toBeLessThanOrEqual(money);
      }

      // Also verify one more upgrade would exceed money
      if (count > 0) {
        const costForOneMore = calculateMaxBuyCost(testScam, 1, count + 1);
        expect(costForOneMore).toBeGreaterThan(money);
      }
    });
  });

  describe('calculateScamReward with botProfitBonus', () => {
    it('should apply botProfitBonus as multiplier', () => {
      // botProfitBonus of 1.0 means +100% = 2x reward
      const rewardNoBonus = calculateScamReward(testScam, 1, 1, 0);
      const rewardWithBonus = calculateScamReward(testScam, 1, 1, 1.0);

      expect(rewardWithBonus).toBe(rewardNoBonus * 2);
    });

    it('should apply fractional botProfitBonus', () => {
      // botProfitBonus of 0.5 means +50% = 1.5x reward
      const rewardNoBonus = calculateScamReward(testScam, 1, 1, 0);
      const rewardWithBonus = calculateScamReward(testScam, 1, 1, 0.5);

      expect(rewardWithBonus).toBeCloseTo(rewardNoBonus * 1.5, 1);
    });

    it('should combine level, trust, and botProfitBonus', () => {
      // Test that trust and botProfitBonus stack multiplicatively
      const baseReward = calculateScamReward(testScam, 5, 1, 0);
      const withTrust = calculateScamReward(testScam, 5, 2, 0);
      const withBonus = calculateScamReward(testScam, 5, 1, 0.5); // +50% = 1.5x
      const withBoth = calculateScamReward(testScam, 5, 2, 0.5);

      // Trust 2^0.3 ≈ 1.2311 should multiply the reward
      expect(withTrust).toBeCloseTo(baseReward * 1.2311, 1);
      // botProfitBonus 0.5 should give 1.5x
      expect(withBonus).toBeCloseTo(baseReward * 1.5, 1);
      // Combined should be 1.2311 * 1.5 ≈ 1.8467x
      expect(withBoth).toBeCloseTo(baseReward * 1.8467, 1);
    });

    it('should default to 0 botProfitBonus if not provided', () => {
      const rewardDefault = calculateScamReward(testScam, 1, 1);
      const rewardExplicit = calculateScamReward(testScam, 1, 1, 0);

      expect(rewardDefault).toBe(rewardExplicit);
    });
  });

  describe('getMaxUsefulSpeedBots', () => {
    // Central Bank Heists-like scam: 180s base, level 1
    const longScam: ScamDefinition = {
      id: 'long-scam',
      name: 'Long Scam',
      tier: 5,
      baseDuration: 180000, // 180 seconds in ms
      baseReward: 1000,
      resourceType: 'money',
      description: 'Long scam',
      unlockCost: 1000,
    };

    it('should return 300 for a level 1 scam with no employee bonus (speedMult=1.0)', () => {
      // floor((1 / (1.0 * 1 * 0.1) - 1) / 0.03) = floor((10 - 1) / 0.03) = floor(300) = 300
      expect(getMaxUsefulSpeedBots(longScam, 1, 0)).toBe(300);
    });

    it('should return 0 when speed multiplier alone reaches the duration floor', () => {
      // At level 100+, speedMult = 10.0
      // 1 / (10 * 1 * 0.1) = 1, so (1 - 1) / 0.03 = 0
      expect(getMaxUsefulSpeedBots(longScam, 100, 0)).toBe(0);
    });

    it('should account for employee speed bonus', () => {
      // Level 1 (speedMult=1.0), empBonus=0.5
      // floor((1 / (1.0 * 1.5 * 0.1) - 1) / 0.03) = floor((6.667 - 1) / 0.03) = floor(188.89) = 188
      expect(getMaxUsefulSpeedBots(longScam, 1, 0.5)).toBe(188);
    });

    it('should return fewer bots at higher levels', () => {
      const botsL1 = getMaxUsefulSpeedBots(longScam, 1, 0);     // speedMult 1.0
      const botsL10 = getMaxUsefulSpeedBots(longScam, 10, 0);    // speedMult 1.5
      const botsL25 = getMaxUsefulSpeedBots(longScam, 25, 0);    // speedMult 2.0
      const botsL50 = getMaxUsefulSpeedBots(longScam, 50, 0);    // speedMult 3.0
      const botsL75 = getMaxUsefulSpeedBots(longScam, 75, 0);    // speedMult 5.0

      expect(botsL1).toBeGreaterThan(botsL10);
      expect(botsL10).toBeGreaterThan(botsL25);
      expect(botsL25).toBeGreaterThan(botsL50);
      expect(botsL50).toBeGreaterThan(botsL75);
    });

    it('should return specific values for known speed brackets', () => {
      // Level 10 (speedMult=1.5): floor((1/(1.5*0.1) - 1)/0.03) = floor((6.667-1)/0.03) = floor(188.89) = 188
      expect(getMaxUsefulSpeedBots(longScam, 10, 0)).toBe(188);

      // Level 25 (speedMult=2.0): floor((1/(2*0.1) - 1)/0.03) = floor((5-1)/0.03) = floor(133.33) = 133
      expect(getMaxUsefulSpeedBots(longScam, 25, 0)).toBe(133);

      // Level 50 (speedMult=3.0): floor((1/(3*0.1) - 1)/0.03) = floor((3.333-1)/0.03) = floor(77.78) = 77
      expect(getMaxUsefulSpeedBots(longScam, 50, 0)).toBe(77);

      // Level 75 (speedMult=5.0): floor((1/(5*0.1) - 1)/0.03) = floor((2-1)/0.03) = floor(33.33) = 33
      expect(getMaxUsefulSpeedBots(longScam, 75, 0)).toBe(33);
    });

    it('should never return negative', () => {
      // Even with absurdly high speed already
      expect(getMaxUsefulSpeedBots(longScam, 200, 5.0)).toBe(0);
    });

    it('should work with the test scam definition', () => {
      // testScam: baseDuration 1000, level 1, speedMult 1.0
      // Same formula: floor((10 - 1) / 0.03) = 300
      expect(getMaxUsefulSpeedBots(testScam, 1, 0)).toBe(300);
    });
  });

  describe('isTierFullyUnlocked', () => {
    it('should return true when all scams in a tier are unlocked', () => {
      // Tier 1 has 9 scams - create state with all unlocked
      const scamsState: Record<string, ScamState> = {
        'nigerian-prince-emails': { scamId: 'nigerian-prince-emails', level: 1, isUnlocked: true, timesCompleted: 0 },
        'fake-lottery-winnings': { scamId: 'fake-lottery-winnings', level: 1, isUnlocked: true, timesCompleted: 0 },
        'iphone-popup': { scamId: 'iphone-popup', level: 1, isUnlocked: true, timesCompleted: 0 },
        'phishing-links': { scamId: 'phishing-links', level: 1, isUnlocked: true, timesCompleted: 0 },
        'survey-scams': { scamId: 'survey-scams', level: 1, isUnlocked: true, timesCompleted: 0 },
        'fake-antivirus-popups': { scamId: 'fake-antivirus-popups', level: 1, isUnlocked: true, timesCompleted: 0 },
        'gift-card-scams': { scamId: 'gift-card-scams', level: 1, isUnlocked: true, timesCompleted: 0 },
        'advance-fee-fraud': { scamId: 'advance-fee-fraud', level: 1, isUnlocked: true, timesCompleted: 0 },
        'fake-job-postings': { scamId: 'fake-job-postings', level: 1, isUnlocked: true, timesCompleted: 0 },
      };
      expect(isTierFullyUnlocked(1, scamsState)).toBe(true);
    });

    it('should return false when any scam in the tier is locked', () => {
      const scamsState: Record<string, ScamState> = {
        'nigerian-prince-emails': { scamId: 'nigerian-prince-emails', level: 1, isUnlocked: true, timesCompleted: 0 },
        'fake-lottery-winnings': { scamId: 'fake-lottery-winnings', level: 1, isUnlocked: true, timesCompleted: 0 },
        'iphone-popup': { scamId: 'iphone-popup', level: 1, isUnlocked: false, timesCompleted: 0 },
        'phishing-links': { scamId: 'phishing-links', level: 1, isUnlocked: true, timesCompleted: 0 },
        'survey-scams': { scamId: 'survey-scams', level: 1, isUnlocked: true, timesCompleted: 0 },
        'fake-antivirus-popups': { scamId: 'fake-antivirus-popups', level: 1, isUnlocked: true, timesCompleted: 0 },
        'gift-card-scams': { scamId: 'gift-card-scams', level: 1, isUnlocked: true, timesCompleted: 0 },
        'advance-fee-fraud': { scamId: 'advance-fee-fraud', level: 1, isUnlocked: true, timesCompleted: 0 },
        'fake-job-postings': { scamId: 'fake-job-postings', level: 1, isUnlocked: true, timesCompleted: 0 },
      };
      expect(isTierFullyUnlocked(1, scamsState)).toBe(false);
    });

    it('should return false when a scam has no state entry', () => {
      // Missing 'fake-job-postings' from state entirely
      const scamsState: Record<string, ScamState> = {
        'nigerian-prince-emails': { scamId: 'nigerian-prince-emails', level: 1, isUnlocked: true, timesCompleted: 0 },
        'fake-lottery-winnings': { scamId: 'fake-lottery-winnings', level: 1, isUnlocked: true, timesCompleted: 0 },
        'iphone-popup': { scamId: 'iphone-popup', level: 1, isUnlocked: true, timesCompleted: 0 },
        'phishing-links': { scamId: 'phishing-links', level: 1, isUnlocked: true, timesCompleted: 0 },
        'survey-scams': { scamId: 'survey-scams', level: 1, isUnlocked: true, timesCompleted: 0 },
        'fake-antivirus-popups': { scamId: 'fake-antivirus-popups', level: 1, isUnlocked: true, timesCompleted: 0 },
        'gift-card-scams': { scamId: 'gift-card-scams', level: 1, isUnlocked: true, timesCompleted: 0 },
        'advance-fee-fraud': { scamId: 'advance-fee-fraud', level: 1, isUnlocked: true, timesCompleted: 0 },
      };
      expect(isTierFullyUnlocked(1, scamsState)).toBe(false);
    });

    it('should work for tier 2 scams', () => {
      const scamsState: Record<string, ScamState> = {
        'tech-support-scams': { scamId: 'tech-support-scams', level: 1, isUnlocked: true, timesCompleted: 0 },
        'romance-catfishing': { scamId: 'romance-catfishing', level: 1, isUnlocked: true, timesCompleted: 0 },
        'fake-charity-drives': { scamId: 'fake-charity-drives', level: 1, isUnlocked: true, timesCompleted: 0 },
        'rental-scams': { scamId: 'rental-scams', level: 1, isUnlocked: true, timesCompleted: 0 },
        'ticket-scalping-bots': { scamId: 'ticket-scalping-bots', level: 1, isUnlocked: true, timesCompleted: 0 },
        'fake-review-farms': { scamId: 'fake-review-farms', level: 1, isUnlocked: true, timesCompleted: 0 },
        'click-fraud': { scamId: 'click-fraud', level: 1, isUnlocked: true, timesCompleted: 0 },
        'influencer-impersonation': { scamId: 'influencer-impersonation', level: 1, isUnlocked: true, timesCompleted: 0 },
        'dropshipping-fraud': { scamId: 'dropshipping-fraud', level: 1, isUnlocked: true, timesCompleted: 0 },
        'warranty-scams': { scamId: 'warranty-scams', level: 1, isUnlocked: true, timesCompleted: 0 },
      };
      expect(isTierFullyUnlocked(2, scamsState)).toBe(true);
    });

    it('should return true for tier 0 (nonexistent tier is always considered unlocked)', () => {
      // Tier 0 doesn't exist, so it should be treated as fully unlocked
      // This ensures tier 1 is never gated
      expect(isTierFullyUnlocked(0 as any, {})).toBe(true);
    });

    it('should return false for empty scams state', () => {
      expect(isTierFullyUnlocked(1, {})).toBe(false);
    });
  });

  describe('Repeating milestones (past level 100)', () => {
    it('should keep existing milestones at 10, 25, 50, 75, 100', () => {
      expect(isMilestoneLevel(10)).toBe(true);
      expect(isMilestoneLevel(25)).toBe(true);
      expect(isMilestoneLevel(50)).toBe(true);
      expect(isMilestoneLevel(75)).toBe(true);
      expect(isMilestoneLevel(100)).toBe(true);

      expect(getMilestoneMultiplier(10)).toBe(2);
      expect(getMilestoneMultiplier(25)).toBe(5);
      expect(getMilestoneMultiplier(50)).toBe(10);
      expect(getMilestoneMultiplier(75)).toBe(15);
      expect(getMilestoneMultiplier(100)).toBe(25);
    });

    it('should have milestones every 25 levels past 100', () => {
      expect(isMilestoneLevel(125)).toBe(true);
      expect(isMilestoneLevel(150)).toBe(true);
      expect(isMilestoneLevel(175)).toBe(true);
      expect(isMilestoneLevel(200)).toBe(true);
      expect(isMilestoneLevel(250)).toBe(true);
      expect(isMilestoneLevel(500)).toBe(true);
    });

    it('should not have milestones at non-25 levels past 100', () => {
      expect(isMilestoneLevel(101)).toBe(false);
      expect(isMilestoneLevel(110)).toBe(false);
      expect(isMilestoneLevel(130)).toBe(false);
      expect(isMilestoneLevel(199)).toBe(false);
    });

    it('should have increasing multipliers past 100', () => {
      const m125 = getMilestoneMultiplier(125);
      const m150 = getMilestoneMultiplier(150);
      const m200 = getMilestoneMultiplier(200);
      const m500 = getMilestoneMultiplier(500);

      expect(m125).toBeGreaterThan(25); // more than level 100
      expect(m150).toBeGreaterThan(m125);
      expect(m200).toBeGreaterThan(m150);
      expect(m500).toBeGreaterThan(m200);
    });

    it('should scale milestone multipliers based on level', () => {
      // Formula: floor(level / 2) for levels > 100 on 25-level boundaries
      expect(getMilestoneMultiplier(125)).toBe(62);
      expect(getMilestoneMultiplier(150)).toBe(75);
      expect(getMilestoneMultiplier(200)).toBe(100);
      expect(getMilestoneMultiplier(500)).toBe(250);
    });

    it('should calculate milestone bonus using repeating milestones', () => {
      const bonus = calculateMilestoneBonus(testScam, 125, 1);
      expect(bonus).toBeGreaterThan(0);
      // bonus = reward_at_level_125 * 62
      const reward125 = calculateScamReward(testScam, 125, 1);
      expect(bonus).toBeCloseTo(reward125 * 62, 0);
    });
  });

  describe('Ascension bonus in calculateScamReward', () => {
    it('should not change reward when ascensionBonus = 0 (default)', () => {
      const base = calculateScamReward(testScam, 10, 1);
      const withDefault = calculateScamReward(testScam, 10, 1, 0, 0, 1, 1, 0);
      expect(withDefault).toBe(base);
    });

    it('should increase reward with ascension bonus', () => {
      const base = calculateScamReward(testScam, 10, 1);
      const withAscension = calculateScamReward(testScam, 10, 1, 0, 0, 1, 1, 1);
      // 1 ascension = 1.5x reward (50% per ascension)
      expect(withAscension).toBeCloseTo(base * 1.5, 2);
    });

    it('should stack ascension bonuses', () => {
      const base = calculateScamReward(testScam, 10, 1);
      const with3 = calculateScamReward(testScam, 10, 1, 0, 0, 1, 1, 3);
      // 3 ascensions = 1 + 3*0.5 = 2.5x
      expect(with3).toBeCloseTo(base * 2.5, 2);
    });
  });
});
