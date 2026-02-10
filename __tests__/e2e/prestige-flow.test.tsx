// ABOUTME: End-to-end test for the full prestige lifecycle
// ABOUTME: Covers heat buildup, modal appearance, choice selection, result display, and game restart

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { GameScreen } from '../../src/screens/GameScreen';
import { useGameStore } from '../../src/game/store';
import { useScamStore } from '../../src/game/scams/scamStore';
import { useManagerStore } from '../../src/game/managers/managerStore';
import { useEmployeeStore } from '../../src/game/employees/employeeStore';
import { MAX_HEAT } from '../../src/game/prestige/constants';
import { calculatePerformanceTrustGain } from '../../src/game/prestige/calculations';

// Mock the assets module to avoid requiring image files
jest.mock('../../src/game/assets', () => ({
  getManagerPortrait: jest.fn(() => null),
  getScamIcon: jest.fn(() => null),
  getResourceIcon: jest.fn(() => null),
}));

describe('Prestige Flow E2E', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Reset all stores to clean initial state
    useGameStore.setState(useGameStore.getInitialState());
    useScamStore.setState(useScamStore.getInitialState());
    useManagerStore.setState(useManagerStore.getInitialState());
    if (typeof useEmployeeStore.getInitialState === 'function') {
      useEmployeeStore.setState(useEmployeeStore.getInitialState());
    }
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should complete full clean escape prestige cycle', () => {
    // Setup: player has accumulated resources and heat is near max
    const initialTrust = useGameStore.getState().resources.trust;
    expect(initialTrust).toBe(1);

    // Give the player some resources to see them get reset
    useGameStore.getState().addMoney(10000);
    useGameStore.getState().addBots(50);
    useGameStore.getState().addReputation(100);

    // Set heat above max so next scam completion triggers prestige
    useGameStore.getState().addHeat(105);

    render(<GameScreen />);

    // Start the game loop
    act(() => { jest.advanceTimersByTime(100); });

    // Start a scam (Nigerian Prince is unlocked by default)
    const startButton = screen.queryByText('START');
    expect(startButton).toBeTruthy();
    if (startButton) {
      fireEvent.press(startButton);
    }

    // Advance through the scam duration (5 seconds for Nigerian Prince)
    act(() => { jest.advanceTimersByTime(5500); });

    // Prestige modal should appear
    expect(screen.queryByTestId('prestige-modal')).toBeTruthy();

    // Advance past typing animation to see header
    act(() => { jest.advanceTimersByTime(5000); });

    // Verify choice phase
    expect(screen.getByText('HEAT CRITICAL')).toBeTruthy();
    expect(screen.getByTestId('prestige-clean-escape-btn')).toBeTruthy();
    expect(screen.getByTestId('prestige-snitch-btn')).toBeTruthy();

    // Choose clean escape
    fireEvent.press(screen.getByTestId('prestige-clean-escape-btn'));

    // Advance past result phase typing animation
    act(() => { jest.advanceTimersByTime(5000); });

    // Verify result phase
    expect(screen.getByText('YOU GOT AWAY CLEAN')).toBeTruthy();

    // Trust change should reflect performance-based gain (dynamic, not fixed +10)
    // The exact value depends on money/completions/levels at prestige time,
    // so we just verify the trust change pattern appears
    expect(screen.getByText(/Trust: 1 →/)).toBeTruthy();
    expect(screen.getByText('ALL RESOURCES RESET')).toBeTruthy();

    // Verify starting skill points shown
    expect(screen.getByText(/Starting Skill Points:/)).toBeTruthy();

    // Press continue
    expect(screen.getByTestId('prestige-continue-btn')).toBeTruthy();
    fireEvent.press(screen.getByTestId('prestige-continue-btn'));

    // Allow state updates
    act(() => { jest.advanceTimersByTime(200); });

    // Modal should be gone
    expect(screen.queryByTestId('prestige-modal')).toBeNull();

    // Verify post-prestige state: trust increased, other resources reset
    const postResources = useGameStore.getState().resources;
    expect(postResources.trust).toBeGreaterThan(1);
    expect(postResources.money).toBe(0);
    expect(postResources.heat).toBe(0);
    expect(postResources.bots).toBe(0);
    expect(postResources.reputation).toBe(0);
  });

  it('should complete full snitch prestige cycle with bonuses kept', () => {
    // Give the player resources
    useGameStore.getState().addMoney(100000);
    useGameStore.getState().addBots(100);

    // Set heat above max
    useGameStore.getState().addHeat(105);

    render(<GameScreen />);

    // Start the game loop and trigger scam completion
    act(() => { jest.advanceTimersByTime(100); });

    const startButton = screen.queryByText('START');
    if (startButton) {
      fireEvent.press(startButton);
    }
    act(() => { jest.advanceTimersByTime(5500); });

    // Prestige modal should appear
    expect(screen.queryByTestId('prestige-modal')).toBeTruthy();
    act(() => { jest.advanceTimersByTime(5000); });

    // Choose snitch
    fireEvent.press(screen.getByTestId('prestige-snitch-btn'));
    act(() => { jest.advanceTimersByTime(5000); });

    // Verify snitch result
    expect(screen.getByText('YOU RATTED THEM OUT')).toBeTruthy();
    expect(screen.getByTestId('prestige-bonuses')).toBeTruthy();

    // Press continue
    fireEvent.press(screen.getByTestId('prestige-continue-btn'));
    act(() => { jest.advanceTimersByTime(200); });

    // Modal should be gone
    expect(screen.queryByTestId('prestige-modal')).toBeNull();
  });

  it('should allow starting new scams after prestige reset', () => {
    // Set heat above max
    useGameStore.getState().addHeat(105);

    render(<GameScreen />);
    act(() => { jest.advanceTimersByTime(100); });

    // Start and complete a scam to trigger prestige
    const startButton = screen.queryByText('START');
    if (startButton) {
      fireEvent.press(startButton);
    }
    act(() => { jest.advanceTimersByTime(5500); });

    // Complete prestige flow
    act(() => { jest.advanceTimersByTime(5000); });
    fireEvent.press(screen.getByTestId('prestige-clean-escape-btn'));
    act(() => { jest.advanceTimersByTime(1000); });
    fireEvent.press(screen.getByTestId('prestige-continue-btn'));
    act(() => { jest.advanceTimersByTime(500); });

    // Game should be running again - can start scams
    // Nigerian Prince should still be visible (it's always unlocked)
    const newStartButton = screen.queryByText('START');
    expect(newStartButton).toBeTruthy();
  });
});
