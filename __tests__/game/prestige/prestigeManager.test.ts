// ABOUTME: Tests for the prestige manager orchestrator
// ABOUTME: Verifies that executePrestige properly resets all stores and returns correct results

import { executePrestige, resetAllStores, fullReset } from '../../../src/game/prestige/prestigeManager';
import { useGameStore, getInitialResources, STARTING_MONEY } from '../../../src/game/store';
import { useScamStore, getInitialScamState } from '../../../src/game/scams/scamStore';
import { useEmployeeStore, getInitialEmployeeState } from '../../../src/game/employees/employeeStore';
import { useManagerStore, getInitialManagerState } from '../../../src/game/managers/managerStore';
import { useBotStore } from '../../../src/game/bots/botStore';
import { useTutorialStore } from '../../../src/game/tutorial/tutorialStore';
import { useOriginStore } from '../../../src/game/origin/originStore';
import { SNITCH_TRUST_PERCENT } from '../../../src/game/prestige/constants';
import { calculatePerformanceTrustGain, calculateStartingSkillPoints } from '../../../src/game/prestige/calculations';
import type { GameResources } from '../../../src/game/types';
import type { PerformanceMetrics } from '../../../src/game/prestige/types';

describe('Prestige Manager', () => {
  // Reset all stores before each test
  beforeEach(() => {
    useGameStore.setState(useGameStore.getInitialState());
    useScamStore.setState(useScamStore.getInitialState());
    useEmployeeStore.setState(useEmployeeStore.getInitialState());
    useManagerStore.setState(useManagerStore.getInitialState());
    useBotStore.setState(useBotStore.getInitialState());
    useTutorialStore.getState().reset();
    useOriginStore.getState().reset();
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
        heat: 100,
        bots: 5000,
        skillPoints: 50,
        crypto: 25,
        trust: 75,
        snitchCount: 0,
      },
    });

    // Unlock and level up some scams
    useScamStore.getState().unlockScam('nigerian-prince-emails');
    useScamStore.getState().unlockScam('iphone-popup');
    useScamStore.getState().upgradeScam('iphone-popup');
    useScamStore.getState().upgradeScam('iphone-popup');
    useScamStore.getState().incrementCompletion('iphone-popup');
    useScamStore.getState().incrementCompletion('iphone-popup');

    // Hire some employees
    useEmployeeStore.getState().hireEmployee('popup-designer', 5);
    useEmployeeStore.getState().hireEmployee('email-copywriter', 3);

    // Hire some managers
    useManagerStore.getState().hireManager('popup-pete');
    useManagerStore.getState().hireManager('prince-okonkwo');
  }

  /**
   * Computes the expected performance metrics for the mid-game state.
   * iphone-popup: level 3, timesCompleted 2, unlocked
   * nigerian-prince-emails: level 1, timesCompleted 0, unlocked
   */
  function getMidGameMetrics(): PerformanceMetrics {
    return {
      money: 10000,
      totalCompletions: 2, // iphone-popup completed 2x
      totalLevels: 3 + 1,  // iphone-popup level 3 + nigerian-prince level 1
    };
  }

  describe('executePrestige with clean-escape', () => {
    it('should return a prestige result for clean escape with performance-based trust', () => {
      setupMidGameState();

      const metrics = getMidGameMetrics();
      const expectedTrustGain = calculatePerformanceTrustGain(metrics);

      const result = executePrestige('clean-escape');

      expect(result.choice).toBe('clean-escape');
      expect(result.previousTrust).toBe(75);
      expect(result.newTrust).toBe(75 + expectedTrustGain);
      expect(result.bonuses).toBeUndefined();
    });

    it('should reset game resources except trust, with starting skill points', () => {
      setupMidGameState();

      const metrics = getMidGameMetrics();
      const expectedTrustGain = calculatePerformanceTrustGain(metrics);

      executePrestige('clean-escape');

      const resources = useGameStore.getState().resources;
      const newTrust = 75 + expectedTrustGain;
      expect(resources.money).toBe(STARTING_MONEY);
      expect(resources.heat).toBe(0);
      // Bots persist across prestige
      expect(resources.bots).toBe(5000);
      // Starting skill points from sublinear formula
      expect(resources.skillPoints).toBe(calculateStartingSkillPoints(newTrust));
      expect(resources.crypto).toBe(0);
      expect(resources.trust).toBe(newTrust);
    });

    it('should reset scam state to initial', () => {
      setupMidGameState();

      // Verify pre-conditions
      expect(useScamStore.getState().getScamState('nigerian-prince-emails')?.isUnlocked).toBe(true);
      expect(useScamStore.getState().getScamState('iphone-popup')?.level).toBe(3);
      expect(useScamStore.getState().getScamState('iphone-popup')?.timesCompleted).toBe(2);

      executePrestige('clean-escape');

      // After prestige, scams should be reset to initial state
      // Nigerian Prince starts unlocked, iPhone Popup starts locked
      expect(useScamStore.getState().getScamState('nigerian-prince-emails')?.isUnlocked).toBe(true);
      expect(useScamStore.getState().getScamState('nigerian-prince-emails')?.level).toBe(1);
      expect(useScamStore.getState().getScamState('iphone-popup')?.level).toBe(1);
      expect(useScamStore.getState().getScamState('iphone-popup')?.timesCompleted).toBe(0);
    });

    it('should reset employee state to initial (empty)', () => {
      setupMidGameState();

      // Verify pre-conditions
      expect(useEmployeeStore.getState().getEmployeeCount('popup-designer')).toBe(5);
      expect(useEmployeeStore.getState().getEmployeeCount('email-copywriter')).toBe(3);

      executePrestige('clean-escape');

      // After prestige, employees should be empty
      expect(useEmployeeStore.getState().getEmployeeCount('popup-designer')).toBe(0);
      expect(useEmployeeStore.getState().getEmployeeCount('email-copywriter')).toBe(0);
      expect(useEmployeeStore.getState().getAllEmployeeStates()).toHaveLength(0);
    });

    it('should reset manager state to initial (empty)', () => {
      setupMidGameState();

      // Verify pre-conditions
      expect(useManagerStore.getState().isManagerHired('popup-pete')).toBe(true);
      expect(useManagerStore.getState().isManagerHired('prince-okonkwo')).toBe(true);

      executePrestige('clean-escape');

      // After prestige, managers should be empty
      expect(useManagerStore.getState().isManagerHired('popup-pete')).toBe(false);
      expect(useManagerStore.getState().isManagerHired('prince-okonkwo')).toBe(false);
      expect(useManagerStore.getState().getAllManagerStates()).toHaveLength(0);
    });
  });

  describe('executePrestige with snitch', () => {
    it('should return a prestige result for snitch with trust penalty', () => {
      setupMidGameState();

      const result = executePrestige('snitch');

      expect(result.choice).toBe('snitch');
      expect(result.previousTrust).toBe(75);
      // max(1, floor(75 * 0.5)) = 37
      expect(result.newTrust).toBe(37);
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
      const newTrust = 37; // max(1, floor(75 * 0.5)) = 37
      // Money: STARTING_MONEY + 10000 * 0.1 = STARTING_MONEY + 1000
      expect(resources.money).toBe(STARTING_MONEY + 1000);
      // Bots persist across prestige (5000) + snitch bonus (5000 * 0.1 = 500)
      expect(resources.bots).toBe(5000 + 500);
      // Crypto: 25 * 0.1 = 2.5
      expect(resources.crypto).toBeCloseTo(2.5);
      // Skill points: starting SP from trust + snitch bonus
      const startingSP = calculateStartingSkillPoints(newTrust);
      const snitchBonus = Math.floor(50 * 0.1);
      expect(resources.skillPoints).toBe(startingSP + snitchBonus);
      // Heat should still be 0
      expect(resources.heat).toBe(0);
      // Trust should be 37
      expect(resources.trust).toBe(newTrust);
      // Snitch count should be incremented
      expect(resources.snitchCount).toBe(1);
    });

    it('should not let trust fall below 1', () => {
      // Set trust to a low value
      useGameStore.setState({
        resources: {
          ...getInitialResources(),
          trust: 3,
          snitchCount: 0,
        },
      });

      const result = executePrestige('snitch');

      // max(1, floor(3 * 0.5)) = 1
      expect(result.newTrust).toBe(1);
      expect(useGameStore.getState().resources.trust).toBe(1);
    });

    it('should still reset scams, employees, and managers when snitching', () => {
      setupMidGameState();

      executePrestige('snitch');

      // Scams reset to initial (Nigerian Prince starts unlocked)
      expect(useScamStore.getState().getScamState('iphone-popup')?.level).toBe(1);
      expect(useScamStore.getState().getScamState('nigerian-prince-emails')?.isUnlocked).toBe(true);
      expect(useScamStore.getState().getScamState('nigerian-prince-emails')?.level).toBe(1);

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
      expect(useGameStore.getState().resources.money).toBe(STARTING_MONEY);
      expect(useScamStore.getState().getScamState('nigerian-prince-emails')?.level).toBe(1);
      expect(useEmployeeStore.getState().getAllEmployeeStates()).toHaveLength(0);
      expect(useManagerStore.getState().getAllManagerStates()).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should handle prestige with no resources accumulated (fresh start gives trust >= 1)', () => {
      // Fresh start - only trust at 1, no money, no completions, no levels
      // The only unlocked scam is nigerian-prince-emails at level 1
      const result = executePrestige('clean-escape');

      expect(result.previousTrust).toBe(1);
      // With near-zero metrics (only default scam levels), still gets at least MIN_TRUST_GAIN
      expect(result.newTrust).toBeGreaterThanOrEqual(1 + 1);
    });

    it('should handle snitch with no starting money (no bonus)', () => {
      // Fresh start - STARTING_MONEY is 0, so no bonus
      const result = executePrestige('snitch');

      expect(result.bonuses).toBeDefined();
      // With $0 starting money, there's no money bonus
      expect(result.bonuses!.length).toBe(0);
    });

    it('should award 1 bot on first prestige (trust was 1)', () => {
      // Fresh start: trust = 1 (the default)
      // Execute a clean-escape prestige
      const result = executePrestige('clean-escape');

      // After first prestige, player should receive 1 bot as introduction
      expect(useGameStore.getState().resources.bots).toBe(1);
    });

    it('should reset bot assignments on prestige', () => {
      setupMidGameState();

      // Assign some bots to scams
      useBotStore.getState().assignBot('nigerian-prince-emails', 'speed');
      useBotStore.getState().assignBot('nigerian-prince-emails', 'profit');

      // Verify pre-conditions
      expect(useBotStore.getState().getTotalAssigned()).toBe(2);

      executePrestige('clean-escape');

      // After prestige, bot assignments should be cleared
      expect(useBotStore.getState().assignments).toEqual({});
      expect(useBotStore.getState().getTotalAssigned()).toBe(0);
    });

    it('should preserve ascensions across prestige but clear on fullReset', () => {
      setupMidGameState();

      // Award some ascensions
      useGameStore.getState().addAscension('nigerian-prince-emails');
      useGameStore.getState().addAscension('nigerian-prince-emails');

      // Prestige should preserve ascensions
      executePrestige('clean-escape');
      expect(useGameStore.getState().ascensions['nigerian-prince-emails']).toBe(2);

      // Full reset should clear ascensions
      fullReset();
      expect(useGameStore.getState().ascensions).toEqual({});
    });

    it('should mark hasPrestiged in tutorial store on first prestige', () => {
      expect(useTutorialStore.getState().hasPrestiged).toBe(false);
      expect(useTutorialStore.getState().prestigeCount).toBe(0);

      executePrestige('clean-escape');

      expect(useTutorialStore.getState().hasPrestiged).toBe(true);
      expect(useTutorialStore.getState().prestigeCount).toBe(1);
    });

    it('should mark hasPrestiged on snitch prestige too', () => {
      expect(useTutorialStore.getState().hasPrestiged).toBe(false);
      expect(useTutorialStore.getState().prestigeCount).toBe(0);

      executePrestige('snitch');

      expect(useTutorialStore.getState().hasPrestiged).toBe(true);
      expect(useTutorialStore.getState().prestigeCount).toBe(1);
    });

    it('should keep hasPrestiged true on subsequent prestiges', () => {
      executePrestige('clean-escape');
      expect(useTutorialStore.getState().hasPrestiged).toBe(true);
      expect(useTutorialStore.getState().prestigeCount).toBe(1);

      executePrestige('clean-escape');
      expect(useTutorialStore.getState().hasPrestiged).toBe(true);
      expect(useTutorialStore.getState().prestigeCount).toBe(2);
    });

    it('should increment prestigeCount on multiple prestiges', () => {
      expect(useTutorialStore.getState().prestigeCount).toBe(0);

      executePrestige('clean-escape');
      expect(useTutorialStore.getState().prestigeCount).toBe(1);

      executePrestige('snitch');
      expect(useTutorialStore.getState().prestigeCount).toBe(2);

      executePrestige('clean-escape');
      expect(useTutorialStore.getState().prestigeCount).toBe(3);
    });

    it('should reset tutorial state on fullReset', () => {
      executePrestige('clean-escape');
      expect(useTutorialStore.getState().hasPrestiged).toBe(true);
      expect(useTutorialStore.getState().prestigeCount).toBe(1);

      fullReset();
      expect(useTutorialStore.getState().hasPrestiged).toBe(false);
      expect(useTutorialStore.getState().prestigeCount).toBe(0);
      expect(useTutorialStore.getState().seen).toEqual([]);
    });

    it('should preserve origin across prestige (clean-escape)', () => {
      setupMidGameState();
      useOriginStore.getState().selectOrigin('moms-basement');

      executePrestige('clean-escape');

      expect(useOriginStore.getState().selectedOrigin).toBe('moms-basement');
    });

    it('should preserve origin across prestige (snitch)', () => {
      setupMidGameState();
      useOriginStore.getState().selectOrigin('internet-cafe');

      executePrestige('snitch');

      expect(useOriginStore.getState().selectedOrigin).toBe('internet-cafe');
    });

    it('should clear origin on fullReset', () => {
      useOriginStore.getState().selectOrigin('stolen-phone');
      expect(useOriginStore.getState().selectedOrigin).toBe('stolen-phone');

      fullReset();

      expect(useOriginStore.getState().selectedOrigin).toBeNull();
    });

    it('should handle multiple consecutive prestiges with varying trust gains', () => {
      // First prestige with mid-game state
      setupMidGameState();
      const metrics1 = getMidGameMetrics();
      const expectedGain1 = calculatePerformanceTrustGain(metrics1);
      const result1 = executePrestige('clean-escape');
      expect(result1.newTrust).toBe(75 + expectedGain1);

      // After reset, add different resources for second run
      useGameStore.getState().addMoney(5000);

      // Second prestige has different metrics (only default scam levels, no completions)
      const result2 = executePrestige('clean-escape');
      expect(result2.previousTrust).toBe(75 + expectedGain1);
      // Trust gain varies by run performance
      expect(result2.newTrust).toBeGreaterThan(result2.previousTrust);
      // Two prestiges should increment prestigeCount to 2
      expect(useTutorialStore.getState().prestigeCount).toBe(2);
    });
  });
});
