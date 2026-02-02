// ABOUTME: Tests for the main game Zustand store
// ABOUTME: Covers initial state, resource actions, and prestige reset logic

import { useGameStore, getInitialResources, STARTING_MONEY, getBotPurchasePrice } from '../../src/game/store';
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
        },
      });

      const { prestigeReset } = useGameStore.getState();
      prestigeReset();

      const resources = useGameStore.getState().resources;

      // These should be reset to initial values
      expect(resources.money).toBe(STARTING_MONEY);
      expect(resources.reputation).toBe(0);
      expect(resources.heat).toBe(0);
      expect(resources.bots).toBe(0);
      expect(resources.skillPoints).toBe(0);
      expect(resources.crypto).toBe(0);

      // Trust should be preserved
      expect(resources.trust).toBe(75);
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

  describe('buyBot', () => {
    it('should purchase a bot when player has enough money', () => {
      // First bot costs $100
      useGameStore.setState({
        resources: { ...getInitialResources(), money: 200 },
      });

      const { buyBot } = useGameStore.getState();
      const result = buyBot();

      expect(result).toBe(true);
      expect(useGameStore.getState().resources.bots).toBe(1);
      expect(useGameStore.getState().resources.money).toBe(100); // 200 - 100
    });

    it('should fail to purchase bot when not enough money', () => {
      useGameStore.setState({
        resources: { ...getInitialResources(), money: 50 },
      });

      const { buyBot } = useGameStore.getState();
      const result = buyBot();

      expect(result).toBe(false);
      expect(useGameStore.getState().resources.bots).toBe(0);
      expect(useGameStore.getState().resources.money).toBe(50); // Unchanged
    });

    it('should scale price quadratically with bots owned', () => {
      // Start with enough money and some bots
      useGameStore.setState({
        resources: { ...getInitialResources(), money: 50000, bots: 5 },
      });

      // Price with 5 bots: $100 × (5+1)² = $100 × 36 = $3,600
      const { buyBot } = useGameStore.getState();
      buyBot();

      expect(useGameStore.getState().resources.bots).toBe(6);
      expect(useGameStore.getState().resources.money).toBe(50000 - 3600);
    });

    it('should allow multiple bot purchases in sequence', () => {
      useGameStore.setState({
        resources: { ...getInitialResources(), money: 2000 },
      });

      const { buyBot } = useGameStore.getState();

      // First bot: $100 × 1² = $100, remaining: $1900
      expect(buyBot()).toBe(true);
      expect(useGameStore.getState().resources.money).toBe(1900);

      // Second bot: $100 × 2² = $400, remaining: $1500
      expect(useGameStore.getState().buyBot()).toBe(true);
      expect(useGameStore.getState().resources.money).toBe(1500);

      // Third bot: $100 × 3² = $900, remaining: $600
      expect(useGameStore.getState().buyBot()).toBe(true);
      expect(useGameStore.getState().resources.money).toBe(600);

      // Fourth bot: $100 × 4² = $1600, not enough!
      expect(useGameStore.getState().buyBot()).toBe(false);
      expect(useGameStore.getState().resources.money).toBe(600);
      expect(useGameStore.getState().resources.bots).toBe(3);
    });
  });

  describe('getBotPurchasePrice', () => {
    it('should return current bot purchase price', () => {
      useGameStore.setState({
        resources: { ...getInitialResources(), bots: 0 },
      });

      expect(getBotPurchasePrice()).toBe(100);
    });

    it('should reflect current bot count', () => {
      useGameStore.setState({
        resources: { ...getInitialResources(), bots: 10 },
      });

      // $100 × (10+1)² = $100 × 121 = $12,100
      expect(getBotPurchasePrice()).toBe(12100);
    });
  });
});
