// ABOUTME: Zustand store for tracking the player's selected origin backstory
// ABOUTME: Manages origin selection, bonus lookup, and save/load operations

import { create } from 'zustand';
import type { OriginId, OriginBonuses, OriginSaveData } from './types';
import { ORIGINS, NO_ORIGIN_BONUSES } from './constants';

/**
 * Actions available on the origin store
 */
export interface OriginStoreActions {
  /** Select an origin backstory */
  selectOrigin: (id: OriginId) => void;

  /** Get the bonuses for the currently selected origin (or zeros if none) */
  getOriginBonuses: () => OriginBonuses;

  /** Restore origin state from save data */
  hydrate: (data: OriginSaveData) => void;

  /** Reset to initial state (clears origin selection) */
  reset: () => void;

  /** Export current state as save data */
  toSaveData: () => OriginSaveData;
}

/**
 * Complete origin store state
 */
export interface OriginStoreState extends OriginStoreActions {
  selectedOrigin: OriginId | null;
}

/**
 * Origin store using Zustand.
 * Tracks the player's selected origin backstory and provides bonus lookup.
 * Origin persists across prestige but resets on full game reset.
 */
export const useOriginStore = create<OriginStoreState>()((set, get) => ({
  selectedOrigin: null,

  selectOrigin: (id: OriginId) => {
    set({ selectedOrigin: id });
  },

  getOriginBonuses: (): OriginBonuses => {
    const { selectedOrigin } = get();
    if (selectedOrigin === null) return NO_ORIGIN_BONUSES;
    return ORIGINS[selectedOrigin].bonuses;
  },

  hydrate: (data: OriginSaveData) => {
    set({ selectedOrigin: data.selectedOrigin });
  },

  reset: () => {
    set({ selectedOrigin: null });
  },

  toSaveData: (): OriginSaveData => {
    return { selectedOrigin: get().selectedOrigin };
  },
}));
