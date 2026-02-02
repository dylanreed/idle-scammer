// ABOUTME: TypeScript types for scam definitions and state tracking
// ABOUTME: Defines ScamDefinition, ScamState, ScamTier, and ResourceType

/**
 * Scam tiers representing difficulty/complexity progression.
 * Tier 1 = Small Time, Tier 5 = Mastermind
 */
export type ScamTier = 1 | 2 | 3 | 4 | 5;

/**
 * Resource types that scams can reward.
 * Most scams reward money, but Bot Farms reward bots (foundational resource).
 */
export type ResourceType = 'money' | 'bots' | 'reputation' | 'crypto';

/**
 * Static definition of a scam type.
 * Contains base stats that get modified by level, trust, and upgrades.
 */
export interface ScamDefinition {
  /** Unique identifier (kebab-case, e.g., 'bot-farms') */
  id: string;

  /** Display name (e.g., 'Bot Farms') */
  name: string;

  /** Difficulty tier (1-5) - determines unlock requirements and scaling */
  tier: ScamTier;

  /** Base duration in milliseconds before any modifiers */
  baseDuration: number;

  /** Base reward amount before any modifiers */
  baseReward: number;

  /** What resource this scam produces */
  resourceType: ResourceType;

  /** Flavor text describing the scam */
  description: string;

  /** Cost in money to unlock (undefined = free to start) */
  unlockCost?: number;
}

/**
 * Runtime state for a specific scam.
 * Tracks player progress with each scam type.
 */
export interface ScamState {
  /** ID of the scam definition this state tracks */
  scamId: string;

  /** Current upgrade level (starts at 1) */
  level: number;

  /** Whether the player has unlocked this scam */
  isUnlocked: boolean;

  /** Total times this scam has been completed (for stats) */
  timesCompleted: number;
}
