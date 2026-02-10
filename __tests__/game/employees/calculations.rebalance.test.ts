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
} from '../../../src/game/employees/calculations';
import { getEmployeesByScamId } from '../../../src/game/employees/definitions';
import { getManagerByScamId } from '../../../src/game/managers/definitions';
import { ALL_SCAMS } from '../../../src/game/scams/definitions';

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

    it('should return minimum cost for bot-farms (no prior money income)', () => {
      // Bot Farms produces bots, not money. Cumulative money income at this point is $0/s.
      expect(getEmployeeBaseCost('bot-farms')).toBe(10);
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
      expect(getEmployeeCostForScam('bot-farms', 0)).toBe(10);
      expect(getEmployeeCostForScam('nigerian-prince-emails', 0)).toBe(120);
    });

    it('should apply 1.15x growth for subsequent hires', () => {
      // floor(10 * 1.15^1) = floor(11.5) = 11
      expect(getEmployeeCostForScam('bot-farms', 1)).toBe(11);
      // floor(120 * 1.15^1) = floor(138) = 138
      expect(getEmployeeCostForScam('nigerian-prince-emails', 1)).toBe(138);
    });

    it('should clear the memoized cache', () => {
      // Populate cache
      getEmployeeBaseCost('bot-farms');
      // Clear it
      clearEmployeeCostCache();
      // Should still work after clearing (rebuilds on next call)
      expect(getEmployeeBaseCost('bot-farms')).toBe(10);
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
});
