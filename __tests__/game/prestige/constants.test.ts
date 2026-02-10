// ABOUTME: Tests for prestige system constants
// ABOUTME: Validates heat thresholds, trust modifiers, and resource keep percentages

import {
  MAX_HEAT,
  MIN_HEAT_PER_COMPLETION,
  MAX_HEAT_PER_COMPLETION,
  MIN_HEAT_LOG_COST,
  MAX_HEAT_LOG_COST,
  HEAT_TIER_DISCOUNT,
  HEAT_DECAY_RATE,
  CLEAN_ESCAPE_TRUST_GAIN,
  SNITCH_TRUST_PENALTY,
  SNITCH_RESOURCE_KEEP_PERCENT,
} from '../../../src/game/prestige/constants';

describe('Prestige Constants', () => {
  describe('MAX_HEAT', () => {
    it('should be 100 (triggers forced prestige)', () => {
      expect(MAX_HEAT).toBe(100);
    });
  });

  describe('Graduated heat constants', () => {
    it('should define minimum heat per completion (cheap scams)', () => {
      expect(MIN_HEAT_PER_COMPLETION).toBe(0.005);
    });

    it('should define maximum heat per completion (expensive scams)', () => {
      expect(MAX_HEAT_PER_COMPLETION).toBe(0.5);
    });

    it('should have min < max for heat per completion', () => {
      expect(MIN_HEAT_PER_COMPLETION).toBeLessThan(MAX_HEAT_PER_COMPLETION);
    });

    it('should define log cost range for interpolation', () => {
      expect(MIN_HEAT_LOG_COST).toBe(1);  // log10(10)
      expect(MAX_HEAT_LOG_COST).toBe(19); // log10(10^19)
    });
  });

  describe('HEAT_TIER_DISCOUNT', () => {
    it('should have all 5 tiers defined', () => {
      expect(Object.keys(HEAT_TIER_DISCOUNT)).toHaveLength(5);
    });

    it('should have T1 at full heat (1.0x)', () => {
      expect(HEAT_TIER_DISCOUNT[1]).toBe(1.0);
    });

    it('should have decreasing multipliers for higher tiers', () => {
      expect(HEAT_TIER_DISCOUNT[1]).toBeGreaterThan(HEAT_TIER_DISCOUNT[2]);
      expect(HEAT_TIER_DISCOUNT[2]).toBeGreaterThan(HEAT_TIER_DISCOUNT[3]);
      expect(HEAT_TIER_DISCOUNT[3]).toBeGreaterThan(HEAT_TIER_DISCOUNT[4]);
      expect(HEAT_TIER_DISCOUNT[4]).toBeGreaterThan(HEAT_TIER_DISCOUNT[5]);
    });

    it('should have T5 at near-invisible heat (0.1x)', () => {
      expect(HEAT_TIER_DISCOUNT[5]).toBe(0.1);
    });

    it('should have all values between 0 and 1', () => {
      for (const tier of [1, 2, 3, 4, 5] as const) {
        expect(HEAT_TIER_DISCOUNT[tier]).toBeGreaterThan(0);
        expect(HEAT_TIER_DISCOUNT[tier]).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('HEAT_DECAY_RATE', () => {
    it('should be 0.001 per second', () => {
      expect(HEAT_DECAY_RATE).toBe(0.001);
    });

    it('should be positive', () => {
      expect(HEAT_DECAY_RATE).toBeGreaterThan(0);
    });
  });

  describe('CLEAN_ESCAPE_TRUST_GAIN', () => {
    it('should be 10 (reward for clean escape)', () => {
      expect(CLEAN_ESCAPE_TRUST_GAIN).toBe(10);
    });

    it('should be positive', () => {
      expect(CLEAN_ESCAPE_TRUST_GAIN).toBeGreaterThan(0);
    });
  });

  describe('SNITCH_TRUST_PENALTY', () => {
    it('should be -5 (penalty for snitching)', () => {
      expect(SNITCH_TRUST_PENALTY).toBe(-5);
    });

    it('should be negative', () => {
      expect(SNITCH_TRUST_PENALTY).toBeLessThan(0);
    });
  });

  describe('SNITCH_RESOURCE_KEEP_PERCENT', () => {
    it('should be 0.1 (keep 10% of resources)', () => {
      expect(SNITCH_RESOURCE_KEEP_PERCENT).toBe(0.1);
    });

    it('should be between 0 and 1 (percentage)', () => {
      expect(SNITCH_RESOURCE_KEEP_PERCENT).toBeGreaterThan(0);
      expect(SNITCH_RESOURCE_KEEP_PERCENT).toBeLessThan(1);
    });
  });

  describe('balance sanity checks', () => {
    it('clean escape gain should be larger than snitch penalty magnitude', () => {
      // This encourages clean escapes as the "better" choice
      expect(CLEAN_ESCAPE_TRUST_GAIN).toBeGreaterThan(
        Math.abs(SNITCH_TRUST_PENALTY)
      );
    });

    it('snitch resource keep should provide meaningful but not overpowered bonus', () => {
      // 10% is meaningful enough to be tempting but not game-breaking
      expect(SNITCH_RESOURCE_KEEP_PERCENT).toBeGreaterThanOrEqual(0.05);
      expect(SNITCH_RESOURCE_KEEP_PERCENT).toBeLessThanOrEqual(0.25);
    });
  });
});
