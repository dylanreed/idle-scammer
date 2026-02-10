// ABOUTME: Tests for the main game Zustand store
// ABOUTME: Covers initial state, resource actions, and prestige reset logic

import { useGameStore, getInitialResources, STARTING_MONEY } from '../../src/game/store';
import type { GameResources } from '../../src/game/types';

describe('GameStore', () => {
  // Reset store before each test to ensure clean state
  beforeEach(() => {
    useGameStore.setState(useGameStore.getInitialState());
  });

  describe('initial state', () => {
    it('should have all resources initialized correctly (trust starts at 1, money starts with seed)', () => {
      const state = useGameStore.getState();
      const resources = state.resources;

      expect(resources.money).toBe(STARTING_MONEY);
      expect(resources.reputation).toBe(0);
      expect(resources.heat).toBe(0);
      expect(resources.bots).toBe(0);
      expect(resources.skillPoints).toBe(0);
      expect(resources.crypto).toBe(0);
      expect(resources.trust).toBe(1);
    });

    it('should export getInitialResources helper with trust at 1 and seed money', () => {
      const initial = getInitialResources();

      expect(initial.money).toBe(STARTING_MONEY);
      expect(initial.reputation).toBe(0);
      expect(initial.heat).toBe(0);
      expect(initial.bots).toBe(0);
      expect(initial.skillPoints).toBe(0);
      expect(initial.crypto).toBe(0);
      expect(initial.trust).toBe(1);
    });
  });

  describe('addMoney', () => {
    it('should increase money by specified amount', () => {
      const { addMoney } = useGameStore.getState();

      addMoney(100);

      expect(useGameStore.getState().resources.money).toBe(STARTING_MONEY + 100);
    });

    it('should accumulate multiple additions', () => {
      const { addMoney } = useGameStore.getState();

      addMoney(50);
      addMoney(75);

      expect(useGameStore.getState().resources.money).toBe(STARTING_MONEY + 125);
    });

    it('should handle negative amounts (spending)', () => {
      const { addMoney } = useGameStore.getState();

      addMoney(100);
      addMoney(-30);

      expect(useGameStore.getState().resources.money).toBe(STARTING_MONEY + 70);
    });
  });

  describe('addReputation', () => {
    it('should increase reputation by specified amount', () => {
      const { addReputation } = useGameStore.getState();

      addReputation(10);

      expect(useGameStore.getState().resources.reputation).toBe(10);
    });

    it('should accumulate reputation', () => {
      const { addReputation } = useGameStore.getState();

      addReputation(5);
      addReputation(15);

      expect(useGameStore.getState().resources.reputation).toBe(20);
    });
  });

  describe('addHeat', () => {
    it('should increase heat by specified amount', () => {
      const { addHeat } = useGameStore.getState();

      addHeat(25);

      expect(useGameStore.getState().resources.heat).toBe(25);
    });

    it('should handle heat reduction (bribes, abilities)', () => {
      const { addHeat } = useGameStore.getState();

      addHeat(100);
      addHeat(-40);

      expect(useGameStore.getState().resources.heat).toBe(60);
    });
  });

  describe('addBots', () => {
    it('should increase bots by specified amount', () => {
      const { addBots } = useGameStore.getState();

      addBots(1000);

      expect(useGameStore.getState().resources.bots).toBe(1000);
    });

    it('should handle spending bots', () => {
      const { addBots } = useGameStore.getState();

      addBots(500);
      addBots(-200);

      expect(useGameStore.getState().resources.bots).toBe(300);
    });
  });

  describe('addSkillPoints', () => {
    it('should increase skill points by specified amount', () => {
      const { addSkillPoints } = useGameStore.getState();

      addSkillPoints(5);

      expect(useGameStore.getState().resources.skillPoints).toBe(5);
    });

    it('should handle spending skill points', () => {
      const { addSkillPoints } = useGameStore.getState();

      addSkillPoints(10);
      addSkillPoints(-3);

      expect(useGameStore.getState().resources.skillPoints).toBe(7);
    });
  });

  describe('addCrypto', () => {
    it('should increase crypto by specified amount', () => {
      const { addCrypto } = useGameStore.getState();

      addCrypto(1.5);

      expect(useGameStore.getState().resources.crypto).toBe(1.5);
    });

    it('should handle decimal amounts (volatile currency)', () => {
      const { addCrypto } = useGameStore.getState();

      addCrypto(0.5);
      addCrypto(0.333);

      expect(useGameStore.getState().resources.crypto).toBeCloseTo(0.833);
    });
  });

  describe('addTrust', () => {
    it('should increase trust by specified amount', () => {
      const { addTrust } = useGameStore.getState();

      addTrust(10);

      // Trust starts at 1, so 1 + 10 = 11
      expect(useGameStore.getState().resources.trust).toBe(11);
    });

    it('should handle trust reduction (snitching penalty)', () => {
      const { addTrust } = useGameStore.getState();

      addTrust(100);
      addTrust(-25);

      // Trust starts at 1, so 1 + 100 - 25 = 76
      expect(useGameStore.getState().resources.trust).toBe(76);
    });
  });

  describe('setResource', () => {
    it('should set a specific resource to exact value', () => {
      const { setResource } = useGameStore.getState();

      setResource('money', 999);

      expect(useGameStore.getState().resources.money).toBe(999);
    });

    it('should work for any resource type', () => {
      const { setResource } = useGameStore.getState();

      setResource('heat', 50);
      setResource('bots', 1000);
      setResource('trust', 42);

      const resources = useGameStore.getState().resources;
      expect(resources.heat).toBe(50);
      expect(resources.bots).toBe(1000);
      expect(resources.trust).toBe(42);
    });
  });

  describe('prestigeReset', () => {
    it('should reset all resources except trust', () => {
      // Set up a state with resources
      useGameStore.setState({
        resources: {
          money: 10000,
          reputation: 500,
          heat: 100,
          bots: 5000,
          skillPoints: 50,
          crypto: 2.5,
          trust: 75,
          snitchCount: 0,
        },
      });

      const { prestigeReset } = useGameStore.getState();
      prestigeReset();

      const resources = useGameStore.getState().resources;

      // These should be reset to initial values
      expect(resources.money).toBe(STARTING_MONEY);
      expect(resources.reputation).toBe(0);
      expect(resources.heat).toBe(0);
      expect(resources.crypto).toBe(0);

      // Bots should be preserved across prestige
      expect(resources.bots).toBe(5000);

      // Trust should be preserved
      expect(resources.trust).toBe(75);

      // snitchCount should be preserved
      expect(resources.snitchCount).toBe(0);

      // Skill points should be set based on trust: floor(75 - 1) = 74
      expect(resources.skillPoints).toBe(Math.floor(75 - 1));
    });

    it('should preserve trust across multiple prestiges', () => {
      const { addTrust, addMoney, prestigeReset } = useGameStore.getState();

      // First run - earn some trust (starts at 1)
      addMoney(1000);
      addTrust(10);
      prestigeReset();

      // Trust: 1 (base) + 10 = 11
      expect(useGameStore.getState().resources.trust).toBe(11);
      expect(useGameStore.getState().resources.money).toBe(STARTING_MONEY);

      // Second run - earn more trust
      useGameStore.getState().addMoney(2000);
      useGameStore.getState().addTrust(15);
      useGameStore.getState().prestigeReset();

      // Trust: 11 + 15 = 26
      expect(useGameStore.getState().resources.trust).toBe(26);
      expect(useGameStore.getState().resources.money).toBe(STARTING_MONEY);
    });

    it('should allow trust to be modified during prestige (snitching)', () => {
      useGameStore.setState({
        resources: {
          money: 10000,
          reputation: 500,
          heat: 100,
          bots: 5000,
          skillPoints: 50,
          crypto: 2.5,
          trust: 100,
          snitchCount: 0,
        },
      });

      const { prestigeReset } = useGameStore.getState();

      // Snitching: prestige with trust penalty
      prestigeReset(-20);

      const resources = useGameStore.getState().resources;
      expect(resources.trust).toBe(80);
      expect(resources.money).toBe(STARTING_MONEY);
    });

    it('should allow trust to be gained during clean escape', () => {
      useGameStore.setState({
        resources: {
          money: 10000,
          reputation: 500,
          heat: 100,
          bots: 5000,
          skillPoints: 50,
          crypto: 2.5,
          trust: 50,
          snitchCount: 0,
        },
      });

      const { prestigeReset } = useGameStore.getState();

      // Clean escape: gain trust based on run performance
      prestigeReset(30);

      const resources = useGameStore.getState().resources;
      expect(resources.trust).toBe(80);
      expect(resources.money).toBe(STARTING_MONEY);
    });
  });

  describe('type safety', () => {
    it('should have proper typing for GameResources', () => {
      const resources: GameResources = useGameStore.getState().resources;

      // TypeScript compilation would fail if types are wrong
      // This test verifies the structure at runtime
      expect(typeof resources.money).toBe('number');
      expect(typeof resources.reputation).toBe('number');
      expect(typeof resources.heat).toBe('number');
      expect(typeof resources.bots).toBe('number');
      expect(typeof resources.skillPoints).toBe('number');
      expect(typeof resources.crypto).toBe('number');
      expect(typeof resources.trust).toBe('number');
    });
  });

  describe('hydrate', () => {
    it('should replace all resources with provided values', () => {
      const { hydrate } = useGameStore.getState();

      const savedResources: GameResources = {
        money: 5000,
        reputation: 100,
        heat: 50,
        bots: 200,
        skillPoints: 15,
        crypto: 3.5,
        trust: 5,
        snitchCount: 0,
      };

      hydrate(savedResources);

      const resources = useGameStore.getState().resources;
      expect(resources).toEqual(savedResources);
    });

    it('should overwrite existing state completely', () => {
      const { addMoney, hydrate } = useGameStore.getState();

      // Build up some state
      addMoney(999);

      // Hydrate should replace it all
      hydrate({
        money: 42,
        reputation: 0,
        heat: 0,
        bots: 0,
        skillPoints: 0,
        crypto: 0,
        trust: 1,
        snitchCount: 0,
      });

      expect(useGameStore.getState().resources.money).toBe(42);
    });

    it('should preserve action functions after hydration', () => {
      const { hydrate } = useGameStore.getState();

      hydrate({
        money: 100,
        reputation: 0,
        heat: 0,
        bots: 0,
        skillPoints: 0,
        crypto: 0,
        trust: 1,
        snitchCount: 0,
      });

      // Actions should still work after hydration
      useGameStore.getState().addMoney(50);
      expect(useGameStore.getState().resources.money).toBe(150);
    });
  });

  describe('bot persistence across prestige', () => {
    it('should preserve bots across prestige reset', () => {
      useGameStore.setState({
        resources: {
          ...getInitialResources(),
          bots: 5,
          money: 10000,
          reputation: 500,
          heat: 100,
        },
      });

      const { prestigeReset } = useGameStore.getState();
      prestigeReset();

      const resources = useGameStore.getState().resources;
      expect(resources.bots).toBe(5);
      expect(resources.money).toBe(STARTING_MONEY);
      expect(resources.reputation).toBe(0);
      expect(resources.heat).toBe(0);
    });
  });
});
