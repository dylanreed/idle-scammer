// ABOUTME: Tests for the bot assignment Zustand store
// ABOUTME: Validates assign/unassign, bonus calculations, and reset behavior

import { useBotStore } from '../../../src/game/bots/botStore';
import { SPEED_BOT_BONUS, PROFIT_BOT_BONUS } from '../../../src/game/bots/constants';

describe('Bot store', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useBotStore.getState().resetAssignments();
  });

  describe('initial state', () => {
    it('should start with empty assignments', () => {
      const { assignments } = useBotStore.getState();
      expect(Object.keys(assignments)).toHaveLength(0);
    });
  });

  describe('assignBot', () => {
    it('should assign a speed bot to a scam', () => {
      useBotStore.getState().assignBot('nigerian-prince-emails', 'speed');

      const { assignments } = useBotStore.getState();
      expect(assignments['nigerian-prince-emails']).toEqual({
        speedBots: 1,
        profitBots: 0,
      });
    });

    it('should assign a profit bot to a scam', () => {
      useBotStore.getState().assignBot('nigerian-prince-emails', 'profit');

      const { assignments } = useBotStore.getState();
      expect(assignments['nigerian-prince-emails']).toEqual({
        speedBots: 0,
        profitBots: 1,
      });
    });

    it('should accumulate multiple speed bots', () => {
      useBotStore.getState().assignBot('phishing-links', 'speed');
      useBotStore.getState().assignBot('phishing-links', 'speed');
      useBotStore.getState().assignBot('phishing-links', 'speed');

      const { assignments } = useBotStore.getState();
      expect(assignments['phishing-links'].speedBots).toBe(3);
    });

    it('should assign bots to different scams independently', () => {
      useBotStore.getState().assignBot('nigerian-prince-emails', 'speed');
      useBotStore.getState().assignBot('phishing-links', 'profit');

      const { assignments } = useBotStore.getState();
      expect(assignments['nigerian-prince-emails'].speedBots).toBe(1);
      expect(assignments['phishing-links'].profitBots).toBe(1);
    });
  });

  describe('unassignBot', () => {
    it('should remove a speed bot from a scam', () => {
      useBotStore.getState().assignBot('nigerian-prince-emails', 'speed');
      useBotStore.getState().assignBot('nigerian-prince-emails', 'speed');
      useBotStore.getState().unassignBot('nigerian-prince-emails', 'speed');

      const { assignments } = useBotStore.getState();
      expect(assignments['nigerian-prince-emails'].speedBots).toBe(1);
    });

    it('should remove a profit bot from a scam', () => {
      useBotStore.getState().assignBot('nigerian-prince-emails', 'profit');
      useBotStore.getState().assignBot('nigerian-prince-emails', 'profit');
      useBotStore.getState().unassignBot('nigerian-prince-emails', 'profit');

      const { assignments } = useBotStore.getState();
      expect(assignments['nigerian-prince-emails'].profitBots).toBe(1);
    });

    it('should not go below zero', () => {
      useBotStore.getState().unassignBot('nigerian-prince-emails', 'speed');

      const { assignments } = useBotStore.getState();
      // No entry created for a scam that never had bots
      const assignment = assignments['nigerian-prince-emails'];
      if (assignment) {
        expect(assignment.speedBots).toBeGreaterThanOrEqual(0);
      }
    });

    it('should not go below zero when unassigning from existing assignment', () => {
      useBotStore.getState().assignBot('nigerian-prince-emails', 'speed');
      useBotStore.getState().unassignBot('nigerian-prince-emails', 'speed');
      useBotStore.getState().unassignBot('nigerian-prince-emails', 'speed');

      const { assignments } = useBotStore.getState();
      expect(assignments['nigerian-prince-emails'].speedBots).toBe(0);
    });
  });

  describe('getScamBotBonuses', () => {
    it('should return zero bonuses for scams with no assignments', () => {
      const bonuses = useBotStore.getState().getScamBotBonuses('nigerian-prince-emails');
      expect(bonuses.speedBonus).toBe(0);
      expect(bonuses.profitBonus).toBe(0);
    });

    it('should calculate speed bonus from speed bots', () => {
      useBotStore.getState().assignBot('nigerian-prince-emails', 'speed');
      useBotStore.getState().assignBot('nigerian-prince-emails', 'speed');

      const bonuses = useBotStore.getState().getScamBotBonuses('nigerian-prince-emails');
      expect(bonuses.speedBonus).toBeCloseTo(2 * SPEED_BOT_BONUS);
    });

    it('should calculate profit bonus from profit bots', () => {
      useBotStore.getState().assignBot('nigerian-prince-emails', 'profit');
      useBotStore.getState().assignBot('nigerian-prince-emails', 'profit');
      useBotStore.getState().assignBot('nigerian-prince-emails', 'profit');

      const bonuses = useBotStore.getState().getScamBotBonuses('nigerian-prince-emails');
      expect(bonuses.profitBonus).toBeCloseTo(3 * PROFIT_BOT_BONUS);
    });

    it('should return both bonuses independently', () => {
      useBotStore.getState().assignBot('nigerian-prince-emails', 'speed');
      useBotStore.getState().assignBot('nigerian-prince-emails', 'profit');
      useBotStore.getState().assignBot('nigerian-prince-emails', 'profit');

      const bonuses = useBotStore.getState().getScamBotBonuses('nigerian-prince-emails');
      expect(bonuses.speedBonus).toBeCloseTo(1 * SPEED_BOT_BONUS);
      expect(bonuses.profitBonus).toBeCloseTo(2 * PROFIT_BOT_BONUS);
    });
  });

  describe('getTotalAssigned', () => {
    it('should return 0 when no bots are assigned', () => {
      expect(useBotStore.getState().getTotalAssigned()).toBe(0);
    });

    it('should sum all assigned bots across all scams', () => {
      useBotStore.getState().assignBot('nigerian-prince-emails', 'speed');
      useBotStore.getState().assignBot('nigerian-prince-emails', 'profit');
      useBotStore.getState().assignBot('phishing-links', 'speed');

      expect(useBotStore.getState().getTotalAssigned()).toBe(3);
    });
  });

  describe('getAvailableBots', () => {
    it('should return floor of total bots when none are assigned', () => {
      expect(useBotStore.getState().getAvailableBots(5.7)).toBe(5);
    });

    it('should subtract assigned bots from floored total', () => {
      useBotStore.getState().assignBot('nigerian-prince-emails', 'speed');
      useBotStore.getState().assignBot('nigerian-prince-emails', 'profit');

      expect(useBotStore.getState().getAvailableBots(5)).toBe(3);
    });

    it('should return 0 when all bots are assigned', () => {
      useBotStore.getState().assignBot('nigerian-prince-emails', 'speed');
      useBotStore.getState().assignBot('nigerian-prince-emails', 'speed');

      expect(useBotStore.getState().getAvailableBots(2)).toBe(0);
    });

    it('should floor fractional bot totals', () => {
      expect(useBotStore.getState().getAvailableBots(3.999)).toBe(3);
    });

    it('should return 0 for 0 total bots', () => {
      expect(useBotStore.getState().getAvailableBots(0)).toBe(0);
    });
  });

  describe('resetAssignments', () => {
    it('should clear all assignments', () => {
      useBotStore.getState().assignBot('nigerian-prince-emails', 'speed');
      useBotStore.getState().assignBot('phishing-links', 'profit');

      useBotStore.getState().resetAssignments();

      const { assignments } = useBotStore.getState();
      expect(Object.keys(assignments)).toHaveLength(0);
      expect(useBotStore.getState().getTotalAssigned()).toBe(0);
    });
  });

  describe('clearScamBots', () => {
    it('should remove all bots from a specific scam', () => {
      useBotStore.getState().assignBot('nigerian-prince-emails', 'speed');
      useBotStore.getState().assignBot('nigerian-prince-emails', 'speed');
      useBotStore.getState().assignBot('nigerian-prince-emails', 'profit');

      useBotStore.getState().clearScamBots('nigerian-prince-emails');

      const { assignments } = useBotStore.getState();
      expect(assignments['nigerian-prince-emails']).toEqual({ speedBots: 0, profitBots: 0 });
    });

    it('should not affect other scams', () => {
      useBotStore.getState().assignBot('nigerian-prince-emails', 'speed');
      useBotStore.getState().assignBot('phishing-links', 'profit');
      useBotStore.getState().assignBot('phishing-links', 'profit');

      useBotStore.getState().clearScamBots('nigerian-prince-emails');

      const { assignments } = useBotStore.getState();
      expect(assignments['nigerian-prince-emails']).toEqual({ speedBots: 0, profitBots: 0 });
      expect(assignments['phishing-links']).toEqual({ speedBots: 0, profitBots: 2 });
    });

    it('should be safe to call on a scam with no assignments', () => {
      useBotStore.getState().clearScamBots('nonexistent-scam');

      // Should not throw or create an entry
      const { assignments } = useBotStore.getState();
      expect(assignments['nonexistent-scam']).toBeUndefined();
    });
  });

  describe('hydrate', () => {
    it('should restore assignments from a saved map', () => {
      const savedAssignments = {
        'nigerian-prince-emails': { speedBots: 2, profitBots: 1 },
        'phishing-links': { speedBots: 0, profitBots: 3 },
      };

      useBotStore.getState().hydrate(savedAssignments);

      const { assignments } = useBotStore.getState();
      expect(assignments['nigerian-prince-emails']).toEqual({ speedBots: 2, profitBots: 1 });
      expect(assignments['phishing-links']).toEqual({ speedBots: 0, profitBots: 3 });
      expect(useBotStore.getState().getTotalAssigned()).toBe(6);
    });

    it('should overwrite existing assignments', () => {
      useBotStore.getState().assignBot('nigerian-prince-emails', 'speed');

      useBotStore.getState().hydrate({
        'phishing-links': { speedBots: 1, profitBots: 0 },
      });

      const { assignments } = useBotStore.getState();
      expect(assignments['nigerian-prince-emails']).toBeUndefined();
      expect(assignments['phishing-links']).toEqual({ speedBots: 1, profitBots: 0 });
    });
  });
});
