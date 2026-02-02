// ABOUTME: Tests for the scam Zustand store slice
// ABOUTME: Validates scam state management, unlocking, upgrading, and completion tracking

import {
  useScamStore,
  getInitialScamState,
  createScamState,
} from '../../../src/game/scams/scamStore';
import { BOT_FARMS } from '../../../src/game/scams/definitions';
import type { ScamState } from '../../../src/game/scams/types';

describe('ScamStore', () => {
  // Reset store before each test
  beforeEach(() => {
    useScamStore.setState(useScamStore.getInitialState());
  });

  describe('initial state', () => {
    it('should have Bot Farms unlocked by default (first scam)', () => {
      const state = useScamStore.getState();
      const botFarmsState = state.scams[BOT_FARMS.id];

      expect(botFarmsState).toBeDefined();
      expect(botFarmsState.isUnlocked).toBe(true);
    });

    it('should have Bot Farms at level 1 initially', () => {
      const state = useScamStore.getState();
      const botFarmsState = state.scams[BOT_FARMS.id];

      expect(botFarmsState.level).toBe(1);
    });

    it('should have zero completions initially', () => {
      const state = useScamStore.getState();
      const botFarmsState = state.scams[BOT_FARMS.id];

      expect(botFarmsState.timesCompleted).toBe(0);
    });
  });

  describe('getInitialScamState', () => {
    it('should return default state for Bot Farms', () => {
      const state = getInitialScamState();

      expect(state[BOT_FARMS.id]).toBeDefined();
      expect(state[BOT_FARMS.id].scamId).toBe(BOT_FARMS.id);
      expect(state[BOT_FARMS.id].isUnlocked).toBe(true);
      expect(state[BOT_FARMS.id].level).toBe(1);
      expect(state[BOT_FARMS.id].timesCompleted).toBe(0);
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

      // Bot Farms is already unlocked
      unlockScam(BOT_FARMS.id);

      const scamState = useScamStore.getState().scams[BOT_FARMS.id];
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

      upgradeScam(BOT_FARMS.id);

      const scamState = useScamStore.getState().scams[BOT_FARMS.id];
      expect(scamState.level).toBe(2);
    });

    it('should accumulate upgrades', () => {
      const { upgradeScam } = useScamStore.getState();

      upgradeScam(BOT_FARMS.id);
      upgradeScam(BOT_FARMS.id);
      upgradeScam(BOT_FARMS.id);

      const scamState = useScamStore.getState().scams[BOT_FARMS.id];
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

      incrementCompletion(BOT_FARMS.id);

      const scamState = useScamStore.getState().scams[BOT_FARMS.id];
      expect(scamState.timesCompleted).toBe(1);
    });

    it('should accumulate completions', () => {
      const { incrementCompletion } = useScamStore.getState();

      for (let i = 0; i < 100; i++) {
        incrementCompletion(BOT_FARMS.id);
      }

      const scamState = useScamStore.getState().scams[BOT_FARMS.id];
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

      const state = getScamState(BOT_FARMS.id);

      expect(state).toBeDefined();
      expect(state?.scamId).toBe(BOT_FARMS.id);
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
      upgradeScam(BOT_FARMS.id);
      upgradeScam(BOT_FARMS.id);
      incrementCompletion(BOT_FARMS.id);
      incrementCompletion(BOT_FARMS.id);
      incrementCompletion(BOT_FARMS.id);

      // Verify progress
      let state = useScamStore.getState().scams[BOT_FARMS.id];
      expect(state.level).toBe(3);
      expect(state.timesCompleted).toBe(3);

      // Reset
      resetScams();

      // Verify reset
      state = useScamStore.getState().scams[BOT_FARMS.id];
      expect(state.level).toBe(1);
      expect(state.timesCompleted).toBe(0);
      expect(state.isUnlocked).toBe(true); // Bot Farms stays unlocked
    });
  });

  describe('type safety', () => {
    it('should have proper typing for ScamState', () => {
      const state: ScamState = useScamStore.getState().scams[BOT_FARMS.id];

      expect(typeof state.scamId).toBe('string');
      expect(typeof state.level).toBe('number');
      expect(typeof state.isUnlocked).toBe('boolean');
      expect(typeof state.timesCompleted).toBe('number');
    });
  });
});
