// ABOUTME: High-level save management coordinating stores and save data
// ABOUTME: Handles snapshot creation, state restoration, version migrations, and timer reconstruction

import type { SaveData } from './types';
import { SAVE_VERSION } from './types';
import type { GameResources } from '../types';
import type { ScamStateMap } from '../scams/scamStore';
import type { ManagerStateMap } from '../managers/managerStore';
import type { EmployeeStateMap } from '../employees/employeeStore';
import type { ScamTimer } from '../engine/types';
import { ALL_MANAGERS } from '../managers/definitions';
import { ALL_SCAMS } from '../scams/definitions';
import { calculateScamDuration } from '../scams/calculations';
import { createTimer } from '../engine/timer';
import { useEmployeeStore } from '../employees/employeeStore';

/**
 * Creates a SaveData snapshot from current game state.
 * Captures current timestamp for offline calculation purposes.
 *
 * @param resources - Current game resources from the game store
 * @param scams - Current scam states from the scam store
 * @param managers - Current manager states from the manager store
 * @param employees - Current employee states from the employee store
 * @returns Complete SaveData object ready for storage
 */
export function createSaveData(
  resources: GameResources,
  scams: ScamStateMap,
  managers: ManagerStateMap,
  employees: EmployeeStateMap = {}
): SaveData {
  return {
    version: SAVE_VERSION,
    savedAt: Date.now(),
    resources,
    scams,
    managers,
    employees,
  };
}

/**
 * Extracts game state from SaveData for applying to stores.
 * Call after loading and migrating save data.
 *
 * @param saveData - Loaded and migrated SaveData
 * @returns Object containing resources, scams, and managers to apply to stores
 */
export function applySaveData(saveData: SaveData): {
  resources: GameResources;
  scams: ScamStateMap;
  managers: ManagerStateMap;
  employees: EmployeeStateMap;
} {
  return {
    resources: saveData.resources,
    scams: saveData.scams,
    managers: saveData.managers,
    employees: saveData.employees ?? {},
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
    migrated = {
      ...migrated,
      version: 1,
    };
  }

  // Migration from version 1 to version 2: add managers field
  if (migrated.version < 2) {
    migrated = {
      ...migrated,
      version: 2,
      managers: (migrated as SaveData).managers ?? {},
    };
  }

  // Migration from version 2 to version 3: add employees field
  if (migrated.version < 3) {
    migrated = {
      ...migrated,
      version: 3,
      employees: (migrated as SaveData).employees ?? {},
    };
  }

  // Migration from version 3 to version 4: add snitchCount to resources
  if (migrated.version < 4) {
    migrated = {
      ...migrated,
      version: 4,
      resources: {
        ...migrated.resources,
        snitchCount: (migrated.resources as GameResources).snitchCount ?? 0,
      },
    };
  }

  return migrated;
}

/**
 * Reconstructs active timers from manager and scam state.
 * For each hired manager whose scam is unlocked, creates a timer with
 * the correct duration based on the scam's level.
 *
 * @param scams - Current scam states
 * @param managers - Current manager states
 * @returns Array of ScamTimers to add to the engine
 */
export function reconstructActiveTimers(
  scams: ScamStateMap,
  managers: ManagerStateMap
): ScamTimer[] {
  const timers: ScamTimer[] = [];
  const now = Date.now();

  // All scam definitions for lookup
  const allScamDefs = ALL_SCAMS;

  for (const managerDef of ALL_MANAGERS) {
    const managerState = managers[managerDef.id];

    // Skip if manager not hired
    if (!managerState?.isHired) {
      continue;
    }

    // Check if the scam is unlocked
    const scamState = scams[managerDef.scamId];
    if (!scamState?.isUnlocked) {
      continue;
    }

    // Find the scam definition
    const scamDef = allScamDefs.find((s) => s.id === managerDef.scamId);
    if (!scamDef) {
      continue;
    }

    // Calculate duration based on current level and employee bonuses
    const { speedBonus } = useEmployeeStore.getState().getScamBonuses(managerDef.scamId);
    const duration = calculateScamDuration(scamDef, scamState.level, speedBonus);

    timers.push(createTimer(managerDef.scamId, duration, now));
  }

  return timers;
}
