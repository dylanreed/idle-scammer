// ABOUTME: Constants for the prestige system
// ABOUTME: Defines heat thresholds, trust modifiers, and resource keep percentages

import type { ScamTier } from '../scams/types';

/**
 * Maximum heat before forced prestige (flee the country).
 * At this point, the cops are onto you and you must escape.
 */
export const MAX_HEAT = 100;

/**
 * Heat generated per scam completion, indexed by scam tier.
 * Higher tier scams generate more police attention.
 *
 * Tier 1 (Small Time): 0.5 heat - Barely registers
 * Tier 2 (Getting Serious): 1 heat - Starting to get noticed
 * Tier 3 (Big Leagues): 2 heat - Police are paying attention
 * Tier 4 (Organized Crime): 3 heat - Feds are involved
 * Tier 5 (Mastermind): 5 heat - International task force
 */
export const HEAT_PER_SCAM_TIER: Record<ScamTier, number> = {
  1: 0.5,
  2: 1,
  3: 2,
  4: 3,
  5: 5,
};

/**
 * Trust gained from a clean escape.
 * Rewarding players who don't betray their criminal network.
 */
export const CLEAN_ESCAPE_TRUST_GAIN = 10;

/**
 * Trust penalty from snitching (negative number).
 * The criminal underworld doesn't forget rats.
 */
export const SNITCH_TRUST_PENALTY = -5;

/**
 * Percentage of resources kept when snitching.
 * The feds give you a cut, but at what cost to your reputation?
 */
export const SNITCH_RESOURCE_KEEP_PERCENT = 0.1;

/**
 * Skill points granted per point of trust above 1.
 * Formula: startingSP = floor(trust - 1) * SKILL_POINTS_PER_TRUST
 *
 * At trust 1: 0 SP (fresh start)
 * At trust 2: 1 SP
 * At trust 11: 10 SP (one clean escape from start)
 */
export const SKILL_POINTS_PER_TRUST = 1;

/**
 * Minimum trust required to access each scam tier.
 * Players must build trust through clean escapes to unlock higher tiers.
 *
 * Tier 1: Trust 1 (default - everyone starts here)
 * Tier 2: Trust 11 (one clean escape)
 * Tier 3: Trust 21 (two clean escapes)
 * Tier 4: Trust 31 (three clean escapes)
 * Tier 5: Trust 41 (four clean escapes)
 */
export const TIER_TRUST_REQUIREMENTS: Record<ScamTier, number> = {
  1: 1,
  2: 11,
  3: 21,
  4: 31,
  5: 41,
};
