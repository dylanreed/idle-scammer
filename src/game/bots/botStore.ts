// ABOUTME: Zustand store for managing bot assignments to scams
// ABOUTME: Handles assign/unassign operations, bonus calculations, and prestige resets

import { create } from 'zustand';
import type { BotAssignment, BotAssignmentMap, BotBonuses } from './types';
import { SPEED_BOT_BONUS, PROFIT_BOT_BONUS } from './constants';

/**
 * Actions available on the bot store
 */
export interface BotStoreActions {
  /** Assign one bot to a scam in a specific role */
  assignBot: (scamId: string, role: 'speed' | 'profit') => void;

  /** Unassign one bot from a scam role (returns to pool) */
  unassignBot: (scamId: string, role: 'speed' | 'profit') => void;

  /** Get computed speed and profit bonuses for a scam */
  getScamBotBonuses: (scamId: string) => BotBonuses;

  /** Get total number of bots assigned across all scams */
  getTotalAssigned: () => number;

  /** Get number of whole bots available to assign */
  getAvailableBots: (totalBots: number) => number;

  /** Clear all assignments (called on prestige) */
  resetAssignments: () => void;

  /** Restore assignments from save data */
  hydrate: (assignments: BotAssignmentMap) => void;
}

/**
 * Complete bot store state
 */
export interface BotStoreState extends BotStoreActions {
  assignments: BotAssignmentMap;
}

/**
 * Creates a default empty bot assignment.
 */
function createEmptyAssignment(): BotAssignment {
  return { speedBots: 0, profitBots: 0 };
}

/**
 * Bot store using Zustand.
 * Manages bot assignments to scams for speed and profit bonuses.
 */
export const useBotStore = create<BotStoreState>()((set, get) => ({
  assignments: {},

  assignBot: (scamId: string, role: 'speed' | 'profit') => {
    set((state) => {
      const existing = state.assignments[scamId] ?? createEmptyAssignment();
      const key = role === 'speed' ? 'speedBots' : 'profitBots';

      return {
        assignments: {
          ...state.assignments,
          [scamId]: {
            ...existing,
            [key]: existing[key] + 1,
          },
        },
      };
    });
  },

  unassignBot: (scamId: string, role: 'speed' | 'profit') => {
    set((state) => {
      const existing = state.assignments[scamId];
      if (!existing) return state;

      const key = role === 'speed' ? 'speedBots' : 'profitBots';
      const newValue = Math.max(0, existing[key] - 1);

      return {
        assignments: {
          ...state.assignments,
          [scamId]: {
            ...existing,
            [key]: newValue,
          },
        },
      };
    });
  },

  getScamBotBonuses: (scamId: string) => {
    const assignment = get().assignments[scamId];
    if (!assignment) {
      return { speedBonus: 0, profitBonus: 0 };
    }

    return {
      speedBonus: assignment.speedBots * SPEED_BOT_BONUS,
      profitBonus: assignment.profitBots * PROFIT_BOT_BONUS,
    };
  },

  getTotalAssigned: () => {
    const { assignments } = get();
    let total = 0;
    for (const assignment of Object.values(assignments)) {
      total += assignment.speedBots + assignment.profitBots;
    }
    return total;
  },

  getAvailableBots: (totalBots: number) => {
    const wholeBots = Math.floor(totalBots);
    const assigned = get().getTotalAssigned();
    return Math.max(0, wholeBots - assigned);
  },

  resetAssignments: () => {
    set({ assignments: {} });
  },

  hydrate: (assignments: BotAssignmentMap) => {
    set({ assignments });
  },
}));
