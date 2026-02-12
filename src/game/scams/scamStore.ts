// ABOUTME: Zustand store slice for managing scam state
// ABOUTME: Tracks unlock status, levels, and completion counts for all scams

import { create } from 'zustand';
import type { ScamState } from './types';
import { NIGERIAN_PRINCE_EMAILS, TIER_1_SCAMS, ALL_SCAMS } from './definitions';
import { TIER_2_SCAMS } from './tier2';
import { TIER_3_SCAMS } from './tier3';
import { TIER_4_SCAMS } from './tier4';
import { TIER_5_SCAMS } from './tier5';

/**
 * Map of scam IDs to their runtime state
 */
export type ScamStateMap = Record<string, ScamState>;

/**
 * Actions available on the scam store
 */
export interface ScamStoreActions {
  /** Unlock a scam by ID */
  unlockScam: (scamId: string) => void;

  /** Upgrade a scam to the next level (only if unlocked) */
  upgradeScam: (scamId: string) => void;

  /** Upgrade a scam by multiple levels at once (only if unlocked) */
  upgradeScamByLevels: (scamId: string, levels: number) => void;

  /** Increment completion count (only if unlocked) */
  incrementCompletion: (scamId: string) => void;

  /** Get state for a specific scam (undefined if not found) */
  getScamState: (scamId: string) => ScamState | undefined;

  /** Bulk-restore all scam state from save data */
  hydrate: (scams: ScamStateMap) => void;

  /** Reset all scam state (for prestige) */
  resetScams: () => void;

  /** Get total combined levels of all Tier 1 scams */
  getTotalTier1Levels: () => number;
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
 * Returns the initial scam state with all tiers initialized.
 * Prince Emails starts unlocked; all other scams start locked.
 * T2-T5 scams are initialized but locked (require trust to access their tier).
 *
 * @returns Initial scam state map
 */
export function getInitialScamState(): ScamStateMap {
  const initialState: ScamStateMap = {};

  // Initialize all Tier 1 scams
  TIER_1_SCAMS.forEach((scam) => {
    // Only Prince Emails starts unlocked
    const isUnlocked = scam.id === NIGERIAN_PRINCE_EMAILS.id;
    initialState[scam.id] = createScamState(scam.id, isUnlocked);
  });

  // Initialize all T2-T5 scams as locked
  const higherTierScams = [
    ...TIER_2_SCAMS,
    ...TIER_3_SCAMS,
    ...TIER_4_SCAMS,
    ...TIER_5_SCAMS,
  ];
  higherTierScams.forEach((scam) => {
    initialState[scam.id] = createScamState(scam.id, false);
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

  upgradeScamByLevels: (scamId: string, levels: number) => {
    set((state) => {
      const existingScam = state.scams[scamId];

      // Can't upgrade non-existent or locked scams, or by 0 levels
      if (!existingScam || !existingScam.isUnlocked || levels <= 0) {
        return state;
      }

      return {
        scams: {
          ...state.scams,
          [scamId]: {
            ...existingScam,
            level: existingScam.level + levels,
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

  hydrate: (scams: ScamStateMap) => {
    set({ scams });
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
}));
