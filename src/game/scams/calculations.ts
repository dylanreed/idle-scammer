// ABOUTME: Calculation functions for scam duration, rewards, and upgrade costs
// ABOUTME: Uses Kongregate-style simple exponential cost and linear profit growth

import type { ScamDefinition } from './types';
import { getTierBase } from '../economy/constants';

/**
 * Milestone levels and their one-time bonus multipliers.
 * When upgrading TO these levels, player receives a bonus payout.
 */
const MILESTONE_BONUSES: { level: number; multiplier: number }[] = [
  { level: 10, multiplier: 2 },
  { level: 25, multiplier: 5 },
  { level: 50, multiplier: 10 },
  { level: 75, multiplier: 15 },
  { level: 100, multiplier: 25 },
];

/**
 * Bracket bonuses for ongoing profit at milestone levels.
 * These multipliers apply to all rewards within the bracket.
 */
const PROFIT_BRACKETS: { maxLevel: number; multiplier: number }[] = [
  { maxLevel: 9, multiplier: 1.0 },
  { maxLevel: 24, multiplier: 1.5 },
  { maxLevel: 49, multiplier: 2.5 },
  { maxLevel: 74, multiplier: 4.0 },
  { maxLevel: 99, multiplier: 6.0 },
  { maxLevel: Infinity, multiplier: 10.0 },
];

/**
 * Speed brackets - higher levels = faster completion.
 */
const SPEED_BRACKETS: { maxLevel: number; multiplier: number }[] = [
  { maxLevel: 9, multiplier: 1.0 },
  { maxLevel: 24, multiplier: 1.5 },
  { maxLevel: 49, multiplier: 2.0 },
  { maxLevel: 74, multiplier: 3.0 },
  { maxLevel: 99, multiplier: 5.0 },
  { maxLevel: Infinity, multiplier: 10.0 },
];

/**
 * Minimum duration as a percentage of base.
 */
const MIN_DURATION_PERCENTAGE = 0.1;

/**
 * Graduated cost rate parameters.
 * Cheap scams scale slowly (1.07), expensive scams scale faster (1.10).
 * Rate is interpolated linearly based on log10(baseCost).
 */
const MIN_COST_RATE = 1.07;
const MAX_COST_RATE = 1.10;
const MIN_LOG_COST = 1;  // log10(10) - cheapest scam ($10)
const MAX_LOG_COST = 25; // log10(~10^25) - most expensive scam (Central Bank Heists)

/**
 * Returns the graduated cost rate for a scam based on its effective baseCost.
 * Cheap scams ($10) get rate 1.07, expensive scams ($10Qi) get rate 1.10.
 * Intermediate values are linearly interpolated on the log10 scale.
 *
 * @param baseCost - The scam's effective base cost (unlockCost or tier baseCost)
 * @returns Cost rate between MIN_COST_RATE and MAX_COST_RATE
 */
export function getScamCostRate(baseCost: number): number {
  const logCost = Math.log10(Math.max(baseCost, 10));
  const t = Math.min(1, Math.max(0, (logCost - MIN_LOG_COST) / (MAX_LOG_COST - MIN_LOG_COST)));
  return MIN_COST_RATE + t * (MAX_COST_RATE - MIN_COST_RATE);
}

/**
 * Gets the profit bracket multiplier for a given level.
 */
export function getProfitBonusMultiplier(level: number): number {
  for (const bracket of PROFIT_BRACKETS) {
    if (level <= bracket.maxLevel) {
      return bracket.multiplier;
    }
  }
  return PROFIT_BRACKETS[PROFIT_BRACKETS.length - 1].multiplier;
}

/**
 * Gets the milestone multiplier for a specific level.
 * Returns 0 if not a milestone level.
 */
export function getMilestoneMultiplier(level: number): number {
  const milestone = MILESTONE_BONUSES.find((m) => m.level === level);
  return milestone?.multiplier ?? 0;
}

/**
 * Checks if a level is a milestone level.
 */
export function isMilestoneLevel(level: number): boolean {
  return MILESTONE_BONUSES.some((m) => m.level === level);
}

/**
 * Gets all milestone levels and their multipliers.
 * Useful for UI display.
 */
export function getAllMilestones(): { level: number; multiplier: number }[] {
  return [...MILESTONE_BONUSES];
}

/**
 * Calculates the one-time cash bonus for reaching a milestone level.
 * This bonus is added to player's money when upgrading TO the milestone.
 *
 * Bonus = currentReward × milestoneMultiplier
 * (where currentReward already includes trust)
 *
 * @param definition - The scam definition
 * @param level - The level being upgraded TO (must be a milestone)
 * @param trust - Player's trust multiplier
 * @returns One-time cash bonus (0 if not a milestone level)
 */
export function calculateMilestoneBonus(
  definition: ScamDefinition,
  level: number,
  trust: number = 1
): number {
  const milestoneMultiplier = getMilestoneMultiplier(level);
  if (milestoneMultiplier === 0) {
    return 0;
  }

  // Get the current reward at this level (includes linear growth, bracket bonus, trust)
  const currentReward = calculateScamReward(definition, level, trust);

  return currentReward * milestoneMultiplier;
}

/**
 * Gets the speed multiplier for a given level.
 */
export function getSpeedMultiplier(level: number): number {
  for (const bracket of SPEED_BRACKETS) {
    if (level <= bracket.maxLevel) {
      return bracket.multiplier;
    }
  }
  return SPEED_BRACKETS[SPEED_BRACKETS.length - 1].multiplier;
}

/**
 * Calculates the duration of a scam at a given level.
 * Higher levels = shorter duration via speed brackets.
 */
export function calculateScamDuration(
  definition: ScamDefinition,
  level: number,
  employeeSpeedBonus: number = 0,
  botSpeedBonus: number = 0
): number {
  const { baseDuration } = definition;
  const speedMultiplier = getSpeedMultiplier(level);
  const calculatedDuration = baseDuration / speedMultiplier;

  // Employee speed bonus reduces duration further (e.g., 0.5 = 50% faster)
  const withEmployeeBoost = calculatedDuration / (1 + employeeSpeedBonus);

  // Bot speed bonus reduces duration further (e.g., 0.3 = 30% faster from 3 speed bots)
  const withBotBoost = withEmployeeBoost / (1 + botSpeedBonus);

  const minimumDuration = baseDuration * MIN_DURATION_PERCENTAGE;

  return Math.max(Math.round(withBotBoost), Math.round(minimumDuration));
}

/**
 * Calculates the reward for completing a scam.
 *
 * reward = baseReward × (1 + level × profitGrowth) × bracketBonus × trust × botProfitMultiplier × employeeMultiplier
 * Where baseReward = unlockCost (or tier baseCost for free scams)
 *
 * Note: Milestone bonuses are separate one-time payouts (see calculateMilestoneBonus)
 */
export function calculateScamReward(
  definition: ScamDefinition,
  level: number,
  trust: number,
  botProfitBonus: number = 0,
  employeeRewardBonus: number = 0
): number {
  const { unlockCost, tier } = definition;
  const tierBase = getTierBase(tier);

  // Kongregate economy: unlockCost = baseReward at L1
  const baseReward = unlockCost ?? tierBase.baseCost;

  // Linear growth: 10% more per level
  const linearMultiplier = 1 + (level - 1) * tierBase.profitGrowth;

  // Bracket bonus (ongoing multiplier based on level range)
  const bracketBonus = getProfitBonusMultiplier(level);

  // Bot profit bonus from assigned profit bots
  const botProfitMultiplier = 1 + botProfitBonus;

  // Trust uses diminishing returns: trust^0.3 to prevent runaway scaling
  const trustMultiplier = Math.pow(trust, 0.3);

  // Employee reward bonus (e.g., 0.5 = +50% reward from hired employees)
  const employeeMultiplier = 1 + employeeRewardBonus;

  return baseReward * linearMultiplier * bracketBonus * trustMultiplier * botProfitMultiplier * employeeMultiplier;
}

/**
 * Calculates the cost to upgrade a scam to the next level.
 *
 * Graduated exponential:
 * cost = baseCost × getScamCostRate(baseCost)^(level - 1)
 *
 * Where baseCost = unlockCost (or tier baseCost for free scams),
 * and the cost rate scales from 1.07 (cheap scams) to 1.10 (expensive scams).
 */
export function calculateUpgradeCost(
  definition: ScamDefinition,
  level: number
): number {
  const { unlockCost, tier } = definition;
  const tierBase = getTierBase(tier);

  // Base cost = unlock cost (consistent with base reward)
  const baseCost = unlockCost ?? tierBase.baseCost;

  // Graduated exponential cost growth per level
  const costRate = getScamCostRate(baseCost);
  const costMultiplier = Math.pow(costRate, level - 1);

  return Math.max(1, Math.floor(baseCost * costMultiplier));
}

/**
 * Finds the level where upgrade cost exceeds reward.
 * This is the "crossover point" for a given scam.
 */
export function findCostProfitCrossover(
  definition: ScamDefinition,
  trust: number = 1
): number {
  for (let level = 1; level <= 100; level++) {
    const cost = calculateUpgradeCost(definition, level);
    const reward = calculateScamReward(definition, level, trust);

    if (cost > reward) {
      return level;
    }
  }
  return 100;
}

/**
 * Smooth progression of unlock costs for each tier.
 * Each tier costs roughly 100x the previous.
 */
const TIER_UNLOCK_COSTS: Record<number, number> = {
  2: 100_000,
  3: 10_000_000,
  4: 1_000_000_000,
  5: 100_000_000_000,
  6: 10_000_000_000_000,
  7: 1_000_000_000_000_000,
  8: 100_000_000_000_000_000,
  9: 10_000_000_000_000_000_000,
  10: 1_000_000_000_000_000_000_000,
};

/**
 * Gets the unlock cost for a tier (2-10).
 */
export function getTierUnlockCost(tier: number): number {
  if (tier <= 1) return 0;
  return TIER_UNLOCK_COSTS[tier] ?? 0;
}

/**
 * Calculates the unlock cost for the next tier.
 */
export function calculateNextTierUnlockCost(currentTier: number): number {
  return getTierUnlockCost(currentTier + 1);
}

/**
 * Legacy function for compatibility - now uses simple exponential.
 */
export function calculateCostMultiplier(level: number, rate: number): number {
  return Math.pow(rate, level - 1);
}

/**
 * Manager cost multiplier (relative to next scam/tier unlock).
 */
const MANAGER_COST_MULTIPLIER = 0.75;

/**
 * Calculates the manager cost for a scam.
 * Manager cost = 0.75 × next scam's unlock cost
 * For the last scam in a tier, uses 0.75 × next tier's unlock cost.
 *
 * @param nextUnlockCost - The unlock cost of the next scam or tier
 * @returns The manager cost
 */
export function calculateManagerCost(nextUnlockCost: number): number {
  return Math.floor(nextUnlockCost * MANAGER_COST_MULTIPLIER);
}

/**
 * Calculates the maximum number of upgrades a player can afford.
 * Uses the geometric series formula for exponential costs.
 *
 * @param definition - The scam definition
 * @param currentLevel - The scam's current level
 * @param money - Player's current money
 * @returns Maximum number of upgrades affordable (0 if none)
 */
export function calculateMaxBuyCount(
  definition: ScamDefinition,
  currentLevel: number,
  money: number
): number {
  const { unlockCost, tier } = definition;
  const tierBase = getTierBase(tier);
  const baseCost = unlockCost ?? tierBase.baseCost;
  const costRate = getScamCostRate(baseCost);

  // Cost of first upgrade (current level to next level)
  const firstUpgradeCost = baseCost * Math.pow(costRate, currentLevel - 1);
  if (money < firstUpgradeCost) return 0;

  // Geometric series sum: total = first × (r^N - 1) / (r - 1)
  // Solve for N: N = floor(log(money × (r-1) / first + 1) / log(r))
  const ratio = money * (costRate - 1) / firstUpgradeCost + 1;
  if (ratio <= 1) return 0;

  const maxCount = Math.floor(Math.log(ratio) / Math.log(costRate));
  return Math.max(0, maxCount);
}

/**
 * Calculates the total cost to buy N upgrades starting from currentLevel.
 * Uses geometric series sum formula.
 *
 * @param definition - The scam definition
 * @param currentLevel - The scam's current level
 * @param count - Number of upgrades to buy
 * @returns Total cost for all upgrades
 */
export function calculateMaxBuyCost(
  definition: ScamDefinition,
  currentLevel: number,
  count: number
): number {
  if (count <= 0) return 0;

  const { unlockCost, tier } = definition;
  const tierBase = getTierBase(tier);
  const baseCost = unlockCost ?? tierBase.baseCost;
  const costRate = getScamCostRate(baseCost);

  // Total = baseCost × r^(level-1) × (r^count - 1) / (r - 1)
  const firstUpgradeCost = baseCost * Math.pow(costRate, currentLevel - 1);
  const totalCost = firstUpgradeCost * (Math.pow(costRate, count) - 1) / (costRate - 1);

  return Math.floor(totalCost);
}
