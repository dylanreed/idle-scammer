// ABOUTME: Tests for economic bracket system constants
// ABOUTME: Validates bracket lookup and cumulative bonus calculations

import {
  LEVEL_BRACKETS,
  SCAM_TIER_BASES,
  getTierBase,
  getBracketForLevel,
  calculateCumulativeBonus,
} from '../../../src/game/economy/constants';

describe('Economy Constants', () => {
  describe('LEVEL_BRACKETS', () => {
    it('should have 8 brackets', () => {
      expect(LEVEL_BRACKETS).toHaveLength(8);
    });

    it('should have increasing maxLevel values', () => {
      for (let i = 1; i < LEVEL_BRACKETS.length; i++) {
        expect(LEVEL_BRACKETS[i].maxLevel).toBeGreaterThan(
          LEVEL_BRACKETS[i - 1].maxLevel
        );
      }
    });

    it('should have roughly doubling speed multipliers', () => {
      // Check that each bracket roughly doubles the previous
      for (let i = 1; i < LEVEL_BRACKETS.length; i++) {
        const ratio =
          LEVEL_BRACKETS[i].speedMult / LEVEL_BRACKETS[i - 1].speedMult;
        expect(ratio).toBeCloseTo(2, 1);
      }
    });
  });

  describe('SCAM_TIER_BASES', () => {
    it('should have 10 tiers', () => {
      expect(SCAM_TIER_BASES).toHaveLength(10);
    });

    it('should have increasing initial costs', () => {
      for (let i = 1; i < SCAM_TIER_BASES.length; i++) {
        expect(SCAM_TIER_BASES[i].initialCost).toBeGreaterThan(
          SCAM_TIER_BASES[i - 1].initialCost
        );
      }
    });

    it('should have tier 1 cost at $1', () => {
      expect(SCAM_TIER_BASES[0].initialCost).toBe(1);
    });

    it('should have tier 10 cost at $5,000,000', () => {
      expect(SCAM_TIER_BASES[9].initialCost).toBe(5000000);
    });
  });

  describe('getTierBase', () => {
    it('should return tier 1 base for tier 1', () => {
      const base = getTierBase(1);
      expect(base.tier).toBe(1);
      expect(base.initialCost).toBe(1);
      expect(base.initialProfit).toBe(0.1);
    });

    it('should return tier 5 base for tier 5', () => {
      const base = getTierBase(5);
      expect(base.tier).toBe(5);
      expect(base.initialCost).toBe(50000);
      expect(base.initialProfit).toBe(500);
    });

    it('should return tier 1 for invalid tier numbers', () => {
      const base = getTierBase(99);
      expect(base.tier).toBe(1);
    });

    it('should return tier 1 for tier 0', () => {
      const base = getTierBase(0);
      expect(base.tier).toBe(1);
    });
  });

  describe('getBracketForLevel', () => {
    it('should return first bracket for level 1', () => {
      const bracket = getBracketForLevel(1);
      expect(bracket.maxLevel).toBe(25);
      expect(bracket.speedMult).toBe(1.0);
    });

    it('should return first bracket for level 25', () => {
      const bracket = getBracketForLevel(25);
      expect(bracket.maxLevel).toBe(25);
    });

    it('should return second bracket for level 26', () => {
      const bracket = getBracketForLevel(26);
      expect(bracket.maxLevel).toBe(50);
      expect(bracket.speedMult).toBe(2.0);
    });

    it('should return correct bracket for level 100', () => {
      const bracket = getBracketForLevel(100);
      expect(bracket.maxLevel).toBe(100);
      expect(bracket.speedMult).toBe(8.0);
    });

    it('should return last bracket for very high levels', () => {
      const bracket = getBracketForLevel(9999);
      expect(bracket.maxLevel).toBe(1000);
      expect(bracket.speedMult).toBe(128.0);
    });
  });

  describe('calculateCumulativeBonus', () => {
    it('should return 1.0 (no bonus) at level 1', () => {
      // Level 1 = base stats, no bonus accumulated
      const bonus = calculateCumulativeBonus(1, 1, 'profitMult');
      expect(bonus).toBe(1);
    });

    it('should return 1.0 (no bonus) at level 1 even with high tierBase', () => {
      const bonus = calculateCumulativeBonus(1, 100, 'profitMult');
      expect(bonus).toBe(1);
    });

    it('should accumulate bonus across levels within first bracket', () => {
      // Level 10 with tierBase 1 and profitMult 3.0
      // Bonus levels: 9 (levels 2-10)
      // 9 × 3.0 × 1 = 27% total bonus
      const bonus = calculateCumulativeBonus(10, 1, 'profitMult');
      expect(bonus).toBeCloseTo(1.27, 2);
    });

    it('should accumulate bonus across multiple brackets', () => {
      // Level 30 with tierBase 1
      // Bonus levels: 29 (levels 2-30)
      // First bracket fills 25 capacity: 25 × 3.0 × 1 = 75%
      // Second bracket gets remaining 4: 4 × 5.0 × 1 = 20%
      // Total: 95% = 1.95
      const bonus = calculateCumulativeBonus(30, 1, 'profitMult');
      expect(bonus).toBeCloseTo(1.95, 2);
    });

    it('should use correct multiplier key', () => {
      // At level 26, we have 25 bonus levels all in first bracket
      const profitBonus = calculateCumulativeBonus(26, 1, 'profitMult');
      const costBonus = calculateCumulativeBonus(26, 1, 'costMult');
      const speedBonus = calculateCumulativeBonus(26, 1, 'speedMult');

      // All should be different because multipliers differ
      // speedMult = 1.0, profitMult = 3.0, costMult = 5.0
      // 25 levels × mult × 1 = bonus%
      // speed: 25%, profit: 75%, cost: 125%
      expect(costBonus).toBeGreaterThan(profitBonus);
      expect(profitBonus).toBeGreaterThan(speedBonus);
    });

    it('should scale with tier base', () => {
      const bonus1 = calculateCumulativeBonus(26, 1, 'profitMult');
      const bonus2 = calculateCumulativeBonus(26, 2, 'profitMult');

      // bonus2 should have roughly 2x the bonus portion
      expect(bonus2 - 1).toBeCloseTo((bonus1 - 1) * 2, 4);
    });

    it('should handle levels beyond last bracket', () => {
      // Level 1500 should use last bracket for extra levels
      const bonus = calculateCumulativeBonus(1500, 1, 'profitMult');
      expect(bonus).toBeGreaterThan(1);
    });

    it('should provide meaningful bonus at high levels', () => {
      // At level 100 with tierBase 1 and speedMult (which is much higher)
      // Bonus levels: 99
      // First bracket (25 levels): 25 × 1.0 × 1 = 25%
      // Second bracket (25 levels): 25 × 2.0 × 1 = 50%
      // Third bracket (25 levels): 25 × 4.0 × 1 = 100%
      // Fourth bracket (24 levels): 24 × 8.0 × 1 = 192%
      // Total: 367% = 4.67x
      const bonus = calculateCumulativeBonus(100, 1, 'speedMult');
      expect(bonus).toBeGreaterThan(4);
      expect(bonus).toBeLessThan(5);
    });
  });
});
