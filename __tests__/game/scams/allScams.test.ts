// ABOUTME: Tests for the ALL_SCAMS barrel export and cross-tier properties
// ABOUTME: Validates completeness, uniqueness, and economic balance across all 50 scams

import {
  ALL_SCAMS,
  BOT_FARMS,
  TIER_1_SCAMS,
} from '../../../src/game/scams/definitions';
import { TIER_2_SCAMS } from '../../../src/game/scams/tier2';
import { TIER_3_SCAMS } from '../../../src/game/scams/tier3';
import { TIER_4_SCAMS } from '../../../src/game/scams/tier4';
import { TIER_5_SCAMS } from '../../../src/game/scams/tier5';

describe('ALL_SCAMS barrel export', () => {
  describe('total scam count', () => {
    it('should have exactly 50 scams (1 Bot Farms + 9 T1 + 10 T2 + 10 T3 + 10 T4 + 10 T5)', () => {
      expect(ALL_SCAMS).toHaveLength(50);
    });

    it('should match sum of all tier arrays', () => {
      const expectedTotal =
        1 + // Bot Farms (not in any tier array)
        TIER_1_SCAMS.length +
        TIER_2_SCAMS.length +
        TIER_3_SCAMS.length +
        TIER_4_SCAMS.length +
        TIER_5_SCAMS.length;

      expect(ALL_SCAMS).toHaveLength(expectedTotal);
    });
  });

  describe('uniqueness constraints', () => {
    it('should have unique IDs across all tiers', () => {
      const ids = ALL_SCAMS.map((scam) => scam.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ALL_SCAMS.length);
    });

    it('should have unique names across all tiers', () => {
      const names = ALL_SCAMS.map((scam) => scam.name);
      const uniqueNames = new Set(names);

      expect(uniqueNames.size).toBe(ALL_SCAMS.length);
    });
  });

  describe('tier array sizes', () => {
    it('TIER_1_SCAMS should have exactly 9 scams', () => {
      expect(TIER_1_SCAMS).toHaveLength(9);
    });

    it('TIER_2_SCAMS should have exactly 10 scams', () => {
      expect(TIER_2_SCAMS).toHaveLength(10);
    });

    it('TIER_3_SCAMS should have exactly 10 scams', () => {
      expect(TIER_3_SCAMS).toHaveLength(10);
    });

    it('TIER_4_SCAMS should have exactly 10 scams', () => {
      expect(TIER_4_SCAMS).toHaveLength(10);
    });

    it('TIER_5_SCAMS should have exactly 10 scams', () => {
      expect(TIER_5_SCAMS).toHaveLength(10);
    });
  });

  describe('tier assignments', () => {
    it('Bot Farms should be tier 1', () => {
      expect(BOT_FARMS.tier).toBe(1);
    });

    it('all Tier 1 scams should have tier = 1', () => {
      TIER_1_SCAMS.forEach((scam) => {
        expect(scam.tier).toBe(1);
      });
    });

    it('all Tier 2 scams should have tier = 2', () => {
      TIER_2_SCAMS.forEach((scam) => {
        expect(scam.tier).toBe(2);
      });
    });

    it('all Tier 3 scams should have tier = 3', () => {
      TIER_3_SCAMS.forEach((scam) => {
        expect(scam.tier).toBe(3);
      });
    });

    it('all Tier 4 scams should have tier = 4', () => {
      TIER_4_SCAMS.forEach((scam) => {
        expect(scam.tier).toBe(4);
      });
    });

    it('all Tier 5 scams should have tier = 5', () => {
      TIER_5_SCAMS.forEach((scam) => {
        expect(scam.tier).toBe(5);
      });
    });
  });

  describe('free scam unlock costs', () => {
    it('Bot Farms should be free (first scam)', () => {
      expect(BOT_FARMS.unlockCost).toBeUndefined();
    });

    it('first scam of Tier 1 should be free', () => {
      const firstScam = TIER_1_SCAMS[0];
      expect(firstScam.unlockCost).toBeUndefined();
    });

    it('first scam of Tier 2 should have unlockCost of $1,000', () => {
      const firstScam = TIER_2_SCAMS[0];
      expect(firstScam.unlockCost).toBe(1000);
    });

    it('first scam of Tier 3 should have unlockCost of $100,000', () => {
      const firstScam = TIER_3_SCAMS[0];
      expect(firstScam.unlockCost).toBe(100000);
    });

    it('first scam of Tier 4 should have unlockCost of $10,000,000', () => {
      const firstScam = TIER_4_SCAMS[0];
      expect(firstScam.unlockCost).toBe(10000000);
    });

    it('first scam of Tier 5 should have unlockCost of $1,000,000,000', () => {
      const firstScam = TIER_5_SCAMS[0];
      expect(firstScam.unlockCost).toBe(1000000000);
    });
  });

  describe('unlock cost progression', () => {
    it('Tier 1 paid scams should have ascending unlock costs', () => {
      const paidScams = TIER_1_SCAMS.slice(1); // Skip first free scam

      for (let i = 1; i < paidScams.length; i++) {
        const prevCost = paidScams[i - 1].unlockCost ?? 0;
        const currCost = paidScams[i].unlockCost ?? 0;

        expect(currCost).toBeGreaterThan(prevCost);
      }
    });

    it('Tier 2 paid scams should have ascending unlock costs', () => {
      const paidScams = TIER_2_SCAMS.slice(1);

      for (let i = 1; i < paidScams.length; i++) {
        const prevCost = paidScams[i - 1].unlockCost ?? 0;
        const currCost = paidScams[i].unlockCost ?? 0;

        expect(currCost).toBeGreaterThan(prevCost);
      }
    });

    it('Tier 3 paid scams should have ascending unlock costs', () => {
      const paidScams = TIER_3_SCAMS.slice(1);

      for (let i = 1; i < paidScams.length; i++) {
        const prevCost = paidScams[i - 1].unlockCost ?? 0;
        const currCost = paidScams[i].unlockCost ?? 0;

        expect(currCost).toBeGreaterThan(prevCost);
      }
    });

    it('Tier 4 paid scams should have ascending unlock costs', () => {
      const paidScams = TIER_4_SCAMS.slice(1);

      for (let i = 1; i < paidScams.length; i++) {
        const prevCost = paidScams[i - 1].unlockCost ?? 0;
        const currCost = paidScams[i].unlockCost ?? 0;

        expect(currCost).toBeGreaterThan(prevCost);
      }
    });

    it('Tier 5 paid scams should have ascending unlock costs', () => {
      const paidScams = TIER_5_SCAMS.slice(1);

      for (let i = 1; i < paidScams.length; i++) {
        const prevCost = paidScams[i - 1].unlockCost ?? 0;
        const currCost = paidScams[i].unlockCost ?? 0;

        expect(currCost).toBeGreaterThan(prevCost);
      }
    });
  });

  describe('Kongregate economy (unlockCost = baseReward)', () => {
    it('Tier 1 paid scams should follow unlockCost = baseReward', () => {
      const paidScams = TIER_1_SCAMS.filter((s) => s.unlockCost !== undefined);

      paidScams.forEach((scam) => {
        expect(scam.baseReward).toBe(scam.unlockCost);
      });
    });

    it('Tier 2 paid scams should follow unlockCost = baseReward', () => {
      const paidScams = TIER_2_SCAMS.filter((s) => s.unlockCost !== undefined);

      paidScams.forEach((scam) => {
        expect(scam.baseReward).toBe(scam.unlockCost);
      });
    });

    it('Tier 3 paid scams should follow unlockCost = baseReward', () => {
      const paidScams = TIER_3_SCAMS.filter((s) => s.unlockCost !== undefined);

      paidScams.forEach((scam) => {
        expect(scam.baseReward).toBe(scam.unlockCost);
      });
    });

    it('Tier 4 paid scams should follow unlockCost = baseReward', () => {
      const paidScams = TIER_4_SCAMS.filter((s) => s.unlockCost !== undefined);

      paidScams.forEach((scam) => {
        expect(scam.baseReward).toBe(scam.unlockCost);
      });
    });

    it('Tier 5 paid scams should follow unlockCost = baseReward', () => {
      const paidScams = TIER_5_SCAMS.filter((s) => s.unlockCost !== undefined);

      paidScams.forEach((scam) => {
        expect(scam.baseReward).toBe(scam.unlockCost);
      });
    });
  });

  describe('duration progression', () => {
    it('all Tier 1 scams should have duration between 5s and 180s', () => {
      TIER_1_SCAMS.forEach((scam) => {
        expect(scam.baseDuration).toBeGreaterThanOrEqual(5000);
        expect(scam.baseDuration).toBeLessThanOrEqual(180000);
      });
    });

    it('all Tier 2 scams should have duration between 5s and 180s', () => {
      TIER_2_SCAMS.forEach((scam) => {
        expect(scam.baseDuration).toBeGreaterThanOrEqual(5000);
        expect(scam.baseDuration).toBeLessThanOrEqual(180000);
      });
    });

    it('all Tier 3 scams should have duration between 5s and 180s', () => {
      TIER_3_SCAMS.forEach((scam) => {
        expect(scam.baseDuration).toBeGreaterThanOrEqual(5000);
        expect(scam.baseDuration).toBeLessThanOrEqual(180000);
      });
    });

    it('all Tier 4 scams should have duration between 5s and 180s', () => {
      TIER_4_SCAMS.forEach((scam) => {
        expect(scam.baseDuration).toBeGreaterThanOrEqual(5000);
        expect(scam.baseDuration).toBeLessThanOrEqual(180000);
      });
    });

    it('all Tier 5 scams should have duration between 5s and 180s', () => {
      TIER_5_SCAMS.forEach((scam) => {
        expect(scam.baseDuration).toBeGreaterThanOrEqual(5000);
        expect(scam.baseDuration).toBeLessThanOrEqual(180000);
      });
    });
  });

  describe('resource types', () => {
    it('Bot Farms should generate bots', () => {
      expect(BOT_FARMS.resourceType).toBe('bots');
    });

    it('all Tier 1 scams should generate money', () => {
      TIER_1_SCAMS.forEach((scam) => {
        expect(scam.resourceType).toBe('money');
      });
    });

    it('all Tier 2 scams should generate money', () => {
      TIER_2_SCAMS.forEach((scam) => {
        expect(scam.resourceType).toBe('money');
      });
    });

    it('all Tier 3 scams should generate money', () => {
      TIER_3_SCAMS.forEach((scam) => {
        expect(scam.resourceType).toBe('money');
      });
    });

    it('all Tier 4 scams should generate money', () => {
      TIER_4_SCAMS.forEach((scam) => {
        expect(scam.resourceType).toBe('money');
      });
    });

    it('all Tier 5 scams should generate money', () => {
      TIER_5_SCAMS.forEach((scam) => {
        expect(scam.resourceType).toBe('money');
      });
    });

    it('only Bot Farms should generate bots', () => {
      const botGenerators = ALL_SCAMS.filter((s) => s.resourceType === 'bots');
      expect(botGenerators).toHaveLength(1);
      expect(botGenerators[0].id).toBe(BOT_FARMS.id);
    });
  });

  describe('free scam base rewards (tier baseCost)', () => {
    it('Tier 1 free scam should have $10 base reward', () => {
      const freeScam = TIER_1_SCAMS[0];
      expect(freeScam.baseReward).toBe(10);
    });

    it('Tier 2 free scam should have $1K base reward', () => {
      const freeScam = TIER_2_SCAMS[0];
      expect(freeScam.baseReward).toBe(1000);
    });

    it('Tier 3 free scam should have $100K base reward', () => {
      const freeScam = TIER_3_SCAMS[0];
      expect(freeScam.baseReward).toBe(100000);
    });

    it('Tier 4 free scam should have $10M base reward', () => {
      const freeScam = TIER_4_SCAMS[0];
      expect(freeScam.baseReward).toBe(10000000);
    });

    it('Tier 5 free scam should have $1B base reward', () => {
      const freeScam = TIER_5_SCAMS[0];
      expect(freeScam.baseReward).toBe(1000000000);
    });

    it('free scam base rewards should scale 100x between tiers', () => {
      const freeScams = [
        TIER_1_SCAMS[0],
        TIER_2_SCAMS[0],
        TIER_3_SCAMS[0],
        TIER_4_SCAMS[0],
        TIER_5_SCAMS[0],
      ];

      for (let i = 1; i < freeScams.length; i++) {
        const prevReward = freeScams[i - 1].baseReward;
        const currReward = freeScams[i].baseReward;

        // Current tier should be 100x previous tier
        expect(currReward).toBe(prevReward * 100);
      }
    });
  });
});
