// ABOUTME: Orchestrator for executing prestige operations
// ABOUTME: Coordinates reset of all stores and applies prestige bonuses

import { useGameStore } from '../store';
import { useScamStore } from '../scams/scamStore';
import { useEmployeeStore } from '../employees/employeeStore';
import { useManagerStore } from '../managers/managerStore';
import { useBotStore } from '../bots/botStore';
import { useSkillStore } from '../skills/skillStore';
import { useTutorialStore } from '../tutorial/tutorialStore';
import { useCryptoStore } from '../crypto/cryptoStore';
import { useOriginStore } from '../origin/originStore';
import type { PrestigeResult, PrestigeBonus, PerformanceMetrics } from './types';
import { calculateCleanEscapeResult, calculateSnitchResult } from './calculations';

/**
 * Resets all game stores to initial state, preserving only trust.
 * This is the core prestige reset operation.
 */
export function resetAllStores(): void {
  // Reset game resources (trust is preserved via prestigeReset with no modifier)
  useGameStore.getState().prestigeReset();

  // Reset scams to initial state (Prince Emails scam unlocked, others locked, all level 1)
  useScamStore.getState().resetScams();

  // Reset employees (empty - must rehire)
  useEmployeeStore.getState().resetEmployees();

  // Reset managers (empty - must rehire)
  useManagerStore.getState().resetManagers();

  // Reset bot assignments (bots return to pool, total count persists via resources)
  useBotStore.getState().resetAssignments();

  // Reset skills (must re-allocate with starting SP)
  useSkillStore.getState().reset();

  // Reset crypto market, projects, and NFTs (all reset on prestige)
  useCryptoStore.getState().reset();
}

/**
 * Nukes all game state back to the very beginning, including trust.
 * This is the "start completely over" operation.
 */
export function fullReset(): void {
  // Hydrate game resources to fresh initial state (trust = 1, everything else = 0)
  useGameStore.getState().hydrate({
    money: 0,
    heat: 0,
    bots: 0,
    skillPoints: 0,
    crypto: 0,
    trust: 1,
    snitchCount: 0,
  });

  // Clear ascensions (permanent per-scam bonuses)
  useGameStore.getState().resetAscensions();

  // Reset scams to initial state
  useScamStore.getState().resetScams();

  // Reset employees
  useEmployeeStore.getState().resetEmployees();

  // Reset managers
  useManagerStore.getState().resetManagers();

  // Reset bot assignments
  useBotStore.getState().resetAssignments();

  // Reset skills
  useSkillStore.getState().reset();

  // Reset crypto market, projects, and NFTs
  useCryptoStore.getState().reset();

  // Reset tutorial/progressive disclosure state (back to first-run experience)
  useTutorialStore.getState().reset();

  // Reset origin selection (back to origin choice screen)
  useOriginStore.getState().reset();
}

/**
 * Applies snitch bonuses to the game store.
 * Called after reset when player chose to snitch.
 *
 * @param bonuses - Array of bonuses to apply
 */
function applySnitchBonuses(bonuses: PrestigeBonus[]): void {
  const gameStore = useGameStore.getState();

  for (const bonus of bonuses) {
    switch (bonus.type) {
      case 'money':
        gameStore.addMoney(bonus.amount);
        break;
      case 'bots':
        gameStore.addBots(bonus.amount);
        break;
      case 'crypto':
        gameStore.addCrypto(bonus.amount);
        break;
      case 'skill-points':
        gameStore.addSkillPoints(bonus.amount);
        break;
    }
  }
}

/**
 * Executes a prestige operation based on player choice.
 *
 * Clean Escape:
 * - Resets all resources except trust
 * - Adds trust gain bonus
 * - Resets scams, employees, managers
 *
 * Snitch:
 * - Resets all resources except trust
 * - Applies trust penalty
 * - Keeps percentage of resources as bonuses
 * - Resets scams, employees, managers
 *
 * @param choice - 'clean-escape' or 'snitch'
 * @returns PrestigeResult with details of the operation
 */
export function executePrestige(choice: 'clean-escape' | 'snitch'): PrestigeResult {
  // Get current state before reset
  const currentResources = useGameStore.getState().resources;
  const currentTrust = currentResources.trust;

  // Gather performance metrics from scam store for trust calculation
  const scams = useScamStore.getState().scams;
  const metrics: PerformanceMetrics = {
    money: currentResources.money,
    totalCompletions: 0,
    totalLevels: 0,
  };
  for (const scamState of Object.values(scams)) {
    if (scamState.isUnlocked) {
      metrics.totalCompletions += scamState.timesCompleted;
      metrics.totalLevels += scamState.level;
    }
  }

  // Calculate result based on choice
  let result: PrestigeResult;

  if (choice === 'clean-escape') {
    const trustGainBonus = useSkillStore.getState().getSkillBonuses().trustGainBonus;
    result = calculateCleanEscapeResult(currentTrust, metrics, trustGainBonus);

    // Reset all stores with trust gain modifier
    useGameStore.getState().prestigeReset(result.newTrust - currentTrust);
    useScamStore.getState().resetScams();
    useEmployeeStore.getState().resetEmployees();
    useManagerStore.getState().resetManagers();
    useBotStore.getState().resetAssignments();
    useSkillStore.getState().reset();
    useCryptoStore.getState().reset();
  } else {
    result = calculateSnitchResult(currentTrust, currentResources);

    // Reset all stores with trust penalty modifier
    useGameStore.getState().prestigeReset(result.newTrust - currentTrust);
    useScamStore.getState().resetScams();
    useEmployeeStore.getState().resetEmployees();
    useManagerStore.getState().resetManagers();
    useBotStore.getState().resetAssignments();
    useSkillStore.getState().reset();
    useCryptoStore.getState().reset();

    // Increment lifetime snitch count (after reset, since prestigeReset preserves it)
    const gameStore = useGameStore.getState();
    gameStore.setResource('snitchCount', gameStore.resources.snitchCount + 1);

    // Apply snitch bonuses (after reset so they're added to zero)
    if (result.bonuses && result.bonuses.length > 0) {
      applySnitchBonuses(result.bonuses);
    }
  }

  // Award 1 bot on first prestige (trust was 1 before prestige) as introduction
  if (currentTrust === 1) {
    useGameStore.getState().addBots(1);
  }

  // Increment prestige count for progressive disclosure gating
  useTutorialStore.getState().incrementPrestige();

  return result;
}
