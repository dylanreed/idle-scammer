// ABOUTME: Jest tests for Tier 2 employee definitions
// ABOUTME: Validates employee structure, uniqueness, scam mapping, and boost balancing

import { TIER_2_EMPLOYEES } from '../../../src/game/employees/tier2';
import { TIER_2_SCAMS } from '../../../src/game/scams/tier2';

describe('TIER_2_EMPLOYEES', () => {
  it('should have exactly 10 employees', () => {
    expect(TIER_2_EMPLOYEES).toHaveLength(10);
  });

  it('should have unique IDs', () => {
    const ids = TIER_2_EMPLOYEES.map((e) => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(TIER_2_EMPLOYEES.length);
  });

  it('should have unique names', () => {
    const names = TIER_2_EMPLOYEES.map((e) => e.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(TIER_2_EMPLOYEES.length);
  });

  it('should map to all T2 scams (every T2 scam ID appears)', () => {
    const scamIds = TIER_2_SCAMS.map((s) => s.id);
    const employeeScamIds = TIER_2_EMPLOYEES.map((e) => e.scamId);

    scamIds.forEach((scamId) => {
      expect(employeeScamIds).toContain(scamId);
    });
  });

  it('should have positive baseCost', () => {
    TIER_2_EMPLOYEES.forEach((employee) => {
      expect(employee.baseCost).toBeGreaterThan(0);
      expect(typeof employee.baseCost).toBe('number');
    });
  });

  it('should have speedBoost > 0 and < 0.5', () => {
    TIER_2_EMPLOYEES.forEach((employee) => {
      expect(employee.speedBoost).toBeGreaterThan(0);
      expect(employee.speedBoost).toBeLessThan(0.5);
    });
  });

  it('should have rewardBoost > 0 and < 0.5', () => {
    TIER_2_EMPLOYEES.forEach((employee) => {
      expect(employee.rewardBoost).toBeGreaterThan(0);
      expect(employee.rewardBoost).toBeLessThan(0.5);
    });
  });
});
