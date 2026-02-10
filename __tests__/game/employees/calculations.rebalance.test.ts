// ABOUTME: Tests for employee cap, heat generation, and dynamic cost calculations
// ABOUTME: Validates trust-based hiring caps, passive employee heat, and cumulative income-based costs

import {
  calculateEmployeeCost,
  getMaxEmployeesPerType,
  canHireEmployee,
  calculateEmployeeHeat,
  EMPLOYEE_HEAT_PER_SECOND,
  getEmployeeBaseCost,
  getEmployeeCostForScam,
  clearEmployeeCostCache,
  TARGET_SECONDS,
  MINIMUM_EMPLOYEE_COST,
  getUnlockCostForScam,
  getManagerCostForScam,
  UNLOCK_TARGET_SECONDS,
  MANAGER_TARGET_SECONDS,
  MINIMUM_UNLOCK_COST,
  MINIMUM_MANAGER_COST,
} from '../../../src/game/employees/calculations';
import { getEmployeesByScamId } from '../../../src/game/employees/definitions';
import { getManagerByScamId } from '../../../src/game/managers/definitions';
import { ALL_SCAMS } from '../../../src/game/scams/definitions';
import { getProgressionCost } from '../../../src/game/economy/constants';

describe('Employee Rebalance Calculations', () => {
  describe('getMaxEmployeesPerType', () => {
    it('should return 1 at trust 1 (first run)', () => {
      expect(getMaxEmployeesPerType(1)).toBe(1);
    });

    it('should return 11 at trust 11 (after first prestige)', () => {
      expect(getMaxEmployeesPerType(11)).toBe(11);
    });

    it('should return 21 at trust 21 (after second prestige)', () => {
      expect(getMaxEmployeesPerType(21)).toBe(21);
    });

    it('should floor fractional trust values', () => {
      expect(getMaxEmployeesPerType(5.7)).toBe(5);
    });

    it('should return at least 1 even for trust below 1', () => {
      expect(getMaxEmployeesPerType(0.5)).toBe(1);
      expect(getMaxEmployeesPerType(0)).toBe(1);
    });
  });

  describe('canHireEmployee', () => {
    it('should return false when at cap', () => {
      expect(canHireEmployee(1, 1)).toBe(false);
    });

    it('should return true when below cap', () => {
      expect(canHireEmployee(1, 0)).toBe(true);
    });

    it('should return true for trust 11 with count 10', () => {
      expect(canHireEmployee(11, 10)).toBe(true);
    });

    it('should return false for trust 11 with count 11', () => {
      expect(canHireEmployee(11, 11)).toBe(false);
    });

    it('should return false when over cap', () => {
      expect(canHireEmployee(1, 5)).toBe(false);
    });
  });

  describe('calculateEmployeeHeat', () => {
    it('should return 0 for zero employees', () => {
      expect(calculateEmployeeHeat(0, 1.0)).toBe(0);
    });

    it('should return 0.01 for 10 employees over 1 second', () => {
      expect(calculateEmployeeHeat(10, 1.0)).toBeCloseTo(0.01);
    });

    it('should return 0.05 for 50 employees over 1 second', () => {
      expect(calculateEmployeeHeat(50, 1.0)).toBeCloseTo(0.05);
    });

    it('should scale linearly with time delta', () => {
      const heat1s = calculateEmployeeHeat(10, 1.0);
      const heat5s = calculateEmployeeHeat(10, 5.0);
      expect(heat5s).toBeCloseTo(heat1s * 5);
    });

    it('should return 0 for zero delta', () => {
      expect(calculateEmployeeHeat(10, 0)).toBe(0);
    });

    it('should export the heat constant', () => {
      expect(EMPLOYEE_HEAT_PER_SECOND).toBe(0.001);
    });
  });

  describe('Dynamic cost: baseCost = max(10, floor(60 × cumulativeMoneyIncomePerSec))', () => {
    beforeEach(() => {
      clearEmployeeCostCache();
    });

    it('should export cost formula constants', () => {
      expect(TARGET_SECONDS).toBe(60);
      expect(MINIMUM_EMPLOYEE_COST).toBe(10);
    });

    it('should return 120 for nigerian-prince-emails (floor(60 × $2/s))', () => {
      // Nigerian Prince: $10 reward / 5s duration = $2/s. Cumulative = $2/s.
      expect(getEmployeeBaseCost('nigerian-prince-emails')).toBe(120);
    });

    it('should return 6120 for iphone-popup (floor(60 × $102/s))', () => {
      // iPhone Popup: $1000 / 10s = $100/s. Cumulative = $2 + $100 = $102/s.
      expect(getEmployeeBaseCost('iphone-popup')).toBe(6120);
    });

    it('should return baseCost for first hire via getEmployeeCostForScam', () => {
      expect(getEmployeeCostForScam('nigerian-prince-emails', 0)).toBe(120);
    });

    it('should apply 1.15x growth for subsequent hires', () => {
      // floor(120 * 1.15^1) = floor(138) = 138
      expect(getEmployeeCostForScam('nigerian-prince-emails', 1)).toBe(138);
    });

    it('should clear the memoized cache', () => {
      // Populate cache
      getEmployeeBaseCost('nigerian-prince-emails');
      // Clear it
      clearEmployeeCostCache();
      // Should still work after clearing (rebuilds on next call)
      expect(getEmployeeBaseCost('nigerian-prince-emails')).toBe(120);
    });

    it('should return minimum cost for unknown scam IDs', () => {
      expect(getEmployeeBaseCost('nonexistent-scam')).toBe(10);
    });

    it('should increase costs monotonically across ALL_SCAMS progression', () => {
      let prevCost = 0;
      for (const scam of ALL_SCAMS) {
        const cost = getEmployeeBaseCost(scam.id);
        expect(cost).toBeGreaterThanOrEqual(prevCost);
        prevCost = cost;
      }
    });
  });

  describe('Unlock cost: static value from scam definition (5x progression)', () => {
    beforeEach(() => {
      clearEmployeeCostCache();
    });

    it('should export unlock cost formula constants', () => {
      expect(UNLOCK_TARGET_SECONDS).toBe(30);
      expect(MINIMUM_UNLOCK_COST).toBe(10);
    });

    it('should return undefined for nigerian-prince-emails (free scam stays free)', () => {
      expect(getUnlockCostForScam('nigerian-prince-emails')).toBeUndefined();
    });

    it('should return static definition value for iphone-popup', () => {
      // iphone-popup is at position 1 in the progression: unlockCost = getProgressionCost(1) = $1000
      expect(getUnlockCostForScam('iphone-popup')).toBe(getProgressionCost(1));
    });

    it('should return static definition value for tech-support-scams', () => {
      // tech-support-scams is at position 9: unlockCost = getProgressionCost(9)
      const cost = getUnlockCostForScam('tech-support-scams')!;
      expect(cost).toBe(getProgressionCost(9));
    });

    it('should return the definition unlockCost for every paid scam', () => {
      // Unlock costs come directly from the scam definition (5x continuous progression).
      // getUnlockCostForScam should return exactly the scam's unlockCost for paid scams
      // and undefined for free scams.
      for (const scam of ALL_SCAMS) {
        const unlockCost = getUnlockCostForScam(scam.id);
        expect(unlockCost).toBe(scam.unlockCost);
      }
    });
  });

  describe('Manager cost: static value from manager definition (0.75 × next progression cost)', () => {
    beforeEach(() => {
      clearEmployeeCostCache();
    });

    it('should export manager cost formula constants', () => {
      expect(MANAGER_TARGET_SECONDS).toBe(120);
      expect(MINIMUM_MANAGER_COST).toBe(50);
    });

    it('should return static cost for nigerian-prince-emails manager (static dominates)', () => {
      // Static manager cost = $750. Dynamic floor = floor(120 × $2/s) = 240.
      // max(750, 240) = 750
      expect(getManagerCostForScam('nigerian-prince-emails')).toBe(750);
    });

    it('should return dynamic floor for tech-support-scams manager (much higher than static $75K)', () => {
      // Static manager cost = $75K. Dynamic floor = floor(120 × $65,193,024.22/s) = huge.
      const cost = getManagerCostForScam('tech-support-scams');
      expect(cost).toBeGreaterThan(75000); // Well above static $75K
    });

    it('should return minimum for scam with no manager definition', () => {
      // Bot farms cumulative = 0, so max(50, 0) = 50, but that's with a manager.
      // For a scam ID that has no manager, static cost = 0, so it should use dynamic floor.
      // But we still cap at MINIMUM_MANAGER_COST.
      const cost = getManagerCostForScam('nonexistent-scam');
      expect(cost).toBe(MINIMUM_MANAGER_COST);
    });

    it('should return the definition manager cost for every scam', () => {
      // Manager costs come directly from the manager definition (0.75 × next scam's
      // progression cost). getManagerCostForScam should return max(MINIMUM_MANAGER_COST,
      // manager.cost) for scams with a manager, or MINIMUM_MANAGER_COST otherwise.
      for (const scam of ALL_SCAMS) {
        const mgrCost = getManagerCostForScam(scam.id);
        const manager = getManagerByScamId(scam.id);
        const expectedCost = Math.max(MINIMUM_MANAGER_COST, manager?.cost ?? 0);
        expect(mgrCost).toBe(expectedCost);
      }
    });
  });
});
