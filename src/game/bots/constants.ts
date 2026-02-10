// ABOUTME: Constants for the bot system — generation rates, bonuses, and heat reduction
// ABOUTME: Defines how bots are earned per scam completion and what bonuses they provide

import type { ScamTier } from '../scams/types';

/**
 * Fractional bots generated per scam completion, by tier.
 * No scam ever generates a full bot in one completion — slow, incremental gains.
 */
export const BOT_GENERATION_RATES: Record<ScamTier, number> = {
  1: 0.0001,
  2: 0.001,
  3: 0.005,
  4: 0.02,
  5: 0.1,
};

/**
 * Speed bonus per speed bot assigned to a scam.
 * Duration is divided by (1 + SPEED_BOT_BONUS * speedBots).
 */
export const SPEED_BOT_BONUS = 0.1;

/**
 * Profit bonus per profit bot assigned to a scam.
 * Reward is multiplied by (1 + PROFIT_BOT_BONUS * profitBots).
 */
export const PROFIT_BOT_BONUS = 0.1;

/**
 * Heat reduction per unassigned (idle) bot.
 * Heat multiplier = 1 / (1 + IDLE_BOT_HEAT_REDUCTION * unassignedBots).
 * Creates tension: assign bots for growth vs. keep idle for safety.
 */
export const IDLE_BOT_HEAT_REDUCTION = 0.05;
