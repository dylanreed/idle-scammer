// ABOUTME: High-level save management coordinating stores and save data
// ABOUTME: Handles snapshot creation, state restoration, and version migrations

import type { SaveData } from './types';
import { SAVE_VERSION } from './types';
import type { GameResources } from '../types';
import type { ScamStateMap } from '../scams/scamStore';

/**
 * Creates a SaveData snapshot from current game state.
 * Captures current timestamp for offline calculation purposes.
 *
 * @param resources - Current game resources from the game store
 * @param scams - Current scam states from the scam store
 * @returns Complete SaveData object ready for storage
 */
export function createSaveData(
  resources: GameResources,
  scams: ScamStateMap
): SaveData {
  return {
    version: SAVE_VERSION,
    savedAt: Date.now(),
    resources,
    scams,
  };
}

/**
 * Extracts game state from SaveData for applying to stores.
 * Call after loading and migrating save data.
 *
 * @param saveData - Loaded and migrated SaveData
 * @returns Object containing resources and scams to apply to stores
 */
export function applySaveData(saveData: SaveData): {
  resources: GameResources;
  scams: ScamStateMap;
} {
  return {
    resources: saveData.resources,
    scams: saveData.scams,
  };
}

/**
 * Migrates save data from older versions to current SAVE_VERSION.
 * Runs migrations sequentially (v0->v1, v1->v2, etc.).
 *
 * @param saveData - Potentially outdated SaveData
 * @returns SaveData at current SAVE_VERSION
 */
export function migrateIfNeeded(saveData: SaveData): SaveData {
  let migrated = { ...saveData };

  // Migration from version 0 to version 1
  if (migrated.version < 1) {
    // Version 1 is the initial schema, so v0 data just needs version bump
    // Future migrations would add/transform fields here
    migrated = {
      ...migrated,
      version: 1,
    };
  }

  // Future migrations would be added here:
  // if (migrated.version < 2) {
  //   migrated = migrateV1ToV2(migrated);
  // }

  return migrated;
}
