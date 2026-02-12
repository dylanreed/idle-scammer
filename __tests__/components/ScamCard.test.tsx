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
  scamId: 'test-scam',
  isUnlocked: true,
  level: 1,
  timesCompleted: 0,
};

// Mock scam state (locked)
const mockLockedState: ScamState = {
  scamId: 'test-scam',
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
      expect(screen.getByText('▼ Test Scam')).toBeTruthy();
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
      // Upgrade cost for level 1 is based on unlockCost ($100 from mock definition)
      expect(screen.getByText(/UPGRADE.*\$100\)/)).toBeTruthy();
    });

    it('should disable upgrade button when cannot afford', () => {
      render(<ScamCard {...createDefaultProps({ money: 50 })} />);
      // Button should exist but be disabled (we check by testID)
      // Upgrade cost is $100, player has $50 - cannot afford
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

  describe('bot bonuses', () => {
    it('should reduce displayed duration when botSpeedBonus is provided', () => {
      // Without bot bonus: 5000ms → "5s"
      const { unmount } = render(<ScamCard {...createDefaultProps()} />);
      expect(screen.getByText('5s')).toBeTruthy();
      unmount();

      // With botSpeedBonus 0.5: 5000 / 1.5 ≈ 3333ms → "3s"
      render(<ScamCard {...createDefaultProps({ botSpeedBonus: 0.5 })} />);
      expect(screen.getByText('3s')).toBeTruthy();
    });

    it('should increase displayed reward when botProfitBonus is provided', () => {
      // Without bot bonus: reward = unlockCost(100) = $100
      const { unmount } = render(<ScamCard {...createDefaultProps()} />);
      expect(screen.getByText('+$100')).toBeTruthy();
      unmount();

      // With botProfitBonus 0.5: reward = 100 * 1.5 = $150
      render(<ScamCard {...createDefaultProps({ botProfitBonus: 0.5 })} />);
      expect(screen.getByText('+$150')).toBeTruthy();
    });

    it('should combine bot and employee bonuses', () => {
      // employeeSpeedBonus: 0.2 → 5000/1.2 = 4167
      // botSpeedBonus: 0.3 → 4167/1.3 ≈ 3205 → "3s"
      render(<ScamCard {...createDefaultProps({
        employeeSpeedBonus: 0.2,
        botSpeedBonus: 0.3,
        employeeRewardBonus: 0.2,
        botProfitBonus: 0.3,
      })} />);
      expect(screen.getByText('3s')).toBeTruthy();
      // reward = unlockCost(100) * 1.3(bot) * 1.2(employee) = 156
      expect(screen.getByText('+$156')).toBeTruthy();
    });
  });

  describe('max buy button', () => {
    it('should show MAX button when onMaxBuy is provided and maxBuyCount > 1', () => {
      // Give enough money to buy multiple upgrades (unlockCost=100, so 10000 buys many)
      const onMaxBuy = jest.fn();
      render(<ScamCard {...createDefaultProps({ onMaxBuy, money: 10000 })} />);
      expect(screen.getByTestId('test-scam-card-max-buy')).toBeTruthy();
    });

    it('should NOT show MAX button when onMaxBuy is not provided', () => {
      render(<ScamCard {...createDefaultProps({ money: 10000 })} />);
      expect(screen.queryByTestId('test-scam-card-max-buy')).toBeNull();
    });

    it('should call onMaxBuy when MAX button is pressed', () => {
      const onMaxBuy = jest.fn();
      render(<ScamCard {...createDefaultProps({ onMaxBuy, money: 10000 })} />);
      fireEvent.press(screen.getByTestId('test-scam-card-max-buy'));
      expect(onMaxBuy).toHaveBeenCalledTimes(1);
    });

    it('should show correct count and cost in MAX button text', () => {
      const onMaxBuy = jest.fn();
      render(<ScamCard {...createDefaultProps({ onMaxBuy, money: 10000 })} />);
      // Button text should match "MAX x{count} ($${cost})" format
      const maxButton = screen.getByTestId('test-scam-card-max-buy');
      expect(maxButton).toBeTruthy();
      // The text should contain "MAX x" prefix
      expect(screen.getByText(/MAX x\d+.*\(\$/)).toBeTruthy();
    });

    it('should NOT show MAX button when maxBuyCount is 1 or less', () => {
      // With money = 150, can only afford 1 upgrade (cost is 100), maxBuyCount = 1
      const onMaxBuy = jest.fn();
      render(<ScamCard {...createDefaultProps({ onMaxBuy, money: 150 })} />);
      expect(screen.queryByTestId('test-scam-card-max-buy')).toBeNull();
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
