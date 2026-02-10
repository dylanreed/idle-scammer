// ABOUTME: Jest tests for Tier 3 employee definitions
// ABOUTME: Validates each scam has an employee and all definitions are valid

import { TIER_3_EMPLOYEES } from '../../../src/game/employees/tier3';
import { TIER_3_SCAMS } from '../../../src/game/scams/tier3';

describe('TIER_3_EMPLOYEES', () => {
  it('should have exactly 10 employees (one per Tier 3 scam)', () => {
    expect(TIER_3_EMPLOYEES).toHaveLength(10);
  });

  it('should have unique IDs for all employees', () => {
    const ids = TIER_3_EMPLOYEES.map((e) => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(TIER_3_EMPLOYEES.length);
  });

  it('should have unique names for all employees', () => {
    const names = TIER_3_EMPLOYEES.map((e) => e.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(TIER_3_EMPLOYEES.length);
  });

  it('should map to exactly one Tier 3 scam each', () => {
    const scamIdsCovered = new Set(TIER_3_EMPLOYEES.map((e) => e.scamId));
    const tier3ScamIds = new Set(TIER_3_SCAMS.map((s) => s.id));

    // All Tier 3 scams should have employees
    tier3ScamIds.forEach((scamId) => {
      expect(scamIdsCovered.has(scamId)).toBe(true);
    });

    // Should have exactly the same scam coverage
    expect(scamIdsCovered.size).toBe(tier3ScamIds.size);
  });

  it('should have positive base costs for all employees', () => {
    TIER_3_EMPLOYEES.forEach((employee) => {
      expect(employee.baseCost).toBeGreaterThan(0);
    });
  });

  it('should have speedBoost > 0 for all employees', () => {
    TIER_3_EMPLOYEES.forEach((employee) => {
      expect(employee.speedBoost).toBeGreaterThan(0);
    });
  });

  it('should have rewardBoost > 0 for all employees', () => {
    TIER_3_EMPLOYEES.forEach((employee) => {
      expect(employee.rewardBoost).toBeGreaterThan(0);
    });
  });

  it('should have speedBoost < 0.5 for all employees', () => {
    TIER_3_EMPLOYEES.forEach((employee) => {
      expect(employee.speedBoost).toBeLessThan(0.5);
    });
  });

  it('should have rewardBoost < 0.5 for all employees', () => {
    TIER_3_EMPLOYEES.forEach((employee) => {
      expect(employee.rewardBoost).toBeLessThan(0.5);
    });
  });
});
