// ABOUTME: Tests for scam definitions including Bot Farms
// ABOUTME: Validates the first playable scam is correctly configured

import { BOT_FARMS } from '../../../src/game/scams/definitions';
import type { ScamDefinition } from '../../../src/game/scams/types';

describe('Scam Definitions', () => {
  describe('BOT_FARMS', () => {
    it('should be a valid ScamDefinition', () => {
      const definition: ScamDefinition = BOT_FARMS;

      expect(definition).toBeDefined();
      expect(typeof definition.id).toBe('string');
      expect(typeof definition.name).toBe('string');
      expect(typeof definition.tier).toBe('number');
      expect(typeof definition.baseDuration).toBe('number');
      expect(typeof definition.baseReward).toBe('number');
      expect(typeof definition.resourceType).toBe('string');
      expect(typeof definition.description).toBe('string');
    });

    it('should have correct id', () => {
      expect(BOT_FARMS.id).toBe('bot-farms');
    });

    it('should have correct display name', () => {
      expect(BOT_FARMS.name).toBe('Bot Farms');
    });

    it('should be tier 1 (first scam in the game)', () => {
      expect(BOT_FARMS.tier).toBe(1);
    });

    it('should have 1 second base duration (fast for early game feel-good)', () => {
      expect(BOT_FARMS.baseDuration).toBe(1000);
    });

    it('should reward 1 bot per completion (the foundational resource)', () => {
      expect(BOT_FARMS.baseReward).toBe(1);
    });

    it('should produce bots (NOT money - this is special)', () => {
      expect(BOT_FARMS.resourceType).toBe('bots');
    });

    it('should have a thematic description', () => {
      expect(BOT_FARMS.description).toBeTruthy();
      expect(BOT_FARMS.description.length).toBeGreaterThan(0);
    });

    it('should be free to unlock (first scam, no unlock cost)', () => {
      expect(BOT_FARMS.unlockCost).toBeUndefined();
    });

    it('should be the foundational scam that other scams depend on', () => {
      // Bot Farms is special - it generates bots, not money
      // Bots are spent to upgrade other scams
      // This verifies the scam is set up for this purpose
      expect(BOT_FARMS.resourceType).toBe('bots');
      expect(BOT_FARMS.tier).toBe(1);
      expect(BOT_FARMS.unlockCost).toBeUndefined();
    });
  });
});
