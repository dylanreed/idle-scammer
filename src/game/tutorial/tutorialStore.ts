// ABOUTME: Zustand store for tracking tutorial/progressive disclosure state
// ABOUTME: Manages hasPrestiged flag, seen tutorial list, and save/load operations

import { create } from 'zustand';
import type { TutorialSaveData } from './types';
import { DEFAULT_TUTORIAL_SAVE_DATA } from './types';

/**
 * Actions available on the tutorial store
 */
export interface TutorialStoreActions {
  /** Increment prestige count and set hasPrestiged flag */
  incrementPrestige: () => void;

  /** @deprecated Use incrementPrestige() instead. Kept for backward compatibility. */
  markPrestiged: () => void;

  /** Mark a tutorial modal as seen/dismissed */
  markSeen: (id: string) => void;

  /** Check if a tutorial modal has been seen */
  hasSeen: (id: string) => boolean;

  /** Restore tutorial state from save data */
  hydrate: (data: TutorialSaveData) => void;

  /** Reset to initial state (for full game reset) */
  reset: () => void;

  /** Export current state as save data */
  toSaveData: () => TutorialSaveData;
}

/**
 * Complete tutorial store state
 */
export interface TutorialStoreState extends TutorialStoreActions {
  hasPrestiged: boolean;
  prestigeCount: number;
  seen: string[];
}

/**
 * Tutorial store using Zustand.
 * Tracks progressive disclosure state: whether the player has prestiged
 * and which tutorial modals have been dismissed.
 */
export const useTutorialStore = create<TutorialStoreState>()((set, get) => ({
  hasPrestiged: false,
  prestigeCount: 0,
  seen: [],

  incrementPrestige: () => {
    set((state) => ({
      prestigeCount: state.prestigeCount + 1,
      hasPrestiged: true,
    }));
  },

  markPrestiged: () => {
    get().incrementPrestige();
  },

  markSeen: (id: string) => {
    set((state) => {
      if (state.seen.includes(id)) return state;
      return { seen: [...state.seen, id] };
    });
  },

  hasSeen: (id: string) => {
    return get().seen.includes(id);
  },

  hydrate: (data: TutorialSaveData) => {
    set({
      hasPrestiged: data.hasPrestiged,
      prestigeCount: data.prestigeCount ?? (data.hasPrestiged ? 1 : 0),
      seen: [...data.seen],
    });
  },

  reset: () => {
    set({
      hasPrestiged: DEFAULT_TUTORIAL_SAVE_DATA.hasPrestiged,
      prestigeCount: DEFAULT_TUTORIAL_SAVE_DATA.prestigeCount,
      seen: [...DEFAULT_TUTORIAL_SAVE_DATA.seen],
    });
  },

  toSaveData: (): TutorialSaveData => {
    const { prestigeCount, seen } = get();
    return {
      hasPrestiged: prestigeCount >= 1,
      prestigeCount,
      seen: [...seen],
    };
  },
}));
