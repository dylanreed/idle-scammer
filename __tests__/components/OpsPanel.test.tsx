// ABOUTME: Tests for OpsPanel composition wrapper component
// ABOUTME: Verifies BotAssignmentPanel and ManagerPanel rendering with progressive disclosure

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
  collapsedTiers: new Set(),
  onToggleTier: jest.fn(),
  testID: 'ops-panel',
};

const prestigedProps: OpsPanelProps = {
  ...defaultProps,
  hasPrestiged: true,
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

  it('always contains ManagerPanel', () => {
    render(<OpsPanel {...defaultProps} />);
    const managerPanel = screen.getByTestId('manager-panel');
    expect(managerPanel).toBeTruthy();
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

  describe('pre-prestige visibility', () => {
    it('hides Bot Network section before first prestige', () => {
      render(<OpsPanel {...defaultProps} hasPrestiged={false} />);
      expect(screen.queryByTestId('ops-section-bots')).toBeNull();
      expect(screen.queryByTestId('bot-assignment-panel')).toBeNull();
    });

    it('hides Escape Plan before first prestige', () => {
      render(<OpsPanel {...defaultProps} hasPrestiged={false} />);
      expect(screen.queryByTestId('prestige-section')).toBeNull();
      expect(screen.queryByTestId('flee-button')).toBeNull();
    });

    it('still shows Managers section before first prestige', () => {
      render(<OpsPanel {...defaultProps} hasPrestiged={false} />);
      expect(screen.getByTestId('ops-section-managers')).toBeTruthy();
      expect(screen.getByTestId('manager-panel')).toBeTruthy();
    });
  });

  describe('post-prestige visibility', () => {
    it('contains BotAssignmentPanel after prestige', () => {
      render(<OpsPanel {...prestigedProps} />);
      const botPanel = screen.getByTestId('bot-assignment-panel');
      expect(botPanel).toBeTruthy();
    });

    it('BotAssignmentPanel appears before ManagerPanel in the tree', () => {
      const { toJSON } = render(<OpsPanel {...prestigedProps} />);
      const tree = JSON.stringify(toJSON());
      const botIndex = tree.indexOf('bot-assignment-panel');
      const managerIndex = tree.indexOf('manager-panel');
      expect(botIndex).toBeLessThan(managerIndex);
      expect(botIndex).toBeGreaterThan(-1);
      expect(managerIndex).toBeGreaterThan(-1);
    });

    it('shows Escape Plan after prestige', () => {
      render(<OpsPanel {...prestigedProps} />);
      expect(screen.getByTestId('prestige-section')).toBeTruthy();
      expect(screen.getByTestId('flee-button')).toBeTruthy();
    });
  });

  describe('voluntary prestige button', () => {
    it('renders a FLEE THE COUNTRY button when prestiged', () => {
      render(<OpsPanel {...prestigedProps} />);
      expect(screen.getByTestId('flee-button')).toBeTruthy();
      expect(screen.getByText('FLEE THE COUNTRY')).toBeTruthy();
    });

    it('calls onPrestige when pressed', () => {
      const mockOnPrestige = jest.fn();
      render(<OpsPanel {...prestigedProps} onPrestige={mockOnPrestige} />);

      fireEvent.press(screen.getByTestId('flee-button'));
      expect(mockOnPrestige).toHaveBeenCalledTimes(1);
    });
  });

  describe('collapsible sections', () => {
    it('renders BOT NETWORK section header with expand chevron', () => {
      render(<OpsPanel {...prestigedProps} />);
      const header = screen.getByTestId('ops-section-bots');
      expect(header).toBeTruthy();
      expect(screen.getByText(/▼.*BOT NETWORK/)).toBeTruthy();
    });

    it('renders MANAGERS section header with expand chevron', () => {
      render(<OpsPanel {...prestigedProps} />);
      const header = screen.getByTestId('ops-section-managers');
      expect(header).toBeTruthy();
      expect(screen.getByText(/▼.*MANAGERS/)).toBeTruthy();
    });

    it('hides BotAssignmentPanel when BOT NETWORK header is pressed', () => {
      render(<OpsPanel {...prestigedProps} />);

      // Initially visible
      expect(screen.getByTestId('bot-assignment-panel')).toBeTruthy();

      // Collapse
      fireEvent.press(screen.getByTestId('ops-section-bots'));
      expect(screen.queryByTestId('bot-assignment-panel')).toBeNull();

      // Header still visible with collapsed chevron
      expect(screen.getByText(/▶.*BOT NETWORK/)).toBeTruthy();
    });

    it('hides ManagerPanel when MANAGERS header is pressed', () => {
      render(<OpsPanel {...prestigedProps} />);

      // Initially visible
      expect(screen.getByTestId('manager-panel')).toBeTruthy();

      // Collapse
      fireEvent.press(screen.getByTestId('ops-section-managers'));
      expect(screen.queryByTestId('manager-panel')).toBeNull();

      // Header still visible with collapsed chevron
      expect(screen.getByText(/▶.*MANAGERS/)).toBeTruthy();
    });

    it('toggles back to expanded when pressed again', () => {
      render(<OpsPanel {...prestigedProps} />);

      // Collapse bots section
      fireEvent.press(screen.getByTestId('ops-section-bots'));
      expect(screen.queryByTestId('bot-assignment-panel')).toBeNull();

      // Expand again
      fireEvent.press(screen.getByTestId('ops-section-bots'));
      expect(screen.getByTestId('bot-assignment-panel')).toBeTruthy();
      expect(screen.getByText(/▼.*BOT NETWORK/)).toBeTruthy();
    });

    it('collapsing one section does not affect the other', () => {
      render(<OpsPanel {...prestigedProps} />);

      // Collapse only bots
      fireEvent.press(screen.getByTestId('ops-section-bots'));

      // Bots hidden, managers still visible
      expect(screen.queryByTestId('bot-assignment-panel')).toBeNull();
      expect(screen.getByTestId('manager-panel')).toBeTruthy();
    });

    it('ESCAPE PLAN section is visible when both collapsible sections are collapsed', () => {
      render(<OpsPanel {...prestigedProps} />);

      // Collapse both sections
      fireEvent.press(screen.getByTestId('ops-section-bots'));
      fireEvent.press(screen.getByTestId('ops-section-managers'));

      // Escape plan still visible
      expect(screen.getByTestId('flee-button')).toBeTruthy();
    });
  });
});
