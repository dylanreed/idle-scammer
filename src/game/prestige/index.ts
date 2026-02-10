// ABOUTME: Barrel exports for the prestige system module
// ABOUTME: Exports types, constants, calculations, and manager functions

export type {
  PrestigeChoice,
  PrestigeResult,
  PrestigeBonus,
  PrestigeBonusType,
} from './types';

export {
  MAX_HEAT,
  MIN_HEAT_PER_COMPLETION,
  MAX_HEAT_PER_COMPLETION,
  HEAT_TIER_DISCOUNT,
  HEAT_DECAY_RATE,
  CLEAN_ESCAPE_TRUST_GAIN,
  SNITCH_TRUST_PENALTY,
  SNITCH_RESOURCE_KEEP_PERCENT,
} from './constants';

export {
  calculateHeatFromScam,
  calculateHeatDecay,
  isPrestigeForced,
  calculateCleanEscapeResult,
  calculateSnitchResult,
} from './calculations';

export { executePrestige, resetAllStores } from './prestigeManager';
