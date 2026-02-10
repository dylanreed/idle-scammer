// ABOUTME: Barrel exports for the bot system
// ABOUTME: Re-exports types, constants, and store for convenient imports

export type { BotAssignment, BotAssignmentMap, BotBonuses } from './types';
export {
  BOT_GENERATION_RATES,
  SPEED_BOT_BONUS,
  PROFIT_BOT_BONUS,
  IDLE_BOT_HEAT_REDUCTION,
} from './constants';
export { useBotStore } from './botStore';
