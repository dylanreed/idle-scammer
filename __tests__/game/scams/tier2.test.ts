// ABOUTME: Jest tests for Tier 2 scam definitions
// ABOUTME: Validates structure, uniqueness, progression, and balancing of tier 2 scams

import { TIER_2_SCAMS } from '../../../src/game/scams/tier2';

describe('TIER_2_SCAMS', () => {
  it('should have exactly 10 scams', () => {
    expect(TIER_2_SCAMS).toHaveLength(10);
  });

  it('should all be tier 2', () => {
    TIER_2_SCAMS.forEach((scam) => {
      expect(scam.tier).toBe(2);
    });
  });

  it('should have unique IDs', () => {
    const ids = TIER_2_SCAMS.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(TIER_2_SCAMS.length);
  });

  it('should have unique names', () => {
    const names = TIER_2_SCAMS.map((s) => s.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(TIER_2_SCAMS.length);
  });

  it('should have first scam (tech-support-scams) cost $1,000', () => {
    const firstScam = TIER_2_SCAMS[0];
    expect(firstScam.id).toBe('tech-support-scams');
    expect(firstScam.unlockCost).toBe(1000);
  });

  it('should have first scam with baseReward of $1,000', () => {
    const firstScam = TIER_2_SCAMS[0];
    expect(firstScam.baseReward).toBe(1000);
  });

  it('should have all 10 scams with defined unlockCost', () => {
    expect(TIER_2_SCAMS).toHaveLength(10);
    TIER_2_SCAMS.forEach((scam) => {
      expect(scam.unlockCost).toBeDefined();
      expect(typeof scam.unlockCost).toBe('number');
      expect(scam.unlockCost).toBeGreaterThan(0);
    });
  });

  it('should have ascending unlock costs', () => {
    for (let i = 1; i < TIER_2_SCAMS.length; i++) {
      const prevCost = TIER_2_SCAMS[i - 1].unlockCost!;
      const currentCost = TIER_2_SCAMS[i].unlockCost!;
      expect(currentCost).toBeGreaterThanOrEqual(prevCost);
    }
  });

  it('should have baseReward equal to unlockCost', () => {
    TIER_2_SCAMS.forEach((scam) => {
      expect(scam.baseReward).toBe(scam.unlockCost);
    });
  });

  it('should have durations between 5000-180000ms', () => {
    TIER_2_SCAMS.forEach((scam) => {
      expect(scam.baseDuration).toBeGreaterThanOrEqual(5000);
      expect(scam.baseDuration).toBeLessThanOrEqual(180000);
    });
  });

  it('should all produce money', () => {
    TIER_2_SCAMS.forEach((scam) => {
      expect(scam.resourceType).toBe('money');
    });
  });

  it('should have non-empty descriptions', () => {
    TIER_2_SCAMS.forEach((scam) => {
      expect(scam.description).toBeTruthy();
      expect(typeof scam.description).toBe('string');
      expect(scam.description.length).toBeGreaterThan(0);
    });
  });
});
