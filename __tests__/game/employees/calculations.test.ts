// ABOUTME: Tests for employee calculation functions
// ABOUTME: Validates cost scaling, speed bonuses, and reward bonuses

import {
  calculateEmployeeCost,
  calculateSpeedBonus,
  calculateRewardBonus,
} from '../../../src/game/employees/calculations';
import { BOT_WRANGLER, TIER_1_EMPLOYEES } from '../../../src/game/employees/definitions';
import type { EmployeeDefinition, EmployeeState } from '../../../src/game/employees/types';

describe('Employee Calculations', () => {
  // Test employee with known values
  const testEmployee: EmployeeDefinition = {
    id: 'test-employee',
    name: 'Test Employee',
    scamId: 'test-scam',
    baseCost: 100,
    speedBoost: 0.05, // 5%
    rewardBoost: 0.1, // 10%
  };

  describe('calculateEmployeeCost', () => {
    it('should return base cost when hiring first employee (count 0)', () => {
      const cost = calculateEmployeeCost(testEmployee, 0);

      expect(cost).toBe(100);
    });

    it('should increase cost for subsequent employees', () => {
      const cost0 = calculateEmployeeCost(testEmployee, 0);
      const cost1 = calculateEmployeeCost(testEmployee, 1);
      const cost5 = calculateEmployeeCost(testEmployee, 5);
      const cost10 = calculateEmployeeCost(testEmployee, 10);

      expect(cost1).toBeGreaterThan(cost0);
      expect(cost5).toBeGreaterThan(cost1);
      expect(cost10).toBeGreaterThan(cost5);
    });

    it('should scale exponentially (idle game convention)', () => {
      const cost0 = calculateEmployeeCost(testEmployee, 0);
      const cost1 = calculateEmployeeCost(testEmployee, 1);
      const cost2 = calculateEmployeeCost(testEmployee, 2);

      // Growth rate should be roughly consistent (exponential)
      const rate0to1 = cost1 / cost0;
      const rate1to2 = cost2 / cost1;

      // Allow some tolerance for rounding
      expect(Math.abs(rate0to1 - rate1to2)).toBeLessThan(0.1);
    });

    it('should return integer values (no fractional money)', () => {
      const cost = calculateEmployeeCost(testEmployee, 7);

      expect(Number.isInteger(cost)).toBe(true);
    });

    it('should work with Bot Wrangler definition', () => {
      const cost = calculateEmployeeCost(BOT_WRANGLER, 0);

      expect(cost).toBe(BOT_WRANGLER.baseCost);
    });

    it('should handle large counts for late game', () => {
      const cost = calculateEmployeeCost(testEmployee, 100);

      expect(cost).toBeGreaterThan(0);
      expect(Number.isInteger(cost)).toBe(true);
    });

    it('should work with all Tier 1 employees', () => {
      TIER_1_EMPLOYEES.forEach((employee) => {
        const cost = calculateEmployeeCost(employee, 0);

        expect(cost).toBe(employee.baseCost);
        expect(cost).toBeGreaterThan(0);
      });
    });
  });

  describe('calculateSpeedBonus', () => {
    it('should return 0 when no employees are hired', () => {
      const employees: EmployeeState[] = [];
      const definitions = [testEmployee];

      const bonus = calculateSpeedBonus(employees, definitions);

      expect(bonus).toBe(0);
    });

    it('should return 0 when all counts are zero', () => {
      const employees: EmployeeState[] = [{ employeeId: 'test-employee', count: 0 }];
      const definitions = [testEmployee];

      const bonus = calculateSpeedBonus(employees, definitions);

      expect(bonus).toBe(0);
    });

    it('should calculate speed boost for single employee type', () => {
      const employees: EmployeeState[] = [{ employeeId: 'test-employee', count: 1 }];
      const definitions = [testEmployee];

      const bonus = calculateSpeedBonus(employees, definitions);

      expect(bonus).toBe(0.05); // 5% for one employee
    });

    it('should scale linearly with employee count', () => {
      const employees: EmployeeState[] = [{ employeeId: 'test-employee', count: 5 }];
      const definitions = [testEmployee];

      const bonus = calculateSpeedBonus(employees, definitions);

      expect(bonus).toBeCloseTo(0.25); // 5% * 5 = 25%
    });

    it('should combine multiple employee types', () => {
      const employee2: EmployeeDefinition = {
        id: 'test-employee-2',
        name: 'Test Employee 2',
        scamId: 'test-scam-2',
        baseCost: 200,
        speedBoost: 0.03, // 3%
        rewardBoost: 0.05,
      };

      const employees: EmployeeState[] = [
        { employeeId: 'test-employee', count: 2 },
        { employeeId: 'test-employee-2', count: 3 },
      ];
      const definitions = [testEmployee, employee2];

      const bonus = calculateSpeedBonus(employees, definitions);

      // 2 * 5% + 3 * 3% = 10% + 9% = 19%
      expect(bonus).toBeCloseTo(0.19);
    });

    it('should ignore employees not in definitions', () => {
      const employees: EmployeeState[] = [
        { employeeId: 'test-employee', count: 2 },
        { employeeId: 'unknown-employee', count: 10 },
      ];
      const definitions = [testEmployee];

      const bonus = calculateSpeedBonus(employees, definitions);

      expect(bonus).toBeCloseTo(0.1); // Only test-employee counts
    });

    it('should handle employees with zero speed boost', () => {
      const rewardOnlyEmployee: EmployeeDefinition = {
        id: 'reward-only',
        name: 'Reward Only',
        scamId: 'test-scam',
        baseCost: 100,
        speedBoost: 0,
        rewardBoost: 0.2,
      };

      const employees: EmployeeState[] = [{ employeeId: 'reward-only', count: 5 }];
      const definitions = [rewardOnlyEmployee];

      const bonus = calculateSpeedBonus(employees, definitions);

      expect(bonus).toBe(0);
    });
  });

  describe('calculateRewardBonus', () => {
    it('should return 0 when no employees are hired', () => {
      const employees: EmployeeState[] = [];
      const definitions = [testEmployee];

      const bonus = calculateRewardBonus(employees, definitions);

      expect(bonus).toBe(0);
    });

    it('should return 0 when all counts are zero', () => {
      const employees: EmployeeState[] = [{ employeeId: 'test-employee', count: 0 }];
      const definitions = [testEmployee];

      const bonus = calculateRewardBonus(employees, definitions);

      expect(bonus).toBe(0);
    });

    it('should calculate reward boost for single employee type', () => {
      const employees: EmployeeState[] = [{ employeeId: 'test-employee', count: 1 }];
      const definitions = [testEmployee];

      const bonus = calculateRewardBonus(employees, definitions);

      expect(bonus).toBe(0.1); // 10% for one employee
    });

    it('should scale linearly with employee count', () => {
      const employees: EmployeeState[] = [{ employeeId: 'test-employee', count: 5 }];
      const definitions = [testEmployee];

      const bonus = calculateRewardBonus(employees, definitions);

      expect(bonus).toBeCloseTo(0.5); // 10% * 5 = 50%
    });

    it('should combine multiple employee types', () => {
      const employee2: EmployeeDefinition = {
        id: 'test-employee-2',
        name: 'Test Employee 2',
        scamId: 'test-scam-2',
        baseCost: 200,
        speedBoost: 0.02,
        rewardBoost: 0.08, // 8%
      };

      const employees: EmployeeState[] = [
        { employeeId: 'test-employee', count: 3 },
        { employeeId: 'test-employee-2', count: 2 },
      ];
      const definitions = [testEmployee, employee2];

      const bonus = calculateRewardBonus(employees, definitions);

      // 3 * 10% + 2 * 8% = 30% + 16% = 46%
      expect(bonus).toBeCloseTo(0.46);
    });

    it('should ignore employees not in definitions', () => {
      const employees: EmployeeState[] = [
        { employeeId: 'test-employee', count: 2 },
        { employeeId: 'unknown-employee', count: 100 },
      ];
      const definitions = [testEmployee];

      const bonus = calculateRewardBonus(employees, definitions);

      expect(bonus).toBeCloseTo(0.2); // Only test-employee counts
    });

    it('should handle employees with zero reward boost', () => {
      const speedOnlyEmployee: EmployeeDefinition = {
        id: 'speed-only',
        name: 'Speed Only',
        scamId: 'test-scam',
        baseCost: 100,
        speedBoost: 0.2,
        rewardBoost: 0,
      };

      const employees: EmployeeState[] = [{ employeeId: 'speed-only', count: 5 }];
      const definitions = [speedOnlyEmployee];

      const bonus = calculateRewardBonus(employees, definitions);

      expect(bonus).toBe(0);
    });
  });
});
