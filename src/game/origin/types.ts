// ABOUTME: Type definitions for the origin backstory system
// ABOUTME: Defines OriginId, OriginDefinition, OriginBonuses, and OriginSaveData

/**
 * Unique identifier for each origin backstory.
 */
export type OriginId = 'moms-basement' | 'internet-cafe' | 'stolen-phone';

/**
 * Gameplay bonuses granted by an origin.
 * All values are 0-1 floats representing percentages.
 */
export interface OriginBonuses {
  /** Fraction of scam duration reduced (e.g. 0.10 = 10% faster) */
  durationReduction: number;
  /** Fraction of heat gain reduced (e.g. 0.10 = 10% less heat) */
  heatGainReduction: number;
  /** Fraction of reward bonus added (e.g. 0.10 = 10% more money) */
  rewardBonus: number;
}

/**
 * Full definition of an origin backstory.
 */
export interface OriginDefinition {
  /** Unique identifier */
  id: OriginId;
  /** Display name */
  name: string;
  /** Flavor text describing the backstory */
  description: string;
  /** Short text describing the gameplay bonus */
  bonusDescription: string;
  /** Gameplay bonuses */
  bonuses: OriginBonuses;
}

/**
 * Save data structure for origin state.
 */
export interface OriginSaveData {
  /** Currently selected origin, or null if not yet chosen */
  selectedOrigin: OriginId | null;
}

/**
 * Default origin save data for new games.
 */
export const DEFAULT_ORIGIN_SAVE_DATA: OriginSaveData = {
  selectedOrigin: null,
};
