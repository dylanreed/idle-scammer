// ABOUTME: Tests for AsyncStorage save/load operations
// ABOUTME: Validates saveGame, loadGame, clearSave, and hasSaveData functions

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveGame,
  loadGame,
  clearSave,
  hasSaveData,
} from '../../../src/game/persistence/storage';
import { STORAGE_KEY, SAVE_VERSION } from '../../../src/game/persistence/types';
import type { SaveData } from '../../../src/game/persistence/types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('Storage', () => {
  const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

  const validSaveData: SaveData = {
    version: SAVE_VERSION,
    savedAt: 1704067200000,
    resources: {
      money: 1000,
      reputation: 50,
      heat: 25,
      bots: 500,
      skillPoints: 10,
      crypto: 2.5,
      trust: 3,
    },
    scams: {
      'bot-farms': {
        scamId: 'bot-farms',
        level: 5,
        isUnlocked: true,
        timesCompleted: 100,
      },
      'phishing': {
        scamId: 'phishing',
        level: 2,
        isUnlocked: true,
        timesCompleted: 25,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveGame', () => {
    it('should serialize and save data to AsyncStorage', async () => {
      await saveGame(validSaveData);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(1);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify(validSaveData)
      );
    });

    it('should throw error if AsyncStorage fails', async () => {
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage full'));

      await expect(saveGame(validSaveData)).rejects.toThrow('Storage full');
    });

    it('should handle empty scams object', async () => {
      const minimalSaveData: SaveData = {
        ...validSaveData,
        scams: {},
      };

      await saveGame(minimalSaveData);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify(minimalSaveData)
      );
    });
  });

  describe('loadGame', () => {
    it('should load and deserialize data from AsyncStorage', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(
        JSON.stringify(validSaveData)
      );

      const result = await loadGame();

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
      expect(result).toEqual(validSaveData);
    });

    it('should return null if no save data exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await loadGame();

      expect(result).toBeNull();
    });

    it('should return null and warn on corrupted JSON', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockAsyncStorage.getItem.mockResolvedValueOnce('not valid json {{{');

      const result = await loadGame();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load save data'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should return null and warn on AsyncStorage error', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Read error'));

      const result = await loadGame();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load save data'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should preserve all data types correctly', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(
        JSON.stringify(validSaveData)
      );

      const result = await loadGame();

      expect(result).not.toBeNull();
      expect(typeof result!.version).toBe('number');
      expect(typeof result!.savedAt).toBe('number');
      expect(typeof result!.resources.money).toBe('number');
      expect(typeof result!.resources.crypto).toBe('number');
      expect(typeof result!.scams['bot-farms'].isUnlocked).toBe('boolean');
    });
  });

  describe('clearSave', () => {
    it('should remove save data from AsyncStorage', async () => {
      await clearSave();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledTimes(1);
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('should not throw on already empty storage', async () => {
      await expect(clearSave()).resolves.not.toThrow();
    });
  });

  describe('hasSaveData', () => {
    it('should return true if save data exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(
        JSON.stringify(validSaveData)
      );

      const result = await hasSaveData();

      expect(result).toBe(true);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('should return false if no save data exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await hasSaveData();

      expect(result).toBe(false);
    });

    it('should return false on storage error', async () => {
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Read error'));

      const result = await hasSaveData();

      expect(result).toBe(false);
    });
  });
});
