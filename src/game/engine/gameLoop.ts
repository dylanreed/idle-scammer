// ABOUTME: Core game loop engine managing ticks, timers, and offline progress
// ABOUTME: Provides tick function, offline calculation, and useGameLoop React hook

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  EngineState,
  ScamTimer,
  OfflineProgress,
  OfflineEarnings,
} from './types';
import { MAX_OFFLINE_MS, OFFLINE_EFFICIENCY, TICK_INTERVAL_MS } from './types';
import { createTimer, updateTimer } from './timer';
import { ALL_SCAMS } from '../scams/definitions';
import { calculateScamReward } from '../scams/calculations';
import { calculateHeatFromScam } from '../prestige/calculations';
import type { ScamStateMap } from '../scams/scamStore';
import { useEmployeeStore } from '../employees/employeeStore';
import { calculateEmployeeHeat } from '../employees/calculations';
import { useBotStore } from '../bots/botStore';
import { BOT_GENERATION_RATES, IDLE_BOT_HEAT_REDUCTION } from '../bots/constants';

/**
 * Result of a single game tick
 */
export interface TickResult {
  /** Updated engine state */
  state: EngineState;
  /** Time elapsed since last tick (ms) */
  deltaMs: number;
  /** Timers that completed during this tick */
  completedTimers: ScamTimer[];
}

/**
 * Creates a fresh engine state initialized at the given time.
 *
 * @param currentTime - Current timestamp (ms)
 * @returns Initialized EngineState
 */
export function createEngineState(currentTime: number): EngineState {
  return {
    lastTickTime: currentTime,
    activeTimers: [],
    isPaused: false,
  };
}

/**
 * Performs a single game tick, updating all timers and tracking completions.
 * Pure function - does not mutate original state.
 *
 * @param state - Current engine state
 * @param currentTime - Current timestamp (ms)
 * @returns TickResult with updated state and completed timers
 */
export function tick(state: EngineState, currentTime: number): TickResult {
  // When paused, don't update anything
  if (state.isPaused) {
    return {
      state,
      deltaMs: 0,
      completedTimers: [],
    };
  }

  const deltaMs = currentTime - state.lastTickTime;
  const completedTimers: ScamTimer[] = [];

  // Update all timers and track newly completed ones
  const updatedTimers = state.activeTimers.map((timer) => {
    const wasComplete = timer.isComplete;
    const updated = updateTimer(timer, currentTime);

    // Only report newly completed timers
    if (!wasComplete && updated.isComplete) {
      completedTimers.push(updated);
    }

    return updated;
  });

  return {
    state: {
      ...state,
      lastTickTime: currentTime,
      activeTimers: updatedTimers,
    },
    deltaMs,
    completedTimers,
  };
}

/**
 * All scam definitions for offline earnings lookup.
 */
const ALL_SCAM_DEFS = ALL_SCAMS;

/**
 * Calculates what progress was made while the game was closed.
 * Uses simplified simulation - counts complete scam cycles based on timer durations.
 * When scamStates and trust are provided, computes real earnings per cycle.
 *
 * @param lastTickTime - Last known tick time (ms)
 * @param currentTime - Current time when returning (ms)
 * @param state - Engine state when game was closed
 * @param scamStates - Current scam states for reward lookup (optional)
 * @param trust - Player's trust multiplier (optional, defaults to 1)
 * @returns OfflineProgress with elapsed time, earnings, and completed scams
 */
export function calculateOfflineProgress(
  lastTickTime: number,
  currentTime: number,
  state: EngineState,
  scamStates?: ScamStateMap,
  trust: number = 1,
  totalBots: number = 0
): OfflineProgress {
  // Use pausedAt time if the game was paused
  const effectiveEndTime = state.isPaused && state.pausedAt !== undefined
    ? state.pausedAt
    : currentTime;

  // Calculate elapsed time, capped at maximum
  const rawElapsed = effectiveEndTime - lastTickTime;
  const elapsedMs = Math.min(Math.max(rawElapsed, 0), MAX_OFFLINE_MS);

  const earnings: OfflineEarnings = {
    money: 0,
    heat: 0,
    bots: 0,
    skillPoints: 0,
    crypto: 0,
  };

  // Count completed scam cycles for each active timer
  let completedScams = 0;
  for (const timer of state.activeTimers) {
    if (timer.duration > 0) {
      // How many complete cycles fit in the elapsed time?
      const cycles = Math.floor(elapsedMs / timer.duration);
      completedScams += cycles;

      // Calculate real earnings if scam state is available
      if (scamStates && cycles > 0) {
        const scamState = scamStates[timer.scamId];
        const scamDef = ALL_SCAM_DEFS.find((s) => s.id === timer.scamId);

        if (scamState && scamDef) {
          const { rewardBonus } = useEmployeeStore.getState().getScamBonuses(timer.scamId);
          const botBonuses = useBotStore.getState().getScamBotBonuses(timer.scamId);
          const rewardPerCycle = calculateScamReward(scamDef, scamState.level, trust, botBonuses.profitBonus, rewardBonus);
          const totalReward = rewardPerCycle * cycles * OFFLINE_EFFICIENCY;
          const heatPerCycle = calculateHeatFromScam(scamDef);

          if (scamDef.resourceType === 'money') {
            earnings.money += totalReward;
          } else if (scamDef.resourceType === 'crypto') {
            earnings.crypto += totalReward;
          }

          // Apply idle bot heat reduction to offline heat
          const unassignedBots = useBotStore.getState().getAvailableBots(totalBots);
          const heatMultiplier = 1 / (1 + IDLE_BOT_HEAT_REDUCTION * unassignedBots);
          earnings.heat += heatPerCycle * cycles * OFFLINE_EFFICIENCY * heatMultiplier;

          // Generate fractional bots per cycle
          earnings.bots += BOT_GENERATION_RATES[scamDef.tier] * cycles * OFFLINE_EFFICIENCY;
        }
      }
    }
  }

  // Add employee heat for offline duration
  const totalEmployees = useEmployeeStore.getState().getAllEmployeeStates()
    .reduce((sum, e) => sum + e.count, 0);
  if (totalEmployees > 0) {
    const offlineSeconds = elapsedMs / 1000;
    earnings.heat += calculateEmployeeHeat(totalEmployees, offlineSeconds) * OFFLINE_EFFICIENCY;
  }

  return {
    elapsedMs,
    earnings,
    completedScams,
  };
}

/**
 * Options for the useGameLoop hook
 */
export interface UseGameLoopOptions {
  /** Called on each tick with the tick result */
  onTick?: (result: TickResult) => void;
  /** Called when a timer completes */
  onTimerComplete?: (timer: ScamTimer) => void;
}

/**
 * Return value of the useGameLoop hook
 */
export interface UseGameLoopReturn {
  /** Start the game loop */
  start: () => void;
  /** Stop the game loop (also clears state) */
  stop: () => void;
  /** Pause the game loop (preserves state) */
  pause: () => void;
  /** Resume the game loop from pause */
  resume: () => void;
  /** Whether the game is currently paused */
  isPaused: boolean;
  /** Current engine state */
  engineState: EngineState;
  /** Add a new timer for a scam */
  addTimer: (scamId: string, durationMs: number) => void;
  /** Remove a timer by scam ID */
  removeTimer: (scamId: string) => void;
  /** Rescale remaining time on all active timers by a speed multiplier */
  rescaleTimerDurations: (speedMultiplier: number) => void;
}

/**
 * React hook for managing the game loop.
 * Uses setInterval at 100ms (10 ticks/second) for the core loop.
 *
 * @param options - Configuration options
 * @returns Game loop control interface
 */
export function useGameLoop(options: UseGameLoopOptions = {}): UseGameLoopReturn {
  const { onTick, onTimerComplete } = options;

  const [engineState, setEngineState] = useState<EngineState>(() =>
    createEngineState(Date.now())
  );

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(false);

  // Track pause state for external access
  const [isPaused, setIsPaused] = useState(false);

  // Store callbacks in refs to avoid recreating interval
  const onTickRef = useRef(onTick);
  const onTimerCompleteRef = useRef(onTimerComplete);
  onTickRef.current = onTick;
  onTimerCompleteRef.current = onTimerComplete;

  // Pending tick results queued inside setEngineState, processed by useEffect
  const pendingResultsRef = useRef<TickResult[]>([]);
  const [tickVersion, setTickVersion] = useState(0);

  const performTick = useCallback(() => {
    if (isPausedRef.current) {
      return;
    }

    setEngineState((currentState) => {
      const result = tick(currentState, Date.now());
      // Queue the result for processing after the state update commits
      pendingResultsRef.current.push(result);
      return result.state;
    });

    // Bump version to trigger the effect that processes pending results
    setTickVersion((v) => v + 1);
  }, []);

  // Process tick callbacks after state has committed, avoiding nested
  // setEngineState calls that can silently drop timer removals and
  // leave timers stuck at 100%.
  useEffect(() => {
    const results = pendingResultsRef.current;
    if (results.length === 0) return;
    pendingResultsRef.current = [];

    for (const result of results) {
      if (onTickRef.current) {
        onTickRef.current(result);
      }

      for (const completedTimer of result.completedTimers) {
        if (onTimerCompleteRef.current) {
          onTimerCompleteRef.current(completedTimer);
        }
      }
    }
  }, [tickVersion]);

  const start = useCallback(() => {
    // Clear any existing interval
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
    }

    // Reset state
    setEngineState(createEngineState(Date.now()));
    isPausedRef.current = false;
    setIsPaused(false);

    // Start the loop
    intervalRef.current = setInterval(performTick, TICK_INTERVAL_MS);
  }, [performTick]);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isPausedRef.current = false;
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    isPausedRef.current = true;
    setIsPaused(true);
    setEngineState((currentState) => ({
      ...currentState,
      isPaused: true,
      pausedAt: Date.now(),
    }));
  }, []);

  const resume = useCallback(() => {
    isPausedRef.current = false;
    setIsPaused(false);
    setEngineState((currentState) => {
      // Calculate offline progress from pause time to now
      const now = Date.now();
      return {
        ...currentState,
        isPaused: false,
        pausedAt: undefined,
        lastTickTime: now, // Reset tick time to now
      };
    });
  }, []);

  const addTimer = useCallback((scamId: string, durationMs: number) => {
    setEngineState((currentState) => ({
      ...currentState,
      activeTimers: [
        ...currentState.activeTimers,
        createTimer(scamId, durationMs, Date.now()),
      ],
    }));
  }, []);

  const removeTimer = useCallback((scamId: string) => {
    setEngineState((currentState) => ({
      ...currentState,
      activeTimers: currentState.activeTimers.filter(
        (timer) => timer.scamId !== scamId
      ),
    }));
  }, []);

  const rescaleTimerDurations = useCallback((speedMultiplier: number) => {
    const now = Date.now();
    setEngineState((currentState) => ({
      ...currentState,
      activeTimers: currentState.activeTimers.map((timer) => {
        if (timer.isComplete) return timer;
        const elapsed = now - timer.startTime;
        const remaining = Math.max(0, timer.duration - elapsed);
        const newRemaining = remaining / speedMultiplier;
        return {
          ...timer,
          duration: elapsed + newRemaining,
        };
      }),
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    start,
    stop,
    pause,
    resume,
    isPaused,
    engineState,
    addTimer,
    removeTimer,
    rescaleTimerDurations,
  };
}
