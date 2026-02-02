// ABOUTME: Zustand store slice for managing manager state
// ABOUTME: Tracks hired managers and provides automation status for scams

import { create } from 'zustand';
import type { ManagerState } from './types';
import { getManagerByScamId } from './definitions';

/**
 * Map of manager IDs to their runtime state
 */
export type ManagerStateMap = Record<string, ManagerState>;

/**
 * Actions available on the manager store
 */
export interface ManagerStoreActions {
  /** Hire a manager (one-time action per run) */
  hireManager: (managerId: string) => void;

  /** Check if a specific manager is hired */
  isManagerHired: (managerId: string) => boolean;

  /** Get array of all hired manager IDs */
  getHiredManagers: () => string[];

  /** Check if a scam has its manager hired (for automation) */
  isScamManaged: (scamId: string) => boolean;

  /** Get all manager states as an array */
  getAllManagerStates: () => ManagerState[];

  /** Reset all manager state (for prestige - all must be rehired) */
  resetManagers: () => void;
}

/**
 * Complete manager store state combining state and actions
 */
export interface ManagerStoreState extends ManagerStoreActions {
  managers: ManagerStateMap;
}

/**
 * Creates a new ManagerState for a manager ID.
 * Used when initializing or tracking a manager.
 *
 * @param managerId - The manager ID
 * @param isHired - Whether the manager is hired (default: false)
 * @returns A fresh ManagerState object
 */
export function createManagerState(managerId: string, isHired = false): ManagerState {
  return {
    managerId,
    isHired,
  };
}

/**
 * Returns the initial manager state (empty).
 * Managers are hired during gameplay, not pre-initialized.
 *
 * @returns Initial manager state map (empty)
 */
export function getInitialManagerState(): ManagerStateMap {
  return {};
}

/**
 * Manager store using Zustand.
 * Manages runtime state for all hired managers.
 *
 * Managers automate their scam's employee output.
 * They must be rehired each prestige (resets on resetManagers).
 */
export const useManagerStore = create<ManagerStoreState>()((set, get) => ({
  managers: getInitialManagerState(),

  hireManager: (managerId: string) => {
    set((state) => {
      const existingManager = state.managers[managerId];

      // If already hired, do nothing (idempotent)
      if (existingManager?.isHired) {
        return state;
      }

      // Hire the manager
      return {
        managers: {
          ...state.managers,
          [managerId]: createManagerState(managerId, true),
        },
      };
    });
  },

  isManagerHired: (managerId: string) => {
    const state = get().managers[managerId];
    return state?.isHired ?? false;
  },

  getHiredManagers: () => {
    return Object.values(get().managers)
      .filter((state) => state.isHired)
      .map((state) => state.managerId);
  },

  isScamManaged: (scamId: string) => {
    const manager = getManagerByScamId(scamId);
    if (!manager) {
      return false;
    }
    return get().isManagerHired(manager.id);
  },

  getAllManagerStates: () => {
    return Object.values(get().managers);
  },

  resetManagers: () => {
    set({ managers: getInitialManagerState() });
  },
}));
