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
 *
 * NOTE: These brackets are NOT used by the scam calculation pipeline.
 * The actual game uses PROFIT_BRACKETS and SPEED_BRACKETS defined in
 * scams/calculations.ts. These are retained for future tier-specific
 * bracket scaling if needed.
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
 *
 * Kongregate-style economy:
 * - Cost: baseCost × getScamCostRate(baseCost)^(level-1) (graduated exponential)
 * - Profit: base × (1 + level × profitGrowth) × bracketBonus (linear)
 *
 * Cost rate is graduated per-scam based on log10(baseCost):
 * cheap scams (1.07) scale slowly, expensive scams (1.10) scale faster.
 * See getScamCostRate() in scams/calculations.ts.
 */
export interface ScamTierBase {
  /** Tier number (1-10) */
  tier: number;
  /** Base cost for free scams (scams with unlockCost use that instead) */
  baseCost: number;
  /** Profit growth rate per level (0.10 = 10% increase) */
  profitGrowth: number;
  /** Base duration in milliseconds */
  baseDuration: number;
}

/**
 * Base values for all 10 scam tiers from the economic spreadsheet.
 *
 * Kongregate-style economy:
 * - Cost: baseCost × getScamCostRate(baseCost)^(level-1)  (graduated per-scam rate)
 * - Profit: baseCost × (1 + (level-1) × 0.10) × bracketBonus × trust^0.3
 */
export const SCAM_TIER_BASES: ScamTierBase[] = [
  // profitGrowth 0.10 = 10% profit increase per level
  // cost rate is graduated per-scam: 1.07 (cheap) to 1.10 (expensive)
  { tier: 1, baseCost: 10, profitGrowth: 0.10, baseDuration: 5000 },
  { tier: 2, baseCost: 1000, profitGrowth: 0.10, baseDuration: 5000 },
  { tier: 3, baseCost: 100000, profitGrowth: 0.10, baseDuration: 5000 },
  { tier: 4, baseCost: 10000000, profitGrowth: 0.10, baseDuration: 10000 },
  { tier: 5, baseCost: 1000000000, profitGrowth: 0.10, baseDuration: 30000 },
  { tier: 6, baseCost: 100000000000, profitGrowth: 0.10, baseDuration: 60000 },
  { tier: 7, baseCost: 10000000000000, profitGrowth: 0.10, baseDuration: 120000 },
  { tier: 8, baseCost: 1000000000000000, profitGrowth: 0.10, baseDuration: 300000 },
  { tier: 9, baseCost: 100000000000000000, profitGrowth: 0.10, baseDuration: 600000 },
  { tier: 10, baseCost: 10000000000000000000, profitGrowth: 0.10, baseDuration: 1200000 },
];

/**
 * Ratio between consecutive scam unlock costs in the global progression.
 * All 49 scams form one continuous geometric series with this ratio.
 */
export const PROGRESSION_RATIO = 5;

/**
 * Anchor cost: the unlock cost of the 2nd scam (position 1) in the progression.
 * The 1st scam (position 0) is always free.
 */
export const PROGRESSION_ANCHOR = 1000;

/**
 * Returns the unlock cost for a scam at a given position in the 49-scam progression.
 * Position 0 = free (returns 0). Position 1+ = anchor × ratio^(position-1).
 *
 * @param position - 0-indexed position in the global scam order (0-48)
 * @returns The unlock cost (0 for the free first scam)
 */
export function getProgressionCost(position: number): number {
  if (position <= 0) return 0;
  return Math.round(PROGRESSION_ANCHOR * Math.pow(PROGRESSION_RATIO, position - 1));
}

/**
 * Returns the manager hire cost for a scam at a given position.
 * Manager cost = 75% of the NEXT scam's unlock cost in the progression.
 *
 * @param position - 0-indexed position of the scam this manager automates (0-48)
 * @returns The manager hire cost
 */
export function getManagerCostAtPosition(position: number): number {
  return Math.floor(getProgressionCost(position + 1) * 0.75);
}

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
