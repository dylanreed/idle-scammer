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
 * Bot compound bonus rate (1% per bot owned).
 */
const BOT_COMPOUND_RATE = 0.01;

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
 * @param currentBots - Current bot count (for bot-type rewards)
 * @returns One-time cash bonus (0 if not a milestone level)
 */
export function calculateMilestoneBonus(
  definition: ScamDefinition,
  level: number,
  trust: number = 1,
  currentBots: number = 0
): number {
  const milestoneMultiplier = getMilestoneMultiplier(level);
  if (milestoneMultiplier === 0) {
    return 0;
  }

  // Get the current reward at this level (includes linear growth, bracket bonus, trust)
  const currentReward = calculateScamReward(definition, level, trust, currentBots);

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
  level: number
): number {
  const { baseDuration } = definition;
  const speedMultiplier = getSpeedMultiplier(level);
  const calculatedDuration = baseDuration / speedMultiplier;
  const minimumDuration = baseDuration * MIN_DURATION_PERCENTAGE;

  return Math.max(Math.round(calculatedDuration), Math.round(minimumDuration));
}

/**
 * Calculates the reward for completing a scam.
 *
 * For money scams (Kongregate-style):
 * reward = baseReward × (1 + level × profitGrowth) × bracketBonus × trust
 * Where baseReward = unlockCost (or tier baseCost for free scams)
 *
 * For bot-generating scams:
 * Uses definition's baseReward directly (fractional accumulation)
 *
 * Note: Milestone bonuses are separate one-time payouts (see calculateMilestoneBonus)
 */
export function calculateScamReward(
  definition: ScamDefinition,
  level: number,
  trust: number,
  currentBots: number = 0
): number {
  const { unlockCost, tier, resourceType, baseReward: definitionBaseReward } = definition;
  const tierBase = getTierBase(tier);

  // Bot-generating scams use their definition's baseReward directly
  // (allows fractional rewards like 0.5 bots per completion)
  // Money scams use Kongregate economy: unlockCost = baseReward at L1
  const baseReward =
    resourceType === 'bots'
      ? definitionBaseReward
      : (unlockCost ?? tierBase.baseCost);

  // Linear growth: 10% more per level
  const linearMultiplier = 1 + (level - 1) * tierBase.profitGrowth;

  // Bracket bonus (ongoing multiplier based on level range)
  const bracketBonus = getProfitBonusMultiplier(level);

  // Bot compound bonus only for bot-type rewards
  const botMultiplier =
    resourceType === 'bots' ? calculateBotMultiplier(currentBots) : 1;

  // Trust is a direct multiplier
  return baseReward * linearMultiplier * bracketBonus * trust * botMultiplier;
}

/**
 * Calculates the cost to upgrade a scam to the next level.
 *
 * Kongregate-style simple exponential:
 * cost = baseCost × costRate^(level - 1)
 *
 * Where baseCost = unlockCost (or tier baseCost for free scams)
 */
export function calculateUpgradeCost(
  definition: ScamDefinition,
  level: number
): number {
  const { unlockCost, tier } = definition;
  const tierBase = getTierBase(tier);

  // Base cost = unlock cost (consistent with base reward)
  const baseCost = unlockCost ?? tierBase.baseCost;

  // Simple exponential: 15% increase per level
  const costMultiplier = Math.pow(tierBase.costRate, level - 1);

  return Math.max(1, Math.floor(baseCost * costMultiplier));
}

/**
 * Calculates the bot compound multiplier.
 * Each bot gives +1% bonus to bot-type rewards.
 */
export function calculateBotMultiplier(currentBots: number): number {
  return 1 + currentBots * BOT_COMPOUND_RATE;
}

/**
 * Calculates the price to purchase the next bot.
 * Uses quadratic scaling: $100 × (currentBots + 1)²
 *
 * This makes bots expensive at scale, encouraging investment
 * in Bot Farms for passive generation instead.
 */
export function calculateBotPurchasePrice(currentBots: number): number {
  return 100 * Math.pow(currentBots + 1, 2);
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
