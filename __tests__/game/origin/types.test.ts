// ABOUTME: Tests for origin type definitions and constants
// ABOUTME: Validates origin definitions, bonus values, and default/fallback objects

import { ORIGINS, NO_ORIGIN_BONUSES } from '../../../src/game/origin/constants';
import type { OriginId, OriginDefinition, OriginBonuses } from '../../../src/game/origin/types';
import { DEFAULT_ORIGIN_SAVE_DATA } from '../../../src/game/origin/types';

describe('Origin types and constants', () => {
  describe('ORIGINS definitions', () => {
    it('should define exactly 3 origins', () => {
      expect(Object.keys(ORIGINS)).toHaveLength(3);
    });

    it('should have moms-basement origin', () => {
      const origin = ORIGINS['moms-basement'];
      expect(origin).toBeDefined();
      expect(origin.id).toBe('moms-basement');
      expect(origin.name).toBe("Mom's Basement");
      expect(origin.description).toBeTruthy();
      expect(origin.bonusDescription).toBeTruthy();
    });

    it('should have internet-cafe origin', () => {
      const origin = ORIGINS['internet-cafe'];
      expect(origin).toBeDefined();
      expect(origin.id).toBe('internet-cafe');
      expect(origin.name).toBe('Internet Cafe');
      expect(origin.description).toBeTruthy();
      expect(origin.bonusDescription).toBeTruthy();
    });

    it('should have stolen-phone origin', () => {
      const origin = ORIGINS['stolen-phone'];
      expect(origin).toBeDefined();
      expect(origin.id).toBe('stolen-phone');
      expect(origin.name).toBe('Stolen Phone');
      expect(origin.description).toBeTruthy();
      expect(origin.bonusDescription).toBeTruthy();
    });

    it('should have all required fields on each origin', () => {
      for (const origin of Object.values(ORIGINS)) {
        expect(origin.id).toBeTruthy();
        expect(origin.name).toBeTruthy();
        expect(origin.description).toBeTruthy();
        expect(origin.bonusDescription).toBeTruthy();
        expect(origin.bonuses).toBeDefined();
      }
    });
  });

  describe('Origin bonus values', () => {
    it('moms-basement should give 10% duration reduction', () => {
      const bonuses = ORIGINS['moms-basement'].bonuses;
      expect(bonuses.durationReduction).toBe(0.10);
      expect(bonuses.heatGainReduction).toBe(0);
      expect(bonuses.rewardBonus).toBe(0);
    });

    it('internet-cafe should give 10% heat gain reduction', () => {
      const bonuses = ORIGINS['internet-cafe'].bonuses;
      expect(bonuses.durationReduction).toBe(0);
      expect(bonuses.heatGainReduction).toBe(0.10);
      expect(bonuses.rewardBonus).toBe(0);
    });

    it('stolen-phone should give 10% reward bonus', () => {
      const bonuses = ORIGINS['stolen-phone'].bonuses;
      expect(bonuses.durationReduction).toBe(0);
      expect(bonuses.heatGainReduction).toBe(0);
      expect(bonuses.rewardBonus).toBe(0.10);
    });
  });

  describe('NO_ORIGIN_BONUSES', () => {
    it('should have all zeros', () => {
      expect(NO_ORIGIN_BONUSES.durationReduction).toBe(0);
      expect(NO_ORIGIN_BONUSES.heatGainReduction).toBe(0);
      expect(NO_ORIGIN_BONUSES.rewardBonus).toBe(0);
    });
  });

  describe('DEFAULT_ORIGIN_SAVE_DATA', () => {
    it('should default to null origin', () => {
      expect(DEFAULT_ORIGIN_SAVE_DATA.selectedOrigin).toBeNull();
    });
  });
});
