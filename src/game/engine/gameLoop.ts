// ABOUTME: Core game loop engine managing ticks, timers, and offline progress
// ABOUTME: Provides tick function, offline calculation, and useGameLoop React hook

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  EngineState,
  ScamTimer,
  OfflineProgress,
  OfflineEarnings,
} from './types';
import { MAX_OFFLINE_MS, TICK_INTERVAL_MS } from './types';
import { createTimer, updateTimer } from './timer';

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
 * Calculates what progress was made while the game was closed.
 * Uses simplified simulation - counts complete scam cycles based on timer durations.
 *
 * @param lastTickTime - Last known tick time (ms)
 * @param currentTime - Current time when returning (ms)
 * @param state - Engine state when game was closed
 * @returns OfflineProgress with elapsed time, earnings, and completed scams
 */
export function calculateOfflineProgress(
  lastTickTime: number,
  currentTime: number,
  state: EngineState
): OfflineProgress {
  // Use pausedAt time if the game was paused
  const effectiveEndTime = state.isPaused && state.pausedAt !== undefined
    ? state.pausedAt
    : currentTime;

  // Calculate elapsed time, capped at maximum
  const rawElapsed = effectiveEndTime - lastTickTime;
  const elapsedMs = Math.min(Math.max(rawElapsed, 0), MAX_OFFLINE_MS);

  // Count completed scam cycles for each active timer
  let completedScams = 0;
  for (const timer of state.activeTimers) {
    if (timer.duration > 0) {
      // How many complete cycles fit in the elapsed time?
      const cycles = Math.floor(elapsedMs / timer.duration);
      completedScams += cycles;
    }
  }

  // Earnings calculation placeholder
  // Actual earnings will depend on scam definitions (added later)
  const earnings: OfflineEarnings = {
    money: 0,
    reputation: 0,
    heat: 0,
    bots: 0,
    skillPoints: 0,
    crypto: 0,
  };

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

  const performTick = useCallback(() => {
    if (isPausedRef.current) {
      return;
    }

    setEngineState((currentState) => {
      const result = tick(currentState, Date.now());

      // Call callbacks outside of setState to avoid batching issues
      if (onTickRef.current) {
        onTickRef.current(result);
      }

      // Notify about completed timers
      for (const completedTimer of result.completedTimers) {
        if (onTimerCompleteRef.current) {
          onTimerCompleteRef.current(completedTimer);
        }
      }

      return result.state;
    });
  }, []);

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
  };
}
