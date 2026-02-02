// ABOUTME: Orchestrator for executing prestige operations
// ABOUTME: Coordinates reset of all stores and applies prestige bonuses

import { useGameStore } from '../store';
import { useScamStore } from '../scams/scamStore';
import { useEmployeeStore } from '../employees/employeeStore';
import { useManagerStore } from '../managers/managerStore';
import type { PrestigeResult, PrestigeBonus } from './types';
import { calculateCleanEscapeResult, calculateSnitchResult } from './calculations';

/**
 * Resets all game stores to initial state, preserving only trust.
 * This is the core prestige reset operation.
 */
export function resetAllStores(): void {
  // Reset game resources (trust is preserved via prestigeReset with no modifier)
  useGameStore.getState().prestigeReset();

  // Reset scams to initial state (Bot Farms unlocked, others locked, all level 1)
  useScamStore.getState().resetScams();

  // Reset employees (empty - must rehire)
  useEmployeeStore.getState().resetEmployees();

  // Reset managers (empty - must rehire)
  useManagerStore.getState().resetManagers();
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
      case 'reputation':
        gameStore.addReputation(bonus.amount);
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

  // Calculate result based on choice
  let result: PrestigeResult;

  if (choice === 'clean-escape') {
    result = calculateCleanEscapeResult(currentTrust);

    // Reset all stores with trust gain modifier
    useGameStore.getState().prestigeReset(result.newTrust - currentTrust);
    useScamStore.getState().resetScams();
    useEmployeeStore.getState().resetEmployees();
    useManagerStore.getState().resetManagers();
  } else {
    result = calculateSnitchResult(currentTrust, currentResources);

    // Reset all stores with trust penalty modifier
    useGameStore.getState().prestigeReset(result.newTrust - currentTrust);
    useScamStore.getState().resetScams();
    useEmployeeStore.getState().resetEmployees();
    useManagerStore.getState().resetManagers();

    // Apply snitch bonuses (after reset so they're added to zero)
    if (result.bonuses && result.bonuses.length > 0) {
      applySnitchBonuses(result.bonuses);
    }
  }

  return result;
}
