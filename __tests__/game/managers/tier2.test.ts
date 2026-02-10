// ABOUTME: Jest tests for Tier 2 manager definitions
// ABOUTME: Validates manager structure, uniqueness, scam mapping, and cost progression

import { TIER_2_MANAGERS } from '../../../src/game/managers/tier2';
import { TIER_2_SCAMS } from '../../../src/game/scams/tier2';

describe('TIER_2_MANAGERS', () => {
  it('should have exactly 10 managers', () => {
    expect(TIER_2_MANAGERS).toHaveLength(10);
  });

  it('should have unique IDs', () => {
    const ids = TIER_2_MANAGERS.map((m) => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(TIER_2_MANAGERS.length);
  });

  it('should have unique names', () => {
    const names = TIER_2_MANAGERS.map((m) => m.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(TIER_2_MANAGERS.length);
  });

  it('should map to all T2 scams (every T2 scam ID appears)', () => {
    const scamIds = TIER_2_SCAMS.map((s) => s.id);
    const managerScamIds = TIER_2_MANAGERS.map((m) => m.scamId);

    scamIds.forEach((scamId) => {
      expect(managerScamIds).toContain(scamId);
    });
  });

  it('should have positive costs', () => {
    TIER_2_MANAGERS.forEach((manager) => {
      expect(manager.cost).toBeGreaterThan(0);
      expect(typeof manager.cost).toBe('number');
    });
  });

  it('should have non-empty flavorText', () => {
    TIER_2_MANAGERS.forEach((manager) => {
      expect(manager.flavorText).toBeTruthy();
      expect(typeof manager.flavorText).toBe('string');
      expect(manager.flavorText.length).toBeGreaterThan(0);
    });
  });

  it('should have scaling costs (first manager cost < last manager cost)', () => {
    const firstManager = TIER_2_MANAGERS[0];
    const lastManager = TIER_2_MANAGERS[TIER_2_MANAGERS.length - 1];
    expect(lastManager.cost).toBeGreaterThan(firstManager.cost);
  });
});
