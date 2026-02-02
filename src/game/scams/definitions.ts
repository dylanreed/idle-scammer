// ABOUTME: Scam definitions including Bot Farms (the first playable scam)
// ABOUTME: Bot Farms is special - it generates bots, the foundational resource

import type { ScamDefinition } from './types';

/**
 * Bot Farms - The first and foundational scam in the game.
 *
 * This scam is unique because:
 * - It generates BOTS instead of money
 * - Bots are spent to upgrade other scams
 * - It's free to unlock (no unlockCost)
 * - Fast 1-second timer for early game satisfaction
 *
 * This is the entry point to all gameplay. Players must run Bot Farms
 * to accumulate bots before they can upgrade and unlock other scams.
 */
export const BOT_FARMS: ScamDefinition = {
  id: 'bot-farms',
  name: 'Bot Farms',
  tier: 1,
  baseDuration: 1000, // 1 second - fast for early game feel-good
  baseReward: 1, // 1 bot per completion
  resourceType: 'bots', // This scam gives bots, not money!
  description: 'Deploy autonomous bots to do your bidding',
  unlockCost: undefined, // Free to start - this is the first scam
};
