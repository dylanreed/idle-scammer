// ABOUTME: End-to-end test for the bot assignment flow through BotAssignmentPanel
// ABOUTME: Covers assigning speed/profit bots, unassigning, capacity limits, and idle heat reduction

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { OpsPanel } from '../../src/components/OpsPanel';
import { useGameStore } from '../../src/game/store';
import { useBotStore } from '../../src/game/bots/botStore';
import { useScamStore } from '../../src/game/scams/scamStore';

// Mock useWindowDimensions to simulate wide screen (both panels visible)
jest.mock('../../src/components/useWindowDimensions', () => ({
  useWindowDimensions: () => ({ width: 1024, height: 768 }),
}));

// Mock scam definitions with a small predictable set
jest.mock('../../src/game/scams/definitions', () => ({
  ALL_SCAMS: [
    { id: 'e2e-scam-1', name: 'E2E Scam 1', tier: 1, baseDuration: 1000, baseReward: 10, resourceType: 'money', description: 'Test' },
    { id: 'e2e-scam-2', name: 'E2E Scam 2', tier: 1, baseDuration: 2000, baseReward: 20, resourceType: 'money', description: 'Test 2' },
  ],
  TIER_1_SCAMS: [],
}));

// Mock bot constants for predictable bonus calculations
jest.mock('../../src/game/bots/constants', () => ({
  IDLE_BOT_HEAT_REDUCTION: 0.01,
  SPEED_BOT_BONUS: 0.03,
  PROFIT_BOT_BONUS: 0.03,
  BOT_GENERATION_RATES: { 1: 0.00001, 2: 0.0001, 3: 0.0005, 4: 0.002, 5: 0.01 },
}));

// Stub ManagerPanel to avoid importing manager/employee/prestige/asset dependencies
jest.mock('../../src/components/ManagerPanel', () => ({
  ManagerPanel: () => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: 'manager-panel-stub' });
  },
}));

// Mock assets module to avoid requiring image files
jest.mock('../../src/game/assets', () => ({
  getManagerPortrait: jest.fn(() => null),
  getScamIcon: jest.fn(() => null),
  getResourceIcon: jest.fn(() => null),
}));

describe('Bot Assignment Flow E2E', () => {
  const defaultProps = {
    resources: {
      money: 0,
      reputation: 0,
      heat: 0,
      bots: 0,
      skillPoints: 0,
      crypto: 0,
      trust: 1,
      snitchCount: 0,
    },
    scams: {},
    isManagerHired: jest.fn(() => false),
    onHireManager: jest.fn(),
  };

  beforeEach(() => {
    // Reset all stores to clean initial state
    useGameStore.setState(useGameStore.getInitialState());
    useBotStore.getState().resetAssignments();
    useScamStore.setState(useScamStore.getInitialState());
    jest.clearAllMocks();
  });

  it('assigns a speed bot and shows updated count', () => {
    // Give player 5 bots and unlock a scam
    useGameStore.getState().addBots(5);
    useScamStore.getState().unlockScam('e2e-scam-1');

    render(<OpsPanel {...defaultProps} />);

    // Verify initial speed count is 0
    const spdCount = screen.getByTestId('bot-spd-count-e2e-scam-1');
    expect(spdCount).toHaveTextContent('0');

    // Press the SPD + button
    const spdPlus = screen.getByTestId('bot-spd-plus-e2e-scam-1');
    act(() => {
      fireEvent.press(spdPlus);
    });

    // Verify store has the assignment
    const assignment = useBotStore.getState().assignments['e2e-scam-1'];
    expect(assignment).toBeDefined();
    expect(assignment.speedBots).toBe(1);

    // Verify UI shows count of 1
    expect(screen.getByTestId('bot-spd-count-e2e-scam-1')).toHaveTextContent('1');
  });

  it('assigns a profit bot and shows updated count', () => {
    // Give player 5 bots and unlock a scam
    useGameStore.getState().addBots(5);
    useScamStore.getState().unlockScam('e2e-scam-1');

    render(<OpsPanel {...defaultProps} />);

    // Verify initial profit count is 0
    const profitCount = screen.getByTestId('bot-profit-count-e2e-scam-1');
    expect(profitCount).toHaveTextContent('0');

    // Press the PROFIT + button
    const profitPlus = screen.getByTestId('bot-profit-plus-e2e-scam-1');
    act(() => {
      fireEvent.press(profitPlus);
    });

    // Verify store has the assignment
    const assignment = useBotStore.getState().assignments['e2e-scam-1'];
    expect(assignment).toBeDefined();
    expect(assignment.profitBots).toBe(1);

    // Verify UI shows count of 1
    expect(screen.getByTestId('bot-profit-count-e2e-scam-1')).toHaveTextContent('1');
  });

  it('cannot assign more bots than available', () => {
    // Give exactly 1 bot and unlock a scam
    useGameStore.getState().addBots(1);
    useScamStore.getState().unlockScam('e2e-scam-1');

    render(<OpsPanel {...defaultProps} />);

    // Assign the single bot to speed
    const spdPlus = screen.getByTestId('bot-spd-plus-e2e-scam-1');
    act(() => {
      fireEvent.press(spdPlus);
    });

    // Verify the bot was assigned
    expect(screen.getByTestId('bot-spd-count-e2e-scam-1')).toHaveTextContent('1');

    // Summary should show 0 idle
    expect(screen.getByTestId('bot-summary')).toHaveTextContent(/Idle: 0/);

    // Both + buttons should now be disabled (no bots available)
    expect(screen.getByTestId('bot-spd-plus-e2e-scam-1')).toBeDisabled();
    expect(screen.getByTestId('bot-profit-plus-e2e-scam-1')).toBeDisabled();
  });

  it('unassigns a bot', () => {
    // Give player 5 bots and unlock a scam
    useGameStore.getState().addBots(5);
    useScamStore.getState().unlockScam('e2e-scam-1');

    render(<OpsPanel {...defaultProps} />);

    // First assign a speed bot
    const spdPlus = screen.getByTestId('bot-spd-plus-e2e-scam-1');
    act(() => {
      fireEvent.press(spdPlus);
    });
    expect(screen.getByTestId('bot-spd-count-e2e-scam-1')).toHaveTextContent('1');

    // Now unassign it
    const spdMinus = screen.getByTestId('bot-spd-minus-e2e-scam-1');
    act(() => {
      fireEvent.press(spdMinus);
    });

    // Verify store is back to 0
    const assignment = useBotStore.getState().assignments['e2e-scam-1'];
    expect(assignment.speedBots).toBe(0);

    // Verify UI shows 0
    expect(screen.getByTestId('bot-spd-count-e2e-scam-1')).toHaveTextContent('0');
  });

  it('shows idle bot heat reduction info', () => {
    // Give 3 bots, assign none
    useGameStore.getState().addBots(3);
    useScamStore.getState().unlockScam('e2e-scam-1');

    render(<OpsPanel {...defaultProps} />);

    // Summary should show all 3 idle
    expect(screen.getByTestId('bot-summary')).toHaveTextContent(/Idle: 3/);

    // Heat reduction text should appear: 0.01 * 3 * 100 = 3%
    const heatInfo = screen.getByTestId('bot-heat-info');
    expect(heatInfo).toHaveTextContent('Idle bots reduce heat by 3%');
  });
});
