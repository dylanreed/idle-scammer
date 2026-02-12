// ABOUTME: Zustand store for managing skill allocations and active abilities
// ABOUTME: Handles passive skill ranks, ability unlocks, cooldown ticking, and prestige resets

import { create } from 'zustand';
import type {
  ActiveAbilityState,
  SkillBonuses,
  ActiveEffects,
  SkillSaveData,
} from './types';
import { ALL_PASSIVE_SKILLS } from './definitions';
import { ALL_ACTIVE_ABILITIES } from './abilities';
import { getSkillRankCost, computeSkillBonuses, computeActiveEffects } from './calculations';

/**
 * Actions available on the skill store
 */
export interface SkillStoreActions {
  /** Allocate one rank to a passive skill (costs SP from game store) */
  allocateSkill: (skillId: string) => boolean;

  /** Unlock an active ability (costs SP from game store) */
  unlockAbility: (abilityId: string) => boolean;

  /** Activate an unlocked ability (starts duration + cooldown) */
  activateAbility: (abilityId: string) => boolean;

  /** Get the current activation cost for an ability (escalates with usage) */
  getActivationCost: (abilityId: string) => number;

  /** Tick all cooldowns and active durations by deltaMs */
  tickCooldowns: (deltaMs: number) => void;

  /** Get computed passive skill bonuses */
  getSkillBonuses: () => SkillBonuses;

  /** Get computed active effects */
  getActiveEffects: () => ActiveEffects;

  /** Reset all skills (called on prestige) */
  reset: () => void;

  /** Restore state from save data */
  hydrate: (saveData: SkillSaveData) => void;

  /** Serialize current state for saving */
  toSaveData: () => SkillSaveData;
}

/**
 * Complete skill store state
 */
export interface SkillStoreState extends SkillStoreActions {
  /** Map of passive skill ID to current rank (0-5) */
  passiveRanks: Record<string, number>;

  /** Map of ability ID to runtime state */
  abilities: Record<string, ActiveAbilityState>;

  /** Map of ability ID to number of times activated this run */
  abilityUseCounts: Record<string, number>;
}

/**
 * Creates initial ability states — all locked, no cooldowns.
 */
function createInitialAbilities(): Record<string, ActiveAbilityState> {
  const abilities: Record<string, ActiveAbilityState> = {};
  for (const def of ALL_ACTIVE_ABILITIES) {
    abilities[def.id] = {
      abilityId: def.id,
      isUnlocked: false,
      cooldownRemainingMs: 0,
      activeRemainingMs: 0,
    };
  }
  return abilities;
}

/**
 * Skill store using Zustand.
 * Manages passive skill ranks and active ability states.
 *
 * Note: SP spending is handled by the caller (GameScreen) which checks
 * resources.skillPoints and calls gameStore.addSkillPoints(-cost) before
 * calling allocateSkill/unlockAbility. The store methods return false if
 * the skill/ability can't be upgraded (already maxed, already unlocked, etc.)
 * but don't check SP balance themselves.
 */
export const useSkillStore = create<SkillStoreState>()((set, get) => ({
  passiveRanks: {},
  abilities: createInitialAbilities(),
  abilityUseCounts: {},

  allocateSkill: (skillId: string) => {
    const currentRank = get().passiveRanks[skillId] ?? 0;
    const skillDef = ALL_PASSIVE_SKILLS.find((s) => s.id === skillId);

    if (!skillDef || currentRank >= skillDef.maxRank) {
      return false;
    }

    set((state) => ({
      passiveRanks: {
        ...state.passiveRanks,
        [skillId]: currentRank + 1,
      },
    }));
    return true;
  },

  unlockAbility: (abilityId: string) => {
    const state = get();
    const abilityState = state.abilities[abilityId];

    if (!abilityState || abilityState.isUnlocked) {
      return false;
    }

    set((state) => ({
      abilities: {
        ...state.abilities,
        [abilityId]: {
          ...state.abilities[abilityId],
          isUnlocked: true,
        },
      },
    }));
    return true;
  },

  activateAbility: (abilityId: string) => {
    const state = get();
    const abilityState = state.abilities[abilityId];

    if (!abilityState || !abilityState.isUnlocked) {
      return false;
    }

    // Can't activate while on cooldown
    if (abilityState.cooldownRemainingMs > 0) {
      return false;
    }

    // Can't activate while already active (for timed abilities)
    if (abilityState.activeRemainingMs > 0) {
      return false;
    }

    const def = ALL_ACTIVE_ABILITIES.find((a) => a.id === abilityId);
    if (!def) return false;

    set((state) => ({
      abilities: {
        ...state.abilities,
        [abilityId]: {
          ...state.abilities[abilityId],
          cooldownRemainingMs: def.cooldownMs,
          activeRemainingMs: def.durationMs,
        },
      },
      abilityUseCounts: {
        ...state.abilityUseCounts,
        [abilityId]: (state.abilityUseCounts[abilityId] ?? 0) + 1,
      },
    }));
    return true;
  },

  getActivationCost: (abilityId: string) => {
    const def = ALL_ACTIVE_ABILITIES.find((a) => a.id === abilityId);
    if (!def) return 0;
    const useCount = get().abilityUseCounts[abilityId] ?? 0;
    return def.activationCost + Math.floor(useCount * def.activationCostEscalation);
  },

  tickCooldowns: (deltaMs: number) => {
    if (deltaMs <= 0) return;

    set((state) => {
      const updatedAbilities = { ...state.abilities };
      let changed = false;

      for (const id of Object.keys(updatedAbilities)) {
        const ability = updatedAbilities[id];
        if (ability.cooldownRemainingMs > 0 || ability.activeRemainingMs > 0) {
          changed = true;
          updatedAbilities[id] = {
            ...ability,
            cooldownRemainingMs: Math.max(0, ability.cooldownRemainingMs - deltaMs),
            activeRemainingMs: Math.max(0, ability.activeRemainingMs - deltaMs),
          };
        }
      }

      if (!changed) return state;
      return { abilities: updatedAbilities };
    });
  },

  getSkillBonuses: () => {
    return computeSkillBonuses(get().passiveRanks);
  },

  getActiveEffects: () => {
    return computeActiveEffects(get().abilities);
  },

  reset: () => {
    set({
      passiveRanks: {},
      abilities: createInitialAbilities(),
      abilityUseCounts: {},
    });
  },

  hydrate: (saveData: SkillSaveData) => {
    const abilities = createInitialAbilities();

    // Restore unlocked abilities and their cooldowns/durations
    for (const abilityId of saveData.unlockedAbilities) {
      if (abilities[abilityId]) {
        abilities[abilityId] = {
          ...abilities[abilityId],
          isUnlocked: true,
          cooldownRemainingMs: saveData.cooldowns[abilityId] ?? 0,
          activeRemainingMs: saveData.activeDurations[abilityId] ?? 0,
        };
      }
    }

    set({
      passiveRanks: { ...saveData.passiveRanks },
      abilities,
      abilityUseCounts: saveData.abilityUseCounts ? { ...saveData.abilityUseCounts } : {},
    });
  },

  toSaveData: () => {
    const state = get();
    const unlockedAbilities: string[] = [];
    const cooldowns: Record<string, number> = {};
    const activeDurations: Record<string, number> = {};

    for (const [id, ability] of Object.entries(state.abilities)) {
      if (ability.isUnlocked) {
        unlockedAbilities.push(id);
        if (ability.cooldownRemainingMs > 0) {
          cooldowns[id] = ability.cooldownRemainingMs;
        }
        if (ability.activeRemainingMs > 0) {
          activeDurations[id] = ability.activeRemainingMs;
        }
      }
    }

    return {
      passiveRanks: { ...state.passiveRanks },
      unlockedAbilities,
      cooldowns,
      activeDurations,
      abilityUseCounts: { ...state.abilityUseCounts },
    };
  },
}));
