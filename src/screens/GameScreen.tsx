// ABOUTME: Main game screen that wires together all game systems
// ABOUTME: Displays ResourceHUD, ScamCards, and handles game loop integration

import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ResourceHUD } from '../components/ResourceHUD';
import { ScamCard } from '../components/ScamCard';
import { TerminalText } from '../components/TerminalText';
import { COLORS, SPACING } from '../components/theme';
import { useGameStore } from '../game/store';
import { useScamStore } from '../game/scams/scamStore';
import { TIER_1_SCAMS } from '../game/scams/definitions';
import {
  calculateScamDuration,
  calculateScamReward,
  calculateUpgradeCost,
} from '../game/scams/calculations';
import { calculateHeatFromScam } from '../game/prestige/calculations';
import { useGameLoop } from '../game/engine/gameLoop';
import type { ScamTimer } from '../game/engine/types';
import type { ScamDefinition } from '../game/scams/types';

/**
 * Look up a scam definition by ID
 */
function getScamDefinition(scamId: string): ScamDefinition | undefined {
  return TIER_1_SCAMS.find((scam) => scam.id === scamId);
}

/**
 * Main game screen component.
 * Orchestrates the game loop, stores, and UI.
 */
export function GameScreen(): React.ReactElement {
  // Get resources and actions from game store
  const resources = useGameStore((state) => state.resources);
  const addMoney = useGameStore((state) => state.addMoney);
  const addBots = useGameStore((state) => state.addBots);
  const addHeat = useGameStore((state) => state.addHeat);

  // Get scam states and actions from scam store
  const scams = useScamStore((state) => state.scams);
  const unlockScam = useScamStore((state) => state.unlockScam);
  const upgradeScam = useScamStore((state) => state.upgradeScam);
  const incrementCompletion = useScamStore((state) => state.incrementCompletion);

  // Ref to hold removeTimer function (needed for auto-collect in handleTimerComplete)
  const removeTimerRef = useRef<((scamId: string) => void) | null>(null);

  /**
   * Handle scam timer completion - award resources and auto-collect (remove timer)
   */
  const handleTimerComplete = useCallback(
    (timer: ScamTimer) => {
      const definition = getScamDefinition(timer.scamId);
      if (!definition) return;

      const scamState = scams[timer.scamId];
      if (!scamState) return;

      // Calculate reward based on level and trust
      const reward = calculateScamReward(
        definition,
        scamState.level,
        resources.trust
      );

      // Award the appropriate resource
      if (definition.resourceType === 'bots') {
        addBots(reward);
      } else {
        addMoney(reward);
      }

      // Add heat from the scam
      const heat = calculateHeatFromScam(definition);
      addHeat(heat);

      // Increment completion counter
      incrementCompletion(timer.scamId);

      // Auto-collect: remove the completed timer immediately
      if (removeTimerRef.current) {
        removeTimerRef.current(timer.scamId);
      }
    },
    [scams, resources.trust, addMoney, addBots, addHeat, incrementCompletion]
  );

  // Initialize the game loop
  const { start, engineState, addTimer, removeTimer } = useGameLoop({
    onTimerComplete: handleTimerComplete,
  });

  // Store removeTimer in ref for use in handleTimerComplete (auto-collect)
  removeTimerRef.current = removeTimer;

  // Start the game loop on mount
  useEffect(() => {
    start();
  }, [start]);

  // Create a map from scamId to active timer for quick lookup
  const timerMap = useMemo(() => {
    const map: Record<string, ScamTimer> = {};
    for (const timer of engineState.activeTimers) {
      map[timer.scamId] = timer;
    }
    return map;
  }, [engineState.activeTimers]);

  /**
   * Handle starting a scam
   */
  const handleStartScam = useCallback(
    (scamId: string) => {
      const definition = getScamDefinition(scamId);
      if (!definition) return;

      const scamState = scams[scamId];
      if (!scamState || !scamState.isUnlocked) return;

      // Check if already running
      if (timerMap[scamId]) return;

      // Calculate duration and start timer
      const duration = calculateScamDuration(definition, scamState.level);
      addTimer(scamId, duration);
    },
    [scams, timerMap, addTimer]
  );

  /**
   * Handle unlocking a scam
   */
  const handleUnlockScam = useCallback(
    (scamId: string) => {
      const definition = getScamDefinition(scamId);
      if (!definition) return;

      // Check cost
      if (definition.unlockCost !== undefined) {
        if (resources.money < definition.unlockCost) return;
        addMoney(-definition.unlockCost);
      }

      unlockScam(scamId);
    },
    [resources.money, addMoney, unlockScam]
  );

  /**
   * Handle upgrading a scam to the next level
   */
  const handleUpgradeScam = useCallback(
    (scamId: string) => {
      const definition = getScamDefinition(scamId);
      if (!definition) return;

      const scamState = scams[scamId];
      if (!scamState || !scamState.isUnlocked) return;

      // Check cost
      const upgradeCost = calculateUpgradeCost(definition, scamState.level);
      if (resources.money < upgradeCost) return;

      // Deduct cost and upgrade
      addMoney(-upgradeCost);
      upgradeScam(scamId);
    },
    [scams, resources.money, addMoney, upgradeScam]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TerminalText size="lg" color={COLORS.terminalGreen}>
          {'IDLE SCAMMER v0.1'}
        </TerminalText>
      </View>

      {/* Resource HUD */}
      <ResourceHUD
        resources={resources}
        compact
        style={styles.hud}
        testID="resource-hud"
      />

      {/* Scam cards list */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TerminalText
          size="md"
          color={COLORS.terminalGreenDim}
          style={styles.sectionTitle}
        >
          {'TIER 1: SMALL TIME'}
        </TerminalText>

        {TIER_1_SCAMS.map((scamDef) => (
          <ScamCard
            key={scamDef.id}
            scamDefinition={scamDef}
            scamState={scams[scamDef.id]}
            timer={timerMap[scamDef.id]}
            trust={resources.trust}
            money={resources.money}
            onStart={() => handleStartScam(scamDef.id)}
            onUnlock={() => handleUnlockScam(scamDef.id)}
            onUpgrade={() => handleUpgradeScam(scamDef.id)}
            testID={`scam-card-${scamDef.id}`}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    alignItems: 'center',
  },
  hud: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
});
