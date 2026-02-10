// ABOUTME: Jest tests for Tier 3 manager definitions
// ABOUTME: Validates each scam has a manager with unique name and personality

import { TIER_3_MANAGERS } from '../../../src/game/managers/tier3';
import { TIER_3_SCAMS } from '../../../src/game/scams/tier3';

describe('TIER_3_MANAGERS', () => {
  it('should have exactly 10 managers (one per Tier 3 scam)', () => {
    expect(TIER_3_MANAGERS).toHaveLength(10);
  });

  it('should have unique IDs for all managers', () => {
    const ids = TIER_3_MANAGERS.map((m) => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(TIER_3_MANAGERS.length);
  });

  it('should have unique names for all managers', () => {
    const names = TIER_3_MANAGERS.map((m) => m.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(TIER_3_MANAGERS.length);
  });

  it('should map to exactly one Tier 3 scam each', () => {
    const scamIdsCovered = new Set(TIER_3_MANAGERS.map((m) => m.scamId));
    const tier3ScamIds = new Set(TIER_3_SCAMS.map((s) => s.id));

    // All Tier 3 scams should have managers
    tier3ScamIds.forEach((scamId) => {
      expect(scamIdsCovered.has(scamId)).toBe(true);
    });

    // Should have exactly the same scam coverage
    expect(scamIdsCovered.size).toBe(tier3ScamIds.size);
  });

  it('should have positive costs for all managers', () => {
    TIER_3_MANAGERS.forEach((manager) => {
      expect(manager.cost).toBeGreaterThan(0);
    });
  });

  it('should have non-empty flavor text for all managers', () => {
    TIER_3_MANAGERS.forEach((manager) => {
      expect(manager.flavorText).toBeTruthy();
      expect(typeof manager.flavorText).toBe('string');
      expect(manager.flavorText.length).toBeGreaterThan(0);
    });
  });

  it('should have costs that scale (first cost < last cost)', () => {
    const firstManager = TIER_3_MANAGERS[0];
    const lastManager = TIER_3_MANAGERS[TIER_3_MANAGERS.length - 1];

    expect(lastManager.cost).toBeGreaterThan(firstManager.cost);
  });
});
