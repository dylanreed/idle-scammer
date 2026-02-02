// ABOUTME: Public exports for the employee system module
// ABOUTME: Re-exports types, definitions, calculations, and store

// Types
export type { EmployeeDefinition, EmployeeState } from './types';

// Definitions
export {
  BOT_WRANGLER,
  EMAIL_COPYWRITER,
  LOTTERY_ANNOUNCER,
  POPUP_DESIGNER,
  DOMAIN_SPOOFER,
  SURVEY_BOT_OPERATOR,
  FEAR_MONGER,
  GIFT_CARD_RESELLER,
  TRUST_BUILDER,
  RESUME_FAKER,
  TIER_1_EMPLOYEES,
  getEmployeesByScamId,
  getEmployeeById,
} from './definitions';

// Calculations
export {
  calculateEmployeeCost,
  calculateSpeedBonus,
  calculateRewardBonus,
} from './calculations';

// Store
export {
  useEmployeeStore,
  createEmployeeState,
  getInitialEmployeeState,
} from './employeeStore';
export type { EmployeeStateMap, EmployeeBonuses, EmployeeStoreState } from './employeeStore';
