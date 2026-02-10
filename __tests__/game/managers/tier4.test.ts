// ABOUTME: Jest tests for Tier 4 manager definitions
// ABOUTME: Validates each scam has a manager with unique name and personality

import { TIER_4_MANAGERS } from '../../../src/game/managers/tier4';
import { TIER_4_SCAMS } from '../../../src/game/scams/tier4';

describe('TIER_4_MANAGERS', () => {
  it('should have exactly 10 managers (one per Tier 4 scam)', () => {
    expect(TIER_4_MANAGERS).toHaveLength(10);
  });

  it('should have unique IDs for all managers', () => {
    const ids = TIER_4_MANAGERS.map((m) => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(TIER_4_MANAGERS.length);
  });

  it('should have unique names for all managers', () => {
    const names = TIER_4_MANAGERS.map((m) => m.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(TIER_4_MANAGERS.length);
  });

  it('should map to exactly one Tier 4 scam each', () => {
    const scamIdsCovered = new Set(TIER_4_MANAGERS.map((m) => m.scamId));
    const tier4ScamIds = new Set(TIER_4_SCAMS.map((s) => s.id));

    // All Tier 4 scams should have managers
    tier4ScamIds.forEach((scamId) => {
      expect(scamIdsCovered.has(scamId)).toBe(true);
    });

    // Should have exactly the same scam coverage
    expect(scamIdsCovered.size).toBe(tier4ScamIds.size);
  });

  it('should have positive costs for all managers', () => {
    TIER_4_MANAGERS.forEach((manager) => {
      expect(manager.cost).toBeGreaterThan(0);
    });
  });

  it('should have non-empty flavor text for all managers', () => {
    TIER_4_MANAGERS.forEach((manager) => {
      expect(manager.flavorText).toBeTruthy();
      expect(typeof manager.flavorText).toBe('string');
      expect(manager.flavorText.length).toBeGreaterThan(0);
    });
  });

  it('should have costs that scale (first cost < last cost)', () => {
    const firstManager = TIER_4_MANAGERS[0];
    const lastManager = TIER_4_MANAGERS[TIER_4_MANAGERS.length - 1];

    expect(lastManager.cost).toBeGreaterThan(firstManager.cost);
  });
});
