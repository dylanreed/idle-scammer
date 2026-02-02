// ABOUTME: Calculation functions for scam duration, rewards, and upgrade costs
// ABOUTME: Implements bracket-based level scaling with trust multiplier for idle game progression

import type { ScamDefinition } from './types';
import {
  calculateCumulativeBonus,
  getTierBase,
} from '../economy/constants';

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
 * Base speed percentage per tier.
 * Higher tiers scale slower (longer time to reach max speed).
 * This is multiplied by bracket speedMult to get actual rate.
 */
const SPEED_BASE_RATES: Record<number, number> = {
  1: 1.0,
  2: 0.9,
  3: 0.8,
  4: 0.7,
  5: 0.6,
  6: 0.5,
  7: 0.45,
  8: 0.4,
  9: 0.35,
  10: 0.3,
};

/**
 * Base profit percentage per tier for bracket calculations.
 * All tiers use 1.0 for consistent scaling (bracket multipliers do the work).
 */
const PROFIT_BASE_RATES: Record<number, number> = {
  1: 1.0,
  2: 1.0,
  3: 1.0,
  4: 1.0,
  5: 1.0,
  6: 1.0,
  7: 1.0,
  8: 1.0,
  9: 1.0,
  10: 1.0,
};

/**
 * Base cost percentage per tier for bracket calculations.
 * All tiers use 1.0 for consistent scaling (bracket multipliers do the work).
 */
const COST_BASE_RATES: Record<number, number> = {
  1: 1.0,
  2: 1.0,
  3: 1.0,
  4: 1.0,
  5: 1.0,
  6: 1.0,
  7: 1.0,
  8: 1.0,
  9: 1.0,
  10: 1.0,
};

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
  const { baseDuration, tier } = definition;
  const speedBaseRate = SPEED_BASE_RATES[tier] ?? SPEED_BASE_RATES[1];

  // Calculate speed multiplier from bracket bonuses
  const speedMultiplier = calculateCumulativeBonus(level, speedBaseRate, 'speedMult');

  // Duration decreases as speed increases
  const calculatedDuration = baseDuration / speedMultiplier;
  const minimumDuration = baseDuration * MIN_DURATION_PERCENTAGE;

  return Math.max(Math.round(calculatedDuration), Math.round(minimumDuration));
}

/**
 * Calculates the reward for completing a scam at a given level and trust.
 * Uses bracket-based profit scaling.
 * Trust directly multiplies all rewards.
 * For bot-type rewards, bots owned provide a compound bonus (+1% per bot).
 *
 * @param definition - The scam definition
 * @param level - Current scam level (1-based)
 * @param trust - Player's trust value (prestige multiplier, starts at 1)
 * @param currentBots - Number of bots owned (for compound bonus on bot rewards)
 * @returns Reward amount (floored to integer)
 */
export function calculateScamReward(
  definition: ScamDefinition,
  level: number,
  trust: number,
  currentBots: number = 0
): number {
  const { baseReward, resourceType, tier } = definition;
  const profitBaseRate = PROFIT_BASE_RATES[tier] ?? PROFIT_BASE_RATES[1];

  // Calculate profit multiplier from bracket bonuses
  const levelMultiplier = calculateCumulativeBonus(level, profitBaseRate, 'profitMult');

  // Bot compound bonus only applies to bot-type rewards
  const botMultiplier =
    resourceType === 'bots' ? calculateBotMultiplier(currentBots) : 1;

  // Trust is a direct multiplier
  const totalReward = baseReward * levelMultiplier * trust * botMultiplier;

  // Floor to integer (no fractional resources)
  return Math.floor(totalReward);
}

/**
 * Base upgrade cost multiplied by tier.
 * Tier 1 costs start at $10, tier 10 costs start at $100.
 */
const BASE_UPGRADE_COST = 10;

/**
 * Calculates the cost to upgrade a scam to the next level.
 * Uses bracket-based cost scaling.
 * Higher tiers have higher base costs.
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
  const costBaseRate = COST_BASE_RATES[tier] ?? COST_BASE_RATES[1];

  // Base cost scales with tier: $10 for tier 1, $100 for tier 10
  const baseCost = BASE_UPGRADE_COST * tier;

  // Calculate cost multiplier from bracket bonuses
  const costMultiplier = calculateCumulativeBonus(level, costBaseRate, 'costMult');

  // Apply the multiplier to base cost
  const cost = baseCost * costMultiplier;

  // Floor to integer
  return Math.floor(cost);
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
