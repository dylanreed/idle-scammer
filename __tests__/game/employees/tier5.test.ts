// ABOUTME: Jest tests for Tier 5 employee definitions
// ABOUTME: Validates structure, mappings, and boost values for all Tier 5 employees

import { TIER_5_EMPLOYEES } from '../../../src/game/employees/tier5';
import { TIER_5_SCAMS } from '../../../src/game/scams/tier5';

describe('Tier 5 Employees', () => {
  test('should have exactly 10 employees', () => {
    expect(TIER_5_EMPLOYEES).toHaveLength(10);
  });

  test('all employees should have unique IDs', () => {
    const ids = TIER_5_EMPLOYEES.map((emp) => emp.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(TIER_5_EMPLOYEES.length);
  });

  test('all employees should have unique names', () => {
    const names = TIER_5_EMPLOYEES.map((emp) => emp.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(TIER_5_EMPLOYEES.length);
  });

  test('each employee should map to a valid T5 scam', () => {
    const scamIds = new Set(TIER_5_SCAMS.map((scam) => scam.id));

    TIER_5_EMPLOYEES.forEach((employee) => {
      expect(scamIds.has(employee.scamId)).toBe(true);
    });
  });

  test('every T5 scam should have at least one employee', () => {
    const employeeScamIds = new Set(TIER_5_EMPLOYEES.map((emp) => emp.scamId));

    TIER_5_SCAMS.forEach((scam) => {
      expect(employeeScamIds.has(scam.id)).toBe(true);
    });
  });

  test('all employees should have positive baseCost', () => {
    TIER_5_EMPLOYEES.forEach((employee) => {
      expect(employee.baseCost).toBeGreaterThan(0);
    });
  });

  test('all employees should have speedBoost > 0 and < 0.5', () => {
    TIER_5_EMPLOYEES.forEach((employee) => {
      expect(employee.speedBoost).toBeGreaterThan(0);
      expect(employee.speedBoost).toBeLessThan(0.5);
    });
  });

  test('all employees should have rewardBoost > 0 and < 0.5', () => {
    TIER_5_EMPLOYEES.forEach((employee) => {
      expect(employee.rewardBoost).toBeGreaterThan(0);
      expect(employee.rewardBoost).toBeLessThan(0.5);
    });
  });
});
