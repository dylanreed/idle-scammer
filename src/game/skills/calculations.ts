// ABOUTME: Pure calculation functions for the skill system
// ABOUTME: Computes skill rank costs, aggregate bonuses, and active effects

import type {
  PassiveSkillState,
  ActiveAbilityState,
  SkillBonuses,
  ActiveEffects,
} from './types';
import { ALL_PASSIVE_SKILLS } from './definitions';
import { ALL_ACTIVE_ABILITIES } from './abilities';

/**
 * Returns the SP cost to purchase a specific rank of any passive skill.
 * Cost per rank = rank number (1+2+3+4+5 = 15 SP per skill, 180 SP total for all 12).
 *
 * @param rank - The rank being purchased (1-5)
 * @returns SP cost for that rank
 */
export function getSkillRankCost(rank: number): number {
  if (rank < 1 || rank > 5) return 0;
  return rank;
}

/**
 * Returns the total SP cost to max a single skill from rank 0 to 5.
 * Sum of 1+2+3+4+5 = 15 SP.
 */
export function getTotalSkillCost(): number {
  return 15;
}

/**
 * Returns the total SP spent on a skill at a given rank.
 * Sum of 1+2+...+rank.
 *
 * @param rank - Current rank (0-5)
 * @returns Total SP invested
 */
export function getSpentOnSkill(rank: number): number {
  if (rank <= 0) return 0;
  return (rank * (rank + 1)) / 2;
}

/**
 * Computes aggregate passive skill bonuses from current skill states.
 * Looks up each skill's definition and extracts the effect value at current rank.
 *
 * @param passiveStates - Map of skill ID to current rank
 * @returns SkillBonuses object with all computed values
 */
export function computeSkillBonuses(passiveStates: Record<string, number>): SkillBonuses {
  const bonuses: SkillBonuses = {
    durationReduction: 0,
    botSpeedAmplifier: 0,
    botProfitAmplifier: 0,
    rewardBonus: 0,
    employeeCostDiscount: 0,
    reputationBonus: 0,
    moneyBonus: 0,
    upgradeCostDiscount: 0,
    passiveIncomePerSec: 0,
    heatGainReduction: 0,
    heatDecayBonus: 0,
    heatThresholdBonus: 0,
  };

  for (const skill of ALL_PASSIVE_SKILLS) {
    const rank = passiveStates[skill.id] ?? 0;
    if (rank <= 0) continue;

    // ranks array is 0-indexed, rank 1 = index 0
    const value = skill.ranks[rank - 1];

    switch (skill.id) {
      case 'overclock':
        bonuses.durationReduction = value;
        break;
      case 'botnet-boost':
        bonuses.botSpeedAmplifier = value;
        break;
      case 'firmware-hack':
        bonuses.botProfitAmplifier = value;
        break;
      case 'silver-tongue':
        bonuses.rewardBonus = value;
        break;
      case 'recruitment-drive':
        bonuses.employeeCostDiscount = value;
        break;
      case 'hype-machine':
        bonuses.reputationBonus = value;
        break;
      case 'creative-accounting':
        bonuses.moneyBonus = value;
        break;
      case 'bulk-discount':
        bonuses.upgradeCostDiscount = value;
        break;
      case 'compound-interest':
        bonuses.passiveIncomePerSec = value;
        break;
      case 'burner-phones':
        bonuses.heatGainReduction = value;
        break;
      case 'dirty-cops':
        bonuses.heatDecayBonus = value;
        break;
      case 'ghost-protocol':
        bonuses.heatThresholdBonus = value;
        break;
    }
  }

  return bonuses;
}

/**
 * Computes which active effects are currently active based on ability states.
 * An effect is active when its activeRemainingMs > 0 (for timed abilities)
 * or when it's been triggered (for instant abilities — handled by the store).
 *
 * @param abilityStates - Map of ability ID to its runtime state
 * @returns ActiveEffects object with all computed values
 */
export function computeActiveEffects(abilityStates: Record<string, ActiveAbilityState>): ActiveEffects {
  const effects: ActiveEffects = {
    rewardMultiplier: 1,
    speedMultiplier: 1,
    employeeBonusMultiplier: 1,
    zeroHeatGain: false,
    instantComplete: false,
    instantHeatReduce: false,
  };

  for (const ability of ALL_ACTIVE_ABILITIES) {
    const state = abilityStates[ability.id];
    if (!state?.isUnlocked) continue;

    // Timed abilities are active when activeRemainingMs > 0
    const isActive = state.activeRemainingMs > 0;

    switch (ability.id) {
      case 'charm-offensive':
        if (isActive) effects.rewardMultiplier = ability.effectValue;
        break;
      case 'zero-day':
        if (isActive) effects.speedMultiplier = ability.effectValue;
        break;
      case 'deep-fake':
        if (isActive) effects.employeeBonusMultiplier = ability.effectValue;
        break;
      case 'vpn-tunnel':
        if (isActive) effects.zeroHeatGain = true;
        break;
      // Instant abilities (ddos-burst, burner-phone-ability) are handled by the store
      // and consumed immediately — not tracked via activeRemainingMs
    }
  }

  return effects;
}
