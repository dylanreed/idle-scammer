// ABOUTME: Public exports for the scams module
// ABOUTME: Re-exports types, definitions, calculations, and store for convenient imports

// Types
export type {
  ScamDefinition,
  ScamState,
  ScamTier,
  ResourceType,
} from './types';

// Definitions
export { BOT_FARMS } from './definitions';

// Calculations
export {
  calculateScamDuration,
  calculateScamReward,
  calculateUpgradeCost,
} from './calculations';

// Store
export type { ScamStateMap, ScamStoreActions, ScamStoreState } from './scamStore';

export {
  useScamStore,
  getInitialScamState,
  createScamState,
} from './scamStore';
