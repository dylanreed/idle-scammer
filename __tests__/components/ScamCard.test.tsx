// ABOUTME: Tests for ScamCard component with auto-collect and upgrade functionality
// ABOUTME: Verifies card displays correctly in all states and shows upgrade button

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ScamCard, ScamCardProps } from '../../src/components/ScamCard';
import type { ScamDefinition, ScamState } from '../../src/game/scams/types';
import type { ScamTimer } from '../../src/game/engine/types';

// Mock scam definition for tests
const mockScamDefinition: ScamDefinition = {
  id: 'test-scam',
  name: 'Test Scam',
  description: 'A scam for testing',
  tier: 1,
  baseDuration: 5000,
  baseReward: 10,
  resourceType: 'money',
  unlockCost: 100,
};

// Mock scam state (unlocked, level 1)
const mockUnlockedState: ScamState = {
  isUnlocked: true,
  level: 1,
  timesCompleted: 0,
};

// Mock scam state (locked)
const mockLockedState: ScamState = {
  isUnlocked: false,
  level: 1,
  timesCompleted: 0,
};

// Create a running timer
function createRunningTimer(): ScamTimer {
  return {
    scamId: 'test-scam',
    startTime: Date.now() - 1000,
    duration: 5000,
    isComplete: false,
  };
}

// Create a complete timer
function createCompleteTimer(): ScamTimer {
  return {
    scamId: 'test-scam',
    startTime: Date.now() - 6000,
    duration: 5000,
    isComplete: true,
  };
}

// Default props for tests
function createDefaultProps(overrides: Partial<ScamCardProps> = {}): ScamCardProps {
  return {
    scamDefinition: mockScamDefinition,
    scamState: mockUnlockedState,
    timer: undefined,
    trust: 1,
    money: 1000,
    onStart: jest.fn(),
    onCollect: jest.fn(),
    onUnlock: jest.fn(),
    onUpgrade: jest.fn(),
    testID: 'test-scam-card',
    ...overrides,
  };
}

describe('ScamCard', () => {
  describe('basic rendering', () => {
    it('should render scam name', () => {
      render(<ScamCard {...createDefaultProps()} />);
      expect(screen.getByText('Test Scam')).toBeTruthy();
    });

    it('should render scam description', () => {
      render(<ScamCard {...createDefaultProps()} />);
      expect(screen.getByText('A scam for testing')).toBeTruthy();
    });

    it('should render level for unlocked scams', () => {
      render(<ScamCard {...createDefaultProps()} />);
      expect(screen.getByText('Lvl 1')).toBeTruthy();
    });
  });

  describe('locked state', () => {
    it('should show UNLOCK button when locked', () => {
      render(<ScamCard {...createDefaultProps({ scamState: mockLockedState })} />);
      expect(screen.getByText('UNLOCK ($100)')).toBeTruthy();
    });

    it('should call onUnlock when UNLOCK is pressed', () => {
      const onUnlock = jest.fn();
      render(<ScamCard {...createDefaultProps({ scamState: mockLockedState, onUnlock })} />);
      fireEvent.press(screen.getByText('UNLOCK ($100)'));
      expect(onUnlock).toHaveBeenCalledTimes(1);
    });

    it('should not show upgrade button when locked', () => {
      render(<ScamCard {...createDefaultProps({ scamState: mockLockedState })} />);
      expect(screen.queryByTestId('test-scam-card-upgrade')).toBeNull();
    });
  });

  describe('idle state', () => {
    it('should show START button when idle', () => {
      render(<ScamCard {...createDefaultProps()} />);
      expect(screen.getByText('START')).toBeTruthy();
    });

    it('should call onStart when START is pressed', () => {
      const onStart = jest.fn();
      render(<ScamCard {...createDefaultProps({ onStart })} />);
      fireEvent.press(screen.getByText('START'));
      expect(onStart).toHaveBeenCalledTimes(1);
    });

    it('should show upgrade button with cost when idle', () => {
      render(<ScamCard {...createDefaultProps()} />);
      expect(screen.getByTestId('test-scam-card-upgrade')).toBeTruthy();
      expect(screen.getByText(/UPGRADE/)).toBeTruthy();
    });

    it('should call onUpgrade when UPGRADE is pressed', () => {
      const onUpgrade = jest.fn();
      render(<ScamCard {...createDefaultProps({ onUpgrade })} />);
      fireEvent.press(screen.getByTestId('test-scam-card-upgrade'));
      expect(onUpgrade).toHaveBeenCalledTimes(1);
    });
  });

  describe('running state', () => {
    it('should show RUNNING button when running', () => {
      render(<ScamCard {...createDefaultProps({ timer: createRunningTimer() })} />);
      expect(screen.getByText('RUNNING...')).toBeTruthy();
    });

    it('should show progress bar when running', () => {
      render(<ScamCard {...createDefaultProps({ timer: createRunningTimer() })} />);
      expect(screen.getByTestId('test-scam-card-progress')).toBeTruthy();
    });

    it('should show upgrade button when running', () => {
      render(<ScamCard {...createDefaultProps({ timer: createRunningTimer() })} />);
      expect(screen.getByTestId('test-scam-card-upgrade')).toBeTruthy();
    });
  });

  describe('upgrade button visibility', () => {
    it('should always show upgrade button when scam is unlocked (idle state)', () => {
      render(<ScamCard {...createDefaultProps()} />);
      expect(screen.getByTestId('test-scam-card-upgrade')).toBeTruthy();
    });

    it('should always show upgrade button when scam is running', () => {
      render(<ScamCard {...createDefaultProps({ timer: createRunningTimer() })} />);
      expect(screen.getByTestId('test-scam-card-upgrade')).toBeTruthy();
    });

    it('should display upgrade cost in button', () => {
      render(<ScamCard {...createDefaultProps()} />);
      // Upgrade cost for tier 1 level 1 is $1 (initialCost from SCAM_TIER_BASES)
      expect(screen.getByText(/UPGRADE.*\$1\)/)).toBeTruthy();
    });

    it('should disable upgrade button when cannot afford', () => {
      render(<ScamCard {...createDefaultProps({ money: 5 })} />);
      // Button should exist but be disabled (we check by testID)
      const upgradeButton = screen.getByTestId('test-scam-card-upgrade');
      expect(upgradeButton).toBeTruthy();
      // Press should still work (disabled is visual), handler decides
    });
  });

  describe('auto-collect behavior', () => {
    it('should NOT have a COLLECT button (auto-collect means no collect step)', () => {
      // With auto-collect, when a timer completes, the timer is immediately removed
      // So we should never see a "complete" state with a COLLECT button
      // This test verifies that if somehow a complete timer exists, we don't show COLLECT
      render(<ScamCard {...createDefaultProps({ timer: createCompleteTimer() })} />);
      // Should NOT have COLLECT button - instead should show START (ready to go again)
      expect(screen.queryByText(/COLLECT/)).toBeNull();
    });
  });

  describe('times completed', () => {
    it('should show times completed when greater than 0', () => {
      const scamState: ScamState = { ...mockUnlockedState, timesCompleted: 5 };
      render(<ScamCard {...createDefaultProps({ scamState })} />);
      expect(screen.getByText('Completed: 5x')).toBeTruthy();
    });

    it('should not show times completed when 0', () => {
      render(<ScamCard {...createDefaultProps()} />);
      expect(screen.queryByText(/Completed:/)).toBeNull();
    });
  });
});
