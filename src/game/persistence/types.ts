// ABOUTME: Type definitions and constants for the game save/load system
// ABOUTME: Defines SaveData interface and persistence-related constants

import type { GameResources } from '../types';
import type { ScamState } from '../scams/types';

/**
 * Current save data format version.
 * Increment when changing SaveData structure (requires migration logic).
 */
export const SAVE_VERSION = 1;

/**
 * AsyncStorage key for game save data.
 */
export const STORAGE_KEY = 'idle-scammer-save';

/**
 * Auto-save interval in milliseconds (30 seconds).
 */
export const AUTO_SAVE_INTERVAL_MS = 30000;

/**
 * Complete save data structure stored in AsyncStorage.
 * Contains version for migrations, timestamp, and all game state.
 */
export interface SaveData {
  /** Save format version for migration handling */
  version: number;

  /** Unix timestamp (ms) when this save was created */
  savedAt: number;

  /** All player resources (money, bots, trust, etc.) */
  resources: GameResources;

  /** Map of scam IDs to their runtime state */
  scams: Record<string, ScamState>;
}
