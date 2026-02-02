// ABOUTME: Tests for save manager functions that coordinate stores and save data
// ABOUTME: Validates createSaveData, applySaveData, and migrateIfNeeded

import {
  createSaveData,
  applySaveData,
  migrateIfNeeded,
} from '../../../src/game/persistence/saveManager';
import { SAVE_VERSION } from '../../../src/game/persistence/types';
import type { SaveData } from '../../../src/game/persistence/types';
import type { GameResources } from '../../../src/game/types';
import type { ScamStateMap } from '../../../src/game/scams/scamStore';

describe('SaveManager', () => {
  describe('createSaveData', () => {
    it('should create SaveData from game and scam state', () => {
      const resources: GameResources = {
        money: 1000,
        reputation: 50,
        heat: 25,
        bots: 500,
        skillPoints: 10,
        crypto: 2.5,
        trust: 3,
      };

      const scams: ScamStateMap = {
        'bot-farms': {
          scamId: 'bot-farms',
          level: 5,
          isUnlocked: true,
          timesCompleted: 100,
        },
      };

      const result = createSaveData(resources, scams);

      expect(result.version).toBe(SAVE_VERSION);
      expect(result.savedAt).toBeGreaterThan(0);
      expect(result.savedAt).toBeLessThanOrEqual(Date.now());
      expect(result.resources).toEqual(resources);
      expect(result.scams).toEqual(scams);
    });

    it('should capture current timestamp', () => {
      const before = Date.now();

      const resources: GameResources = {
        money: 0,
        reputation: 0,
        heat: 0,
        bots: 0,
        skillPoints: 0,
        crypto: 0,
        trust: 1,
      };
      const scams: ScamStateMap = {};

      const result = createSaveData(resources, scams);

      const after = Date.now();

      expect(result.savedAt).toBeGreaterThanOrEqual(before);
      expect(result.savedAt).toBeLessThanOrEqual(after);
    });

    it('should handle empty scams state', () => {
      const resources: GameResources = {
        money: 100,
        reputation: 0,
        heat: 0,
        bots: 0,
        skillPoints: 0,
        crypto: 0,
        trust: 1,
      };
      const scams: ScamStateMap = {};

      const result = createSaveData(resources, scams);

      expect(result.scams).toEqual({});
    });

    it('should handle multiple scam states', () => {
      const resources: GameResources = {
        money: 5000,
        reputation: 100,
        heat: 50,
        bots: 1000,
        skillPoints: 25,
        crypto: 10,
        trust: 5,
      };

      const scams: ScamStateMap = {
        'bot-farms': {
          scamId: 'bot-farms',
          level: 10,
          isUnlocked: true,
          timesCompleted: 500,
        },
        'phishing': {
          scamId: 'phishing',
          level: 3,
          isUnlocked: true,
          timesCompleted: 50,
        },
        'crypto-pump': {
          scamId: 'crypto-pump',
          level: 1,
          isUnlocked: false,
          timesCompleted: 0,
        },
      };

      const result = createSaveData(resources, scams);

      expect(Object.keys(result.scams)).toHaveLength(3);
      expect(result.scams['bot-farms'].level).toBe(10);
      expect(result.scams['phishing'].level).toBe(3);
      expect(result.scams['crypto-pump'].isUnlocked).toBe(false);
    });
  });

  describe('applySaveData', () => {
    it('should return resources and scams from SaveData', () => {
      const saveData: SaveData = {
        version: SAVE_VERSION,
        savedAt: Date.now(),
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
        },
      };

      const { resources, scams } = applySaveData(saveData);

      expect(resources).toEqual(saveData.resources);
      expect(scams).toEqual(saveData.scams);
    });

    it('should handle empty scams in save data', () => {
      const saveData: SaveData = {
        version: SAVE_VERSION,
        savedAt: Date.now(),
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
      };

      const { resources, scams } = applySaveData(saveData);

      expect(resources.trust).toBe(1);
      expect(Object.keys(scams)).toHaveLength(0);
    });

    it('should preserve decimal values', () => {
      const saveData: SaveData = {
        version: SAVE_VERSION,
        savedAt: Date.now(),
        resources: {
          money: 999.99,
          reputation: 0,
          heat: 0,
          bots: 0,
          skillPoints: 0,
          crypto: 0.123456,
          trust: 1.5,
        },
        scams: {},
      };

      const { resources } = applySaveData(saveData);

      expect(resources.money).toBeCloseTo(999.99);
      expect(resources.crypto).toBeCloseTo(0.123456);
      expect(resources.trust).toBeCloseTo(1.5);
    });
  });

  describe('migrateIfNeeded', () => {
    it('should return unchanged data when version matches SAVE_VERSION', () => {
      const saveData: SaveData = {
        version: SAVE_VERSION,
        savedAt: Date.now(),
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
        },
      };

      const result = migrateIfNeeded(saveData);

      expect(result).toEqual(saveData);
      expect(result.version).toBe(SAVE_VERSION);
    });

    it('should migrate data when version is older', () => {
      // Since we're at version 1, there's nothing to migrate from
      // But the function should handle future migrations
      // For now, test that version 0 or invalid versions are handled
      const oldSaveData = {
        version: 0,
        savedAt: Date.now(),
        resources: {
          money: 500,
          reputation: 25,
          heat: 10,
          bots: 250,
          skillPoints: 5,
          crypto: 1,
          trust: 2,
        },
        scams: {},
      } as SaveData;

      const result = migrateIfNeeded(oldSaveData);

      // After migration, version should be current
      expect(result.version).toBe(SAVE_VERSION);
      // Data should be preserved
      expect(result.resources.money).toBe(500);
      expect(result.resources.trust).toBe(2);
    });

    it('should handle missing fields in older versions', () => {
      // Simulating a version 0 save that might be missing fields
      const incompleteSaveData = {
        version: 0,
        savedAt: Date.now(),
        resources: {
          money: 100,
          reputation: 10,
          heat: 5,
          bots: 50,
          skillPoints: 2,
          crypto: 0,
          trust: 1,
        },
        scams: {},
      } as SaveData;

      const result = migrateIfNeeded(incompleteSaveData);

      expect(result.version).toBe(SAVE_VERSION);
      expect(result.resources).toBeDefined();
      expect(result.scams).toBeDefined();
    });

    it('should run migrations sequentially from old to current version', () => {
      // This tests the concept that migrations go 0->1, 1->2, etc.
      // At version 1, we just verify the pattern is in place
      const veryOldSaveData = {
        version: 0,
        savedAt: Date.now() - 100000,
        resources: {
          money: 1,
          reputation: 1,
          heat: 1,
          bots: 1,
          skillPoints: 1,
          crypto: 1,
          trust: 1,
        },
        scams: {},
      } as SaveData;

      const result = migrateIfNeeded(veryOldSaveData);

      // Should end up at current version
      expect(result.version).toBe(SAVE_VERSION);
    });
  });
});
