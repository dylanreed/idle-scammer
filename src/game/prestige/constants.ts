// ABOUTME: Constants for the prestige system
// ABOUTME: Defines heat thresholds, trust modifiers, and resource keep percentages

import type { ScamTier } from '../scams/types';

/**
 * Maximum heat before forced prestige (flee the country).
 * At this point, the cops are onto you and you must escape.
 */
export const MAX_HEAT = 100;

/**
 * Graduated heat parameters.
 * Heat per completion scales with log10(baseCost), so cheap scams
 * barely register while expensive scams attract serious attention.
 */
export const MIN_HEAT_PER_COMPLETION = 0.005;
export const MAX_HEAT_PER_COMPLETION = 0.5;
export const MIN_HEAT_LOG_COST = 1;  // log10(10) - cheapest scam
export const MAX_HEAT_LOG_COST = 36; // log10(~10^36) - most expensive scam with ratio 5

/**
 * Tier discount multipliers for heat generation.
 * Higher-tier scammers run tighter operations, generating
 * proportionally less heat per dollar of scam value.
 *
 * Tier 1 (Small Time): 1.0x - Amateur hour, sloppy
 * Tier 2 (Getting Serious): 0.6x - Getting careful
 * Tier 3 (Big Leagues): 0.35x - Professional operations
 * Tier 4 (Organized Crime): 0.2x - Tight ship
 * Tier 5 (Mastermind): 0.1x - Near-invisible
 */
export const HEAT_TIER_DISCOUNT: Record<ScamTier, number> = {
  1: 1.0,
  2: 0.6,
  3: 0.35,
  4: 0.2,
  5: 0.1,
};

/**
 * Heat decay rate (percentage per second, multiplicative).
 * Each second, heat is reduced by: heat × HEAT_DECAY_RATE.
 * Creates natural equilibrium: few scams = stable, full empire = pressure.
 */
export const HEAT_DECAY_RATE = 0.001;

/**
 * Trust-based heat decay boost multiplier.
 * Higher trust means your criminal network helps you cool off faster.
 * Formula: effectiveDecayRate = HEAT_DECAY_RATE * (1 + ln(trust) * TRUST_DECAY_BOOST)
 * Logarithmic growth gives a big first-prestige reward that tapers off.
 */
export const TRUST_DECAY_BOOST = 1.0;

/**
 * Performance-based trust gain weights.
 * Trust from clean escape = max(MIN_TRUST_GAIN, floor(
 *   TRUST_MONEY_WEIGHT * log10(max(money, 1)) +
 *   TRUST_COMPLETION_WEIGHT * sqrt(totalCompletions) +
 *   TRUST_LEVEL_WEIGHT * totalLevels
 * ))
 *
 * Diminishing returns on money (log), sqrt on completions, linear on levels.
 */
export const TRUST_MONEY_WEIGHT = 0.5;
export const TRUST_COMPLETION_WEIGHT = 0.1;
export const TRUST_LEVEL_WEIGHT = 0.03;
export const MIN_TRUST_GAIN = 1;

/**
 * Fraction of trust lost when snitching.
 * Snitching costs 50% of your current trust (floor, minimum trust = 1).
 * The criminal underworld doesn't forget rats.
 */
export const SNITCH_TRUST_PERCENT = 0.5;

/**
 * Employee cost inflation per lifetime snitch.
 * Each snitch permanently increases all employee costs by 1%.
 * Multiplier = 1 + (SNITCH_EMPLOYEE_COST_PENALTY * snitchCount).
 */
export const SNITCH_EMPLOYEE_COST_PENALTY = 0.01;

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
 * Tier 2: Trust 50 (several clean escapes)
 * Tier 3: Trust 150 (many clean escapes)
 * Tier 4: Trust 350 (dedicated grind)
 * Tier 5: Trust 700 (endgame mastery)
 */
export const TIER_TRUST_REQUIREMENTS: Record<ScamTier, number> = {
  1: 1,
  2: 50,
  3: 150,
  4: 350,
  5: 700,
};
