// ABOUTME: Barrel exports for the skill system
// ABOUTME: Re-exports types, definitions, abilities, calculations, and store

export type {
  SkillCategory,
  PassiveSkillDefinition,
  ActiveAbilityDefinition,
  PassiveSkillState,
  ActiveAbilityState,
  SkillBonuses,
  ActiveEffects,
  SkillSaveData,
} from './types';

export {
  TECH_SKILLS,
  SOCIAL_SKILLS,
  FINANCE_SKILLS,
  STEALTH_SKILLS,
  ALL_PASSIVE_SKILLS,
  SKILLS_BY_CATEGORY,
  CATEGORY_NAMES,
  CATEGORY_DESCRIPTIONS,
} from './definitions';

export {
  ALL_ACTIVE_ABILITIES,
  TOTAL_ABILITY_COST,
} from './abilities';

export {
  getSkillRankCost,
  getTotalSkillCost,
  getSpentOnSkill,
  computeSkillBonuses,
  computeActiveEffects,
} from './calculations';

export { useSkillStore } from './skillStore';
