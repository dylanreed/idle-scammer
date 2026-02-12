// ABOUTME: Integration tests for the TrustCoin crypto tutorial modal
// ABOUTME: Verifies modal appears at trust >= 150, respects hasSeen, and dismiss marks seen

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { GameScreen } from '../../src/screens/GameScreen';
import { useGameStore } from '../../src/game/store';
import { useScamStore } from '../../src/game/scams/scamStore';
import { useManagerStore } from '../../src/game/managers/managerStore';
import { useEmployeeStore } from '../../src/game/employees/employeeStore';
import { useBotStore } from '../../src/game/bots/botStore';
import { useSkillStore } from '../../src/game/skills/skillStore';
import { useTutorialStore } from '../../src/game/tutorial/tutorialStore';
import { useCryptoStore } from '../../src/game/crypto/cryptoStore';
import { TUTORIAL_IDS } from '../../src/game/tutorial/types';
import { useOriginStore } from '../../src/game/origin/originStore';

// Mock the assets module to avoid requiring image files
jest.mock('../../src/game/assets', () => ({
  getManagerPortrait: jest.fn(() => null),
  getScamIcon: jest.fn(() => null),
  getResourceIcon: jest.fn(() => null),
}));

function resetAllStores() {
  useGameStore.setState(useGameStore.getInitialState());
  useScamStore.setState(useScamStore.getInitialState());
  useManagerStore.setState(useManagerStore.getInitialState());
  useEmployeeStore.setState(useEmployeeStore.getInitialState());
  useBotStore.setState(useBotStore.getInitialState());
  useSkillStore.setState(useSkillStore.getInitialState());
  useTutorialStore.getState().reset();
  useCryptoStore.setState(useCryptoStore.getInitialState());
}

/**
 * Advance fake timers enough for the game loop to tick and React to flush state.
 * Two separate act() calls ensure setState batched inside the tick updater is flushed.
 */
function tickGameLoop() {
  act(() => { jest.advanceTimersByTime(200); });
  act(() => { jest.advanceTimersByTime(200); });
}

describe('GameScreen crypto tutorial modal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetAllStores();
    jest.clearAllMocks();
    useOriginStore.getState().selectOrigin('moms-basement');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should show crypto tutorial modal when trust reaches 150', () => {
    // Set trust to 150 (the crypto unlock threshold)
    useGameStore.getState().addTrust(149); // trust starts at 1, so 1 + 149 = 150

    render(<GameScreen />);
    tickGameLoop();

    // The crypto tutorial modal should be visible
    expect(screen.getByTestId('crypto-tutorial-modal')).toBeTruthy();
  });

  it('should not show crypto tutorial modal when trust is below 150', () => {
    // Trust starts at 1, don't add any
    render(<GameScreen />);
    tickGameLoop();

    expect(screen.queryByTestId('crypto-tutorial-modal')).toBeNull();
  });

  it('should not show crypto tutorial modal when already seen', () => {
    // Set trust to 150 but mark the tutorial as already seen
    useGameStore.getState().addTrust(149);
    useTutorialStore.getState().markSeen(TUTORIAL_IDS.CRYPTO_INTRO);

    render(<GameScreen />);
    tickGameLoop();

    expect(screen.queryByTestId('crypto-tutorial-modal')).toBeNull();
  });

  it('should mark crypto tutorial as seen when dismissed', () => {
    useGameStore.getState().addTrust(149);

    render(<GameScreen />);
    tickGameLoop();

    // Modal should be visible
    expect(screen.getByTestId('crypto-tutorial-modal')).toBeTruthy();

    // Press the continue button to dismiss
    fireEvent.press(screen.getByTestId('tutorial-continue-btn'));

    // Should be marked as seen in the tutorial store
    expect(useTutorialStore.getState().hasSeen(TUTORIAL_IDS.CRYPTO_INTRO)).toBe(true);

    // Modal should be gone
    expect(screen.queryByTestId('crypto-tutorial-modal')).toBeNull();
  });
});
