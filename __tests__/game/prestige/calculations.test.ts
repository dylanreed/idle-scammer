// ABOUTME: Tests for prestige calculation functions
// ABOUTME: Covers heat generation, prestige trigger, and escape result calculations

import {
  calculateHeatFromScam,
  isPrestigeForced,
  calculateCleanEscapeResult,
  calculateSnitchResult,
} from '../../../src/game/prestige/calculations';
import { MAX_HEAT, CLEAN_ESCAPE_TRUST_GAIN, SNITCH_TRUST_PENALTY, SNITCH_RESOURCE_KEEP_PERCENT } from '../../../src/game/prestige/constants';
import type { ScamDefinition } from '../../../src/game/scams/types';
import type { GameResources } from '../../../src/game/types';

describe('Prestige Calculations', () => {
  describe('calculateHeatFromScam', () => {
    it('should return 0.5 heat for tier 1 scams', () => {
      const tier1Scam: ScamDefinition = {
        id: 'test-scam',
        name: 'Test Scam',
        tier: 1,
        baseDuration: 1000,
        baseReward: 10,
        resourceType: 'money',
        description: 'A test scam',
      };

      expect(calculateHeatFromScam(tier1Scam)).toBe(0.5);
    });

    it('should return 1 heat for tier 2 scams', () => {
      const tier2Scam: ScamDefinition = {
        id: 'test-scam',
        name: 'Test Scam',
        tier: 2,
        baseDuration: 1000,
        baseReward: 10,
        resourceType: 'money',
        description: 'A test scam',
      };

      expect(calculateHeatFromScam(tier2Scam)).toBe(1);
    });

    it('should return 2 heat for tier 3 scams', () => {
      const tier3Scam: ScamDefinition = {
        id: 'test-scam',
        name: 'Test Scam',
        tier: 3,
        baseDuration: 1000,
        baseReward: 10,
        resourceType: 'money',
        description: 'A test scam',
      };

      expect(calculateHeatFromScam(tier3Scam)).toBe(2);
    });

    it('should return 3 heat for tier 4 scams', () => {
      const tier4Scam: ScamDefinition = {
        id: 'test-scam',
        name: 'Test Scam',
        tier: 4,
        baseDuration: 1000,
        baseReward: 10,
        resourceType: 'money',
        description: 'A test scam',
      };

      expect(calculateHeatFromScam(tier4Scam)).toBe(3);
    });

    it('should return 5 heat for tier 5 scams', () => {
      const tier5Scam: ScamDefinition = {
        id: 'test-scam',
        name: 'Test Scam',
        tier: 5,
        baseDuration: 1000,
        baseReward: 10,
        resourceType: 'money',
        description: 'A test scam',
      };

      expect(calculateHeatFromScam(tier5Scam)).toBe(5);
    });
  });

  describe('isPrestigeForced', () => {
    it('should return false when heat is 0', () => {
      expect(isPrestigeForced(0)).toBe(false);
    });

    it('should return false when heat is below MAX_HEAT', () => {
      expect(isPrestigeForced(50)).toBe(false);
      expect(isPrestigeForced(99)).toBe(false);
      expect(isPrestigeForced(99.9)).toBe(false);
    });

    it('should return true when heat equals MAX_HEAT', () => {
      expect(isPrestigeForced(MAX_HEAT)).toBe(true);
    });

    it('should return true when heat exceeds MAX_HEAT', () => {
      expect(isPrestigeForced(101)).toBe(true);
      expect(isPrestigeForced(150)).toBe(true);
    });
  });

  describe('calculateCleanEscapeResult', () => {
    it('should return trust gain from clean escape', () => {
      const currentTrust = 50;
      const result = calculateCleanEscapeResult(currentTrust);

      expect(result.choice).toBe('clean-escape');
      expect(result.previousTrust).toBe(50);
      expect(result.newTrust).toBe(50 + CLEAN_ESCAPE_TRUST_GAIN);
      expect(result.bonuses).toBeUndefined();
    });

    it('should work with initial trust of 1', () => {
      const result = calculateCleanEscapeResult(1);

      expect(result.previousTrust).toBe(1);
      expect(result.newTrust).toBe(1 + CLEAN_ESCAPE_TRUST_GAIN);
    });

    it('should work with high trust values', () => {
      const result = calculateCleanEscapeResult(1000);

      expect(result.previousTrust).toBe(1000);
      expect(result.newTrust).toBe(1000 + CLEAN_ESCAPE_TRUST_GAIN);
    });
  });

  describe('calculateSnitchResult', () => {
    const makeResources = (overrides: Partial<GameResources> = {}): GameResources => ({
      money: 0,
      reputation: 0,
      heat: 0,
      bots: 0,
      skillPoints: 0,
      crypto: 0,
      trust: 1,
      ...overrides,
    });

    it('should return trust penalty from snitching', () => {
      const resources = makeResources({ money: 10000, trust: 50 });
      const result = calculateSnitchResult(50, resources);

      expect(result.choice).toBe('snitch');
      expect(result.previousTrust).toBe(50);
      expect(result.newTrust).toBe(50 + SNITCH_TRUST_PENALTY); // 50 - 5 = 45
    });

    it('should not reduce trust below 1', () => {
      const resources = makeResources({ money: 10000, trust: 2 });
      const result = calculateSnitchResult(2, resources);

      // 2 - 5 = -3, but should be clamped to 1
      expect(result.newTrust).toBe(1);
    });

    it('should keep 10% of money as bonus', () => {
      const resources = makeResources({ money: 10000 });
      const result = calculateSnitchResult(50, resources);

      const moneyBonus = result.bonuses?.find((b) => b.type === 'money');
      expect(moneyBonus).toBeDefined();
      expect(moneyBonus!.amount).toBe(10000 * SNITCH_RESOURCE_KEEP_PERCENT);
    });

    it('should keep 10% of bots as bonus', () => {
      const resources = makeResources({ bots: 500 });
      const result = calculateSnitchResult(50, resources);

      const botsBonus = result.bonuses?.find((b) => b.type === 'bots');
      expect(botsBonus).toBeDefined();
      expect(botsBonus!.amount).toBe(500 * SNITCH_RESOURCE_KEEP_PERCENT);
    });

    it('should keep 10% of reputation as bonus', () => {
      const resources = makeResources({ reputation: 200 });
      const result = calculateSnitchResult(50, resources);

      const repBonus = result.bonuses?.find((b) => b.type === 'reputation');
      expect(repBonus).toBeDefined();
      expect(repBonus!.amount).toBe(200 * SNITCH_RESOURCE_KEEP_PERCENT);
    });

    it('should keep 10% of crypto as bonus', () => {
      const resources = makeResources({ crypto: 100 });
      const result = calculateSnitchResult(50, resources);

      const cryptoBonus = result.bonuses?.find((b) => b.type === 'crypto');
      expect(cryptoBonus).toBeDefined();
      expect(cryptoBonus!.amount).toBe(100 * SNITCH_RESOURCE_KEEP_PERCENT);
    });

    it('should keep 10% of skill points as bonus', () => {
      const resources = makeResources({ skillPoints: 30 });
      const result = calculateSnitchResult(50, resources);

      const spBonus = result.bonuses?.find((b) => b.type === 'skill-points');
      expect(spBonus).toBeDefined();
      expect(spBonus!.amount).toBe(30 * SNITCH_RESOURCE_KEEP_PERCENT);
    });

    it('should not include bonus for resources with 0 amount', () => {
      const resources = makeResources({ money: 1000, bots: 0 });
      const result = calculateSnitchResult(50, resources);

      const botsBonus = result.bonuses?.find((b) => b.type === 'bots');
      expect(botsBonus).toBeUndefined();
    });

    it('should floor decimal bonus amounts for integer resources', () => {
      // 33 * 0.1 = 3.3, should floor to 3 for skill points
      const resources = makeResources({ skillPoints: 33 });
      const result = calculateSnitchResult(50, resources);

      const spBonus = result.bonuses?.find((b) => b.type === 'skill-points');
      expect(spBonus!.amount).toBe(3);
    });

    it('should keep decimal amounts for crypto', () => {
      // 15.5 * 0.1 = 1.55
      const resources = makeResources({ crypto: 15.5 });
      const result = calculateSnitchResult(50, resources);

      const cryptoBonus = result.bonuses?.find((b) => b.type === 'crypto');
      expect(cryptoBonus!.amount).toBeCloseTo(1.55);
    });

    it('should calculate all bonuses for full resources', () => {
      const resources = makeResources({
        money: 10000,
        bots: 500,
        reputation: 200,
        crypto: 100,
        skillPoints: 30,
      });
      const result = calculateSnitchResult(50, resources);

      expect(result.bonuses).toHaveLength(5);
    });
  });
});
