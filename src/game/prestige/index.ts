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
  HEAT_PER_SCAM_TIER,
  CLEAN_ESCAPE_TRUST_GAIN,
  SNITCH_TRUST_PENALTY,
  SNITCH_RESOURCE_KEEP_PERCENT,
} from './constants';

export {
  calculateHeatFromScam,
  isPrestigeForced,
  calculateCleanEscapeResult,
  calculateSnitchResult,
} from './calculations';

export { executePrestige, resetAllStores } from './prestigeManager';
