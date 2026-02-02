// ABOUTME: Economic constants for bracket-based scaling system
// ABOUTME: Defines level brackets, multipliers, and base values per scam tier

/**
 * Level brackets and their multipliers.
 * Each bracket defines the scaling rates for that level range.
 */
export interface LevelBracket {
  /** Maximum level for this bracket (inclusive) */
  maxLevel: number;
  /** Speed multiplier (higher = faster completion) */
  speedMult: number;
  /** Profit multiplier (higher = more rewards) */
  profitMult: number;
  /** Cost multiplier (higher = more expensive upgrades) */
  costMult: number;
}

/**
 * Level brackets for scaling.
 * profitMult/costMult: percentage bonus per level (multiplied by tierBase)
 * speedMult: speed increase per level (multiplied by tierBase)
 * Values scaled for meaningful progression even with small base values.
 * At level 10: ~10% bonus, level 25: ~25% bonus, level 100: ~200%+ bonus
 */
export const LEVEL_BRACKETS: LevelBracket[] = [
  { maxLevel: 25, speedMult: 1.0, profitMult: 3.0, costMult: 5.0 },
  { maxLevel: 50, speedMult: 2.0, profitMult: 5.0, costMult: 8.0 },
  { maxLevel: 75, speedMult: 4.0, profitMult: 8.0, costMult: 12.0 },
  { maxLevel: 100, speedMult: 8.0, profitMult: 12.0, costMult: 18.0 },
  { maxLevel: 150, speedMult: 16.0, profitMult: 18.0, costMult: 25.0 },
  { maxLevel: 250, speedMult: 32.0, profitMult: 25.0, costMult: 35.0 },
  { maxLevel: 500, speedMult: 64.0, profitMult: 35.0, costMult: 50.0 },
  { maxLevel: 1000, speedMult: 128.0, profitMult: 50.0, costMult: 70.0 },
];

/**
 * Base values for each scam tier (1-10).
 * These define the starting point before level scaling.
 */
export interface ScamTierBase {
  /** Tier number (1-10) */
  tier: number;
  /** Initial unlock/purchase cost */
  initialCost: number;
  /** Base profit per completion at level 1 */
  initialProfit: number;
  /** Base duration in milliseconds */
  baseDuration: number;
}

/**
 * Base values for all 10 scam tiers from the economic spreadsheet.
 */
export const SCAM_TIER_BASES: ScamTierBase[] = [
  { tier: 1, initialCost: 1, initialProfit: 0.1, baseDuration: 1000 },
  { tier: 2, initialCost: 100, initialProfit: 10, baseDuration: 2000 },
  { tier: 3, initialCost: 1000, initialProfit: 100, baseDuration: 5000 },
  { tier: 4, initialCost: 15000, initialProfit: 150, baseDuration: 10000 },
  { tier: 5, initialCost: 50000, initialProfit: 500, baseDuration: 30000 },
  { tier: 6, initialCost: 100000, initialProfit: 1000, baseDuration: 60000 },
  { tier: 7, initialCost: 250000, initialProfit: 2500, baseDuration: 120000 },
  { tier: 8, initialCost: 500000, initialProfit: 5000, baseDuration: 300000 },
  { tier: 9, initialCost: 1000000, initialProfit: 10000, baseDuration: 600000 },
  { tier: 10, initialCost: 5000000, initialProfit: 50000, baseDuration: 1200000 },
];

/**
 * Get the tier base values for a given tier number.
 * Returns tier 1 if tier is out of range.
 */
export function getTierBase(tier: number): ScamTierBase {
  const base = SCAM_TIER_BASES.find((b) => b.tier === tier);
  return base ?? SCAM_TIER_BASES[0];
}

/**
 * Get the bracket for a given level.
 * Returns the last bracket if level exceeds all brackets.
 */
export function getBracketForLevel(level: number): LevelBracket {
  for (const bracket of LEVEL_BRACKETS) {
    if (level <= bracket.maxLevel) {
      return bracket;
    }
  }
  // Return last bracket for very high levels
  return LEVEL_BRACKETS[LEVEL_BRACKETS.length - 1];
}

/**
 * Calculate cumulative bonus from all brackets up to a level.
 * Level 1 has no bonus (base stats). Each level above 1 adds bonus.
 * Each level in a bracket adds (bracketMult * tierBase) to the total.
 *
 * @param level - Current level (1-based, level 1 = no bonus)
 * @param tierBase - Base percentage per level for this tier
 * @param multiplierKey - Which multiplier to use ('speedMult', 'profitMult', 'costMult')
 * @returns Total cumulative bonus as a multiplier (1.0 = no bonus)
 */
export function calculateCumulativeBonus(
  level: number,
  tierBase: number,
  multiplierKey: 'speedMult' | 'profitMult' | 'costMult'
): number {
  // Level 1 means no bonus levels accumulated
  if (level <= 1) {
    return 1;
  }

  // Calculate bonus for levels 2 through 'level'
  // This is (level - 1) bonus levels total
  const bonusLevels = level - 1;
  let totalBonus = 0;
  let levelsProcessed = 0;
  let prevMaxLevel = 0;

  for (const bracket of LEVEL_BRACKETS) {
    if (levelsProcessed >= bonusLevels) break;

    // How many bonus levels fall in this bracket?
    // Bracket covers levels (prevMaxLevel + 1) to bracket.maxLevel
    // We need bonus levels 1 to bonusLevels (mapped to actual levels 2 to level)
    const bracketCapacity = bracket.maxLevel - prevMaxLevel;
    const levelsInThisBracket = Math.min(
      bracketCapacity,
      bonusLevels - levelsProcessed
    );

    if (levelsInThisBracket > 0) {
      // Each bonus level adds (multiplier × tierBase) percent
      totalBonus += levelsInThisBracket * bracket[multiplierKey] * tierBase;
      levelsProcessed += levelsInThisBracket;
    }

    prevMaxLevel = bracket.maxLevel;
  }

  // Handle bonus levels beyond last bracket
  if (levelsProcessed < bonusLevels) {
    const lastBracket = LEVEL_BRACKETS[LEVEL_BRACKETS.length - 1];
    const extraLevels = bonusLevels - levelsProcessed;
    totalBonus += extraLevels * lastBracket[multiplierKey] * tierBase;
  }

  // Return as multiplier (1.0 + bonus percentage)
  return 1 + totalBonus / 100;
}
