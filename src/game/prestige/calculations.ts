// ABOUTME: Calculation functions for prestige mechanics
// ABOUTME: Heat generation, prestige trigger detection, and escape result calculations

import type { ScamDefinition } from '../scams/types';
import type { GameResources } from '../types';
import type { PrestigeResult, PrestigeBonus } from './types';
import {
  MAX_HEAT,
  HEAT_PER_SCAM_TIER,
  CLEAN_ESCAPE_TRUST_GAIN,
  SNITCH_TRUST_PENALTY,
  SNITCH_RESOURCE_KEEP_PERCENT,
} from './constants';

/**
 * Calculates heat gained from completing a scam.
 * Higher tier scams generate more heat (police attention).
 *
 * @param scamDefinition - The scam that was completed
 * @returns The amount of heat to add
 */
export function calculateHeatFromScam(scamDefinition: ScamDefinition): number {
  return HEAT_PER_SCAM_TIER[scamDefinition.tier];
}

/**
 * Determines if prestige is forced due to max heat.
 * At 100+ heat, the player must flee the country.
 *
 * @param currentHeat - The player's current heat level
 * @returns True if heat >= MAX_HEAT
 */
export function isPrestigeForced(currentHeat: number): boolean {
  return currentHeat >= MAX_HEAT;
}

/**
 * Calculates the result of choosing a clean escape.
 * Trust is increased; no resources are kept.
 *
 * @param currentTrust - The player's current trust value
 * @returns PrestigeResult with trust gain and no bonuses
 */
export function calculateCleanEscapeResult(currentTrust: number): PrestigeResult {
  return {
    choice: 'clean-escape',
    previousTrust: currentTrust,
    newTrust: currentTrust + CLEAN_ESCAPE_TRUST_GAIN,
    bonuses: undefined,
  };
}

/**
 * Calculates the result of choosing to snitch.
 * Trust is reduced (minimum 1); some resources are kept.
 *
 * @param currentTrust - The player's current trust value
 * @param resources - The player's current resources
 * @returns PrestigeResult with trust penalty and resource bonuses
 */
export function calculateSnitchResult(
  currentTrust: number,
  resources: GameResources
): PrestigeResult {
  // Calculate new trust (minimum 1)
  const newTrust = Math.max(1, currentTrust + SNITCH_TRUST_PENALTY);

  // Calculate resource bonuses (10% of each resettable resource)
  const bonuses: PrestigeBonus[] = [];

  // Money - floor for clean integer
  if (resources.money > 0) {
    bonuses.push({
      type: 'money',
      amount: Math.floor(resources.money * SNITCH_RESOURCE_KEEP_PERCENT),
    });
  }

  // Bots - floor for clean integer
  if (resources.bots > 0) {
    bonuses.push({
      type: 'bots',
      amount: Math.floor(resources.bots * SNITCH_RESOURCE_KEEP_PERCENT),
    });
  }

  // Reputation - floor for clean integer
  if (resources.reputation > 0) {
    bonuses.push({
      type: 'reputation',
      amount: Math.floor(resources.reputation * SNITCH_RESOURCE_KEEP_PERCENT),
    });
  }

  // Crypto - keep decimals (volatile currency)
  if (resources.crypto > 0) {
    bonuses.push({
      type: 'crypto',
      amount: resources.crypto * SNITCH_RESOURCE_KEEP_PERCENT,
    });
  }

  // Skill points - floor for clean integer
  if (resources.skillPoints > 0) {
    bonuses.push({
      type: 'skill-points',
      amount: Math.floor(resources.skillPoints * SNITCH_RESOURCE_KEEP_PERCENT),
    });
  }

  return {
    choice: 'snitch',
    previousTrust: currentTrust,
    newTrust,
    bonuses,
  };
}
