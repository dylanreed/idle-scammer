// ABOUTME: Tests for persistence type definitions
// ABOUTME: Validates SaveData interface structure and constants

import type { SaveData } from '../../../src/game/persistence/types';
import {
  SAVE_VERSION,
  STORAGE_KEY,
  AUTO_SAVE_INTERVAL_MS,
} from '../../../src/game/persistence/types';

describe('Persistence Types', () => {
  describe('constants', () => {
    it('should export SAVE_VERSION at 2', () => {
      expect(SAVE_VERSION).toBe(2);
    });

    it('should export correct STORAGE_KEY', () => {
      expect(STORAGE_KEY).toBe('idle-scammer-save');
    });

    it('should export AUTO_SAVE_INTERVAL_MS at 30 seconds', () => {
      expect(AUTO_SAVE_INTERVAL_MS).toBe(30000);
    });
  });

  describe('SaveData interface', () => {
    it('should accept valid SaveData structure with managers', () => {
      const validSaveData: SaveData = {
        version: 2,
        savedAt: Date.now(),
        resources: {
          money: 100,
          reputation: 10,
          heat: 5,
          bots: 50,
          skillPoints: 3,
          crypto: 1.5,
          trust: 2,
        },
        scams: {
          'bot-farms': {
            scamId: 'bot-farms',
            level: 5,
            isUnlocked: true,
            timesCompleted: 100,
          },
        },
        managers: {
          'prince-okonkwo': {
            managerId: 'prince-okonkwo',
            isHired: true,
          },
        },
      };

      // TypeScript compilation is the main test - this verifies runtime shape
      expect(validSaveData.version).toBe(2);
      expect(validSaveData.savedAt).toBeGreaterThan(0);
      expect(validSaveData.resources).toBeDefined();
      expect(validSaveData.scams).toBeDefined();
      expect(validSaveData.managers).toBeDefined();
    });

    it('should require all SaveData fields including managers', () => {
      // This test documents the expected structure
      const saveData: SaveData = {
        version: SAVE_VERSION,
        savedAt: 1234567890,
        resources: {
          money: 0,
          reputation: 0,
          heat: 0,
          bots: 0,
          skillPoints: 0,
          crypto: 0,
          trust: 1,
        },
        scams: {},
        managers: {},
      };

      expect(saveData).toHaveProperty('version');
      expect(saveData).toHaveProperty('savedAt');
      expect(saveData).toHaveProperty('resources');
      expect(saveData).toHaveProperty('scams');
      expect(saveData).toHaveProperty('managers');
    });
  });
});
