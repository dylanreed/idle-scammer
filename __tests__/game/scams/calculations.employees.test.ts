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

    it('should respect minimum duration (10% of base) even with large speed bonus', () => {
      // With 100x speed bonus, duration should be clamped
      const boosted = calculateScamDuration(testScam, 1, 100);
      const minimumDuration = Math.round(testScam.baseDuration * 0.1);

      expect(boosted).toBe(minimumDuration);
    });

    it('should combine with level-based speed brackets', () => {
      // At level 10 (1.5x speed bracket), with 20% employee speed bonus
      const durationLevel10NoEmployee = calculateScamDuration(testScam, 10, 0);
      const durationLevel10WithEmployee = calculateScamDuration(testScam, 10, 0.2);

      expect(durationLevel10WithEmployee).toBeLessThan(durationLevel10NoEmployee);
    });
  });
});
