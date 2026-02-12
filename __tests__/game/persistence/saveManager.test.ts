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
import type { AscensionMap } from '../../../src/game/types';

describe('SaveManager', () => {
  describe('createSaveData', () => {
    it('should create SaveData from game, scam, and manager state', () => {
      const resources: GameResources = {
        money: 1000,
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

    it('should include ascensions in save data', () => {
      const resources: GameResources = {
        money: 1000,
        heat: 25,
        bots: 500,
        skillPoints: 10,
        crypto: 2.5,
        trust: 3,
        snitchCount: 0,
      };
      const scams: ScamStateMap = {};
      const managers: ManagerStateMap = {};
      const ascensions: AscensionMap = {
        'nigerian-prince-emails': 2,
        'fake-antivirus': 1,
      };

      const result = createSaveData(resources, scams, managers, {}, {}, undefined, ascensions);

      expect(result.ascensions).toEqual(ascensions);
    });

    it('should include tutorials in save data', () => {
      const resources: GameResources = {
        money: 1000,
        heat: 25,
        bots: 500,
        skillPoints: 10,
        crypto: 2.5,
        trust: 3,
        snitchCount: 0,
      };
      const scams: ScamStateMap = {};
      const managers: ManagerStateMap = {};
      const tutorials = { hasPrestiged: true, seen: ['trust-intro'], prestigeCount: 2 };

      const result = createSaveData(resources, scams, managers, {}, {}, undefined, {}, tutorials);

      expect(result.tutorials).toEqual(tutorials);
    });

    it('should default tutorials to empty state', () => {
      const resources: GameResources = {
        money: 1000,
        heat: 25,
        bots: 500,
        skillPoints: 10,
        crypto: 2.5,
        trust: 3,
        snitchCount: 0,
      };
      const scams: ScamStateMap = {};
      const managers: ManagerStateMap = {};

      const result = createSaveData(resources, scams, managers);

      expect(result.tutorials).toEqual({ hasPrestiged: false, seen: [], prestigeCount: 0 });
    });

    it('should default ascensions to empty object', () => {
      const resources: GameResources = {
        money: 1000,
        heat: 25,
        bots: 500,
        skillPoints: 10,
        crypto: 2.5,
        trust: 3,
        snitchCount: 0,
      };
      const scams: ScamStateMap = {};
      const managers: ManagerStateMap = {};

      const result = createSaveData(resources, scams, managers);

      expect(result.ascensions).toEqual({});
    });

    it('should handle multiple manager states', () => {
      const resources: GameResources = {
        money: 5000,
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
        skills: { passiveRanks: {}, unlockedAbilities: [], cooldowns: {}, activeDurations: {} },
        ascensions: {},
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
        skills: { passiveRanks: {}, unlockedAbilities: [], cooldowns: {}, activeDurations: {} },
        ascensions: {},
      };

      const { resources, scams, managers, botAssignments } = applySaveData(saveData);

      expect(resources.trust).toBe(1);
      expect(Object.keys(scams)).toHaveLength(0);
      expect(Object.keys(managers)).toHaveLength(0);
      expect(botAssignments).toEqual({});
    });

    it('should return ascensions from save data', () => {
      const saveData: SaveData = {
        version: SAVE_VERSION,
        savedAt: Date.now(),
        resources: {
          money: 1000,
          heat: 25,
          bots: 500,
          skillPoints: 10,
          crypto: 2.5,
          trust: 3,
          snitchCount: 0,
        },
        scams: {},
        managers: {},
        employees: {},
        botAssignments: {},
        skills: { passiveRanks: {}, unlockedAbilities: [], cooldowns: {}, activeDurations: {} },
        ascensions: { 'nigerian-prince-emails': 3 },
      };

      const { ascensions } = applySaveData(saveData);
      expect(ascensions).toEqual({ 'nigerian-prince-emails': 3 });
    });

    it('should return tutorials from save data', () => {
      const saveData: SaveData = {
        version: SAVE_VERSION,
        savedAt: Date.now(),
        resources: {
          money: 1000,
          heat: 25,
          bots: 500,
          skillPoints: 10,
          crypto: 2.5,
          trust: 3,
          snitchCount: 0,
        },
        scams: {},
        managers: {},
        employees: {},
        botAssignments: {},
        skills: { passiveRanks: {}, unlockedAbilities: [], cooldowns: {}, activeDurations: {} },
        ascensions: {},
        tutorials: { hasPrestiged: true, seen: ['trust-intro', 'bots-intro'], prestigeCount: 3 },
      };

      const { tutorials } = applySaveData(saveData);
      expect(tutorials).toEqual({ hasPrestiged: true, seen: ['trust-intro', 'bots-intro'], prestigeCount: 3 });
    });

    it('should default tutorials to empty when missing from save', () => {
      const saveData = {
        version: SAVE_VERSION,
        savedAt: Date.now(),
        resources: {
          money: 0,
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
        skills: { passiveRanks: {}, unlockedAbilities: [], cooldowns: {}, activeDurations: {} },
        ascensions: {},
      } as unknown as SaveData;

      const { tutorials } = applySaveData(saveData);
      expect(tutorials).toEqual({ hasPrestiged: false, seen: [], prestigeCount: 0 });
    });

    it('should default ascensions to empty when missing from save', () => {
      const saveData = {
        version: SAVE_VERSION,
        savedAt: Date.now(),
        resources: {
          money: 0,
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
        skills: { passiveRanks: {}, unlockedAbilities: [], cooldowns: {}, activeDurations: {} },
      } as unknown as SaveData;

      const { ascensions } = applySaveData(saveData);
      expect(ascensions).toEqual({});
    });

    it('should preserve decimal values', () => {
      const saveData: SaveData = {
        version: SAVE_VERSION,
        savedAt: Date.now(),
        resources: {
          money: 999.99,
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
        skills: { passiveRanks: {}, unlockedAbilities: [], cooldowns: {}, activeDurations: {} },
        ascensions: {},
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
        skills: { passiveRanks: {}, unlockedAbilities: [], cooldowns: {}, activeDurations: {} },
        ascensions: {},
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
      // v8->v9 migration strips reputation
      expect((result.resources as unknown as Record<string, unknown>).reputation).toBeUndefined();
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

      expect(result.version).toBe(SAVE_VERSION);
      expect(result.botAssignments).toEqual({});
      // Existing data preserved
      expect(result.resources.money).toBe(2000);
      expect(result.resources.snitchCount).toBe(1);
      expect(result.scams['nigerian-prince-emails'].level).toBe(3);
      expect(result.managers['prince-okonkwo'].isHired).toBe(true);
    });

    it('should migrate v5 data to v6 by adding empty skills', () => {
      const v5SaveData = {
        version: 5,
        savedAt: Date.now(),
        resources: {
          money: 5000,
          reputation: 200,
          heat: 40,
          bots: 15,
          skillPoints: 20,
          crypto: 5,
          trust: 10,
          snitchCount: 2,
        },
        scams: {
          'nigerian-prince-emails': {
            scamId: 'nigerian-prince-emails',
            level: 8,
            isUnlocked: true,
            timesCompleted: 50,
          },
        },
        managers: {},
        employees: {},
        botAssignments: { 'nigerian-prince-emails': { speedBots: 2, profitBots: 1 } },
      } as unknown as SaveData;

      const result = migrateIfNeeded(v5SaveData);

      expect(result.version).toBe(SAVE_VERSION);
      expect(result.skills).toEqual({
        passiveRanks: {},
        unlockedAbilities: [],
        cooldowns: {},
        activeDurations: {},
      });
      // Existing data preserved
      expect(result.resources.money).toBe(5000);
      expect(result.resources.skillPoints).toBe(20);
      expect(result.botAssignments).toEqual({ 'nigerian-prince-emails': { speedBots: 2, profitBots: 1 } });
    });

    it('should migrate v6 data to v7 by adding empty ascensions', () => {
      const v6SaveData = {
        version: 6,
        savedAt: Date.now(),
        resources: {
          money: 8000,
          reputation: 300,
          heat: 50,
          bots: 20,
          skillPoints: 30,
          crypto: 10,
          trust: 15,
          snitchCount: 1,
        },
        scams: {
          'nigerian-prince-emails': {
            scamId: 'nigerian-prince-emails',
            level: 100,
            isUnlocked: true,
            timesCompleted: 500,
          },
        },
        managers: {},
        employees: {},
        botAssignments: {},
        skills: { passiveRanks: {}, unlockedAbilities: [], cooldowns: {}, activeDurations: {} },
      } as unknown as SaveData;

      const result = migrateIfNeeded(v6SaveData);

      expect(result.version).toBe(SAVE_VERSION);
      expect(result.ascensions).toEqual({});
      // Existing data preserved
      expect(result.resources.money).toBe(8000);
      expect(result.skills).toEqual({
        passiveRanks: {},
        unlockedAbilities: [],
        cooldowns: {},
        activeDurations: {},
      });
    });

    it('should migrate v7 data to v8 by adding default tutorials', () => {
      const v7SaveData = {
        version: 7,
        savedAt: Date.now(),
        resources: {
          money: 10000,
          reputation: 400,
          heat: 60,
          bots: 25,
          skillPoints: 40,
          crypto: 15,
          trust: 20,
          snitchCount: 3,
        },
        scams: {
          'nigerian-prince-emails': {
            scamId: 'nigerian-prince-emails',
            level: 150,
            isUnlocked: true,
            timesCompleted: 1000,
          },
        },
        managers: {},
        employees: {},
        botAssignments: {},
        skills: { passiveRanks: {}, unlockedAbilities: [], cooldowns: {}, activeDurations: {} },
        ascensions: { 'nigerian-prince-emails': 1 },
      } as unknown as SaveData;

      const result = migrateIfNeeded(v7SaveData);

      expect(result.version).toBe(SAVE_VERSION);
      expect(result.tutorials).toEqual({
        hasPrestiged: false,
        seen: [],
        prestigeCount: 0,
      });
      // Existing data preserved
      expect(result.resources.money).toBe(10000);
      expect(result.resources.snitchCount).toBe(3);
      expect(result.ascensions).toEqual({ 'nigerian-prince-emails': 1 });
    });

    it('should migrate v8 data to v9 by removing reputation from resources', () => {
      const v8SaveData = {
        version: 8,
        savedAt: Date.now(),
        resources: {
          money: 5000,
          reputation: 150,
          heat: 30,
          bots: 12,
          skillPoints: 15,
          crypto: 8,
          trust: 7,
          snitchCount: 1,
        },
        scams: {
          'nigerian-prince-emails': {
            scamId: 'nigerian-prince-emails',
            level: 20,
            isUnlocked: true,
            timesCompleted: 200,
          },
        },
        managers: {},
        employees: {},
        botAssignments: {},
        skills: { passiveRanks: {}, unlockedAbilities: [], cooldowns: {}, activeDurations: {} },
        ascensions: {},
        tutorials: { hasPrestiged: true, seen: ['trust-intro'] },
      } as unknown as SaveData;

      const result = migrateIfNeeded(v8SaveData);

      expect(result.version).toBe(SAVE_VERSION);
      // reputation should be stripped from resources
      expect((result.resources as unknown as Record<string, unknown>).reputation).toBeUndefined();
      // Other resources preserved
      expect(result.resources.money).toBe(5000);
      expect(result.resources.heat).toBe(30);
      expect(result.resources.bots).toBe(12);
      expect(result.resources.skillPoints).toBe(15);
      expect(result.resources.crypto).toBe(8);
      expect(result.resources.trust).toBe(7);
      expect(result.resources.snitchCount).toBe(1);
      // Other fields preserved (v11->v12 adds prestigeCount: hasPrestiged=true -> 1)
      expect(result.tutorials).toEqual({ hasPrestiged: true, seen: ['trust-intro'], prestigeCount: 1 });
      expect(result.scams['nigerian-prince-emails'].level).toBe(20);
    });

    it('should migrate v9 data to v10 by adding default crypto state', () => {
      const v9SaveData = {
        version: 9,
        savedAt: Date.now(),
        resources: {
          money: 12000,
          heat: 35,
          bots: 30,
          skillPoints: 50,
          crypto: 20,
          trust: 25,
          snitchCount: 2,
        },
        scams: {
          'nigerian-prince-emails': {
            scamId: 'nigerian-prince-emails',
            level: 50,
            isUnlocked: true,
            timesCompleted: 500,
          },
        },
        managers: {},
        employees: {},
        botAssignments: {},
        skills: { passiveRanks: {}, unlockedAbilities: [], cooldowns: {}, activeDurations: {} },
        ascensions: { 'nigerian-prince-emails': 1 },
        tutorials: { hasPrestiged: true, seen: ['trust-intro', 'bots-intro', 'skill-points-intro'] },
      } as unknown as SaveData;

      const result = migrateIfNeeded(v9SaveData);

      expect(result.version).toBe(SAVE_VERSION);
      expect(result.crypto).toBeDefined();
      expect(result.crypto!.market.exchangeRate).toBe(1000);
      expect(result.crypto!.market.seed).toBe(42);
      expect(result.crypto!.activeProjects).toEqual([]);
      expect(result.crypto!.completedProjects).toEqual([]);
      expect(result.crypto!.ownedNFTs).toEqual([]);
      expect(result.crypto!.collections).toEqual([]);
      // Existing data preserved
      expect(result.resources.money).toBe(12000);
      expect(result.resources.trust).toBe(25);
      expect(result.tutorials).toEqual({ hasPrestiged: true, seen: ['trust-intro', 'bots-intro', 'skill-points-intro'], prestigeCount: 1 });
    });

    it('should preserve existing crypto data during v9->v10 migration', () => {
      const v9SaveDataWithCrypto = {
        version: 9,
        savedAt: Date.now(),
        resources: {
          money: 5000,
          heat: 20,
          bots: 10,
          skillPoints: 15,
          crypto: 10,
          trust: 10,
          snitchCount: 0,
        },
        scams: {},
        managers: {},
        employees: {},
        botAssignments: {},
        skills: { passiveRanks: {}, unlockedAbilities: [], cooldowns: {}, activeDurations: {} },
        ascensions: {},
        tutorials: { hasPrestiged: true, seen: [] },
        crypto: {
          market: { exchangeRate: 1500, seed: 999, activeEvent: null, eventTicksRemaining: 0, totalTicks: 100 },
          activeProjects: [],
          completedProjects: [],
          ownedNFTs: [],
          collections: [],
        },
      } as unknown as SaveData;

      const result = migrateIfNeeded(v9SaveDataWithCrypto);

      expect(result.version).toBe(SAVE_VERSION);
      expect(result.crypto!.market.exchangeRate).toBe(1500);
      expect(result.crypto!.market.seed).toBe(999);
      expect(result.crypto!.market.totalTicks).toBe(100);
    });

    it('should preserve existing tutorials during v7->v8 migration', () => {
      const v7SaveDataWithTutorials = {
        version: 7,
        savedAt: Date.now(),
        resources: {
          money: 5000,
          reputation: 200,
          heat: 0,
          bots: 10,
          skillPoints: 20,
          crypto: 5,
          trust: 10,
          snitchCount: 0,
        },
        scams: {},
        managers: {},
        employees: {},
        botAssignments: {},
        skills: { passiveRanks: {}, unlockedAbilities: [], cooldowns: {}, activeDurations: {} },
        ascensions: {},
        tutorials: { hasPrestiged: true, seen: ['trust-intro'] },
      } as unknown as SaveData;

      const result = migrateIfNeeded(v7SaveDataWithTutorials);

      expect(result.version).toBe(SAVE_VERSION);
      expect(result.tutorials).toEqual({ hasPrestiged: true, seen: ['trust-intro'], prestigeCount: 1 });
    });

    it('should migrate v10 save data to v11 with default origin', () => {
      const v10SaveData = {
        version: 10,
        savedAt: Date.now(),
        resources: {
          money: 15000,
          heat: 30,
          bots: 100,
          skillPoints: 20,
          crypto: 5,
          trust: 30,
          snitchCount: 1,
        },
        scams: {},
        managers: {},
        employees: {},
        botAssignments: {},
        skills: { passiveRanks: {}, unlockedAbilities: [], cooldowns: {}, activeDurations: {} },
        ascensions: {},
        tutorials: { hasPrestiged: true, seen: ['trust-intro', 'bots-intro'] },
        crypto: {
          market: { exchangeRate: 1000, seed: 42, activeEvent: null, eventTicksRemaining: 0, totalTicks: 0 },
          activeProjects: [],
          completedProjects: [],
          ownedNFTs: [],
          collections: [],
        },
      } as unknown as SaveData;

      const result = migrateIfNeeded(v10SaveData);

      expect(result.version).toBe(SAVE_VERSION);
      expect(result.origin).toBeDefined();
      expect(result.origin!.selectedOrigin).toBeNull();
      // Existing data preserved
      expect(result.resources.money).toBe(15000);
      expect(result.resources.trust).toBe(30);
      expect(result.tutorials).toEqual({ hasPrestiged: true, seen: ['trust-intro', 'bots-intro'], prestigeCount: 1 });
    });

    it('should preserve existing origin data during v10->v11 migration', () => {
      const v10SaveDataWithOrigin = {
        version: 10,
        savedAt: Date.now(),
        resources: {
          money: 5000,
          heat: 20,
          bots: 10,
          skillPoints: 15,
          crypto: 10,
          trust: 10,
          snitchCount: 0,
        },
        scams: {},
        managers: {},
        employees: {},
        botAssignments: {},
        skills: { passiveRanks: {}, unlockedAbilities: [], cooldowns: {}, activeDurations: {} },
        ascensions: {},
        tutorials: { hasPrestiged: false, seen: [] },
        crypto: {
          market: { exchangeRate: 1000, seed: 42, activeEvent: null, eventTicksRemaining: 0, totalTicks: 0 },
          activeProjects: [],
          completedProjects: [],
          ownedNFTs: [],
          collections: [],
        },
        origin: { selectedOrigin: 'moms-basement' },
      } as unknown as SaveData;

      const result = migrateIfNeeded(v10SaveDataWithOrigin);

      expect(result.version).toBe(SAVE_VERSION);
      expect(result.origin!.selectedOrigin).toBe('moms-basement');
    });

    it('should migrate v11 data to v12 by adding prestigeCount to tutorials (hasPrestiged=true)', () => {
      const v11SaveData = {
        version: 11,
        savedAt: Date.now(),
        resources: {
          money: 20000,
          heat: 40,
          bots: 50,
          skillPoints: 30,
          crypto: 15,
          trust: 35,
          snitchCount: 2,
        },
        scams: {},
        managers: {},
        employees: {},
        botAssignments: {},
        skills: { passiveRanks: {}, unlockedAbilities: [], cooldowns: {}, activeDurations: {} },
        ascensions: { 'nigerian-prince-emails': 2 },
        tutorials: { hasPrestiged: true, seen: ['trust-intro', 'bots-intro'] },
        crypto: {
          market: { exchangeRate: 1000, seed: 42, activeEvent: null, eventTicksRemaining: 0, totalTicks: 0 },
          activeProjects: [],
          completedProjects: [],
          ownedNFTs: [],
          collections: [],
        },
        origin: { selectedOrigin: 'moms-basement' },
      } as unknown as SaveData;

      const result = migrateIfNeeded(v11SaveData);

      expect(result.version).toBe(SAVE_VERSION);
      // hasPrestiged is true, so prestigeCount defaults to 1
      expect(result.tutorials).toEqual({
        hasPrestiged: true,
        seen: ['trust-intro', 'bots-intro'],
        prestigeCount: 1,
      });
      // Existing data preserved
      expect(result.resources.money).toBe(20000);
      expect(result.ascensions).toEqual({ 'nigerian-prince-emails': 2 });
      expect(result.origin!.selectedOrigin).toBe('moms-basement');
    });

    it('should migrate v11 data to v12 by adding prestigeCount to tutorials (hasPrestiged=false)', () => {
      const v11SaveData = {
        version: 11,
        savedAt: Date.now(),
        resources: {
          money: 500,
          heat: 5,
          bots: 2,
          skillPoints: 0,
          crypto: 0,
          trust: 1,
          snitchCount: 0,
        },
        scams: {},
        managers: {},
        employees: {},
        botAssignments: {},
        skills: { passiveRanks: {}, unlockedAbilities: [], cooldowns: {}, activeDurations: {} },
        ascensions: {},
        tutorials: { hasPrestiged: false, seen: [] },
        crypto: {
          market: { exchangeRate: 1000, seed: 42, activeEvent: null, eventTicksRemaining: 0, totalTicks: 0 },
          activeProjects: [],
          completedProjects: [],
          ownedNFTs: [],
          collections: [],
        },
        origin: { selectedOrigin: null },
      } as unknown as SaveData;

      const result = migrateIfNeeded(v11SaveData);

      expect(result.version).toBe(SAVE_VERSION);
      // hasPrestiged is false, so prestigeCount defaults to 0
      expect(result.tutorials).toEqual({
        hasPrestiged: false,
        seen: [],
        prestigeCount: 0,
      });
    });

    it('should preserve existing prestigeCount during v11->v12 migration', () => {
      const v11SaveDataWithPrestigeCount = {
        version: 11,
        savedAt: Date.now(),
        resources: {
          money: 10000,
          heat: 20,
          bots: 30,
          skillPoints: 15,
          crypto: 10,
          trust: 20,
          snitchCount: 1,
        },
        scams: {},
        managers: {},
        employees: {},
        botAssignments: {},
        skills: { passiveRanks: {}, unlockedAbilities: [], cooldowns: {}, activeDurations: {} },
        ascensions: {},
        tutorials: { hasPrestiged: true, seen: ['trust-intro'], prestigeCount: 5 },
        crypto: {
          market: { exchangeRate: 1000, seed: 42, activeEvent: null, eventTicksRemaining: 0, totalTicks: 0 },
          activeProjects: [],
          completedProjects: [],
          ownedNFTs: [],
          collections: [],
        },
        origin: { selectedOrigin: 'script-kiddie' },
      } as unknown as SaveData;

      const result = migrateIfNeeded(v11SaveDataWithPrestigeCount);

      expect(result.version).toBe(SAVE_VERSION);
      // Existing prestigeCount should be preserved, not overwritten
      expect(result.tutorials).toEqual({
        hasPrestiged: true,
        seen: ['trust-intro'],
        prestigeCount: 5,
      });
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
      // v8->v9 migration strips reputation
      expect((result.resources as unknown as Record<string, unknown>).reputation).toBeUndefined();
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
