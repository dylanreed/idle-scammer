// ABOUTME: TypeScript types for the prestige system
// ABOUTME: Defines PrestigeChoice, PrestigeResult, and PrestigeBonus interfaces

/**
 * Types of bonuses that can be kept when snitching.
 * Corresponds to resettable game resources.
 */
export type PrestigeBonusType =
  | 'money'
  | 'bots'
  | 'reputation'
  | 'crypto'
  | 'skill-points';

/**
 * A bonus resource kept after snitching during prestige.
 * Represents a percentage of pre-prestige resources.
 */
export interface PrestigeBonus {
  /** The type of resource being kept */
  type: PrestigeBonusType;
  /** The amount of the resource kept */
  amount: number;
}

/**
 * Represents the player's choice at prestige time.
 *
 * Clean Escape: Keep your trust intact, lose almost everything else.
 * Snitch: Keep some resources but suffer a permanent trust penalty.
 */
export interface PrestigeChoice {
  /** The type of prestige choice made */
  type: 'clean-escape' | 'snitch';

  /** Trust gained (clean escape only, 0 for snitch) */
  trustGain: number;

  /** Trust penalty (snitch only, negative number, 0 for clean escape) */
  trustPenalty: number;

  /** Percentage of resources kept when snitching (0-1, 0 for clean escape) */
  bonusKept: number;
}

/**
 * The result of a prestige operation.
 * Contains before/after trust values and any bonuses kept.
 */
export interface PrestigeResult {
  /** Which type of prestige was chosen */
  choice: PrestigeChoice['type'];

  /** Trust value before prestige */
  previousTrust: number;

  /** Trust value after prestige */
  newTrust: number;

  /** Bonuses kept from snitching (undefined for clean escape) */
  bonuses?: PrestigeBonus[];
}
