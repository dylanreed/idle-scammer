// ABOUTME: Jest tests for Tier 3 scam definitions
// ABOUTME: Validates structure, uniqueness, progression, and balancing of tier 3 scams

import { TIER_3_SCAMS } from '../../../src/game/scams/tier3';

describe('TIER_3_SCAMS', () => {
  it('should have exactly 10 scams', () => {
    expect(TIER_3_SCAMS).toHaveLength(10);
  });

  it('should all be tier 3', () => {
    TIER_3_SCAMS.forEach((scam) => {
      expect(scam.tier).toBe(3);
    });
  });

  it('should have unique IDs', () => {
    const ids = TIER_3_SCAMS.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(TIER_3_SCAMS.length);
  });

  it('should have unique names', () => {
    const names = TIER_3_SCAMS.map((s) => s.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(TIER_3_SCAMS.length);
  });

  it('should have first scam (crypto-rug-pulls) cost $100,000', () => {
    const firstScam = TIER_3_SCAMS[0];
    expect(firstScam.id).toBe('crypto-rug-pulls');
    expect(firstScam.unlockCost).toBe(100000);
  });

  it('should have first scam with baseReward of $100,000', () => {
    const firstScam = TIER_3_SCAMS[0];
    expect(firstScam.baseReward).toBe(100000);
  });

  it('should have all 10 scams with defined unlockCost', () => {
    expect(TIER_3_SCAMS).toHaveLength(10);
    TIER_3_SCAMS.forEach((scam) => {
      expect(scam.unlockCost).toBeDefined();
      expect(typeof scam.unlockCost).toBe('number');
      expect(scam.unlockCost).toBeGreaterThan(0);
    });
  });

  it('should have ascending unlock costs', () => {
    for (let i = 1; i < TIER_3_SCAMS.length; i++) {
      const prevCost = TIER_3_SCAMS[i - 1].unlockCost!;
      const currentCost = TIER_3_SCAMS[i].unlockCost!;
      expect(currentCost).toBeGreaterThanOrEqual(prevCost);
    }
  });

  it('should have baseReward equal to unlockCost', () => {
    TIER_3_SCAMS.forEach((scam) => {
      expect(scam.baseReward).toBe(scam.unlockCost);
    });
  });

  it('should have durations between 5000-180000ms', () => {
    TIER_3_SCAMS.forEach((scam) => {
      expect(scam.baseDuration).toBeGreaterThanOrEqual(5000);
      expect(scam.baseDuration).toBeLessThanOrEqual(180000);
    });
  });

  it('should all produce money', () => {
    TIER_3_SCAMS.forEach((scam) => {
      expect(scam.resourceType).toBe('money');
    });
  });

  it('should have non-empty descriptions', () => {
    TIER_3_SCAMS.forEach((scam) => {
      expect(scam.description).toBeTruthy();
      expect(typeof scam.description).toBe('string');
      expect(scam.description.length).toBeGreaterThan(0);
    });
  });
});
