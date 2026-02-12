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
export { ALL_SCAMS, TIER_1_SCAMS } from './definitions';
export { TIER_2_SCAMS } from './tier2';
export { TIER_3_SCAMS } from './tier3';
export { TIER_4_SCAMS } from './tier4';
export { TIER_5_SCAMS } from './tier5';

// Calculations
export {
  calculateScamDuration,
  calculateScamReward,
  calculateUpgradeCost,
  isTierFullyUnlocked,
  calculateMaxBuyCount,
  calculateMaxBuyCost,
  calculateManagerCost,
  isMilestoneLevel,
  calculateMilestoneBonus,
  getScamCostRate,
  getMaxUsefulSpeedBots,
  ABSOLUTE_MIN_DURATION_MS,
} from './calculations';

// Store
export type { ScamStateMap, ScamStoreActions, ScamStoreState } from './scamStore';

export {
  useScamStore,
  getInitialScamState,
  createScamState,
} from './scamStore';
