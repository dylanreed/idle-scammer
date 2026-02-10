// ABOUTME: Tests for bot system type definitions
// ABOUTME: Validates BotAssignment, BotAssignmentMap, and BotBonuses interfaces

import type { BotAssignment, BotAssignmentMap, BotBonuses } from '../../../src/game/bots/types';

describe('Bot types', () => {
  describe('BotAssignment', () => {
    it('should have speedBots and profitBots fields', () => {
      const assignment: BotAssignment = {
        speedBots: 3,
        profitBots: 2,
      };

      expect(assignment.speedBots).toBe(3);
      expect(assignment.profitBots).toBe(2);
    });

    it('should allow zero assignments', () => {
      const assignment: BotAssignment = {
        speedBots: 0,
        profitBots: 0,
      };

      expect(assignment.speedBots).toBe(0);
      expect(assignment.profitBots).toBe(0);
    });
  });

  describe('BotAssignmentMap', () => {
    it('should be a record keyed by scam ID', () => {
      const map: BotAssignmentMap = {
        'nigerian-prince-emails': { speedBots: 1, profitBots: 2 },
        'phishing-links': { speedBots: 0, profitBots: 1 },
      };

      expect(map['nigerian-prince-emails'].speedBots).toBe(1);
      expect(map['phishing-links'].profitBots).toBe(1);
    });

    it('should allow empty map', () => {
      const map: BotAssignmentMap = {};
      expect(Object.keys(map)).toHaveLength(0);
    });
  });

  describe('BotBonuses', () => {
    it('should have speedBonus and profitBonus fields', () => {
      const bonuses: BotBonuses = {
        speedBonus: 0.3,
        profitBonus: 0.2,
      };

      expect(bonuses.speedBonus).toBe(0.3);
      expect(bonuses.profitBonus).toBe(0.2);
    });

    it('should allow zero bonuses', () => {
      const bonuses: BotBonuses = {
        speedBonus: 0,
        profitBonus: 0,
      };

      expect(bonuses.speedBonus).toBe(0);
      expect(bonuses.profitBonus).toBe(0);
    });
  });
});
