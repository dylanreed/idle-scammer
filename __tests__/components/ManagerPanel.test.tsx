// ABOUTME: Tests for the ManagerPanel component extracted from GameScreen
// ABOUTME: Verifies tier-grouped manager display, hire actions, locked/hired states, and portraits

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ManagerPanel } from '../../src/components/ManagerPanel';
import type { GameResources } from '../../src/game/types';
import type { ScamState } from '../../src/game/scams/types';

// --- Mocks ---

jest.mock('../../src/game/managers/definitions', () => ({
  ALL_MANAGERS: [
    { id: 'mgr-1', name: 'Test Manager 1', scamId: 'scam-1', cost: 100, flavorText: 'A manager' },
    { id: 'mgr-2', name: 'Test Manager 2', scamId: 'scam-2', cost: 500, flavorText: 'Another manager' },
    { id: 'mgr-3', name: 'Test Manager 3', scamId: 'scam-3', cost: 1000, flavorText: 'Tier 2 manager' },
  ],
  getManagerByScamId: jest.fn(),
}));

jest.mock('../../src/game/employees/calculations', () => ({
  getManagerCostForScam: jest.fn((scamId: string) => {
    if (scamId === 'scam-1') return 100;
    if (scamId === 'scam-2') return 500;
    if (scamId === 'scam-3') return 1000;
    return 50;
  }),
  getUnlockCostForScam: jest.fn(),
  getEmployeeCostForScam: jest.fn(),
  canHireEmployee: jest.fn(),
  getMaxEmployeesPerType: jest.fn(),
  calculateEmployeeHeat: jest.fn(),
}));

jest.mock('../../src/game/assets', () => ({
  getManagerPortrait: jest.fn((managerId: string) => {
    if (managerId === 'mgr-1') return { uri: 'portrait-1.png' };
    return null;
  }),
}));

jest.mock('../../src/game/prestige/calculations', () => ({
  isTierAccessible: jest.fn((tier: number, _trust: number) => tier === 1),
}));

jest.mock('../../src/game/scams/definitions', () => ({
  TIER_1_SCAMS: [
    { id: 'scam-1', name: 'Scam One', tier: 1, baseDuration: 5000, baseReward: 10, resourceType: 'money', description: 'First scam' },
    { id: 'scam-2', name: 'Scam Two', tier: 1, baseDuration: 5000, baseReward: 20, resourceType: 'money', description: 'Second scam', unlockCost: 100 },
  ],
  ALL_SCAMS: [],
}));

jest.mock('../../src/game/scams/tier2', () => ({
  TIER_2_SCAMS: [
    { id: 'scam-3', name: 'Scam Three', tier: 2, baseDuration: 5000, baseReward: 100, resourceType: 'money', description: 'Third scam' },
  ],
}));

jest.mock('../../src/game/scams/tier3', () => ({
  TIER_3_SCAMS: [],
}));

jest.mock('../../src/game/scams/tier4', () => ({
  TIER_4_SCAMS: [],
}));

jest.mock('../../src/game/scams/tier5', () => ({
  TIER_5_SCAMS: [],
}));

// --- Test Helpers ---

function createResources(overrides: Partial<GameResources> = {}): GameResources {
  return {
    money: 1000,
    reputation: 0,
    heat: 0,
    bots: 0,
    skillPoints: 0,
    crypto: 0,
    trust: 1,
    snitchCount: 0,
    ...overrides,
  };
}

function createScamStates(overrides: Record<string, Partial<ScamState>> = {}): Record<string, ScamState> {
  const defaults: Record<string, ScamState> = {
    'scam-1': { scamId: 'scam-1', level: 1, isUnlocked: true, timesCompleted: 0 },
    'scam-2': { scamId: 'scam-2', level: 1, isUnlocked: true, timesCompleted: 0 },
    'scam-3': { scamId: 'scam-3', level: 1, isUnlocked: true, timesCompleted: 0 },
  };
  for (const [key, value] of Object.entries(overrides)) {
    defaults[key] = { ...defaults[key], ...value };
  }
  return defaults;
}

describe('ManagerPanel', () => {
  const defaultOnHireManager = jest.fn();
  const defaultIsManagerHired = jest.fn((_id: string) => false);

  beforeEach(() => {
    jest.clearAllMocks();
    defaultOnHireManager.mockClear();
    defaultIsManagerHired.mockClear();
    defaultIsManagerHired.mockReturnValue(false);
  });

  describe('tier headers', () => {
    it('renders tier headers for accessible tiers', () => {
      render(
        <ManagerPanel
          resources={createResources()}
          scams={createScamStates()}
          isManagerHired={defaultIsManagerHired}
          onHireManager={defaultOnHireManager}
          testID="manager-panel"
        />
      );

      expect(screen.getByText(/TIER 1 MANAGERS/)).toBeTruthy();
    });

    it('does not render managers for inaccessible tiers', () => {
      render(
        <ManagerPanel
          resources={createResources()}
          scams={createScamStates()}
          isManagerHired={defaultIsManagerHired}
          onHireManager={defaultOnHireManager}
        />
      );

      // Tier 2 is not accessible (isTierAccessible returns false for tier !== 1)
      expect(screen.queryByText(/TIER 2 MANAGERS/)).toBeNull();
    });
  });

  describe('description text', () => {
    it('shows "Managers automate your scams" description text', () => {
      render(
        <ManagerPanel
          resources={createResources()}
          scams={createScamStates()}
          isManagerHired={defaultIsManagerHired}
          onHireManager={defaultOnHireManager}
        />
      );

      expect(screen.getByText('Managers automate your scams')).toBeTruthy();
    });
  });

  describe('manager rows', () => {
    it('renders manager rows with name, cost, and HIRE button', () => {
      render(
        <ManagerPanel
          resources={createResources({ money: 1000 })}
          scams={createScamStates()}
          isManagerHired={defaultIsManagerHired}
          onHireManager={defaultOnHireManager}
        />
      );

      expect(screen.getByText('Test Manager 1')).toBeTruthy();
      expect(screen.getByText('$100')).toBeTruthy();
      expect(screen.getByText('Test Manager 2')).toBeTruthy();
      expect(screen.getByText('$500')).toBeTruthy();
      expect(screen.getAllByText('HIRE').length).toBe(2);
    });

    it('shows "✓ HIRED" for already-hired managers', () => {
      defaultIsManagerHired.mockImplementation((id) => id === 'mgr-1');

      render(
        <ManagerPanel
          resources={createResources()}
          scams={createScamStates()}
          isManagerHired={defaultIsManagerHired}
          onHireManager={defaultOnHireManager}
        />
      );

      expect(screen.getByText('✓ HIRED')).toBeTruthy();
      // mgr-2 should still show cost
      expect(screen.getByText('$500')).toBeTruthy();
    });

    it('shows "LOCKED" for managers whose scam is not unlocked', () => {
      render(
        <ManagerPanel
          resources={createResources()}
          scams={createScamStates({ 'scam-2': { isUnlocked: false } })}
          isManagerHired={defaultIsManagerHired}
          onHireManager={defaultOnHireManager}
        />
      );

      expect(screen.getByText('LOCKED')).toBeTruthy();
    });
  });

  describe('HIRE button behavior', () => {
    it('HIRE button is disabled when player cannot afford', () => {
      render(
        <ManagerPanel
          resources={createResources({ money: 50 })}
          scams={createScamStates()}
          isManagerHired={defaultIsManagerHired}
          onHireManager={defaultOnHireManager}
        />
      );

      // Both managers cost more than 50, so both HIRE buttons should be disabled
      const hireButtons = screen.getAllByText('HIRE');
      hireButtons.forEach((button) => {
        // PixelButton renders as Pressable; find the ancestor with accessibilityState
        const pressable = button.parent?.parent;
        expect(pressable?.props?.accessibilityState?.disabled).toBe(true);
      });
    });

    it('calls onHireManager with correct args (managerId, cost, scamId)', () => {
      render(
        <ManagerPanel
          resources={createResources({ money: 1000 })}
          scams={createScamStates()}
          isManagerHired={defaultIsManagerHired}
          onHireManager={defaultOnHireManager}
        />
      );

      const hireButtons = screen.getAllByText('HIRE');
      fireEvent.press(hireButtons[0]);
      expect(defaultOnHireManager).toHaveBeenCalledWith('mgr-1', 100, 'scam-1');
    });
  });

  describe('manager portraits', () => {
    it('renders manager portraits when available', () => {
      render(
        <ManagerPanel
          resources={createResources()}
          scams={createScamStates()}
          isManagerHired={defaultIsManagerHired}
          onHireManager={defaultOnHireManager}
          testID="manager-panel"
        />
      );

      // mgr-1 has a portrait, mgr-2 does not
      const images = screen.getAllByTestId('manager-portrait');
      expect(images.length).toBe(1);
    });
  });

  describe('collapsible tier headers', () => {
    it('shows expanded chevron on tier header by default', () => {
      render(
        <ManagerPanel
          resources={createResources()}
          scams={createScamStates()}
          isManagerHired={defaultIsManagerHired}
          onHireManager={defaultOnHireManager}
        />
      );

      expect(screen.getByText(/▼.*TIER 1 MANAGERS/)).toBeTruthy();
    });

    it('shows collapsed chevron when tier is in collapsedTiers set', () => {
      render(
        <ManagerPanel
          resources={createResources()}
          scams={createScamStates()}
          isManagerHired={defaultIsManagerHired}
          onHireManager={defaultOnHireManager}
          collapsedTiers={new Set([1] as const)}
        />
      );

      expect(screen.getByText(/▶.*TIER 1 MANAGERS/)).toBeTruthy();
    });

    it('hides manager rows when tier is collapsed', () => {
      render(
        <ManagerPanel
          resources={createResources()}
          scams={createScamStates()}
          isManagerHired={defaultIsManagerHired}
          onHireManager={defaultOnHireManager}
          collapsedTiers={new Set([1] as const)}
        />
      );

      // Manager names should be hidden
      expect(screen.queryByText('Test Manager 1')).toBeNull();
      expect(screen.queryByText('Test Manager 2')).toBeNull();
    });

    it('shows manager rows when tier is expanded', () => {
      render(
        <ManagerPanel
          resources={createResources()}
          scams={createScamStates()}
          isManagerHired={defaultIsManagerHired}
          onHireManager={defaultOnHireManager}
          collapsedTiers={new Set()}
        />
      );

      expect(screen.getByText('Test Manager 1')).toBeTruthy();
      expect(screen.getByText('Test Manager 2')).toBeTruthy();
    });

    it('calls onToggleTier when tier header is pressed', () => {
      const onToggleTier = jest.fn();
      render(
        <ManagerPanel
          resources={createResources()}
          scams={createScamStates()}
          isManagerHired={defaultIsManagerHired}
          onHireManager={defaultOnHireManager}
          onToggleTier={onToggleTier}
        />
      );

      fireEvent.press(screen.getByTestId('manager-tier-header-1'));
      expect(onToggleTier).toHaveBeenCalledWith(1);
    });

    it('tier header has testID for testing', () => {
      render(
        <ManagerPanel
          resources={createResources()}
          scams={createScamStates()}
          isManagerHired={defaultIsManagerHired}
          onHireManager={defaultOnHireManager}
        />
      );

      expect(screen.getByTestId('manager-tier-header-1')).toBeTruthy();
    });
  });
});
