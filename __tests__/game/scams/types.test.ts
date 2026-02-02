// ABOUTME: Tests for scam-related TypeScript types
// ABOUTME: Validates ScamDefinition, ScamState, and ScamTier type structures

import type {
  ScamDefinition,
  ScamState,
  ScamTier,
  ResourceType,
} from '../../../src/game/scams/types';

describe('Scam Types', () => {
  describe('ScamTier', () => {
    it('should accept valid tier values 1-5', () => {
      const validTiers: ScamTier[] = [1, 2, 3, 4, 5];

      expect(validTiers).toHaveLength(5);
      validTiers.forEach((tier) => {
        expect(tier).toBeGreaterThanOrEqual(1);
        expect(tier).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('ResourceType', () => {
    it('should accept valid resource types', () => {
      const validTypes: ResourceType[] = ['money', 'bots', 'reputation', 'crypto'];

      expect(validTypes).toContain('money');
      expect(validTypes).toContain('bots');
      expect(validTypes).toContain('reputation');
      expect(validTypes).toContain('crypto');
    });
  });

  describe('ScamDefinition', () => {
    it('should properly structure a scam definition with required fields', () => {
      const definition: ScamDefinition = {
        id: 'test-scam',
        name: 'Test Scam',
        tier: 1,
        baseDuration: 1000,
        baseReward: 10,
        resourceType: 'money',
        description: 'A test scam for validation',
      };

      expect(definition.id).toBe('test-scam');
      expect(definition.name).toBe('Test Scam');
      expect(definition.tier).toBe(1);
      expect(definition.baseDuration).toBe(1000);
      expect(definition.baseReward).toBe(10);
      expect(definition.resourceType).toBe('money');
      expect(definition.description).toBe('A test scam for validation');
    });

    it('should allow optional unlockCost field', () => {
      const freeScam: ScamDefinition = {
        id: 'free-scam',
        name: 'Free Scam',
        tier: 1,
        baseDuration: 1000,
        baseReward: 10,
        resourceType: 'money',
        description: 'A free scam',
      };

      const paidScam: ScamDefinition = {
        id: 'paid-scam',
        name: 'Paid Scam',
        tier: 2,
        baseDuration: 2000,
        baseReward: 50,
        resourceType: 'money',
        description: 'A scam that costs to unlock',
        unlockCost: 500,
      };

      expect(freeScam.unlockCost).toBeUndefined();
      expect(paidScam.unlockCost).toBe(500);
    });

    it('should support bot resource type for Bot Farms', () => {
      const botFarm: ScamDefinition = {
        id: 'bot-farms',
        name: 'Bot Farms',
        tier: 1,
        baseDuration: 1000,
        baseReward: 1,
        resourceType: 'bots',
        description: 'Deploy autonomous bots',
      };

      expect(botFarm.resourceType).toBe('bots');
    });
  });

  describe('ScamState', () => {
    it('should track scam progress with required fields', () => {
      const state: ScamState = {
        scamId: 'test-scam',
        level: 1,
        isUnlocked: true,
        timesCompleted: 0,
      };

      expect(state.scamId).toBe('test-scam');
      expect(state.level).toBe(1);
      expect(state.isUnlocked).toBe(true);
      expect(state.timesCompleted).toBe(0);
    });

    it('should support unlocked state variations', () => {
      const unlockedState: ScamState = {
        scamId: 'scam-1',
        level: 5,
        isUnlocked: true,
        timesCompleted: 100,
      };

      const lockedState: ScamState = {
        scamId: 'scam-2',
        level: 1,
        isUnlocked: false,
        timesCompleted: 0,
      };

      expect(unlockedState.isUnlocked).toBe(true);
      expect(unlockedState.level).toBe(5);
      expect(unlockedState.timesCompleted).toBe(100);

      expect(lockedState.isUnlocked).toBe(false);
      expect(lockedState.level).toBe(1);
      expect(lockedState.timesCompleted).toBe(0);
    });

    it('should track completion count for statistics', () => {
      const state: ScamState = {
        scamId: 'tracked-scam',
        level: 3,
        isUnlocked: true,
        timesCompleted: 1337,
      };

      expect(state.timesCompleted).toBe(1337);
    });
  });
});
