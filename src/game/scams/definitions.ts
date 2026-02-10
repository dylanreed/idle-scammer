// ABOUTME: Scam definitions for all tiers, plus barrel exports for cross-tier access
// ABOUTME: All scams generate money; bots are earned passively per completion

import type { ScamDefinition } from './types';
import { TIER_2_SCAMS } from './tier2';
import { TIER_3_SCAMS } from './tier3';
import { TIER_4_SCAMS } from './tier4';
import { TIER_5_SCAMS } from './tier5';

/**
 * Nigerian Prince Emails - The classic advance-fee scam.
 * A slow but rewarding scam that relies on elaborate backstories.
 *
 * Kongregate economy: FREE scam uses tier baseCost ($10) as baseReward
 */
export const NIGERIAN_PRINCE_EMAILS: ScamDefinition = {
  id: 'nigerian-prince-emails',
  name: 'Nigerian Prince Emails',
  tier: 1,
  baseDuration: 5000, // 5 seconds - starter scam, nice and quick
  baseReward: 10, // Uses tier 1 baseCost since free
  resourceType: 'money',
  description: 'A modest sum to secure millions from a deposed prince',
  unlockCost: undefined, // Free to start - this is the first money scam
};

/**
 * Fake Lottery Winnings - You've won! Just pay the processing fee.
 * Quick scam that exploits hope and greed.
 *
 * Kongregate economy: unlockCost = baseReward = $1M
 */
export const FAKE_LOTTERY_WINNINGS: ScamDefinition = {
  id: 'fake-lottery-winnings',
  name: 'Fake Lottery Winnings',
  tier: 1,
  baseDuration: 45000, // 45 seconds
  baseReward: 1000000, // = unlockCost (L1 pays for upgrade)
  resourceType: 'money',
  description: "Congratulations! You've won! (Just pay the processing fee)",
  unlockCost: 1000000,
};

/**
 * iPhone Popup - The millionth visitor scam.
 * Fast, low-reward popup spam that catches the gullible.
 *
 * Kongregate economy: unlockCost = baseReward = $1K
 */
export const IPHONE_POPUP: ScamDefinition = {
  id: 'iphone-popup',
  name: '"You\'ve Won an iPhone" Popups',
  tier: 1,
  baseDuration: 10000, // 10 seconds
  baseReward: 1000, // = unlockCost (L1 pays for upgrade)
  resourceType: 'money',
  description: 'You are the 1,000,000th visitor! Definitely not a lie',
  unlockCost: 1000,
};

/**
 * Phishing Links - Cast a wide net with fake login pages.
 * Medium speed, harvests credentials for profit.
 *
 * Kongregate economy: unlockCost = baseReward = $10K
 */
export const PHISHING_LINKS: ScamDefinition = {
  id: 'phishing-links',
  name: 'Phishing Links',
  tier: 1,
  baseDuration: 20000, // 20 seconds
  baseReward: 10000, // = unlockCost (L1 pays for upgrade)
  resourceType: 'money',
  description: 'Your account has been compromised! Click here to verify',
  unlockCost: 10000,
};

/**
 * Survey Scams - "Complete this survey for a $500 gift card!"
 * Slow but steady data harvesting operation.
 *
 * Kongregate economy: unlockCost = baseReward = $100K
 */
export const SURVEY_SCAMS: ScamDefinition = {
  id: 'survey-scams',
  name: 'Survey Scams',
  tier: 1,
  baseDuration: 30000, // 30 seconds
  baseReward: 100000, // = unlockCost (L1 pays for upgrade)
  resourceType: 'money',
  description: 'Complete 47 surveys for a chance to win absolutely nothing',
  unlockCost: 100000,
};

/**
 * Fake Antivirus Popups - Your computer is infected! (It is now.)
 * Scary popups that sell fake software.
 *
 * Kongregate economy: unlockCost = baseReward = $10M
 */
export const FAKE_ANTIVIRUS_POPUPS: ScamDefinition = {
  id: 'fake-antivirus-popups',
  name: 'Fake Antivirus Popups',
  tier: 1,
  baseDuration: 60000, // 60 seconds (1 minute)
  baseReward: 10000000, // = unlockCost (L1 pays for upgrade)
  resourceType: 'money',
  description: 'WARNING: 847 viruses detected! Download TotallyLegitAV now',
  unlockCost: 10000000,
};

/**
 * Gift Card Scams - "Pay your IRS debt in iTunes gift cards."
 * Exploits authority figures and gift card anonymity.
 *
 * Kongregate economy: unlockCost = baseReward = $100M
 */
export const GIFT_CARD_SCAMS: ScamDefinition = {
  id: 'gift-card-scams',
  name: 'Gift Card Scams',
  tier: 1,
  baseDuration: 90000, // 90 seconds (1.5 minutes)
  baseReward: 100000000, // = unlockCost (L1 pays for upgrade)
  resourceType: 'money',
  description: 'The IRS accepts Steam gift cards now. Totally legit policy',
  unlockCost: 100000000,
};

/**
 * Advance Fee Fraud - Investment opportunities that require upfront "fees."
 * Slower but more lucrative than simple popups.
 *
 * Kongregate economy: unlockCost = baseReward = $1B
 */
export const ADVANCE_FEE_FRAUD: ScamDefinition = {
  id: 'advance-fee-fraud',
  name: 'Advance Fee Fraud',
  tier: 1,
  baseDuration: 120000, // 120 seconds (2 minutes)
  baseReward: 1000000000, // = unlockCost (L1 pays for upgrade)
  resourceType: 'money',
  description: 'Guaranteed 500% returns! Small registration fee required',
  unlockCost: 1000000000,
};

/**
 * Fake Job Postings - Work from home! Make $5000/week doing nothing!
 * The slowest Tier 1 scam but with the highest payout.
 *
 * Kongregate economy: unlockCost = baseReward = $10B
 */
export const FAKE_JOB_POSTINGS: ScamDefinition = {
  id: 'fake-job-postings',
  name: 'Fake Job Postings',
  tier: 1,
  baseDuration: 180000, // 180 seconds (3 minutes)
  baseReward: 10000000000, // = unlockCost (L1 pays for upgrade)
  resourceType: 'money',
  description: "Work from home! Be your own boss! (Training fee: $299)",
  unlockCost: 10000000000,
};

/**
 * Collection of all Tier 1 "Small Time" scams.
 * These are the entry-level money-generating scams.
 * Ordered by ascending unlock cost (100x progression).
 *
 * Kongregate economy: unlockCost = baseReward for each scam
 * Crossover (cost > profit) happens around level 35.
 */
export const TIER_1_SCAMS: ScamDefinition[] = [
  NIGERIAN_PRINCE_EMAILS,  // Free ($10 base)
  IPHONE_POPUP,            // $1K
  PHISHING_LINKS,          // $10K
  SURVEY_SCAMS,            // $100K (Tier 2 unlocks at $100K)
  FAKE_LOTTERY_WINNINGS,   // $1M
  FAKE_ANTIVIRUS_POPUPS,   // $10M
  GIFT_CARD_SCAMS,         // $100M
  ADVANCE_FEE_FRAUD,       // $1B
  FAKE_JOB_POSTINGS,       // $10B
];

/**
 * All scam definitions across all tiers.
 * Consumers that need to look up any scam by ID should use this array.
 */
export const ALL_SCAMS: ScamDefinition[] = [
  ...TIER_1_SCAMS,
  ...TIER_2_SCAMS,
  ...TIER_3_SCAMS,
  ...TIER_4_SCAMS,
  ...TIER_5_SCAMS,
];

// Re-export tier arrays for consumers that need them individually
export { TIER_2_SCAMS } from './tier2';
export { TIER_3_SCAMS } from './tier3';
export { TIER_4_SCAMS } from './tier4';
export { TIER_5_SCAMS } from './tier5';
