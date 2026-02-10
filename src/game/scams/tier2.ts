// ABOUTME: Scam definitions for Tier 2 "Getting Serious" scams
// ABOUTME: 10 scams that unlock after first prestige (Trust 11+)

import type { ScamDefinition } from './types';
import { getProgressionCost } from '../economy/constants';

/**
 * Tech Support Scams - The classic "Hello, this is Windows" call.
 * First Tier 2 scam, position 9 in the 49-scam progression.
 *
 * 3x continuous progression: unlockCost = baseReward = getProgressionCost(9) = $6,561,000
 */
export const TECH_SUPPORT_SCAMS: ScamDefinition = {
  id: 'tech-support-scams',
  name: 'Tech Support Scams',
  tier: 2,
  baseDuration: 5000,
  baseReward: getProgressionCost(9),
  resourceType: 'money',
  description: 'Hello, this is Windows calling about your virus problem',
  unlockCost: getProgressionCost(9),
};

/**
 * Romance Catfishing - Fake online dating profiles for profit.
 *
 * 3x continuous progression: unlockCost = baseReward = getProgressionCost(10) = $19,683,000
 */
export const ROMANCE_CATFISHING: ScamDefinition = {
  id: 'romance-catfishing',
  name: 'Romance Catfishing',
  tier: 2,
  baseDuration: 10000,
  baseReward: getProgressionCost(10),
  resourceType: 'money',
  description: 'I know we haven\'t met in person yet, but I really need $500 for a plane ticket',
  unlockCost: getProgressionCost(10),
};

/**
 * Fake Charity Drives - Exploiting goodwill for profit.
 *
 * 3x continuous progression: unlockCost = baseReward = getProgressionCost(11) = $59,049,000
 */
export const FAKE_CHARITY_DRIVES: ScamDefinition = {
  id: 'fake-charity-drives',
  name: 'Fake Charity Drives',
  tier: 2,
  baseDuration: 20000,
  baseReward: getProgressionCost(11),
  resourceType: 'money',
  description: 'Save the endangered internet pixels! Every donation counts',
  unlockCost: getProgressionCost(11),
};

/**
 * Rental Scams - Listing properties you don't own.
 *
 * 3x continuous progression: unlockCost = baseReward = getProgressionCost(12) = $177,147,000
 */
export const RENTAL_SCAMS: ScamDefinition = {
  id: 'rental-scams',
  name: 'Rental Scams',
  tier: 2,
  baseDuration: 30000,
  baseReward: getProgressionCost(12),
  resourceType: 'money',
  description: 'Beautiful 3BR apartment, great price! Just wire the deposit sight unseen',
  unlockCost: getProgressionCost(12),
};

/**
 * Ticket Scalping Bots - Automated ticket buying and reselling.
 *
 * 3x continuous progression: unlockCost = baseReward = getProgressionCost(13) = $531,441,000
 */
export const TICKET_SCALPING_BOTS: ScamDefinition = {
  id: 'ticket-scalping-bots',
  name: 'Ticket Scalping Bots',
  tier: 2,
  baseDuration: 45000,
  baseReward: getProgressionCost(13),
  resourceType: 'money',
  description: 'Front row seats! Only 47x the original price. Supply and demand, baby',
  unlockCost: getProgressionCost(13),
};

/**
 * Fake Review Farms - Manufacturing 5-star reviews at scale.
 *
 * 3x continuous progression: unlockCost = baseReward = getProgressionCost(14) = $1,594,323,000
 */
export const FAKE_REVIEW_FARMS: ScamDefinition = {
  id: 'fake-review-farms',
  name: 'Fake Review Farms',
  tier: 2,
  baseDuration: 60000,
  baseReward: getProgressionCost(14),
  resourceType: 'money',
  description: 'Best product ever! Changed my life! (I have never used this product)',
  unlockCost: getProgressionCost(14),
};

/**
 * Click Fraud - Generating fake ad clicks for profit.
 *
 * 3x continuous progression: unlockCost = baseReward = getProgressionCost(15) = $4,782,969,000
 */
export const CLICK_FRAUD: ScamDefinition = {
  id: 'click-fraud',
  name: 'Click Fraud',
  tier: 2,
  baseDuration: 90000,
  baseReward: getProgressionCost(15),
  resourceType: 'money',
  description: 'Every click costs someone money. Might as well be your bots doing the clicking',
  unlockCost: getProgressionCost(15),
};

/**
 * Influencer Impersonation - Pretending to be famous online.
 *
 * 3x continuous progression: unlockCost = baseReward = getProgressionCost(16) = $14,348,907,000
 */
export const INFLUENCER_IMPERSONATION: ScamDefinition = {
  id: 'influencer-impersonation',
  name: 'Influencer Impersonation',
  tier: 2,
  baseDuration: 120000,
  baseReward: getProgressionCost(16),
  resourceType: 'money',
  description: 'Hey guys its me, your favorite influencer! Check out my new crypto course',
  unlockCost: getProgressionCost(16),
};

/**
 * Dropshipping Fraud - Selling products you never intend to deliver.
 *
 * 3x continuous progression: unlockCost = baseReward = getProgressionCost(17) = $43,046,721,000
 */
export const DROPSHIPPING_FRAUD: ScamDefinition = {
  id: 'dropshipping-fraud',
  name: 'Dropshipping Fraud',
  tier: 2,
  baseDuration: 180000,
  baseReward: getProgressionCost(17),
  resourceType: 'money',
  description: 'Shipping in 6-8 weeks! (from a warehouse that does not exist)',
  unlockCost: getProgressionCost(17),
};

/**
 * Warranty Scams - Selling worthless extended warranties.
 *
 * 3x continuous progression: unlockCost = baseReward = getProgressionCost(18) = $129,140,163,000
 */
export const WARRANTY_SCAMS: ScamDefinition = {
  id: 'warranty-scams',
  name: 'Warranty Scams',
  tier: 2,
  baseDuration: 180000,
  baseReward: getProgressionCost(18),
  resourceType: 'money',
  description: "We've been trying to reach you about your car's extended warranty",
  unlockCost: getProgressionCost(18),
};

/**
 * Collection of all Tier 2 "Getting Serious" scams.
 * Ordered by ascending unlock cost (3x continuous progression, positions 9-18).
 */
export const TIER_2_SCAMS: ScamDefinition[] = [
  TECH_SUPPORT_SCAMS,      // pos 9:  $6.56M
  ROMANCE_CATFISHING,      // pos 10: $19.68M
  FAKE_CHARITY_DRIVES,     // pos 11: $59.05M
  RENTAL_SCAMS,            // pos 12: $177.15M
  TICKET_SCALPING_BOTS,    // pos 13: $531.44M
  FAKE_REVIEW_FARMS,       // pos 14: $1.59B
  CLICK_FRAUD,             // pos 15: $4.78B
  INFLUENCER_IMPERSONATION,// pos 16: $14.35B
  DROPSHIPPING_FRAUD,      // pos 17: $43.05B
  WARRANTY_SCAMS,          // pos 18: $129.14B
];
