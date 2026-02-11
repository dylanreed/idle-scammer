// ABOUTME: Tests for ScamListPanel component that renders tier-grouped scam cards
// ABOUTME: Verifies tier accessibility filtering, scam visibility logic, and callback propagation

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ScamListPanel } from '../../src/components/ScamListPanel';
import type { ScamListPanelProps } from '../../src/components/ScamListPanel';
import type { ScamDefinition } from '../../src/game/scams/types';
import type { ScamState } from '../../src/game/scams/types';
import type { ScamTimer } from '../../src/game/engine/types';
import type { GameResources } from '../../src/game/types';

// Mock isTierAccessible from prestige calculations
jest.mock('../../src/game/prestige/calculations', () => ({
  isTierAccessible: jest.fn(),
}));

// Mock isTierFullyUnlocked from scam calculations
jest.mock('../../src/game/scams/calculations', () => ({
  isTierFullyUnlocked: jest.fn(),
}));

// Mock employee calculations
jest.mock('../../src/game/employees/calculations', () => ({
  getUnlockCostForScam: jest.fn(),
  getManagerCostForScam: jest.fn(),
  getEmployeeCostForScam: jest.fn(() => 100),
  getMaxEmployeesPerType: jest.fn(() => 3),
}));

// Mock manager definitions
jest.mock('../../src/game/managers/definitions', () => ({
  getManagerByScamId: jest.fn(),
}));

// Mock employee definitions
jest.mock('../../src/game/employees/definitions', () => ({
  getEmployeesByScamId: jest.fn(() => []),
}));

// Mock manager store
jest.mock('../../src/game/managers/managerStore', () => ({
  useManagerStore: jest.fn((selector: any) => {
    if (typeof selector === 'function') {
      return selector({
        isManagerHired: jest.fn(() => false),
      });
    }
    return { isManagerHired: jest.fn(() => false) };
  }),
}));

// Mock employee store
jest.mock('../../src/game/employees/employeeStore', () => {
  const mockGetScamBonuses = jest.fn(() => ({ speedBonus: 0, rewardBonus: 0 }));
  const mockGetEmployeeCount = jest.fn(() => 0);
  return {
    useEmployeeStore: Object.assign(
      jest.fn((selector: any) => {
        if (typeof selector === 'function') {
          return selector({
            employees: {},
            getScamBonuses: mockGetScamBonuses,
            getEmployeeCount: mockGetEmployeeCount,
          });
        }
        return { employees: {} };
      }),
      {
        getState: jest.fn(() => ({
          getScamBonuses: mockGetScamBonuses,
          getEmployeeCount: mockGetEmployeeCount,
        })),
      }
    ),
  };
});

// Mock bot store
jest.mock('../../src/game/bots/botStore', () => {
  const mockGetScamBotBonuses = jest.fn(() => ({ speedBonus: 0, profitBonus: 0 }));
  return {
    useBotStore: Object.assign(
      jest.fn((selector: any) => {
        if (typeof selector === 'function') {
          return selector({
            getScamBotBonuses: mockGetScamBotBonuses,
          });
        }
        return {};
      }),
      {
        getState: jest.fn(() => ({
          getScamBotBonuses: mockGetScamBotBonuses,
        })),
      }
    ),
  };
});

// Mock ScamCard to keep tests focused on panel logic
jest.mock('../../src/components/ScamCard', () => ({
  ScamCard: ({ testID, onStart, onUnlock, onUpgrade, botSpeedBonus, botProfitBonus }: any) => {
    const React = require('react');
    const { View, Pressable, Text } = require('react-native');
    return React.createElement(View, { testID },
      React.createElement(Pressable, { testID: `${testID}-start`, onPress: onStart }),
      React.createElement(Pressable, { testID: `${testID}-unlock`, onPress: onUnlock }),
      React.createElement(Pressable, { testID: `${testID}-upgrade`, onPress: onUpgrade }),
      botSpeedBonus !== undefined && React.createElement(Text, { testID: `${testID}-bot-speed` }, String(botSpeedBonus)),
      botProfitBonus !== undefined && React.createElement(Text, { testID: `${testID}-bot-profit` }, String(botProfitBonus)),
    );
  },
}));

// Mock scam tier imports — data must be inside factories because jest.mock is hoisted
jest.mock('../../src/game/scams/definitions', () => ({
  TIER_1_SCAMS: [
    {
      id: 'scam-a',
      name: 'Scam A',
      tier: 1,
      baseDuration: 5000,
      baseReward: 10,
      resourceType: 'money',
      description: 'First scam',
      unlockCost: undefined,
    },
    {
      id: 'scam-b',
      name: 'Scam B',
      tier: 1,
      baseDuration: 10000,
      baseReward: 100,
      resourceType: 'money',
      description: 'Second scam',
      unlockCost: 500,
    },
    {
      id: 'scam-c',
      name: 'Scam C',
      tier: 1,
      baseDuration: 15000,
      baseReward: 1000,
      resourceType: 'money',
      description: 'Third scam',
      unlockCost: 5000,
    },
  ],
}));

jest.mock('../../src/game/scams/tier2', () => ({
  TIER_2_SCAMS: [
    {
      id: 'scam-d',
      name: 'Scam D',
      tier: 2,
      baseDuration: 20000,
      baseReward: 5000,
      resourceType: 'money',
      description: 'Tier 2 scam',
      unlockCost: 10000,
    },
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

// Convenience references to mock scam data for use in test helpers
const mockTier1Scams: ScamDefinition[] = [
  {
    id: 'scam-a',
    name: 'Scam A',
    tier: 1,
    baseDuration: 5000,
    baseReward: 10,
    resourceType: 'money',
    description: 'First scam',
    unlockCost: undefined,
  },
  {
    id: 'scam-b',
    name: 'Scam B',
    tier: 1,
    baseDuration: 10000,
    baseReward: 100,
    resourceType: 'money',
    description: 'Second scam',
    unlockCost: 500,
  },
  {
    id: 'scam-c',
    name: 'Scam C',
    tier: 1,
    baseDuration: 15000,
    baseReward: 1000,
    resourceType: 'money',
    description: 'Third scam',
    unlockCost: 5000,
  },
];

const mockTier2Scams: ScamDefinition[] = [
  {
    id: 'scam-d',
    name: 'Scam D',
    tier: 2,
    baseDuration: 20000,
    baseReward: 5000,
    resourceType: 'money',
    description: 'Tier 2 scam',
    unlockCost: 10000,
  },
];

// Import mocked modules for per-test control
import { isTierAccessible } from '../../src/game/prestige/calculations';
import { getUnlockCostForScam } from '../../src/game/employees/calculations';
import { getManagerByScamId } from '../../src/game/managers/definitions';
import { getEmployeesByScamId } from '../../src/game/employees/definitions';
import { useBotStore } from '../../src/game/bots/botStore';
import { isTierFullyUnlocked } from '../../src/game/scams/calculations';

const mockIsTierAccessible = isTierAccessible as jest.MockedFunction<typeof isTierAccessible>;
const mockGetUnlockCostForScam = getUnlockCostForScam as jest.MockedFunction<typeof getUnlockCostForScam>;
const mockGetManagerByScamId = getManagerByScamId as jest.MockedFunction<typeof getManagerByScamId>;
const mockGetEmployeesByScamId = getEmployeesByScamId as jest.MockedFunction<typeof getEmployeesByScamId>;
const mockIsTierFullyUnlocked = isTierFullyUnlocked as jest.MockedFunction<typeof isTierFullyUnlocked>;

/**
 * Default game resources for testing
 */
function createDefaultResources(overrides: Partial<GameResources> = {}): GameResources {
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

/**
 * Default props for ScamListPanel
 */
function createDefaultProps(overrides: Partial<ScamListPanelProps> = {}): ScamListPanelProps {
  return {
    resources: createDefaultResources(),
    scams: {
      'scam-a': { scamId: 'scam-a', level: 1, isUnlocked: true, timesCompleted: 0 },
    },
    timerMap: {},
    nextGoalScamId: undefined,
    onStart: jest.fn(),
    onUnlock: jest.fn(),
    onUpgrade: jest.fn(),
    onMaxBuy: jest.fn(),
    onHireEmployee: jest.fn(),
    collapsedTiers: new Set(),
    onToggleTier: jest.fn(),
    testID: 'scam-list-panel',
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();

  // Default: tier 1 accessible, tier 2-5 not accessible
  mockIsTierAccessible.mockImplementation((tier) => tier === 1);

  // Default: return static unlock costs from definitions
  mockGetUnlockCostForScam.mockImplementation((scamId: string) => {
    const scam = [...mockTier1Scams, ...mockTier2Scams].find((s) => s.id === scamId);
    return scam?.unlockCost;
  });

  // Default: all tiers are fully unlocked (so existing tests aren't affected by lock gating)
  mockIsTierFullyUnlocked.mockReturnValue(true);

  // Default: no managers
  mockGetManagerByScamId.mockReturnValue(undefined);

  // Default: no employees
  mockGetEmployeesByScamId.mockReturnValue([]);
});

describe('ScamListPanel', () => {
  describe('tier headers', () => {
    it('should render tier header for accessible tiers', () => {
      render(<ScamListPanel {...createDefaultProps()} />);
      expect(screen.getByText(/TIER 1: SMALL TIME/)).toBeTruthy();
    });

    it('should NOT render tier header for inaccessible tiers', () => {
      render(<ScamListPanel {...createDefaultProps()} />);
      expect(screen.queryByText(/TIER 2: GETTING SERIOUS/)).toBeNull();
    });

    it('should render multiple tier headers when multiple tiers are accessible', () => {
      mockIsTierAccessible.mockImplementation((tier) => tier <= 2);
      const props = createDefaultProps({
        resources: createDefaultResources({ trust: 5 }),
        scams: {
          'scam-a': { scamId: 'scam-a', level: 1, isUnlocked: true, timesCompleted: 0 },
          'scam-d': { scamId: 'scam-d', level: 1, isUnlocked: true, timesCompleted: 0 },
        },
      });
      render(<ScamListPanel {...props} />);
      expect(screen.getByText(/TIER 1: SMALL TIME/)).toBeTruthy();
      expect(screen.getByText(/TIER 2: GETTING SERIOUS/)).toBeTruthy();
    });
  });

  describe('scam card rendering', () => {
    it('should render ScamCard for each visible scam', () => {
      render(<ScamListPanel {...createDefaultProps()} />);
      // scam-a is unlocked, so should be visible
      expect(screen.getByTestId('scam-card-scam-a')).toBeTruthy();
    });

    it('should render unlocked scams', () => {
      const props = createDefaultProps({
        scams: {
          'scam-a': { scamId: 'scam-a', level: 3, isUnlocked: true, timesCompleted: 10 },
          'scam-b': { scamId: 'scam-b', level: 2, isUnlocked: true, timesCompleted: 5 },
        },
      });
      render(<ScamListPanel {...props} />);
      expect(screen.getByTestId('scam-card-scam-a')).toBeTruthy();
      expect(screen.getByTestId('scam-card-scam-b')).toBeTruthy();
    });
  });

  describe('scam visibility filtering', () => {
    it('should show unlocked scams', () => {
      const props = createDefaultProps({
        scams: {
          'scam-a': { scamId: 'scam-a', level: 1, isUnlocked: true, timesCompleted: 0 },
        },
      });
      render(<ScamListPanel {...props} />);
      expect(screen.getByTestId('scam-card-scam-a')).toBeTruthy();
    });

    it('should show scams affordable to unlock', () => {
      mockGetUnlockCostForScam.mockImplementation((scamId: string) => {
        if (scamId === 'scam-b') return 500;
        return mockTier1Scams.find((s) => s.id === scamId)?.unlockCost;
      });
      const props = createDefaultProps({
        resources: createDefaultResources({ money: 600 }),
        scams: {},
      });
      render(<ScamListPanel {...props} />);
      // scam-a is free (undefined cost), should show
      expect(screen.getByTestId('scam-card-scam-a')).toBeTruthy();
      // scam-b costs 500, player has 600, should show
      expect(screen.getByTestId('scam-card-scam-b')).toBeTruthy();
    });

    it('should show the nextGoalScamId even if not affordable', () => {
      mockGetUnlockCostForScam.mockImplementation((scamId: string) => {
        if (scamId === 'scam-c') return 5000;
        return mockTier1Scams.find((s) => s.id === scamId)?.unlockCost;
      });
      const props = createDefaultProps({
        resources: createDefaultResources({ money: 100 }),
        scams: {},
        nextGoalScamId: 'scam-c',
      });
      render(<ScamListPanel {...props} />);
      // scam-c costs 5000, player has 100, but it's the goal scam
      expect(screen.getByTestId('scam-card-scam-c')).toBeTruthy();
    });

    it('should NOT show locked, unaffordable, non-goal scams', () => {
      mockGetUnlockCostForScam.mockImplementation((scamId: string) => {
        if (scamId === 'scam-c') return 5000;
        return mockTier1Scams.find((s) => s.id === scamId)?.unlockCost;
      });
      const props = createDefaultProps({
        resources: createDefaultResources({ money: 100 }),
        scams: {},
        nextGoalScamId: undefined,
      });
      render(<ScamListPanel {...props} />);
      // scam-c costs 5000, player has 100, no goal => hidden
      expect(screen.queryByTestId('scam-card-scam-c')).toBeNull();
    });

    it('should show scams with no unlock cost (free scams)', () => {
      // scam-a has unlockCost: undefined in definition
      mockGetUnlockCostForScam.mockImplementation(() => undefined);
      const props = createDefaultProps({
        scams: {},
      });
      render(<ScamListPanel {...props} />);
      // Free scams always show (dynamicCost === undefined => visible)
      expect(screen.getByTestId('scam-card-scam-a')).toBeTruthy();
    });
  });

  describe('callbacks', () => {
    it('should call onStart when ScamCard start is pressed', () => {
      const onStart = jest.fn();
      const props = createDefaultProps({ onStart });
      render(<ScamListPanel {...props} />);
      fireEvent.press(screen.getByTestId('scam-card-scam-a-start'));
      expect(onStart).toHaveBeenCalledWith('scam-a');
    });

    it('should call onUnlock when ScamCard unlock is pressed', () => {
      const onUnlock = jest.fn();
      const props = createDefaultProps({ onUnlock });
      render(<ScamListPanel {...props} />);
      fireEvent.press(screen.getByTestId('scam-card-scam-a-unlock'));
      expect(onUnlock).toHaveBeenCalledWith('scam-a');
    });

    it('should call onUpgrade when ScamCard upgrade is pressed', () => {
      const onUpgrade = jest.fn();
      const props = createDefaultProps({ onUpgrade });
      render(<ScamListPanel {...props} />);
      fireEvent.press(screen.getByTestId('scam-card-scam-a-upgrade'));
      expect(onUpgrade).toHaveBeenCalledWith('scam-a');
    });
  });

  describe('ScrollView', () => {
    it('should have a ScrollView wrapper', () => {
      const { UNSAFE_getByType } = render(<ScamListPanel {...createDefaultProps()} />);
      const { ScrollView } = require('react-native');
      const scrollView = UNSAFE_getByType(ScrollView);
      expect(scrollView).toBeTruthy();
    });
  });

  describe('inaccessible tiers', () => {
    it('should not render any scam cards for inaccessible tiers', () => {
      // All tiers inaccessible
      mockIsTierAccessible.mockReturnValue(false);
      render(<ScamListPanel {...createDefaultProps()} />);
      expect(screen.queryByTestId('scam-card-scam-a')).toBeNull();
      expect(screen.queryByTestId('scam-card-scam-d')).toBeNull();
    });

    it('should only call isTierAccessible with the trust from resources', () => {
      const props = createDefaultProps({
        resources: createDefaultResources({ trust: 7 }),
      });
      render(<ScamListPanel {...props} />);
      // isTierAccessible should be called with trust value for each tier
      expect(mockIsTierAccessible).toHaveBeenCalledWith(1, 7);
      expect(mockIsTierAccessible).toHaveBeenCalledWith(2, 7);
      expect(mockIsTierAccessible).toHaveBeenCalledWith(3, 7);
      expect(mockIsTierAccessible).toHaveBeenCalledWith(4, 7);
      expect(mockIsTierAccessible).toHaveBeenCalledWith(5, 7);
    });
  });

  describe('bot bonus props', () => {
    afterEach(() => {
      // Restore default bot store mock after each test in this block
      const defaultGetScamBotBonuses = jest.fn(() => ({ speedBonus: 0, profitBonus: 0 }));
      (useBotStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          return selector({ getScamBotBonuses: defaultGetScamBotBonuses });
        }
        return {};
      });
      (useBotStore.getState as jest.Mock).mockReturnValue({
        getScamBotBonuses: defaultGetScamBotBonuses,
      });
    });

    it('should pass bot bonuses from useBotStore to ScamCard', () => {
      // Override bot store to return bonuses for scam-a
      const mockGetScamBotBonuses = jest.fn((scamId: string) => {
        if (scamId === 'scam-a') return { speedBonus: 0.3, profitBonus: 0.2 };
        return { speedBonus: 0, profitBonus: 0 };
      });
      (useBotStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          return selector({ getScamBotBonuses: mockGetScamBotBonuses });
        }
        return {};
      });
      (useBotStore.getState as jest.Mock).mockReturnValue({
        getScamBotBonuses: mockGetScamBotBonuses,
      });

      render(<ScamListPanel {...createDefaultProps()} />);

      // ScamCard mock renders bot bonus values as Text elements
      expect(screen.getByTestId('scam-card-scam-a-bot-speed')).toHaveTextContent('0.3');
      expect(screen.getByTestId('scam-card-scam-a-bot-profit')).toHaveTextContent('0.2');
    });

    it('should pass zero bot bonuses when no bots assigned', () => {
      render(<ScamListPanel {...createDefaultProps()} />);

      expect(screen.getByTestId('scam-card-scam-a-bot-speed')).toHaveTextContent('0');
      expect(screen.getByTestId('scam-card-scam-a-bot-profit')).toHaveTextContent('0');
    });
  });

  describe('empty tiers', () => {
    it('should not render a tier header when tier has no visible scams', () => {
      // Tier 2 is accessible but has no visible scams (all too expensive)
      mockIsTierAccessible.mockReturnValue(true);
      mockGetUnlockCostForScam.mockImplementation((scamId: string) => {
        if (scamId === 'scam-d') return 999999;
        return mockTier1Scams.find((s) => s.id === scamId)?.unlockCost;
      });
      const props = createDefaultProps({
        resources: createDefaultResources({ money: 0 }),
        scams: {},
        nextGoalScamId: undefined,
      });
      render(<ScamListPanel {...props} />);
      // Tier 2 header should not render since scam-d is too expensive and not goal
      expect(screen.queryByText(/TIER 2: GETTING SERIOUS/)).toBeNull();
    });
  });

  describe('collapsible tier headers', () => {
    it('should render tier headers as pressable with expand indicator', () => {
      render(<ScamListPanel {...createDefaultProps()} />);
      const header = screen.getByTestId('tier-header-1');
      expect(header).toBeTruthy();
      expect(screen.getByText(/▼.*TIER 1: SMALL TIME/)).toBeTruthy();
    });

    it('should show collapsed chevron when tier is in collapsedTiers', () => {
      const props = createDefaultProps({
        collapsedTiers: new Set([1] as const),
      });
      render(<ScamListPanel {...props} />);
      expect(screen.getByText(/▶.*TIER 1: SMALL TIME/)).toBeTruthy();
    });

    it('should call onToggleTier when tier header is pressed', () => {
      const onToggleTier = jest.fn();
      const props = createDefaultProps({ onToggleTier });
      render(<ScamListPanel {...props} />);

      fireEvent.press(screen.getByTestId('tier-header-1'));
      expect(onToggleTier).toHaveBeenCalledWith(1);
    });

    it('should hide scam cards when tier is collapsed', () => {
      const props = createDefaultProps({
        collapsedTiers: new Set([1] as const),
      });
      render(<ScamListPanel {...props} />);

      // Header still visible
      expect(screen.getByTestId('tier-header-1')).toBeTruthy();
      // Cards hidden
      expect(screen.queryByTestId('scam-card-scam-a')).toBeNull();
    });

    it('should show scam cards when tier is expanded', () => {
      render(<ScamListPanel {...createDefaultProps()} />);
      expect(screen.getByTestId('scam-card-scam-a')).toBeTruthy();
    });

    it('should keep collapsed tier header visible while hiding all cards', () => {
      const props = createDefaultProps({
        collapsedTiers: new Set([1] as const),
        scams: {
          'scam-a': { scamId: 'scam-a', level: 1, isUnlocked: true, timesCompleted: 0 },
          'scam-b': { scamId: 'scam-b', level: 1, isUnlocked: true, timesCompleted: 0 },
        },
      });
      render(<ScamListPanel {...props} />);

      // Header visible
      expect(screen.getByTestId('tier-header-1')).toBeTruthy();
      // Cards hidden
      expect(screen.queryByTestId('scam-card-scam-a')).toBeNull();
      expect(screen.queryByTestId('scam-card-scam-b')).toBeNull();
    });
  });

  describe('tier lock gating', () => {
    it('should show locked state for tier 2 when tier 1 is not fully unlocked', () => {
      mockIsTierAccessible.mockReturnValue(true);
      mockIsTierFullyUnlocked.mockImplementation((tier) => tier !== 1);

      const props = createDefaultProps({
        resources: createDefaultResources({ trust: 5 }),
        scams: {
          'scam-a': { scamId: 'scam-a', level: 1, isUnlocked: true, timesCompleted: 0 },
          'scam-d': { scamId: 'scam-d', level: 1, isUnlocked: true, timesCompleted: 0 },
        },
      });
      render(<ScamListPanel {...props} />);

      // Tier 2 header should show locked
      expect(screen.getByText(/🔒.*TIER 2: GETTING SERIOUS/)).toBeTruthy();
      // Should show lock message
      expect(screen.getByText('UNLOCK ALL TIER 1 SCAMS FIRST')).toBeTruthy();
      // Tier 2 scam cards should NOT render
      expect(screen.queryByTestId('scam-card-scam-d')).toBeNull();
    });

    it('should show tier 2 as normal when tier 1 is fully unlocked', () => {
      mockIsTierAccessible.mockReturnValue(true);
      mockIsTierFullyUnlocked.mockReturnValue(true);

      const props = createDefaultProps({
        resources: createDefaultResources({ trust: 5 }),
        scams: {
          'scam-a': { scamId: 'scam-a', level: 1, isUnlocked: true, timesCompleted: 0 },
          'scam-d': { scamId: 'scam-d', level: 1, isUnlocked: true, timesCompleted: 0 },
        },
      });
      render(<ScamListPanel {...props} />);

      // Tier 2 header should show expanded (not locked)
      expect(screen.getByText(/▼.*TIER 2: GETTING SERIOUS/)).toBeTruthy();
      // Scam card should render
      expect(screen.getByTestId('scam-card-scam-d')).toBeTruthy();
    });

    it('should never lock tier 1 (no previous tier to gate on)', () => {
      mockIsTierAccessible.mockReturnValue(true);
      // Even if isTierFullyUnlocked returns false for tier 0, tier 1 should never be locked
      mockIsTierFullyUnlocked.mockReturnValue(false);

      render(<ScamListPanel {...createDefaultProps()} />);

      // Tier 1 should show expanded with scam card
      expect(screen.getByText(/▼.*TIER 1: SMALL TIME/)).toBeTruthy();
      expect(screen.getByTestId('scam-card-scam-a')).toBeTruthy();
    });

    it('should not allow pressing locked tier header to expand', () => {
      mockIsTierAccessible.mockReturnValue(true);
      mockIsTierFullyUnlocked.mockImplementation((tier) => tier !== 1);

      const props = createDefaultProps({
        resources: createDefaultResources({ trust: 5 }),
        scams: {
          'scam-a': { scamId: 'scam-a', level: 1, isUnlocked: true, timesCompleted: 0 },
          'scam-d': { scamId: 'scam-d', level: 1, isUnlocked: true, timesCompleted: 0 },
        },
      });
      render(<ScamListPanel {...props} />);

      // Try pressing locked tier 2 header
      const header = screen.getByTestId('tier-header-2');
      fireEvent.press(header);

      // Should still be locked, no scam cards
      expect(screen.queryByTestId('scam-card-scam-d')).toBeNull();
      expect(screen.getByText('UNLOCK ALL TIER 1 SCAMS FIRST')).toBeTruthy();
    });
  });
});
