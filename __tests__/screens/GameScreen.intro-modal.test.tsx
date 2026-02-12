// ABOUTME: Integration tests for the intro modal and origin selection flow
// ABOUTME: Verifies modal shows on fresh start, origin select appears, and selection stores choice

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { GameScreen } from '../../src/screens/GameScreen';
import { useGameStore } from '../../src/game/store';
import { useScamStore } from '../../src/game/scams/scamStore';
import { useManagerStore } from '../../src/game/managers/managerStore';
import { useOriginStore } from '../../src/game/origin/originStore';
import { ORIGINS } from '../../src/game/origin/constants';

// Mock the assets module to avoid requiring image files
jest.mock('../../src/game/assets', () => ({
  getManagerPortrait: jest.fn(() => null),
  getScamIcon: jest.fn(() => null),
  getResourceIcon: jest.fn(() => null),
}));

jest.mock('../../src/utils/haptics', () => ({
  triggerHaptic: jest.fn(),
}));

describe('GameScreen intro modal and origin selection', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useGameStore.setState(useGameStore.getInitialState());
    useScamStore.setState(useScamStore.getInitialState());
    useManagerStore.setState(useManagerStore.getInitialState());
    useOriginStore.getState().reset();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should show intro modal when no origin is selected (fresh game)', () => {
    render(<GameScreen />);
    act(() => { jest.advanceTimersByTime(100); });

    expect(screen.getByTestId('intro-modal')).toBeTruthy();
    // Title animates via typing effect; verify body text is present
    expect(screen.getByText('Every empire starts somewhere pathetic.')).toBeTruthy();
  });

  it('should NOT show intro modal when origin is already selected', () => {
    useOriginStore.getState().selectOrigin('internet-cafe');

    render(<GameScreen />);
    act(() => { jest.advanceTimersByTime(100); });

    expect(screen.queryByTestId('intro-modal')).toBeNull();
  });

  it('should show origin select after continuing from intro', () => {
    render(<GameScreen />);
    act(() => { jest.advanceTimersByTime(100); });

    // Intro modal should be visible
    expect(screen.getByTestId('intro-modal')).toBeTruthy();

    // Press continue
    fireEvent.press(screen.getByTestId('tutorial-continue-btn'));

    // Intro modal should be gone, origin select should appear
    expect(screen.queryByTestId('intro-modal')).toBeNull();
    expect(screen.getByTestId('origin-select-modal')).toBeTruthy();
  });

  it('should display all three origin names in origin select', () => {
    render(<GameScreen />);
    act(() => { jest.advanceTimersByTime(100); });

    // Navigate to origin select
    fireEvent.press(screen.getByTestId('tutorial-continue-btn'));

    expect(screen.getByText(ORIGINS['moms-basement'].name)).toBeTruthy();
    expect(screen.getByText(ORIGINS['internet-cafe'].name)).toBeTruthy();
    expect(screen.getByText(ORIGINS['stolen-phone'].name)).toBeTruthy();
  });

  it('should store origin and dismiss modal when origin is selected', () => {
    render(<GameScreen />);
    act(() => { jest.advanceTimersByTime(100); });

    // Navigate to origin select
    fireEvent.press(screen.getByTestId('tutorial-continue-btn'));

    // Select an origin card and confirm
    fireEvent.press(screen.getByTestId('origin-card-stolen-phone'));
    fireEvent.press(screen.getByTestId('origin-choose-btn'));

    // Origin should be stored
    expect(useOriginStore.getState().selectedOrigin).toBe('stolen-phone');

    // Origin select modal should be gone
    expect(screen.queryByTestId('origin-select-modal')).toBeNull();
  });

  it('should not show intro modal after reset and re-render if origin was selected', () => {
    useOriginStore.getState().selectOrigin('moms-basement');

    render(<GameScreen />);
    act(() => { jest.advanceTimersByTime(100); });

    expect(screen.queryByTestId('intro-modal')).toBeNull();
    expect(screen.queryByTestId('origin-select-modal')).toBeNull();
  });
});
