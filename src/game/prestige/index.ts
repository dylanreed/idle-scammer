// ABOUTME: Barrel exports for the prestige system module
// ABOUTME: Exports types, constants, calculations, and manager functions

export type {
  PrestigeChoice,
  PrestigeResult,
  PrestigeBonus,
  PrestigeBonusType,
  PerformanceMetrics,
} from './types';

export {
  MAX_HEAT,
  MIN_HEAT_PER_COMPLETION,
  MAX_HEAT_PER_COMPLETION,
  HEAT_TIER_DISCOUNT,
  HEAT_DECAY_RATE,
  TRUST_DECAY_BOOST,
  TRUST_MONEY_WEIGHT,
  TRUST_COMPLETION_WEIGHT,
  TRUST_LEVEL_WEIGHT,
  MIN_TRUST_GAIN,
  SNITCH_TRUST_PERCENT,
  SNITCH_EMPLOYEE_COST_PENALTY,
  SNITCH_RESOURCE_KEEP_PERCENT,
} from './constants';

export {
  calculateHeatFromScam,
  calculateHeatDecay,
  getEffectiveDecayRate,
  isPrestigeForced,
  calculateCleanEscapeResult,
  calculateSnitchResult,
  calculatePerformanceTrustGain,
} from './calculations';

export { executePrestige, resetAllStores } from './prestigeManager';
