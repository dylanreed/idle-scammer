// ABOUTME: Integration tests for employee hiring flow in GameScreen
// ABOUTME: Verifies employee section visibility, hiring deducts money, and bonuses apply

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { GameScreen } from '../../src/screens/GameScreen';
import { useGameStore } from '../../src/game/store';
import { useScamStore } from '../../src/game/scams/scamStore';
import { useManagerStore } from '../../src/game/managers/managerStore';
import { useEmployeeStore } from '../../src/game/employees/employeeStore';
import { useOriginStore } from '../../src/game/origin/originStore';

// Mock the assets module to avoid requiring image files
jest.mock('../../src/game/assets', () => ({
  getManagerPortrait: jest.fn(() => null),
  getScamIcon: jest.fn(() => null),
  getResourceIcon: jest.fn(() => null),
}));

describe('GameScreen employee hiring', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useGameStore.setState(useGameStore.getInitialState());
    useScamStore.setState(useScamStore.getInitialState());
    useManagerStore.setState(useManagerStore.getInitialState());
    useEmployeeStore.setState(useEmployeeStore.getInitialState());
    jest.clearAllMocks();
    useOriginStore.getState().selectOrigin('moms-basement');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should show employee section on unlocked scam cards', () => {
    // Nigerian Prince Emails is unlocked by default in Tier 1
    render(<GameScreen />);
    act(() => { jest.advanceTimersByTime(100); });

    // Nigerian Prince Emails has Email Copywriter employee
    expect(screen.getByText(/Email Copywriter/)).toBeTruthy();
  });

  it('should show HIRE button with employee cost', () => {
    render(<GameScreen />);
    act(() => { jest.advanceTimersByTime(100); });

    // Email Copywriter base cost is $120 (floor(60 × $2/s cumulative income))
    expect(screen.getByText(/HIRE.*\$120/)).toBeTruthy();
  });

  it('should deduct money and increment employee count on hire', () => {
    // Give player money
    useGameStore.getState().addMoney(1000);

    render(<GameScreen />);
    act(() => { jest.advanceTimersByTime(100); });

    // Find and press the hire button for Email Copywriter
    const hireButton = screen.getByTestId('scam-card-nigerian-prince-emails-hire-employee');
    fireEvent.press(hireButton);
    act(() => { jest.advanceTimersByTime(100); });

    // Money should be deducted (Email Copywriter costs $120)
    expect(useGameStore.getState().resources.money).toBe(880);

    // Employee count should be 1
    expect(useEmployeeStore.getState().getEmployeeCount('email-copywriter')).toBe(1);
  });

  it('should update hire cost after hiring', () => {
    // Trust 2 allows hiring up to 2 per type
    useGameStore.getState().hydrate({ ...useGameStore.getState().resources, trust: 2 });
    useGameStore.getState().addMoney(2000);

    render(<GameScreen />);
    act(() => { jest.advanceTimersByTime(100); });

    // First hire: $120
    const hireButton = screen.getByTestId('scam-card-nigerian-prince-emails-hire-employee');
    act(() => { fireEvent.press(hireButton); });
    act(() => { jest.advanceTimersByTime(200); });

    // Verify employee was actually hired
    expect(useEmployeeStore.getState().getEmployeeCount('email-copywriter')).toBe(1);

    // Cost should now be floor(120 * 1.15^1) = floor(138) = 138
    expect(screen.getByText(/HIRE \(\$138\)/)).toBeTruthy();
  });

  it('should show bonus percentages after hiring employees', () => {
    useGameStore.getState().addMoney(500);

    render(<GameScreen />);
    act(() => { jest.advanceTimersByTime(100); });

    // Hire an Email Copywriter (2% speed, 8% reward)
    const hireButton = screen.getByTestId('scam-card-nigerian-prince-emails-hire-employee');
    fireEvent.press(hireButton);
    act(() => { jest.advanceTimersByTime(100); });

    // Should now show bonus percentages
    expect(screen.getByText(/Speed \+2%/)).toBeTruthy();
    expect(screen.getByText(/Reward \+8%/)).toBeTruthy();
  });

  it('should not allow hiring when player cannot afford', () => {
    // Start with no money
    render(<GameScreen />);
    act(() => { jest.advanceTimersByTime(100); });

    // Hire button should be disabled (Email Copywriter costs $375, player has $0)
    const hireButton = screen.getByTestId('scam-card-nigerian-prince-emails-hire-employee');
    expect(hireButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('should not show employee section on locked scams', () => {
    render(<GameScreen />);
    act(() => { jest.advanceTimersByTime(100); });

    // iPhone Popup is locked by default (needs $1K unlock cost)
    // Its employee (Popup Designer) should not be visible
    expect(screen.queryByText(/Popup Designer/)).toBeNull();
  });

  it('should reset employees after prestige', () => {
    useGameStore.getState().addMoney(500);

    // Hire an employee directly
    useEmployeeStore.getState().hireEmployee('bot-wrangler');

    // Verify hired
    expect(useEmployeeStore.getState().getEmployeeCount('bot-wrangler')).toBe(1);

    // Reset employees (simulates prestige)
    useEmployeeStore.getState().resetEmployees();

    // Count should be back to 0
    expect(useEmployeeStore.getState().getEmployeeCount('bot-wrangler')).toBe(0);
  });
});
