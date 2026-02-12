// ABOUTME: Type definitions for passive skills, active abilities, and skill state
// ABOUTME: Defines SkillCategory, PassiveSkillDefinition, ActiveAbilityDefinition, and save data types

/**
 * Four categories for the passive skill tree.
 * Each category has 3 skills with 5 ranks each.
 */
export type SkillCategory = 'tech' | 'social' | 'finance' | 'stealth';

/**
 * Static definition of a passive skill.
 * Each skill has 5 ranks with escalating effects and costs.
 */
export interface PassiveSkillDefinition {
  /** Unique identifier (kebab-case, e.g., 'overclock') */
  id: string;

  /** Display name (e.g., 'Overclock') */
  name: string;

  /** Which skill category this belongs to */
  category: SkillCategory;

  /** Flavor text describing the skill */
  description: string;

  /** Effect values at each rank (index 0 = rank 1, etc.) */
  ranks: [number, number, number, number, number];

  /** Maximum rank (always 5) */
  maxRank: 5;
}

/**
 * Static definition of an active ability.
 * Active abilities are unlocked by spending SP and have cooldowns.
 */
export interface ActiveAbilityDefinition {
  /** Unique identifier (kebab-case, e.g., 'charm-offensive') */
  id: string;

  /** Display name (e.g., 'Charm Offensive') */
  name: string;

  /** Flavor text describing the ability */
  description: string;

  /** SP cost to unlock */
  cost: number;

  /** Effect duration in milliseconds (0 = instant) */
  durationMs: number;

  /** Cooldown in milliseconds */
  cooldownMs: number;

  /** Effect multiplier or value (depends on ability) */
  effectValue: number;
}

/**
 * Runtime state for a passive skill.
 * Tracks how many ranks the player has purchased.
 */
export interface PassiveSkillState {
  /** ID of the skill definition */
  skillId: string;

  /** Current rank (0 = not purchased, 1-5 = purchased ranks) */
  rank: number;
}

/**
 * Runtime state for an active ability.
 * Tracks unlock status, remaining cooldown, and active duration.
 */
export interface ActiveAbilityState {
  /** ID of the ability definition */
  abilityId: string;

  /** Whether the ability has been unlocked */
  isUnlocked: boolean;

  /** Remaining cooldown in milliseconds (0 = ready) */
  cooldownRemainingMs: number;

  /** Remaining active duration in milliseconds (0 = not active) */
  activeRemainingMs: number;
}

/**
 * Computed bonus values from all passive skills.
 * Used by calculation functions to apply skill effects.
 */
export interface SkillBonuses {
  /** Overclock: fraction to reduce scam duration (e.g., 0.30 = 30% faster) */
  durationReduction: number;

  /** Botnet Boost: fraction to amplify bot speed bonus (e.g., 0.75 = 75% more bot speed) */
  botSpeedAmplifier: number;

  /** Firmware Hack: fraction to amplify bot profit bonus (e.g., 0.75 = 75% more bot profit) */
  botProfitAmplifier: number;

  /** Silver Tongue: fraction to increase scam rewards (e.g., 0.45 = 45% more reward) */
  rewardBonus: number;

  /** Recruitment Drive: fraction to reduce employee cost (e.g., 0.40 = 40% cheaper) */
  employeeCostDiscount: number;

  /** Hype Machine: fraction to increase reputation gain (e.g., 0.75 = 75% more rep) */
  reputationBonus: number;

  /** Creative Accounting: fraction to increase money from scams (e.g., 0.45 = 45% more) */
  moneyBonus: number;

  /** Bulk Discount: fraction to reduce upgrade cost (e.g., 0.25 = 25% cheaper) */
  upgradeCostDiscount: number;

  /** Compound Interest: base passive income per second before trust scaling */
  passiveIncomePerSec: number;

  /** Burner Phones: fraction to reduce heat gain (e.g., 0.40 = 40% less heat) */
  heatGainReduction: number;

  /** Dirty Cops: fraction to increase heat decay rate (e.g., 1.0 = double decay) */
  heatDecayBonus: number;

  /** Ghost Protocol: flat bonus to heat threshold (e.g., 50 = 150 max heat) */
  heatThresholdBonus: number;
}

/**
 * Computed active effects from currently active abilities.
 * Used by calculation functions to apply temporary ability effects.
 */
export interface ActiveEffects {
  /** Charm Offensive: reward multiplier (e.g., 2 = double rewards) */
  rewardMultiplier: number;

  /** Zero Day: speed multiplier (e.g., 3 = triple speed) */
  speedMultiplier: number;

  /** Deep Fake: employee bonus multiplier (e.g., 2 = double employee effects) */
  employeeBonusMultiplier: number;

  /** VPN Tunnel: whether heat gain is zeroed */
  zeroHeatGain: boolean;

  /** DDoS Burst: whether to instant-complete all timers (consumed on read) */
  instantComplete: boolean;

  /** Burner Phone (ability): whether to instant-reduce heat (consumed on read) */
  instantHeatReduce: boolean;
}

/**
 * Serializable skill data for save/load.
 * Contains just the numeric state — definitions are static.
 */
export interface SkillSaveData {
  /** Map of passive skill ID to current rank */
  passiveRanks: Record<string, number>;

  /** Set of unlocked active ability IDs */
  unlockedAbilities: string[];

  /** Map of ability ID to remaining cooldown ms */
  cooldowns: Record<string, number>;

  /** Map of ability ID to remaining active duration ms */
  activeDurations: Record<string, number>;
}
