// ABOUTME: Scam definitions for Tier 5 "Mastermind" scams
// ABOUTME: 10 scams that unlock after fourth prestige (Trust 41+)

import type { ScamDefinition } from './types';
import { getProgressionCost } from '../economy/constants';

/**
 * Government Contract Fraud - Delivering nothing for billions.
 * Position 39 in 3x progression.
 */
export const GOVERNMENT_CONTRACT_FRAUD: ScamDefinition = {
  id: 'government-contract-fraud',
  name: 'Government Contract Fraud',
  tier: 5,
  baseDuration: 5000,
  baseReward: getProgressionCost(39),
  resourceType: 'money',
  description: 'Delivering nothing for billions. The military-industrial complex approves',
  unlockCost: getProgressionCost(39),
};

/**
 * International Wire Fraud - Moving money across borders faster than regulators.
 * Position 40 in 3x progression.
 */
export const INTERNATIONAL_WIRE_FRAUD: ScamDefinition = {
  id: 'international-wire-fraud',
  name: 'International Wire Fraud',
  tier: 5,
  baseDuration: 10000,
  baseReward: getProgressionCost(40),
  resourceType: 'money',
  description: 'Moving money across borders faster than regulators can follow',
  unlockCost: getProgressionCost(40),
};

/**
 * Shadow Banking - A bank with no rules and no oversight.
 * Position 41 in 3x progression.
 */
export const SHADOW_BANKING: ScamDefinition = {
  id: 'shadow-banking',
  name: 'Shadow Banking',
  tier: 5,
  baseDuration: 20000,
  baseReward: getProgressionCost(41),
  resourceType: 'money',
  description: 'A bank with no rules, no oversight, and definitely no FDIC insurance',
  unlockCost: getProgressionCost(41),
};

/**
 * Election Manipulation - Democracy is just a suggestion with enough bots.
 * Position 42 in 3x progression.
 */
export const ELECTION_MANIPULATION: ScamDefinition = {
  id: 'election-manipulation',
  name: 'Election Manipulation',
  tier: 5,
  baseDuration: 30000,
  baseReward: getProgressionCost(42),
  resourceType: 'money',
  description: 'Democracy is just a suggestion when you have enough bots',
  unlockCost: getProgressionCost(42),
};

/**
 * Corporate Espionage - Your trade secrets are very profitable.
 * Position 43 in 3x progression.
 */
export const CORPORATE_ESPIONAGE: ScamDefinition = {
  id: 'corporate-espionage',
  name: 'Corporate Espionage',
  tier: 5,
  baseDuration: 45000,
  baseReward: getProgressionCost(43),
  resourceType: 'money',
  description: 'Your trade secrets are very interesting. And very profitable',
  unlockCost: getProgressionCost(43),
};

/**
 * Stock Manipulation - To the moon because we control the rocket.
 * Position 44 in 3x progression.
 */
export const STOCK_MANIPULATION: ScamDefinition = {
  id: 'stock-manipulation',
  name: 'Stock Manipulation',
  tier: 5,
  baseDuration: 60000,
  baseReward: getProgressionCost(44),
  resourceType: 'money',
  description: 'To the moon! (Because we control the rocket)',
  unlockCost: getProgressionCost(44),
};

/**
 * Real Estate Fraud Empires - Selling the same building multiple times.
 * Position 45 in 3x progression.
 */
export const REAL_ESTATE_FRAUD_EMPIRES: ScamDefinition = {
  id: 'real-estate-fraud-empires',
  name: 'Real Estate Fraud Empires',
  tier: 5,
  baseDuration: 90000,
  baseReward: getProgressionCost(45),
  resourceType: 'money',
  description: 'Selling the same building to 12 different buyers simultaneously',
  unlockCost: getProgressionCost(45),
};

/**
 * Pharmaceutical Counterfeiting - Sugar pills with a fancy label.
 * Position 46 in 3x progression.
 */
export const PHARMACEUTICAL_COUNTERFEITING: ScamDefinition = {
  id: 'pharmaceutical-counterfeiting',
  name: 'Pharmaceutical Counterfeiting',
  tier: 5,
  baseDuration: 120000,
  baseReward: getProgressionCost(46),
  resourceType: 'money',
  description: 'Sugar pills with a fancy label. Side effects include being scammed',
  unlockCost: getProgressionCost(46),
};

/**
 * Art Forgery & Laundering - Banana duct-taped to a wall worth millions.
 * Position 47 in 3x progression.
 */
export const ART_FORGERY_AND_LAUNDERING: ScamDefinition = {
  id: 'art-forgery-and-laundering',
  name: 'Art Forgery & Laundering',
  tier: 5,
  baseDuration: 180000,
  baseReward: getProgressionCost(47),
  resourceType: 'money',
  description: 'This banana duct-taped to a wall is worth $47 million. Trust me',
  unlockCost: getProgressionCost(47),
};

/**
 * Central Bank Heists - Why rob a bank when you can rob THE bank?
 * Position 48 in 3x progression.
 */
export const CENTRAL_BANK_HEISTS: ScamDefinition = {
  id: 'central-bank-heists',
  name: 'Central Bank Heists',
  tier: 5,
  baseDuration: 180000,
  baseReward: getProgressionCost(48),
  resourceType: 'money',
  description: 'Why rob a bank when you can rob THE bank?',
  unlockCost: getProgressionCost(48),
};

/**
 * Collection of all Tier 5 "Mastermind" scams.
 * Ordered by ascending position in 3x progression (positions 39-48).
 */
export const TIER_5_SCAMS: ScamDefinition[] = [
  GOVERNMENT_CONTRACT_FRAUD,          // Position 39
  INTERNATIONAL_WIRE_FRAUD,           // Position 40
  SHADOW_BANKING,                     // Position 41
  ELECTION_MANIPULATION,              // Position 42
  CORPORATE_ESPIONAGE,                // Position 43
  STOCK_MANIPULATION,                 // Position 44
  REAL_ESTATE_FRAUD_EMPIRES,          // Position 45
  PHARMACEUTICAL_COUNTERFEITING,      // Position 46
  ART_FORGERY_AND_LAUNDERING,         // Position 47
  CENTRAL_BANK_HEISTS,                // Position 48
];
