// ABOUTME: Tests for skill calculation functions
// ABOUTME: Validates rank costs, aggregate bonus computation, and active effect detection

import {
  getSkillRankCost,
  getTotalSkillCost,
  getSpentOnSkill,
  computeSkillBonuses,
  computeActiveEffects,
} from '../../../src/game/skills/calculations';
import type { ActiveAbilityState } from '../../../src/game/skills/types';

describe('Skill Calculations', () => {
  describe('getSkillRankCost', () => {
    it('should return triangular costs (1, 3, 6, 10, 15)', () => {
      expect(getSkillRankCost(1)).toBe(1);
      expect(getSkillRankCost(2)).toBe(3);
      expect(getSkillRankCost(3)).toBe(6);
      expect(getSkillRankCost(4)).toBe(10);
      expect(getSkillRankCost(5)).toBe(15);
    });

    it('should return 0 for invalid ranks', () => {
      expect(getSkillRankCost(0)).toBe(0);
      expect(getSkillRankCost(-1)).toBe(0);
      expect(getSkillRankCost(6)).toBe(0);
    });
  });

  describe('getTotalSkillCost', () => {
    it('should return 35 (1+3+6+10+15)', () => {
      expect(getTotalSkillCost()).toBe(35);
    });
  });

  describe('getSpentOnSkill', () => {
    it('should return 0 for rank 0', () => {
      expect(getSpentOnSkill(0)).toBe(0);
    });

    it('should return cumulative triangular costs for each rank', () => {
      expect(getSpentOnSkill(1)).toBe(1);
      expect(getSpentOnSkill(2)).toBe(4);   // 1+3
      expect(getSpentOnSkill(3)).toBe(10);  // 1+3+6
      expect(getSpentOnSkill(4)).toBe(20);  // 1+3+6+10
      expect(getSpentOnSkill(5)).toBe(35);  // 1+3+6+10+15
    });

    it('should return 0 for negative ranks', () => {
      expect(getSpentOnSkill(-1)).toBe(0);
    });
  });

  describe('computeSkillBonuses', () => {
    it('should return all zeros for empty state', () => {
      const bonuses = computeSkillBonuses({});
      expect(bonuses.durationReduction).toBe(0);
      expect(bonuses.botSpeedAmplifier).toBe(0);
      expect(bonuses.botProfitAmplifier).toBe(0);
      expect(bonuses.rewardBonus).toBe(0);
      expect(bonuses.employeeCostDiscount).toBe(0);
      expect(bonuses.trustGainBonus).toBe(0);
      expect(bonuses.moneyBonus).toBe(0);
      expect(bonuses.upgradeCostDiscount).toBe(0);
      expect(bonuses.passiveIncomePerSec).toBe(0);
      expect(bonuses.heatGainReduction).toBe(0);
      expect(bonuses.heatDecayBonus).toBe(0);
      expect(bonuses.heatThresholdBonus).toBe(0);
    });

    it('should compute overclock bonus at rank 1', () => {
      const bonuses = computeSkillBonuses({ overclock: 1 });
      expect(bonuses.durationReduction).toBe(0.05);
    });

    it('should compute overclock bonus at rank 5', () => {
      const bonuses = computeSkillBonuses({ overclock: 5 });
      expect(bonuses.durationReduction).toBe(0.30);
    });

    it('should compute compound interest at rank 3', () => {
      const bonuses = computeSkillBonuses({ 'compound-interest': 3 });
      expect(bonuses.passiveIncomePerSec).toBe(15);
    });

    it('should compute ghost protocol at rank 5', () => {
      const bonuses = computeSkillBonuses({ 'ghost-protocol': 5 });
      expect(bonuses.heatThresholdBonus).toBe(50);
    });

    it('should compute multiple skills simultaneously', () => {
      const bonuses = computeSkillBonuses({
        'overclock': 2,
        'silver-tongue': 3,
        'dirty-cops': 4,
        'bulk-discount': 1,
      });
      expect(bonuses.durationReduction).toBe(0.10);
      expect(bonuses.rewardBonus).toBe(0.20);
      expect(bonuses.heatDecayBonus).toBe(0.70);
      expect(bonuses.upgradeCostDiscount).toBe(0.03);
    });

    it('should ignore rank 0 skills', () => {
      const bonuses = computeSkillBonuses({ overclock: 0 });
      expect(bonuses.durationReduction).toBe(0);
    });

    it('should ignore unknown skill IDs', () => {
      const bonuses = computeSkillBonuses({ 'nonexistent-skill': 3 });
      expect(bonuses.durationReduction).toBe(0);
    });
  });

  describe('computeActiveEffects', () => {
    function makeAbilityState(
      id: string,
      overrides: Partial<ActiveAbilityState> = {}
    ): ActiveAbilityState {
      return {
        abilityId: id,
        isUnlocked: true,
        cooldownRemainingMs: 0,
        activeRemainingMs: 0,
        ...overrides,
      };
    }

    it('should return defaults for empty state', () => {
      const effects = computeActiveEffects({});
      expect(effects.rewardMultiplier).toBe(1);
      expect(effects.speedMultiplier).toBe(1);
      expect(effects.employeeBonusMultiplier).toBe(1);
      expect(effects.zeroHeatGain).toBe(false);
      expect(effects.instantComplete).toBe(false);
      expect(effects.instantHeatReduce).toBe(false);
    });

    it('should detect active Charm Offensive', () => {
      const effects = computeActiveEffects({
        'charm-offensive': makeAbilityState('charm-offensive', {
          activeRemainingMs: 30_000,
        }),
      });
      expect(effects.rewardMultiplier).toBe(2);
    });

    it('should not detect inactive Charm Offensive', () => {
      const effects = computeActiveEffects({
        'charm-offensive': makeAbilityState('charm-offensive', {
          activeRemainingMs: 0,
        }),
      });
      expect(effects.rewardMultiplier).toBe(1);
    });

    it('should detect active Zero Day', () => {
      const effects = computeActiveEffects({
        'zero-day': makeAbilityState('zero-day', {
          activeRemainingMs: 15_000,
        }),
      });
      expect(effects.speedMultiplier).toBe(3);
    });

    it('should detect active Deep Fake', () => {
      const effects = computeActiveEffects({
        'deep-fake': makeAbilityState('deep-fake', {
          activeRemainingMs: 45_000,
        }),
      });
      expect(effects.employeeBonusMultiplier).toBe(2);
    });

    it('should detect active VPN Tunnel', () => {
      const effects = computeActiveEffects({
        'vpn-tunnel': makeAbilityState('vpn-tunnel', {
          activeRemainingMs: 50_000,
        }),
      });
      expect(effects.zeroHeatGain).toBe(true);
    });

    it('should ignore locked abilities even with active time remaining', () => {
      const effects = computeActiveEffects({
        'charm-offensive': makeAbilityState('charm-offensive', {
          isUnlocked: false,
          activeRemainingMs: 30_000,
        }),
      });
      expect(effects.rewardMultiplier).toBe(1);
    });

    it('should detect multiple active abilities simultaneously', () => {
      const effects = computeActiveEffects({
        'charm-offensive': makeAbilityState('charm-offensive', {
          activeRemainingMs: 30_000,
        }),
        'vpn-tunnel': makeAbilityState('vpn-tunnel', {
          activeRemainingMs: 50_000,
        }),
        'zero-day': makeAbilityState('zero-day', {
          activeRemainingMs: 15_000,
        }),
      });
      expect(effects.rewardMultiplier).toBe(2);
      expect(effects.zeroHeatGain).toBe(true);
      expect(effects.speedMultiplier).toBe(3);
    });
  });
});
