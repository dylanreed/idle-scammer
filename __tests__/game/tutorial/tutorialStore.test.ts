// ABOUTME: Tests for the tutorial Zustand store
// ABOUTME: Validates incrementPrestige, markPrestiged, markSeen, hasSeen, hydrate, reset, and toSaveData

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

    it('should start with prestigeCount as 0', () => {
      expect(useTutorialStore.getState().prestigeCount).toBe(0);
    });

    it('should start with empty seen array', () => {
      expect(useTutorialStore.getState().seen).toEqual([]);
    });
  });

  describe('incrementPrestige', () => {
    it('should increment prestigeCount from 0 to 1 to 2 to 3', () => {
      expect(useTutorialStore.getState().prestigeCount).toBe(0);

      useTutorialStore.getState().incrementPrestige();
      expect(useTutorialStore.getState().prestigeCount).toBe(1);

      useTutorialStore.getState().incrementPrestige();
      expect(useTutorialStore.getState().prestigeCount).toBe(2);

      useTutorialStore.getState().incrementPrestige();
      expect(useTutorialStore.getState().prestigeCount).toBe(3);
    });

    it('should set hasPrestiged to true after first call', () => {
      expect(useTutorialStore.getState().hasPrestiged).toBe(false);
      useTutorialStore.getState().incrementPrestige();
      expect(useTutorialStore.getState().hasPrestiged).toBe(true);
    });

    it('should keep hasPrestiged true across multiple calls', () => {
      useTutorialStore.getState().incrementPrestige();
      useTutorialStore.getState().incrementPrestige();
      useTutorialStore.getState().incrementPrestige();
      expect(useTutorialStore.getState().hasPrestiged).toBe(true);
    });
  });

  describe('markPrestiged', () => {
    it('should set hasPrestiged to true (backward compat)', () => {
      useTutorialStore.getState().markPrestiged();
      expect(useTutorialStore.getState().hasPrestiged).toBe(true);
    });

    it('should increment prestigeCount (delegates to incrementPrestige)', () => {
      useTutorialStore.getState().markPrestiged();
      expect(useTutorialStore.getState().prestigeCount).toBe(1);

      useTutorialStore.getState().markPrestiged();
      expect(useTutorialStore.getState().prestigeCount).toBe(2);
    });

    it('should keep hasPrestiged true when called multiple times', () => {
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
    it('should restore hasPrestiged, prestigeCount, and seen from save data', () => {
      useTutorialStore.getState().hydrate({
        hasPrestiged: true,
        prestigeCount: 3,
        seen: [TUTORIAL_IDS.TRUST_INTRO, TUTORIAL_IDS.BOTS_INTRO],
      });

      expect(useTutorialStore.getState().hasPrestiged).toBe(true);
      expect(useTutorialStore.getState().prestigeCount).toBe(3);
      expect(useTutorialStore.getState().seen).toEqual([
        TUTORIAL_IDS.TRUST_INTRO,
        TUTORIAL_IDS.BOTS_INTRO,
      ]);
    });

    it('should overwrite existing state', () => {
      useTutorialStore.getState().incrementPrestige();
      useTutorialStore.getState().incrementPrestige();
      useTutorialStore.getState().markSeen(TUTORIAL_IDS.SKILL_POINTS_INTRO);

      useTutorialStore.getState().hydrate({
        hasPrestiged: false,
        prestigeCount: 0,
        seen: [],
      });

      expect(useTutorialStore.getState().hasPrestiged).toBe(false);
      expect(useTutorialStore.getState().prestigeCount).toBe(0);
      expect(useTutorialStore.getState().seen).toEqual([]);
    });

    it('should fall back to 1 when prestigeCount missing and hasPrestiged is true', () => {
      // Simulate legacy save data without prestigeCount
      useTutorialStore.getState().hydrate({
        hasPrestiged: true,
        seen: [TUTORIAL_IDS.TRUST_INTRO],
      } as any);

      expect(useTutorialStore.getState().hasPrestiged).toBe(true);
      expect(useTutorialStore.getState().prestigeCount).toBe(1);
    });

    it('should fall back to 0 when prestigeCount missing and hasPrestiged is false', () => {
      // Simulate legacy save data without prestigeCount
      useTutorialStore.getState().hydrate({
        hasPrestiged: false,
        seen: [],
      } as any);

      expect(useTutorialStore.getState().hasPrestiged).toBe(false);
      expect(useTutorialStore.getState().prestigeCount).toBe(0);
    });

    it('should not share reference with input data', () => {
      const inputSeen: string[] = [TUTORIAL_IDS.TRUST_INTRO];
      useTutorialStore.getState().hydrate({
        hasPrestiged: true,
        prestigeCount: 1,
        seen: inputSeen,
      });

      // Mutating input should not affect store
      inputSeen.push(TUTORIAL_IDS.BOTS_INTRO);
      expect(useTutorialStore.getState().seen).toEqual([TUTORIAL_IDS.TRUST_INTRO]);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      useTutorialStore.getState().incrementPrestige();
      useTutorialStore.getState().incrementPrestige();
      useTutorialStore.getState().markSeen(TUTORIAL_IDS.TRUST_INTRO);
      useTutorialStore.getState().markSeen(TUTORIAL_IDS.BOTS_INTRO);

      useTutorialStore.getState().reset();

      expect(useTutorialStore.getState().hasPrestiged).toBe(false);
      expect(useTutorialStore.getState().prestigeCount).toBe(0);
      expect(useTutorialStore.getState().seen).toEqual([]);
    });
  });

  describe('toSaveData', () => {
    it('should return current state as save data', () => {
      useTutorialStore.getState().incrementPrestige();
      useTutorialStore.getState().markSeen(TUTORIAL_IDS.TRUST_INTRO);

      const saveData = useTutorialStore.getState().toSaveData();

      expect(saveData).toEqual({
        hasPrestiged: true,
        prestigeCount: 1,
        seen: [TUTORIAL_IDS.TRUST_INTRO],
      });
    });

    it('should derive hasPrestiged from prestigeCount >= 1', () => {
      useTutorialStore.getState().incrementPrestige();
      useTutorialStore.getState().incrementPrestige();
      useTutorialStore.getState().incrementPrestige();

      const saveData = useTutorialStore.getState().toSaveData();

      expect(saveData.prestigeCount).toBe(3);
      expect(saveData.hasPrestiged).toBe(true);
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
        prestigeCount: 0,
        seen: [],
      });
    });
  });
});
