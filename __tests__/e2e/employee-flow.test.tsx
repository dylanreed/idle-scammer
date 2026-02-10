// ABOUTME: End-to-end test for the full employee lifecycle
// ABOUTME: Covers hiring, bonus effects on reward/duration, scaling, and prestige reset

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { GameScreen } from '../../src/screens/GameScreen';
import { useGameStore } from '../../src/game/store';
import { useScamStore } from '../../src/game/scams/scamStore';
import { useManagerStore } from '../../src/game/managers/managerStore';
import { useEmployeeStore } from '../../src/game/employees/employeeStore';
import { calculateScamReward, calculateScamDuration } from '../../src/game/scams/calculations';
import { NIGERIAN_PRINCE_EMAILS } from '../../src/game/scams/definitions';

// Mock the assets module to avoid requiring image files
jest.mock('../../src/game/assets', () => ({
  getManagerPortrait: jest.fn(() => null),
  getScamIcon: jest.fn(() => null),
  getResourceIcon: jest.fn(() => null),
}));

describe('Employee Flow E2E', () => {
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

  it('should complete full employee lifecycle: earn, hire, see bonuses, prestige resets', () => {
    // Give player money to hire employees
    useGameStore.getState().addMoney(1000);

    render(<GameScreen />);
    act(() => { jest.advanceTimersByTime(100); });

    // Step 1: Verify employee section is visible for Nigerian Prince Emails
    expect(screen.getByText(/Email Copywriter/)).toBeTruthy();
    expect(screen.getByText(/x0\/1/)).toBeTruthy(); // Count starts at 0, cap is 1 at trust 1

    // Step 2: Hire first employee
    const hireButton = screen.getByTestId('scam-card-nigerian-prince-emails-hire-employee');
    act(() => { fireEvent.press(hireButton); });
    act(() => { jest.advanceTimersByTime(100); });

    // Verify hire succeeded
    expect(useEmployeeStore.getState().getEmployeeCount('email-copywriter')).toBe(1);
    expect(useGameStore.getState().resources.money).toBe(880); // 1000 - 120

    // Step 3: Verify bonuses show on UI
    expect(screen.getByText(/Speed \+2%/)).toBeTruthy();
    expect(screen.getByText(/Reward \+8%/)).toBeTruthy();
    expect(screen.getByText(/x1\/1/)).toBeTruthy();

    // Step 4: Verify reward calculation includes employee bonus
    const bonuses = useEmployeeStore.getState().getScamBonuses('nigerian-prince-emails');
    expect(bonuses.speedBonus).toBeCloseTo(0.02);
    expect(bonuses.rewardBonus).toBeCloseTo(0.08);

    const baseReward = calculateScamReward(NIGERIAN_PRINCE_EMAILS, 1, 1, 0, 0);
    const boostedReward = calculateScamReward(NIGERIAN_PRINCE_EMAILS, 1, 1, 0, bonuses.rewardBonus);
    expect(boostedReward).toBeGreaterThan(baseReward);
    expect(boostedReward).toBeCloseTo(baseReward * 1.08, 2);

    // Step 5: Verify duration calculation includes employee bonus
    const baseDuration = calculateScamDuration(NIGERIAN_PRINCE_EMAILS, 1, 0);
    const boostedDuration = calculateScamDuration(NIGERIAN_PRINCE_EMAILS, 1, bonuses.speedBonus);
    expect(boostedDuration).toBeLessThan(baseDuration);
  });

  it('should scale bonuses with multiple employees', () => {
    // Trust 3 allows hiring up to 3 per type
    useGameStore.getState().hydrate({ ...useGameStore.getState().resources, trust: 3 });
    useGameStore.getState().addMoney(10000);

    render(<GameScreen />);
    act(() => { jest.advanceTimersByTime(100); });

    // Hire 3 Email Copywriters
    const hireButton = screen.getByTestId('scam-card-nigerian-prince-emails-hire-employee');
    for (let i = 0; i < 3; i++) {
      act(() => { fireEvent.press(hireButton); });
      act(() => { jest.advanceTimersByTime(100); });
    }

    // Verify 3 hired
    expect(useEmployeeStore.getState().getEmployeeCount('email-copywriter')).toBe(3);

    // Bonuses should be 3x the per-employee rate
    const bonuses = useEmployeeStore.getState().getScamBonuses('nigerian-prince-emails');
    expect(bonuses.speedBonus).toBeCloseTo(0.06); // 3 * 2%
    expect(bonuses.rewardBonus).toBeCloseTo(0.24); // 3 * 8%

    // UI should show scaled bonuses
    expect(screen.getByText(/Speed \+6%/)).toBeTruthy();
    expect(screen.getByText(/Reward \+24%/)).toBeTruthy();
    expect(screen.getByText(/x3\/3/)).toBeTruthy();
  });

  it('should reset employees to 0 after prestige', () => {
    // Hire some employees directly in the store
    useEmployeeStore.getState().hireEmployee('email-copywriter', 5);
    expect(useEmployeeStore.getState().getEmployeeCount('email-copywriter')).toBe(5);

    // Simulate prestige reset
    useEmployeeStore.getState().resetEmployees();

    // All employees should be gone
    expect(useEmployeeStore.getState().getEmployeeCount('email-copywriter')).toBe(0);

    const bonuses = useEmployeeStore.getState().getScamBonuses('nigerian-prince-emails');
    expect(bonuses.speedBonus).toBe(0);
    expect(bonuses.rewardBonus).toBe(0);
  });

  it('should increase hire cost with each employee hired', () => {
    // Trust 3 allows hiring up to 3 per type
    useGameStore.getState().hydrate({ ...useGameStore.getState().resources, trust: 3 });
    useGameStore.getState().addMoney(50000);

    render(<GameScreen />);
    act(() => { jest.advanceTimersByTime(100); });

    // First hire: $120 (floor(60 × $2/s cumulative income))
    expect(screen.getByText(/HIRE \(\$120\)/)).toBeTruthy();

    const hireButton = screen.getByTestId('scam-card-nigerian-prince-emails-hire-employee');
    act(() => { fireEvent.press(hireButton); });
    act(() => { jest.advanceTimersByTime(100); });

    // Second hire: floor(120 * 1.15) = floor(138) = $138
    expect(screen.getByText(/HIRE \(\$138\)/)).toBeTruthy();

    act(() => { fireEvent.press(hireButton); });
    act(() => { jest.advanceTimersByTime(100); });

    // Third hire: floor(120 * 1.15^2) = floor(158.7) = $158
    expect(screen.getByText(/HIRE \(\$158\)/)).toBeTruthy();
  });
});
