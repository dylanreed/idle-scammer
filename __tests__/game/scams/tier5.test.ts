// ABOUTME: Jest tests for Tier 5 "Mastermind" scam definitions
// ABOUTME: Validates structure, economy, and progression of all 10 Tier 5 scams

import { TIER_5_SCAMS } from '../../../src/game/scams/tier5';

describe('Tier 5 Scams', () => {
  test('should have exactly 10 scams', () => {
    expect(TIER_5_SCAMS).toHaveLength(10);
  });

  test('all scams should be tier 5', () => {
    TIER_5_SCAMS.forEach((scam) => {
      expect(scam.tier).toBe(5);
    });
  });

  test('all scams should have unique IDs', () => {
    const ids = TIER_5_SCAMS.map((scam) => scam.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(TIER_5_SCAMS.length);
  });

  test('all scams should have unique names', () => {
    const names = TIER_5_SCAMS.map((scam) => scam.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(TIER_5_SCAMS.length);
  });

  test('first scam (government-contract-fraud) should cost $1,000,000,000', () => {
    const firstScam = TIER_5_SCAMS[0];
    expect(firstScam.id).toBe('government-contract-fraud');
    expect(firstScam.unlockCost).toBe(1000000000);
    expect(firstScam.baseReward).toBe(1000000000); // $1B (tier 5 baseCost)
  });

  test('all 10 scams should have defined unlockCost', () => {
    expect(TIER_5_SCAMS).toHaveLength(10);

    TIER_5_SCAMS.forEach((scam) => {
      expect(scam.unlockCost).toBeDefined();
      expect(typeof scam.unlockCost).toBe('number');
      expect(scam.unlockCost).toBeGreaterThan(0);
    });
  });

  test('all scams should have ascending unlock costs', () => {
    for (let i = 1; i < TIER_5_SCAMS.length; i++) {
      const prevCost = TIER_5_SCAMS[i - 1].unlockCost!;
      const currentCost = TIER_5_SCAMS[i].unlockCost!;
      expect(currentCost).toBeGreaterThan(prevCost);
    }
  });

  test('baseReward should equal unlockCost for all scams', () => {
    TIER_5_SCAMS.forEach((scam) => {
      expect(scam.baseReward).toBe(scam.unlockCost);
    });
  });

  test('all scams should have durations between 5000ms and 180000ms', () => {
    TIER_5_SCAMS.forEach((scam) => {
      expect(scam.baseDuration).toBeGreaterThanOrEqual(5000);
      expect(scam.baseDuration).toBeLessThanOrEqual(180000);
    });
  });

  test('all scams should produce money resource', () => {
    TIER_5_SCAMS.forEach((scam) => {
      expect(scam.resourceType).toBe('money');
    });
  });
});
