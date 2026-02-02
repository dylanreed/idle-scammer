// ABOUTME: Zustand store slice for managing scam state
// ABOUTME: Tracks unlock status, levels, and completion counts for all scams

import { create } from 'zustand';
import type { ScamState } from './types';
import { BOT_FARMS, TIER_1_SCAMS } from './definitions';

/**
 * Map of scam IDs to their runtime state
 */
export type ScamStateMap = Record<string, ScamState>;

/**
 * Levels required for each milestone bot (Tier 1 only)
 */
const MILESTONE_BOT_LEVELS = 100;

/**
 * Actions available on the scam store
 */
export interface ScamStoreActions {
  /** Unlock a scam by ID */
  unlockScam: (scamId: string) => void;

  /** Upgrade a scam to the next level (only if unlocked) */
  upgradeScam: (scamId: string) => void;

  /** Increment completion count (only if unlocked) */
  incrementCompletion: (scamId: string) => void;

  /** Get state for a specific scam (undefined if not found) */
  getScamState: (scamId: string) => ScamState | undefined;

  /** Reset all scam state (for prestige) */
  resetScams: () => void;

  /** Get total combined levels of all Tier 1 scams */
  getTotalTier1Levels: () => number;

  /** Get number of free milestone bots earned from Tier 1 levels */
  getMilestoneBots: () => number;
}

/**
 * Complete scam store state combining state and actions
 */
export interface ScamStoreState extends ScamStoreActions {
  scams: ScamStateMap;
}

/**
 * Creates a new ScamState for a scam ID.
 * Used when initializing or resetting scam state.
 *
 * @param scamId - The scam ID
 * @param isUnlocked - Whether the scam starts unlocked (default: false)
 * @returns A fresh ScamState object
 */
export function createScamState(scamId: string, isUnlocked = false): ScamState {
  return {
    scamId,
    level: 1,
    isUnlocked,
    timesCompleted: 0,
  };
}

/**
 * Returns the initial scam state with all Tier 1 scams initialized.
 * Bot Farms is unlocked by default; all other scams start locked.
 *
 * @returns Initial scam state map
 */
export function getInitialScamState(): ScamStateMap {
  const initialState: ScamStateMap = {};

  TIER_1_SCAMS.forEach((scam) => {
    // Bot Farms is the only scam that starts unlocked
    const isUnlocked = scam.id === BOT_FARMS.id;
    initialState[scam.id] = createScamState(scam.id, isUnlocked);
  });

  return initialState;
}

/**
 * Scam store using Zustand.
 * Manages runtime state for all scams.
 */
export const useScamStore = create<ScamStoreState>()((set, get) => ({
  scams: getInitialScamState(),

  unlockScam: (scamId: string) => {
    set((state) => {
      const existingScam = state.scams[scamId];

      // If scam doesn't exist, create it as unlocked
      if (!existingScam) {
        return {
          scams: {
            ...state.scams,
            [scamId]: createScamState(scamId, true),
          },
        };
      }

      // If already unlocked, no change needed
      if (existingScam.isUnlocked) {
        return state;
      }

      // Unlock the scam
      return {
        scams: {
          ...state.scams,
          [scamId]: {
            ...existingScam,
            isUnlocked: true,
          },
        },
      };
    });
  },

  upgradeScam: (scamId: string) => {
    set((state) => {
      const existingScam = state.scams[scamId];

      // Can't upgrade non-existent or locked scams
      if (!existingScam || !existingScam.isUnlocked) {
        return state;
      }

      return {
        scams: {
          ...state.scams,
          [scamId]: {
            ...existingScam,
            level: existingScam.level + 1,
          },
        },
      };
    });
  },

  incrementCompletion: (scamId: string) => {
    set((state) => {
      const existingScam = state.scams[scamId];

      // Can't complete non-existent or locked scams
      if (!existingScam || !existingScam.isUnlocked) {
        return state;
      }

      return {
        scams: {
          ...state.scams,
          [scamId]: {
            ...existingScam,
            timesCompleted: existingScam.timesCompleted + 1,
          },
        },
      };
    });
  },

  getScamState: (scamId: string) => {
    return get().scams[scamId];
  },

  resetScams: () => {
    set({ scams: getInitialScamState() });
  },

  getTotalTier1Levels: () => {
    const { scams } = get();
    let totalLevels = 0;

    // Sum levels from all Tier 1 scams
    for (const scamDef of TIER_1_SCAMS) {
      const scamState = scams[scamDef.id];
      if (scamState) {
        totalLevels += scamState.level;
      }
    }

    return totalLevels;
  },

  getMilestoneBots: () => {
    const totalLevels = get().getTotalTier1Levels();
    return Math.floor(totalLevels / MILESTONE_BOT_LEVELS);
  },
}));
