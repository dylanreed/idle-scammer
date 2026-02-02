// ABOUTME: Low-level AsyncStorage operations for game persistence
// ABOUTME: Handles serialization, deserialization, and storage key management

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SaveData } from './types';
import { STORAGE_KEY } from './types';

/**
 * Serializes and saves game data to AsyncStorage.
 * Throws an error if the save operation fails.
 *
 * @param data - The SaveData object to persist
 * @throws Error if AsyncStorage write fails
 */
export async function saveGame(data: SaveData): Promise<void> {
  const serialized = JSON.stringify(data);
  await AsyncStorage.setItem(STORAGE_KEY, serialized);
}

/**
 * Loads and deserializes game data from AsyncStorage.
 * Returns null if no save exists or if the save is corrupted.
 * Logs a warning to console on error (does not throw).
 *
 * @returns SaveData if successful, null otherwise
 */
export async function loadGame(): Promise<SaveData | null> {
  try {
    const serialized = await AsyncStorage.getItem(STORAGE_KEY);

    if (serialized === null) {
      return null;
    }

    const data = JSON.parse(serialized) as SaveData;
    return data;
  } catch (error) {
    console.warn('Failed to load save data:', error);
    return null;
  }
}

/**
 * Deletes all save data from AsyncStorage.
 * Safe to call even if no save exists.
 */
export async function clearSave(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

/**
 * Checks whether save data exists in AsyncStorage.
 * Returns false on any error (treats errors as no save).
 *
 * @returns true if save data exists, false otherwise
 */
export async function hasSaveData(): Promise<boolean> {
  try {
    const serialized = await AsyncStorage.getItem(STORAGE_KEY);
    return serialized !== null;
  } catch {
    return false;
  }
}
