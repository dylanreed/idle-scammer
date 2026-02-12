// ABOUTME: Tests for employee bonus integration in scam calculation functions
// ABOUTME: Validates that employeeRewardBonus and employeeSpeedBonus params affect output correctly

import {
  calculateScamDuration,
  calculateScamReward,
} from '../../../src/game/scams/calculations';
import type { ScamDefinition } from '../../../src/game/scams/types';

describe('Employee-aware Scam Calculations', () => {
  const testScam: ScamDefinition = {
    id: 'test-scam',
    name: 'Test Scam',
    tier: 1,
    baseDuration: 1000,
    baseReward: 100,
    resourceType: 'money',
    description: 'Test scam for employee calculations',
    unlockCost: 100,
  };

  describe('calculateScamReward with employeeRewardBonus', () => {
    it('should return higher reward when employeeRewardBonus > 0', () => {
      const baseReward = calculateScamReward(testScam, 1, 1, 0, 0);
      const boostedReward = calculateScamReward(testScam, 1, 1, 0, 0.5);

      expect(boostedReward).toBeGreaterThan(baseReward);
      // 50% bonus = 1.5x reward
      expect(boostedReward).toBeCloseTo(baseReward * 1.5, 2);
    });

    it('should match current behavior when employeeRewardBonus = 0 (default)', () => {
      const withExplicitZero = calculateScamReward(testScam, 1, 1, 0, 0);
      const withDefault = calculateScamReward(testScam, 1, 1, 0);

      expect(withExplicitZero).toBe(withDefault);
    });

    it('should scale linearly with reward bonus', () => {
      const base = calculateScamReward(testScam, 1, 1, 0, 0);
      const bonus25 = calculateScamReward(testScam, 1, 1, 0, 0.25);
      const bonus50 = calculateScamReward(testScam, 1, 1, 0, 0.50);
      const bonus100 = calculateScamReward(testScam, 1, 1, 0, 1.0);

      expect(bonus25).toBeCloseTo(base * 1.25, 2);
      expect(bonus50).toBeCloseTo(base * 1.50, 2);
      expect(bonus100).toBeCloseTo(base * 2.0, 2);
    });

    it('should combine with trust and level bonuses', () => {
      // At level 5, trust 2, with 30% employee bonus
      const withoutEmployee = calculateScamReward(testScam, 5, 2, 0, 0);
      const withEmployee = calculateScamReward(testScam, 5, 2, 0, 0.3);

      expect(withEmployee).toBeCloseTo(withoutEmployee * 1.3, 2);
    });
  });

  describe('calculateScamDuration with employeeSpeedBonus', () => {
    it('should return shorter duration when employeeSpeedBonus > 0', () => {
      const baseDuration = calculateScamDuration(testScam, 1, 0);
      const boostedDuration = calculateScamDuration(testScam, 1, 0.5);

      expect(boostedDuration).toBeLessThan(baseDuration);
    });

    it('should match current behavior when employeeSpeedBonus = 0 (default)', () => {
      const withExplicitZero = calculateScamDuration(testScam, 1, 0);
      const withDefault = calculateScamDuration(testScam, 1);

      expect(withExplicitZero).toBe(withDefault);
    });

    it('should reduce duration using divisor formula', () => {
      // With 50% speed bonus: duration / (1 + 0.5) = duration / 1.5
      const base = calculateScamDuration(testScam, 1, 0);
      const boosted = calculateScamDuration(testScam, 1, 0.5);

      // Expected: 1000 / 1.5 = 667 (rounded)
      expect(boosted).toBe(Math.max(
        Math.round(base / 1.5),
        Math.round(testScam.baseDuration * 0.1)
      ));
    });

    it('should allow employee speed bonus to push below 10% floor', () => {
      // Use a longer scam where 10% floor (1000ms) > hard floor (500ms)
      const longScam: ScamDefinition = {
        ...testScam,
        baseDuration: 10000,
      };
      // 10% floor = 1000ms, hard floor = 500ms

      // Level 1, employee bonus = 19 → 10000 / 20 = 500
      // Without this fix: 10% floor clamps to 1000
      // With this fix: employee pushes to 500 (at the hard floor)
      const result = calculateScamDuration(longScam, 1, 19);
      expect(result).toBe(500);

      // Employee bonus = 9 → 10000 / 10 = 1000 (exactly at 10% floor)
      // Below that: employee bonus = 12 → 10000 / 13 = 769
      // This should go through (below 10% floor of 1000 but above hard 500ms)
      const belowPercentFloor = calculateScamDuration(longScam, 1, 12);
      expect(belowPercentFloor).toBe(769);
    });

    it('should not go below absolute minimum with employee speed bonus', () => {
      const extreme = calculateScamDuration(testScam, 1, 100);
      expect(extreme).toBe(500);
    });

    it('should combine with level-based speed brackets', () => {
      // At level 10 (1.5x speed bracket), with 20% employee speed bonus
      const durationLevel10NoEmployee = calculateScamDuration(testScam, 10, 0);
      const durationLevel10WithEmployee = calculateScamDuration(testScam, 10, 0.2);

      expect(durationLevel10WithEmployee).toBeLessThan(durationLevel10NoEmployee);
    });
  });
});
