// ABOUTME: Tests for prestige system constants
// ABOUTME: Validates heat thresholds, trust modifiers, and resource keep percentages

import {
  MAX_HEAT,
  HEAT_PER_SCAM_TIER,
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

  describe('HEAT_PER_SCAM_TIER', () => {
    it('should define heat for tier 1 scams (0.5)', () => {
      expect(HEAT_PER_SCAM_TIER[1]).toBe(0.5);
    });

    it('should define heat for tier 2 scams (1)', () => {
      expect(HEAT_PER_SCAM_TIER[2]).toBe(1);
    });

    it('should define heat for tier 3 scams (2)', () => {
      expect(HEAT_PER_SCAM_TIER[3]).toBe(2);
    });

    it('should define heat for tier 4 scams (3)', () => {
      expect(HEAT_PER_SCAM_TIER[4]).toBe(3);
    });

    it('should define heat for tier 5 scams (5)', () => {
      expect(HEAT_PER_SCAM_TIER[5]).toBe(5);
    });

    it('should have all 5 tiers defined', () => {
      expect(Object.keys(HEAT_PER_SCAM_TIER)).toHaveLength(5);
    });

    it('should have increasing heat values per tier', () => {
      expect(HEAT_PER_SCAM_TIER[1]).toBeLessThan(HEAT_PER_SCAM_TIER[2]);
      expect(HEAT_PER_SCAM_TIER[2]).toBeLessThan(HEAT_PER_SCAM_TIER[3]);
      expect(HEAT_PER_SCAM_TIER[3]).toBeLessThan(HEAT_PER_SCAM_TIER[4]);
      expect(HEAT_PER_SCAM_TIER[4]).toBeLessThan(HEAT_PER_SCAM_TIER[5]);
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
