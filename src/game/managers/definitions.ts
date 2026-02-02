// ABOUTME: Manager definitions for all Tier 1 "Small Time" scams
// ABOUTME: Each manager has a unique personality and automates their scam's employees

import type { ManagerDefinition } from './types';

/**
 * B0T-3000 - The Bot Farms Manager
 *
 * A sentient AI from the 90s that never got the memo about Y2K.
 * Runs the bot operation with ruthless mechanical efficiency.
 * Cost is low since this is the foundational scam.
 */
export const BOT_3000: ManagerDefinition = {
  id: 'bot-3000',
  name: 'B0T-3000',
  scamId: 'bot-farms',
  cost: 500,
  flavorText: 'BEEP BOOP. AUTOMATION PROTOCOL ENGAGED. RESISTANCE IS... ACTUALLY PRETTY EASY TO OVERCOME.',
};

/**
 * Prince Okonkwo III - The Nigerian Prince Emails Manager
 *
 * Claims to be the REAL Nigerian prince. The others are imposters.
 * His father was deposed (again) and he needs your help (again).
 */
export const PRINCE_OKONKWO: ManagerDefinition = {
  id: 'prince-okonkwo',
  name: 'Prince Okonkwo III',
  scamId: 'nigerian-prince-emails',
  cost: 1000,
  flavorText: "I am the REAL prince, unlike those other 47,000 imposters. My father, the king, he is very sick and I need... wait, you've heard this before?",
};

/**
 * Lucky Larry Lotto - The Fake Lottery Manager
 *
 * Has never won a real lottery in his life, but has convinced
 * thousands of people that they have.
 */
export const LUCKY_LARRY: ManagerDefinition = {
  id: 'lucky-larry',
  name: 'Lucky Larry Lotto',
  scamId: 'fake-lottery-winnings',
  cost: 1200,
  flavorText: "CONGRATULATIONS! You're our millionth viewer! I say that a lot. Like, CONSTANTLY.",
};

/**
 * Popup Pete - The iPhone Popup Manager
 *
 * A hyperactive popup enthusiast from the early 2000s.
 * Still thinks flash animations are cutting edge.
 */
export const POPUP_PETE: ManagerDefinition = {
  id: 'popup-pete',
  name: 'Popup Pete',
  scamId: 'iphone-popup',
  cost: 1500,
  flavorText: "YOU WON! CLICK HERE! NO WAIT, HERE! ACTUALLY EVERYWHERE! *aggressive blinking intensifies*",
};

/**
 * PhishMaster Phil - The Phishing Links Manager
 *
 * A self-proclaimed "social engineer" who has mastered the art
 * of making fake login pages look almost real.
 */
export const PHISHMASTER_PHIL: ManagerDefinition = {
  id: 'phishmaster-phil',
  name: 'PhishMaster Phil',
  scamId: 'phishing-links',
  cost: 2000,
  flavorText: "Please verify your account by clicking this totally-not-suspicious link. The extra 'l' in 'Paypall' is for 'legitimate'.",
};

/**
 * Survey Susan - The Survey Scams Manager
 *
 * Has been conducting fake surveys since Web 1.0.
 * Her surveys always have "just 3 more questions."
 */
export const SURVEY_SUSAN: ManagerDefinition = {
  id: 'survey-susan',
  name: 'Survey Susan',
  scamId: 'survey-scams',
  cost: 3000,
  flavorText: "Just 47 more questions and you'll win that $500 gift card! Also, what's your mother's maiden name? For... demographics.",
};

/**
 * Dread Norton - The Fake Antivirus Manager
 *
 * A dramatic fear-monger who makes every computer problem
 * sound like digital armageddon. Named after a certain antivirus.
 */
export const DREAD_NORTON: ManagerDefinition = {
  id: 'dread-norton',
  name: 'Dread Norton',
  scamId: 'fake-antivirus-popups',
  cost: 4000,
  flavorText: "WARNING! CRITICAL ALERT! Your computer has 847 VIRUSES and ONE is currently EATING YOUR RAM! Download my totally free software NOW!",
};

/**
 * Gwen Cardsworth - The Gift Card Scams Manager
 *
 * An elegant scammer who has convinced thousands that the IRS,
 * FBI, and local police all accept Steam gift cards.
 */
export const GWEN_CARDSWORTH: ManagerDefinition = {
  id: 'gwen-cardsworth',
  name: 'Gwen Cardsworth',
  scamId: 'gift-card-scams',
  cost: 6000,
  flavorText: "Yes, the IRS DOES accept iTunes gift cards now. It's a new policy. Very official. Read me the numbers on the back, please.",
};

/**
 * Felix Upfront - The Advance Fee Fraud Manager
 *
 * A smooth-talking investment guru who always needs
 * "just a small processing fee" to release your millions.
 */
export const FELIX_UPFRONT: ManagerDefinition = {
  id: 'felix-upfront',
  name: 'Felix Upfront',
  scamId: 'advance-fee-fraud',
  cost: 10000,
  flavorText: "Your inheritance of $4.7 million is ready! I just need a small $500 processing fee. Then another $300 for customs. Then $200 for the lawyers...",
};

/**
 * Carla Careers - The Fake Job Postings Manager
 *
 * Runs the most exclusive job listings on the internet.
 * Work from home! Be your own boss! Training fee required!
 */
export const CARLA_CAREERS: ManagerDefinition = {
  id: 'carla-careers',
  name: 'Carla Careers',
  scamId: 'fake-job-postings',
  cost: 25000,
  flavorText: "Make $10,000/week from HOME stuffing envelopes! Guaranteed! Just pay the $299 starter kit fee and you're basically ALREADY rich!",
};

/**
 * Collection of all Tier 1 managers.
 * One manager per scam, each with unique personality.
 */
export const TIER_1_MANAGERS: ManagerDefinition[] = [
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
];

/**
 * Find the manager for a specific scam.
 *
 * @param scamId - The scam ID to find a manager for
 * @returns The manager definition, or undefined if none exists
 */
export function getManagerByScamId(scamId: string): ManagerDefinition | undefined {
  return TIER_1_MANAGERS.find((manager) => manager.scamId === scamId);
}

/**
 * Find a manager by their ID.
 *
 * @param managerId - The manager ID to find
 * @returns The manager definition, or undefined if not found
 */
export function getManagerById(managerId: string): ManagerDefinition | undefined {
  return TIER_1_MANAGERS.find((manager) => manager.id === managerId);
}
