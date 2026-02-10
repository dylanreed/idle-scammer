// ABOUTME: Scam definitions for Tier 2 "Getting Serious" scams
// ABOUTME: 10 scams that unlock after first prestige (Trust 11+)

import type { ScamDefinition } from './types';

/**
 * Tech Support Scams - The classic "Hello, this is Windows" call.
 * First Tier 2 scam, free to unlock within the tier.
 *
 * Kongregate economy: FREE scam uses tier baseCost ($1K) as baseReward
 */
export const TECH_SUPPORT_SCAMS: ScamDefinition = {
  id: 'tech-support-scams',
  name: 'Tech Support Scams',
  tier: 2,
  baseDuration: 5000,
  baseReward: 1000,
  resourceType: 'money',
  description: 'Hello, this is Windows calling about your virus problem',
  unlockCost: undefined,
};

/**
 * Romance Catfishing - Fake online dating profiles for profit.
 *
 * Kongregate economy: unlockCost = baseReward = $100K
 */
export const ROMANCE_CATFISHING: ScamDefinition = {
  id: 'romance-catfishing',
  name: 'Romance Catfishing',
  tier: 2,
  baseDuration: 10000,
  baseReward: 100000,
  resourceType: 'money',
  description: 'I know we haven\'t met in person yet, but I really need $500 for a plane ticket',
  unlockCost: 100000,
};

/**
 * Fake Charity Drives - Exploiting goodwill for profit.
 *
 * Kongregate economy: unlockCost = baseReward = $1M
 */
export const FAKE_CHARITY_DRIVES: ScamDefinition = {
  id: 'fake-charity-drives',
  name: 'Fake Charity Drives',
  tier: 2,
  baseDuration: 20000,
  baseReward: 1000000,
  resourceType: 'money',
  description: 'Save the endangered internet pixels! Every donation counts',
  unlockCost: 1000000,
};

/**
 * Rental Scams - Listing properties you don't own.
 *
 * Kongregate economy: unlockCost = baseReward = $10M
 */
export const RENTAL_SCAMS: ScamDefinition = {
  id: 'rental-scams',
  name: 'Rental Scams',
  tier: 2,
  baseDuration: 30000,
  baseReward: 10000000,
  resourceType: 'money',
  description: 'Beautiful 3BR apartment, great price! Just wire the deposit sight unseen',
  unlockCost: 10000000,
};

/**
 * Ticket Scalping Bots - Automated ticket buying and reselling.
 *
 * Kongregate economy: unlockCost = baseReward = $100M
 */
export const TICKET_SCALPING_BOTS: ScamDefinition = {
  id: 'ticket-scalping-bots',
  name: 'Ticket Scalping Bots',
  tier: 2,
  baseDuration: 45000,
  baseReward: 100000000,
  resourceType: 'money',
  description: 'Front row seats! Only 47x the original price. Supply and demand, baby',
  unlockCost: 100000000,
};

/**
 * Fake Review Farms - Manufacturing 5-star reviews at scale.
 *
 * Kongregate economy: unlockCost = baseReward = $1B
 */
export const FAKE_REVIEW_FARMS: ScamDefinition = {
  id: 'fake-review-farms',
  name: 'Fake Review Farms',
  tier: 2,
  baseDuration: 60000,
  baseReward: 1000000000,
  resourceType: 'money',
  description: 'Best product ever! Changed my life! (I have never used this product)',
  unlockCost: 1000000000,
};

/**
 * Click Fraud - Generating fake ad clicks for profit.
 *
 * Kongregate economy: unlockCost = baseReward = $10B
 */
export const CLICK_FRAUD: ScamDefinition = {
  id: 'click-fraud',
  name: 'Click Fraud',
  tier: 2,
  baseDuration: 90000,
  baseReward: 10000000000,
  resourceType: 'money',
  description: 'Every click costs someone money. Might as well be your bots doing the clicking',
  unlockCost: 10000000000,
};

/**
 * Influencer Impersonation - Pretending to be famous online.
 *
 * Kongregate economy: unlockCost = baseReward = $100B
 */
export const INFLUENCER_IMPERSONATION: ScamDefinition = {
  id: 'influencer-impersonation',
  name: 'Influencer Impersonation',
  tier: 2,
  baseDuration: 120000,
  baseReward: 100000000000,
  resourceType: 'money',
  description: 'Hey guys its me, your favorite influencer! Check out my new crypto course',
  unlockCost: 100000000000,
};

/**
 * Dropshipping Fraud - Selling products you never intend to deliver.
 *
 * Kongregate economy: unlockCost = baseReward = $1T
 */
export const DROPSHIPPING_FRAUD: ScamDefinition = {
  id: 'dropshipping-fraud',
  name: 'Dropshipping Fraud',
  tier: 2,
  baseDuration: 180000,
  baseReward: 1000000000000,
  resourceType: 'money',
  description: 'Shipping in 6-8 weeks! (from a warehouse that does not exist)',
  unlockCost: 1000000000000,
};

/**
 * Warranty Scams - Selling worthless extended warranties.
 *
 * Kongregate economy: unlockCost = baseReward = $10T
 */
export const WARRANTY_SCAMS: ScamDefinition = {
  id: 'warranty-scams',
  name: 'Warranty Scams',
  tier: 2,
  baseDuration: 180000,
  baseReward: 10000000000000,
  resourceType: 'money',
  description: "We've been trying to reach you about your car's extended warranty",
  unlockCost: 10000000000000,
};

/**
 * Collection of all Tier 2 "Getting Serious" scams.
 * Ordered by ascending unlock cost (100x progression from baseCost).
 */
export const TIER_2_SCAMS: ScamDefinition[] = [
  TECH_SUPPORT_SCAMS,      // Free ($1K base)
  ROMANCE_CATFISHING,      // $100K
  FAKE_CHARITY_DRIVES,     // $1M
  RENTAL_SCAMS,            // $10M
  TICKET_SCALPING_BOTS,    // $100M
  FAKE_REVIEW_FARMS,       // $1B
  CLICK_FRAUD,             // $10B
  INFLUENCER_IMPERSONATION,// $100B
  DROPSHIPPING_FRAUD,      // $1T
  WARRANTY_SCAMS,          // $10T
];
