// ABOUTME: Employee definitions for all Tier 5 "Mastermind" scams
// ABOUTME: Each scam has one specialized employee type that boosts output

import type { EmployeeDefinition } from './types';

/**
 * Lobbyist - Greases the wheels of government contract awards.
 * Works on: Government Contract Fraud
 */
export const LOBBYIST: EmployeeDefinition = {
  id: 'lobbyist',
  name: 'Lobbyist',
  scamId: 'government-contract-fraud',
  baseCost: 3500,
  speedBoost: 0.02,
  rewardBoost: 0.04,
};

/**
 * International Wire Router - Routes funds through untraceable channels.
 * Works on: International Wire Fraud
 */
export const INTL_WIRE_ROUTER: EmployeeDefinition = {
  id: 'intl-wire-router',
  name: 'International Wire Router',
  scamId: 'international-wire-fraud',
  baseCost: 3600,
  speedBoost: 0.03,
  rewardBoost: 0.05,
};

/**
 * Shadow Banker - Operates off-the-books financial institutions.
 * Works on: Shadow Banking
 */
export const SHADOW_BANKER: EmployeeDefinition = {
  id: 'shadow-banker',
  name: 'Shadow Banker',
  scamId: 'shadow-banking',
  baseCost: 3700,
  speedBoost: 0.04,
  rewardBoost: 0.06,
};

/**
 * Disinformation Agent - Spreads targeted false narratives at scale.
 * Works on: Election Manipulation
 */
export const DISINFORMATION_AGENT: EmployeeDefinition = {
  id: 'disinformation-agent',
  name: 'Disinformation Agent',
  scamId: 'election-manipulation',
  baseCost: 3800,
  speedBoost: 0.02,
  rewardBoost: 0.07,
};

/**
 * Corporate Mole - Infiltrates companies to steal trade secrets.
 * Works on: Corporate Espionage
 */
export const CORPORATE_MOLE: EmployeeDefinition = {
  id: 'corporate-mole',
  name: 'Corporate Mole',
  scamId: 'corporate-espionage',
  baseCost: 3900,
  speedBoost: 0.05,
  rewardBoost: 0.08,
};

/**
 * Algorithmic Trader - Executes high-frequency market manipulation.
 * Works on: Stock Manipulation
 */
export const ALGORITHMIC_TRADER: EmployeeDefinition = {
  id: 'algorithmic-trader',
  name: 'Algorithmic Trader',
  scamId: 'stock-manipulation',
  baseCost: 4000,
  speedBoost: 0.03,
  rewardBoost: 0.09,
};

/**
 * Property Fabricator - Creates entire fake real estate portfolios.
 * Works on: Real Estate Fraud Empires
 */
export const PROPERTY_FABRICATOR: EmployeeDefinition = {
  id: 'property-fabricator',
  name: 'Property Fabricator',
  scamId: 'real-estate-fraud-empires',
  baseCost: 4100,
  speedBoost: 0.04,
  rewardBoost: 0.05,
};

/**
 * Underground Chemist - Manufactures counterfeit pharmaceuticals.
 * Works on: Pharmaceutical Counterfeiting
 */
export const UNDERGROUND_CHEMIST: EmployeeDefinition = {
  id: 'underground-chemist',
  name: 'Underground Chemist',
  scamId: 'pharmaceutical-counterfeiting',
  baseCost: 4200,
  speedBoost: 0.02,
  rewardBoost: 0.07,
};

/**
 * Master Forger - Creates undetectable fake art and provenance.
 * Works on: Art Forgery and Laundering
 */
export const MASTER_FORGER: EmployeeDefinition = {
  id: 'master-forger',
  name: 'Master Forger',
  scamId: 'art-forgery-and-laundering',
  baseCost: 4300,
  speedBoost: 0.03,
  rewardBoost: 0.06,
};

/**
 * System Infiltrator - Breaches central bank security systems.
 * Works on: Central Bank Heists
 */
export const SYSTEM_INFILTRATOR: EmployeeDefinition = {
  id: 'system-infiltrator',
  name: 'System Infiltrator',
  scamId: 'central-bank-heists',
  baseCost: 4400,
  speedBoost: 0.05,
  rewardBoost: 0.09,
};

/**
 * Collection of all Tier 5 employees.
 * One employee type per scam.
 */
export const TIER_5_EMPLOYEES: EmployeeDefinition[] = [
  LOBBYIST,
  INTL_WIRE_ROUTER,
  SHADOW_BANKER,
  DISINFORMATION_AGENT,
  CORPORATE_MOLE,
  ALGORITHMIC_TRADER,
  PROPERTY_FABRICATOR,
  UNDERGROUND_CHEMIST,
  MASTER_FORGER,
  SYSTEM_INFILTRATOR,
];
