// ABOUTME: Tests for BotAssignmentPanel component - bot assignment controls per scam
// ABOUTME: Verifies rendering of bot summary, per-scam rows, and assign/unassign actions

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { BotAssignmentPanel } from '../../src/components/BotAssignmentPanel';

// Mock the stores
const mockAssignBot = jest.fn();
const mockUnassignBot = jest.fn();
const mockClearScamBots = jest.fn();
const mockGetScamBotBonuses = jest.fn().mockReturnValue({ speedBonus: 0, profitBonus: 0 });
const mockGetTotalAssigned = jest.fn().mockReturnValue(0);
const mockGetAvailableBots = jest.fn().mockReturnValue(0);

jest.mock('../../src/game/bots/botStore', () => ({
  useBotStore: jest.fn((selector) => {
    const state = {
      assignments: {},
      assignBot: mockAssignBot,
      unassignBot: mockUnassignBot,
      clearScamBots: mockClearScamBots,
      getScamBotBonuses: mockGetScamBotBonuses,
      getTotalAssigned: mockGetTotalAssigned,
      getAvailableBots: mockGetAvailableBots,
    };
    return selector(state);
  }),
}));

jest.mock('../../src/game/store', () => ({
  useGameStore: jest.fn((selector) => {
    const state = {
      resources: { bots: 5, money: 1000, heat: 0, reputation: 0, skillPoints: 0, crypto: 0, trust: 1, snitchCount: 0 },
    };
    return selector(state);
  }),
}));

jest.mock('../../src/game/scams/scamStore', () => ({
  useScamStore: jest.fn((selector) => {
    const state = {
      scams: {
        'scam-1': { scamId: 'scam-1', level: 1, isUnlocked: true, timesCompleted: 0 },
        'scam-2': { scamId: 'scam-2', level: 1, isUnlocked: true, timesCompleted: 0 },
        'scam-locked': { scamId: 'scam-locked', level: 1, isUnlocked: false, timesCompleted: 0 },
      },
    };
    return selector(state);
  }),
}));

jest.mock('../../src/game/scams/definitions', () => ({
  ALL_SCAMS: [
    { id: 'scam-1', name: 'Test Scam 1', tier: 1, baseDuration: 1000, baseReward: 10, resourceType: 'money', description: 'Test' },
    { id: 'scam-2', name: 'Test Scam 2', tier: 1, baseDuration: 2000, baseReward: 20, resourceType: 'money', description: 'Test 2' },
    { id: 'scam-locked', name: 'Locked Scam', tier: 2, baseDuration: 3000, baseReward: 30, resourceType: 'money', description: 'Locked' },
  ],
  TIER_1_SCAMS: [],
}));

jest.mock('../../src/game/bots/constants', () => ({
  IDLE_BOT_HEAT_REDUCTION: 0.01,
  SPEED_BOT_BONUS: 0.03,
  PROFIT_BOT_BONUS: 0.03,
  BOT_GENERATION_RATES: { 1: 0.00001, 2: 0.0001, 3: 0.0005, 4: 0.002, 5: 0.01 },
}));

// Mock employee store for speed bonus lookups
const mockGetScamBonusesEmployee = jest.fn().mockReturnValue({ speedBonus: 0, rewardBonus: 0 });
jest.mock('../../src/game/employees/employeeStore', () => ({
  useEmployeeStore: {
    getState: () => ({
      getScamBonuses: mockGetScamBonusesEmployee,
    }),
  },
}));

// Mock getMaxUsefulSpeedBots - default to 90 (high cap, won't interfere with most tests)
const mockGetMaxUsefulSpeedBots = jest.fn().mockReturnValue(90);
jest.mock('../../src/game/scams/calculations', () => ({
  getMaxUsefulSpeedBots: (...args: unknown[]) => mockGetMaxUsefulSpeedBots(...args),
}));

// Import the mocked stores so we can reconfigure them in individual tests
const { useBotStore } = require('../../src/game/bots/botStore');
const { useGameStore } = require('../../src/game/store');

describe('BotAssignmentPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTotalAssigned.mockReturnValue(0);
    mockGetAvailableBots.mockReturnValue(5);
    mockGetScamBotBonuses.mockReturnValue({ speedBonus: 0, profitBonus: 0 });
    mockGetMaxUsefulSpeedBots.mockReturnValue(90);
    mockGetScamBonusesEmployee.mockReturnValue({ speedBonus: 0, rewardBonus: 0 });

    // Reset store mocks to default implementations (tests may override these)
    (useBotStore as jest.Mock).mockImplementation((selector: Function) => {
      const state = {
        assignments: {},
        assignBot: mockAssignBot,
        unassignBot: mockUnassignBot,
        getScamBotBonuses: mockGetScamBotBonuses,
        getTotalAssigned: mockGetTotalAssigned,
        getAvailableBots: mockGetAvailableBots,
      };
      return selector(state);
    });

    (useGameStore as jest.Mock).mockImplementation((selector: Function) => {
      const state = {
        resources: { bots: 5, money: 1000, heat: 0, reputation: 0, skillPoints: 0, crypto: 0, trust: 1, snitchCount: 0 },
      };
      return selector(state);
    });
  });

  describe('header and summary', () => {
    it('shows bot summary with total, deployed, and idle counts', () => {
      mockGetTotalAssigned.mockReturnValue(2);
      mockGetAvailableBots.mockReturnValue(3);

      render(<BotAssignmentPanel testID="bot-panel" />);

      const summary = screen.getByTestId('bot-summary');
      expect(summary).toBeTruthy();
      expect(summary.props.children).toContain('Total: 5');
      expect(summary.props.children).toContain('Deployed: 2');
      expect(summary.props.children).toContain('Idle: 3');
    });

    it('shows heat reduction info when idle bots > 0', () => {
      mockGetAvailableBots.mockReturnValue(2);

      render(<BotAssignmentPanel testID="bot-panel" />);

      const heatInfo = screen.getByTestId('bot-heat-info');
      expect(heatInfo).toBeTruthy();
      // 0.01 * 2 * 100 = 2%
      expect(heatInfo.props.children).toContain('2%');
    });

    it('does not show heat reduction info when idle bots is 0', () => {
      mockGetAvailableBots.mockReturnValue(0);

      render(<BotAssignmentPanel testID="bot-panel" />);

      expect(screen.queryByTestId('bot-heat-info')).toBeNull();
    });
  });

  describe('scam rows', () => {
    it('renders a row for each unlocked scam', () => {
      render(<BotAssignmentPanel testID="bot-panel" />);

      expect(screen.getByTestId('bot-row-scam-1')).toBeTruthy();
      expect(screen.getByTestId('bot-row-scam-2')).toBeTruthy();
    });

    it('each row shows scam name', () => {
      render(<BotAssignmentPanel testID="bot-panel" />);

      expect(screen.getByText('Test Scam 1')).toBeTruthy();
      expect(screen.getByText('Test Scam 2')).toBeTruthy();
    });

    it('does not render locked scams', () => {
      render(<BotAssignmentPanel testID="bot-panel" />);

      expect(screen.queryByTestId('bot-row-scam-locked')).toBeNull();
      expect(screen.queryByText('Locked Scam')).toBeNull();
    });

    it('each row has SPD +/- buttons and count', () => {
      render(<BotAssignmentPanel testID="bot-panel" />);

      expect(screen.getByTestId('bot-spd-plus-scam-1')).toBeTruthy();
      expect(screen.getByTestId('bot-spd-minus-scam-1')).toBeTruthy();
      expect(screen.getByTestId('bot-spd-count-scam-1')).toBeTruthy();
    });

    it('each row has PROFIT +/- buttons and count', () => {
      render(<BotAssignmentPanel testID="bot-panel" />);

      expect(screen.getByTestId('bot-profit-plus-scam-1')).toBeTruthy();
      expect(screen.getByTestId('bot-profit-minus-scam-1')).toBeTruthy();
      expect(screen.getByTestId('bot-profit-count-scam-1')).toBeTruthy();
    });
  });

  describe('assign/unassign actions', () => {
    it('SPD + button calls assignBot(scamId, "speed")', () => {
      render(<BotAssignmentPanel testID="bot-panel" />);

      fireEvent.press(screen.getByTestId('bot-spd-plus-scam-1'));
      expect(mockAssignBot).toHaveBeenCalledWith('scam-1', 'speed');
    });

    it('SPD - button calls unassignBot(scamId, "speed")', () => {
      // Need speedBots > 0 for the button to not be disabled
      (useBotStore as jest.Mock).mockImplementation((selector: Function) => {
        const state = {
          assignments: { 'scam-1': { speedBots: 1, profitBots: 0 } },
          assignBot: mockAssignBot,
          unassignBot: mockUnassignBot,
          clearScamBots: mockClearScamBots,
          getScamBotBonuses: mockGetScamBotBonuses,
          getTotalAssigned: mockGetTotalAssigned,
          getAvailableBots: mockGetAvailableBots,
        };
        return selector(state);
      });

      render(<BotAssignmentPanel testID="bot-panel" />);

      fireEvent.press(screen.getByTestId('bot-spd-minus-scam-1'));
      expect(mockUnassignBot).toHaveBeenCalledWith('scam-1', 'speed');
    });

    it('PROFIT + button calls assignBot(scamId, "profit")', () => {
      render(<BotAssignmentPanel testID="bot-panel" />);

      fireEvent.press(screen.getByTestId('bot-profit-plus-scam-1'));
      expect(mockAssignBot).toHaveBeenCalledWith('scam-1', 'profit');
    });

    it('PROFIT - button calls unassignBot(scamId, "profit")', () => {
      // Need profitBots > 0 for the button to not be disabled
      (useBotStore as jest.Mock).mockImplementation((selector: Function) => {
        const state = {
          assignments: { 'scam-1': { speedBots: 0, profitBots: 1 } },
          assignBot: mockAssignBot,
          unassignBot: mockUnassignBot,
          clearScamBots: mockClearScamBots,
          getScamBotBonuses: mockGetScamBotBonuses,
          getTotalAssigned: mockGetTotalAssigned,
          getAvailableBots: mockGetAvailableBots,
        };
        return selector(state);
      });

      render(<BotAssignmentPanel testID="bot-panel" />);

      fireEvent.press(screen.getByTestId('bot-profit-minus-scam-1'));
      expect(mockUnassignBot).toHaveBeenCalledWith('scam-1', 'profit');
    });

    it('CLEAR button calls clearScamBots(scamId)', () => {
      (useBotStore as jest.Mock).mockImplementation((selector: Function) => {
        const state = {
          assignments: { 'scam-1': { speedBots: 2, profitBots: 3 } },
          assignBot: mockAssignBot,
          unassignBot: mockUnassignBot,
          clearScamBots: mockClearScamBots,
          getScamBotBonuses: mockGetScamBotBonuses,
          getTotalAssigned: mockGetTotalAssigned,
          getAvailableBots: mockGetAvailableBots,
        };
        return selector(state);
      });

      render(<BotAssignmentPanel testID="bot-panel" />);

      fireEvent.press(screen.getByTestId('bot-clear-scam-1'));
      expect(mockClearScamBots).toHaveBeenCalledWith('scam-1');
    });
  });

  describe('button disabled states', () => {
    it('+ buttons are disabled when no available bots', () => {
      mockGetAvailableBots.mockReturnValue(0);

      render(<BotAssignmentPanel testID="bot-panel" />);

      const spdPlus = screen.getByTestId('bot-spd-plus-scam-1');
      const profitPlus = screen.getByTestId('bot-profit-plus-scam-1');

      expect(spdPlus.props.accessibilityState.disabled).toBe(true);
      expect(profitPlus.props.accessibilityState.disabled).toBe(true);
    });

    it('- buttons are disabled when count is 0', () => {
      render(<BotAssignmentPanel testID="bot-panel" />);

      const spdMinus = screen.getByTestId('bot-spd-minus-scam-1');
      const profitMinus = screen.getByTestId('bot-profit-minus-scam-1');

      expect(spdMinus.props.accessibilityState.disabled).toBe(true);
      expect(profitMinus.props.accessibilityState.disabled).toBe(true);
    });

    it('speed + button is disabled when speed bots reach the cap', () => {
      mockGetMaxUsefulSpeedBots.mockReturnValue(3);
      mockGetAvailableBots.mockReturnValue(5); // bots available, but cap reached

      (useBotStore as jest.Mock).mockImplementation((selector: Function) => {
        const state = {
          assignments: { 'scam-1': { speedBots: 3, profitBots: 0 } },
          assignBot: mockAssignBot,
          unassignBot: mockUnassignBot,
          clearScamBots: mockClearScamBots,
          getScamBotBonuses: mockGetScamBotBonuses,
          getTotalAssigned: mockGetTotalAssigned,
          getAvailableBots: mockGetAvailableBots,
        };
        return selector(state);
      });

      render(<BotAssignmentPanel testID="bot-panel" />);

      const spdPlus = screen.getByTestId('bot-spd-plus-scam-1');
      expect(spdPlus.props.accessibilityState.disabled).toBe(true);
    });

    it('speed + button is enabled when below the cap with available bots', () => {
      mockGetMaxUsefulSpeedBots.mockReturnValue(10);
      mockGetAvailableBots.mockReturnValue(5);

      (useBotStore as jest.Mock).mockImplementation((selector: Function) => {
        const state = {
          assignments: { 'scam-1': { speedBots: 3, profitBots: 0 } },
          assignBot: mockAssignBot,
          unassignBot: mockUnassignBot,
          clearScamBots: mockClearScamBots,
          getScamBotBonuses: mockGetScamBotBonuses,
          getTotalAssigned: mockGetTotalAssigned,
          getAvailableBots: mockGetAvailableBots,
        };
        return selector(state);
      });

      render(<BotAssignmentPanel testID="bot-panel" />);

      const spdPlus = screen.getByTestId('bot-spd-plus-scam-1');
      expect(spdPlus.props.accessibilityState.disabled).toBe(false);
    });

    it('speed cap does not affect profit + button', () => {
      mockGetMaxUsefulSpeedBots.mockReturnValue(0); // speed cap at 0
      mockGetAvailableBots.mockReturnValue(5);

      render(<BotAssignmentPanel testID="bot-panel" />);

      const profitPlus = screen.getByTestId('bot-profit-plus-scam-1');
      expect(profitPlus.props.accessibilityState.disabled).toBe(false);
    });

    it('CLEAR button is disabled when no bots are assigned to scam', () => {
      render(<BotAssignmentPanel testID="bot-panel" />);

      const clearBtn = screen.getByTestId('bot-clear-scam-1');
      expect(clearBtn.props.accessibilityState.disabled).toBe(true);
    });

    it('CLEAR button is enabled when bots are assigned to scam', () => {
      (useBotStore as jest.Mock).mockImplementation((selector: Function) => {
        const state = {
          assignments: { 'scam-1': { speedBots: 1, profitBots: 2 } },
          assignBot: mockAssignBot,
          unassignBot: mockUnassignBot,
          clearScamBots: mockClearScamBots,
          getScamBotBonuses: mockGetScamBotBonuses,
          getTotalAssigned: mockGetTotalAssigned,
          getAvailableBots: mockGetAvailableBots,
        };
        return selector(state);
      });

      render(<BotAssignmentPanel testID="bot-panel" />);

      const clearBtn = screen.getByTestId('bot-clear-scam-1');
      expect(clearBtn.props.accessibilityState.disabled).toBe(false);
    });
  });

  describe('bonus display', () => {
    it('shows bonus percentages when bots are assigned', () => {
      mockGetScamBotBonuses.mockReturnValue({ speedBonus: 0.2, profitBonus: 0.1 });

      (useBotStore as jest.Mock).mockImplementation((selector: Function) => {
        const state = {
          assignments: { 'scam-1': { speedBots: 2, profitBots: 1 } },
          assignBot: mockAssignBot,
          unassignBot: mockUnassignBot,
          clearScamBots: mockClearScamBots,
          getScamBotBonuses: mockGetScamBotBonuses,
          getTotalAssigned: mockGetTotalAssigned,
          getAvailableBots: mockGetAvailableBots,
        };
        return selector(state);
      });

      render(<BotAssignmentPanel testID="bot-panel" />);

      const bonus = screen.getByTestId('bot-bonus-scam-1');
      expect(bonus).toBeTruthy();
      expect(bonus.props.children).toContain('SPD +20%');
      expect(bonus.props.children).toContain('PROFIT +10%');
    });

    it('does not show bonus text when no bots assigned', () => {
      mockGetScamBotBonuses.mockReturnValue({ speedBonus: 0, profitBonus: 0 });

      render(<BotAssignmentPanel testID="bot-panel" />);

      expect(screen.queryByTestId('bot-bonus-scam-1')).toBeNull();
    });
  });

  describe('empty state', () => {
    it('shows "No bots available" message when total bots is 0', () => {
      (useGameStore as jest.Mock).mockImplementation((selector: Function) => {
        const state = {
          resources: { bots: 0, money: 1000, heat: 0, reputation: 0, skillPoints: 0, crypto: 0, trust: 1, snitchCount: 0 },
        };
        return selector(state);
      });

      render(<BotAssignmentPanel testID="bot-panel" />);

      expect(screen.getByText('No bots available')).toBeTruthy();
    });
  });
});
