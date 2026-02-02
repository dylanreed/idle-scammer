// ABOUTME: Timer utility functions for scam progress tracking
// ABOUTME: Provides createTimer, updateTimer, getTimerProgress, isTimerComplete

import type { ScamTimer } from './types';

/**
 * Creates a new scam timer.
 *
 * @param scamId - Unique identifier for the scam
 * @param durationMs - How long the scam takes to complete (in milliseconds)
 * @param currentTime - Current timestamp (ms) to use as start time
 * @returns A new ScamTimer initialized and ready to track
 */
export function createTimer(
  scamId: string,
  durationMs: number,
  currentTime: number
): ScamTimer {
  return {
    scamId,
    startTime: currentTime,
    duration: durationMs,
    isComplete: false,
  };
}

/**
 * Calculates timer progress as a value from 0 to 1.
 *
 * @param timer - The timer to check
 * @param currentTime - Current timestamp (ms)
 * @returns Progress value between 0 (just started) and 1 (complete)
 */
export function getTimerProgress(timer: ScamTimer, currentTime: number): number {
  // Handle zero duration (instant completion)
  if (timer.duration === 0) {
    return 1;
  }

  const elapsed = currentTime - timer.startTime;

  // Before start time
  if (elapsed <= 0) {
    return 0;
  }

  // Calculate progress and cap at 1
  const progress = elapsed / timer.duration;
  return Math.min(progress, 1);
}

/**
 * Checks if a timer has completed.
 * A timer is complete if:
 * - Its isComplete flag is already true, OR
 * - Current time has reached or passed startTime + duration
 *
 * @param timer - The timer to check
 * @param currentTime - Current timestamp (ms)
 * @returns True if the timer is complete
 */
export function isTimerComplete(timer: ScamTimer, currentTime: number): boolean {
  // Already marked complete
  if (timer.isComplete) {
    return true;
  }

  // Check if duration has elapsed
  const endTime = timer.startTime + timer.duration;
  return currentTime >= endTime;
}

/**
 * Updates a timer based on current time.
 * If the timer has completed, returns a new timer with isComplete set to true.
 * Otherwise returns the same timer object (no mutation).
 *
 * @param timer - The timer to update
 * @param currentTime - Current timestamp (ms)
 * @returns Updated timer (new object if changed, same object if unchanged)
 */
export function updateTimer(timer: ScamTimer, currentTime: number): ScamTimer {
  // Already complete - no change needed
  if (timer.isComplete) {
    return timer;
  }

  // Check if timer should complete
  const shouldComplete = isTimerComplete(timer, currentTime);

  // Not yet complete - no change needed
  if (!shouldComplete) {
    return timer;
  }

  // Timer just completed - return new object with isComplete true
  return {
    ...timer,
    isComplete: true,
  };
}
