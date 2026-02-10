// ABOUTME: Tests for OpsPanel composition wrapper component
// ABOUTME: Verifies BotAssignmentPanel and ManagerPanel are rendered in correct order within ScrollView

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { OpsPanel } from '../../src/components/OpsPanel';
import type { OpsPanelProps } from '../../src/components/OpsPanel';
import type { GameResources } from '../../src/game/types';

// Mock BotAssignmentPanel as a simple stub since OpsPanel is just a composition wrapper
jest.mock('../../src/components/BotAssignmentPanel', () => ({
  BotAssignmentPanel: (props: any) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: 'bot-assignment-panel' });
  },
}));

// Mock ManagerPanel as a simple stub since OpsPanel is just a composition wrapper
jest.mock('../../src/components/ManagerPanel', () => ({
  ManagerPanel: (props: any) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, {
      testID: 'manager-panel',
      // Stash props so we can verify they were passed through
      accessibilityHint: JSON.stringify({
        hasResources: !!props.resources,
        hasScams: !!props.scams,
        hasIsManagerHired: typeof props.isManagerHired === 'function',
        hasOnHireManager: typeof props.onHireManager === 'function',
      }),
    });
  },
}));

const makeResources = (overrides: Partial<GameResources> = {}): GameResources => ({
  money: 1000,
  reputation: 10,
  heat: 0,
  bots: 5,
  skillPoints: 0,
  crypto: 0,
  trust: 1,
  snitchCount: 0,
  ...overrides,
});

const defaultProps: OpsPanelProps = {
  resources: makeResources(),
  scams: {},
  isManagerHired: jest.fn(() => false),
  onHireManager: jest.fn(),
  onPrestige: jest.fn(),
  testID: 'ops-panel',
};

describe('OpsPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a ScrollView wrapper', () => {
    render(<OpsPanel {...defaultProps} />);
    const scrollView = screen.getByTestId('ops-panel');
    expect(scrollView).toBeTruthy();
  });

  it('contains BotAssignmentPanel', () => {
    render(<OpsPanel {...defaultProps} />);
    const botPanel = screen.getByTestId('bot-assignment-panel');
    expect(botPanel).toBeTruthy();
  });

  it('contains ManagerPanel', () => {
    render(<OpsPanel {...defaultProps} />);
    const managerPanel = screen.getByTestId('manager-panel');
    expect(managerPanel).toBeTruthy();
  });

  it('BotAssignmentPanel appears before ManagerPanel in the tree', () => {
    const { toJSON } = render(<OpsPanel {...defaultProps} />);
    const tree = JSON.stringify(toJSON());
    const botIndex = tree.indexOf('bot-assignment-panel');
    const managerIndex = tree.indexOf('manager-panel');
    expect(botIndex).toBeLessThan(managerIndex);
    expect(botIndex).toBeGreaterThan(-1);
    expect(managerIndex).toBeGreaterThan(-1);
  });

  it('passes resources, scams, isManagerHired, onHireManager to ManagerPanel', () => {
    render(<OpsPanel {...defaultProps} />);
    const managerPanel = screen.getByTestId('manager-panel');
    const passedProps = JSON.parse(managerPanel.props.accessibilityHint);
    expect(passedProps.hasResources).toBe(true);
    expect(passedProps.hasScams).toBe(true);
    expect(passedProps.hasIsManagerHired).toBe(true);
    expect(passedProps.hasOnHireManager).toBe(true);
  });

  it('has nestedScrollEnabled for Android support', () => {
    const { toJSON } = render(<OpsPanel {...defaultProps} />);
    const tree = toJSON() as any;
    // The root element should be a ScrollView with nestedScrollEnabled
    expect(tree.props.nestedScrollEnabled).toBe(true);
  });

  describe('voluntary prestige button', () => {
    it('renders a FLEE THE COUNTRY button', () => {
      render(<OpsPanel {...defaultProps} />);
      expect(screen.getByTestId('flee-button')).toBeTruthy();
      expect(screen.getByText('FLEE THE COUNTRY')).toBeTruthy();
    });

    it('calls onPrestige when pressed', () => {
      const mockOnPrestige = jest.fn();
      render(<OpsPanel {...defaultProps} onPrestige={mockOnPrestige} />);

      fireEvent.press(screen.getByTestId('flee-button'));
      expect(mockOnPrestige).toHaveBeenCalledTimes(1);
    });
  });
});
