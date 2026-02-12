// ABOUTME: Scam definitions for all tiers, plus barrel exports for cross-tier access
// ABOUTME: All scams generate money; bots are earned passively per completion

import type { ScamDefinition } from './types';
import { getProgressionCost } from '../economy/constants';
import { TIER_2_SCAMS } from './tier2';
import { TIER_3_SCAMS } from './tier3';
import { TIER_4_SCAMS } from './tier4';
import { TIER_5_SCAMS } from './tier5';

/**
 * Prince Emails - The classic advance-fee scam.
 * A slow but rewarding scam that relies on elaborate backstories.
 *
 * Position 0: FREE scam, baseReward = $10
 */
export const NIGERIAN_PRINCE_EMAILS: ScamDefinition = {
  id: 'nigerian-prince-emails',
  name: 'Prince Emails',
  tier: 1,
  baseDuration: 5000, // 5 seconds - starter scam, nice and quick
  baseReward: 10, // Position 0: free scam, fixed base
  resourceType: 'money',
  description: 'A modest sum to secure millions from a deposed prince',
  unlockCost: undefined, // Free to start - this is the first money scam
};

/**
 * Fake Lottery Winnings - You've won! Just pay the processing fee.
 * Quick scam that exploits hope and greed.
 *
 * Position 4: unlockCost = baseReward = $27K
 */
export const FAKE_LOTTERY_WINNINGS: ScamDefinition = {
  id: 'fake-lottery-winnings',
  name: 'Fake Lottery Winnings',
  tier: 1,
  baseDuration: 45000, // 45 seconds
  baseReward: getProgressionCost(4), // Position 4 in 3× progression
  resourceType: 'money',
  description: "Congratulations! You've won! (Just pay the processing fee)",
  unlockCost: getProgressionCost(4),
};

/**
 * iPhone Popup - The millionth visitor scam.
 * Fast, low-reward popup spam that catches the gullible.
 *
 * Position 1: unlockCost = baseReward = $1K
 */
export const IPHONE_POPUP: ScamDefinition = {
  id: 'iphone-popup',
  name: '"You\'ve Won an iPhone" Popups',
  tier: 1,
  baseDuration: 10000, // 10 seconds
  baseReward: getProgressionCost(1), // Position 1 in 3× progression
  resourceType: 'money',
  description: 'You are the 1,000,000th visitor! Definitely not a lie',
  unlockCost: getProgressionCost(1),
};

/**
 * Phishing Links - Cast a wide net with fake login pages.
 * Medium speed, harvests credentials for profit.
 *
 * Position 2: unlockCost = baseReward = $3K
 */
export const PHISHING_LINKS: ScamDefinition = {
  id: 'phishing-links',
  name: 'Phishing Links',
  tier: 1,
  baseDuration: 20000, // 20 seconds
  baseReward: getProgressionCost(2), // Position 2 in 3× progression
  resourceType: 'money',
  description: 'Your account has been compromised! Click here to verify',
  unlockCost: getProgressionCost(2),
};

/**
 * Survey Scams - "Complete this survey for a $500 gift card!"
 * Slow but steady data harvesting operation.
 *
 * Position 3: unlockCost = baseReward = $9K
 */
export const SURVEY_SCAMS: ScamDefinition = {
  id: 'survey-scams',
  name: 'Survey Scams',
  tier: 1,
  baseDuration: 30000, // 30 seconds
  baseReward: getProgressionCost(3), // Position 3 in 3× progression
  resourceType: 'money',
  description: 'Complete 47 surveys for a chance to win absolutely nothing',
  unlockCost: getProgressionCost(3),
};

/**
 * Fake Antivirus Popups - Your computer is infected! (It is now.)
 * Scary popups that sell fake software.
 *
 * Position 5: unlockCost = baseReward = $81K
 */
export const FAKE_ANTIVIRUS_POPUPS: ScamDefinition = {
  id: 'fake-antivirus-popups',
  name: 'Fake Antivirus Popups',
  tier: 1,
  baseDuration: 60000, // 60 seconds (1 minute)
  baseReward: getProgressionCost(5), // Position 5 in 3× progression
  resourceType: 'money',
  description: 'WARNING: 847 viruses detected! Download TotallyLegitAV now',
  unlockCost: getProgressionCost(5),
};

/**
 * Gift Card Scams - "Pay your IRS debt in iTunes gift cards."
 * Exploits authority figures and gift card anonymity.
 *
 * Position 6: unlockCost = baseReward = $243K
 */
export const GIFT_CARD_SCAMS: ScamDefinition = {
  id: 'gift-card-scams',
  name: 'Gift Card Scams',
  tier: 1,
  baseDuration: 90000, // 90 seconds (1.5 minutes)
  baseReward: getProgressionCost(6), // Position 6 in 3× progression
  resourceType: 'money',
  description: 'The IRS accepts Steam gift cards now. Totally legit policy',
  unlockCost: getProgressionCost(6),
};

/**
 * Advance Fee Fraud - Investment opportunities that require upfront "fees."
 * Slower but more lucrative than simple popups.
 *
 * Position 7: unlockCost = baseReward = $729K
 */
export const ADVANCE_FEE_FRAUD: ScamDefinition = {
  id: 'advance-fee-fraud',
  name: 'Advance Fee Fraud',
  tier: 1,
  baseDuration: 120000, // 120 seconds (2 minutes)
  baseReward: getProgressionCost(7), // Position 7 in 3× progression
  resourceType: 'money',
  description: 'Guaranteed 500% returns! Small registration fee required',
  unlockCost: getProgressionCost(7),
};

/**
 * Fake Job Postings - Work from home! Make $5000/week doing nothing!
 * The slowest Tier 1 scam but with the highest payout.
 *
 * Position 8: unlockCost = baseReward = $2.187M
 */
export const FAKE_JOB_POSTINGS: ScamDefinition = {
  id: 'fake-job-postings',
  name: 'Fake Job Postings',
  tier: 1,
  baseDuration: 180000, // 180 seconds (3 minutes)
  baseReward: getProgressionCost(8), // Position 8 in 3× progression
  resourceType: 'money',
  description: "Work from home! Be your own boss! (Training fee: $299)",
  unlockCost: getProgressionCost(8),
};

/**
 * Collection of all Tier 1 "Small Time" scams.
 * These are the entry-level money-generating scams.
 * Ordered by ascending unlock cost (3× geometric progression).
 *
 * unlockCost = baseReward for each scam (positions 0-8 in global order)
 */
export const TIER_1_SCAMS: ScamDefinition[] = [
  NIGERIAN_PRINCE_EMAILS,  // Pos 0: Free ($10 base)
  IPHONE_POPUP,            // Pos 1: $1K
  PHISHING_LINKS,          // Pos 2: $3K
  SURVEY_SCAMS,            // Pos 3: $9K
  FAKE_LOTTERY_WINNINGS,   // Pos 4: $27K
  FAKE_ANTIVIRUS_POPUPS,   // Pos 5: $81K
  GIFT_CARD_SCAMS,         // Pos 6: $243K
  ADVANCE_FEE_FRAUD,       // Pos 7: $729K
  FAKE_JOB_POSTINGS,       // Pos 8: $2.187M
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
