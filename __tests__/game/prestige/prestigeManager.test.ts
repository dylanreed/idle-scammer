// ABOUTME: Tests for the prestige manager orchestrator
// ABOUTME: Verifies that executePrestige properly resets all stores and returns correct results

import { executePrestige, resetAllStores } from '../../../src/game/prestige/prestigeManager';
import { useGameStore, getInitialResources } from '../../../src/game/store';
import { useScamStore, getInitialScamState } from '../../../src/game/scams/scamStore';
import { useEmployeeStore, getInitialEmployeeState } from '../../../src/game/employees/employeeStore';
import { useManagerStore, getInitialManagerState } from '../../../src/game/managers/managerStore';
import { CLEAN_ESCAPE_TRUST_GAIN, SNITCH_TRUST_PENALTY } from '../../../src/game/prestige/constants';
import type { GameResources } from '../../../src/game/types';

describe('Prestige Manager', () => {
  // Reset all stores before each test
  beforeEach(() => {
    useGameStore.setState(useGameStore.getInitialState());
    useScamStore.setState(useScamStore.getInitialState());
    useEmployeeStore.setState(useEmployeeStore.getInitialState());
    useManagerStore.setState(useManagerStore.getInitialState());
  });

  /**
   * Sets up a "mid-game" state with resources, unlocked scams,
   * hired employees, and hired managers.
   */
  function setupMidGameState(): void {
    // Set up resources
    useGameStore.setState({
      resources: {
        money: 10000,
        reputation: 500,
        heat: 100,
        bots: 5000,
        skillPoints: 50,
        crypto: 25,
        trust: 75,
      },
    });

    // Unlock and level up some scams
    useScamStore.getState().unlockScam('nigerian-prince-emails');
    useScamStore.getState().upgradeScam('bot-farms');
    useScamStore.getState().upgradeScam('bot-farms');
    useScamStore.getState().incrementCompletion('bot-farms');
    useScamStore.getState().incrementCompletion('bot-farms');

    // Hire some employees
    useEmployeeStore.getState().hireEmployee('bot-wrangler', 5);
    useEmployeeStore.getState().hireEmployee('email-copywriter', 3);

    // Hire some managers
    useManagerStore.getState().hireManager('botty-mcbotface');
    useManagerStore.getState().hireManager('prince-ali');
  }

  describe('executePrestige with clean-escape', () => {
    it('should return a prestige result for clean escape', () => {
      setupMidGameState();

      const result = executePrestige('clean-escape');

      expect(result.choice).toBe('clean-escape');
      expect(result.previousTrust).toBe(75);
      expect(result.newTrust).toBe(75 + CLEAN_ESCAPE_TRUST_GAIN);
      expect(result.bonuses).toBeUndefined();
    });

    it('should reset game resources except trust', () => {
      setupMidGameState();

      executePrestige('clean-escape');

      const resources = useGameStore.getState().resources;
      expect(resources.money).toBe(0);
      expect(resources.reputation).toBe(0);
      expect(resources.heat).toBe(0);
      expect(resources.bots).toBe(0);
      expect(resources.skillPoints).toBe(0);
      expect(resources.crypto).toBe(0);
      expect(resources.trust).toBe(75 + CLEAN_ESCAPE_TRUST_GAIN);
    });

    it('should reset scam state to initial', () => {
      setupMidGameState();

      // Verify pre-conditions
      expect(useScamStore.getState().getScamState('nigerian-prince-emails')?.isUnlocked).toBe(true);
      expect(useScamStore.getState().getScamState('bot-farms')?.level).toBe(3);
      expect(useScamStore.getState().getScamState('bot-farms')?.timesCompleted).toBe(2);

      executePrestige('clean-escape');

      // After prestige, scams should be reset
      const initialScams = getInitialScamState();
      expect(useScamStore.getState().getScamState('bot-farms')?.isUnlocked).toBe(true);
      expect(useScamStore.getState().getScamState('bot-farms')?.level).toBe(1);
      expect(useScamStore.getState().getScamState('bot-farms')?.timesCompleted).toBe(0);
      expect(useScamStore.getState().getScamState('nigerian-prince-emails')?.isUnlocked).toBe(false);
    });

    it('should reset employee state to initial (empty)', () => {
      setupMidGameState();

      // Verify pre-conditions
      expect(useEmployeeStore.getState().getEmployeeCount('bot-wrangler')).toBe(5);
      expect(useEmployeeStore.getState().getEmployeeCount('email-copywriter')).toBe(3);

      executePrestige('clean-escape');

      // After prestige, employees should be empty
      expect(useEmployeeStore.getState().getEmployeeCount('bot-wrangler')).toBe(0);
      expect(useEmployeeStore.getState().getEmployeeCount('email-copywriter')).toBe(0);
      expect(useEmployeeStore.getState().getAllEmployeeStates()).toHaveLength(0);
    });

    it('should reset manager state to initial (empty)', () => {
      setupMidGameState();

      // Verify pre-conditions
      expect(useManagerStore.getState().isManagerHired('botty-mcbotface')).toBe(true);
      expect(useManagerStore.getState().isManagerHired('prince-ali')).toBe(true);

      executePrestige('clean-escape');

      // After prestige, managers should be empty
      expect(useManagerStore.getState().isManagerHired('botty-mcbotface')).toBe(false);
      expect(useManagerStore.getState().isManagerHired('prince-ali')).toBe(false);
      expect(useManagerStore.getState().getAllManagerStates()).toHaveLength(0);
    });
  });

  describe('executePrestige with snitch', () => {
    it('should return a prestige result for snitch with trust penalty', () => {
      setupMidGameState();

      const result = executePrestige('snitch');

      expect(result.choice).toBe('snitch');
      expect(result.previousTrust).toBe(75);
      expect(result.newTrust).toBe(75 + SNITCH_TRUST_PENALTY); // 75 - 5 = 70
    });

    it('should include bonuses in result when snitching', () => {
      setupMidGameState();

      const result = executePrestige('snitch');

      expect(result.bonuses).toBeDefined();
      expect(result.bonuses!.length).toBeGreaterThan(0);

      // Should have money bonus (10000 * 0.1 = 1000)
      const moneyBonus = result.bonuses!.find((b) => b.type === 'money');
      expect(moneyBonus).toBeDefined();
      expect(moneyBonus!.amount).toBe(1000);
    });

    it('should apply bonuses to new resources when snitching', () => {
      setupMidGameState();

      executePrestige('snitch');

      const resources = useGameStore.getState().resources;
      // Money: 10000 * 0.1 = 1000
      expect(resources.money).toBe(1000);
      // Bots: 5000 * 0.1 = 500
      expect(resources.bots).toBe(500);
      // Reputation: 500 * 0.1 = 50
      expect(resources.reputation).toBe(50);
      // Crypto: 25 * 0.1 = 2.5
      expect(resources.crypto).toBeCloseTo(2.5);
      // Skill points: 50 * 0.1 = 5
      expect(resources.skillPoints).toBe(5);
      // Heat should still be 0
      expect(resources.heat).toBe(0);
      // Trust: 75 - 5 = 70
      expect(resources.trust).toBe(70);
    });

    it('should not let trust fall below 1', () => {
      // Set trust to a low value
      useGameStore.setState({
        resources: {
          ...getInitialResources(),
          trust: 3,
        },
      });

      const result = executePrestige('snitch');

      // 3 - 5 = -2, should clamp to 1
      expect(result.newTrust).toBe(1);
      expect(useGameStore.getState().resources.trust).toBe(1);
    });

    it('should still reset scams, employees, and managers when snitching', () => {
      setupMidGameState();

      executePrestige('snitch');

      // Scams reset
      expect(useScamStore.getState().getScamState('bot-farms')?.level).toBe(1);
      expect(useScamStore.getState().getScamState('nigerian-prince-emails')?.isUnlocked).toBe(false);

      // Employees reset
      expect(useEmployeeStore.getState().getAllEmployeeStates()).toHaveLength(0);

      // Managers reset
      expect(useManagerStore.getState().getAllManagerStates()).toHaveLength(0);
    });
  });

  describe('resetAllStores', () => {
    it('should reset all stores without modifying trust', () => {
      setupMidGameState();
      const previousTrust = useGameStore.getState().resources.trust;

      resetAllStores();

      expect(useGameStore.getState().resources.trust).toBe(previousTrust);
      expect(useGameStore.getState().resources.money).toBe(0);
      expect(useScamStore.getState().getScamState('bot-farms')?.level).toBe(1);
      expect(useEmployeeStore.getState().getAllEmployeeStates()).toHaveLength(0);
      expect(useManagerStore.getState().getAllManagerStates()).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should handle prestige with no resources accumulated', () => {
      // Fresh start - only trust at 1
      const result = executePrestige('clean-escape');

      expect(result.previousTrust).toBe(1);
      expect(result.newTrust).toBe(1 + CLEAN_ESCAPE_TRUST_GAIN);
    });

    it('should handle snitch with no resources (no bonuses)', () => {
      // Fresh start
      const result = executePrestige('snitch');

      expect(result.bonuses).toBeDefined();
      // All bonuses should be 0 or empty since no resources
      expect(result.bonuses!.length).toBe(0);
    });

    it('should handle multiple consecutive prestiges', () => {
      // First prestige
      setupMidGameState();
      const result1 = executePrestige('clean-escape');
      expect(result1.newTrust).toBe(75 + CLEAN_ESCAPE_TRUST_GAIN);

      // Add some resources again
      useGameStore.getState().addMoney(5000);

      // Second prestige
      const result2 = executePrestige('clean-escape');
      expect(result2.previousTrust).toBe(85);
      expect(result2.newTrust).toBe(85 + CLEAN_ESCAPE_TRUST_GAIN);
    });
  });
});
