// ABOUTME: Tests for prestige system TypeScript types
// ABOUTME: Validates type structure for prestige choice, result, and bonus interfaces

import type {
  PrestigeChoice,
  PrestigeResult,
  PrestigeBonus,
  PrestigeBonusType,
} from '../../../src/game/prestige/types';

describe('Prestige Types', () => {
  describe('PrestigeChoice', () => {
    it('should allow clean-escape type with trust gain', () => {
      const cleanEscape: PrestigeChoice = {
        type: 'clean-escape',
        trustGain: 10,
        trustPenalty: 0,
        bonusKept: 0,
      };

      expect(cleanEscape.type).toBe('clean-escape');
      expect(cleanEscape.trustGain).toBe(10);
      expect(cleanEscape.trustPenalty).toBe(0);
      expect(cleanEscape.bonusKept).toBe(0);
    });

    it('should allow snitch type with trust penalty and bonus kept', () => {
      const snitch: PrestigeChoice = {
        type: 'snitch',
        trustGain: 0,
        trustPenalty: -5,
        bonusKept: 0.1,
      };

      expect(snitch.type).toBe('snitch');
      expect(snitch.trustGain).toBe(0);
      expect(snitch.trustPenalty).toBe(-5);
      expect(snitch.bonusKept).toBe(0.1);
    });
  });

  describe('PrestigeResult', () => {
    it('should track clean escape result with trust increase', () => {
      const result: PrestigeResult = {
        choice: 'clean-escape',
        previousTrust: 50,
        newTrust: 60,
      };

      expect(result.choice).toBe('clean-escape');
      expect(result.previousTrust).toBe(50);
      expect(result.newTrust).toBe(60);
      expect(result.bonuses).toBeUndefined();
    });

    it('should track snitch result with bonuses kept', () => {
      const bonus: PrestigeBonus = {
        type: 'money',
        amount: 1000,
      };

      const result: PrestigeResult = {
        choice: 'snitch',
        previousTrust: 50,
        newTrust: 45,
        bonuses: [bonus],
      };

      expect(result.choice).toBe('snitch');
      expect(result.previousTrust).toBe(50);
      expect(result.newTrust).toBe(45);
      expect(result.bonuses).toHaveLength(1);
      expect(result.bonuses![0].type).toBe('money');
      expect(result.bonuses![0].amount).toBe(1000);
    });
  });

  describe('PrestigeBonus', () => {
    it('should support money bonus type', () => {
      const bonus: PrestigeBonus = {
        type: 'money',
        amount: 5000,
      };

      expect(bonus.type).toBe('money');
      expect(bonus.amount).toBe(5000);
    });

    it('should support bots bonus type', () => {
      const bonus: PrestigeBonus = {
        type: 'bots',
        amount: 100,
      };

      expect(bonus.type).toBe('bots');
      expect(bonus.amount).toBe(100);
    });

    it('should support reputation bonus type', () => {
      const bonus: PrestigeBonus = {
        type: 'reputation',
        amount: 25,
      };

      expect(bonus.type).toBe('reputation');
      expect(bonus.amount).toBe(25);
    });

    it('should support crypto bonus type', () => {
      const bonus: PrestigeBonus = {
        type: 'crypto',
        amount: 1.5,
      };

      expect(bonus.type).toBe('crypto');
      expect(bonus.amount).toBe(1.5);
    });

    it('should support skill-points bonus type', () => {
      const bonus: PrestigeBonus = {
        type: 'skill-points',
        amount: 10,
      };

      expect(bonus.type).toBe('skill-points');
      expect(bonus.amount).toBe(10);
    });
  });

  describe('PrestigeBonusType', () => {
    it('should be a valid resource type union', () => {
      const validTypes: PrestigeBonusType[] = [
        'money',
        'bots',
        'reputation',
        'crypto',
        'skill-points',
      ];

      expect(validTypes).toContain('money');
      expect(validTypes).toContain('bots');
      expect(validTypes).toContain('reputation');
      expect(validTypes).toContain('crypto');
      expect(validTypes).toContain('skill-points');
    });
  });
});
