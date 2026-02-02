// ABOUTME: Public exports for the game engine module
// ABOUTME: Re-exports types, timer utilities, and game loop for convenient imports

// Types
export type {
  ScamTimer,
  EngineState,
  OfflineProgress,
  OfflineEarnings,
} from './types';

export {
  MAX_OFFLINE_MS,
  OFFLINE_EFFICIENCY,
  TICK_INTERVAL_MS,
} from './types';

// Timer utilities
export {
  createTimer,
  updateTimer,
  getTimerProgress,
  isTimerComplete,
} from './timer';

// Game loop
export type { TickResult, UseGameLoopOptions, UseGameLoopReturn } from './gameLoop';

export {
  createEngineState,
  tick,
  calculateOfflineProgress,
  useGameLoop,
} from './gameLoop';
