// ABOUTME: Main game screen that wires together all game systems
// ABOUTME: Displays ResourceHUD, ScamCards, managers, and handles game loop integration

import React, { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ResourceHUD } from '../components/ResourceHUD';
import { ScamCard } from '../components/ScamCard';
import { PrestigeModal } from '../components/PrestigeModal';
import { TerminalText } from '../components/TerminalText';
import { PixelButton } from '../components/PixelButton';
import { CRTFrame } from '../components/CRTFrame';
import { COLORS, SPACING } from '../components/theme';
import { useGameStore } from '../game/store';
import { useScamStore } from '../game/scams/scamStore';
import { useManagerStore } from '../game/managers/managerStore';
import { useEmployeeStore } from '../game/employees/employeeStore';
import { getEmployeesByScamId } from '../game/employees/definitions';
import { getEmployeeCostForScam, canHireEmployee, getMaxEmployeesPerType, calculateEmployeeHeat, getUnlockCostForScam, getManagerCostForScam } from '../game/employees/calculations';
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
import { executePrestige, fullReset } from '../game/prestige/prestigeManager';
import { MAX_HEAT } from '../game/prestige/constants';
import { useGameLoop, type TickResult } from '../game/engine/gameLoop';
import { formatNumber } from '../utils/formatters';
import type { ScamTimer } from '../game/engine/types';
import type { ScamDefinition, ScamTier } from '../game/scams/types';
import type { PrestigeResult } from '../game/prestige/types';
import { useBotStore } from '../game/bots/botStore';
import { BOT_GENERATION_RATES, IDLE_BOT_HEAT_REDUCTION } from '../game/bots/constants';

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
  const addBots = useGameStore((state) => state.addBots);

  // Get scam states and actions from scam store
  const scams = useScamStore((state) => state.scams);
  const unlockScam = useScamStore((state) => state.unlockScam);
  const upgradeScam = useScamStore((state) => state.upgradeScam);
  const incrementCompletion = useScamStore((state) => state.incrementCompletion);

  // Get manager states and actions from manager store
  const hireManager = useManagerStore((state) => state.hireManager);
  const isManagerHired = useManagerStore((state) => state.isManagerHired);

  // Get employee states and actions from employee store
  const employees = useEmployeeStore((state) => state.employees);
  const hireEmployee = useEmployeeStore((state) => state.hireEmployee);

  // Prestige modal state
  const [showPrestige, setShowPrestige] = useState(false);
  const [prestigePhase, setPrestigePhase] = useState<'choice' | 'result'>('choice');
  const [prestigeResult, setPrestigeResult] = useState<PrestigeResult | undefined>(undefined);

  // Reset confirmation state
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Ref guard to prevent double-triggering prestige (stale closures in useCallback)
  const showPrestigeRef = useRef(false);

  // Refs to hold timer and loop control functions
  const removeTimerRef = useRef<((scamId: string) => void) | null>(null);
  const addTimerRef = useRef<((scamId: string, durationMs: number) => void) | null>(null);
  const pauseRef = useRef<(() => void) | null>(null);

  /**
   * Handle scam timer completion - award resources, auto-collect, and manager auto-restart
   */
  const handleTimerComplete = useCallback(
    (timer: ScamTimer) => {
      const definition = getScamDefinition(timer.scamId);
      if (!definition) return;

      const scamState = scams[timer.scamId];
      if (!scamState) return;

      // Get bot bonuses for this scam
      const botBonuses = useBotStore.getState().getScamBotBonuses(timer.scamId);

      // Calculate reward based on level, trust, employee bonuses, and bot profit bonus
      const { rewardBonus } = useEmployeeStore.getState().getScamBonuses(timer.scamId);
      const reward = calculateScamReward(
        definition,
        scamState.level,
        resources.trust,
        botBonuses.profitBonus,
        rewardBonus
      );

      // Award money
      addMoney(reward);

      // Add heat from the scam, reduced by unassigned idle bots
      const totalBots = useGameStore.getState().resources.bots;
      const unassignedBots = useBotStore.getState().getAvailableBots(totalBots);
      const heatMultiplier = 1 / (1 + IDLE_BOT_HEAT_REDUCTION * unassignedBots);
      const heat = calculateHeatFromScam(definition) * heatMultiplier;
      addHeat(heat);

      // Generate fractional bots from scam completion
      addBots(BOT_GENERATION_RATES[definition.tier]);

      // Increment completion counter
      incrementCompletion(timer.scamId);

      // Check if heat has reached max (triggers prestige)
      const currentHeat = useGameStore.getState().resources.heat;
      if (currentHeat >= MAX_HEAT && !showPrestigeRef.current) {
        showPrestigeRef.current = true;
        setShowPrestige(true);
        setPrestigePhase('choice');
        setPrestigeResult(undefined);
        // Pause the game loop while prestige modal is shown
        if (pauseRef.current) {
          pauseRef.current();
        }
      }

      // Auto-collect: remove the completed timer immediately
      if (removeTimerRef.current) {
        removeTimerRef.current(timer.scamId);
      }

      // Manager auto-restart: if manager is hired, start the scam again
      const manager = getManagerByScamId(timer.scamId);
      if (manager && isManagerHired(manager.id) && addTimerRef.current) {
        // Schedule auto-restart on next tick to avoid state conflicts
        const { speedBonus } = useEmployeeStore.getState().getScamBonuses(timer.scamId);
        const botSpeedBonus = useBotStore.getState().getScamBotBonuses(timer.scamId).speedBonus;
        const duration = calculateScamDuration(definition, scamState.level, speedBonus, botSpeedBonus);
        setTimeout(() => {
          if (addTimerRef.current) {
            addTimerRef.current(timer.scamId, duration);
          }
        }, 0);
      }
    },
    [scams, resources.trust, addMoney, addHeat, addBots, incrementCompletion, isManagerHired]
  );

  /**
   * Handle tick - apply heat decay each frame
   */
  const handleTick = useCallback(
    (result: TickResult) => {
      if (result.deltaMs <= 0) return;

      const deltaSeconds = result.deltaMs / 1000;

      // Apply heat decay (trust boosts decay rate via criminal network)
      const currentHeat = useGameStore.getState().resources.heat;
      if (currentHeat > 0) {
        const currentTrust = useGameStore.getState().resources.trust;
        const decayedHeat = calculateHeatDecay(currentHeat, deltaSeconds, currentTrust);
        const heatLost = currentHeat - decayedHeat;
        if (heatLost > 0) {
          addHeat(-heatLost);
        }
      }

      // Apply employee heat generation
      const totalEmployees = useEmployeeStore.getState().getAllEmployeeStates()
        .reduce((sum, e) => sum + e.count, 0);
      if (totalEmployees > 0) {
        const employeeHeat = calculateEmployeeHeat(totalEmployees, deltaSeconds);
        addHeat(employeeHeat);
      }
    },
    [addHeat]
  );

  // Initialize the game loop
  const { start, stop, pause, engineState, addTimer, removeTimer } = useGameLoop({
    onTick: handleTick,
    onTimerComplete: handleTimerComplete,
  });

  // Store timer and loop control functions in refs for use in callbacks
  removeTimerRef.current = removeTimer;
  addTimerRef.current = addTimer;
  pauseRef.current = pause;

  // Start the game loop on mount
  useEffect(() => {
    start();
  }, [start]);

  // Auto-start managed scams after load
  // GameProvider guarantees stores are hydrated before this component mounts,
  // so we can safely read manager/scam state here.
  useEffect(() => {
    for (const managerDef of ALL_MANAGERS) {
      const managerHired = useManagerStore.getState().isManagerHired(managerDef.id);
      if (!managerHired) continue;

      const scamState = useScamStore.getState().scams[managerDef.scamId];
      if (!scamState?.isUnlocked) continue;

      const definition = ALL_SCAMS.find((s) => s.id === managerDef.scamId);
      if (!definition) continue;

      const { speedBonus } = useEmployeeStore.getState().getScamBonuses(managerDef.scamId);
      const botSpeedBonus = useBotStore.getState().getScamBotBonuses(managerDef.scamId).speedBonus;
      const duration = calculateScamDuration(definition, scamState.level, speedBonus, botSpeedBonus);
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
        const dynamicCost = getUnlockCostForScam(scamDef.id);
        if (dynamicCost === undefined) return false;
        return resources.money < dynamicCost;
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

      // Calculate duration with employee and bot speed bonuses
      const { speedBonus } = useEmployeeStore.getState().getScamBonuses(scamId);
      const botSpeedBonus = useBotStore.getState().getScamBotBonuses(scamId).speedBonus;
      const duration = calculateScamDuration(definition, scamState.level, speedBonus, botSpeedBonus);
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

      // Check cost using dynamic formula
      const dynamicCost = getUnlockCostForScam(scamId);
      if (dynamicCost !== undefined) {
        if (resources.money < dynamicCost) return;
        addMoney(-dynamicCost);
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
        const { speedBonus } = useEmployeeStore.getState().getScamBonuses(scamId);
        const botSpeedBonus = useBotStore.getState().getScamBotBonuses(scamId).speedBonus;
        const duration = calculateScamDuration(definition, scamState.level, speedBonus, botSpeedBonus);
        addTimer(scamId, duration);
      }
    },
    [resources.money, addMoney, hireManager, isManagerHired, scams, timerMap, addTimer]
  );

  /**
   * Handle hiring an employee for a scam
   */
  const handleHireEmployee = useCallback(
    (employeeId: string, scamId: string) => {
      const count = useEmployeeStore.getState().getEmployeeCount(employeeId);

      // Trust-based cap: can't hire more than trust level per type
      if (!canHireEmployee(resources.trust, count)) return;

      const cost = getEmployeeCostForScam(scamId, count, resources.snitchCount);

      if (resources.money < cost) return;

      addMoney(-cost);
      hireEmployee(employeeId);
    },
    [resources.money, resources.trust, resources.snitchCount, addMoney, hireEmployee]
  );

  /**
   * Handle prestige choice - execute prestige and show result
   */
  const handlePrestigeChoice = useCallback(
    (choice: 'clean-escape' | 'snitch') => {
      const result = executePrestige(choice);
      setPrestigeResult(result);
      setPrestigePhase('result');
    },
    []
  );

  /**
   * Handle prestige continue - hide modal and restart the game loop
   */
  const handlePrestigeContinue = useCallback(() => {
    setShowPrestige(false);
    showPrestigeRef.current = false;
    setPrestigePhase('choice');
    setPrestigeResult(undefined);
    // Stop and restart the game loop for a clean slate
    stop();
    start();
  }, [stop, start]);

  /**
   * Handle full game reset - wipe everything including trust
   */
  const handleResetConfirm = useCallback(() => {
    setShowResetConfirm(false);
    fullReset();
    stop();
    start();
  }, [stop, start]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TerminalText size="lg" color={COLORS.terminalGreen}>
          {'IDLE SCAMMER v0.1'}
        </TerminalText>
        {!showResetConfirm ? (
          <PixelButton
            onPress={() => setShowResetConfirm(true)}
            variant="danger"
            style={styles.resetButton}
            testID="reset-btn"
          >
            {'RESET'}
          </PixelButton>
        ) : (
          <View style={styles.resetConfirm}>
            <TerminalText size="sm" color={COLORS.warningRed}>
              {'WIPE EVERYTHING?'}
            </TerminalText>
            <View style={styles.resetConfirmButtons}>
              <PixelButton
                onPress={handleResetConfirm}
                variant="danger"
                testID="reset-confirm-btn"
              >
                {'YES'}
              </PixelButton>
              <PixelButton
                onPress={() => setShowResetConfirm(false)}
                variant="secondary"
                testID="reset-cancel-btn"
              >
                {'NO'}
              </PixelButton>
            </View>
          </View>
        )}
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

          // Filter managers for this tier
          const tierManagers = ALL_MANAGERS.filter((mgr) => {
            return tierScams.some((s) => s.id === mgr.scamId);
          });

          // Filter visible scams
          const visibleScams = tierScams.filter((scamDef) => {
            const scamState = scams[scamDef.id];
            if (scamState?.isUnlocked) return true;
            const dynamicCost = getUnlockCostForScam(scamDef.id);
            if (dynamicCost === undefined) return true;
            if (resources.money >= dynamicCost) return true;
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

                // Look up employee for this scam
                const scamEmployees = getEmployeesByScamId(scamDef.id);
                const empDef = scamEmployees.length > 0 ? scamEmployees[0] : undefined;
                const empCount = empDef ? useEmployeeStore.getState().getEmployeeCount(empDef.id) : 0;
                const empBonuses = useEmployeeStore.getState().getScamBonuses(scamDef.id);
                const empCost = empDef ? getEmployeeCostForScam(scamDef.id, empCount, resources.snitchCount) : undefined;

                const empMaxCount = getMaxEmployeesPerType(resources.trust);

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
                    employeeDefinition={empDef}
                    employeeCount={empCount}
                    employeeMaxCount={empMaxCount}
                    employeeSpeedBonus={empBonuses.speedBonus}
                    employeeRewardBonus={empBonuses.rewardBonus}
                    onHireEmployee={empDef ? () => handleHireEmployee(empDef.id, scamDef.id) : undefined}
                    employeeHireCost={empCost}
                    unlockCost={getUnlockCostForScam(scamDef.id)}
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
                        const dynamicManagerCost = getManagerCostForScam(manager.scamId);
                        const canAfford = resources.money >= dynamicManagerCost;
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
                                {hired ? '✓ HIRED' : `$${formatNumber(dynamicManagerCost)}`}
                              </TerminalText>
                            </View>
                            {!hired && scamUnlocked && (
                              <PixelButton
                                onPress={() => handleHireManager(manager.id, dynamicManagerCost, manager.scamId)}
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

      {/* Prestige modal overlay */}
      <PrestigeModal
        visible={showPrestige}
        phase={prestigePhase}
        resources={resources}
        result={prestigeResult}
        onChoose={handlePrestigeChoice}
        onContinue={handlePrestigeContinue}
      />
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
  resetButton: {
    marginTop: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  resetConfirm: {
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  resetConfirmButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
});
