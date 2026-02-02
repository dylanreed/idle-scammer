// ABOUTME: TypeScript types for manager definitions and state tracking
// ABOUTME: Defines ManagerDefinition and ManagerState interfaces for the automation system

/**
 * Static definition of a manager character.
 * Managers automate their assigned scam's employee output.
 * Each manager has a unique personality expressed through name and flavor text.
 */
export interface ManagerDefinition {
  /** Unique identifier (kebab-case, e.g., 'bot-3000') */
  id: string;

  /** Display name - unique character name (e.g., 'B0T-3000') */
  name: string;

  /** ID of the scam this manager automates */
  scamId: string;

  /** One-time hire cost in money */
  cost: number;

  /** Character description/catchphrase that gives them personality */
  flavorText: string;
}

/**
 * Runtime state for a specific manager.
 * Tracks whether the manager has been hired in the current run.
 * Resets on prestige - managers must be rehired each run.
 */
export interface ManagerState {
  /** ID of the manager definition this state tracks */
  managerId: string;

  /** Whether this manager has been hired in the current run */
  isHired: boolean;
}
