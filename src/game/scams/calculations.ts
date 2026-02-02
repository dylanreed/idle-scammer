// ABOUTME: Calculation functions for scam duration, rewards, and upgrade costs
// ABOUTME: Implements level scaling with trust multiplier for idle game progression

import type { ScamDefinition } from './types';

/**
 * Duration reduction per level.
 * Each level reduces duration by this percentage (compounding).
 * 5% per level means level 10 is about 63% of original duration.
 */
const DURATION_REDUCTION_PER_LEVEL = 0.05;

/**
 * Minimum duration as a percentage of base.
 * Prevents durations from becoming too short at high levels.
 */
const MIN_DURATION_PERCENTAGE = 0.1;

/**
 * Reward increase per level.
 * Each level adds this percentage to the base reward (linear).
 * 10% per level means level 10 gives 190% of base reward.
 */
const REWARD_INCREASE_PER_LEVEL = 0.1;

/**
 * Base cost for upgrading (multiplied by tier).
 */
const BASE_UPGRADE_COST = 10;

/**
 * Exponential growth rate for upgrade costs.
 * 1.15 means each level costs ~15% more than the previous.
 */
const UPGRADE_COST_GROWTH_RATE = 1.15;

/**
 * Calculates the duration of a scam at a given level.
 * Higher levels = shorter duration (diminishing returns curve).
 *
 * Formula: baseDuration * (1 - reduction)^(level-1), floored at 10% of base
 *
 * @param definition - The scam definition
 * @param level - Current scam level (1-based)
 * @returns Duration in milliseconds
 */
export function calculateScamDuration(
  definition: ScamDefinition,
  level: number
): number {
  const { baseDuration } = definition;

  // Apply diminishing returns reduction: (1 - rate)^(level-1)
  const reductionFactor = Math.pow(1 - DURATION_REDUCTION_PER_LEVEL, level - 1);

  // Calculate duration with minimum threshold
  const calculatedDuration = baseDuration * reductionFactor;
  const minimumDuration = baseDuration * MIN_DURATION_PERCENTAGE;

  return Math.max(Math.round(calculatedDuration), Math.round(minimumDuration));
}

/**
 * Calculates the reward for completing a scam at a given level and trust.
 * Higher levels = higher rewards (linear scaling).
 * Trust directly multiplies all rewards.
 *
 * Formula: floor(baseReward * (1 + (level-1) * rewardRate) * trust)
 *
 * @param definition - The scam definition
 * @param level - Current scam level (1-based)
 * @param trust - Player's trust value (prestige multiplier, starts at 1)
 * @returns Reward amount (floored to integer)
 */
export function calculateScamReward(
  definition: ScamDefinition,
  level: number,
  trust: number
): number {
  const { baseReward } = definition;

  // Linear level bonus: base * (1 + (level-1) * rate)
  const levelMultiplier = 1 + (level - 1) * REWARD_INCREASE_PER_LEVEL;

  // Trust is a direct multiplier
  const totalReward = baseReward * levelMultiplier * trust;

  // Floor to integer (no fractional resources)
  return Math.floor(totalReward);
}

/**
 * Calculates the cost to upgrade a scam to the next level.
 * Uses exponential scaling (idle game convention).
 * Higher tiers have higher base costs.
 *
 * Formula: floor(baseCost * tier * growthRate^(level-1))
 *
 * @param definition - The scam definition
 * @param level - Current level (cost to upgrade FROM this level)
 * @returns Cost to upgrade to next level (floored to integer)
 */
export function calculateUpgradeCost(
  definition: ScamDefinition,
  level: number
): number {
  const { tier } = definition;

  // Base cost scales with tier
  const tierMultiplier = BASE_UPGRADE_COST * tier;

  // Exponential growth: baseCost * growthRate^(level-1)
  const cost = tierMultiplier * Math.pow(UPGRADE_COST_GROWTH_RATE, level - 1);

  // Floor to integer
  return Math.floor(cost);
}
