# Idle Scammer MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a playable MVP with Bot Farms generating bots, basic money/resource display, and save/load persistence.

**Architecture:** Zustand for state management, custom game loop with setInterval, AsyncStorage for persistence. Pure functions for game logic to enable easy testing. UI in React Native with dark hacker theme.

**Tech Stack:** Expo (React Native), TypeScript, Zustand, Vitest, AsyncStorage

---

## Phase 1: Testing Infrastructure

### Task 1: Install Testing Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install vitest and testing utilities**

Run:
```bash
cd /Users/nervous-mini/Dev/idle-scammer && npm install -D vitest @testing-library/react-native @testing-library/jest-native jest-expo
```

Expected: Dependencies added to package.json devDependencies

**Step 2: Add test script to package.json**

Add to scripts section:
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 3: Create vitest config**

Create file: `vitest.config.ts`
```typescript
// ABOUTME: Vitest configuration for testing game logic
// ABOUTME: Uses jsdom environment for React Native compatibility

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    globals: true,
  },
});
```

**Step 4: Verify vitest runs**

Run: `npm test`
Expected: "No test files found" (no tests yet, but vitest works)

**Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "feat: add vitest testing infrastructure"
```

---

### Task 2: Install Zustand for State Management

**Files:**
- Modify: `package.json`

**Step 1: Install zustand**

Run:
```bash
cd /Users/nervous-mini/Dev/idle-scammer && npm install zustand
```

Expected: zustand added to dependencies

**Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add zustand for state management"
```

---

## Phase 2: Core Game Logic

### Task 3: Create Resource Types

**Files:**
- Create: `src/game/resources/types.ts`
- Create: `src/game/resources/types.test.ts`

**Step 1: Write the failing test**

Create file: `src/game/resources/types.test.ts`
```typescript
// ABOUTME: Tests for resource type definitions
// ABOUTME: Validates resource structure and initial values

import { describe, it, expect } from 'vitest';
import { createInitialResources, ResourceState } from './types';

describe('Resource Types', () => {
  it('creates initial resources with correct default values', () => {
    const resources = createInitialResources();

    expect(resources.money).toBe(0);
    expect(resources.bots).toBe(0);
    expect(resources.reputation).toBe(0);
    expect(resources.heat).toBe(0);
    expect(resources.skillPoints).toBe(0);
    expect(resources.crypto).toBe(0);
  });

  it('trust starts at 1 (base multiplier)', () => {
    const resources = createInitialResources();
    expect(resources.trust).toBe(1);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - "Cannot find module './types'"

**Step 3: Write minimal implementation**

Create file: `src/game/resources/types.ts`
```typescript
// ABOUTME: Core resource type definitions for the game economy
// ABOUTME: Defines all 7 resources and their initial values

export interface ResourceState {
  money: number;
  bots: number;
  reputation: number;
  heat: number;
  skillPoints: number;
  crypto: number;
  trust: number; // Persists across prestige
}

export function createInitialResources(): ResourceState {
  return {
    money: 0,
    bots: 0,
    reputation: 0,
    heat: 0,
    skillPoints: 0,
    crypto: 0,
    trust: 1, // Base multiplier of 1x
  };
}
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/game/resources/
git commit -m "feat: add resource type definitions"
```

---

### Task 4: Create Scam Type Definitions

**Files:**
- Create: `src/game/scams/types.ts`
- Create: `src/game/scams/types.test.ts`

**Step 1: Write the failing test**

Create file: `src/game/scams/types.test.ts`
```typescript
// ABOUTME: Tests for scam type definitions
// ABOUTME: Validates scam structure and state management

import { describe, it, expect } from 'vitest';
import { ScamDefinition, ScamState, createScamState } from './types';

describe('Scam Types', () => {
  const testScam: ScamDefinition = {
    id: 'bot-farms',
    name: 'Bot Farms',
    tier: 1,
    description: 'Generate bots to power your empire',
    baseDuration: 5000, // 5 seconds
    baseReward: { bots: 1 },
    unlockCost: { money: 0 }, // First scam is free
  };

  it('creates scam state with correct initial values', () => {
    const state = createScamState(testScam.id);

    expect(state.scamId).toBe('bot-farms');
    expect(state.level).toBe(1);
    expect(state.isRunning).toBe(false);
    expect(state.startedAt).toBeNull();
    expect(state.employeeCount).toBe(0);
    expect(state.hasManager).toBe(false);
    expect(state.botsAssigned).toBe(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - "Cannot find module './types'"

**Step 3: Write minimal implementation**

Create file: `src/game/scams/types.ts`
```typescript
// ABOUTME: Scam type definitions - the core gameplay element
// ABOUTME: Defines scam structure, state, and rewards

import { ResourceState } from '../resources/types';

export type ResourceReward = Partial<ResourceState>;
export type ResourceCost = Partial<ResourceState>;

export interface ScamDefinition {
  id: string;
  name: string;
  tier: 1 | 2 | 3 | 4 | 5;
  description: string;
  baseDuration: number; // milliseconds
  baseReward: ResourceReward;
  unlockCost: ResourceCost;
}

export interface ScamState {
  scamId: string;
  level: number;
  isRunning: boolean;
  startedAt: number | null; // timestamp
  employeeCount: number;
  hasManager: boolean;
  botsAssigned: number;
}

export function createScamState(scamId: string): ScamState {
  return {
    scamId,
    level: 1,
    isRunning: false,
    startedAt: null,
    employeeCount: 0,
    hasManager: false,
    botsAssigned: 0,
  };
}
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/game/scams/
git commit -m "feat: add scam type definitions"
```

---

### Task 5: Create Bot Farm Scam Definition

**Files:**
- Create: `src/game/scams/definitions/botFarm.ts`
- Create: `src/game/scams/definitions/botFarm.test.ts`

**Step 1: Write the failing test**

Create file: `src/game/scams/definitions/botFarm.test.ts`
```typescript
// ABOUTME: Tests for the Bot Farm scam definition
// ABOUTME: Bot Farm is the first scam, generates bots

import { describe, it, expect } from 'vitest';
import { BOT_FARM } from './botFarm';

describe('Bot Farm Definition', () => {
  it('has correct basic properties', () => {
    expect(BOT_FARM.id).toBe('bot-farms');
    expect(BOT_FARM.name).toBe('Bot Farms');
    expect(BOT_FARM.tier).toBe(1);
  });

  it('rewards bots', () => {
    expect(BOT_FARM.baseReward.bots).toBeGreaterThan(0);
  });

  it('is free to unlock (first scam)', () => {
    expect(BOT_FARM.unlockCost.money).toBe(0);
  });

  it('has a reasonable base duration', () => {
    expect(BOT_FARM.baseDuration).toBeGreaterThan(1000);
    expect(BOT_FARM.baseDuration).toBeLessThan(60000);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - "Cannot find module './botFarm'"

**Step 3: Write minimal implementation**

Create file: `src/game/scams/definitions/botFarm.ts`
```typescript
// ABOUTME: Bot Farm - the foundational scam that generates bots
// ABOUTME: First scam unlocked, bots are used to upgrade other scams

import { ScamDefinition } from '../types';

export const BOT_FARM: ScamDefinition = {
  id: 'bot-farms',
  name: 'Bot Farms',
  tier: 1,
  description: 'Deploy bot networks to build your automation empire. Bots are the currency of efficiency.',
  baseDuration: 5000, // 5 seconds for quick early-game feedback
  baseReward: {
    bots: 1,
  },
  unlockCost: {
    money: 0, // First scam is free
  },
};
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/game/scams/definitions/
git commit -m "feat: add Bot Farm scam definition"
```

---

### Task 6: Create Game Engine Core

**Files:**
- Create: `src/game/engine/gameLoop.ts`
- Create: `src/game/engine/gameLoop.test.ts`

**Step 1: Write the failing test**

Create file: `src/game/engine/gameLoop.test.ts`
```typescript
// ABOUTME: Tests for core game loop calculations
// ABOUTME: Pure functions for scam completion and rewards

import { describe, it, expect } from 'vitest';
import { calculateScamProgress, calculateReward, isScamComplete } from './gameLoop';
import { ScamState } from '../scams/types';
import { BOT_FARM } from '../scams/definitions/botFarm';

describe('Game Loop', () => {
  describe('calculateScamProgress', () => {
    it('returns 0 when scam is not running', () => {
      const state: ScamState = {
        scamId: 'bot-farms',
        level: 1,
        isRunning: false,
        startedAt: null,
        employeeCount: 0,
        hasManager: false,
        botsAssigned: 0,
      };

      expect(calculateScamProgress(state, BOT_FARM, Date.now())).toBe(0);
    });

    it('returns correct progress when running', () => {
      const now = Date.now();
      const state: ScamState = {
        scamId: 'bot-farms',
        level: 1,
        isRunning: true,
        startedAt: now - 2500, // Half way through 5000ms
        employeeCount: 0,
        hasManager: false,
        botsAssigned: 0,
      };

      const progress = calculateScamProgress(state, BOT_FARM, now);
      expect(progress).toBeCloseTo(0.5, 1);
    });

    it('caps progress at 1', () => {
      const now = Date.now();
      const state: ScamState = {
        scamId: 'bot-farms',
        level: 1,
        isRunning: true,
        startedAt: now - 10000, // Way past completion
        employeeCount: 0,
        hasManager: false,
        botsAssigned: 0,
      };

      expect(calculateScamProgress(state, BOT_FARM, now)).toBe(1);
    });
  });

  describe('isScamComplete', () => {
    it('returns true when progress is 1', () => {
      expect(isScamComplete(1)).toBe(true);
    });

    it('returns false when progress is less than 1', () => {
      expect(isScamComplete(0.99)).toBe(false);
    });
  });

  describe('calculateReward', () => {
    it('returns base reward at level 1 with trust 1', () => {
      const reward = calculateReward(BOT_FARM, 1, 1);
      expect(reward.bots).toBe(1);
    });

    it('scales reward with level', () => {
      const reward = calculateReward(BOT_FARM, 2, 1);
      expect(reward.bots).toBe(2);
    });

    it('scales reward with trust', () => {
      const reward = calculateReward(BOT_FARM, 1, 2);
      expect(reward.bots).toBe(2);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - "Cannot find module './gameLoop'"

**Step 3: Write minimal implementation**

Create file: `src/game/engine/gameLoop.ts`
```typescript
// ABOUTME: Core game loop calculation functions
// ABOUTME: Pure functions for scam progress, completion, and rewards

import { ScamDefinition, ScamState } from '../scams/types';
import { ResourceReward } from '../scams/types';

export function calculateScamProgress(
  scamState: ScamState,
  definition: ScamDefinition,
  currentTime: number
): number {
  if (!scamState.isRunning || scamState.startedAt === null) {
    return 0;
  }

  const elapsed = currentTime - scamState.startedAt;
  const progress = elapsed / definition.baseDuration;

  return Math.min(progress, 1);
}

export function isScamComplete(progress: number): boolean {
  return progress >= 1;
}

export function calculateReward(
  definition: ScamDefinition,
  level: number,
  trust: number
): ResourceReward {
  const reward: ResourceReward = {};

  for (const [key, baseValue] of Object.entries(definition.baseReward)) {
    if (baseValue !== undefined) {
      reward[key as keyof ResourceReward] = Math.floor(baseValue * level * trust);
    }
  }

  return reward;
}
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/game/engine/
git commit -m "feat: add core game loop calculations"
```

---

### Task 7: Create Game Store with Zustand

**Files:**
- Create: `src/game/store.ts`
- Create: `src/game/store.test.ts`

**Step 1: Write the failing test**

Create file: `src/game/store.test.ts`
```typescript
// ABOUTME: Tests for the main game store
// ABOUTME: Validates state management and actions

import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './store';

describe('Game Store', () => {
  beforeEach(() => {
    // Reset store between tests
    useGameStore.setState(useGameStore.getInitialState());
  });

  describe('initial state', () => {
    it('has initial resources', () => {
      const state = useGameStore.getState();
      expect(state.resources.money).toBe(0);
      expect(state.resources.bots).toBe(0);
      expect(state.resources.trust).toBe(1);
    });

    it('has bot farm unlocked by default', () => {
      const state = useGameStore.getState();
      expect(state.scams['bot-farms']).toBeDefined();
    });
  });

  describe('startScam', () => {
    it('starts a scam', () => {
      const { startScam } = useGameStore.getState();
      startScam('bot-farms');

      const state = useGameStore.getState();
      expect(state.scams['bot-farms'].isRunning).toBe(true);
      expect(state.scams['bot-farms'].startedAt).not.toBeNull();
    });
  });

  describe('collectScam', () => {
    it('collects reward and resets scam', () => {
      const store = useGameStore.getState();

      // Start the scam
      store.startScam('bot-farms');

      // Manually set it to complete (for testing)
      useGameStore.setState((state) => ({
        scams: {
          ...state.scams,
          'bot-farms': {
            ...state.scams['bot-farms'],
            startedAt: Date.now() - 10000, // Past completion
          },
        },
      }));

      // Collect
      useGameStore.getState().collectScam('bot-farms');

      const finalState = useGameStore.getState();
      expect(finalState.resources.bots).toBeGreaterThan(0);
      expect(finalState.scams['bot-farms'].isRunning).toBe(false);
    });
  });

  describe('addResources', () => {
    it('adds resources correctly', () => {
      const { addResources } = useGameStore.getState();
      addResources({ money: 100, bots: 5 });

      const state = useGameStore.getState();
      expect(state.resources.money).toBe(100);
      expect(state.resources.bots).toBe(5);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - "Cannot find module './store'"

**Step 3: Write minimal implementation**

Create file: `src/game/store.ts`
```typescript
// ABOUTME: Main game state store using Zustand
// ABOUTME: Central state management for resources, scams, and actions

import { create } from 'zustand';
import { ResourceState, createInitialResources } from './resources/types';
import { ScamState, createScamState, ResourceReward } from './scams/types';
import { BOT_FARM } from './scams/definitions/botFarm';
import { calculateReward, calculateScamProgress, isScamComplete } from './engine/gameLoop';

interface GameState {
  resources: ResourceState;
  scams: Record<string, ScamState>;
  lastTick: number;

  // Actions
  startScam: (scamId: string) => void;
  collectScam: (scamId: string) => void;
  addResources: (reward: ResourceReward) => void;
  tick: () => void;
}

const SCAM_DEFINITIONS = {
  'bot-farms': BOT_FARM,
};

function createInitialState() {
  return {
    resources: createInitialResources(),
    scams: {
      'bot-farms': createScamState('bot-farms'),
    },
    lastTick: Date.now(),
  };
}

export const useGameStore = create<GameState>((set, get) => ({
  ...createInitialState(),

  startScam: (scamId: string) => {
    set((state) => ({
      scams: {
        ...state.scams,
        [scamId]: {
          ...state.scams[scamId],
          isRunning: true,
          startedAt: Date.now(),
        },
      },
    }));
  },

  collectScam: (scamId: string) => {
    const state = get();
    const scamState = state.scams[scamId];
    const definition = SCAM_DEFINITIONS[scamId as keyof typeof SCAM_DEFINITIONS];

    if (!definition || !scamState) return;

    const progress = calculateScamProgress(scamState, definition, Date.now());

    if (!isScamComplete(progress)) return;

    const reward = calculateReward(definition, scamState.level, state.resources.trust);

    set((state) => ({
      resources: {
        ...state.resources,
        ...Object.fromEntries(
          Object.entries(reward).map(([key, value]) => [
            key,
            (state.resources[key as keyof ResourceState] || 0) + (value || 0),
          ])
        ),
      },
      scams: {
        ...state.scams,
        [scamId]: {
          ...state.scams[scamId],
          isRunning: false,
          startedAt: null,
        },
      },
    }));
  },

  addResources: (reward: ResourceReward) => {
    set((state) => ({
      resources: {
        ...state.resources,
        ...Object.fromEntries(
          Object.entries(reward).map(([key, value]) => [
            key,
            (state.resources[key as keyof ResourceState] || 0) + (value || 0),
          ])
        ),
      },
    }));
  },

  tick: () => {
    set({ lastTick: Date.now() });
  },
}));

// Helper to get initial state for testing
(useGameStore as any).getInitialState = createInitialState;
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/game/store.ts src/game/store.test.ts
git commit -m "feat: add Zustand game store with scam actions"
```

---

## Phase 3: Basic UI

### Task 8: Create Theme Constants

**Files:**
- Create: `src/theme.ts`

**Step 1: Create theme file (no test needed for constants)**

Create file: `src/theme.ts`
```typescript
// ABOUTME: Visual theme constants for the hacker aesthetic
// ABOUTME: Colors, fonts, and spacing for consistent dark theme

export const COLORS = {
  // Backgrounds
  background: '#0a0a0a',
  surface: '#1a1a1a',
  surfaceLight: '#2a2a2a',

  // Terminal colors
  terminalGreen: '#00ff00',
  terminalGreenDim: '#00aa00',
  terminalAmber: '#ffaa00',
  terminalRed: '#ff4444',
  terminalBlue: '#4488ff',

  // Text
  textPrimary: '#00ff00',
  textSecondary: '#888888',
  textMuted: '#555555',

  // Accents
  accent: '#00ff00',
  accentDim: '#004400',
  warning: '#ffaa00',
  danger: '#ff4444',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
};
```

**Step 2: Commit**

```bash
git add src/theme.ts
git commit -m "feat: add hacker theme constants"
```

---

### Task 9: Create Resource Display Component

**Files:**
- Create: `src/components/ResourceDisplay.tsx`

**Step 1: Create component**

Create file: `src/components/ResourceDisplay.tsx`
```typescript
// ABOUTME: Displays current resource values in terminal style
// ABOUTME: Shows money, bots, reputation, heat, crypto

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../game/store';
import { COLORS, SPACING, FONT_SIZES } from '../theme';

interface ResourceRowProps {
  label: string;
  value: number;
  color?: string;
}

function ResourceRow({ label, value, color = COLORS.terminalGreen }: ResourceRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={[styles.value, { color }]}>{Math.floor(value).toLocaleString()}</Text>
    </View>
  );
}

export function ResourceDisplay() {
  const resources = useGameStore((state) => state.resources);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>[ RESOURCES ]</Text>
      <ResourceRow label="MONEY" value={resources.money} color={COLORS.terminalGreen} />
      <ResourceRow label="BOTS" value={resources.bots} color={COLORS.terminalBlue} />
      <ResourceRow label="REP" value={resources.reputation} color={COLORS.terminalAmber} />
      <ResourceRow label="HEAT" value={resources.heat} color={COLORS.terminalRed} />
      <ResourceRow label="CRYPTO" value={resources.crypto} color={COLORS.terminalAmber} />
      <View style={styles.divider} />
      <ResourceRow label="TRUST" value={resources.trust} color={COLORS.terminalGreen} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.terminalGreenDim,
  },
  header: {
    color: COLORS.terminalGreen,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    fontFamily: 'monospace',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontFamily: 'monospace',
  },
  value: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.terminalGreenDim,
    marginVertical: SPACING.sm,
  },
});
```

**Step 2: Commit**

```bash
git add src/components/
git commit -m "feat: add ResourceDisplay component"
```

---

### Task 10: Create Scam Card Component

**Files:**
- Create: `src/components/ScamCard.tsx`

**Step 1: Create component**

Create file: `src/components/ScamCard.tsx`
```typescript
// ABOUTME: Interactive card for a single scam operation
// ABOUTME: Shows progress bar, handles start/collect actions

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useGameStore } from '../game/store';
import { ScamDefinition } from '../game/scams/types';
import { calculateScamProgress, isScamComplete } from '../game/engine/gameLoop';
import { COLORS, SPACING, FONT_SIZES } from '../theme';

interface ScamCardProps {
  definition: ScamDefinition;
}

export function ScamCard({ definition }: ScamCardProps) {
  const scamState = useGameStore((state) => state.scams[definition.id]);
  const startScam = useGameStore((state) => state.startScam);
  const collectScam = useGameStore((state) => state.collectScam);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!scamState?.isRunning) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      const newProgress = calculateScamProgress(scamState, definition, Date.now());
      setProgress(newProgress);
    }, 100);

    return () => clearInterval(interval);
  }, [scamState?.isRunning, scamState?.startedAt, definition]);

  const complete = isScamComplete(progress);

  const handlePress = () => {
    if (!scamState?.isRunning) {
      startScam(definition.id);
    } else if (complete) {
      collectScam(definition.id);
    }
  };

  const getButtonText = () => {
    if (!scamState?.isRunning) return '[ START ]';
    if (complete) return '[ COLLECT ]';
    return `${Math.floor(progress * 100)}%`;
  };

  const getButtonColor = () => {
    if (complete) return COLORS.terminalGreen;
    if (scamState?.isRunning) return COLORS.terminalAmber;
    return COLORS.terminalGreenDim;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{definition.name}</Text>
        <Text style={styles.tier}>T{definition.tier}</Text>
      </View>

      <Text style={styles.description}>{definition.description}</Text>

      <View style={styles.rewardRow}>
        <Text style={styles.rewardLabel}>Reward:</Text>
        {Object.entries(definition.baseReward).map(([key, value]) => (
          <Text key={key} style={styles.rewardValue}>
            +{value} {key.toUpperCase()}
          </Text>
        ))}
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>

      <TouchableOpacity
        style={[styles.button, { borderColor: getButtonColor() }]}
        onPress={handlePress}
        disabled={scamState?.isRunning && !complete}
      >
        <Text style={[styles.buttonText, { color: getButtonColor() }]}>
          {getButtonText()}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.terminalGreenDim,
    marginVertical: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  name: {
    color: COLORS.terminalGreen,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  tier: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontFamily: 'monospace',
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontFamily: 'monospace',
    marginBottom: SPACING.sm,
  },
  rewardRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  rewardLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    fontFamily: 'monospace',
    marginRight: SPACING.sm,
  },
  rewardValue: {
    color: COLORS.terminalBlue,
    fontSize: FONT_SIZES.sm,
    fontFamily: 'monospace',
  },
  progressContainer: {
    height: 8,
    backgroundColor: COLORS.surfaceLight,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.terminalGreen,
  },
  button: {
    borderWidth: 1,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});
```

**Step 2: Commit**

```bash
git add src/components/ScamCard.tsx
git commit -m "feat: add ScamCard component with progress and actions"
```

---

### Task 11: Create Main Game Screen

**Files:**
- Create: `src/screens/GameScreen.tsx`
- Modify: `App.tsx`

**Step 1: Create game screen**

Create file: `src/screens/GameScreen.tsx`
```typescript
// ABOUTME: Main game screen showing resources and active scams
// ABOUTME: Entry point for gameplay UI

import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { ResourceDisplay } from '../components/ResourceDisplay';
import { ScamCard } from '../components/ScamCard';
import { BOT_FARM } from '../game/scams/definitions/botFarm';
import { COLORS, SPACING, FONT_SIZES } from '../theme';

export function GameScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>IDLE SCAMMER</Text>
          <Text style={styles.subtitle}>v0.1.0 - baud-e-modem edition</Text>
        </View>

        <ResourceDisplay />

        <Text style={styles.sectionHeader}>[ OPERATIONS ]</Text>

        <ScrollView style={styles.scamList}>
          <ScamCard definition={BOT_FARM} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingTop: SPACING.md,
  },
  title: {
    color: COLORS.terminalGreen,
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    fontFamily: 'monospace',
  },
  sectionHeader: {
    color: COLORS.terminalGreen,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  scamList: {
    flex: 1,
  },
});
```

**Step 2: Update App.tsx**

Replace contents of `App.tsx`:
```typescript
// ABOUTME: Root application component
// ABOUTME: Renders the main game screen

import { StatusBar } from 'expo-status-bar';
import { GameScreen } from './src/screens/GameScreen';

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <GameScreen />
    </>
  );
}
```

**Step 3: Test visually**

Run: `npm run web`
Expected: See game UI with dark theme, resource display, and Bot Farm card

**Step 4: Commit**

```bash
git add src/screens/ App.tsx
git commit -m "feat: add main game screen with Bot Farm"
```

---

## Phase 4: Persistence

### Task 12: Add Save/Load System

**Files:**
- Create: `src/game/persistence.ts`
- Create: `src/game/persistence.test.ts`

**Step 1: Write the failing test**

Create file: `src/game/persistence.test.ts`
```typescript
// ABOUTME: Tests for save/load persistence
// ABOUTME: Validates serialization and deserialization of game state

import { describe, it, expect } from 'vitest';
import { serializeGameState, deserializeGameState, SaveData } from './persistence';
import { createInitialResources } from './resources/types';
import { createScamState } from './scams/types';

describe('Persistence', () => {
  describe('serializeGameState', () => {
    it('serializes resources and scams', () => {
      const state = {
        resources: createInitialResources(),
        scams: { 'bot-farms': createScamState('bot-farms') },
      };

      const serialized = serializeGameState(state);
      const parsed = JSON.parse(serialized);

      expect(parsed.version).toBe(1);
      expect(parsed.resources).toEqual(state.resources);
      expect(parsed.scams).toEqual(state.scams);
    });
  });

  describe('deserializeGameState', () => {
    it('deserializes valid save data', () => {
      const saveData: SaveData = {
        version: 1,
        savedAt: Date.now(),
        resources: createInitialResources(),
        scams: { 'bot-farms': createScamState('bot-farms') },
      };

      const result = deserializeGameState(JSON.stringify(saveData));

      expect(result).not.toBeNull();
      expect(result?.resources).toEqual(saveData.resources);
    });

    it('returns null for invalid JSON', () => {
      const result = deserializeGameState('not valid json');
      expect(result).toBeNull();
    });

    it('returns null for wrong version', () => {
      const saveData = {
        version: 999,
        savedAt: Date.now(),
        resources: {},
        scams: {},
      };

      const result = deserializeGameState(JSON.stringify(saveData));
      expect(result).toBeNull();
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - "Cannot find module './persistence'"

**Step 3: Write minimal implementation**

Create file: `src/game/persistence.ts`
```typescript
// ABOUTME: Save/load game state to persistent storage
// ABOUTME: Handles serialization and version migration

import { ResourceState } from './resources/types';
import { ScamState } from './scams/types';

const SAVE_VERSION = 1;

export interface SaveData {
  version: number;
  savedAt: number;
  resources: ResourceState;
  scams: Record<string, ScamState>;
}

interface GameStateForSave {
  resources: ResourceState;
  scams: Record<string, ScamState>;
}

export function serializeGameState(state: GameStateForSave): string {
  const saveData: SaveData = {
    version: SAVE_VERSION,
    savedAt: Date.now(),
    resources: state.resources,
    scams: state.scams,
  };

  return JSON.stringify(saveData);
}

export function deserializeGameState(json: string): SaveData | null {
  try {
    const data = JSON.parse(json);

    if (data.version !== SAVE_VERSION) {
      console.warn(`Save version mismatch: expected ${SAVE_VERSION}, got ${data.version}`);
      return null;
    }

    return data as SaveData;
  } catch (e) {
    console.error('Failed to parse save data:', e);
    return null;
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/game/persistence.ts src/game/persistence.test.ts
git commit -m "feat: add save/load serialization"
```

---

### Task 13: Add Persistence to Store

**Files:**
- Modify: `src/game/store.ts`

**Step 1: Install AsyncStorage**

Run:
```bash
cd /Users/nervous-mini/Dev/idle-scammer && npm install @react-native-async-storage/async-storage
```

**Step 2: Update store with persistence**

Add to `src/game/store.ts` - add these imports at top:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { serializeGameState, deserializeGameState } from './persistence';
```

Add these to the GameState interface:
```typescript
  saveGame: () => Promise<void>;
  loadGame: () => Promise<boolean>;
```

Add these actions to the store (before the closing `})`):
```typescript
  saveGame: async () => {
    const state = get();
    const json = serializeGameState({
      resources: state.resources,
      scams: state.scams,
    });
    await AsyncStorage.setItem('idle-scammer-save', json);
  },

  loadGame: async () => {
    const json = await AsyncStorage.getItem('idle-scammer-save');
    if (!json) return false;

    const saveData = deserializeGameState(json);
    if (!saveData) return false;

    set({
      resources: saveData.resources,
      scams: saveData.scams,
    });

    return true;
  },
```

**Step 3: Commit**

```bash
git add src/game/store.ts package.json package-lock.json
git commit -m "feat: add save/load actions to game store"
```

---

### Task 14: Add Auto-Save and Load on Start

**Files:**
- Modify: `src/screens/GameScreen.tsx`

**Step 1: Add useEffect for load and auto-save**

Update `GameScreen.tsx` - add imports:
```typescript
import { useEffect } from 'react';
import { useGameStore } from '../game/store';
```

Add inside GameScreen component before return:
```typescript
  const loadGame = useGameStore((state) => state.loadGame);
  const saveGame = useGameStore((state) => state.saveGame);

  // Load game on mount
  useEffect(() => {
    loadGame().then((loaded) => {
      if (loaded) {
        console.log('Game loaded from save');
      }
    });
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveGame().then(() => {
        console.log('Game auto-saved');
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);
```

**Step 2: Test manually**

Run: `npm run web`
Expected: Game loads, earn some bots, refresh page, bots should persist

**Step 3: Commit**

```bash
git add src/screens/GameScreen.tsx
git commit -m "feat: add auto-save and load on startup"
```

---

## Phase 5: Polish

### Task 15: Add Scanline Effect

**Files:**
- Create: `src/components/Scanlines.tsx`
- Modify: `src/screens/GameScreen.tsx`

**Step 1: Create scanlines component**

Create file: `src/components/Scanlines.tsx`
```typescript
// ABOUTME: CRT scanline overlay effect for retro aesthetic
// ABOUTME: Renders semi-transparent horizontal lines over content

import React from 'react';
import { View, StyleSheet } from 'react-native';

export function Scanlines() {
  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: 100 }).map((_, i) => (
        <View key={i} style={styles.line} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  line: {
    height: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginBottom: 2,
  },
});
```

**Step 2: Add to GameScreen**

Add import to `GameScreen.tsx`:
```typescript
import { Scanlines } from '../components/Scanlines';
```

Add `<Scanlines />` just before the closing `</View>` of container.

**Step 3: Commit**

```bash
git add src/components/Scanlines.tsx src/screens/GameScreen.tsx
git commit -m "feat: add CRT scanline effect"
```

---

### Task 16: Final Testing and Cleanup

**Step 1: Run all tests**

Run: `npm test`
Expected: All tests pass

**Step 2: Run app and verify functionality**

Run: `npm run web`
Verify:
- [ ] Resources display correctly
- [ ] Bot Farm can be started
- [ ] Progress bar animates
- [ ] Collect button appears when complete
- [ ] Bots increment on collect
- [ ] Dark theme looks good
- [ ] Scanlines visible

**Step 3: Final commit**

```bash
git add -A
git commit -m "chore: MVP complete - Bot Farm playable with persistence"
```

---

## Summary

After completing all tasks you will have:

1. **Testing Infrastructure** - Vitest configured and working
2. **State Management** - Zustand store with resources and scams
3. **Game Logic** - Pure functions for scam progress and rewards
4. **Bot Farm** - First playable scam generating bots
5. **UI** - Dark hacker theme with resource display and scam cards
6. **Persistence** - Auto-save and load from AsyncStorage
7. **Polish** - CRT scanline effect

The game loop: Start Bot Farm → Wait → Collect → Get Bots → Repeat

Next steps after MVP:
- Add more Tier 1 scams
- Implement money economy (scams that cost bots, earn money)
- Add employee hiring
- Add manager automation
- Implement prestige/heat system
