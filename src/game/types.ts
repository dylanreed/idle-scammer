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

  /** Core resource from Bot Farms - spent on upgrades and offline capability */
  bots: number;

  /** Unlock passive tree nodes and active abilities */
  skillPoints: number;

  /** Volatile secondary currency - gambling/investment mechanic */
  crypto: number;

  /** Prestige currency - ONLY resource that persists across prestiges.
   *  Starts at 1 as a base multiplier (reward * trust). Gains from clean escapes,
   *  loses from snitching. */
  trust: number;
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
   * Reset all resources except trust for prestige.
   * Optionally modify trust during the reset (positive for clean escape, negative for snitching).
   */
  prestigeReset: (trustModifier?: number) => void;

  /**
   * Purchase a bot directly with money.
   * Price scales quadratically: $100 × (currentBots + 1)²
   * @returns true if purchase succeeded, false if not enough money
   */
  buyBot: () => boolean;
}

/**
 * Complete game state combining resources and actions
 */
export interface GameState extends GameActions {
  resources: GameResources;
}
