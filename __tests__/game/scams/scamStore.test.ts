// ABOUTME: Tests for the scam Zustand store slice
// ABOUTME: Validates scam state management, unlocking, upgrading, and completion tracking

import {
  useScamStore,
  getInitialScamState,
  createScamState,
} from '../../../src/game/scams/scamStore';
import { NIGERIAN_PRINCE_EMAILS, TIER_1_SCAMS } from '../../../src/game/scams/definitions';
import type { ScamState } from '../../../src/game/scams/types';

describe('ScamStore', () => {
  // Reset store before each test
  beforeEach(() => {
    useScamStore.setState(useScamStore.getInitialState());
  });

  describe('initial state', () => {
    it('should have Nigerian Prince Emails unlocked by default (first scam)', () => {
      const state = useScamStore.getState();
      const nigerianPrinceState = state.scams[NIGERIAN_PRINCE_EMAILS.id];

      expect(nigerianPrinceState).toBeDefined();
      expect(nigerianPrinceState.isUnlocked).toBe(true);
    });

    it('should have Nigerian Prince Emails at level 1 initially', () => {
      const state = useScamStore.getState();
      const nigerianPrinceState = state.scams[NIGERIAN_PRINCE_EMAILS.id];

      expect(nigerianPrinceState.level).toBe(1);
    });

    it('should have zero completions initially', () => {
      const state = useScamStore.getState();
      const nigerianPrinceState = state.scams[NIGERIAN_PRINCE_EMAILS.id];

      expect(nigerianPrinceState.timesCompleted).toBe(0);
    });
  });

  describe('getInitialScamState', () => {
    it('should return default state for Nigerian Prince Emails', () => {
      const state = getInitialScamState();

      expect(state[NIGERIAN_PRINCE_EMAILS.id]).toBeDefined();
      expect(state[NIGERIAN_PRINCE_EMAILS.id].scamId).toBe(NIGERIAN_PRINCE_EMAILS.id);
      expect(state[NIGERIAN_PRINCE_EMAILS.id].isUnlocked).toBe(true);
      expect(state[NIGERIAN_PRINCE_EMAILS.id].level).toBe(1);
      expect(state[NIGERIAN_PRINCE_EMAILS.id].timesCompleted).toBe(0);
    });

    it('should initialize all Tier 1 scams', () => {
      const state = getInitialScamState();

      TIER_1_SCAMS.forEach((scam) => {
        expect(state[scam.id]).toBeDefined();
        expect(state[scam.id].scamId).toBe(scam.id);
        expect(state[scam.id].level).toBe(1);
        expect(state[scam.id].timesCompleted).toBe(0);
      });
    });

    it('should have Nigerian Prince unlocked, all other Tier 1 scams locked', () => {
      const state = getInitialScamState();

      TIER_1_SCAMS.forEach((scam) => {
        if (scam.id === NIGERIAN_PRINCE_EMAILS.id) {
          expect(state[scam.id].isUnlocked).toBe(true);
        } else {
          expect(state[scam.id].isUnlocked).toBe(false);
        }
      });
    });
  });

  describe('createScamState', () => {
    it('should create locked state by default', () => {
      const state = createScamState('test-scam');

      expect(state.scamId).toBe('test-scam');
      expect(state.isUnlocked).toBe(false);
      expect(state.level).toBe(1);
      expect(state.timesCompleted).toBe(0);
    });

    it('should create unlocked state when specified', () => {
      const state = createScamState('test-scam', true);

      expect(state.isUnlocked).toBe(true);
    });
  });

  describe('unlockScam', () => {
    it('should unlock a locked scam', () => {
      // First add a locked scam
      useScamStore.setState({
        scams: {
          ...useScamStore.getState().scams,
          'test-scam': createScamState('test-scam'),
        },
      });

      const { unlockScam } = useScamStore.getState();
      unlockScam('test-scam');

      const scamState = useScamStore.getState().scams['test-scam'];
      expect(scamState.isUnlocked).toBe(true);
    });

    it('should not change already unlocked scam', () => {
      const { unlockScam } = useScamStore.getState();

      // Nigerian Prince is already unlocked
      unlockScam(NIGERIAN_PRINCE_EMAILS.id);

      const scamState = useScamStore.getState().scams[NIGERIAN_PRINCE_EMAILS.id];
      expect(scamState.isUnlocked).toBe(true);
      expect(scamState.level).toBe(1);
    });

    it('should handle non-existent scam gracefully', () => {
      const { unlockScam } = useScamStore.getState();

      // Should not throw
      expect(() => unlockScam('non-existent-scam')).not.toThrow();
    });
  });

  describe('upgradeScam', () => {
    it('should increase scam level by 1', () => {
      const { upgradeScam } = useScamStore.getState();

      upgradeScam(NIGERIAN_PRINCE_EMAILS.id);

      const scamState = useScamStore.getState().scams[NIGERIAN_PRINCE_EMAILS.id];
      expect(scamState.level).toBe(2);
    });

    it('should accumulate upgrades', () => {
      const { upgradeScam } = useScamStore.getState();

      upgradeScam(NIGERIAN_PRINCE_EMAILS.id);
      upgradeScam(NIGERIAN_PRINCE_EMAILS.id);
      upgradeScam(NIGERIAN_PRINCE_EMAILS.id);

      const scamState = useScamStore.getState().scams[NIGERIAN_PRINCE_EMAILS.id];
      expect(scamState.level).toBe(4);
    });

    it('should not upgrade locked scams', () => {
      // Add a locked scam
      useScamStore.setState({
        scams: {
          ...useScamStore.getState().scams,
          'locked-scam': createScamState('locked-scam'),
        },
      });

      const { upgradeScam } = useScamStore.getState();
      upgradeScam('locked-scam');

      const scamState = useScamStore.getState().scams['locked-scam'];
      expect(scamState.level).toBe(1); // Should remain at 1
    });

    it('should handle non-existent scam gracefully', () => {
      const { upgradeScam } = useScamStore.getState();

      expect(() => upgradeScam('non-existent-scam')).not.toThrow();
    });
  });

  describe('incrementCompletion', () => {
    it('should increment completion count by 1', () => {
      const { incrementCompletion } = useScamStore.getState();

      incrementCompletion(NIGERIAN_PRINCE_EMAILS.id);

      const scamState = useScamStore.getState().scams[NIGERIAN_PRINCE_EMAILS.id];
      expect(scamState.timesCompleted).toBe(1);
    });

    it('should accumulate completions', () => {
      const { incrementCompletion } = useScamStore.getState();

      for (let i = 0; i < 100; i++) {
        incrementCompletion(NIGERIAN_PRINCE_EMAILS.id);
      }

      const scamState = useScamStore.getState().scams[NIGERIAN_PRINCE_EMAILS.id];
      expect(scamState.timesCompleted).toBe(100);
    });

    it('should not increment for locked scams', () => {
      // Add a locked scam
      useScamStore.setState({
        scams: {
          ...useScamStore.getState().scams,
          'locked-scam': createScamState('locked-scam'),
        },
      });

      const { incrementCompletion } = useScamStore.getState();
      incrementCompletion('locked-scam');

      const scamState = useScamStore.getState().scams['locked-scam'];
      expect(scamState.timesCompleted).toBe(0);
    });

    it('should handle non-existent scam gracefully', () => {
      const { incrementCompletion } = useScamStore.getState();

      expect(() => incrementCompletion('non-existent-scam')).not.toThrow();
    });
  });

  describe('getScamState', () => {
    it('should return scam state by id', () => {
      const { getScamState } = useScamStore.getState();

      const state = getScamState(NIGERIAN_PRINCE_EMAILS.id);

      expect(state).toBeDefined();
      expect(state?.scamId).toBe(NIGERIAN_PRINCE_EMAILS.id);
    });

    it('should return undefined for non-existent scam', () => {
      const { getScamState } = useScamStore.getState();

      const state = getScamState('non-existent-scam');

      expect(state).toBeUndefined();
    });
  });

  describe('resetScams', () => {
    it('should reset all scam state to initial values', () => {
      const { upgradeScam, incrementCompletion, resetScams } =
        useScamStore.getState();

      // Make some progress
      upgradeScam(NIGERIAN_PRINCE_EMAILS.id);
      upgradeScam(NIGERIAN_PRINCE_EMAILS.id);
      incrementCompletion(NIGERIAN_PRINCE_EMAILS.id);
      incrementCompletion(NIGERIAN_PRINCE_EMAILS.id);
      incrementCompletion(NIGERIAN_PRINCE_EMAILS.id);

      // Verify progress
      let state = useScamStore.getState().scams[NIGERIAN_PRINCE_EMAILS.id];
      expect(state.level).toBe(3);
      expect(state.timesCompleted).toBe(3);

      // Reset
      resetScams();

      // Verify reset
      state = useScamStore.getState().scams[NIGERIAN_PRINCE_EMAILS.id];
      expect(state.level).toBe(1);
      expect(state.timesCompleted).toBe(0);
      expect(state.isUnlocked).toBe(true); // Nigerian Prince stays unlocked
    });
  });

  describe('type safety', () => {
    it('should have proper typing for ScamState', () => {
      const state: ScamState = useScamStore.getState().scams[NIGERIAN_PRINCE_EMAILS.id];

      expect(typeof state.scamId).toBe('string');
      expect(typeof state.level).toBe('number');
      expect(typeof state.isUnlocked).toBe('boolean');
      expect(typeof state.timesCompleted).toBe('number');
    });
  });

  describe('hydrate', () => {
    it('should replace all scam state with provided values', () => {
      const { hydrate } = useScamStore.getState();

      const savedScams = {
        'nigerian-prince-emails': {
          scamId: 'nigerian-prince-emails',
          level: 15,
          isUnlocked: true,
          timesCompleted: 500,
        },
        'fake-lottery-winnings': {
          scamId: 'fake-lottery-winnings',
          level: 10,
          isUnlocked: true,
          timesCompleted: 200,
        },
      };

      hydrate(savedScams);

      const scams = useScamStore.getState().scams;
      expect(scams).toEqual(savedScams);
      expect(scams['nigerian-prince-emails'].level).toBe(15);
      expect(scams['fake-lottery-winnings'].timesCompleted).toBe(200);
    });

    it('should overwrite existing state completely', () => {
      const { upgradeScam, hydrate } = useScamStore.getState();

      // Build up some state
      upgradeScam(NIGERIAN_PRINCE_EMAILS.id);
      upgradeScam(NIGERIAN_PRINCE_EMAILS.id);

      // Hydrate should replace it all
      hydrate({
        'nigerian-prince-emails': {
          scamId: 'nigerian-prince-emails',
          level: 42,
          isUnlocked: true,
          timesCompleted: 0,
        },
      });

      expect(useScamStore.getState().scams['nigerian-prince-emails'].level).toBe(42);
      // Original Tier 1 scams should be gone since hydrate replaces entirely
      expect(useScamStore.getState().scams['fake-lottery-winnings']).toBeUndefined();
    });

    it('should preserve action functions after hydration', () => {
      const { hydrate } = useScamStore.getState();

      hydrate({
        'nigerian-prince-emails': {
          scamId: 'nigerian-prince-emails',
          level: 1,
          isUnlocked: true,
          timesCompleted: 0,
        },
      });

      // Actions should still work
      useScamStore.getState().upgradeScam('nigerian-prince-emails');
      expect(useScamStore.getState().scams['nigerian-prince-emails'].level).toBe(2);
    });
  });

  describe('getTotalTier1Levels', () => {
    it('should return 9 initially (9 Tier 1 scams at level 1)', () => {
      const { getTotalTier1Levels } = useScamStore.getState();

      // 9 tier 1 scams x level 1 = 9 total levels
      expect(getTotalTier1Levels()).toBe(9);
    });

    it('should increase when scams are upgraded', () => {
      const { getTotalTier1Levels, upgradeScam } = useScamStore.getState();

      // Nigerian Prince starts unlocked, upgrade it
      upgradeScam('nigerian-prince-emails');
      upgradeScam('nigerian-prince-emails');

      // 9 scams at level 1 + 2 more levels = 11
      expect(getTotalTier1Levels()).toBe(11);
    });

    it('should sum levels from all Tier 1 scams', () => {
      const { getTotalTier1Levels, upgradeScam, unlockScam } = useScamStore.getState();

      // Upgrade Nigerian Prince to level 30 (starts unlocked)
      for (let i = 0; i < 29; i++) {
        upgradeScam('nigerian-prince-emails');
      }

      // Unlock and upgrade Fake Lottery to level 20
      unlockScam('fake-lottery-winnings');
      for (let i = 0; i < 19; i++) {
        upgradeScam('fake-lottery-winnings');
      }

      // Nigerian Prince: 30, Fake Lottery: 20, 7 others: 1 each = 30 + 20 + 7 = 57
      expect(getTotalTier1Levels()).toBe(57);
    });
  });

});
