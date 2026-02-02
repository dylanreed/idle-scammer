// ABOUTME: Main Zustand store for Idle Scammer game state management
// ABOUTME: Handles all game resources with prestige-aware reset logic

import { create } from 'zustand';
import type { GameResources, GameState, ResourceKey } from './types';

/**
 * Returns the initial resources state.
 * All resources start at zero except trust which starts at 1 (base multiplier).
 * Exported for testing and reset purposes.
 */
export function getInitialResources(): GameResources {
  return {
    money: 0,
    reputation: 0,
    heat: 0,
    bots: 0,
    skillPoints: 0,
    crypto: 0,
    trust: 1,
  };
}

/**
 * Main game store using Zustand.
 * Manages all game resources and provides actions for modification.
 */
export const useGameStore = create<GameState>()((set, get) => ({
  resources: getInitialResources(),

  addMoney: (amount: number) => {
    set((state) => ({
      resources: {
        ...state.resources,
        money: state.resources.money + amount,
      },
    }));
  },

  addReputation: (amount: number) => {
    set((state) => ({
      resources: {
        ...state.resources,
        reputation: state.resources.reputation + amount,
      },
    }));
  },

  addHeat: (amount: number) => {
    set((state) => ({
      resources: {
        ...state.resources,
        heat: state.resources.heat + amount,
      },
    }));
  },

  addBots: (amount: number) => {
    set((state) => ({
      resources: {
        ...state.resources,
        bots: state.resources.bots + amount,
      },
    }));
  },

  addSkillPoints: (amount: number) => {
    set((state) => ({
      resources: {
        ...state.resources,
        skillPoints: state.resources.skillPoints + amount,
      },
    }));
  },

  addCrypto: (amount: number) => {
    set((state) => ({
      resources: {
        ...state.resources,
        crypto: state.resources.crypto + amount,
      },
    }));
  },

  addTrust: (amount: number) => {
    set((state) => ({
      resources: {
        ...state.resources,
        trust: state.resources.trust + amount,
      },
    }));
  },

  setResource: (key: ResourceKey, value: number) => {
    set((state) => ({
      resources: {
        ...state.resources,
        [key]: value,
      },
    }));
  },

  prestigeReset: (trustModifier?: number) => {
    set((state) => {
      const currentTrust = state.resources.trust;
      const newTrust = trustModifier !== undefined
        ? currentTrust + trustModifier
        : currentTrust;

      return {
        resources: {
          ...getInitialResources(),
          trust: newTrust,
        },
      };
    });
  },
}));
