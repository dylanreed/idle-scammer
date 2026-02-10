// ABOUTME: Scam definitions for Tier 3 "Big Leagues" scams
// ABOUTME: 10 scams that unlock after second prestige (Trust 21+)

import type { ScamDefinition } from './types';

/**
 * Crypto Rug Pulls - The classic "to the moon" exit scam.
 * First Tier 3 scam, free to unlock within the tier.
 *
 * Kongregate economy: FREE scam uses tier baseCost ($100K) as baseReward
 */
export const CRYPTO_RUG_PULLS: ScamDefinition = {
  id: 'crypto-rug-pulls',
  name: 'Crypto Rug Pulls',
  tier: 3,
  baseDuration: 5000,
  baseReward: 100000,
  resourceType: 'money',
  description: 'To the moon! Oh wait, the devs just sold everything',
  unlockCost: undefined,
};

/**
 * Fake Investment Schemes - Classic Ponzi schemes with a modern twist.
 *
 * Kongregate economy: unlockCost = baseReward = $10M
 */
export const FAKE_INVESTMENT_SCHEMES: ScamDefinition = {
  id: 'fake-investment-schemes',
  name: 'Fake Investment Schemes',
  tier: 3,
  baseDuration: 10000,
  baseReward: 10000000,
  resourceType: 'money',
  description: 'Guaranteed 200% monthly returns! Not a Ponzi, we promise',
  unlockCost: 10000000,
};

/**
 * Corporate Phishing - Targeting the C-suite with convincing emails.
 *
 * Kongregate economy: unlockCost = baseReward = $100M
 */
export const CORPORATE_PHISHING: ScamDefinition = {
  id: 'corporate-phishing',
  name: 'Corporate Phishing',
  tier: 3,
  baseDuration: 20000,
  baseReward: 100000000,
  resourceType: 'money',
  description: 'Dear CEO, please wire $2M to this totally legitimate vendor',
  unlockCost: 100000000,
};

/**
 * Business Email Compromise - Impersonating executives for wire transfers.
 *
 * Kongregate economy: unlockCost = baseReward = $1B
 */
export const BUSINESS_EMAIL_COMPROMISE: ScamDefinition = {
  id: 'business-email-compromise',
  name: 'Business Email Compromise',
  tier: 3,
  baseDuration: 30000,
  baseReward: 1000000000,
  resourceType: 'money',
  description: 'I\'m definitely your CFO. Please approve this wire transfer ASAP',
  unlockCost: 1000000000,
};

/**
 * NFT Pump & Dumps - Hyping worthless JPEGs to astronomical prices.
 *
 * Kongregate economy: unlockCost = baseReward = $10B
 */
export const NFT_PUMP_AND_DUMPS: ScamDefinition = {
  id: 'nft-pump-and-dumps',
  name: 'NFT Pump & Dumps',
  tier: 3,
  baseDuration: 45000,
  baseReward: 10000000000,
  resourceType: 'money',
  description: 'This pixelated rock will definitely be worth millions someday',
  unlockCost: 10000000000,
};

/**
 * Fake ICOs - Launching fraudulent cryptocurrency projects.
 *
 * Kongregate economy: unlockCost = baseReward = $100B
 */
export const FAKE_ICOS: ScamDefinition = {
  id: 'fake-icos',
  name: 'Fake ICOs',
  tier: 3,
  baseDuration: 60000,
  baseReward: 100000000000,
  resourceType: 'money',
  description: 'Introducing BlockchainCoin: disrupting the disruption of disruptions',
  unlockCost: 100000000000,
};

/**
 * SIM Swapping - Hijacking phone numbers to access accounts.
 *
 * Kongregate economy: unlockCost = baseReward = $1T
 */
export const SIM_SWAPPING: ScamDefinition = {
  id: 'sim-swapping',
  name: 'SIM Swapping',
  tier: 3,
  baseDuration: 90000,
  baseReward: 1000000000000,
  resourceType: 'money',
  description: 'Hello carrier, I am definitely the account owner. New SIM please',
  unlockCost: 1000000000000,
};

/**
 * Account Takeover Services - Bulk account compromise operations.
 *
 * Kongregate economy: unlockCost = baseReward = $10T
 */
export const ACCOUNT_TAKEOVER_SERVICES: ScamDefinition = {
  id: 'account-takeover-services',
  name: 'Account Takeover Services',
  tier: 3,
  baseDuration: 120000,
  baseReward: 10000000000000,
  resourceType: 'money',
  description: 'Your accounts are now my accounts. Thanks for the weak password',
  unlockCost: 10000000000000,
};

/**
 * Credential Stuffing - Automated mass account testing with leaked passwords.
 *
 * Kongregate economy: unlockCost = baseReward = $100T
 */
export const CREDENTIAL_STUFFING: ScamDefinition = {
  id: 'credential-stuffing',
  name: 'Credential Stuffing',
  tier: 3,
  baseDuration: 180000,
  baseReward: 100000000000000,
  resourceType: 'money',
  description: 'Testing your leaked password on 10,000 sites simultaneously',
  unlockCost: 100000000000000,
};

/**
 * Ransomware-as-a-Service - Enterprise-grade file encryption for profit.
 *
 * Kongregate economy: unlockCost = baseReward = $1Qa
 */
export const RANSOMWARE_AS_A_SERVICE: ScamDefinition = {
  id: 'ransomware-as-a-service',
  name: 'Ransomware-as-a-Service',
  tier: 3,
  baseDuration: 180000,
  baseReward: 1000000000000000,
  resourceType: 'money',
  description: 'Your files are encrypted. Bitcoin or bye-bye data',
  unlockCost: 1000000000000000,
};

/**
 * Collection of all Tier 3 "Big Leagues" scams.
 * Ordered by ascending unlock cost (100x progression from baseCost).
 */
export const TIER_3_SCAMS: ScamDefinition[] = [
  CRYPTO_RUG_PULLS,               // Free ($100K base)
  FAKE_INVESTMENT_SCHEMES,        // $10M
  CORPORATE_PHISHING,             // $100M
  BUSINESS_EMAIL_COMPROMISE,      // $1B
  NFT_PUMP_AND_DUMPS,             // $10B
  FAKE_ICOS,                      // $100B
  SIM_SWAPPING,                   // $1T
  ACCOUNT_TAKEOVER_SERVICES,      // $10T
  CREDENTIAL_STUFFING,            // $100T
  RANSOMWARE_AS_A_SERVICE,        // $1Qa
];
