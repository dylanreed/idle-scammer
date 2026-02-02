// ABOUTME: Core TypeScript types for the idle game engine
// ABOUTME: Defines ScamTimer, EngineState, and OfflineProgress interfaces

/**
 * Represents a timer tracking progress of a running scam.
 * Timers are created when a scam starts and marked complete when duration elapses.
 */
export interface ScamTimer {
  /** Unique identifier for the scam this timer belongs to */
  scamId: string;

  /** Timestamp (ms) when the timer started */
  startTime: number;

  /** Duration (ms) the scam takes to complete */
  duration: number;

  /** Whether the timer has completed (ready for collection) */
  isComplete: boolean;
}

/**
 * Current state of the game engine.
 * Tracks timing, active timers, and pause state.
 */
export interface EngineState {
  /** Timestamp (ms) of the last game tick */
  lastTickTime: number;

  /** All currently running scam timers */
  activeTimers: ScamTimer[];

  /** Whether the game is currently paused */
  isPaused: boolean;

  /** Timestamp (ms) when the game was paused (for calculating resume offset) */
  pausedAt?: number;
}

/**
 * Earnings structure for offline progress calculation.
 * Matches resource keys from GameResources but trust is excluded (persists separately).
 */
export interface OfflineEarnings {
  money: number;
  reputation: number;
  heat: number;
  bots: number;
  skillPoints: number;
  crypto: number;
}

/**
 * Result of calculating offline progress.
 * Used when the player returns after being away.
 */
export interface OfflineProgress {
  /** Time elapsed (ms) while offline (capped at MAX_OFFLINE_MS) */
  elapsedMs: number;

  /** Resources earned during offline time */
  earnings: OfflineEarnings;

  /** Number of scam cycles completed while offline */
  completedScams: number;
}

/**
 * Maximum offline time that accumulates progress (8 hours in milliseconds)
 */
export const MAX_OFFLINE_MS = 8 * 60 * 60 * 1000; // 28800000ms

/**
 * Offline earnings are reduced to this fraction of active play rate
 */
export const OFFLINE_EFFICIENCY = 0.5; // 50%

/**
 * Engine tick interval in milliseconds (10 ticks per second)
 */
export const TICK_INTERVAL_MS = 100;
