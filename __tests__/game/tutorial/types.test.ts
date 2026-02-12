// ABOUTME: Tests for tutorial type definitions and constants
// ABOUTME: Validates tutorial IDs, sequence order, and default save data

import {
  TUTORIAL_IDS,
  TUTORIAL_SEQUENCE,
  DEFAULT_TUTORIAL_SAVE_DATA,
} from '../../../src/game/tutorial/types';

describe('Tutorial types', () => {
  describe('TUTORIAL_IDS', () => {
    it('should define trust intro ID', () => {
      expect(TUTORIAL_IDS.TRUST_INTRO).toBe('trust-intro');
    });

    it('should define bots intro ID', () => {
      expect(TUTORIAL_IDS.BOTS_INTRO).toBe('bots-intro');
    });

    it('should define skill points intro ID', () => {
      expect(TUTORIAL_IDS.SKILL_POINTS_INTRO).toBe('skill-points-intro');
    });

    it('should define crypto intro ID', () => {
      expect(TUTORIAL_IDS.CRYPTO_INTRO).toBe('crypto-intro');
    });

    it('should have exactly 4 tutorial IDs', () => {
      expect(Object.keys(TUTORIAL_IDS)).toHaveLength(4);
    });
  });

  describe('TUTORIAL_SEQUENCE', () => {
    it('should have 3 items in the correct order', () => {
      expect(TUTORIAL_SEQUENCE).toHaveLength(3);
      expect(TUTORIAL_SEQUENCE[0]).toBe(TUTORIAL_IDS.TRUST_INTRO);
      expect(TUTORIAL_SEQUENCE[1]).toBe(TUTORIAL_IDS.BOTS_INTRO);
      expect(TUTORIAL_SEQUENCE[2]).toBe(TUTORIAL_IDS.SKILL_POINTS_INTRO);
    });
  });

  describe('DEFAULT_TUTORIAL_SAVE_DATA', () => {
    it('should have hasPrestiged as false', () => {
      expect(DEFAULT_TUTORIAL_SAVE_DATA.hasPrestiged).toBe(false);
    });

    it('should have empty seen array', () => {
      expect(DEFAULT_TUTORIAL_SAVE_DATA.seen).toEqual([]);
    });
  });
});
