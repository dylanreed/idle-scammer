// ABOUTME: Scam definitions for all Tier 1 "Small Time" scams
// ABOUTME: Bot Farms generates bots; all other Tier 1 scams generate money

import type { ScamDefinition } from './types';

/**
 * Bot Farms - The first and foundational scam in the game.
 *
 * This scam is unique because:
 * - It generates BOTS instead of money
 * - Bots are spent to upgrade other scams
 * - It's free to unlock (no unlockCost)
 * - Fast 1-second timer for early game satisfaction
 *
 * This is the entry point to all gameplay. Players must run Bot Farms
 * to accumulate bots before they can upgrade and unlock other scams.
 */
export const BOT_FARMS: ScamDefinition = {
  id: 'bot-farms',
  name: 'Bot Farms',
  tier: 1,
  baseDuration: 1000, // 1 second - fast for early game feel-good
  baseReward: 1, // 1 bot per completion
  resourceType: 'bots', // This scam gives bots, not money!
  description: 'Deploy autonomous bots to do your bidding',
  unlockCost: undefined, // Free to start - this is the first scam
};

/**
 * Nigerian Prince Emails - The classic advance-fee scam.
 * A slow but rewarding scam that relies on elaborate backstories.
 */
export const NIGERIAN_PRINCE_EMAILS: ScamDefinition = {
  id: 'nigerian-prince-emails',
  name: 'Nigerian Prince Emails',
  tier: 1,
  baseDuration: 5000, // 5 seconds - takes time to craft that royal backstory
  baseReward: 15,
  resourceType: 'money',
  description: 'A modest sum to secure millions from a deposed prince',
  unlockCost: 100,
};

/**
 * Fake Lottery Winnings - You've won! Just pay the processing fee.
 * Quick scam that exploits hope and greed.
 */
export const FAKE_LOTTERY_WINNINGS: ScamDefinition = {
  id: 'fake-lottery-winnings',
  name: 'Fake Lottery Winnings',
  tier: 1,
  baseDuration: 3000, // 3 seconds - people are eager to claim winnings
  baseReward: 10,
  resourceType: 'money',
  description: "Congratulations! You've won! (Just pay the processing fee)",
  unlockCost: 150,
};

/**
 * iPhone Popup - The millionth visitor scam.
 * Fast, low-reward popup spam that catches the gullible.
 */
export const IPHONE_POPUP: ScamDefinition = {
  id: 'iphone-popup',
  name: '"You\'ve Won an iPhone" Popups',
  tier: 1,
  baseDuration: 2000, // 2 seconds - fast popup spam
  baseReward: 5,
  resourceType: 'money',
  description: 'You are the 1,000,000th visitor! Definitely not a lie',
  unlockCost: 200,
};

/**
 * Phishing Links - Cast a wide net with fake login pages.
 * Medium speed, harvests credentials for profit.
 */
export const PHISHING_LINKS: ScamDefinition = {
  id: 'phishing-links',
  name: 'Phishing Links',
  tier: 1,
  baseDuration: 4000, // 4 seconds - gotta wait for them to enter credentials
  baseReward: 12,
  resourceType: 'money',
  description: 'Your account has been compromised! Click here to verify',
  unlockCost: 300,
};

/**
 * Survey Scams - "Complete this survey for a $500 gift card!"
 * Slow but steady data harvesting operation.
 */
export const SURVEY_SCAMS: ScamDefinition = {
  id: 'survey-scams',
  name: 'Survey Scams',
  tier: 1,
  baseDuration: 6000, // 6 seconds - surveys take time to complete
  baseReward: 18,
  resourceType: 'money',
  description: 'Complete 47 surveys for a chance to win absolutely nothing',
  unlockCost: 500,
};

/**
 * Fake Antivirus Popups - Your computer is infected! (It is now.)
 * Scary popups that sell fake software.
 */
export const FAKE_ANTIVIRUS_POPUPS: ScamDefinition = {
  id: 'fake-antivirus-popups',
  name: 'Fake Antivirus Popups',
  tier: 1,
  baseDuration: 3500, // 3.5 seconds - panic makes people act fast
  baseReward: 14,
  resourceType: 'money',
  description: 'WARNING: 847 viruses detected! Download TotallyLegitAV now',
  unlockCost: 750,
};

/**
 * Gift Card Scams - "Pay your IRS debt in iTunes gift cards."
 * Exploits authority figures and gift card anonymity.
 */
export const GIFT_CARD_SCAMS: ScamDefinition = {
  id: 'gift-card-scams',
  name: 'Gift Card Scams',
  tier: 1,
  baseDuration: 7000, // 7 seconds - convincing people takes time
  baseReward: 25,
  resourceType: 'money',
  description: 'The IRS accepts Steam gift cards now. Totally legit policy',
  unlockCost: 1000,
};

/**
 * Advance Fee Fraud - Investment opportunities that require upfront "fees."
 * Slower but more lucrative than simple popups.
 */
export const ADVANCE_FEE_FRAUD: ScamDefinition = {
  id: 'advance-fee-fraud',
  name: 'Advance Fee Fraud',
  tier: 1,
  baseDuration: 8000, // 8 seconds - building trust takes time
  baseReward: 35,
  resourceType: 'money',
  description: 'Guaranteed 500% returns! Small registration fee required',
  unlockCost: 2000,
};

/**
 * Fake Job Postings - Work from home! Make $5000/week doing nothing!
 * The slowest Tier 1 scam but with the highest payout.
 */
export const FAKE_JOB_POSTINGS: ScamDefinition = {
  id: 'fake-job-postings',
  name: 'Fake Job Postings',
  tier: 1,
  baseDuration: 10000, // 10 seconds - job applications take time
  baseReward: 50,
  resourceType: 'money',
  description: "Work from home! Be your own boss! (Training fee: $299)",
  unlockCost: 5000,
};

/**
 * Collection of all Tier 1 "Small Time" scams.
 * These are the entry-level scams that new players start with.
 */
export const TIER_1_SCAMS: ScamDefinition[] = [
  BOT_FARMS,
  NIGERIAN_PRINCE_EMAILS,
  FAKE_LOTTERY_WINNINGS,
  IPHONE_POPUP,
  PHISHING_LINKS,
  SURVEY_SCAMS,
  FAKE_ANTIVIRUS_POPUPS,
  GIFT_CARD_SCAMS,
  ADVANCE_FEE_FRAUD,
  FAKE_JOB_POSTINGS,
];
