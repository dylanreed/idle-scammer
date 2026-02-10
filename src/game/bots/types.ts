// ABOUTME: Type definitions for the bot assignment system
// ABOUTME: Defines BotAssignment per scam, BotAssignmentMap, and BotBonuses

/**
 * Bot assignment for a single scam.
 * Players assign whole bots to either speed or profit roles.
 */
export interface BotAssignment {
  /** Number of bots assigned to reduce scam duration */
  speedBots: number;
  /** Number of bots assigned to increase scam reward */
  profitBots: number;
}

/**
 * Map of scam IDs to their bot assignments.
 * Only scams with assigned bots will have entries.
 */
export type BotAssignmentMap = Record<string, BotAssignment>;

/**
 * Computed bonus values from bot assignments for a scam.
 * Used by calculation functions to apply bot effects.
 */
export interface BotBonuses {
  /** Speed bonus as a decimal (e.g., 0.3 = 30% speed boost) */
  speedBonus: number;
  /** Profit bonus as a decimal (e.g., 0.2 = 20% profit boost) */
  profitBonus: number;
}
