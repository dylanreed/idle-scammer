// ABOUTME: Tests for save manager functions that coordinate stores and save data
// ABOUTME: Validates createSaveData, applySaveData, migrateIfNeeded, and reconstructActiveTimers

import {
  createSaveData,
  applySaveData,
  migrateIfNeeded,
  reconstructActiveTimers,
} from '../../../src/game/persistence/saveManager';
import { SAVE_VERSION } from '../../../src/game/persistence/types';
import type { SaveData } from '../../../src/game/persistence/types';
import type { GameResources } from '../../../src/game/types';
import type { ScamStateMap } from '../../../src/game/scams/scamStore';
import type { ManagerStateMap } from '../../../src/game/managers/managerStore';

describe('SaveManager', () => {
  describe('createSaveData', () => {
    it('should create SaveData from game, scam, and manager state', () => {
      const resources: GameResources = {
        money: 1000,
        reputation: 50,
        heat: 25,
        bots: 500,
        skillPoints: 10,
        crypto: 2.5,
        trust: 3,
        snitchCount: 0,
      };

      const scams: ScamStateMap = {
        'nigerian-prince-emails': {
          scamId: 'nigerian-prince-emails',
          level: 5,
          isUnlocked: true,
          timesCompleted: 100,
        },
      };

      const managers: ManagerStateMap = {
        'prince-okonkwo': {
          managerId: 'prince-okonkwo',
          isHired: true,
        },
      };

      const result = createSaveData(resources, scams, managers);

      expect(result.version).toBe(SAVE_VERSION);
      expect(result.savedAt).toBeGreaterThan(0);
      expect(result.savedAt).toBeLessThanOrEqual(Date.now());
      expect(result.resources).toEqual(resources);
      expect(result.scams).toEqual(scams);
      expect(result.managers).toEqual(managers);
      expect(result.botAssignments).toEqual({});
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
        snitchCount: 0,
      };
      const scams: ScamStateMap = {};
      const managers: ManagerStateMap = {};

      const result = createSaveData(resources, scams, managers);

      const after = Date.now();

      expect(result.savedAt).toBeGreaterThanOrEqual(before);
      expect(result.savedAt).toBeLessThanOrEqual(after);
    });

    it('should handle empty scams and managers state', () => {
      const resources: GameResources = {
        money: 100,
        reputation: 0,
        heat: 0,
        bots: 0,
        skillPoints: 0,
        crypto: 0,
        trust: 1,
        snitchCount: 0,
      };
      const scams: ScamStateMap = {};
      const managers: ManagerStateMap = {};

      const result = createSaveData(resources, scams, managers);

      expect(result.scams).toEqual({});
      expect(result.managers).toEqual({});
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
        snitchCount: 0,
      };

      const scams: ScamStateMap = {
        'nigerian-prince-emails': {
          scamId: 'nigerian-prince-emails',
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

      const managers: ManagerStateMap = {};

      const result = createSaveData(resources, scams, managers);

      expect(Object.keys(result.scams)).toHaveLength(3);
      expect(result.scams['nigerian-prince-emails'].level).toBe(10);
      expect(result.scams['phishing'].level).toBe(3);
      expect(result.scams['crypto-pump'].isUnlocked).toBe(false);
    });

    it('should handle multiple manager states', () => {
      const resources: GameResources = {
        money: 5000,
        reputation: 100,
        heat: 50,
        bots: 1000,
        skillPoints: 25,
        crypto: 10,
        trust: 5,
        snitchCount: 0,
      };

      const scams: ScamStateMap = {};
      const managers: ManagerStateMap = {
        'prince-okonkwo': { managerId: 'prince-okonkwo', isHired: true },
        'popup-pete': { managerId: 'popup-pete', isHired: true },
        'lucky-larry': { managerId: 'lucky-larry', isHired: false },
      };

      const result = createSaveData(resources, scams, managers);

      expect(Object.keys(result.managers)).toHaveLength(3);
      expect(result.managers['prince-okonkwo'].isHired).toBe(true);
      expect(result.managers['lucky-larry'].isHired).toBe(false);
    });
  });

  describe('applySaveData', () => {
    it('should return resources, scams, managers, and botAssignments from SaveData', () => {
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
          snitchCount: 0,
        },
        scams: {
          'nigerian-prince-emails': {
            scamId: 'nigerian-prince-emails',
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
        employees: {},
        botAssignments: {},
      };

      const { resources, scams, managers, botAssignments } = applySaveData(saveData);

      expect(resources).toEqual(saveData.resources);
      expect(scams).toEqual(saveData.scams);
      expect(managers).toEqual(saveData.managers);
      expect(botAssignments).toEqual({});
    });

    it('should handle empty scams and managers in save data', () => {
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
          snitchCount: 0,
        },
        scams: {},
        managers: {},
        employees: {},
        botAssignments: {},
      };

      const { resources, scams, managers, botAssignments } = applySaveData(saveData);

      expect(resources.trust).toBe(1);
      expect(Object.keys(scams)).toHaveLength(0);
      expect(Object.keys(managers)).toHaveLength(0);
      expect(botAssignments).toEqual({});
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
          snitchCount: 0,
        },
        scams: {},
        managers: {},
        employees: {},
        botAssignments: {},
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
          snitchCount: 0,
        },
        scams: {
          'nigerian-prince-emails': {
            scamId: 'nigerian-prince-emails',
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
        employees: {},
        botAssignments: {},
      };

      const result = migrateIfNeeded(saveData);

      expect(result).toEqual(saveData);
      expect(result.version).toBe(SAVE_VERSION);
    });

    it('should migrate v0 data to current version with empty managers', () => {
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
          snitchCount: 0,
        },
        scams: {},
      } as unknown as SaveData;

      const result = migrateIfNeeded(oldSaveData);

      expect(result.version).toBe(SAVE_VERSION);
      expect(result.resources.money).toBe(500);
      expect(result.resources.trust).toBe(2);
      expect(result.managers).toEqual({});
    });

    it('should migrate v1 data to v2 by adding empty managers', () => {
      const v1SaveData = {
        version: 1,
        savedAt: Date.now(),
        resources: {
          money: 1000,
          reputation: 50,
          heat: 25,
          bots: 500,
          skillPoints: 10,
          crypto: 2.5,
          trust: 3,
          snitchCount: 0,
        },
        scams: {
          'nigerian-prince-emails': {
            scamId: 'nigerian-prince-emails',
            level: 5,
            isUnlocked: true,
            timesCompleted: 100,
          },
        },
      } as unknown as SaveData;

      const result = migrateIfNeeded(v1SaveData);

      expect(result.version).toBe(SAVE_VERSION);
      expect(result.managers).toEqual({});
      expect(result.employees).toEqual({});
      expect(result.botAssignments).toEqual({});
      // Existing data preserved
      expect(result.resources.money).toBe(1000);
      expect(result.scams['nigerian-prince-emails'].level).toBe(5);
    });

    it('should migrate v4 data to v5 by adding empty botAssignments', () => {
      const v4SaveData = {
        version: 4,
        savedAt: Date.now(),
        resources: {
          money: 2000,
          reputation: 100,
          heat: 30,
          bots: 10,
          skillPoints: 5,
          crypto: 1.5,
          trust: 4,
          snitchCount: 1,
        },
        scams: {
          'nigerian-prince-emails': {
            scamId: 'nigerian-prince-emails',
            level: 3,
            isUnlocked: true,
            timesCompleted: 20,
          },
        },
        managers: {
          'prince-okonkwo': { managerId: 'prince-okonkwo', isHired: true },
        },
        employees: {},
      } as unknown as SaveData;

      const result = migrateIfNeeded(v4SaveData);

      expect(result.version).toBe(5);
      expect(result.botAssignments).toEqual({});
      // Existing data preserved
      expect(result.resources.money).toBe(2000);
      expect(result.resources.snitchCount).toBe(1);
      expect(result.scams['nigerian-prince-emails'].level).toBe(3);
      expect(result.managers['prince-okonkwo'].isHired).toBe(true);
    });

    it('should handle sequential migrations v0 -> v1 -> v2', () => {
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
          snitchCount: 0,
        },
        scams: {},
      } as unknown as SaveData;

      const result = migrateIfNeeded(veryOldSaveData);

      expect(result.version).toBe(SAVE_VERSION);
      expect(result.managers).toEqual({});
    });
  });

  describe('reconstructActiveTimers', () => {
    it('should return empty array when no managers are hired', () => {
      const scams: ScamStateMap = {
        'nigerian-prince-emails': {
          scamId: 'nigerian-prince-emails',
          level: 5,
          isUnlocked: true,
          timesCompleted: 10,
        },
      };
      const managers: ManagerStateMap = {};

      const timers = reconstructActiveTimers(scams, managers);

      expect(timers).toEqual([]);
    });

    it('should create timer for hired manager with unlocked scam', () => {
      const scams: ScamStateMap = {
        'nigerian-prince-emails': {
          scamId: 'nigerian-prince-emails',
          level: 1,
          isUnlocked: true,
          timesCompleted: 10,
        },
      };
      const managers: ManagerStateMap = {
        'prince-okonkwo': {
          managerId: 'prince-okonkwo',
          isHired: true,
        },
      };

      const timers = reconstructActiveTimers(scams, managers);

      expect(timers).toHaveLength(1);
      expect(timers[0].scamId).toBe('nigerian-prince-emails');
      expect(timers[0].duration).toBeGreaterThan(0);
      expect(timers[0].isComplete).toBe(false);
    });

    it('should not create timer for hired manager with locked scam', () => {
      const scams: ScamStateMap = {
        'nigerian-prince-emails': {
          scamId: 'nigerian-prince-emails',
          level: 1,
          isUnlocked: false,
          timesCompleted: 0,
        },
      };
      const managers: ManagerStateMap = {
        'prince-okonkwo': {
          managerId: 'prince-okonkwo',
          isHired: true,
        },
      };

      const timers = reconstructActiveTimers(scams, managers);

      expect(timers).toEqual([]);
    });

    it('should not create timer for unhired manager', () => {
      const scams: ScamStateMap = {
        'nigerian-prince-emails': {
          scamId: 'nigerian-prince-emails',
          level: 1,
          isUnlocked: true,
          timesCompleted: 10,
        },
      };
      const managers: ManagerStateMap = {
        'prince-okonkwo': {
          managerId: 'prince-okonkwo',
          isHired: false,
        },
      };

      const timers = reconstructActiveTimers(scams, managers);

      expect(timers).toEqual([]);
    });

    it('should create timers for multiple hired managers', () => {
      const scams: ScamStateMap = {
        'nigerian-prince-emails': {
          scamId: 'nigerian-prince-emails',
          level: 5,
          isUnlocked: true,
          timesCompleted: 10,
        },
        'iphone-popup': {
          scamId: 'iphone-popup',
          level: 3,
          isUnlocked: true,
          timesCompleted: 5,
        },
        'phishing-links': {
          scamId: 'phishing-links',
          level: 1,
          isUnlocked: false,
          timesCompleted: 0,
        },
      };
      const managers: ManagerStateMap = {
        'prince-okonkwo': { managerId: 'prince-okonkwo', isHired: true },
        'popup-pete': { managerId: 'popup-pete', isHired: true },
        'phishmaster-phil': { managerId: 'phishmaster-phil', isHired: true },
      };

      const timers = reconstructActiveTimers(scams, managers);

      // phishing-links is locked, so only 2 timers
      expect(timers).toHaveLength(2);
      const scamIds = timers.map((t) => t.scamId);
      expect(scamIds).toContain('nigerian-prince-emails');
      expect(scamIds).toContain('iphone-popup');
    });

    it('should use correct duration based on scam level', () => {
      const scams: ScamStateMap = {
        'nigerian-prince-emails': {
          scamId: 'nigerian-prince-emails',
          level: 1,
          isUnlocked: true,
          timesCompleted: 0,
        },
      };
      const managers: ManagerStateMap = {
        'prince-okonkwo': { managerId: 'prince-okonkwo', isHired: true },
      };

      const timers = reconstructActiveTimers(scams, managers);

      // Nigerian Prince Emails base duration is 5000ms, level 1 speed multiplier is 1.0
      expect(timers[0].duration).toBe(5000);
    });
  });
});
