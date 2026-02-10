// ABOUTME: Manager definitions for all tiers, plus barrel exports for cross-tier access
// ABOUTME: Each manager has a unique personality and automates their scam's employees

import type { ManagerDefinition } from './types';
import { getManagerCostAtPosition } from '../economy/constants';
import { TIER_2_MANAGERS } from './tier2';
import { TIER_3_MANAGERS } from './tier3';
import { TIER_4_MANAGERS } from './tier4';
import { TIER_5_MANAGERS } from './tier5';

/**
 * Prince Okonkwo III - The Nigerian Prince Emails Manager
 *
 * Claims to be the REAL Nigerian prince. The others are imposters.
 * His father was deposed (again) and he needs your help (again).
 *
 * Position 0: cost = floor(getProgressionCost(1) × 0.75) = $750
 */
export const PRINCE_OKONKWO: ManagerDefinition = {
  id: 'prince-okonkwo',
  name: 'Prince Okonkwo III',
  scamId: 'nigerian-prince-emails',
  cost: getManagerCostAtPosition(0), // Position 0: 0.75 × next scam unlock
  flavorText: "I am the REAL prince, unlike those other 47,000 imposters. My father, the king, he is very sick and I need... wait, you've heard this before?",
};

/**
 * Lucky Larry Lotto - The Fake Lottery Manager
 *
 * Has never won a real lottery in his life, but has convinced
 * thousands of people that they have.
 *
 * Position 4: cost = floor(getProgressionCost(5) × 0.75) = $60,750
 */
export const LUCKY_LARRY: ManagerDefinition = {
  id: 'lucky-larry',
  name: 'Lucky Larry Lotto',
  scamId: 'fake-lottery-winnings',
  cost: getManagerCostAtPosition(4), // Position 4: 0.75 × next scam unlock
  flavorText: "CONGRATULATIONS! You're our millionth viewer! I say that a lot. Like, CONSTANTLY.",
};

/**
 * Popup Pete - The iPhone Popup Manager
 *
 * A hyperactive popup enthusiast from the early 2000s.
 * Still thinks flash animations are cutting edge.
 *
 * Position 1: cost = floor(getProgressionCost(2) × 0.75) = $2,250
 */
export const POPUP_PETE: ManagerDefinition = {
  id: 'popup-pete',
  name: 'Popup Pete',
  scamId: 'iphone-popup',
  cost: getManagerCostAtPosition(1), // Position 1: 0.75 × next scam unlock
  flavorText: "YOU WON! CLICK HERE! NO WAIT, HERE! ACTUALLY EVERYWHERE! *aggressive blinking intensifies*",
};

/**
 * PhishMaster Phil - The Phishing Links Manager
 *
 * A self-proclaimed "social engineer" who has mastered the art
 * of making fake login pages look almost real.
 *
 * Position 2: cost = floor(getProgressionCost(3) × 0.75) = $6,750
 */
export const PHISHMASTER_PHIL: ManagerDefinition = {
  id: 'phishmaster-phil',
  name: 'PhishMaster Phil',
  scamId: 'phishing-links',
  cost: getManagerCostAtPosition(2), // Position 2: 0.75 × next scam unlock
  flavorText: "Please verify your account by clicking this totally-not-suspicious link. The extra 'l' in 'Paypall' is for 'legitimate'.",
};

/**
 * Survey Susan - The Survey Scams Manager
 *
 * Has been conducting fake surveys since Web 1.0.
 * Her surveys always have "just 3 more questions."
 *
 * Position 3: cost = floor(getProgressionCost(4) × 0.75) = $20,250
 */
export const SURVEY_SUSAN: ManagerDefinition = {
  id: 'survey-susan',
  name: 'Survey Susan',
  scamId: 'survey-scams',
  cost: getManagerCostAtPosition(3), // Position 3: 0.75 × next scam unlock
  flavorText: "Just 47 more questions and you'll win that $500 gift card! Also, what's your mother's maiden name? For... demographics.",
};

/**
 * Dread Norton - The Fake Antivirus Manager
 *
 * A dramatic fear-monger who makes every computer problem
 * sound like digital armageddon. Named after a certain antivirus.
 *
 * Position 5: cost = floor(getProgressionCost(6) × 0.75) = $182,250
 */
export const DREAD_NORTON: ManagerDefinition = {
  id: 'dread-norton',
  name: 'Dread Norton',
  scamId: 'fake-antivirus-popups',
  cost: getManagerCostAtPosition(5), // Position 5: 0.75 × next scam unlock
  flavorText: "WARNING! CRITICAL ALERT! Your computer has 847 VIRUSES and ONE is currently EATING YOUR RAM! Download my totally free software NOW!",
};

/**
 * Gwen Cardsworth - The Gift Card Scams Manager
 *
 * An elegant scammer who has convinced thousands that the IRS,
 * FBI, and local police all accept Steam gift cards.
 *
 * Position 6: cost = floor(getProgressionCost(7) × 0.75) = $546,750
 */
export const GWEN_CARDSWORTH: ManagerDefinition = {
  id: 'gwen-cardsworth',
  name: 'Gwen Cardsworth',
  scamId: 'gift-card-scams',
  cost: getManagerCostAtPosition(6), // Position 6: 0.75 × next scam unlock
  flavorText: "Yes, the IRS DOES accept iTunes gift cards now. It's a new policy. Very official. Read me the numbers on the back, please.",
};

/**
 * Felix Upfront - The Advance Fee Fraud Manager
 *
 * A smooth-talking investment guru who always needs
 * "just a small processing fee" to release your millions.
 *
 * Position 7: cost = floor(getProgressionCost(8) × 0.75) = $1,640,250
 */
export const FELIX_UPFRONT: ManagerDefinition = {
  id: 'felix-upfront',
  name: 'Felix Upfront',
  scamId: 'advance-fee-fraud',
  cost: getManagerCostAtPosition(7), // Position 7: 0.75 × next scam unlock
  flavorText: "Your inheritance of $4.7 million is ready! I just need a small $500 processing fee. Then another $300 for customs. Then $200 for the lawyers...",
};

/**
 * Carla Careers - The Fake Job Postings Manager
 *
 * Runs the most exclusive job listings on the internet.
 * Work from home! Be your own boss! Training fee required!
 *
 * Position 8: cost = floor(getProgressionCost(9) × 0.75) = $4,920,750
 */
export const CARLA_CAREERS: ManagerDefinition = {
  id: 'carla-careers',
  name: 'Carla Careers',
  scamId: 'fake-job-postings',
  cost: getManagerCostAtPosition(8), // Position 8: 0.75 × next scam unlock
  flavorText: "Make $10,000/week from HOME stuffing envelopes! Guaranteed! Just pay the $299 starter kit fee and you're basically ALREADY rich!",
};

/**
 * Collection of all Tier 1 managers.
 * One manager per scam, each with unique personality.
 */
export const TIER_1_MANAGERS: ManagerDefinition[] = [
  PRINCE_OKONKWO,
  LUCKY_LARRY,
  POPUP_PETE,
  PHISHMASTER_PHIL,
  SURVEY_SUSAN,
  DREAD_NORTON,
  GWEN_CARDSWORTH,
  FELIX_UPFRONT,
  CARLA_CAREERS,
];

/**
 * All manager definitions across all tiers.
 * Consumers that need to look up any manager by ID should use this array.
 */
export const ALL_MANAGERS: ManagerDefinition[] = [
  ...TIER_1_MANAGERS,
  ...TIER_2_MANAGERS,
  ...TIER_3_MANAGERS,
  ...TIER_4_MANAGERS,
  ...TIER_5_MANAGERS,
];

// Re-export tier arrays for consumers that need them individually
export { TIER_2_MANAGERS } from './tier2';
export { TIER_3_MANAGERS } from './tier3';
export { TIER_4_MANAGERS } from './tier4';
export { TIER_5_MANAGERS } from './tier5';

/**
 * Find the manager for a specific scam.
 *
 * @param scamId - The scam ID to find a manager for
 * @returns The manager definition, or undefined if none exists
 */
export function getManagerByScamId(scamId: string): ManagerDefinition | undefined {
  return ALL_MANAGERS.find((manager) => manager.scamId === scamId);
}

/**
 * Find a manager by their ID.
 *
 * @param managerId - The manager ID to find
 * @returns The manager definition, or undefined if not found
 */
export function getManagerById(managerId: string): ManagerDefinition | undefined {
  return ALL_MANAGERS.find((manager) => manager.id === managerId);
}
