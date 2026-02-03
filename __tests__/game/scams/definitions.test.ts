// ABOUTME: Tests for scam definitions including all Tier 1 scams
// ABOUTME: Validates all scams are correctly configured with proper types and values

import {
  BOT_FARMS,
  NIGERIAN_PRINCE_EMAILS,
  FAKE_LOTTERY_WINNINGS,
  IPHONE_POPUP,
  PHISHING_LINKS,
  SURVEY_SCAMS,
  FAKE_ANTIVIRUS_POPUPS,
  GIFT_CARD_SCAMS,
  ADVANCE_FEE_FRAUD,
  FAKE_JOB_POSTINGS,
  TIER_1_SCAMS,
} from '../../../src/game/scams/definitions';
import type { ScamDefinition } from '../../../src/game/scams/types';

describe('Scam Definitions', () => {
  describe('BOT_FARMS', () => {
    it('should be a valid ScamDefinition', () => {
      const definition: ScamDefinition = BOT_FARMS;

      expect(definition).toBeDefined();
      expect(typeof definition.id).toBe('string');
      expect(typeof definition.name).toBe('string');
      expect(typeof definition.tier).toBe('number');
      expect(typeof definition.baseDuration).toBe('number');
      expect(typeof definition.baseReward).toBe('number');
      expect(typeof definition.resourceType).toBe('string');
      expect(typeof definition.description).toBe('string');
    });

    it('should have correct id', () => {
      expect(BOT_FARMS.id).toBe('bot-farms');
    });

    it('should have correct display name', () => {
      expect(BOT_FARMS.name).toBe('Bot Farms');
    });

    it('should be tier 1 (first scam in the game)', () => {
      expect(BOT_FARMS.tier).toBe(1);
    });

    it('should have 1 second base duration (fast for early game feel-good)', () => {
      expect(BOT_FARMS.baseDuration).toBe(1000);
    });

    it('should reward 0.5 bots per completion (accumulates fractionally)', () => {
      expect(BOT_FARMS.baseReward).toBe(0.5);
    });

    it('should produce bots (NOT money - this is special)', () => {
      expect(BOT_FARMS.resourceType).toBe('bots');
    });

    it('should have a thematic description', () => {
      expect(BOT_FARMS.description).toBeTruthy();
      expect(BOT_FARMS.description.length).toBeGreaterThan(0);
    });

    it('should be free to unlock (first scam, no unlock cost)', () => {
      expect(BOT_FARMS.unlockCost).toBeUndefined();
    });

    it('should be the foundational scam that other scams depend on', () => {
      // Bot Farms is special - it generates bots, not money
      // Bots are spent to upgrade other scams
      // This verifies the scam is set up for this purpose
      expect(BOT_FARMS.resourceType).toBe('bots');
      expect(BOT_FARMS.tier).toBe(1);
      expect(BOT_FARMS.unlockCost).toBeUndefined();
    });
  });

  describe('NIGERIAN_PRINCE_EMAILS', () => {
    it('should be a valid ScamDefinition', () => {
      const definition: ScamDefinition = NIGERIAN_PRINCE_EMAILS;
      expect(definition).toBeDefined();
      expect(typeof definition.id).toBe('string');
      expect(typeof definition.name).toBe('string');
      expect(typeof definition.tier).toBe('number');
      expect(typeof definition.baseDuration).toBe('number');
      expect(typeof definition.baseReward).toBe('number');
      expect(typeof definition.resourceType).toBe('string');
      expect(typeof definition.description).toBe('string');
    });

    it('should have correct id', () => {
      expect(NIGERIAN_PRINCE_EMAILS.id).toBe('nigerian-prince-emails');
    });

    it('should be tier 1', () => {
      expect(NIGERIAN_PRINCE_EMAILS.tier).toBe(1);
    });

    it('should produce money (not bots)', () => {
      expect(NIGERIAN_PRINCE_EMAILS.resourceType).toBe('money');
    });

    it('should be free to unlock (first money scam)', () => {
      expect(NIGERIAN_PRINCE_EMAILS.unlockCost).toBeUndefined();
    });
  });

  describe('FAKE_LOTTERY_WINNINGS', () => {
    it('should be a valid ScamDefinition', () => {
      const definition: ScamDefinition = FAKE_LOTTERY_WINNINGS;
      expect(definition).toBeDefined();
      expect(typeof definition.id).toBe('string');
    });

    it('should have correct id', () => {
      expect(FAKE_LOTTERY_WINNINGS.id).toBe('fake-lottery-winnings');
    });

    it('should be tier 1 and produce money', () => {
      expect(FAKE_LOTTERY_WINNINGS.tier).toBe(1);
      expect(FAKE_LOTTERY_WINNINGS.resourceType).toBe('money');
    });

    it('should have an unlock cost', () => {
      expect(FAKE_LOTTERY_WINNINGS.unlockCost).toBeDefined();
    });
  });

  describe('IPHONE_POPUP', () => {
    it('should be a valid ScamDefinition', () => {
      const definition: ScamDefinition = IPHONE_POPUP;
      expect(definition).toBeDefined();
    });

    it('should have correct id', () => {
      expect(IPHONE_POPUP.id).toBe('iphone-popup');
    });

    it('should be tier 1 and produce money', () => {
      expect(IPHONE_POPUP.tier).toBe(1);
      expect(IPHONE_POPUP.resourceType).toBe('money');
    });

    it('should have an unlock cost', () => {
      expect(IPHONE_POPUP.unlockCost).toBeDefined();
    });
  });

  describe('PHISHING_LINKS', () => {
    it('should be a valid ScamDefinition', () => {
      const definition: ScamDefinition = PHISHING_LINKS;
      expect(definition).toBeDefined();
    });

    it('should have correct id', () => {
      expect(PHISHING_LINKS.id).toBe('phishing-links');
    });

    it('should be tier 1 and produce money', () => {
      expect(PHISHING_LINKS.tier).toBe(1);
      expect(PHISHING_LINKS.resourceType).toBe('money');
    });

    it('should have an unlock cost', () => {
      expect(PHISHING_LINKS.unlockCost).toBeDefined();
    });
  });

  describe('SURVEY_SCAMS', () => {
    it('should be a valid ScamDefinition', () => {
      const definition: ScamDefinition = SURVEY_SCAMS;
      expect(definition).toBeDefined();
    });

    it('should have correct id', () => {
      expect(SURVEY_SCAMS.id).toBe('survey-scams');
    });

    it('should be tier 1 and produce money', () => {
      expect(SURVEY_SCAMS.tier).toBe(1);
      expect(SURVEY_SCAMS.resourceType).toBe('money');
    });

    it('should have an unlock cost', () => {
      expect(SURVEY_SCAMS.unlockCost).toBeDefined();
    });
  });

  describe('FAKE_ANTIVIRUS_POPUPS', () => {
    it('should be a valid ScamDefinition', () => {
      const definition: ScamDefinition = FAKE_ANTIVIRUS_POPUPS;
      expect(definition).toBeDefined();
    });

    it('should have correct id', () => {
      expect(FAKE_ANTIVIRUS_POPUPS.id).toBe('fake-antivirus-popups');
    });

    it('should be tier 1 and produce money', () => {
      expect(FAKE_ANTIVIRUS_POPUPS.tier).toBe(1);
      expect(FAKE_ANTIVIRUS_POPUPS.resourceType).toBe('money');
    });

    it('should have an unlock cost', () => {
      expect(FAKE_ANTIVIRUS_POPUPS.unlockCost).toBeDefined();
    });
  });

  describe('GIFT_CARD_SCAMS', () => {
    it('should be a valid ScamDefinition', () => {
      const definition: ScamDefinition = GIFT_CARD_SCAMS;
      expect(definition).toBeDefined();
    });

    it('should have correct id', () => {
      expect(GIFT_CARD_SCAMS.id).toBe('gift-card-scams');
    });

    it('should be tier 1 and produce money', () => {
      expect(GIFT_CARD_SCAMS.tier).toBe(1);
      expect(GIFT_CARD_SCAMS.resourceType).toBe('money');
    });

    it('should have an unlock cost', () => {
      expect(GIFT_CARD_SCAMS.unlockCost).toBeDefined();
    });
  });

  describe('ADVANCE_FEE_FRAUD', () => {
    it('should be a valid ScamDefinition', () => {
      const definition: ScamDefinition = ADVANCE_FEE_FRAUD;
      expect(definition).toBeDefined();
    });

    it('should have correct id', () => {
      expect(ADVANCE_FEE_FRAUD.id).toBe('advance-fee-fraud');
    });

    it('should be tier 1 and produce money', () => {
      expect(ADVANCE_FEE_FRAUD.tier).toBe(1);
      expect(ADVANCE_FEE_FRAUD.resourceType).toBe('money');
    });

    it('should have an unlock cost', () => {
      expect(ADVANCE_FEE_FRAUD.unlockCost).toBeDefined();
    });
  });

  describe('FAKE_JOB_POSTINGS', () => {
    it('should be a valid ScamDefinition', () => {
      const definition: ScamDefinition = FAKE_JOB_POSTINGS;
      expect(definition).toBeDefined();
    });

    it('should have correct id', () => {
      expect(FAKE_JOB_POSTINGS.id).toBe('fake-job-postings');
    });

    it('should be tier 1 and produce money', () => {
      expect(FAKE_JOB_POSTINGS.tier).toBe(1);
      expect(FAKE_JOB_POSTINGS.resourceType).toBe('money');
    });

    it('should have an unlock cost', () => {
      expect(FAKE_JOB_POSTINGS.unlockCost).toBeDefined();
    });
  });

  describe('TIER_1_SCAMS array', () => {
    it('should contain exactly 9 money-generating scams (Bot Farms is separate)', () => {
      expect(TIER_1_SCAMS).toHaveLength(9);
    });

    it('should contain all Tier 1 scam definitions (excluding Bot Farms)', () => {
      // Bot Farms is NOT in TIER_1_SCAMS - it's a separate mechanic
      expect(TIER_1_SCAMS).not.toContain(BOT_FARMS);
      expect(TIER_1_SCAMS).toContain(NIGERIAN_PRINCE_EMAILS);
      expect(TIER_1_SCAMS).toContain(FAKE_LOTTERY_WINNINGS);
      expect(TIER_1_SCAMS).toContain(IPHONE_POPUP);
      expect(TIER_1_SCAMS).toContain(PHISHING_LINKS);
      expect(TIER_1_SCAMS).toContain(SURVEY_SCAMS);
      expect(TIER_1_SCAMS).toContain(FAKE_ANTIVIRUS_POPUPS);
      expect(TIER_1_SCAMS).toContain(GIFT_CARD_SCAMS);
      expect(TIER_1_SCAMS).toContain(ADVANCE_FEE_FRAUD);
      expect(TIER_1_SCAMS).toContain(FAKE_JOB_POSTINGS);
    });

    it('should have all scams be tier 1', () => {
      TIER_1_SCAMS.forEach((scam) => {
        expect(scam.tier).toBe(1);
      });
    });

    it('should have unique IDs for all scams', () => {
      const ids = TIER_1_SCAMS.map((scam) => scam.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(TIER_1_SCAMS.length);
    });

    it('should have unique names for all scams', () => {
      const names = TIER_1_SCAMS.map((scam) => scam.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(TIER_1_SCAMS.length);
    });

    it('should not contain Bot Farms (it is a separate mechanic)', () => {
      const botProducers = TIER_1_SCAMS.filter(
        (scam) => scam.resourceType === 'bots'
      );
      expect(botProducers).toHaveLength(0);
    });

    it('should have Nigerian Prince free and all others require unlock cost', () => {
      const freeScams = TIER_1_SCAMS.filter(
        (scam) => scam.unlockCost === undefined
      );
      expect(freeScams).toHaveLength(1);
      expect(freeScams[0].id).toBe('nigerian-prince-emails');
    });

    it('should have all scams produce money', () => {
      const moneyScams = TIER_1_SCAMS.filter(
        (scam) => scam.resourceType === 'money'
      );
      expect(moneyScams).toHaveLength(9);
    });

    it('should have reasonable duration ranges (2-10 seconds)', () => {
      TIER_1_SCAMS.forEach((scam) => {
        expect(scam.baseDuration).toBeGreaterThanOrEqual(2000);
        expect(scam.baseDuration).toBeLessThanOrEqual(10000);
      });
    });

    it('should have reasonable reward ranges ($5-$12,500 money)', () => {
      TIER_1_SCAMS.forEach((scam) => {
        if (scam.resourceType === 'money') {
          expect(scam.baseReward).toBeGreaterThanOrEqual(5);
          expect(scam.baseReward).toBeLessThanOrEqual(12500);
        }
      });
    });

    it('should have scaling unlock costs ($250-$25,000 money, Nigerian Prince is free)', () => {
      TIER_1_SCAMS.forEach((scam) => {
        if (scam.unlockCost !== undefined) {
          expect(scam.unlockCost).toBeGreaterThanOrEqual(250);
          expect(scam.unlockCost).toBeLessThanOrEqual(25000);
        }
      });
    });
  });
});
