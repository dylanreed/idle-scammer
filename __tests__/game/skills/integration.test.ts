// ABOUTME: Integration tests for skill params in existing calculation functions
// ABOUTME: Validates that optional skill/ability params modify results correctly

import {
  calculateScamDuration,
  calculateScamReward,
  calculateUpgradeCost,
} from '../../../src/game/scams/calculations';
import {
  calculateHeatFromScam,
  getEffectiveDecayRate,
  isPrestigeForced,
} from '../../../src/game/prestige/calculations';
import { getEmployeeCostForScam } from '../../../src/game/employees/calculations';
import type { ScamDefinition } from '../../../src/game/scams/types';

const testScam: ScamDefinition = {
  id: 'test-scam',
  name: 'Test Scam',
  tier: 1,
  baseDuration: 10000,
  baseReward: 100,
  resourceType: 'money',
  description: 'Test scam',
  unlockCost: 100,
};

describe('Skill Integration: calculateScamDuration', () => {
  it('should not change with default skill params', () => {
    const base = calculateScamDuration(testScam, 1);
    const withDefaults = calculateScamDuration(testScam, 1, 0, 0, 1, 1);
    expect(withDefaults).toBe(base);
  });

  it('should reduce duration with skillDurationMultiplier < 1', () => {
    const base = calculateScamDuration(testScam, 1);
    const withSkill = calculateScamDuration(testScam, 1, 0, 0, 0.7, 1);
    expect(withSkill).toBeLessThan(base);
    expect(withSkill).toBe(Math.max(Math.round(10000 * 0.7), Math.round(10000 * 0.1)));
  });

  it('should speed up with activeSpeedMultiplier > 1', () => {
    const base = calculateScamDuration(testScam, 1);
    const withActive = calculateScamDuration(testScam, 1, 0, 0, 1, 3);
    expect(withActive).toBeLessThan(base);
    expect(withActive).toBe(Math.max(Math.round(10000 / 3), Math.round(10000 * 0.1)));
  });

  it('should combine skill and active multipliers', () => {
    const withBoth = calculateScamDuration(testScam, 1, 0, 0, 0.7, 3);
    // 10000 * 0.7 / 3 = 2333
    expect(withBoth).toBe(Math.max(Math.round(10000 * 0.7 / 3), Math.round(10000 * 0.1)));
  });

  it('should allow skills to push duration below 10% floor', () => {
    // Level 100 speed bracket = 10x, so 10000/10 = 1000 = exactly the 10% floor
    const atFloor = calculateScamDuration(testScam, 100, 0, 0);
    expect(atFloor).toBe(1000);

    // Overclock (0.7 = 30% faster) should push below the 1000ms floor
    const withSkill = calculateScamDuration(testScam, 100, 0, 0, 0.7, 1);
    expect(withSkill).toBe(700); // 1000 * 0.7 = 700, below old 10% floor
  });

  it('should not go below absolute minimum (500ms) even with extreme skills', () => {
    const extreme = calculateScamDuration(testScam, 1, 0, 0, 0.01, 10);
    // Skills push it way down but hard floor of 500ms catches it
    expect(extreme).toBe(500);
  });

  it('should apply level/bot floor before skill multipliers', () => {
    // High level + bots hit the 10% floor, then skills reduce from there
    const withSkillsAndBots = calculateScamDuration(testScam, 100, 0, 3.0, 0.7, 1);
    // withBotBoost = 1000 / 4.0 = 250, floored to 1000
    // then skills: 1000 * 0.7 = 700
    expect(withSkillsAndBots).toBe(700);
  });
});

describe('Skill Integration: calculateScamReward', () => {
  it('should not change with default skill params', () => {
    const base = calculateScamReward(testScam, 1, 1);
    const withDefaults = calculateScamReward(testScam, 1, 1, 0, 0, 1, 1);
    expect(withDefaults).toBe(base);
  });

  it('should increase with skillRewardMultiplier > 1', () => {
    const base = calculateScamReward(testScam, 1, 1);
    const withSkill = calculateScamReward(testScam, 1, 1, 0, 0, 1.45, 1);
    expect(withSkill).toBeCloseTo(base * 1.45, 5);
  });

  it('should increase with activeRewardMultiplier > 1', () => {
    const base = calculateScamReward(testScam, 1, 1);
    const withActive = calculateScamReward(testScam, 1, 1, 0, 0, 1, 2);
    expect(withActive).toBeCloseTo(base * 2, 5);
  });

  it('should combine skill and active reward multipliers', () => {
    const base = calculateScamReward(testScam, 1, 1);
    const withBoth = calculateScamReward(testScam, 1, 1, 0, 0, 1.45, 2);
    expect(withBoth).toBeCloseTo(base * 1.45 * 2, 5);
  });
});

describe('Skill Integration: calculateUpgradeCost', () => {
  it('should not change with default skill param', () => {
    const base = calculateUpgradeCost(testScam, 1);
    const withDefault = calculateUpgradeCost(testScam, 1, 0);
    expect(withDefault).toBe(base);
  });

  it('should reduce cost with skill discount', () => {
    const base = calculateUpgradeCost(testScam, 5);
    const withDiscount = calculateUpgradeCost(testScam, 5, 0.25);
    expect(withDiscount).toBeLessThan(base);
    // 25% discount
    expect(withDiscount).toBe(Math.max(1, Math.floor(base * 0.75)));
  });

  it('should never go below 1', () => {
    // At level 1, cost = 100. With 100% discount...
    const extreme = calculateUpgradeCost(testScam, 1, 1.0);
    expect(extreme).toBeGreaterThanOrEqual(1);
  });
});

describe('Skill Integration: calculateHeatFromScam', () => {
  it('should not change with default skill param', () => {
    const base = calculateHeatFromScam(testScam);
    const withDefault = calculateHeatFromScam(testScam, 1);
    expect(withDefault).toBe(base);
  });

  it('should reduce heat with multiplier < 1', () => {
    const base = calculateHeatFromScam(testScam);
    const withSkill = calculateHeatFromScam(testScam, 0.6);
    expect(withSkill).toBeCloseTo(base * 0.6, 10);
  });

  it('should zero heat with multiplier of 0', () => {
    const withZero = calculateHeatFromScam(testScam, 0);
    expect(withZero).toBe(0);
  });
});

describe('Skill Integration: getEffectiveDecayRate', () => {
  it('should not change with default skill param', () => {
    const base = getEffectiveDecayRate(1);
    const withDefault = getEffectiveDecayRate(1, 0);
    expect(withDefault).toBe(base);
  });

  it('should increase decay rate with positive bonus', () => {
    const base = getEffectiveDecayRate(1);
    const withBonus = getEffectiveDecayRate(1, 1.0);
    expect(withBonus).toBeGreaterThan(base);
    // At trust 1, base = 0.001 * (1 + 0 * 1.0) = 0.001
    // With bonus 1.0: 0.001 + 1.0 * 0.001 = 0.002
    expect(withBonus).toBeCloseTo(0.002, 10);
  });
});

describe('Skill Integration: isPrestigeForced', () => {
  it('should trigger at 100 with default param', () => {
    expect(isPrestigeForced(100)).toBe(true);
    expect(isPrestigeForced(99.9)).toBe(false);
  });

  it('should not trigger at 100 with threshold bonus', () => {
    expect(isPrestigeForced(100, 50)).toBe(false);
    expect(isPrestigeForced(149, 50)).toBe(false);
    expect(isPrestigeForced(150, 50)).toBe(true);
  });
});

describe('Skill Integration: getEmployeeCostForScam', () => {
  it('should not change with default skill param', () => {
    const base = getEmployeeCostForScam('nigerian-prince-emails', 0);
    const withDefault = getEmployeeCostForScam('nigerian-prince-emails', 0, 0, 0);
    expect(withDefault).toBe(base);
  });

  it('should reduce cost with skill discount', () => {
    const base = getEmployeeCostForScam('nigerian-prince-emails', 3);
    const withDiscount = getEmployeeCostForScam('nigerian-prince-emails', 3, 0, 0.40);
    expect(withDiscount).toBeLessThan(base);
  });

  it('should never go below 1', () => {
    const extreme = getEmployeeCostForScam('nigerian-prince-emails', 0, 0, 1.0);
    expect(extreme).toBeGreaterThanOrEqual(1);
  });
});
