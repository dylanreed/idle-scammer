// ABOUTME: Scam definitions for Tier 5 "Mastermind" scams
// ABOUTME: 10 scams that unlock after fourth prestige (Trust 41+)

import type { ScamDefinition } from './types';

/**
 * Government Contract Fraud - Delivering nothing for billions.
 * First Tier 5 scam, free to unlock within the tier.
 *
 * Kongregate economy: FREE scam uses tier baseCost ($1B) as baseReward
 */
export const GOVERNMENT_CONTRACT_FRAUD: ScamDefinition = {
  id: 'government-contract-fraud',
  name: 'Government Contract Fraud',
  tier: 5,
  baseDuration: 5000,
  baseReward: 1000000000,
  resourceType: 'money',
  description: 'Delivering nothing for billions. The military-industrial complex approves',
  unlockCost: undefined,
};

/**
 * International Wire Fraud - Moving money across borders faster than regulators.
 *
 * Kongregate economy: unlockCost = baseReward = $100B
 */
export const INTERNATIONAL_WIRE_FRAUD: ScamDefinition = {
  id: 'international-wire-fraud',
  name: 'International Wire Fraud',
  tier: 5,
  baseDuration: 10000,
  baseReward: 100000000000,
  resourceType: 'money',
  description: 'Moving money across borders faster than regulators can follow',
  unlockCost: 100000000000,
};

/**
 * Shadow Banking - A bank with no rules and no oversight.
 *
 * Kongregate economy: unlockCost = baseReward = $1T
 */
export const SHADOW_BANKING: ScamDefinition = {
  id: 'shadow-banking',
  name: 'Shadow Banking',
  tier: 5,
  baseDuration: 20000,
  baseReward: 1000000000000,
  resourceType: 'money',
  description: 'A bank with no rules, no oversight, and definitely no FDIC insurance',
  unlockCost: 1000000000000,
};

/**
 * Election Manipulation - Democracy is just a suggestion with enough bots.
 *
 * Kongregate economy: unlockCost = baseReward = $10T
 */
export const ELECTION_MANIPULATION: ScamDefinition = {
  id: 'election-manipulation',
  name: 'Election Manipulation',
  tier: 5,
  baseDuration: 30000,
  baseReward: 10000000000000,
  resourceType: 'money',
  description: 'Democracy is just a suggestion when you have enough bots',
  unlockCost: 10000000000000,
};

/**
 * Corporate Espionage - Your trade secrets are very profitable.
 *
 * Kongregate economy: unlockCost = baseReward = $100T
 */
export const CORPORATE_ESPIONAGE: ScamDefinition = {
  id: 'corporate-espionage',
  name: 'Corporate Espionage',
  tier: 5,
  baseDuration: 45000,
  baseReward: 100000000000000,
  resourceType: 'money',
  description: 'Your trade secrets are very interesting. And very profitable',
  unlockCost: 100000000000000,
};

/**
 * Stock Manipulation - To the moon because we control the rocket.
 *
 * Kongregate economy: unlockCost = baseReward = $1Qa
 */
export const STOCK_MANIPULATION: ScamDefinition = {
  id: 'stock-manipulation',
  name: 'Stock Manipulation',
  tier: 5,
  baseDuration: 60000,
  baseReward: 1000000000000000,
  resourceType: 'money',
  description: 'To the moon! (Because we control the rocket)',
  unlockCost: 1000000000000000,
};

/**
 * Real Estate Fraud Empires - Selling the same building multiple times.
 *
 * Kongregate economy: unlockCost = baseReward = $10Qa
 */
export const REAL_ESTATE_FRAUD_EMPIRES: ScamDefinition = {
  id: 'real-estate-fraud-empires',
  name: 'Real Estate Fraud Empires',
  tier: 5,
  baseDuration: 90000,
  baseReward: 10000000000000000,
  resourceType: 'money',
  description: 'Selling the same building to 12 different buyers simultaneously',
  unlockCost: 10000000000000000,
};

/**
 * Pharmaceutical Counterfeiting - Sugar pills with a fancy label.
 *
 * Kongregate economy: unlockCost = baseReward = $100Qa
 */
export const PHARMACEUTICAL_COUNTERFEITING: ScamDefinition = {
  id: 'pharmaceutical-counterfeiting',
  name: 'Pharmaceutical Counterfeiting',
  tier: 5,
  baseDuration: 120000,
  baseReward: 100000000000000000,
  resourceType: 'money',
  description: 'Sugar pills with a fancy label. Side effects include being scammed',
  unlockCost: 100000000000000000,
};

/**
 * Art Forgery & Laundering - Banana duct-taped to a wall worth millions.
 *
 * Kongregate economy: unlockCost = baseReward = $1Qi
 */
export const ART_FORGERY_AND_LAUNDERING: ScamDefinition = {
  id: 'art-forgery-and-laundering',
  name: 'Art Forgery & Laundering',
  tier: 5,
  baseDuration: 180000,
  baseReward: 1000000000000000000,
  resourceType: 'money',
  description: 'This banana duct-taped to a wall is worth $47 million. Trust me',
  unlockCost: 1000000000000000000,
};

/**
 * Central Bank Heists - Why rob a bank when you can rob THE bank?
 *
 * Kongregate economy: unlockCost = baseReward = $10Qi
 */
export const CENTRAL_BANK_HEISTS: ScamDefinition = {
  id: 'central-bank-heists',
  name: 'Central Bank Heists',
  tier: 5,
  baseDuration: 180000,
  baseReward: 10000000000000000000,
  resourceType: 'money',
  description: 'Why rob a bank when you can rob THE bank?',
  unlockCost: 10000000000000000000,
};

/**
 * Collection of all Tier 5 "Mastermind" scams.
 * Ordered by ascending unlock cost (100x progression from baseCost).
 */
export const TIER_5_SCAMS: ScamDefinition[] = [
  GOVERNMENT_CONTRACT_FRAUD,          // Free ($1B base)
  INTERNATIONAL_WIRE_FRAUD,           // $100B
  SHADOW_BANKING,                     // $1T
  ELECTION_MANIPULATION,              // $10T
  CORPORATE_ESPIONAGE,                // $100T
  STOCK_MANIPULATION,                 // $1Qa
  REAL_ESTATE_FRAUD_EMPIRES,          // $10Qa
  PHARMACEUTICAL_COUNTERFEITING,      // $100Qa
  ART_FORGERY_AND_LAUNDERING,         // $1Qi
  CENTRAL_BANK_HEISTS,                // $10Qi
];
