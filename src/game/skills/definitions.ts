// ABOUTME: Static definitions for the 12 passive skills across 4 categories
// ABOUTME: Each skill has 5 ranks with escalating effect values and SP costs

import type { PassiveSkillDefinition, SkillCategory } from './types';

/**
 * TECH category: Bot & Speed skills.
 * Focused on making bots more effective and scams faster.
 */
export const TECH_SKILLS: PassiveSkillDefinition[] = [
  {
    id: 'overclock',
    name: 'Overclock',
    category: 'tech',
    description: 'Reduce scam duration by overclocking your processors',
    ranks: [0.05, 0.10, 0.16, 0.22, 0.30],
    maxRank: 5,
  },
  {
    id: 'botnet-boost',
    name: 'Botnet Boost',
    category: 'tech',
    description: 'Amplify bot speed bonus with better network protocols',
    ranks: [0.10, 0.20, 0.35, 0.50, 0.75],
    maxRank: 5,
  },
  {
    id: 'firmware-hack',
    name: 'Firmware Hack',
    category: 'tech',
    description: 'Amplify bot profit bonus with hacked firmware',
    ranks: [0.10, 0.20, 0.35, 0.50, 0.75],
    maxRank: 5,
  },
];

/**
 * SOCIAL category: Employee & Reward skills.
 * Focused on employees, rewards, and trust gain.
 */
export const SOCIAL_SKILLS: PassiveSkillDefinition[] = [
  {
    id: 'silver-tongue',
    name: 'Silver Tongue',
    category: 'social',
    description: 'Increase scam rewards with smoother persuasion',
    ranks: [0.05, 0.12, 0.20, 0.30, 0.45],
    maxRank: 5,
  },
  {
    id: 'recruitment-drive',
    name: 'Recruitment Drive',
    category: 'social',
    description: 'Reduce employee costs through efficient recruiting',
    ranks: [0.05, 0.10, 0.18, 0.28, 0.40],
    maxRank: 5,
  },
  {
    id: 'hype-machine',
    name: 'Hype Machine',
    category: 'social',
    description: 'Increase trust gain from clean escapes',
    ranks: [0.10, 0.20, 0.35, 0.50, 0.75],
    maxRank: 5,
  },
];

/**
 * FINANCE category: Money & Upgrade skills.
 * Focused on money generation and cost reduction.
 */
export const FINANCE_SKILLS: PassiveSkillDefinition[] = [
  {
    id: 'creative-accounting',
    name: 'Creative Accounting',
    category: 'finance',
    description: 'Increase money from scams through creative bookkeeping',
    ranks: [0.05, 0.12, 0.20, 0.30, 0.45],
    maxRank: 5,
  },
  {
    id: 'bulk-discount',
    name: 'Bulk Discount',
    category: 'finance',
    description: 'Reduce upgrade costs through bulk purchasing deals',
    ranks: [0.03, 0.07, 0.12, 0.18, 0.25],
    maxRank: 5,
  },
  {
    id: 'compound-interest',
    name: 'Compound Interest',
    category: 'finance',
    description: 'Earn passive income scaled by trust level',
    ranks: [1, 5, 15, 50, 150],
    maxRank: 5,
  },
];

/**
 * STEALTH category: Heat Management skills.
 * Focused on reducing heat gain, increasing decay, and raising thresholds.
 */
export const STEALTH_SKILLS: PassiveSkillDefinition[] = [
  {
    id: 'burner-phones',
    name: 'Burner Phones',
    category: 'stealth',
    description: 'Reduce heat gain by using disposable communication',
    ranks: [0.05, 0.12, 0.20, 0.30, 0.40],
    maxRank: 5,
  },
  {
    id: 'dirty-cops',
    name: 'Dirty Cops',
    category: 'stealth',
    description: 'Increase heat decay rate through police corruption',
    ranks: [0.10, 0.25, 0.45, 0.70, 1.00],
    maxRank: 5,
  },
  {
    id: 'ghost-protocol',
    name: 'Ghost Protocol',
    category: 'stealth',
    description: 'Raise the heat threshold before forced prestige',
    ranks: [5, 12, 20, 30, 50],
    maxRank: 5,
  },
];

/**
 * All passive skills grouped by category for UI rendering.
 */
export const SKILLS_BY_CATEGORY: Record<SkillCategory, PassiveSkillDefinition[]> = {
  tech: TECH_SKILLS,
  social: SOCIAL_SKILLS,
  finance: FINANCE_SKILLS,
  stealth: STEALTH_SKILLS,
};

/**
 * Flat array of all 12 passive skills for iteration.
 */
export const ALL_PASSIVE_SKILLS: PassiveSkillDefinition[] = [
  ...TECH_SKILLS,
  ...SOCIAL_SKILLS,
  ...FINANCE_SKILLS,
  ...STEALTH_SKILLS,
];

/**
 * Display names for skill categories.
 */
export const CATEGORY_NAMES: Record<SkillCategory, string> = {
  tech: 'TECH',
  social: 'SOCIAL',
  finance: 'FINANCE',
  stealth: 'STEALTH',
};

/**
 * Display descriptions for skill categories.
 */
export const CATEGORY_DESCRIPTIONS: Record<SkillCategory, string> = {
  tech: 'Bot & Speed',
  social: 'Employees & Rewards',
  finance: 'Money & Upgrades',
  stealth: 'Heat Management',
};
