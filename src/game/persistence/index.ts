// ABOUTME: Barrel export for the persistence module
// ABOUTME: Re-exports all types, constants, and functions for game save/load

// Types and constants
export type { SaveData } from './types';
export { SAVE_VERSION, STORAGE_KEY, AUTO_SAVE_INTERVAL_MS } from './types';

// Storage operations
export { saveGame, loadGame, clearSave, hasSaveData } from './storage';

// Save management
export { createSaveData, applySaveData, migrateIfNeeded } from './saveManager';
