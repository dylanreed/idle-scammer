// ABOUTME: Tests for Tier 1 employee definitions
// ABOUTME: Validates each scam has an employee and all definitions are valid

import {
  TIER_1_EMPLOYEES,
  BOT_WRANGLER,
  EMAIL_COPYWRITER,
  LOTTERY_ANNOUNCER,
  POPUP_DESIGNER,
  DOMAIN_SPOOFER,
  SURVEY_BOT_OPERATOR,
  FEAR_MONGER,
  GIFT_CARD_RESELLER,
  TRUST_BUILDER,
  RESUME_FAKER,
  getEmployeesByScamId,
  getEmployeeById,
} from '../../../src/game/employees/definitions';
import { TIER_1_SCAMS } from '../../../src/game/scams/definitions';
import type { EmployeeDefinition } from '../../../src/game/employees/types';

describe('Employee Definitions', () => {
  describe('TIER_1_EMPLOYEES collection', () => {
    it('should have exactly 10 employees (one per Tier 1 scam)', () => {
      expect(TIER_1_EMPLOYEES.length).toBe(10);
    });

    it('should have unique IDs for all employees', () => {
      const ids = TIER_1_EMPLOYEES.map((e) => e.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(TIER_1_EMPLOYEES.length);
    });

    it('should have unique names for all employees', () => {
      const names = TIER_1_EMPLOYEES.map((e) => e.name);
      const uniqueNames = new Set(names);

      expect(uniqueNames.size).toBe(TIER_1_EMPLOYEES.length);
    });

    it('should cover all Tier 1 scams', () => {
      const scamIdsCovered = new Set(TIER_1_EMPLOYEES.map((e) => e.scamId));
      const tier1ScamIds = new Set(TIER_1_SCAMS.map((s) => s.id));

      expect(scamIdsCovered.size).toBe(tier1ScamIds.size);
      tier1ScamIds.forEach((scamId) => {
        expect(scamIdsCovered.has(scamId)).toBe(true);
      });
    });

    it('should have positive base costs for all employees', () => {
      TIER_1_EMPLOYEES.forEach((employee) => {
        expect(employee.baseCost).toBeGreaterThan(0);
      });
    });

    it('should have non-negative boost values for all employees', () => {
      TIER_1_EMPLOYEES.forEach((employee) => {
        expect(employee.speedBoost).toBeGreaterThanOrEqual(0);
        expect(employee.rewardBoost).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have at least one boost > 0 for all employees', () => {
      TIER_1_EMPLOYEES.forEach((employee) => {
        const totalBoost = employee.speedBoost + employee.rewardBoost;
        expect(totalBoost).toBeGreaterThan(0);
      });
    });

    it('should have reasonable boost values (< 50% each)', () => {
      TIER_1_EMPLOYEES.forEach((employee) => {
        expect(employee.speedBoost).toBeLessThan(0.5);
        expect(employee.rewardBoost).toBeLessThan(0.5);
      });
    });
  });

  describe('Individual employee definitions', () => {
    const validateEmployee = (
      employee: EmployeeDefinition,
      expectedId: string,
      expectedScamId: string
    ) => {
      expect(employee.id).toBe(expectedId);
      expect(employee.scamId).toBe(expectedScamId);
      expect(employee.name.length).toBeGreaterThan(0);
      expect(employee.baseCost).toBeGreaterThan(0);
    };

    it('should define BOT_WRANGLER for bot-farms', () => {
      validateEmployee(BOT_WRANGLER, 'bot-wrangler', 'bot-farms');
    });

    it('should define EMAIL_COPYWRITER for nigerian-prince-emails', () => {
      validateEmployee(EMAIL_COPYWRITER, 'email-copywriter', 'nigerian-prince-emails');
    });

    it('should define LOTTERY_ANNOUNCER for fake-lottery-winnings', () => {
      validateEmployee(LOTTERY_ANNOUNCER, 'lottery-announcer', 'fake-lottery-winnings');
    });

    it('should define POPUP_DESIGNER for iphone-popup', () => {
      validateEmployee(POPUP_DESIGNER, 'popup-designer', 'iphone-popup');
    });

    it('should define DOMAIN_SPOOFER for phishing-links', () => {
      validateEmployee(DOMAIN_SPOOFER, 'domain-spoofer', 'phishing-links');
    });

    it('should define SURVEY_BOT_OPERATOR for survey-scams', () => {
      validateEmployee(SURVEY_BOT_OPERATOR, 'survey-bot-operator', 'survey-scams');
    });

    it('should define FEAR_MONGER for fake-antivirus-popups', () => {
      validateEmployee(FEAR_MONGER, 'fear-monger', 'fake-antivirus-popups');
    });

    it('should define GIFT_CARD_RESELLER for gift-card-scams', () => {
      validateEmployee(GIFT_CARD_RESELLER, 'gift-card-reseller', 'gift-card-scams');
    });

    it('should define TRUST_BUILDER for advance-fee-fraud', () => {
      validateEmployee(TRUST_BUILDER, 'trust-builder', 'advance-fee-fraud');
    });

    it('should define RESUME_FAKER for fake-job-postings', () => {
      validateEmployee(RESUME_FAKER, 'resume-faker', 'fake-job-postings');
    });
  });

  describe('getEmployeesByScamId', () => {
    it('should return employees for a scam with employees', () => {
      const employees = getEmployeesByScamId('bot-farms');

      expect(employees.length).toBe(1);
      expect(employees[0].id).toBe('bot-wrangler');
    });

    it('should return empty array for non-existent scam', () => {
      const employees = getEmployeesByScamId('non-existent-scam');

      expect(employees).toEqual([]);
    });

    it('should return employees for all Tier 1 scams', () => {
      TIER_1_SCAMS.forEach((scam) => {
        const employees = getEmployeesByScamId(scam.id);
        expect(employees.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('getEmployeeById', () => {
    it('should return employee by ID', () => {
      const employee = getEmployeeById('bot-wrangler');

      expect(employee).toBeDefined();
      expect(employee?.id).toBe('bot-wrangler');
    });

    it('should return undefined for non-existent employee', () => {
      const employee = getEmployeeById('non-existent-employee');

      expect(employee).toBeUndefined();
    });

    it('should find all Tier 1 employees by ID', () => {
      TIER_1_EMPLOYEES.forEach((emp) => {
        const found = getEmployeeById(emp.id);
        expect(found).toBeDefined();
        expect(found?.id).toBe(emp.id);
      });
    });
  });
});
