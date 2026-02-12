// ABOUTME: Main game screen that wires together all game systems
// ABOUTME: Displays ResourceHUD, ScamCards, managers, and handles game loop integration

import React, { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ResourceHUD } from '../components/ResourceHUD';
import { PrestigeModal } from '../components/PrestigeModal';
import { TerminalText } from '../components/TerminalText';
import { PixelButton } from '../components/PixelButton';
import { ResponsiveLayout } from '../components/ResponsiveLayout';
import { ScamListPanel } from '../components/ScamListPanel';
import { OpsPanel } from '../components/OpsPanel';
import { SkillsPanel } from '../components/SkillsPanel';
import { COLORS, SPACING } from '../components/theme';
import { useGameStore } from '../game/store';
import { useScamStore } from '../game/scams/scamStore';
import { useManagerStore } from '../game/managers/managerStore';
import { useEmployeeStore } from '../game/employees/employeeStore';
import { canHireEmployee, calculateEmployeeHeat, getUnlockCostForScam, getEmployeeCostForScam } from '../game/employees/calculations';
import { ALL_SCAMS, TIER_1_SCAMS } from '../game/scams/definitions';
import { TIER_2_SCAMS } from '../game/scams/tier2';
import { TIER_3_SCAMS } from '../game/scams/tier3';
import { TIER_4_SCAMS } from '../game/scams/tier4';
import { TIER_5_SCAMS } from '../game/scams/tier5';
import { getManagerByScamId, ALL_MANAGERS } from '../game/managers/definitions';
import {
  calculateScamDuration,
  calculateScamReward,
  calculateUpgradeCost,
  calculateMilestoneBonus,
  isMilestoneLevel,
  calculateMaxBuyCount,
  calculateMaxBuyCost,
  isTierFullyUnlocked,
} from '../game/scams/calculations';
import { calculateHeatFromScam, calculateHeatDecay, isPrestigeForced, isTierAccessible } from '../game/prestige/calculations';
import { executePrestige, fullReset } from '../game/prestige/prestigeManager';
import { MAX_HEAT } from '../game/prestige/constants';
import { useGameLoop, type TickResult } from '../game/engine/gameLoop';
import type { ScamTimer } from '../game/engine/types';
import type { ScamDefinition, ScamTier, ScamState } from '../game/scams/types';
import type { PrestigeResult } from '../game/prestige/types';
import { useBotStore } from '../game/bots/botStore';
import { BOT_GENERATION_RATES, IDLE_BOT_HEAT_REDUCTION } from '../game/bots/constants';
import { useSkillStore } from '../game/skills/skillStore';
import { getSkillRankCost } from '../game/skills/calculations';
import { ALL_ACTIVE_ABILITIES } from '../game/skills/abilities';

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
  const addSkillPoints = useGameStore((state) => state.addSkillPoints);

  // Get scam states and actions from scam store
  const scams = useScamStore((state) => state.scams);
  const unlockScam = useScamStore((state) => state.unlockScam);
  const upgradeScam = useScamStore((state) => state.upgradeScam);
  const upgradeScamByLevels = useScamStore((state) => state.upgradeScamByLevels);
  const incrementCompletion = useScamStore((state) => state.incrementCompletion);

  // Get manager states and actions from manager store
  const hireManager = useManagerStore((state) => state.hireManager);
  const isManagerHired = useManagerStore((state) => state.isManagerHired);

  // Get employee actions from employee store
  const hireEmployee = useEmployeeStore((state) => state.hireEmployee);

  // Get skill states from skill store
  const passiveRanks = useSkillStore((state) => state.passiveRanks);
  const skillAbilities = useSkillStore((state) => state.abilities);

  // Prestige modal state
  const [showPrestige, setShowPrestige] = useState(false);
  const [prestigePhase, setPrestigePhase] = useState<'choice' | 'result'>('choice');
  const [prestigeResult, setPrestigeResult] = useState<PrestigeResult | undefined>(undefined);

  // Reset confirmation state
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Shared collapse state for tier sections (scam list + manager panel)
  const [collapsedTiers, setCollapsedTiers] = useState<Set<ScamTier>>(new Set());
  const toggleTier = useCallback((tier: ScamTier) => {
    setCollapsedTiers((prev) => {
      const next = new Set(prev);
      if (next.has(tier)) {
        next.delete(tier);
      } else {
        next.add(tier);
      }
      return next;
    });
  }, []);

  // Ref guard to prevent double-triggering prestige (stale closures in useCallback)
  const showPrestigeRef = useRef(false);

  // Refs to hold timer and loop control functions
  const removeTimerRef = useRef<((scamId: string) => void) | null>(null);
  const addTimerRef = useRef<((scamId: string, durationMs: number) => void) | null>(null);
  const pauseRef = useRef<(() => void) | null>(null);
  const completeAllTimersRef = useRef<(() => void) | null>(null);

  /**
   * Helper to get current skill bonuses and active effects from the skill store.
   * Always reads fresh state via getState() to avoid stale closures.
   */
  function getSkillModifiers() {
    const skillStore = useSkillStore.getState();
    return {
      bonuses: skillStore.getSkillBonuses(),
      effects: skillStore.getActiveEffects(),
    };
  }

  /**
   * Compute the skill-based duration multiplier from passive + active effects.
   * Overclock reduces duration, Zero Day active ability speeds up.
   */
  function getSkillDurationParams() {
    const { bonuses, effects } = getSkillModifiers();
    return {
      skillDurationMultiplier: 1 - bonuses.durationReduction,
      activeSpeedMultiplier: effects.speedMultiplier,
    };
  }

  /**
   * Compute the skill-based reward multiplier from passive + active effects.
   * Silver Tongue applies to all scams; Creative Accounting to money; Hype Machine to reputation.
   */
  function getSkillRewardParams(resourceType: string = 'money') {
    const { bonuses, effects } = getSkillModifiers();
    // Silver Tongue (rewardBonus) applies to all scam types
    let skillRewardMultiplier = 1 + bonuses.rewardBonus;
    // Creative Accounting (moneyBonus) applies to all scams
    skillRewardMultiplier *= (1 + bonuses.moneyBonus);
    // Hype Machine (reputationBonus) stacks on top for reputation scams
    if (resourceType === 'reputation') {
      skillRewardMultiplier *= (1 + bonuses.reputationBonus);
    }
    return {
      skillRewardMultiplier,
      activeRewardMultiplier: effects.rewardMultiplier,
    };
  }

  /**
   * Handle scam timer completion - award resources, auto-collect, and manager auto-restart
   */
  const handleTimerComplete = useCallback(
    (timer: ScamTimer) => {
      const definition = getScamDefinition(timer.scamId);
      if (!definition) return;

      const scamState = scams[timer.scamId];
      if (!scamState) return;

      // Get bot bonuses for this scam, amplified by skill passives
      const { bonuses: skillBonuses, effects: activeEffects } = getSkillModifiers();
      const rawBotBonuses = useBotStore.getState().getScamBotBonuses(timer.scamId);
      const amplifiedProfitBonus = rawBotBonuses.profitBonus * (1 + skillBonuses.botProfitAmplifier);

      // Employee bonuses, optionally amplified by Deep Fake active ability
      const { rewardBonus: rawRewardBonus } = useEmployeeStore.getState().getScamBonuses(timer.scamId);
      const employeeRewardBonus = rawRewardBonus * activeEffects.employeeBonusMultiplier;

      // Skill reward params (resource type affects Hype Machine bonus)
      const { skillRewardMultiplier, activeRewardMultiplier } = getSkillRewardParams(definition.resourceType);

      const reward = calculateScamReward(
        definition,
        scamState.level,
        resources.trust,
        amplifiedProfitBonus,
        employeeRewardBonus,
        skillRewardMultiplier,
        activeRewardMultiplier
      );

      // Award money
      addMoney(reward);

      // Add heat from the scam (unless VPN Tunnel is active)
      if (!activeEffects.zeroHeatGain) {
        const totalBots = useGameStore.getState().resources.bots;
        const unassignedBots = useBotStore.getState().getAvailableBots(totalBots);
        const heatMultiplier = 1 / (1 + IDLE_BOT_HEAT_REDUCTION * unassignedBots);
        const skillHeatGainMultiplier = 1 - skillBonuses.heatGainReduction;
        const heat = calculateHeatFromScam(definition, skillHeatGainMultiplier) * heatMultiplier;
        addHeat(heat);
      }

      // Generate fractional bots from scam completion
      addBots(BOT_GENERATION_RATES[definition.tier]);

      // Increment completion counter
      incrementCompletion(timer.scamId);

      // Check if heat has reached max (with skill threshold bonus)
      const currentHeat = useGameStore.getState().resources.heat;
      if (isPrestigeForced(currentHeat, skillBonuses.heatThresholdBonus) && !showPrestigeRef.current) {
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
        const amplifiedSpeedBonus = rawBotBonuses.speedBonus * (1 + skillBonuses.botSpeedAmplifier);
        const { skillDurationMultiplier, activeSpeedMultiplier } = getSkillDurationParams();
        const employeeSpeedBonus = speedBonus * activeEffects.employeeBonusMultiplier;
        const duration = calculateScamDuration(
          definition, scamState.level, employeeSpeedBonus, amplifiedSpeedBonus,
          skillDurationMultiplier, activeSpeedMultiplier
        );
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
   * Handle tick - apply heat decay, employee heat, skill cooldowns, and passive income
   */
  const handleTick = useCallback(
    (result: TickResult) => {
      if (result.deltaMs <= 0) return;

      const deltaSeconds = result.deltaMs / 1000;
      const { bonuses: skillBonuses, effects: activeEffects } = getSkillModifiers();

      // Tick skill cooldowns and active durations
      useSkillStore.getState().tickCooldowns(result.deltaMs);

      // Apply heat decay (trust + skill Dirty Cops bonus boosts decay rate)
      const currentHeat = useGameStore.getState().resources.heat;
      if (currentHeat > 0) {
        const currentTrust = useGameStore.getState().resources.trust;
        const decayedHeat = calculateHeatDecay(currentHeat, deltaSeconds, currentTrust);
        // Apply skill decay bonus on top: extra decay as fraction of base rate
        const skillExtraDecay = skillBonuses.heatDecayBonus > 0
          ? currentHeat * (1 - Math.exp(-skillBonuses.heatDecayBonus * 0.001 * deltaSeconds))
          : 0;
        const heatLost = (currentHeat - decayedHeat) + skillExtraDecay;
        if (heatLost > 0) {
          addHeat(-heatLost);
        }
      }

      // Apply employee heat generation (unless VPN Tunnel is active)
      if (!activeEffects.zeroHeatGain) {
        const totalEmployees = useEmployeeStore.getState().getAllEmployeeStates()
          .reduce((sum, e) => sum + e.count, 0);
        if (totalEmployees > 0) {
          const skillHeatGainMultiplier = 1 - skillBonuses.heatGainReduction;
          const employeeHeat = calculateEmployeeHeat(totalEmployees, deltaSeconds) * skillHeatGainMultiplier;
          addHeat(employeeHeat);
        }
      }

      // Compound Interest passive income (scaled by trust^0.3)
      if (skillBonuses.passiveIncomePerSec > 0) {
        const currentTrust = useGameStore.getState().resources.trust;
        const trustScaling = Math.pow(currentTrust, 0.3);
        const passiveIncome = skillBonuses.passiveIncomePerSec * trustScaling * deltaSeconds;
        addMoney(passiveIncome);
      }
    },
    [addHeat, addMoney]
  );

  // Initialize the game loop
  const { start, stop, pause, engineState, addTimer, removeTimer, rescaleTimerDurations } = useGameLoop({
    onTick: handleTick,
    onTimerComplete: handleTimerComplete,
  });

  // Store timer and loop control functions in refs for use in callbacks
  removeTimerRef.current = removeTimer;
  addTimerRef.current = addTimer;
  pauseRef.current = pause;

  // Build a function to complete all timers (for DDoS Burst)
  completeAllTimersRef.current = useCallback(() => {
    for (const timer of engineState.activeTimers) {
      const definition = getScamDefinition(timer.scamId);
      if (!definition) continue;
      const scamState = scams[timer.scamId];
      if (!scamState) continue;
      // Simulate completion
      handleTimerComplete(timer);
    }
  }, [engineState.activeTimers, scams, handleTimerComplete]);

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

      // Calculate duration with employee, bot, and skill bonuses
      const { speedBonus } = useEmployeeStore.getState().getScamBonuses(scamId);
      const rawBotBonuses = useBotStore.getState().getScamBotBonuses(scamId);
      const { bonuses: skillBonuses, effects: activeEffects } = getSkillModifiers();
      const amplifiedSpeedBonus = rawBotBonuses.speedBonus * (1 + skillBonuses.botSpeedAmplifier);
      const { skillDurationMultiplier, activeSpeedMultiplier } = getSkillDurationParams();
      const employeeSpeedBonus = speedBonus * activeEffects.employeeBonusMultiplier;
      const duration = calculateScamDuration(
        definition, scamState.level, employeeSpeedBonus, amplifiedSpeedBonus,
        skillDurationMultiplier, activeSpeedMultiplier
      );
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

      // Tier gate: previous tier must be fully unlocked before unlocking scams in this tier
      if (definition.tier > 1 && !isTierFullyUnlocked(definition.tier - 1, scams)) return;

      // Check cost using dynamic formula
      const dynamicCost = getUnlockCostForScam(scamId);
      if (dynamicCost !== undefined) {
        if (resources.money < dynamicCost) return;
        addMoney(-dynamicCost);
      }

      unlockScam(scamId);
    },
    [resources.money, scams, addMoney, unlockScam]
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

      // Check cost (with skill Bulk Discount)
      const { bonuses: skillBonuses } = getSkillModifiers();
      const upgradeCost = calculateUpgradeCost(definition, scamState.level, skillBonuses.upgradeCostDiscount);
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
   * Handle buying the maximum affordable upgrades for a scam at once
   */
  const handleMaxBuyScam = useCallback(
    (scamId: string) => {
      const definition = getScamDefinition(scamId);
      if (!definition) return;

      const scamState = scams[scamId];
      if (!scamState || !scamState.isUnlocked) return;

      const count = calculateMaxBuyCount(definition, scamState.level, resources.money);
      if (count <= 0) return;

      const totalCost = calculateMaxBuyCost(definition, scamState.level, count);
      if (resources.money < totalCost) return;

      // Deduct cost and upgrade
      addMoney(-totalCost);
      upgradeScamByLevels(scamId, count);

      // Check for milestone bonuses within the purchased range
      const startLevel = scamState.level;
      for (let i = 1; i <= count; i++) {
        const lvl = startLevel + i;
        if (isMilestoneLevel(lvl)) {
          const milestoneBonus = calculateMilestoneBonus(definition, lvl, resources.trust);
          if (milestoneBonus > 0) {
            addMoney(milestoneBonus);
          }
        }
      }
    },
    [scams, resources.money, resources.trust, addMoney, upgradeScamByLevels]
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

      // Skill Recruitment Drive discount
      const { bonuses: skillBonuses } = getSkillModifiers();
      const cost = getEmployeeCostForScam(scamId, count, resources.snitchCount, skillBonuses.employeeCostDiscount);

      if (resources.money < cost) return;

      addMoney(-cost);
      hireEmployee(employeeId);
    },
    [resources.money, resources.trust, resources.snitchCount, addMoney, hireEmployee]
  );

  /**
   * Handle allocating a passive skill rank
   */
  const handleAllocateSkill = useCallback(
    (skillId: string) => {
      const currentRank = useSkillStore.getState().passiveRanks[skillId] ?? 0;
      const cost = getSkillRankCost(currentRank + 1);

      if (resources.skillPoints < cost) return;

      const success = useSkillStore.getState().allocateSkill(skillId);
      if (success) {
        addSkillPoints(-cost);
      }
    },
    [resources.skillPoints, addSkillPoints]
  );

  /**
   * Handle unlocking an active ability
   */
  const handleUnlockAbility = useCallback(
    (abilityId: string) => {
      const abilityDef = ALL_ACTIVE_ABILITIES.find((a) => a.id === abilityId);
      if (!abilityDef) return;

      if (resources.skillPoints < abilityDef.cost) return;

      const success = useSkillStore.getState().unlockAbility(abilityId);
      if (success) {
        addSkillPoints(-abilityDef.cost);
      }
    },
    [resources.skillPoints, addSkillPoints]
  );

  /**
   * Handle activating an active ability
   */
  const handleActivateAbility = useCallback(
    (abilityId: string) => {
      const success = useSkillStore.getState().activateAbility(abilityId);
      if (!success) return;

      // Handle instant abilities
      if (abilityId === 'ddos-burst') {
        // Instant-complete all running timers by simulating their completion
        if (completeAllTimersRef.current) {
          completeAllTimersRef.current();
        }
      } else if (abilityId === 'burner-phone-ability') {
        // Instant -30% current heat
        const currentHeat = useGameStore.getState().resources.heat;
        if (currentHeat > 0) {
          const reduction = currentHeat * 0.30;
          addHeat(-reduction);
        }
      } else if (abilityId === 'zero-day') {
        // Rescale all running timers to reflect 3x speed boost
        const abilityDef = ALL_ACTIVE_ABILITIES.find((a) => a.id === 'zero-day');
        if (abilityDef) {
          rescaleTimerDurations(abilityDef.effectValue);
        }
      }
    },
    [addHeat, rescaleTimerDurations]
  );

  /**
   * Handle voluntary prestige - player clicks "FLEE THE COUNTRY" in OpsPanel
   */
  const handleVoluntaryPrestige = useCallback(() => {
    if (showPrestigeRef.current) return;
    showPrestigeRef.current = true;
    setShowPrestige(true);
    setPrestigePhase('choice');
    setPrestigeResult(undefined);
    if (pauseRef.current) {
      pauseRef.current();
    }
  }, []);

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
        heatMax={MAX_HEAT + (useSkillStore.getState().getSkillBonuses().heatThresholdBonus)}
        compact
        style={styles.hud}
        testID="resource-hud"
      />

      {/* Three-column layout (wide) or tabbed layout (narrow) */}
      <ResponsiveLayout
        scamsContent={
          <ScamListPanel
            resources={resources}
            scams={scams}
            timerMap={timerMap}
            nextGoalScamId={nextGoalScamId}
            onStart={handleStartScam}
            onUnlock={handleUnlockScam}
            onUpgrade={handleUpgradeScam}
            onMaxBuy={handleMaxBuyScam}
            onHireEmployee={handleHireEmployee}
            collapsedTiers={collapsedTiers}
            onToggleTier={toggleTier}
            testID="scam-list-panel"
          />
        }
        skillsContent={
          <SkillsPanel
            skillPoints={resources.skillPoints}
            passiveRanks={passiveRanks}
            abilities={skillAbilities}
            onAllocateSkill={handleAllocateSkill}
            onUnlockAbility={handleUnlockAbility}
            onActivateAbility={handleActivateAbility}
            testID="skills-panel"
          />
        }
        opsContent={
          <OpsPanel
            resources={resources}
            scams={scams}
            isManagerHired={isManagerHired}
            onHireManager={handleHireManager}
            onPrestige={handleVoluntaryPrestige}
            collapsedTiers={collapsedTiers}
            onToggleTier={toggleTier}
            testID="ops-panel"
          />
        }
      />

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
