// ABOUTME: Tests for the tutorial Zustand store
// ABOUTME: Validates markPrestiged, markSeen, hasSeen, hydrate, reset, and toSaveData

import { useTutorialStore } from '../../../src/game/tutorial/tutorialStore';
import { TUTORIAL_IDS } from '../../../src/game/tutorial/types';

describe('Tutorial store', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useTutorialStore.getState().reset();
  });

  describe('initial state', () => {
    it('should start with hasPrestiged as false', () => {
      expect(useTutorialStore.getState().hasPrestiged).toBe(false);
    });

    it('should start with empty seen array', () => {
      expect(useTutorialStore.getState().seen).toEqual([]);
    });
  });

  describe('markPrestiged', () => {
    it('should set hasPrestiged to true', () => {
      useTutorialStore.getState().markPrestiged();
      expect(useTutorialStore.getState().hasPrestiged).toBe(true);
    });

    it('should stay true when called multiple times', () => {
      useTutorialStore.getState().markPrestiged();
      useTutorialStore.getState().markPrestiged();
      expect(useTutorialStore.getState().hasPrestiged).toBe(true);
    });
  });

  describe('markSeen', () => {
    it('should add a tutorial ID to the seen array', () => {
      useTutorialStore.getState().markSeen(TUTORIAL_IDS.TRUST_INTRO);
      expect(useTutorialStore.getState().seen).toEqual([TUTORIAL_IDS.TRUST_INTRO]);
    });

    it('should not add duplicates', () => {
      useTutorialStore.getState().markSeen(TUTORIAL_IDS.TRUST_INTRO);
      useTutorialStore.getState().markSeen(TUTORIAL_IDS.TRUST_INTRO);
      expect(useTutorialStore.getState().seen).toEqual([TUTORIAL_IDS.TRUST_INTRO]);
    });

    it('should accumulate multiple different IDs', () => {
      useTutorialStore.getState().markSeen(TUTORIAL_IDS.TRUST_INTRO);
      useTutorialStore.getState().markSeen(TUTORIAL_IDS.BOTS_INTRO);
      useTutorialStore.getState().markSeen(TUTORIAL_IDS.SKILL_POINTS_INTRO);
      expect(useTutorialStore.getState().seen).toEqual([
        TUTORIAL_IDS.TRUST_INTRO,
        TUTORIAL_IDS.BOTS_INTRO,
        TUTORIAL_IDS.SKILL_POINTS_INTRO,
      ]);
    });
  });

  describe('hasSeen', () => {
    it('should return false for unseen tutorial', () => {
      expect(useTutorialStore.getState().hasSeen(TUTORIAL_IDS.TRUST_INTRO)).toBe(false);
    });

    it('should return true after marking as seen', () => {
      useTutorialStore.getState().markSeen(TUTORIAL_IDS.TRUST_INTRO);
      expect(useTutorialStore.getState().hasSeen(TUTORIAL_IDS.TRUST_INTRO)).toBe(true);
    });

    it('should return false for unseen IDs when others are seen', () => {
      useTutorialStore.getState().markSeen(TUTORIAL_IDS.TRUST_INTRO);
      expect(useTutorialStore.getState().hasSeen(TUTORIAL_IDS.BOTS_INTRO)).toBe(false);
    });
  });

  describe('hydrate', () => {
    it('should restore hasPrestiged and seen from save data', () => {
      useTutorialStore.getState().hydrate({
        hasPrestiged: true,
        seen: [TUTORIAL_IDS.TRUST_INTRO, TUTORIAL_IDS.BOTS_INTRO],
      });

      expect(useTutorialStore.getState().hasPrestiged).toBe(true);
      expect(useTutorialStore.getState().seen).toEqual([
        TUTORIAL_IDS.TRUST_INTRO,
        TUTORIAL_IDS.BOTS_INTRO,
      ]);
    });

    it('should overwrite existing state', () => {
      useTutorialStore.getState().markPrestiged();
      useTutorialStore.getState().markSeen(TUTORIAL_IDS.SKILL_POINTS_INTRO);

      useTutorialStore.getState().hydrate({
        hasPrestiged: false,
        seen: [],
      });

      expect(useTutorialStore.getState().hasPrestiged).toBe(false);
      expect(useTutorialStore.getState().seen).toEqual([]);
    });

    it('should not share reference with input data', () => {
      const inputSeen: string[] = [TUTORIAL_IDS.TRUST_INTRO];
      useTutorialStore.getState().hydrate({
        hasPrestiged: true,
        seen: inputSeen,
      });

      // Mutating input should not affect store
      inputSeen.push(TUTORIAL_IDS.BOTS_INTRO);
      expect(useTutorialStore.getState().seen).toEqual([TUTORIAL_IDS.TRUST_INTRO]);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      useTutorialStore.getState().markPrestiged();
      useTutorialStore.getState().markSeen(TUTORIAL_IDS.TRUST_INTRO);
      useTutorialStore.getState().markSeen(TUTORIAL_IDS.BOTS_INTRO);

      useTutorialStore.getState().reset();

      expect(useTutorialStore.getState().hasPrestiged).toBe(false);
      expect(useTutorialStore.getState().seen).toEqual([]);
    });
  });

  describe('toSaveData', () => {
    it('should return current state as save data', () => {
      useTutorialStore.getState().markPrestiged();
      useTutorialStore.getState().markSeen(TUTORIAL_IDS.TRUST_INTRO);

      const saveData = useTutorialStore.getState().toSaveData();

      expect(saveData).toEqual({
        hasPrestiged: true,
        seen: [TUTORIAL_IDS.TRUST_INTRO],
      });
    });

    it('should return a copy (not a reference to internal state)', () => {
      useTutorialStore.getState().markSeen(TUTORIAL_IDS.TRUST_INTRO);

      const saveData = useTutorialStore.getState().toSaveData();
      saveData.seen.push(TUTORIAL_IDS.BOTS_INTRO);

      // Internal state should not be affected
      expect(useTutorialStore.getState().seen).toEqual([TUTORIAL_IDS.TRUST_INTRO]);
    });

    it('should return default state for fresh store', () => {
      const saveData = useTutorialStore.getState().toSaveData();

      expect(saveData).toEqual({
        hasPrestiged: false,
        seen: [],
      });
    });
  });
});
