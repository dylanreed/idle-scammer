// ABOUTME: Calculation functions for scam duration, rewards, and upgrade costs
// ABOUTME: Uses tier-specific exponents and rates for triangular cost growth

import type { ScamDefinition } from './types';
import { getTierBase } from '../economy/constants';

/**
 * Minimum duration as a percentage of base.
 * Prevents durations from becoming too short at high levels.
 */
const MIN_DURATION_PERCENTAGE = 0.1;

/**
 * Bot compound bonus rate.
 * Each bot owned gives this percentage bonus to bot rewards.
 * 1% per bot means 100 bots = 100% bonus = 2x bot rewards.
 */
const BOT_COMPOUND_RATE = 0.01;

/**
 * Base price for purchasing bots directly.
 * Actual price scales quadratically: BASE × (bots + 1)²
 */
const BOT_PURCHASE_BASE_PRICE = 100;

/**
 * Speed multipliers by level bracket.
 * Higher brackets = faster completion times.
 */
const SPEED_BRACKETS: { maxLevel: number; multiplier: number }[] = [
  { maxLevel: 9, multiplier: 1.0 },
  { maxLevel: 24, multiplier: 1.25 },
  { maxLevel: 49, multiplier: 2.0 },
  { maxLevel: 74, multiplier: 5.0 },
  { maxLevel: 99, multiplier: 7.5 },
  { maxLevel: Infinity, multiplier: 10.0 },
];

/**
 * Profit bonus multipliers by level bracket.
 * These milestone bonuses reward reaching higher levels.
 */
const PROFIT_BONUS_BRACKETS: { maxLevel: number; multiplier: number }[] = [
  { maxLevel: 9, multiplier: 1.0 },
  { maxLevel: 24, multiplier: 1.25 },
  { maxLevel: 49, multiplier: 2.0 },
  { maxLevel: 74, multiplier: 5.0 },
  { maxLevel: 99, multiplier: 7.5 },
  { maxLevel: Infinity, multiplier: 10.0 },
];

/**
 * Gets the speed multiplier for a given level based on brackets.
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
 * Gets the profit bonus multiplier for a given level based on brackets.
 * 1.0x for levels 1-9, 1.25x for 10-24, 2x for 25-49, etc.
 */
export function getProfitBonusMultiplier(level: number): number {
  for (const bracket of PROFIT_BONUS_BRACKETS) {
    if (level <= bracket.maxLevel) {
      return bracket.multiplier;
    }
  }
  return PROFIT_BONUS_BRACKETS[PROFIT_BONUS_BRACKETS.length - 1].multiplier;
}

/**
 * Calculates the duration of a scam at a given level.
 * Higher levels = shorter duration using bracket-based speed bonuses.
 * Speed bonus reduces duration: duration = base / speedMultiplier
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

  // Get speed multiplier from bracket
  const speedMultiplier = getSpeedMultiplier(level);

  // Duration decreases as speed increases
  const calculatedDuration = baseDuration / speedMultiplier;
  const minimumDuration = baseDuration * MIN_DURATION_PERCENTAGE;

  return Math.max(Math.round(calculatedDuration), Math.round(minimumDuration));
}

/**
 * Calculates triangular number: n × (n + 1) / 2
 * Used for triangular exponentiation in cost formula.
 */
function triangular(n: number): number {
  return (n * (n + 1)) / 2;
}

/**
 * Calculates profit for Tier 1 using linear accumulation.
 * Profit grows by ~0.81 per level after initial ramp-up.
 * Based on spreadsheet: rate 0.45 with linear increments.
 *
 * @param baseProfit - Base profit at level 1
 * @param level - Current scam level (1-based)
 * @param rate - Profit rate from tier config
 * @returns Raw profit before bracket bonus
 */
function calculateTier1Profit(baseProfit: number, level: number, rate: number): number {
  if (level <= 1) {
    return baseProfit;
  }

  // Linear growth with rate as base increment, scaling up slightly per level
  // This approximates the spreadsheet pattern where increments stabilize around 0.81
  const baseIncrement = rate * 1.8; // ~0.81 for tier 1
  let profit = baseProfit;

  for (let i = 2; i <= level; i++) {
    // Early levels have smaller increments that ramp up
    const levelFactor = Math.min(1, (i - 1) / 5);
    const increment = baseIncrement * (0.5 + 0.5 * levelFactor);
    profit += increment;
  }

  return profit;
}

/**
 * Calculates profit for Tier 2+ using exponential growth.
 * Profit grows as baseProfit × rate^(level-1).
 *
 * @param baseProfit - Base profit at level 1
 * @param level - Current scam level (1-based)
 * @param rate - Profit rate from tier config (multiplier per level)
 * @returns Raw profit before bracket bonus
 */
function calculateExponentialProfit(baseProfit: number, level: number, rate: number): number {
  if (level <= 1) {
    return baseProfit;
  }

  return baseProfit * Math.pow(rate, level - 1);
}

/**
 * Calculates the reward for completing a scam at a given level and trust.
 * Uses tier-specific profit formulas:
 * - Tier 1: Linear accumulation (~0.81 per level after ramp-up)
 * - Tier 2+: Exponential growth (rate^(level-1))
 *
 * Trust directly multiplies all rewards.
 * For bot-type rewards, bots owned provide a compound bonus (+1% per bot).
 *
 * Returns fractional values to support incremental accumulation.
 * Display code should floor values when showing to users.
 *
 * @param definition - The scam definition
 * @param level - Current scam level (1-based)
 * @param trust - Player's trust value (prestige multiplier, starts at 1)
 * @param currentBots - Number of bots owned (for compound bonus on bot rewards)
 * @returns Reward amount (may be fractional for incremental accumulation)
 */
export function calculateScamReward(
  definition: ScamDefinition,
  level: number,
  trust: number,
  currentBots: number = 0
): number {
  const { baseReward, tier, resourceType } = definition;
  const tierBase = getTierBase(tier);

  // Calculate raw profit using tier-specific formula
  // Uses scam's baseReward but tier's profitRate for scaling
  let rawProfit: number;
  if (tier === 1) {
    // Tier 1 uses linear accumulation
    rawProfit = calculateTier1Profit(baseReward, level, tierBase.profitRate);
  } else {
    // Tier 2+ uses exponential growth
    rawProfit = calculateExponentialProfit(baseReward, level, tierBase.profitRate);
  }

  // Apply bracket-based profit bonus multiplier (1.25x at 10+, 2x at 25+, etc.)
  const bracketBonus = getProfitBonusMultiplier(level);

  // Bot compound bonus only applies to bot-type rewards
  const botMultiplier =
    resourceType === 'bots' ? calculateBotMultiplier(currentBots) : 1;

  // Trust is a direct multiplier
  const totalReward = rawProfit * bracketBonus * trust * botMultiplier;

  // Return fractional value for incremental accumulation
  return totalReward;
}

/**
 * Calculates the cost multiplier using triangular exponentiation.
 * Cost formula: exponent^(triangular(n) - 1)
 * This creates super-exponential growth where each level's multiplier increases.
 *
 * @param level - Current scam level (1-based)
 * @param exponent - Cost exponent from tier config
 * @returns Cost multiplier
 */
export function calculateCostMultiplier(level: number, exponent: number): number {
  if (level <= 1) {
    return 1;
  }

  // Triangular exponentiation: exponent^(triangular(n) - 1)
  // This means L1→L2 grows by exponent^1, L2→L3 by exponent^2, etc.
  const triangularValue = triangular(level) - 1;
  return Math.pow(exponent, triangularValue);
}

/**
 * Calculates the cost to upgrade a scam to the next level.
 * Uses triangular exponentiation: baseCost × exponent^(triangular(n) - 1)
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

  // Get tier config
  const tierBase = getTierBase(tier);
  const baseCost = tierBase.initialCost;
  const exponent = tierBase.costExponent;

  // Triangular exponential cost growth
  const costMultiplier = calculateCostMultiplier(level, exponent);

  // Apply the multiplier to base cost
  const cost = baseCost * costMultiplier;

  // Floor to integer (minimum $1)
  return Math.max(1, Math.floor(cost));
}

/**
 * Calculates the bot compound multiplier based on current bots owned.
 * Each bot gives +1% bonus to bot-type rewards.
 *
 * Formula: 1 + (bots * 0.01)
 *
 * @param currentBots - Number of bots currently owned
 * @returns Multiplier for bot rewards (1.0 = no bonus, 2.0 = 100% bonus)
 */
export function calculateBotMultiplier(currentBots: number): number {
  return 1 + currentBots * BOT_COMPOUND_RATE;
}

/**
 * Calculates the price to purchase one bot directly.
 * Uses quadratic scaling to make bots expensive (they compound!).
 *
 * Formula: BASE × (currentBots + 1)²
 *
 * @param currentBots - Number of bots currently owned
 * @returns Price in money to buy one more bot
 */
export function calculateBotPurchasePrice(currentBots: number): number {
  return BOT_PURCHASE_BASE_PRICE * Math.pow(currentBots + 1, 2);
}
