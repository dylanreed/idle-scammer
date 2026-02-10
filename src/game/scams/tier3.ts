// ABOUTME: Scam definitions for Tier 3 "Big Leagues" scams
// ABOUTME: 10 scams that unlock after second prestige (Trust 21+)

import type { ScamDefinition } from './types';
import { getProgressionCost } from '../economy/constants';

/**
 * Crypto Rug Pulls - The classic "to the moon" exit scam.
 * First Tier 3 scam.
 *
 * Kongregate economy: position 19 in 3x progression
 */
export const CRYPTO_RUG_PULLS: ScamDefinition = {
  id: 'crypto-rug-pulls',
  name: 'Crypto Rug Pulls',
  tier: 3,
  baseDuration: 5000,
  baseReward: getProgressionCost(19),
  resourceType: 'money',
  description: 'To the moon! Oh wait, the devs just sold everything',
  unlockCost: getProgressionCost(19),
};

/**
 * Fake Investment Schemes - Classic Ponzi schemes with a modern twist.
 *
 * Kongregate economy: position 20 in 3x progression
 */
export const FAKE_INVESTMENT_SCHEMES: ScamDefinition = {
  id: 'fake-investment-schemes',
  name: 'Fake Investment Schemes',
  tier: 3,
  baseDuration: 10000,
  baseReward: getProgressionCost(20),
  resourceType: 'money',
  description: 'Guaranteed 200% monthly returns! Not a Ponzi, we promise',
  unlockCost: getProgressionCost(20),
};

/**
 * Corporate Phishing - Targeting the C-suite with convincing emails.
 *
 * Kongregate economy: position 21 in 3x progression
 */
export const CORPORATE_PHISHING: ScamDefinition = {
  id: 'corporate-phishing',
  name: 'Corporate Phishing',
  tier: 3,
  baseDuration: 20000,
  baseReward: getProgressionCost(21),
  resourceType: 'money',
  description: 'Dear CEO, please wire $2M to this totally legitimate vendor',
  unlockCost: getProgressionCost(21),
};

/**
 * Business Email Compromise - Impersonating executives for wire transfers.
 *
 * Kongregate economy: position 22 in 3x progression
 */
export const BUSINESS_EMAIL_COMPROMISE: ScamDefinition = {
  id: 'business-email-compromise',
  name: 'Business Email Compromise',
  tier: 3,
  baseDuration: 30000,
  baseReward: getProgressionCost(22),
  resourceType: 'money',
  description: 'I\'m definitely your CFO. Please approve this wire transfer ASAP',
  unlockCost: getProgressionCost(22),
};

/**
 * NFT Pump & Dumps - Hyping worthless JPEGs to astronomical prices.
 *
 * Kongregate economy: position 23 in 3x progression
 */
export const NFT_PUMP_AND_DUMPS: ScamDefinition = {
  id: 'nft-pump-and-dumps',
  name: 'NFT Pump & Dumps',
  tier: 3,
  baseDuration: 45000,
  baseReward: getProgressionCost(23),
  resourceType: 'money',
  description: 'This pixelated rock will definitely be worth millions someday',
  unlockCost: getProgressionCost(23),
};

/**
 * Fake ICOs - Launching fraudulent cryptocurrency projects.
 *
 * Kongregate economy: position 24 in 3x progression
 */
export const FAKE_ICOS: ScamDefinition = {
  id: 'fake-icos',
  name: 'Fake ICOs',
  tier: 3,
  baseDuration: 60000,
  baseReward: getProgressionCost(24),
  resourceType: 'money',
  description: 'Introducing BlockchainCoin: disrupting the disruption of disruptions',
  unlockCost: getProgressionCost(24),
};

/**
 * SIM Swapping - Hijacking phone numbers to access accounts.
 *
 * Kongregate economy: position 25 in 3x progression
 */
export const SIM_SWAPPING: ScamDefinition = {
  id: 'sim-swapping',
  name: 'SIM Swapping',
  tier: 3,
  baseDuration: 90000,
  baseReward: getProgressionCost(25),
  resourceType: 'money',
  description: 'Hello carrier, I am definitely the account owner. New SIM please',
  unlockCost: getProgressionCost(25),
};

/**
 * Account Takeover Services - Bulk account compromise operations.
 *
 * Kongregate economy: position 26 in 3x progression
 */
export const ACCOUNT_TAKEOVER_SERVICES: ScamDefinition = {
  id: 'account-takeover-services',
  name: 'Account Takeover Services',
  tier: 3,
  baseDuration: 120000,
  baseReward: getProgressionCost(26),
  resourceType: 'money',
  description: 'Your accounts are now my accounts. Thanks for the weak password',
  unlockCost: getProgressionCost(26),
};

/**
 * Credential Stuffing - Automated mass account testing with leaked passwords.
 *
 * Kongregate economy: position 27 in 3x progression
 */
export const CREDENTIAL_STUFFING: ScamDefinition = {
  id: 'credential-stuffing',
  name: 'Credential Stuffing',
  tier: 3,
  baseDuration: 180000,
  baseReward: getProgressionCost(27),
  resourceType: 'money',
  description: 'Testing your leaked password on 10,000 sites simultaneously',
  unlockCost: getProgressionCost(27),
};

/**
 * Ransomware-as-a-Service - Enterprise-grade file encryption for profit.
 *
 * Kongregate economy: position 28 in 3x progression
 */
export const RANSOMWARE_AS_A_SERVICE: ScamDefinition = {
  id: 'ransomware-as-a-service',
  name: 'Ransomware-as-a-Service',
  tier: 3,
  baseDuration: 180000,
  baseReward: getProgressionCost(28),
  resourceType: 'money',
  description: 'Your files are encrypted. Bitcoin or bye-bye data',
  unlockCost: getProgressionCost(28),
};

/**
 * Collection of all Tier 3 "Big Leagues" scams.
 * Ordered by ascending unlock cost (3x progression, positions 19-28).
 */
export const TIER_3_SCAMS: ScamDefinition[] = [
  CRYPTO_RUG_PULLS,               // position 19
  FAKE_INVESTMENT_SCHEMES,        // position 20
  CORPORATE_PHISHING,             // position 21
  BUSINESS_EMAIL_COMPROMISE,      // position 22
  NFT_PUMP_AND_DUMPS,             // position 23
  FAKE_ICOS,                      // position 24
  SIM_SWAPPING,                   // position 25
  ACCOUNT_TAKEOVER_SERVICES,      // position 26
  CREDENTIAL_STUFFING,            // position 27
  RANSOMWARE_AS_A_SERVICE,        // position 28
];
