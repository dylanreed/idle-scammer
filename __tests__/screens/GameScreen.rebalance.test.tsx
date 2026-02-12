// ABOUTME: Integration tests for employee rebalance features in GameScreen
// ABOUTME: Validates trust cap UI, employee heat generation, and MAX label behavior

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

describe('GameScreen rebalance integration', () => {
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

  describe('trust cap UI', () => {
    it('should show count/max format at trust 1', () => {
      useGameStore.getState().addMoney(1000);

      render(<GameScreen />);
      act(() => { jest.advanceTimersByTime(100); });

      // At trust 1, max is 1 per type, count starts at 0
      expect(screen.getByText(/x0\/1/)).toBeTruthy();
    });

    it('should show MAX button when at trust cap', () => {
      useGameStore.getState().addMoney(1000);

      render(<GameScreen />);
      act(() => { jest.advanceTimersByTime(100); });

      // Hire the one allowed employee (Email Copywriter at $120)
      const hireButton = screen.getByTestId('scam-card-nigerian-prince-emails-hire-employee');
      act(() => { fireEvent.press(hireButton); });
      act(() => { jest.advanceTimersByTime(100); });

      // Should show x1/1
      expect(screen.getByText(/x1\/1/)).toBeTruthy();

      // Should show MAX instead of HIRE
      expect(screen.getByText('MAX')).toBeTruthy();
    });

    it('should block hiring when at trust cap even with enough money', () => {
      useGameStore.getState().addMoney(100000);

      render(<GameScreen />);
      act(() => { jest.advanceTimersByTime(100); });

      // Hire one
      const hireButton = screen.getByTestId('scam-card-nigerian-prince-emails-hire-employee');
      act(() => { fireEvent.press(hireButton); });
      act(() => { jest.advanceTimersByTime(100); });

      // Try to "hire" again by pressing MAX button — employee count should stay at 1
      act(() => { fireEvent.press(hireButton); });
      act(() => { jest.advanceTimersByTime(100); });

      expect(useEmployeeStore.getState().getEmployeeCount('email-copywriter')).toBe(1);
    });

    it('should display count/max with larger cap at higher trust', () => {
      useGameStore.getState().hydrate({ ...useGameStore.getState().resources, trust: 11 });
      useGameStore.getState().addMoney(1000);

      render(<GameScreen />);
      act(() => { jest.advanceTimersByTime(100); });

      // At trust 11, max is 11 per type
      expect(screen.getByText(/x0\/11/)).toBeTruthy();
    });
  });

  describe('employee heat in tick', () => {
    it('should increase heat when employees are hired', () => {
      useGameStore.getState().addMoney(1000);

      // Hire a bot wrangler directly (cheapest at $10)
      useEmployeeStore.getState().hireEmployee('bot-wrangler');

      render(<GameScreen />);
      act(() => { jest.advanceTimersByTime(100); });

      // Let the game loop tick for a bit (1 second = 10 ticks at 100ms)
      act(() => { jest.advanceTimersByTime(1000); });

      // Heat should be positive (1 employee * 0.001 * 1 second = 0.001, minus some decay)
      const heat = useGameStore.getState().resources.heat;
      expect(heat).toBeGreaterThan(0);
    });

    it('should generate more heat with more employees', () => {
      // Set trust high enough to hire multiple
      useGameStore.getState().hydrate({ ...useGameStore.getState().resources, trust: 10 });

      // Hire 5 bot wranglers directly
      useEmployeeStore.getState().hireEmployee('bot-wrangler', 5);

      render(<GameScreen />);
      act(() => { jest.advanceTimersByTime(100); });

      // Let the game loop tick
      act(() => { jest.advanceTimersByTime(2000); });

      const heat5 = useGameStore.getState().resources.heat;

      // Reset and hire 1
      useGameStore.setState(useGameStore.getInitialState());
      useGameStore.getState().hydrate({ ...useGameStore.getState().resources, trust: 10 });
      useEmployeeStore.setState(useEmployeeStore.getInitialState());
      useEmployeeStore.getState().hireEmployee('bot-wrangler', 1);

      // Re-render with fewer employees
      const { unmount } = render(<GameScreen />);
      act(() => { jest.advanceTimersByTime(100); });
      act(() => { jest.advanceTimersByTime(2000); });

      const heat1 = useGameStore.getState().resources.heat;

      // 5 employees should generate more heat than 1
      expect(heat5).toBeGreaterThan(heat1);

      unmount();
    });
  });
});
