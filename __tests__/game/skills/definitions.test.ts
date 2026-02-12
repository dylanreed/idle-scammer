// ABOUTME: Tests for passive skill and active ability definitions
// ABOUTME: Validates structure, completeness, and constraints of all skill/ability data

import {
  TECH_SKILLS,
  SOCIAL_SKILLS,
  FINANCE_SKILLS,
  STEALTH_SKILLS,
  ALL_PASSIVE_SKILLS,
  SKILLS_BY_CATEGORY,
  CATEGORY_NAMES,
  CATEGORY_DESCRIPTIONS,
} from '../../../src/game/skills/definitions';
import { ALL_ACTIVE_ABILITIES, TOTAL_ABILITY_COST } from '../../../src/game/skills/abilities';
import type { PassiveSkillDefinition, SkillCategory } from '../../../src/game/skills/types';

describe('Passive Skill Definitions', () => {
  it('should have exactly 12 passive skills total', () => {
    expect(ALL_PASSIVE_SKILLS).toHaveLength(12);
  });

  it('should have 3 skills per category', () => {
    expect(TECH_SKILLS).toHaveLength(3);
    expect(SOCIAL_SKILLS).toHaveLength(3);
    expect(FINANCE_SKILLS).toHaveLength(3);
    expect(STEALTH_SKILLS).toHaveLength(3);
  });

  it('should have unique IDs across all skills', () => {
    const ids = ALL_PASSIVE_SKILLS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have correct category assignments', () => {
    for (const skill of TECH_SKILLS) {
      expect(skill.category).toBe('tech');
    }
    for (const skill of SOCIAL_SKILLS) {
      expect(skill.category).toBe('social');
    }
    for (const skill of FINANCE_SKILLS) {
      expect(skill.category).toBe('finance');
    }
    for (const skill of STEALTH_SKILLS) {
      expect(skill.category).toBe('stealth');
    }
  });

  it('should have exactly 5 ranks per skill', () => {
    for (const skill of ALL_PASSIVE_SKILLS) {
      expect(skill.ranks).toHaveLength(5);
      expect(skill.maxRank).toBe(5);
    }
  });

  it('should have ascending rank values for each skill', () => {
    for (const skill of ALL_PASSIVE_SKILLS) {
      for (let i = 1; i < skill.ranks.length; i++) {
        expect(skill.ranks[i]).toBeGreaterThan(skill.ranks[i - 1]);
      }
    }
  });

  it('should have positive values for all ranks', () => {
    for (const skill of ALL_PASSIVE_SKILLS) {
      for (const value of skill.ranks) {
        expect(value).toBeGreaterThan(0);
      }
    }
  });

  describe('SKILLS_BY_CATEGORY', () => {
    it('should contain all 4 categories', () => {
      const categories: SkillCategory[] = ['tech', 'social', 'finance', 'stealth'];
      for (const cat of categories) {
        expect(SKILLS_BY_CATEGORY[cat]).toBeDefined();
        expect(SKILLS_BY_CATEGORY[cat]).toHaveLength(3);
      }
    });

    it('should reference the same skill objects as individual arrays', () => {
      expect(SKILLS_BY_CATEGORY.tech).toBe(TECH_SKILLS);
      expect(SKILLS_BY_CATEGORY.social).toBe(SOCIAL_SKILLS);
      expect(SKILLS_BY_CATEGORY.finance).toBe(FINANCE_SKILLS);
      expect(SKILLS_BY_CATEGORY.stealth).toBe(STEALTH_SKILLS);
    });
  });

  describe('CATEGORY_NAMES', () => {
    it('should have display names for all categories', () => {
      expect(CATEGORY_NAMES.tech).toBe('TECH');
      expect(CATEGORY_NAMES.social).toBe('SOCIAL');
      expect(CATEGORY_NAMES.finance).toBe('FINANCE');
      expect(CATEGORY_NAMES.stealth).toBe('STEALTH');
    });
  });

  describe('CATEGORY_DESCRIPTIONS', () => {
    it('should have descriptions for all categories', () => {
      expect(CATEGORY_DESCRIPTIONS.tech).toBeDefined();
      expect(CATEGORY_DESCRIPTIONS.social).toBeDefined();
      expect(CATEGORY_DESCRIPTIONS.finance).toBeDefined();
      expect(CATEGORY_DESCRIPTIONS.stealth).toBeDefined();
    });
  });

  describe('specific skill values', () => {
    it('should have correct Overclock values', () => {
      const overclock = ALL_PASSIVE_SKILLS.find((s) => s.id === 'overclock')!;
      expect(overclock.ranks).toEqual([0.05, 0.10, 0.16, 0.22, 0.30]);
    });

    it('should have correct Compound Interest values (absolute $)', () => {
      const compoundInterest = ALL_PASSIVE_SKILLS.find((s) => s.id === 'compound-interest')!;
      expect(compoundInterest.ranks).toEqual([1, 5, 15, 50, 150]);
    });

    it('should have correct Ghost Protocol values (flat bonus)', () => {
      const ghostProtocol = ALL_PASSIVE_SKILLS.find((s) => s.id === 'ghost-protocol')!;
      expect(ghostProtocol.ranks).toEqual([5, 12, 20, 30, 50]);
    });
  });
});

describe('Active Ability Definitions', () => {
  it('should have exactly 6 active abilities', () => {
    expect(ALL_ACTIVE_ABILITIES).toHaveLength(6);
  });

  it('should have unique IDs', () => {
    const ids = ALL_ACTIVE_ABILITIES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have positive costs', () => {
    for (const ability of ALL_ACTIVE_ABILITIES) {
      expect(ability.cost).toBeGreaterThan(0);
    }
  });

  it('should have positive cooldowns', () => {
    for (const ability of ALL_ACTIVE_ABILITIES) {
      expect(ability.cooldownMs).toBeGreaterThan(0);
    }
  });

  it('should have non-negative durations', () => {
    for (const ability of ALL_ACTIVE_ABILITIES) {
      expect(ability.durationMs).toBeGreaterThanOrEqual(0);
    }
  });

  it('should have total ability cost of 34 SP', () => {
    expect(TOTAL_ABILITY_COST).toBe(34);
  });

  describe('specific ability values', () => {
    it('should have correct Charm Offensive stats', () => {
      const charm = ALL_ACTIVE_ABILITIES.find((a) => a.id === 'charm-offensive')!;
      expect(charm.cost).toBe(3);
      expect(charm.durationMs).toBe(60_000);
      expect(charm.cooldownMs).toBe(300_000);
      expect(charm.effectValue).toBe(2);
    });

    it('should have instant abilities with 0 duration', () => {
      const ddos = ALL_ACTIVE_ABILITIES.find((a) => a.id === 'ddos-burst')!;
      const burner = ALL_ACTIVE_ABILITIES.find((a) => a.id === 'burner-phone-ability')!;
      expect(ddos.durationMs).toBe(0);
      expect(burner.durationMs).toBe(0);
    });

    it('should have correct Zero Day stats', () => {
      const zeroDay = ALL_ACTIVE_ABILITIES.find((a) => a.id === 'zero-day')!;
      expect(zeroDay.cost).toBe(10);
      expect(zeroDay.durationMs).toBe(30_000);
      expect(zeroDay.cooldownMs).toBe(300_000);
      expect(zeroDay.effectValue).toBe(3);
    });
  });
});
