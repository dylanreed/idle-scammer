// ABOUTME: Calculation functions for scam duration, rewards, and upgrade costs
// ABOUTME: Accumulating profits with exponential costs to encourage progression

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
 * Profit increment rate.
 * Each level adds (level × this rate) to the accumulated profit.
 */
const PROFIT_INCREMENT_RATE = 1.01;

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
 * Cost growth rates by level bracket.
 * Each rate is the per-level multiplier for that bracket.
 * Costs accelerate dramatically at higher levels.
 */
const COST_BRACKETS: { maxLevel: number; rate: number }[] = [
  { maxLevel: 9, rate: 1.05 },      // Modest growth early
  { maxLevel: 24, rate: 1.16 },     // Picking up
  { maxLevel: 49, rate: 1.35 },     // Aggressive
  { maxLevel: 74, rate: 1.58 },     // Explosive
  { maxLevel: 99, rate: 1.78 },     // Astronomical
  { maxLevel: Infinity, rate: 2.0 }, // Cosmic
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
 * Calculates the accumulated profit bonus for a given level.
 * Each level adds (level × PROFIT_INCREMENT_RATE) to the total.
 * This creates steadily increasing gains per level.
 *
 * Formula: sum of (i × 1.01) for i from 2 to level
 *        = 1.01 × (sum of i from 2 to level)
 *        = 1.01 × ((level × (level + 1) / 2) - 1)
 *
 * @param level - Current scam level (1-based)
 * @returns Accumulated profit bonus to add to base reward
 */
export function calculateProfitBonus(level: number): number {
  if (level <= 1) {
    return 0;
  }

  // Sum of integers from 2 to level = (level × (level + 1) / 2) - 1
  const sumOfLevels = (level * (level + 1)) / 2 - 1;
  return sumOfLevels * PROFIT_INCREMENT_RATE;
}

/**
 * Calculates the reward for completing a scam at a given level and trust.
 * Profit accumulates: each level adds (level × 1.01) to the previous profit.
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
  const { baseReward, resourceType } = definition;

  // Calculate accumulated profit: base + bonus from all levels
  const profitBonus = calculateProfitBonus(level);
  const levelProfit = baseReward + profitBonus;

  // Apply bracket-based profit bonus multiplier (1.25x at 10+, 2x at 25+, etc.)
  const bracketBonus = getProfitBonusMultiplier(level);

  // Bot compound bonus only applies to bot-type rewards
  const botMultiplier =
    resourceType === 'bots' ? calculateBotMultiplier(currentBots) : 1;

  // Trust is a direct multiplier
  const totalReward = levelProfit * bracketBonus * trust * botMultiplier;

  // Return fractional value for incremental accumulation
  return totalReward;
}

/**
 * Calculates the cost multiplier using exponential growth with bracket acceleration.
 * Cost grows faster at higher level brackets, eventually far outpacing profit.
 *
 * @param level - Current scam level (1-based)
 * @returns Cost multiplier
 */
export function calculateCostMultiplier(level: number): number {
  if (level <= 1) {
    return 1;
  }

  // Calculate cumulative cost through all brackets
  let multiplier = 1;
  let currentLevel = 1;

  for (const bracket of COST_BRACKETS) {
    if (currentLevel > level) break;

    const bracketEnd = Math.min(bracket.maxLevel, level);
    const levelsInBracket = bracketEnd - currentLevel + 1;

    if (levelsInBracket > 0) {
      // Apply this bracket's rate for each level in it
      multiplier *= Math.pow(bracket.rate, levelsInBracket);
    }

    currentLevel = bracketEnd + 1;
  }

  return multiplier;
}

/**
 * Calculates the cost to upgrade a scam to the next level.
 * Uses exponential growth with bracket-based acceleration.
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

  // Base cost comes from tier's initialCost in the economic spreadsheet
  const tierBase = getTierBase(tier);
  const baseCost = tierBase.initialCost;

  // Exponential cost growth with bracket acceleration
  const costMultiplier = calculateCostMultiplier(level);

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
