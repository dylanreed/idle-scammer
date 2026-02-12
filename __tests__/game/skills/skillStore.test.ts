// ABOUTME: Tests for the skill Zustand store
// ABOUTME: Validates allocateSkill, unlockAbility, activateAbility, tickCooldowns, reset, hydrate, toSaveData

import { useSkillStore } from '../../../src/game/skills/skillStore';
import { ALL_ACTIVE_ABILITIES } from '../../../src/game/skills/abilities';

describe('Skill Store', () => {
  beforeEach(() => {
    useSkillStore.getState().reset();
  });

  describe('allocateSkill', () => {
    it('should allocate rank 1 to a skill', () => {
      const result = useSkillStore.getState().allocateSkill('overclock');
      expect(result).toBe(true);
      expect(useSkillStore.getState().passiveRanks['overclock']).toBe(1);
    });

    it('should increment rank on repeated allocation', () => {
      useSkillStore.getState().allocateSkill('overclock');
      useSkillStore.getState().allocateSkill('overclock');
      useSkillStore.getState().allocateSkill('overclock');
      expect(useSkillStore.getState().passiveRanks['overclock']).toBe(3);
    });

    it('should not exceed max rank (5)', () => {
      for (let i = 0; i < 5; i++) {
        useSkillStore.getState().allocateSkill('overclock');
      }
      const result = useSkillStore.getState().allocateSkill('overclock');
      expect(result).toBe(false);
      expect(useSkillStore.getState().passiveRanks['overclock']).toBe(5);
    });

    it('should return false for unknown skill ID', () => {
      const result = useSkillStore.getState().allocateSkill('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('unlockAbility', () => {
    it('should unlock an ability', () => {
      const result = useSkillStore.getState().unlockAbility('charm-offensive');
      expect(result).toBe(true);
      expect(useSkillStore.getState().abilities['charm-offensive'].isUnlocked).toBe(true);
    });

    it('should return false if already unlocked', () => {
      useSkillStore.getState().unlockAbility('charm-offensive');
      const result = useSkillStore.getState().unlockAbility('charm-offensive');
      expect(result).toBe(false);
    });

    it('should return false for unknown ability ID', () => {
      const result = useSkillStore.getState().unlockAbility('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('activateAbility', () => {
    it('should activate an unlocked ability', () => {
      useSkillStore.getState().unlockAbility('charm-offensive');
      const result = useSkillStore.getState().activateAbility('charm-offensive');
      expect(result).toBe(true);

      const state = useSkillStore.getState().abilities['charm-offensive'];
      expect(state.cooldownRemainingMs).toBe(300_000);
      expect(state.activeRemainingMs).toBe(60_000);
    });

    it('should not activate a locked ability', () => {
      const result = useSkillStore.getState().activateAbility('charm-offensive');
      expect(result).toBe(false);
    });

    it('should not activate while on cooldown', () => {
      useSkillStore.getState().unlockAbility('charm-offensive');
      useSkillStore.getState().activateAbility('charm-offensive');

      // Still on cooldown
      useSkillStore.getState().tickCooldowns(60_000); // Active duration ends
      const result = useSkillStore.getState().activateAbility('charm-offensive');
      expect(result).toBe(false); // Still on cooldown (300s total - 60s ticked = 240s)
    });

    it('should not activate while already active', () => {
      useSkillStore.getState().unlockAbility('charm-offensive');
      useSkillStore.getState().activateAbility('charm-offensive');

      const result = useSkillStore.getState().activateAbility('charm-offensive');
      expect(result).toBe(false);
    });

    it('should set instant abilities to 0 duration', () => {
      useSkillStore.getState().unlockAbility('ddos-burst');
      useSkillStore.getState().activateAbility('ddos-burst');

      const state = useSkillStore.getState().abilities['ddos-burst'];
      expect(state.activeRemainingMs).toBe(0);
      expect(state.cooldownRemainingMs).toBe(180_000);
    });
  });

  describe('tickCooldowns', () => {
    it('should reduce cooldown and active duration', () => {
      useSkillStore.getState().unlockAbility('charm-offensive');
      useSkillStore.getState().activateAbility('charm-offensive');

      useSkillStore.getState().tickCooldowns(10_000);

      const state = useSkillStore.getState().abilities['charm-offensive'];
      expect(state.cooldownRemainingMs).toBe(290_000);
      expect(state.activeRemainingMs).toBe(50_000);
    });

    it('should clamp to zero (never go negative)', () => {
      useSkillStore.getState().unlockAbility('charm-offensive');
      useSkillStore.getState().activateAbility('charm-offensive');

      useSkillStore.getState().tickCooldowns(999_999);

      const state = useSkillStore.getState().abilities['charm-offensive'];
      expect(state.cooldownRemainingMs).toBe(0);
      expect(state.activeRemainingMs).toBe(0);
    });

    it('should not modify state when no cooldowns/actives are running', () => {
      // Get initial state reference
      const before = useSkillStore.getState().abilities;
      useSkillStore.getState().tickCooldowns(10_000);
      const after = useSkillStore.getState().abilities;

      // Should be the same reference (no change)
      expect(after).toBe(before);
    });

    it('should ignore zero or negative delta', () => {
      useSkillStore.getState().unlockAbility('charm-offensive');
      useSkillStore.getState().activateAbility('charm-offensive');

      const before = useSkillStore.getState().abilities['charm-offensive'];
      useSkillStore.getState().tickCooldowns(0);
      useSkillStore.getState().tickCooldowns(-100);
      const after = useSkillStore.getState().abilities['charm-offensive'];

      expect(after.cooldownRemainingMs).toBe(before.cooldownRemainingMs);
    });

    it('should allow reactivation after full cooldown', () => {
      useSkillStore.getState().unlockAbility('charm-offensive');
      useSkillStore.getState().activateAbility('charm-offensive');

      // Tick past full cooldown
      useSkillStore.getState().tickCooldowns(300_000);

      const result = useSkillStore.getState().activateAbility('charm-offensive');
      expect(result).toBe(true);
    });
  });

  describe('getSkillBonuses', () => {
    it('should return zero bonuses when no skills allocated', () => {
      const bonuses = useSkillStore.getState().getSkillBonuses();
      expect(bonuses.durationReduction).toBe(0);
      expect(bonuses.rewardBonus).toBe(0);
    });

    it('should return correct bonuses after allocation', () => {
      useSkillStore.getState().allocateSkill('overclock');
      useSkillStore.getState().allocateSkill('overclock');
      const bonuses = useSkillStore.getState().getSkillBonuses();
      expect(bonuses.durationReduction).toBe(0.10);
    });
  });

  describe('getActiveEffects', () => {
    it('should return default effects with no active abilities', () => {
      const effects = useSkillStore.getState().getActiveEffects();
      expect(effects.rewardMultiplier).toBe(1);
      expect(effects.speedMultiplier).toBe(1);
    });

    it('should detect active ability effects', () => {
      useSkillStore.getState().unlockAbility('charm-offensive');
      useSkillStore.getState().activateAbility('charm-offensive');

      const effects = useSkillStore.getState().getActiveEffects();
      expect(effects.rewardMultiplier).toBe(2);
    });
  });

  describe('reset', () => {
    it('should clear all passive ranks', () => {
      useSkillStore.getState().allocateSkill('overclock');
      useSkillStore.getState().allocateSkill('overclock');
      useSkillStore.getState().reset();

      expect(useSkillStore.getState().passiveRanks['overclock']).toBeUndefined();
    });

    it('should reset all abilities to locked state', () => {
      useSkillStore.getState().unlockAbility('charm-offensive');
      useSkillStore.getState().activateAbility('charm-offensive');
      useSkillStore.getState().reset();

      const state = useSkillStore.getState().abilities['charm-offensive'];
      expect(state.isUnlocked).toBe(false);
      expect(state.cooldownRemainingMs).toBe(0);
      expect(state.activeRemainingMs).toBe(0);
    });
  });

  describe('toSaveData / hydrate', () => {
    it('should round-trip passive skill ranks', () => {
      useSkillStore.getState().allocateSkill('overclock');
      useSkillStore.getState().allocateSkill('overclock');
      useSkillStore.getState().allocateSkill('overclock');
      useSkillStore.getState().allocateSkill('silver-tongue');

      const saveData = useSkillStore.getState().toSaveData();
      useSkillStore.getState().reset();
      useSkillStore.getState().hydrate(saveData);

      expect(useSkillStore.getState().passiveRanks['overclock']).toBe(3);
      expect(useSkillStore.getState().passiveRanks['silver-tongue']).toBe(1);
    });

    it('should round-trip unlocked abilities', () => {
      useSkillStore.getState().unlockAbility('charm-offensive');
      useSkillStore.getState().unlockAbility('ddos-burst');

      const saveData = useSkillStore.getState().toSaveData();
      useSkillStore.getState().reset();
      useSkillStore.getState().hydrate(saveData);

      expect(useSkillStore.getState().abilities['charm-offensive'].isUnlocked).toBe(true);
      expect(useSkillStore.getState().abilities['ddos-burst'].isUnlocked).toBe(true);
      expect(useSkillStore.getState().abilities['vpn-tunnel'].isUnlocked).toBe(false);
    });

    it('should round-trip cooldowns and active durations', () => {
      useSkillStore.getState().unlockAbility('charm-offensive');
      useSkillStore.getState().activateAbility('charm-offensive');
      useSkillStore.getState().tickCooldowns(10_000);

      const saveData = useSkillStore.getState().toSaveData();
      useSkillStore.getState().reset();
      useSkillStore.getState().hydrate(saveData);

      const state = useSkillStore.getState().abilities['charm-offensive'];
      expect(state.isUnlocked).toBe(true);
      expect(state.cooldownRemainingMs).toBe(290_000);
      expect(state.activeRemainingMs).toBe(50_000);
    });

    it('should produce clean save data with no cooldowns when none active', () => {
      useSkillStore.getState().unlockAbility('charm-offensive');

      const saveData = useSkillStore.getState().toSaveData();
      expect(saveData.cooldowns).toEqual({});
      expect(saveData.activeDurations).toEqual({});
      expect(saveData.unlockedAbilities).toEqual(['charm-offensive']);
    });

    it('should hydrate from empty save data', () => {
      const emptyData = {
        passiveRanks: {},
        unlockedAbilities: [],
        cooldowns: {},
        activeDurations: {},
      };
      useSkillStore.getState().hydrate(emptyData);

      expect(useSkillStore.getState().passiveRanks).toEqual({});
      expect(useSkillStore.getState().abilities['charm-offensive'].isUnlocked).toBe(false);
    });
  });
});
