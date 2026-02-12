// ABOUTME: Tests for tutorial type definitions and constants
// ABOUTME: Validates tutorial IDs, prestige sequences, deprecated alias, and default save data

import {
  TUTORIAL_IDS,
  TUTORIAL_SEQUENCE,
  PRESTIGE_TUTORIAL_SEQUENCES,
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

    it('should define skill abilities intro ID', () => {
      expect(TUTORIAL_IDS.SKILL_ABILITIES_INTRO).toBe('skill-abilities-intro');
    });

    it('should define passive skills intro ID', () => {
      expect(TUTORIAL_IDS.PASSIVE_SKILLS_INTRO).toBe('passive-skills-intro');
    });

    it('should have exactly 6 tutorial IDs', () => {
      expect(Object.keys(TUTORIAL_IDS)).toHaveLength(6);
    });
  });

  describe('PRESTIGE_TUTORIAL_SEQUENCES', () => {
    it('should have sequences for prestige counts 1, 2, and 3', () => {
      expect(Object.keys(PRESTIGE_TUTORIAL_SEQUENCES).map(Number)).toEqual(
        expect.arrayContaining([1, 2, 3])
      );
      expect(Object.keys(PRESTIGE_TUTORIAL_SEQUENCES)).toHaveLength(3);
    });

    it('should have trust and bots intros for prestige 1', () => {
      expect(PRESTIGE_TUTORIAL_SEQUENCES[1]).toHaveLength(2);
      expect(PRESTIGE_TUTORIAL_SEQUENCES[1][0]).toBe(TUTORIAL_IDS.TRUST_INTRO);
      expect(PRESTIGE_TUTORIAL_SEQUENCES[1][1]).toBe(TUTORIAL_IDS.BOTS_INTRO);
    });

    it('should have skill abilities intro for prestige 2', () => {
      expect(PRESTIGE_TUTORIAL_SEQUENCES[2]).toHaveLength(1);
      expect(PRESTIGE_TUTORIAL_SEQUENCES[2][0]).toBe(
        TUTORIAL_IDS.SKILL_ABILITIES_INTRO
      );
    });

    it('should have passive skills intro for prestige 3', () => {
      expect(PRESTIGE_TUTORIAL_SEQUENCES[3]).toHaveLength(1);
      expect(PRESTIGE_TUTORIAL_SEQUENCES[3][0]).toBe(
        TUTORIAL_IDS.PASSIVE_SKILLS_INTRO
      );
    });
  });

  describe('TUTORIAL_SEQUENCE (deprecated alias)', () => {
    it('should be the same reference as PRESTIGE_TUTORIAL_SEQUENCES[1]', () => {
      expect(TUTORIAL_SEQUENCE).toBe(PRESTIGE_TUTORIAL_SEQUENCES[1]);
    });

    it('should have 2 items in the correct order', () => {
      expect(TUTORIAL_SEQUENCE).toHaveLength(2);
      expect(TUTORIAL_SEQUENCE[0]).toBe(TUTORIAL_IDS.TRUST_INTRO);
      expect(TUTORIAL_SEQUENCE[1]).toBe(TUTORIAL_IDS.BOTS_INTRO);
    });
  });

  describe('DEFAULT_TUTORIAL_SAVE_DATA', () => {
    it('should have hasPrestiged as false', () => {
      expect(DEFAULT_TUTORIAL_SAVE_DATA.hasPrestiged).toBe(false);
    });

    it('should have empty seen array', () => {
      expect(DEFAULT_TUTORIAL_SAVE_DATA.seen).toEqual([]);
    });

    it('should have prestigeCount as 0', () => {
      expect(DEFAULT_TUTORIAL_SAVE_DATA.prestigeCount).toBe(0);
    });
  });
});
