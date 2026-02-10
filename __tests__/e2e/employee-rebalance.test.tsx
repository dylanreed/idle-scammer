// ABOUTME: E2E tests for the employee rebalance flow
// ABOUTME: Covers trust cap progression, prestige cap increase, heat buildup, and cost derivation

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { GameScreen } from '../../src/screens/GameScreen';
import { useGameStore } from '../../src/game/store';
import { useScamStore } from '../../src/game/scams/scamStore';
import { useManagerStore } from '../../src/game/managers/managerStore';
import { useEmployeeStore } from '../../src/game/employees/employeeStore';
import { getEmployeeCostForScam, clearEmployeeCostCache } from '../../src/game/employees/calculations';

// Mock the assets module to avoid requiring image files
jest.mock('../../src/game/assets', () => ({
  getManagerPortrait: jest.fn(() => null),
  getScamIcon: jest.fn(() => null),
  getResourceIcon: jest.fn(() => null),
}));

describe('Employee Rebalance E2E', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useGameStore.setState(useGameStore.getInitialState());
    useScamStore.setState(useScamStore.getInitialState());
    useManagerStore.setState(useManagerStore.getInitialState());
    useEmployeeStore.setState(useEmployeeStore.getInitialState());
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should only allow hiring 1 of each employee at trust 1', () => {
    useGameStore.getState().addMoney(100000);

    render(<GameScreen />);
    act(() => { jest.advanceTimersByTime(100); });

    // Hire one Email Copywriter
    const hireButton = screen.getByTestId('scam-card-nigerian-prince-emails-hire-employee');
    act(() => { fireEvent.press(hireButton); });
    act(() => { jest.advanceTimersByTime(100); });

    expect(useEmployeeStore.getState().getEmployeeCount('email-copywriter')).toBe(1);

    // Try to hire another — should be blocked by trust cap
    act(() => { fireEvent.press(hireButton); });
    act(() => { jest.advanceTimersByTime(100); });

    // Still only 1
    expect(useEmployeeStore.getState().getEmployeeCount('email-copywriter')).toBe(1);
  });

  it('should allow hiring up to 11 after prestige to trust 11', () => {
    // Simulate prestige: trust = 11
    useGameStore.getState().hydrate({ ...useGameStore.getState().resources, trust: 11 });
    useGameStore.getState().addMoney(1000000);

    render(<GameScreen />);
    act(() => { jest.advanceTimersByTime(100); });

    // UI should show /11 cap
    expect(screen.getByText(/\/11/)).toBeTruthy();

    // Hire multiple Email Copywriters
    const hireButton = screen.getByTestId('scam-card-nigerian-prince-emails-hire-employee');
    for (let i = 0; i < 5; i++) {
      act(() => { fireEvent.press(hireButton); });
      act(() => { jest.advanceTimersByTime(100); });
    }

    expect(useEmployeeStore.getState().getEmployeeCount('email-copywriter')).toBe(5);
  });

  it('should build up employee heat with many employees hired', () => {
    // High trust to hire many
    useGameStore.getState().hydrate({ ...useGameStore.getState().resources, trust: 20 });

    // Hire 10 bot wranglers directly (cheapest employee)
    useEmployeeStore.getState().hireEmployee('bot-wrangler', 10);

    render(<GameScreen />);
    act(() => { jest.advanceTimersByTime(100); });

    // Let ticks accumulate heat (5 seconds = 50 ticks)
    act(() => { jest.advanceTimersByTime(5000); });

    // 10 employees * 0.001 * 5 seconds = 0.05 heat generated
    // Some decays away, but heat should be positive and measurable
    const heat = useGameStore.getState().resources.heat;
    expect(heat).toBeGreaterThan(0);
  });

  it('should match cost to cumulative income formula for first hire', () => {
    clearEmployeeCostCache();
    // Nigerian Prince: floor(60 × $2/s) = $120
    const firstHireCost = getEmployeeCostForScam('nigerian-prince-emails', 0);
    expect(firstHireCost).toBe(120);
  });

  it('should match cost to minimum for bot farms (non-money scam)', () => {
    clearEmployeeCostCache();
    // Bot Farms produces bots, not money. Minimum cost = $10.
    const firstHireCost = getEmployeeCostForScam('bot-farms', 0);
    expect(firstHireCost).toBe(10);
  });
});
