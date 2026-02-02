// ABOUTME: Public exports for the manager system module
// ABOUTME: Re-exports types, definitions, and store for scam automation

// Types
export type { ManagerDefinition, ManagerState } from './types';

// Definitions
export {
  BOT_3000,
  PRINCE_OKONKWO,
  LUCKY_LARRY,
  POPUP_PETE,
  PHISHMASTER_PHIL,
  SURVEY_SUSAN,
  DREAD_NORTON,
  GWEN_CARDSWORTH,
  FELIX_UPFRONT,
  CARLA_CAREERS,
  TIER_1_MANAGERS,
  getManagerByScamId,
  getManagerById,
} from './definitions';

// Store
export {
  useManagerStore,
  createManagerState,
  getInitialManagerState,
} from './managerStore';
export type { ManagerStateMap, ManagerStoreState } from './managerStore';
