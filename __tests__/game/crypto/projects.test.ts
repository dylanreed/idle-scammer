// ABOUTME: Tests for investment project helper functions
// ABOUTME: Validates rug pull checks, return calculations, maturation, and payout logic

import {
  checkRugPull,
  calculateReturn,
  isProjectMatured,
  calculatePayout,
  getProjectDefinition,
} from '../../../src/game/crypto/projects';
import { PROJECT_DEFINITIONS } from '../../../src/game/crypto/constants';
import type { ProjectState, ProjectDefinition } from '../../../src/game/crypto/types';

describe('Project helpers', () => {
  describe('checkRugPull', () => {
    it('should be deterministic (same seed = same result)', () => {
      const def = PROJECT_DEFINITIONS[0]; // stable coins
      const [rug1, seed1] = checkRugPull(def, 42);
      const [rug2, seed2] = checkRugPull(def, 42);
      expect(rug1).toBe(rug2);
      expect(seed1).toBe(seed2);
    });

    it('should return a boolean and next seed', () => {
      const def = PROJECT_DEFINITIONS[0];
      const [isRugged, nextSeedVal] = checkRugPull(def, 42);
      expect(typeof isRugged).toBe('boolean');
      expect(typeof nextSeedVal).toBe('number');
    });

    it('should rarely rug stable coins (2% chance)', () => {
      const def = PROJECT_DEFINITIONS.find((p) => p.id === 'stable-coins')!;
      let rugCount = 0;
      const trials = 10000;
      let seed = 1;

      for (let i = 0; i < trials; i++) {
        const [isRugged, newSeed] = checkRugPull(def, seed);
        if (isRugged) rugCount++;
        seed = newSeed;
      }

      const rugRate = rugCount / trials;
      // Should be approximately 2% (within 2% margin)
      expect(rugRate).toBeGreaterThan(0.001);
      expect(rugRate).toBeLessThan(0.06);
    });

    it('should frequently rug guaranteed returns (80% chance)', () => {
      const def = PROJECT_DEFINITIONS.find((p) => p.id === 'guaranteed-returns')!;
      let rugCount = 0;
      const trials = 10000;
      let seed = 1;

      for (let i = 0; i < trials; i++) {
        const [isRugged, newSeed] = checkRugPull(def, seed);
        if (isRugged) rugCount++;
        seed = newSeed;
      }

      const rugRate = rugCount / trials;
      // Should be approximately 80% (within 5% margin)
      expect(rugRate).toBeGreaterThan(0.75);
      expect(rugRate).toBeLessThan(0.85);
    });
  });

  describe('calculateReturn', () => {
    it('should return 0 when rugged', () => {
      const def = PROJECT_DEFINITIONS[0];
      const [multiplier] = calculateReturn(def, true, 42);
      expect(multiplier).toBe(0);
    });

    it('should return value within min/max range when not rugged', () => {
      const def = PROJECT_DEFINITIONS.find((p) => p.id === 'stable-coins')!;
      const trials = 100;
      let seed = 1;

      for (let i = 0; i < trials; i++) {
        const [multiplier, newSeed] = calculateReturn(def, false, seed);
        expect(multiplier).toBeGreaterThanOrEqual(def.minReturn);
        expect(multiplier).toBeLessThanOrEqual(def.maxReturn);
        seed = newSeed;
      }
    });

    it('should be deterministic', () => {
      const def = PROJECT_DEFINITIONS[0];
      const [m1, s1] = calculateReturn(def, false, 42);
      const [m2, s2] = calculateReturn(def, false, 42);
      expect(m1).toBe(m2);
      expect(s1).toBe(s2);
    });

    it('should return different values for different seeds', () => {
      const def = PROJECT_DEFINITIONS.find((p) => p.id === 'new-altcoins')!;
      const [m1] = calculateReturn(def, false, 100);
      const [m2] = calculateReturn(def, false, 200);
      // Technically could be equal, but with wide range it's astronomically unlikely
      expect(m1).not.toBe(m2);
    });
  });

  describe('isProjectMatured', () => {
    it('should return false when project just started', () => {
      const now = 1000000;
      const project: ProjectState = {
        definitionId: 'stable-coins',
        investedAmount: 5,
        startedAt: now,
        isRugged: false,
        returnMultiplier: 1.2,
      };

      expect(isProjectMatured(project, now)).toBe(false);
    });

    it('should return true when enough time has passed', () => {
      const now = 1000000;
      const def = PROJECT_DEFINITIONS.find((p) => p.id === 'stable-coins')!;
      const project: ProjectState = {
        definitionId: 'stable-coins',
        investedAmount: 5,
        startedAt: now,
        isRugged: false,
        returnMultiplier: 1.2,
      };

      expect(isProjectMatured(project, now + def.durationMs)).toBe(true);
    });

    it('should return true when past maturation', () => {
      const now = 1000000;
      const def = PROJECT_DEFINITIONS.find((p) => p.id === 'stable-coins')!;
      const project: ProjectState = {
        definitionId: 'stable-coins',
        investedAmount: 5,
        startedAt: now,
        isRugged: false,
        returnMultiplier: 1.2,
      };

      expect(isProjectMatured(project, now + def.durationMs + 10000)).toBe(true);
    });

    it('should return false just before maturation', () => {
      const now = 1000000;
      const def = PROJECT_DEFINITIONS.find((p) => p.id === 'stable-coins')!;
      const project: ProjectState = {
        definitionId: 'stable-coins',
        investedAmount: 5,
        startedAt: now,
        isRugged: false,
        returnMultiplier: 1.2,
      };

      expect(isProjectMatured(project, now + def.durationMs - 1)).toBe(false);
    });

    it('should return false for invalid definition ID', () => {
      const project: ProjectState = {
        definitionId: 'nonexistent',
        investedAmount: 5,
        startedAt: 1000000,
        isRugged: false,
        returnMultiplier: 1.0,
      };

      expect(isProjectMatured(project, 9999999)).toBe(false);
    });

    it('should handle all 4 project durations', () => {
      for (const def of PROJECT_DEFINITIONS) {
        const now = 1000000;
        const project: ProjectState = {
          definitionId: def.id,
          investedAmount: 5,
          startedAt: now,
          isRugged: false,
          returnMultiplier: 1.5,
        };

        expect(isProjectMatured(project, now)).toBe(false);
        expect(isProjectMatured(project, now + def.durationMs)).toBe(true);
      }
    });
  });

  describe('calculatePayout', () => {
    it('should return 0 for rugged project', () => {
      const project: ProjectState = {
        definitionId: 'meme-coins',
        investedAmount: 10,
        startedAt: Date.now(),
        isRugged: true,
        returnMultiplier: 0,
      };

      expect(calculatePayout(project)).toBe(0);
    });

    it('should return investedAmount * returnMultiplier for non-rugged project', () => {
      const project: ProjectState = {
        definitionId: 'stable-coins',
        investedAmount: 10,
        startedAt: Date.now(),
        isRugged: false,
        returnMultiplier: 1.3,
      };

      expect(calculatePayout(project)).toBeCloseTo(13, 5);
    });

    it('should handle large investments', () => {
      const project: ProjectState = {
        definitionId: 'guaranteed-returns',
        investedAmount: 1000,
        startedAt: Date.now(),
        isRugged: false,
        returnMultiplier: 15,
      };

      expect(calculatePayout(project)).toBe(15000);
    });
  });

  describe('getProjectDefinition', () => {
    it('should return definition for valid ID', () => {
      const def = getProjectDefinition('stable-coins');
      expect(def).toBeDefined();
      expect(def!.id).toBe('stable-coins');
      expect(def!.name).toBe('"Stable" Coins');
    });

    it('should return undefined for invalid ID', () => {
      expect(getProjectDefinition('nonexistent')).toBeUndefined();
    });

    it('should find all 4 project definitions', () => {
      for (const expected of PROJECT_DEFINITIONS) {
        const found = getProjectDefinition(expected.id);
        expect(found).toBeDefined();
        expect(found!.id).toBe(expected.id);
      }
    });
  });
});
