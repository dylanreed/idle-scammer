// ABOUTME: Integration tests for the full game reset button
// ABOUTME: Verifies reset button shows confirmation, resets all state including trust, and restarts loop

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { GameScreen } from '../../src/screens/GameScreen';
import { useGameStore } from '../../src/game/store';
import { useScamStore } from '../../src/game/scams/scamStore';
import { useManagerStore } from '../../src/game/managers/managerStore';

// Mock the assets module to avoid requiring image files
jest.mock('../../src/game/assets', () => ({
  getManagerPortrait: jest.fn(() => null),
  getScamIcon: jest.fn(() => null),
  getResourceIcon: jest.fn(() => null),
}));

describe('GameScreen reset button', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useGameStore.setState(useGameStore.getInitialState());
    useScamStore.setState(useScamStore.getInitialState());
    useManagerStore.setState(useManagerStore.getInitialState());
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render a RESET button', () => {
    render(<GameScreen />);
    act(() => { jest.advanceTimersByTime(100); });
    expect(screen.getByTestId('reset-btn')).toBeTruthy();
  });

  it('should show confirmation when RESET is pressed', () => {
    render(<GameScreen />);
    act(() => { jest.advanceTimersByTime(100); });

    fireEvent.press(screen.getByTestId('reset-btn'));

    expect(screen.getByText('WIPE EVERYTHING?')).toBeTruthy();
    expect(screen.getByTestId('reset-confirm-btn')).toBeTruthy();
    expect(screen.getByTestId('reset-cancel-btn')).toBeTruthy();
  });

  it('should hide confirmation when CANCEL is pressed', () => {
    render(<GameScreen />);
    act(() => { jest.advanceTimersByTime(100); });

    fireEvent.press(screen.getByTestId('reset-btn'));
    expect(screen.getByText('WIPE EVERYTHING?')).toBeTruthy();

    fireEvent.press(screen.getByTestId('reset-cancel-btn'));
    expect(screen.queryByText('WIPE EVERYTHING?')).toBeNull();
  });

  it('should reset all resources including trust on confirm', () => {
    // Give the player resources and trust
    useGameStore.getState().addMoney(50000);
    useGameStore.getState().addTrust(20);
    useGameStore.getState().addBots(100);
    useGameStore.getState().addReputation(50);
    useGameStore.getState().addHeat(30);
    useGameStore.getState().addCrypto(5);
    useGameStore.getState().addSkillPoints(10);

    render(<GameScreen />);
    act(() => { jest.advanceTimersByTime(100); });

    // Trigger reset
    fireEvent.press(screen.getByTestId('reset-btn'));
    fireEvent.press(screen.getByTestId('reset-confirm-btn'));
    act(() => { jest.advanceTimersByTime(200); });

    // Verify full reset - everything back to initial state
    const resources = useGameStore.getState().resources;
    expect(resources.money).toBe(0);
    expect(resources.trust).toBe(1);
    expect(resources.bots).toBe(0);
    expect(resources.reputation).toBe(0);
    expect(resources.heat).toBe(0);
    expect(resources.crypto).toBe(0);
    expect(resources.skillPoints).toBe(0);
  });

  it('should reset scam states on confirm', () => {
    // Unlock and upgrade a scam
    useScamStore.getState().unlockScam('iphone-popup');
    useScamStore.getState().upgradeScam('iphone-popup');

    render(<GameScreen />);
    act(() => { jest.advanceTimersByTime(100); });

    fireEvent.press(screen.getByTestId('reset-btn'));
    fireEvent.press(screen.getByTestId('reset-confirm-btn'));
    act(() => { jest.advanceTimersByTime(200); });

    // iphone-popup should be locked again
    const scamState = useScamStore.getState().scams['iphone-popup'];
    expect(scamState.isUnlocked).toBe(false);
    expect(scamState.level).toBe(1);
  });

  it('should hide confirmation after reset is confirmed', () => {
    render(<GameScreen />);
    act(() => { jest.advanceTimersByTime(100); });

    fireEvent.press(screen.getByTestId('reset-btn'));
    fireEvent.press(screen.getByTestId('reset-confirm-btn'));
    act(() => { jest.advanceTimersByTime(200); });

    expect(screen.queryByText('WIPE EVERYTHING?')).toBeNull();
  });

  it('should allow starting scams after reset', () => {
    render(<GameScreen />);
    act(() => { jest.advanceTimersByTime(100); });

    fireEvent.press(screen.getByTestId('reset-btn'));
    fireEvent.press(screen.getByTestId('reset-confirm-btn'));
    act(() => { jest.advanceTimersByTime(200); });

    // Should still see START button for Nigerian Prince (always unlocked)
    expect(screen.queryByText('START')).toBeTruthy();
  });
});
