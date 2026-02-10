// ABOUTME: Tests for employee hire section within ScamCard component
// ABOUTME: Validates employee display, hire button, cost, and bonus indicators

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ScamCard, ScamCardProps } from '../../src/components/ScamCard';
import type { ScamDefinition, ScamState } from '../../src/game/scams/types';
import type { EmployeeDefinition } from '../../src/game/employees/types';

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

const mockUnlockedState: ScamState = {
  scamId: 'test-scam',
  isUnlocked: true,
  level: 1,
  timesCompleted: 0,
};

const mockLockedState: ScamState = {
  scamId: 'test-scam',
  isUnlocked: false,
  level: 1,
  timesCompleted: 0,
};

const mockEmployee: EmployeeDefinition = {
  id: 'test-employee',
  name: 'Test Employee',
  scamId: 'test-scam',
  baseCost: 50,
  speedBoost: 0.02,
  rewardBoost: 0.08,
};

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

describe('ScamCard Employee Section', () => {
  describe('when employee props are provided on unlocked scam', () => {
    it('should show employee name', () => {
      render(
        <ScamCard
          {...createDefaultProps({
            employeeDefinition: mockEmployee,
            employeeCount: 0,
            employeeSpeedBonus: 0,
            employeeRewardBonus: 0,
            onHireEmployee: jest.fn(),
            employeeHireCost: 50,
          })}
        />
      );
      expect(screen.getByText(/Test Employee/)).toBeTruthy();
    });

    it('should show employee count', () => {
      render(
        <ScamCard
          {...createDefaultProps({
            employeeDefinition: mockEmployee,
            employeeCount: 3,
            employeeSpeedBonus: 0.06,
            employeeRewardBonus: 0.24,
            onHireEmployee: jest.fn(),
            employeeHireCost: 76,
          })}
        />
      );
      expect(screen.getByText(/x3/)).toBeTruthy();
    });

    it('should show HIRE button with cost', () => {
      render(
        <ScamCard
          {...createDefaultProps({
            employeeDefinition: mockEmployee,
            employeeCount: 0,
            employeeSpeedBonus: 0,
            employeeRewardBonus: 0,
            onHireEmployee: jest.fn(),
            employeeHireCost: 50,
          })}
        />
      );
      expect(screen.getByText(/HIRE.*\$50/)).toBeTruthy();
    });

    it('should fire onHireEmployee callback when HIRE is pressed', () => {
      const onHireEmployee = jest.fn();
      render(
        <ScamCard
          {...createDefaultProps({
            employeeDefinition: mockEmployee,
            employeeCount: 0,
            employeeSpeedBonus: 0,
            employeeRewardBonus: 0,
            onHireEmployee,
            employeeHireCost: 50,
          })}
        />
      );
      fireEvent.press(screen.getByTestId('test-scam-card-hire-employee'));
      expect(onHireEmployee).toHaveBeenCalledTimes(1);
    });

    it('should show bonus percentages when employees are hired', () => {
      render(
        <ScamCard
          {...createDefaultProps({
            employeeDefinition: mockEmployee,
            employeeCount: 3,
            employeeSpeedBonus: 0.06,
            employeeRewardBonus: 0.24,
            onHireEmployee: jest.fn(),
            employeeHireCost: 76,
          })}
        />
      );
      // Speed +6% and Reward +24%
      expect(screen.getByText(/Speed \+6%/)).toBeTruthy();
      expect(screen.getByText(/Reward \+24%/)).toBeTruthy();
    });
  });

  describe('when scam is locked', () => {
    it('should not show employee section', () => {
      render(
        <ScamCard
          {...createDefaultProps({
            scamState: mockLockedState,
            employeeDefinition: mockEmployee,
            employeeCount: 0,
            employeeSpeedBonus: 0,
            employeeRewardBonus: 0,
            onHireEmployee: jest.fn(),
            employeeHireCost: 50,
          })}
        />
      );
      expect(screen.queryByText(/Test Employee/)).toBeNull();
      expect(screen.queryByTestId('test-scam-card-hire-employee')).toBeNull();
    });
  });

  describe('when no employee props are provided', () => {
    it('should not show employee section', () => {
      render(<ScamCard {...createDefaultProps()} />);
      expect(screen.queryByTestId('test-scam-card-hire-employee')).toBeNull();
    });
  });

  describe('hire button affordability', () => {
    it('should disable HIRE button when player cannot afford', () => {
      render(
        <ScamCard
          {...createDefaultProps({
            money: 30,
            employeeDefinition: mockEmployee,
            employeeCount: 0,
            employeeSpeedBonus: 0,
            employeeRewardBonus: 0,
            onHireEmployee: jest.fn(),
            employeeHireCost: 50,
          })}
        />
      );
      const hireButton = screen.getByTestId('test-scam-card-hire-employee');
      expect(hireButton).toBeTruthy();
      // The button should be rendered but disabled
      expect(hireButton.props.accessibilityState?.disabled ?? false).toBe(true);
    });
  });
});
