// ABOUTME: Jest tests for Tier 5 manager definitions
// ABOUTME: Validates structure, mappings, and costs for all Tier 5 managers

import { TIER_5_MANAGERS } from '../../../src/game/managers/tier5';
import { TIER_5_SCAMS } from '../../../src/game/scams/tier5';

describe('Tier 5 Managers', () => {
  test('should have exactly 10 managers', () => {
    expect(TIER_5_MANAGERS).toHaveLength(10);
  });

  test('all managers should have unique IDs', () => {
    const ids = TIER_5_MANAGERS.map((mgr) => mgr.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(TIER_5_MANAGERS.length);
  });

  test('all managers should have unique names', () => {
    const names = TIER_5_MANAGERS.map((mgr) => mgr.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(TIER_5_MANAGERS.length);
  });

  test('each manager should map to a valid T5 scam', () => {
    const scamIds = new Set(TIER_5_SCAMS.map((scam) => scam.id));

    TIER_5_MANAGERS.forEach((manager) => {
      expect(scamIds.has(manager.scamId)).toBe(true);
    });
  });

  test('every T5 scam should have at least one manager', () => {
    const managerScamIds = new Set(TIER_5_MANAGERS.map((mgr) => mgr.scamId));

    TIER_5_SCAMS.forEach((scam) => {
      expect(managerScamIds.has(scam.id)).toBe(true);
    });
  });

  test('all managers should have positive costs', () => {
    TIER_5_MANAGERS.forEach((manager) => {
      expect(manager.cost).toBeGreaterThan(0);
    });
  });

  test('all managers should have non-empty flavorText', () => {
    TIER_5_MANAGERS.forEach((manager) => {
      expect(manager.flavorText).toBeTruthy();
      expect(manager.flavorText.length).toBeGreaterThan(0);
    });
  });

  test('first manager cost should be less than last manager cost', () => {
    const firstCost = TIER_5_MANAGERS[0].cost;
    const lastCost = TIER_5_MANAGERS[TIER_5_MANAGERS.length - 1].cost;
    expect(lastCost).toBeGreaterThan(firstCost);
  });
});
