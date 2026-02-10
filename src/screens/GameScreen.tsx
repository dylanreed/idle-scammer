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
import { ALL_SCAMS, TIER_1_SCAMS } from '../game/scams/definitions';
import { TIER_2_SCAMS } from '../game/scams/tier2';
import { TIER_3_SCAMS } from '../game/scams/tier3';
import { TIER_4_SCAMS } from '../game/scams/tier4';
import { TIER_5_SCAMS } from '../game/scams/tier5';
import { getManagerByScamId, ALL_MANAGERS } from '../game/managers/definitions';
import { getManagerPortrait } from '../game/assets';
import {
  calculateScamDuration,
  calculateScamReward,
  calculateUpgradeCost,
  calculateMilestoneBonus,
  isMilestoneLevel,
} from '../game/scams/calculations';
import { calculateHeatFromScam, calculateHeatDecay, isTierAccessible } from '../game/prestige/calculations';
import { useGameLoop, type TickResult } from '../game/engine/gameLoop';
import { formatNumber } from '../utils/formatters';
import type { ScamTimer } from '../game/engine/types';
import type { ScamDefinition, ScamTier } from '../game/scams/types';

/**
 * Tier display names shown as section headers
 */
const TIER_NAMES: Record<ScamTier, string> = {
  1: 'SMALL TIME',
  2: 'GETTING SERIOUS',
  3: 'BIG LEAGUES',
  4: 'ORGANIZED CRIME',
  5: 'MASTERMIND',
};

/**
 * Scam arrays grouped by tier for iteration
 */
const SCAMS_BY_TIER: { tier: ScamTier; scams: ScamDefinition[] }[] = [
  { tier: 1, scams: TIER_1_SCAMS },
  { tier: 2, scams: TIER_2_SCAMS },
  { tier: 3, scams: TIER_3_SCAMS },
  { tier: 4, scams: TIER_4_SCAMS },
  { tier: 5, scams: TIER_5_SCAMS },
];

/**
 * Look up a scam definition by ID across all tiers
 */
function getScamDefinition(scamId: string): ScamDefinition | undefined {
  return ALL_SCAMS.find((scam) => scam.id === scamId);
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

  /**
   * Handle tick - apply heat decay each frame
   */
  const handleTick = useCallback(
    (result: TickResult) => {
      if (result.deltaMs <= 0) return;
      const currentHeat = useGameStore.getState().resources.heat;
      if (currentHeat <= 0) return;

      const decayedHeat = calculateHeatDecay(currentHeat, result.deltaMs / 1000);
      const heatLost = currentHeat - decayedHeat;
      if (heatLost > 0) {
        addHeat(-heatLost);
      }
    },
    [addHeat]
  );

  // Initialize the game loop
  const { start, engineState, addTimer, removeTimer } = useGameLoop({
    onTick: handleTick,
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
    for (const managerDef of ALL_MANAGERS) {
      // Skip bot farms since they're handled separately
      if (managerDef.scamId === 'bot-farms') continue;

      const managerHired = useManagerStore.getState().isManagerHired(managerDef.id);
      if (!managerHired) continue;

      const scamState = useScamStore.getState().scams[managerDef.scamId];
      if (!scamState?.isUnlocked) continue;

      const definition = ALL_SCAMS.find((s) => s.id === managerDef.scamId);
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
  // Each tier's scams are sorted by ascending unlock cost; we check all accessible tiers.
  const nextGoalScamId = useMemo(() => {
    for (const { tier, scams: tierScams } of SCAMS_BY_TIER) {
      if (!isTierAccessible(tier, resources.trust)) continue;
      const goal = tierScams.find((scamDef) => {
        const scamState = scams[scamDef.id];
        if (scamState?.isUnlocked) return false;
        if (scamDef.unlockCost === undefined) return false;
        return resources.money < scamDef.unlockCost;
      });
      if (goal) return goal.id;
    }
    return undefined;
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
        {/* Per-Tier Sections: scams + managers */}
        {SCAMS_BY_TIER.map(({ tier, scams: tierScams }) => {
          const accessible = isTierAccessible(tier, resources.trust);
          if (!accessible) return null;

          // Filter managers for this tier (exclude bot-farms manager)
          const tierManagers = ALL_MANAGERS.filter((mgr) => {
            if (mgr.scamId === 'bot-farms') return false;
            return tierScams.some((s) => s.id === mgr.scamId);
          });

          // Filter visible scams
          const visibleScams = tierScams.filter((scamDef) => {
            const scamState = scams[scamDef.id];
            if (scamState?.isUnlocked) return true;
            if (scamDef.unlockCost === undefined) return true;
            if (resources.money >= scamDef.unlockCost) return true;
            return scamDef.id === nextGoalScamId;
          });

          if (visibleScams.length === 0 && tierManagers.length === 0) return null;

          return (
            <View key={`tier-${tier}`}>
              {/* Tier Header */}
              <TerminalText
                size="md"
                color={COLORS.terminalGreenDim}
                style={styles.sectionTitle}
              >
                {`TIER ${tier}: ${TIER_NAMES[tier]}`}
              </TerminalText>

              {/* Scam Cards */}
              {visibleScams.map((scamDef) => {
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

              {/* Tier Managers */}
              {tierManagers.length > 0 && (
                <>
                  <TerminalText
                    size="sm"
                    color={COLORS.terminalGreenDim}
                    style={styles.managersLabel}
                  >
                    {`TIER ${tier} MANAGERS`}
                  </TerminalText>
                  <CRTFrame style={styles.managersSection}>
                    <TerminalText size="sm" color={COLORS.terminalGreenDim}>
                      {'Managers automate your scams'}
                    </TerminalText>
                    <View style={styles.managersList}>
                      {tierManagers.map((manager) => {
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
                </>
              )}
            </View>
          );
        })}
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
  managersLabel: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
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
