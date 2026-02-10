// ABOUTME: Calculation functions for prestige mechanics
// ABOUTME: Heat generation, prestige trigger detection, and escape result calculations

import type { ScamDefinition } from '../scams/types';
import type { GameResources } from '../types';
import type { PrestigeResult, PrestigeBonus } from './types';
import {
  MAX_HEAT,
  MIN_HEAT_PER_COMPLETION,
  MAX_HEAT_PER_COMPLETION,
  MIN_HEAT_LOG_COST,
  MAX_HEAT_LOG_COST,
  HEAT_TIER_DISCOUNT,
  HEAT_DECAY_RATE,
  CLEAN_ESCAPE_TRUST_GAIN,
  SNITCH_TRUST_PENALTY,
  SNITCH_RESOURCE_KEEP_PERCENT,
  SKILL_POINTS_PER_TRUST,
  TIER_TRUST_REQUIREMENTS,
} from './constants';
import { getTierBase } from '../economy/constants';
import type { ScamTier } from '../scams/types';

/**
 * Calculates heat gained from completing a scam.
 * Uses graduated formula based on log10(baseCost), then applies
 * a tier discount (higher-tier scammers run tighter operations).
 *
 * @param scamDefinition - The scam that was completed
 * @returns The amount of heat to add
 */
export function calculateHeatFromScam(scamDefinition: ScamDefinition): number {
  const { unlockCost, tier } = scamDefinition;
  const tierBase = getTierBase(tier);
  const baseCost = unlockCost ?? tierBase.baseCost;

  // Graduated heat based on log10(baseCost)
  const logCost = Math.log10(Math.max(baseCost, 10));
  const t = Math.min(1, Math.max(0, (logCost - MIN_HEAT_LOG_COST) / (MAX_HEAT_LOG_COST - MIN_HEAT_LOG_COST)));
  const baseHeat = MIN_HEAT_PER_COMPLETION + t * (MAX_HEAT_PER_COMPLETION - MIN_HEAT_PER_COMPLETION);

  // Apply tier discount
  const tierDiscount = HEAT_TIER_DISCOUNT[tier] ?? 1.0;
  return baseHeat * tierDiscount;
}

/**
 * Calculates heat decay for a time delta.
 * Heat decays exponentially: heat × (1 - HEAT_DECAY_RATE)^seconds.
 *
 * @param currentHeat - Current heat level
 * @param deltaSeconds - Time elapsed in seconds
 * @returns New heat value after decay
 */
export function calculateHeatDecay(currentHeat: number, deltaSeconds: number): number {
  if (currentHeat <= 0 || deltaSeconds <= 0) return currentHeat;
  return currentHeat * Math.exp(-HEAT_DECAY_RATE * deltaSeconds);
}

/**
 * Calculates starting skill points based on trust level.
 * Higher trust = more skill points to spend at the start of a run.
 * This is the core prestige reward for clean escapes.
 *
 * Formula: floor(trust - 1) * SKILL_POINTS_PER_TRUST
 * - Trust 1: 0 SP (fresh player, no bonus)
 * - Trust 11: 10 SP (one clean escape from start)
 * - Trust 21: 20 SP (two clean escapes)
 *
 * @param trust - The player's current trust value
 * @returns The number of skill points to start with
 */
export function calculateStartingSkillPoints(trust: number): number {
  return Math.floor(Math.max(0, trust - 1)) * SKILL_POINTS_PER_TRUST;
}

/**
 * Checks if a scam tier is accessible based on trust level.
 * Higher tiers require more trust, earned through clean escapes.
 *
 * @param tier - The scam tier to check
 * @param trust - The player's current trust value
 * @returns True if the tier is accessible
 */
export function isTierAccessible(tier: ScamTier, trust: number): boolean {
  return trust >= TIER_TRUST_REQUIREMENTS[tier];
}

/**
 * Gets the trust required to unlock a specific tier.
 *
 * @param tier - The scam tier
 * @returns The minimum trust needed to access that tier
 */
export function getTierTrustRequirement(tier: ScamTier): number {
  return TIER_TRUST_REQUIREMENTS[tier];
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
