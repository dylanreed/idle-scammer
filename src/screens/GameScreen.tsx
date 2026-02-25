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
import { useTutorialStore } from '../game/tutorial/tutorialStore';
import { TUTORIAL_IDS, PRESTIGE_TUTORIAL_SEQUENCES } from '../game/tutorial/types';
import { TutorialModal } from '../components/TutorialModal';
import { useCryptoStore } from '../game/crypto/cryptoStore';
import { MARKET_TICK_INTERVAL_MS } from '../game/crypto/constants';
import { CryptoPanel } from '../components/CryptoPanel';
import { useOriginStore } from '../game/origin/originStore';
import { OriginSelectModal } from '../components/OriginSelectModal';
import { triggerHaptic } from '../utils/haptics';
import { formatNumber } from '../utils/formatters';
import type { OriginId } from '../game/origin/types';

/**
 * Tutorial modal content for each post-first-prestige introduction.
 */
const TUTORIAL_CONTENT: Record<string, { title: string; body: string[] }> = {
  [TUTORIAL_IDS.TRUST_INTRO]: {
    title: 'TRUST \u2014 Your Criminal Rep',
    body: [
      'Trust is the only resource that survives prestige. It\'s your lifetime reputation in the underworld.',
      'Higher trust = more starting Skill Points each run, access to higher tier scams, and a multiplier on all scam rewards.',
    ],
  },
  [TUTORIAL_IDS.BOTS_INTRO]: {
    title: 'BOTS \u2014 Your Digital Army',
    body: [
      'Every scam you complete generates fractional bots. You earned your first bot for surviving prestige.',
      'Assign bots to scams for speed or profit bonuses. Unassigned bots passively reduce heat buildup.',
    ],
  },
  [TUTORIAL_IDS.SKILL_POINTS_INTRO]: {
    title: 'SKILL POINTS \u2014 Per-Run Power',
    body: [
      'Each prestige run, you start with Skill Points based on your Trust level. Spend them on passive skills and active abilities.',
      'Skills reset every prestige \u2014 choose wisely each run. More Trust = more SP = more powerful builds.',
    ],
  },
  [TUTORIAL_IDS.SKILL_ABILITIES_INTRO]: {
    title: 'ABILITIES \u2014 Active Powers',
    body: [
      'You\u2019ve unlocked active abilities! These are powerful one-shot or timed effects you can trigger during a run.',
      'Spend SP to unlock abilities, then activate them when you need a burst of speed, profit, or heat relief.',
    ],
  },
  [TUTORIAL_IDS.PASSIVE_SKILLS_INTRO]: {
    title: 'PASSIVE SKILLS \u2014 Build Your Tree',
    body: [
      'The passive skill tree is now available! Four categories of persistent upgrades that last until prestige.',
      'Tech, Social, Finance, and Stealth \u2014 each category boosts a different aspect of your scam empire.',
    ],
  },
  [TUTORIAL_IDS.CRYPTO_INTRO]: {
    title: 'TRUSTCOIN \u2014 Your Crypto Empire',
    body: [
      'Welcome to the TrustCoin Exchange! Convert your cash to $TRUST and back \u2014 the exchange rate shifts every few seconds.',
      'Invest $TRUST in projects for returns. Higher-tier projects take longer but can pay out big.',
      'Create NFT collections, mint NFTs, and assign shillers to pump the hype. Sell at the peak or rug pull the whole thing.',
      'Check the TRUSTCOIN tab to get started. The market waits for no one.',
    ],
  },
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
  const addSkillPoints = useGameStore((state) => state.addSkillPoints);
  const addAscension = useGameStore((state) => state.addAscension);

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

  // Get tutorial/progressive disclosure state
  const prestigeCount = useTutorialStore((state) => state.prestigeCount);
  const hasPrestiged = prestigeCount >= 1;

  // Get origin state
  const selectedOrigin = useOriginStore((state) => state.selectedOrigin);

  // Intro modal + origin select state (shown when no origin is selected)
  // Initialize from current store state so the modal appears on the first render
  const [showIntroModal, setShowIntroModal] = useState(() => selectedOrigin === null);
  const [showOriginSelect, setShowOriginSelect] = useState(false);

  // Tutorial modal sequence state (post-prestige introduction, per-prestige-level)
  const [activeTutorialIndex, setActiveTutorialIndex] = useState<number | null>(null);
  const [activeTutorialSequence, setActiveTutorialSequence] = useState<readonly string[]>([]);

  // Standalone crypto tutorial modal (triggers at trust >= 21, independent of prestige sequence)
  const [showCryptoTutorial, setShowCryptoTutorial] = useState(false);

  // Prestige modal state
  const [showPrestige, setShowPrestige] = useState(false);
  const [prestigePhase, setPrestigePhase] = useState<'choice' | 'result'>('choice');
  const [prestigeResult, setPrestigeResult] = useState<PrestigeResult | undefined>(undefined);

  // Reset confirmation state
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Floating reward numbers state
  const [floatingNumbers, setFloatingNumbers] = useState<{ id: number; value: string; color: string; scamId: string }[]>([]);
  const floatingIdRef = useRef(0);

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

  // Accumulator for crypto market tick timing (market ticks every MARKET_TICK_INTERVAL_MS)
  const cryptoTickAccRef = useRef(0);

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
   * Helper to get origin bonuses from the origin store.
   * Returns all-zero bonuses when no origin is selected.
   */
  function getOriginModifiers() {
    return useOriginStore.getState().getOriginBonuses();
  }

  /**
   * Compute the skill-based duration multiplier from passive + active effects + origin.
   * Overclock reduces duration, Zero Day active ability speeds up, origin may reduce further.
   */
  function getSkillDurationParams() {
    const { bonuses, effects } = getSkillModifiers();
    const originBonuses = getOriginModifiers();
    return {
      skillDurationMultiplier: 1 - bonuses.durationReduction - originBonuses.durationReduction,
      activeSpeedMultiplier: effects.speedMultiplier,
    };
  }

  /**
   * Compute the skill-based reward multiplier from passive + active effects + origin.
   * Silver Tongue applies to all scams; Creative Accounting to money; origin may boost rewards.
   */
  function getSkillRewardParams() {
    const { bonuses, effects } = getSkillModifiers();
    const originBonuses = getOriginModifiers();
    // Silver Tongue (rewardBonus) applies to all scam types
    let skillRewardMultiplier = 1 + bonuses.rewardBonus;
    // Creative Accounting (moneyBonus) applies to all scams
    skillRewardMultiplier *= (1 + bonuses.moneyBonus);
    // Origin reward bonus
    skillRewardMultiplier *= (1 + originBonuses.rewardBonus);
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

      // Skill reward params
      const { skillRewardMultiplier, activeRewardMultiplier } = getSkillRewardParams();

      // Ascension bonus (permanent per-scam multiplier persisting through prestige)
      const ascensionCount = useGameStore.getState().getAscensionCount(timer.scamId);

      const reward = calculateScamReward(
        definition,
        scamState.level,
        resources.trust,
        amplifiedProfitBonus,
        employeeRewardBonus,
        skillRewardMultiplier,
        activeRewardMultiplier,
        ascensionCount
      );

      // Award money
      addMoney(reward);

      // Spawn floating reward number
      const floatId = ++floatingIdRef.current;
      setFloatingNumbers((prev) => [
        ...prev,
        { id: floatId, value: `+$${formatNumber(reward)}`, color: COLORS.gold, scamId: timer.scamId },
      ]);

      // Add heat from the scam (unless VPN Tunnel is active)
      if (!activeEffects.zeroHeatGain) {
        const totalBots = useGameStore.getState().resources.bots;
        const unassignedBots = useBotStore.getState().getAvailableBots(totalBots);
        const heatMultiplier = 1 / (1 + IDLE_BOT_HEAT_REDUCTION * unassignedBots);
        const originBonuses = getOriginModifiers();
        const skillHeatGainMultiplier = (1 - skillBonuses.heatGainReduction) * (1 - originBonuses.heatGainReduction);
        const heat = calculateHeatFromScam(definition, skillHeatGainMultiplier) * heatMultiplier;
        addHeat(heat);
      }

      // Haptic feedback on scam completion
      triggerHaptic('medium');

      // Generate fractional bots from scam completion
      addBots(BOT_GENERATION_RATES[definition.tier]);

      // Increment completion counter
      incrementCompletion(timer.scamId);

      // Check if heat has reached max (with skill threshold bonus)
      const currentHeat = useGameStore.getState().resources.heat;
      if (isPrestigeForced(currentHeat, skillBonuses.heatThresholdBonus) && !showPrestigeRef.current) {
        showPrestigeRef.current = true;
        triggerHaptic('heavy');
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
          const originBonuses = getOriginModifiers();
          const skillHeatGainMultiplier = (1 - skillBonuses.heatGainReduction) * (1 - originBonuses.heatGainReduction);
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

      // Crypto market tick (every MARKET_TICK_INTERVAL_MS) — only real-time, not offline
      cryptoTickAccRef.current += result.deltaMs;
      while (cryptoTickAccRef.current >= MARKET_TICK_INTERVAL_MS) {
        useCryptoStore.getState().tickMarket();
        cryptoTickAccRef.current -= MARKET_TICK_INTERVAL_MS;
      }

      // Tick NFT collection hype decay and shill boost
      useCryptoStore.getState().tickCollections(result.deltaMs);

      // Trigger crypto tutorial when trust first reaches 150 (Tier 3 access)
      const currentTrust = useGameStore.getState().resources.trust;
      if (currentTrust >= 150 && !useTutorialStore.getState().hasSeen(TUTORIAL_IDS.CRYPTO_INTRO)) {
        setShowCryptoTutorial(true);
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

  // Calculate aggregate money income per second from all auto-managed running scams
  const moneyPerSecond = useMemo(() => {
    let totalPerSec = 0;
    for (const timer of engineState.activeTimers) {
      const def = getScamDefinition(timer.scamId);
      if (!def) continue;
      const scamState = scams[timer.scamId];
      if (!scamState) continue;
      const durationSec = timer.duration / 1000;
      if (durationSec <= 0) continue;
      const rawBotBonuses = useBotStore.getState().getScamBotBonuses(timer.scamId);
      const skillBonuses = useSkillStore.getState().getSkillBonuses();
      const amplifiedProfitBonus = rawBotBonuses.profitBonus * (1 + skillBonuses.botProfitAmplifier);
      const { rewardBonus: rawRewardBonus } = useEmployeeStore.getState().getScamBonuses(timer.scamId);
      const activeEffects = useSkillStore.getState().getActiveEffects();
      const employeeRewardBonus = rawRewardBonus * activeEffects.employeeBonusMultiplier;
      const skillRewardBase = 1 + skillBonuses.rewardBonus;
      const moneyBonus = 1 + skillBonuses.moneyBonus;
      const originBonuses = useOriginStore.getState().getOriginBonuses();
      const skillRewardMultiplier = skillRewardBase * moneyBonus * (1 + originBonuses.rewardBonus);
      const reward = calculateScamReward(
        def, scamState.level, resources.trust, amplifiedProfitBonus, employeeRewardBonus,
        skillRewardMultiplier, activeEffects.rewardMultiplier
      );
      totalPerSec += reward / durationSec;
    }
    return totalPerSec;
  }, [engineState.activeTimers, scams, resources.trust]);

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
      triggerHaptic('medium');
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
          triggerHaptic('medium');
          console.log(`🎉 MILESTONE L${newLevel}! Bonus: $${milestoneBonus}`);
        }
      }

      // Award ascension when crossing a 100-level boundary
      if (newLevel >= 100 && newLevel % 100 === 0) {
        addAscension(scamId);
        console.log(`⭐ ASCENSION! ${scamId} reached L${newLevel}`);
      }
    },
    [scams, resources.money, resources.trust, addMoney, upgradeScam, addAscension]
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

      // Check for milestone bonuses and ascensions within the purchased range
      const startLevel = scamState.level;
      for (let i = 1; i <= count; i++) {
        const lvl = startLevel + i;
        if (isMilestoneLevel(lvl)) {
          const milestoneBonus = calculateMilestoneBonus(definition, lvl, resources.trust);
          if (milestoneBonus > 0) {
            addMoney(milestoneBonus);
          }
        }
        // Award ascension when crossing a 100-level boundary
        if (lvl >= 100 && lvl % 100 === 0) {
          addAscension(scamId);
        }
      }
    },
    [scams, resources.money, resources.trust, addMoney, upgradeScamByLevels, addAscension]
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
      triggerHaptic('medium');

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
      triggerHaptic('medium');
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
      // Check escalating activation SP cost
      const currentCost = useSkillStore.getState().getActivationCost(abilityId);
      if (useGameStore.getState().resources.skillPoints < currentCost) return;

      const success = useSkillStore.getState().activateAbility(abilityId);
      if (!success) return;

      // Deduct activation cost (use pre-activation cost since activateAbility increments the counter)
      addSkillPoints(-currentCost);

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
    [addHeat, addSkillPoints, rescaleTimerDurations]
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
      triggerHaptic('heavy');
      const result = executePrestige(choice);
      setPrestigeResult(result);
      setPrestigePhase('result');
    },
    []
  );

  /**
   * Handle prestige continue - hide modal and restart the game loop.
   * Looks up per-prestige tutorial sequences and triggers if not already seen.
   */
  const handlePrestigeContinue = useCallback(() => {
    // Read the current prestige count (already incremented by executePrestige)
    const currentPrestigeCount = useTutorialStore.getState().prestigeCount;

    setShowPrestige(false);
    showPrestigeRef.current = false;
    setPrestigePhase('choice');
    setPrestigeResult(undefined);

    // Look up tutorial sequence for this prestige milestone
    const sequence = PRESTIGE_TUTORIAL_SEQUENCES[currentPrestigeCount];
    if (sequence && sequence.length > 0 && !useTutorialStore.getState().hasSeen(sequence[0])) {
      setActiveTutorialSequence(sequence);
      setActiveTutorialIndex(0);
    }

    // Stop and restart the game loop for a clean slate
    stop();
    start();
  }, [stop, start]);

  /**
   * Handle dismissing a tutorial modal - mark as seen and advance to next, or close.
   */
  const handleTutorialContinue = useCallback(() => {
    if (activeTutorialIndex === null) return;

    // Mark current tutorial as seen
    const currentId = activeTutorialSequence[activeTutorialIndex];
    useTutorialStore.getState().markSeen(currentId);

    // Advance to next tutorial or close
    const nextIndex = activeTutorialIndex + 1;
    if (nextIndex < activeTutorialSequence.length) {
      setActiveTutorialIndex(nextIndex);
    } else {
      setActiveTutorialIndex(null);
    }
  }, [activeTutorialIndex, activeTutorialSequence]);

  /**
   * Handle dismissing the crypto tutorial modal
   */
  const handleCryptoTutorialContinue = useCallback(() => {
    useTutorialStore.getState().markSeen(TUTORIAL_IDS.CRYPTO_INTRO);
    setShowCryptoTutorial(false);
  }, []);

  /**
   * Handle full game reset - wipe everything including trust
   */
  const handleResetConfirm = useCallback(() => {
    triggerHaptic('heavy');
    setShowResetConfirm(false);
    setActiveTutorialIndex(null);
    fullReset();
    setShowIntroModal(true);
    stop();
    start();
  }, [stop, start]);

  /**
   * Handle continuing from intro modal to origin select
   */
  const handleIntroContinue = useCallback(() => {
    setShowIntroModal(false);
    setShowOriginSelect(true);
  }, []);

  /**
   * Handle origin selection from origin modal
   */
  const handleOriginSelect = useCallback((originId: OriginId) => {
    useOriginStore.getState().selectOrigin(originId);
    setShowOriginSelect(false);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TerminalText size="lg" color={COLORS.textPrimary}>
          {'IDLE SCAMMER v0.1'}
        </TerminalText>
      </View>

      {/* Resource HUD */}
      <ResourceHUD
        resources={resources}
        heatMax={MAX_HEAT + (useSkillStore.getState().getSkillBonuses().heatThresholdBonus)}
        prestigeCount={prestigeCount}
        moneyPerSecond={moneyPerSecond}
        compact
        style={styles.hud}
        testID="resource-hud"
      />

      {/* Tab-based layout: SCAMS | SKILLS | TRUSTCOIN | MANAGERS */}
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
            floatingNumbers={floatingNumbers}
            onFloatingComplete={(id) =>
              setFloatingNumbers((prev) => prev.filter((n) => n.id !== id))
            }
            testID="scam-list-panel"
          />
        }
        skillsContent={
          prestigeCount >= 2 ? (
            <SkillsPanel
              skillPoints={resources.skillPoints}
              passiveRanks={passiveRanks}
              abilities={skillAbilities}
              onAllocateSkill={handleAllocateSkill}
              onUnlockAbility={handleUnlockAbility}
              onActivateAbility={handleActivateAbility}
              showPassives={prestigeCount >= 3}
              testID="skills-panel"
            />
          ) : undefined
        }
        cryptoContent={
          resources.trust >= 150 ? (
            <CryptoPanel testID="crypto-panel" />
          ) : undefined
        }
        opsContent={
          <OpsPanel
            resources={resources}
            scams={scams}
            isManagerHired={isManagerHired}
            onHireManager={handleHireManager}
            onPrestige={handleVoluntaryPrestige}
            prestigeCount={prestigeCount}
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

      {/* Tutorial modal sequence (after prestige milestones) */}
      {activeTutorialIndex !== null && TUTORIAL_CONTENT[activeTutorialSequence[activeTutorialIndex]] && (
        <TutorialModal
          visible={true}
          title={TUTORIAL_CONTENT[activeTutorialSequence[activeTutorialIndex]].title}
          body={TUTORIAL_CONTENT[activeTutorialSequence[activeTutorialIndex]].body}
          onContinue={handleTutorialContinue}
          testID="tutorial-modal"
        />
      )}

      {/* Crypto tutorial modal (triggers independently at trust >= 21) */}
      {showCryptoTutorial && TUTORIAL_CONTENT[TUTORIAL_IDS.CRYPTO_INTRO] && (
        <TutorialModal
          visible={true}
          title={TUTORIAL_CONTENT[TUTORIAL_IDS.CRYPTO_INTRO].title}
          body={TUTORIAL_CONTENT[TUTORIAL_IDS.CRYPTO_INTRO].body}
          onContinue={handleCryptoTutorialContinue}
          testID="crypto-tutorial-modal"
        />
      )}

      {/* Reset button — tucked in the bottom-right corner */}
      <View style={styles.resetCorner}>
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

      {/* Intro modal (shown on fresh start or after full reset) */}
      {showIntroModal && (
        <TutorialModal
          visible={true}
          title="WELCOME TO THE UNDERGROUND"
          body={[
            'Every empire starts somewhere pathetic.',
            'Before the millions, before the Lambos, before the feds... there was just you, a screen, and a dream.',
            'But first \u2014 where did it all begin?',
          ]}
          onContinue={handleIntroContinue}
          testID="intro-modal"
        />
      )}

      {/* Origin select modal (shown after intro modal) */}
      <OriginSelectModal
        visible={showOriginSelect}
        onSelect={handleOriginSelect}
        testID="origin-select-modal"
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
  resetCorner: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    zIndex: 10,
    alignItems: 'flex-end',
  },
  resetButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    opacity: 0.5,
  },
  resetConfirm: {
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.sm,
    borderRadius: 4,
  },
  resetConfirmButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
});
