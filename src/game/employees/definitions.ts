// ABOUTME: Employee definitions for all Tier 1 scams
// ABOUTME: Each scam has one specialized employee type that boosts output

import type { EmployeeDefinition } from './types';

/**
 * Bot Wrangler - Manages bot farms more efficiently.
 * Works on: Bot Farms (the foundational resource generator)
 */
export const BOT_WRANGLER: EmployeeDefinition = {
  id: 'bot-wrangler',
  name: 'Bot Wrangler',
  scamId: 'bot-farms',
  baseCost: 50,
  speedBoost: 0.03, // 3% faster per employee
  rewardBoost: 0.05, // 5% more bots per employee
};

/**
 * Email Copywriter - Crafts more compelling prince stories.
 * Works on: Nigerian Prince Emails
 */
export const EMAIL_COPYWRITER: EmployeeDefinition = {
  id: 'email-copywriter',
  name: 'Email Copywriter',
  scamId: 'nigerian-prince-emails',
  baseCost: 100,
  speedBoost: 0.02, // 2% faster
  rewardBoost: 0.08, // 8% better returns from better copy
};

/**
 * Lottery Announcer - Makes fake wins more believable.
 * Works on: Fake Lottery Winnings
 */
export const LOTTERY_ANNOUNCER: EmployeeDefinition = {
  id: 'lottery-announcer',
  name: 'Lottery Announcer',
  scamId: 'fake-lottery-winnings',
  baseCost: 120,
  speedBoost: 0.04, // 4% faster processing
  rewardBoost: 0.06, // 6% more convincing
};

/**
 * Popup Designer - Creates irresistible click-bait popups.
 * Works on: "You've Won an iPhone" Popups
 */
export const POPUP_DESIGNER: EmployeeDefinition = {
  id: 'popup-designer',
  name: 'Popup Designer',
  scamId: 'iphone-popup',
  baseCost: 80,
  speedBoost: 0.05, // 5% faster popup spam
  rewardBoost: 0.04, // 4% better click rates
};

/**
 * Domain Spoofer - Creates convincing fake domains.
 * Works on: Phishing Links
 */
export const DOMAIN_SPOOFER: EmployeeDefinition = {
  id: 'domain-spoofer',
  name: 'Domain Spoofer',
  scamId: 'phishing-links',
  baseCost: 150,
  speedBoost: 0.03, // 3% faster setup
  rewardBoost: 0.07, // 7% more credentials harvested
};

/**
 * Survey Bot Operator - Automates fake survey completion.
 * Works on: Survey Scams
 */
export const SURVEY_BOT_OPERATOR: EmployeeDefinition = {
  id: 'survey-bot-operator',
  name: 'Survey Bot Operator',
  scamId: 'survey-scams',
  baseCost: 180,
  speedBoost: 0.04, // 4% faster surveys
  rewardBoost: 0.06, // 6% more data harvested
};

/**
 * Fear Monger - Creates terrifying virus warnings.
 * Works on: Fake Antivirus Popups
 */
export const FEAR_MONGER: EmployeeDefinition = {
  id: 'fear-monger',
  name: 'Fear Monger',
  scamId: 'fake-antivirus-popups',
  baseCost: 140,
  speedBoost: 0.03, // 3% faster scare tactics
  rewardBoost: 0.07, // 7% more panic purchases
};

/**
 * Gift Card Reseller - Converts stolen cards to cash faster.
 * Works on: Gift Card Scams
 */
export const GIFT_CARD_RESELLER: EmployeeDefinition = {
  id: 'gift-card-reseller',
  name: 'Gift Card Reseller',
  scamId: 'gift-card-scams',
  baseCost: 200,
  speedBoost: 0.02, // 2% faster conversion
  rewardBoost: 0.08, // 8% better resale rates
};

/**
 * Trust Builder - Establishes credibility for advance fees.
 * Works on: Advance Fee Fraud
 */
export const TRUST_BUILDER: EmployeeDefinition = {
  id: 'trust-builder',
  name: 'Trust Builder',
  scamId: 'advance-fee-fraud',
  baseCost: 250,
  speedBoost: 0.02, // 2% faster trust building
  rewardBoost: 0.09, // 9% larger fees extracted
};

/**
 * Resume Faker - Creates convincing fake job postings.
 * Works on: Fake Job Postings
 */
export const RESUME_FAKER: EmployeeDefinition = {
  id: 'resume-faker',
  name: 'Resume Faker',
  scamId: 'fake-job-postings',
  baseCost: 300,
  speedBoost: 0.02, // 2% faster job creation
  rewardBoost: 0.1, // 10% higher training fees
};

/**
 * Collection of all Tier 1 employees.
 * One employee type per scam for MVP.
 */
export const TIER_1_EMPLOYEES: EmployeeDefinition[] = [
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
];

/**
 * Returns all employees that work on a specific scam.
 *
 * @param scamId - The scam ID to look up
 * @returns Array of employees for that scam (may be empty)
 */
export function getEmployeesByScamId(scamId: string): EmployeeDefinition[] {
  return TIER_1_EMPLOYEES.filter((employee) => employee.scamId === scamId);
}

/**
 * Returns an employee definition by ID.
 *
 * @param employeeId - The employee ID to look up
 * @returns The employee definition or undefined if not found
 */
export function getEmployeeById(employeeId: string): EmployeeDefinition | undefined {
  return TIER_1_EMPLOYEES.find((employee) => employee.id === employeeId);
}
