// ABOUTME: Tests for employee persistence in the save/load system
// ABOUTME: Validates employees are included in SaveData, migration v2→v3, and hydration

import {
  createSaveData,
  applySaveData,
  migrateIfNeeded,
} from '../../../src/game/persistence/saveManager';
import { SAVE_VERSION } from '../../../src/game/persistence/types';
import type { SaveData } from '../../../src/game/persistence/types';
import type { GameResources } from '../../../src/game/types';
import type { ScamStateMap } from '../../../src/game/scams/scamStore';
import type { ManagerStateMap } from '../../../src/game/managers/managerStore';
import type { EmployeeStateMap } from '../../../src/game/employees/employeeStore';
import { useEmployeeStore } from '../../../src/game/employees/employeeStore';

const defaultResources: GameResources = {
  money: 1000,
  heat: 0,
  bots: 0,
  skillPoints: 0,
  crypto: 0,
  trust: 1,
  snitchCount: 0,
};

describe('Employee Persistence', () => {
  beforeEach(() => {
    useEmployeeStore.setState(useEmployeeStore.getInitialState());
  });

  describe('createSaveData includes employees', () => {
    it('should include employees field in save data', () => {
      const employees: EmployeeStateMap = {
        'email-copywriter': { employeeId: 'email-copywriter', count: 3 },
      };

      const result = createSaveData(defaultResources, {}, {}, employees);

      expect(result.employees).toEqual(employees);
    });

    it('should handle empty employees', () => {
      const result = createSaveData(defaultResources, {}, {}, {});

      expect(result.employees).toEqual({});
    });
  });

  describe('applySaveData extracts employees', () => {
    it('should return employees from save data', () => {
      const saveData: SaveData = {
        version: SAVE_VERSION,
        savedAt: Date.now(),
        resources: defaultResources,
        scams: {},
        managers: {},
        employees: {
          'email-copywriter': { employeeId: 'email-copywriter', count: 5 },
        },
        botAssignments: {},
      };

      const { employees } = applySaveData(saveData);

      expect(employees).toEqual({
        'email-copywriter': { employeeId: 'email-copywriter', count: 5 },
      });
    });

    it('should default to empty object when employees missing', () => {
      const oldSaveData = {
        version: SAVE_VERSION,
        savedAt: Date.now(),
        resources: defaultResources,
        scams: {},
        managers: {},
        botAssignments: {},
      } as SaveData;

      const { employees } = applySaveData(oldSaveData);

      expect(employees).toEqual({});
    });
  });

  describe('migration v2 → v3 adds employees', () => {
    it('should add empty employees field when migrating from v2', () => {
      const v2SaveData = {
        version: 2,
        savedAt: Date.now(),
        resources: defaultResources,
        scams: {},
        managers: {},
      } as SaveData;

      const result = migrateIfNeeded(v2SaveData);

      expect(result.version).toBe(SAVE_VERSION);
      expect(result.employees).toEqual({});
    });

    it('should preserve existing data during v2 → v3 migration', () => {
      const v2SaveData = {
        version: 2,
        savedAt: Date.now(),
        resources: { ...defaultResources, money: 5000 },
        scams: {
          'nigerian-prince-emails': {
            scamId: 'nigerian-prince-emails',
            level: 10,
            isUnlocked: true,
            timesCompleted: 100,
          },
        },
        managers: {
          'prince-okonkwo': { managerId: 'prince-okonkwo', isHired: true },
        },
      } as unknown as SaveData;

      const result = migrateIfNeeded(v2SaveData);

      expect(result.resources.money).toBe(5000);
      expect(result.scams['nigerian-prince-emails'].level).toBe(10);
      expect(result.managers['prince-okonkwo'].isHired).toBe(true);
      expect(result.employees).toEqual({});
    });

    it('should handle full migration chain v0 → v1 → v2 → v3', () => {
      const v0SaveData = {
        version: 0,
        savedAt: Date.now(),
        resources: defaultResources,
        scams: {},
      } as unknown as SaveData;

      const result = migrateIfNeeded(v0SaveData);

      expect(result.version).toBe(SAVE_VERSION);
      expect(result.managers).toEqual({});
      expect(result.employees).toEqual({});
    });
  });

  describe('employee store hydrate', () => {
    it('should restore employee state via hydrate', () => {
      const savedEmployees: EmployeeStateMap = {
        'email-copywriter': { employeeId: 'email-copywriter', count: 3 },
        'popup-clicker': { employeeId: 'popup-clicker', count: 7 },
      };

      useEmployeeStore.getState().hydrate(savedEmployees);

      expect(useEmployeeStore.getState().getEmployeeCount('email-copywriter')).toBe(3);
      expect(useEmployeeStore.getState().getEmployeeCount('popup-clicker')).toBe(7);
    });

    it('should overwrite existing employee state on hydrate', () => {
      // Hire some employees first
      useEmployeeStore.getState().hireEmployee('email-copywriter', 2);
      expect(useEmployeeStore.getState().getEmployeeCount('email-copywriter')).toBe(2);

      // Hydrate with different state
      useEmployeeStore.getState().hydrate({
        'email-copywriter': { employeeId: 'email-copywriter', count: 10 },
      });

      expect(useEmployeeStore.getState().getEmployeeCount('email-copywriter')).toBe(10);
    });

    it('should handle empty hydrate (clears all employees)', () => {
      useEmployeeStore.getState().hireEmployee('email-copywriter', 5);

      useEmployeeStore.getState().hydrate({});

      expect(useEmployeeStore.getState().getEmployeeCount('email-copywriter')).toBe(0);
    });
  });
});
