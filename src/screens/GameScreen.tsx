// ABOUTME: Main game screen that wires together all game systems
// ABOUTME: Displays ResourceHUD, ScamCards, managers, and handles game loop integration

import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ResourceHUD } from '../components/ResourceHUD';
import { ScamCard } from '../components/ScamCard';
import { TerminalText } from '../components/TerminalText';
import { PixelButton } from '../components/PixelButton';
import { CRTFrame } from '../components/CRTFrame';
import { COLORS, SPACING } from '../components/theme';
import { useGameStore } from '../game/store';
import { useScamStore } from '../game/scams/scamStore';
import { useManagerStore } from '../game/managers/managerStore';
import { TIER_1_SCAMS } from '../game/scams/definitions';
import { getManagerByScamId, TIER_1_MANAGERS } from '../game/managers/definitions';
import { getManagerPortrait } from '../game/assets';
import {
  calculateScamDuration,
  calculateScamReward,
  calculateUpgradeCost,
  calculateMilestoneBonus,
  isMilestoneLevel,
} from '../game/scams/calculations';
import { calculateHeatFromScam, isTierAccessible } from '../game/prestige/calculations';
import { useGameLoop } from '../game/engine/gameLoop';
import { formatNumber } from '../utils/formatters';
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
  const addHeat = useGameStore((state) => state.addHeat);

  // Get scam states and actions from scam store
  const scams = useScamStore((state) => state.scams);
  const unlockScam = useScamStore((state) => state.unlockScam);
  const upgradeScam = useScamStore((state) => state.upgradeScam);
  const incrementCompletion = useScamStore((state) => state.incrementCompletion);

  // Get manager states and actions from manager store
  const hireManager = useManagerStore((state) => state.hireManager);
  const isManagerHired = useManagerStore((state) => state.isManagerHired);

  // Refs to hold timer functions (needed for auto-collect and manager auto-restart)
  const removeTimerRef = useRef<((scamId: string) => void) | null>(null);
  const addTimerRef = useRef<((scamId: string, durationMs: number) => void) | null>(null);

  /**
   * Handle scam timer completion - award resources, auto-collect, and manager auto-restart
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

      // Award money
      addMoney(reward);

      // Add heat from the scam
      const heat = calculateHeatFromScam(definition);
      addHeat(heat);

      // Increment completion counter
      incrementCompletion(timer.scamId);

      // Auto-collect: remove the completed timer immediately
      if (removeTimerRef.current) {
        removeTimerRef.current(timer.scamId);
      }

      // Manager auto-restart: if manager is hired, start the scam again
      const manager = getManagerByScamId(timer.scamId);
      if (manager && isManagerHired(manager.id) && addTimerRef.current) {
        // Schedule auto-restart on next tick to avoid state conflicts
        const duration = calculateScamDuration(definition, scamState.level);
        setTimeout(() => {
          if (addTimerRef.current) {
            addTimerRef.current(timer.scamId, duration);
          }
        }, 0);
      }
    },
    [scams, resources.trust, addMoney, addHeat, incrementCompletion, isManagerHired]
  );

  // Initialize the game loop
  const { start, engineState, addTimer, removeTimer } = useGameLoop({
    onTimerComplete: handleTimerComplete,
  });

  // Store timer functions in refs for use in handleTimerComplete
  removeTimerRef.current = removeTimer;
  addTimerRef.current = addTimer;

  // Start the game loop on mount
  useEffect(() => {
    start();
  }, [start]);

  // Auto-start managed scams after load
  // GameProvider guarantees stores are hydrated before this component mounts,
  // so we can safely read manager/scam state here.
  useEffect(() => {
    for (const managerDef of TIER_1_MANAGERS) {
      // Skip bot farms since they're handled separately
      if (managerDef.scamId === 'bot-farms') continue;

      const managerHired = useManagerStore.getState().isManagerHired(managerDef.id);
      if (!managerHired) continue;

      const scamState = useScamStore.getState().scams[managerDef.scamId];
      if (!scamState?.isUnlocked) continue;

      const definition = TIER_1_SCAMS.find((s) => s.id === managerDef.scamId);
      if (!definition) continue;

      const duration = calculateScamDuration(definition, scamState.level);
      addTimer(managerDef.scamId, duration);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create a map from scamId to active timer for quick lookup
  const timerMap = useMemo(() => {
    const map: Record<string, ScamTimer> = {};
    for (const timer of engineState.activeTimers) {
      map[timer.scamId] = timer;
    }
    return map;
  }, [engineState.activeTimers]);

  // Find the cheapest locked, unaffordable scam to show as the "save toward" goal.
  // TIER_1_SCAMS is sorted by ascending unlock cost, so the first match is the cheapest.
  const nextGoalScamId = useMemo(() => {
    const goal = TIER_1_SCAMS.find((scamDef) => {
      if (!isTierAccessible(scamDef.tier, resources.trust)) return false;
      const scamState = scams[scamDef.id];
      if (scamState?.isUnlocked) return false;
      if (scamDef.unlockCost === undefined) return false;
      return resources.money < scamDef.unlockCost;
    });
    return goal?.id;
  }, [scams, resources.money, resources.trust]);

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

      // Calculate the new level after upgrade
      const newLevel = scamState.level + 1;

      // Deduct cost and upgrade
      addMoney(-upgradeCost);
      upgradeScam(scamId);

      // Pay out milestone bonus if reaching a milestone level
      if (isMilestoneLevel(newLevel)) {
        const milestoneBonus = calculateMilestoneBonus(definition, newLevel, resources.trust);
        if (milestoneBonus > 0) {
          addMoney(milestoneBonus);
          console.log(`🎉 MILESTONE L${newLevel}! Bonus: $${milestoneBonus}`);
        }
      }
    },
    [scams, resources.money, resources.trust, addMoney, upgradeScam]
  );

  /**
   * Handle hiring a manager - immediately starts automating the scam
   */
  const handleHireManager = useCallback(
    (managerId: string, cost: number, scamId: string) => {
      // Check if already hired
      if (isManagerHired(managerId)) return;

      // Check cost
      if (resources.money < cost) return;

      // Deduct cost and hire
      addMoney(-cost);
      hireManager(managerId);

      // Auto-start the scam if not already running
      const definition = getScamDefinition(scamId);
      const scamState = scams[scamId];
      if (definition && scamState?.isUnlocked && !timerMap[scamId]) {
        const duration = calculateScamDuration(definition, scamState.level);
        addTimer(scamId, duration);
      }
    },
    [resources.money, addMoney, hireManager, isManagerHired, scams, timerMap, addTimer]
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
        {/* Tier 1 Scams Section */}
        <TerminalText
          size="md"
          color={COLORS.terminalGreenDim}
          style={styles.sectionTitle}
        >
          {'TIER 1: SMALL TIME'}
        </TerminalText>

        {TIER_1_SCAMS
          .filter((scamDef) => {
            // Only show scams from accessible tiers
            if (!isTierAccessible(scamDef.tier, resources.trust)) {
              return false;
            }
            // Show if already unlocked
            const scamState = scams[scamDef.id];
            if (scamState?.isUnlocked) {
              return true;
            }
            // Show if free to unlock (no cost)
            if (scamDef.unlockCost === undefined) {
              return true;
            }
            // Show if player can afford to unlock
            if (resources.money >= scamDef.unlockCost) {
              return true;
            }
            // Show the next unaffordable scam so players know what to save toward
            return scamDef.id === nextGoalScamId;
          })
          .map((scamDef) => {
            const manager = getManagerByScamId(scamDef.id);
            const hasManager = manager ? isManagerHired(manager.id) : false;
            return (
              <ScamCard
                key={scamDef.id}
                scamDefinition={scamDef}
                scamState={scams[scamDef.id]}
                timer={timerMap[scamDef.id]}
                trust={resources.trust}
                money={resources.money}
                hasManager={hasManager}
                onStart={() => handleStartScam(scamDef.id)}
                onUnlock={() => handleUnlockScam(scamDef.id)}
                onUpgrade={() => handleUpgradeScam(scamDef.id)}
                testID={`scam-card-${scamDef.id}`}
              />
            );
          })}

        {/* Managers Section */}
        <TerminalText
          size="md"
          color={COLORS.terminalGreenDim}
          style={styles.sectionTitle}
        >
          {'MANAGERS'}
        </TerminalText>

        <CRTFrame style={styles.managersSection}>
          <TerminalText size="sm" color={COLORS.terminalGreenDim}>
            {'Managers automate your scams'}
          </TerminalText>
          <View style={styles.managersList}>
            {TIER_1_MANAGERS.filter((mgr) => mgr.scamId !== 'bot-farms').map((manager) => {
              const hired = isManagerHired(manager.id);
              const canAfford = resources.money >= manager.cost;
              const scamState = scams[manager.scamId];
              const scamUnlocked = scamState?.isUnlocked ?? false;

              const portrait = getManagerPortrait(manager.id);
              return (
                <View key={manager.id} style={styles.managerRow}>
                  {portrait && (
                    <Image source={portrait} style={styles.managerPortrait} />
                  )}
                  <View style={styles.managerInfo}>
                    <TerminalText size="sm" color={hired ? COLORS.terminalGreen : COLORS.terminalGreenDim}>
                      {manager.name}
                    </TerminalText>
                    <TerminalText size="sm" color={COLORS.terminalGreenDim}>
                      {hired ? '✓ HIRED' : `$${formatNumber(manager.cost)}`}
                    </TerminalText>
                  </View>
                  {!hired && scamUnlocked && (
                    <PixelButton
                      onPress={() => handleHireManager(manager.id, manager.cost, manager.scamId)}
                      disabled={!canAfford}
                      variant="primary"
                    >
                      HIRE
                    </PixelButton>
                  )}
                  {!hired && !scamUnlocked && (
                    <TerminalText size="sm" color={COLORS.terminalGreenDim}>
                      {'LOCKED'}
                    </TerminalText>
                  )}
                </View>
              );
            })}
          </View>
        </CRTFrame>
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
    marginTop: SPACING.lg,
  },
  managersSection: {
    marginBottom: SPACING.md,
  },
  managersList: {
    marginTop: SPACING.sm,
  },
  managerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.terminalGreenDim + '40',
  },
  managerPortrait: {
    width: 40,
    height: 40,
    marginRight: SPACING.sm,
  },
  managerInfo: {
    flex: 1,
  },
});
