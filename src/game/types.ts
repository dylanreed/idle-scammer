// ABOUTME: Core TypeScript types for the Idle Scammer game state
// ABOUTME: Defines resource structure and game state interfaces

/**
 * All game resources tracked by the store.
 * Money through crypto reset on prestige; trust persists.
 */
export interface GameResources {
  /** Primary currency - buy upgrades, employees, managers */
  money: number;

  /** Unlock new scam types and tiers */
  reputation: number;

  /** Police attention - triggers prestige at max */
  heat: number;

  /** Strategic allocation resource - persists across prestiges.
   *  Earned fractionally from every scam completion.
   *  Assign to scams for speed/profit bonuses, or leave idle to reduce heat. */
  bots: number;

  /** Unlock passive tree nodes and active abilities */
  skillPoints: number;

  /** Volatile secondary currency - gambling/investment mechanic */
  crypto: number;

  /** Prestige currency - ONLY resource that persists across prestiges.
   *  Starts at 1 as a base multiplier (reward * trust). Gains from clean escapes,
   *  loses from snitching. */
  trust: number;

  /** Lifetime snitch count - persists across prestiges.
   *  Each snitch increases employee costs by 1%. */
  snitchCount: number;
}

/**
 * Resource key type for type-safe resource operations
 */
export type ResourceKey = keyof GameResources;

/**
 * Actions available on the game store
 */
export interface GameActions {
  /** Add (or subtract with negative) money */
  addMoney: (amount: number) => void;

  /** Add (or subtract with negative) reputation */
  addReputation: (amount: number) => void;

  /** Add (or subtract with negative) heat */
  addHeat: (amount: number) => void;

  /** Add (or subtract with negative) bots */
  addBots: (amount: number) => void;

  /** Add (or subtract with negative) skill points */
  addSkillPoints: (amount: number) => void;

  /** Add (or subtract with negative) crypto */
  addCrypto: (amount: number) => void;

  /** Add (or subtract with negative) trust */
  addTrust: (amount: number) => void;

  /** Set a specific resource to an exact value */
  setResource: (key: ResourceKey, value: number) => void;

  /**
   * Reset all resources except trust, bots, and snitchCount for prestige.
   * Optionally modify trust during the reset (positive for clean escape, negative for snitching).
   */
  prestigeReset: (trustModifier?: number) => void;

  /** Bulk-restore all resources from save data */
  hydrate: (resources: GameResources) => void;
}

/**
 * Complete game state combining resources and actions
 */
export interface GameState extends GameActions {
  resources: GameResources;
}
