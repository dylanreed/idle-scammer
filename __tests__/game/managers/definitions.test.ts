// ABOUTME: Tests for Tier 1 manager definitions
// ABOUTME: Validates each scam has a manager with unique name and personality

import {
  TIER_1_MANAGERS,
  BOT_3000,
  PRINCE_OKONKWO,
  LUCKY_LARRY,
  POPUP_PETE,
  PHISHMASTER_PHIL,
  SURVEY_SUSAN,
  DREAD_NORTON,
  GWEN_CARDSWORTH,
  FELIX_UPFRONT,
  CARLA_CAREERS,
  getManagerByScamId,
  getManagerById,
} from '../../../src/game/managers/definitions';
import { TIER_1_SCAMS } from '../../../src/game/scams/definitions';
import type { ManagerDefinition } from '../../../src/game/managers/types';

describe('Manager Definitions', () => {
  describe('TIER_1_MANAGERS collection', () => {
    it('should have exactly 10 managers (one per Tier 1 scam)', () => {
      expect(TIER_1_MANAGERS.length).toBe(10);
    });

    it('should have unique IDs for all managers', () => {
      const ids = TIER_1_MANAGERS.map((m) => m.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(TIER_1_MANAGERS.length);
    });

    it('should have unique names for all managers', () => {
      const names = TIER_1_MANAGERS.map((m) => m.name);
      const uniqueNames = new Set(names);

      expect(uniqueNames.size).toBe(TIER_1_MANAGERS.length);
    });

    it('should cover all Tier 1 scams', () => {
      const scamIdsCovered = new Set(TIER_1_MANAGERS.map((m) => m.scamId));
      const tier1ScamIds = new Set(TIER_1_SCAMS.map((s) => s.id));

      expect(scamIdsCovered.size).toBe(tier1ScamIds.size);
      tier1ScamIds.forEach((scamId) => {
        expect(scamIdsCovered.has(scamId)).toBe(true);
      });
    });

    it('should have positive costs for all managers', () => {
      TIER_1_MANAGERS.forEach((manager) => {
        expect(manager.cost).toBeGreaterThan(0);
      });
    });

    it('should have non-empty flavor text for all managers', () => {
      TIER_1_MANAGERS.forEach((manager) => {
        expect(manager.flavorText.length).toBeGreaterThan(0);
      });
    });

    it('should have costs that scale with scam complexity', () => {
      // Bot Farms manager should be cheapest (first scam)
      // Fake Job Postings manager should be most expensive (last scam)
      const botFarmsManager = getManagerByScamId('bot-farms');
      const fakeJobsManager = getManagerByScamId('fake-job-postings');

      expect(botFarmsManager).toBeDefined();
      expect(fakeJobsManager).toBeDefined();
      expect(fakeJobsManager!.cost).toBeGreaterThan(botFarmsManager!.cost);
    });
  });

  describe('Individual manager definitions', () => {
    const validateManager = (
      manager: ManagerDefinition,
      expectedId: string,
      expectedScamId: string
    ) => {
      expect(manager.id).toBe(expectedId);
      expect(manager.scamId).toBe(expectedScamId);
      expect(manager.name.length).toBeGreaterThan(0);
      expect(manager.cost).toBeGreaterThan(0);
      expect(manager.flavorText.length).toBeGreaterThan(0);
    };

    it('should define BOT_3000 for bot-farms', () => {
      validateManager(BOT_3000, 'bot-3000', 'bot-farms');
      expect(BOT_3000.name).toBe('B0T-3000');
    });

    it('should define PRINCE_OKONKWO for nigerian-prince-emails', () => {
      validateManager(PRINCE_OKONKWO, 'prince-okonkwo', 'nigerian-prince-emails');
    });

    it('should define LUCKY_LARRY for fake-lottery-winnings', () => {
      validateManager(LUCKY_LARRY, 'lucky-larry', 'fake-lottery-winnings');
    });

    it('should define POPUP_PETE for iphone-popup', () => {
      validateManager(POPUP_PETE, 'popup-pete', 'iphone-popup');
    });

    it('should define PHISHMASTER_PHIL for phishing-links', () => {
      validateManager(PHISHMASTER_PHIL, 'phishmaster-phil', 'phishing-links');
    });

    it('should define SURVEY_SUSAN for survey-scams', () => {
      validateManager(SURVEY_SUSAN, 'survey-susan', 'survey-scams');
    });

    it('should define DREAD_NORTON for fake-antivirus-popups', () => {
      validateManager(DREAD_NORTON, 'dread-norton', 'fake-antivirus-popups');
    });

    it('should define GWEN_CARDSWORTH for gift-card-scams', () => {
      validateManager(GWEN_CARDSWORTH, 'gwen-cardsworth', 'gift-card-scams');
    });

    it('should define FELIX_UPFRONT for advance-fee-fraud', () => {
      validateManager(FELIX_UPFRONT, 'felix-upfront', 'advance-fee-fraud');
    });

    it('should define CARLA_CAREERS for fake-job-postings', () => {
      validateManager(CARLA_CAREERS, 'carla-careers', 'fake-job-postings');
    });
  });

  describe('getManagerByScamId', () => {
    it('should return manager for a scam with a manager', () => {
      const manager = getManagerByScamId('bot-farms');

      expect(manager).toBeDefined();
      expect(manager?.id).toBe('bot-3000');
    });

    it('should return undefined for non-existent scam', () => {
      const manager = getManagerByScamId('non-existent-scam');

      expect(manager).toBeUndefined();
    });

    it('should return a manager for all Tier 1 scams', () => {
      TIER_1_SCAMS.forEach((scam) => {
        const manager = getManagerByScamId(scam.id);
        expect(manager).toBeDefined();
        expect(manager?.scamId).toBe(scam.id);
      });
    });
  });

  describe('getManagerById', () => {
    it('should return manager by ID', () => {
      const manager = getManagerById('bot-3000');

      expect(manager).toBeDefined();
      expect(manager?.id).toBe('bot-3000');
    });

    it('should return undefined for non-existent manager', () => {
      const manager = getManagerById('non-existent-manager');

      expect(manager).toBeUndefined();
    });

    it('should find all Tier 1 managers by ID', () => {
      TIER_1_MANAGERS.forEach((mgr) => {
        const found = getManagerById(mgr.id);
        expect(found).toBeDefined();
        expect(found?.id).toBe(mgr.id);
      });
    });
  });

  describe('Manager personality and flavor', () => {
    it('should have flavor text that fits the scam theme', () => {
      // Bot manager should have robotic flavor
      expect(BOT_3000.flavorText.toUpperCase()).toContain('BEEP');

      // Prince should sound royal
      expect(PRINCE_OKONKWO.flavorText.toLowerCase()).toContain('prince');
    });

    it('should have memorable character names', () => {
      // Names should be creative, not generic
      const genericNames = ['Manager 1', 'Employee', 'Worker', 'Person'];
      TIER_1_MANAGERS.forEach((manager) => {
        genericNames.forEach((genericName) => {
          expect(manager.name).not.toBe(genericName);
        });
      });
    });
  });
});
