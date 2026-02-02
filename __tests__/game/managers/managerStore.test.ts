// ABOUTME: Tests for the manager Zustand store slice
// ABOUTME: Validates manager state management, hiring, and prestige reset

import {
  useManagerStore,
  getInitialManagerState,
  createManagerState,
} from '../../../src/game/managers/managerStore';
import { TIER_1_MANAGERS, BOT_3000 } from '../../../src/game/managers/definitions';
import type { ManagerState } from '../../../src/game/managers/types';

describe('ManagerStore', () => {
  // Reset store before each test
  beforeEach(() => {
    useManagerStore.setState(useManagerStore.getInitialState());
  });

  describe('initial state', () => {
    it('should have empty manager map initially', () => {
      const state = useManagerStore.getState();

      expect(Object.keys(state.managers).length).toBe(0);
    });
  });

  describe('getInitialManagerState', () => {
    it('should return empty state by default', () => {
      const state = getInitialManagerState();

      expect(Object.keys(state).length).toBe(0);
    });
  });

  describe('createManagerState', () => {
    it('should create state with isHired false by default', () => {
      const state = createManagerState('bot-3000');

      expect(state.managerId).toBe('bot-3000');
      expect(state.isHired).toBe(false);
    });

    it('should create state with specified hired status', () => {
      const state = createManagerState('bot-3000', true);

      expect(state.isHired).toBe(true);
    });
  });

  describe('hireManager', () => {
    it('should hire a manager successfully', () => {
      const { hireManager } = useManagerStore.getState();

      hireManager('bot-3000');

      const state = useManagerStore.getState().managers['bot-3000'];
      expect(state).toBeDefined();
      expect(state.isHired).toBe(true);
    });

    it('should do nothing if manager already hired', () => {
      const { hireManager } = useManagerStore.getState();

      hireManager('bot-3000');
      hireManager('bot-3000'); // Hire again

      // Should still just be hired (no error, idempotent)
      const state = useManagerStore.getState().managers['bot-3000'];
      expect(state.isHired).toBe(true);
    });

    it('should track multiple managers independently', () => {
      const { hireManager } = useManagerStore.getState();

      hireManager('bot-3000');
      hireManager('prince-okonkwo');

      const bot = useManagerStore.getState().managers['bot-3000'];
      const prince = useManagerStore.getState().managers['prince-okonkwo'];

      expect(bot.isHired).toBe(true);
      expect(prince.isHired).toBe(true);
    });
  });

  describe('isManagerHired', () => {
    it('should return false for manager not yet hired', () => {
      const { isManagerHired } = useManagerStore.getState();

      const hired = isManagerHired('bot-3000');

      expect(hired).toBe(false);
    });

    it('should return true for hired manager', () => {
      const { hireManager, isManagerHired } = useManagerStore.getState();

      hireManager('bot-3000');

      const hired = useManagerStore.getState().isManagerHired('bot-3000');
      expect(hired).toBe(true);
    });

    it('should return false for unknown manager IDs', () => {
      const { isManagerHired } = useManagerStore.getState();

      const hired = isManagerHired('unknown-manager');

      expect(hired).toBe(false);
    });
  });

  describe('getHiredManagers', () => {
    it('should return empty array when no managers hired', () => {
      const { getHiredManagers } = useManagerStore.getState();

      const hired = getHiredManagers();

      expect(hired).toEqual([]);
    });

    it('should return array of hired manager IDs', () => {
      const { hireManager } = useManagerStore.getState();

      hireManager('bot-3000');
      hireManager('prince-okonkwo');

      const hired = useManagerStore.getState().getHiredManagers();

      expect(hired.length).toBe(2);
      expect(hired).toContain('bot-3000');
      expect(hired).toContain('prince-okonkwo');
    });

    it('should not include non-hired managers', () => {
      const { hireManager } = useManagerStore.getState();

      hireManager('bot-3000');
      // Don't hire prince-okonkwo

      const hired = useManagerStore.getState().getHiredManagers();

      expect(hired.length).toBe(1);
      expect(hired).toContain('bot-3000');
      expect(hired).not.toContain('prince-okonkwo');
    });
  });

  describe('isScamManaged', () => {
    it('should return false when scam has no manager hired', () => {
      const { isScamManaged } = useManagerStore.getState();

      const managed = isScamManaged('bot-farms');

      expect(managed).toBe(false);
    });

    it('should return true when scams manager is hired', () => {
      const { hireManager, isScamManaged } = useManagerStore.getState();

      hireManager('bot-3000'); // Manager for bot-farms

      const managed = useManagerStore.getState().isScamManaged('bot-farms');
      expect(managed).toBe(true);
    });

    it('should return false for unknown scam ID', () => {
      const { isScamManaged } = useManagerStore.getState();

      const managed = isScamManaged('unknown-scam');

      expect(managed).toBe(false);
    });
  });

  describe('resetManagers', () => {
    it('should reset all managers to not hired', () => {
      const { hireManager, resetManagers } = useManagerStore.getState();

      // Hire some managers
      hireManager('bot-3000');
      hireManager('prince-okonkwo');
      hireManager('lucky-larry');

      // Verify they were hired
      let state = useManagerStore.getState();
      expect(Object.keys(state.managers).length).toBe(3);

      // Reset
      resetManagers();

      // Verify reset
      state = useManagerStore.getState();
      expect(Object.keys(state.managers).length).toBe(0);
    });

    it('should return false for isManagerHired after reset', () => {
      const { hireManager, resetManagers, isManagerHired } = useManagerStore.getState();

      hireManager('bot-3000');

      // Verify hired before reset
      expect(useManagerStore.getState().isManagerHired('bot-3000')).toBe(true);

      // Reset
      resetManagers();

      // Verify not hired after reset
      expect(useManagerStore.getState().isManagerHired('bot-3000')).toBe(false);
    });

    it('should return empty array for getHiredManagers after reset', () => {
      const { hireManager, resetManagers, getHiredManagers } = useManagerStore.getState();

      hireManager('bot-3000');
      hireManager('prince-okonkwo');

      // Verify hired before reset
      expect(useManagerStore.getState().getHiredManagers().length).toBe(2);

      // Reset
      resetManagers();

      // Verify empty after reset
      expect(useManagerStore.getState().getHiredManagers().length).toBe(0);
    });
  });

  describe('getAllManagerStates', () => {
    it('should return empty array when no managers tracked', () => {
      const { getAllManagerStates } = useManagerStore.getState();

      const states = getAllManagerStates();

      expect(states).toEqual([]);
    });

    it('should return all tracked manager states', () => {
      const { hireManager, getAllManagerStates } = useManagerStore.getState();

      hireManager('bot-3000');
      hireManager('prince-okonkwo');

      const states = useManagerStore.getState().getAllManagerStates();

      expect(states.length).toBe(2);
      expect(states.some((s) => s.managerId === 'bot-3000' && s.isHired)).toBe(true);
      expect(states.some((s) => s.managerId === 'prince-okonkwo' && s.isHired)).toBe(true);
    });
  });

  describe('type safety', () => {
    it('should have proper typing for ManagerState', () => {
      const { hireManager } = useManagerStore.getState();
      hireManager('bot-3000');

      const state: ManagerState = useManagerStore.getState().managers['bot-3000'];

      expect(typeof state.managerId).toBe('string');
      expect(typeof state.isHired).toBe('boolean');
    });
  });

  describe('prestige simulation', () => {
    it('should allow complete rebuild after reset (prestige flow)', () => {
      const store = useManagerStore.getState();

      // Run 1: Hire managers
      store.hireManager('bot-3000');
      store.hireManager('prince-okonkwo');
      expect(useManagerStore.getState().getHiredManagers().length).toBe(2);

      // Prestige: Reset
      useManagerStore.getState().resetManagers();
      expect(useManagerStore.getState().getHiredManagers().length).toBe(0);

      // Run 2: Rehire managers (maybe different ones)
      useManagerStore.getState().hireManager('lucky-larry');
      useManagerStore.getState().hireManager('popup-pete');
      expect(useManagerStore.getState().getHiredManagers().length).toBe(2);
      expect(useManagerStore.getState().isManagerHired('lucky-larry')).toBe(true);
      expect(useManagerStore.getState().isManagerHired('bot-3000')).toBe(false);
    });
  });
});
