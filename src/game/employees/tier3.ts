// ABOUTME: Employee definitions for all Tier 3 "Big Leagues" scams
// ABOUTME: Each scam has one specialized employee type that boosts output

import type { EmployeeDefinition } from './types';

/**
 * Rug Pull Artist - Designs irresistible crypto projects destined to collapse.
 * Works on: Crypto Rug Pulls
 */
export const RUG_PULL_ARTIST: EmployeeDefinition = {
  id: 'rug-pull-artist',
  name: 'Rug Pull Artist',
  scamId: 'crypto-rug-pulls',
  baseCost: 3750000,
  speedBoost: 0.02,
  rewardBoost: 0.04,
};

/**
 * Ponzi Architect - Structures elaborate schemes with realistic returns.
 * Works on: Fake Investment Schemes
 */
export const PONZI_ARCHITECT: EmployeeDefinition = {
  id: 'ponzi-architect',
  name: 'Ponzi Architect',
  scamId: 'fake-investment-schemes',
  baseCost: 37500000,
  speedBoost: 0.03,
  rewardBoost: 0.05,
};

/**
 * Executive Impersonator - Perfectly mimics C-suite communication styles.
 * Works on: Corporate Phishing
 */
export const EXECUTIVE_IMPERSONATOR: EmployeeDefinition = {
  id: 'executive-impersonator',
  name: 'Executive Impersonator',
  scamId: 'corporate-phishing',
  baseCost: 375000000,
  speedBoost: 0.04,
  rewardBoost: 0.06,
};

/**
 * Wire Transfer Specialist - Convinces finance teams to send large transfers.
 * Works on: Business Email Compromise
 */
export const WIRE_TRANSFER_SPECIALIST: EmployeeDefinition = {
  id: 'wire-transfer-specialist',
  name: 'Wire Transfer Specialist',
  scamId: 'business-email-compromise',
  baseCost: 3750000000,
  speedBoost: 0.05,
  rewardBoost: 0.07,
};

/**
 * Hype Engineer - Creates artificial buzz around worthless NFTs.
 * Works on: NFT Pump and Dumps
 */
export const HYPE_ENGINEER: EmployeeDefinition = {
  id: 'hype-engineer',
  name: 'Hype Engineer',
  scamId: 'nft-pump-and-dumps',
  baseCost: 37500000000,
  speedBoost: 0.02,
  rewardBoost: 0.08,
};

/**
 * ICO Whitepaper Writer - Generates convincing technical documents for fake projects.
 * Works on: Fake ICOs
 */
export const ICO_WHITEPAPER_WRITER: EmployeeDefinition = {
  id: 'ico-whitepaper-writer',
  name: 'ICO Whitepaper Writer',
  scamId: 'fake-icos',
  baseCost: 375000000000,
  speedBoost: 0.03,
  rewardBoost: 0.09,
};

/**
 * SIM Card Hijacker - Social engineers mobile carriers for account access.
 * Works on: SIM Swapping
 */
export const SIM_CARD_HIJACKER: EmployeeDefinition = {
  id: 'sim-card-hijacker',
  name: 'SIM Card Hijacker',
  scamId: 'sim-swapping',
  baseCost: 3750000000000,
  speedBoost: 0.04,
  rewardBoost: 0.05,
};

/**
 * Account Recovery Expert - Bypasses 2FA and security questions professionally.
 * Works on: Account Takeover Services
 */
export const ACCOUNT_RECOVERY_EXPERT: EmployeeDefinition = {
  id: 'account-recovery-expert',
  name: 'Account Recovery Expert',
  scamId: 'account-takeover-services',
  baseCost: 37500000000000,
  speedBoost: 0.05,
  rewardBoost: 0.06,
};

/**
 * Credential Validator - Tests and sorts stolen credentials at massive scale.
 * Works on: Credential Stuffing
 */
export const CREDENTIAL_VALIDATOR: EmployeeDefinition = {
  id: 'credential-validator',
  name: 'Credential Validator',
  scamId: 'credential-stuffing',
  baseCost: 375000000000000,
  speedBoost: 0.03,
  rewardBoost: 0.07,
};

/**
 * Ransomware Developer - Codes sophisticated file encryption malware.
 * Works on: Ransomware as a Service
 */
export const RANSOMWARE_DEVELOPER: EmployeeDefinition = {
  id: 'ransomware-developer',
  name: 'Ransomware Developer',
  scamId: 'ransomware-as-a-service',
  baseCost: 3750000000000000,
  speedBoost: 0.02,
  rewardBoost: 0.08,
};

/**
 * Collection of all Tier 3 employees.
 * One employee type per scam.
 */
export const TIER_3_EMPLOYEES: EmployeeDefinition[] = [
  RUG_PULL_ARTIST,
  PONZI_ARCHITECT,
  EXECUTIVE_IMPERSONATOR,
  WIRE_TRANSFER_SPECIALIST,
  HYPE_ENGINEER,
  ICO_WHITEPAPER_WRITER,
  SIM_CARD_HIJACKER,
  ACCOUNT_RECOVERY_EXPERT,
  CREDENTIAL_VALIDATOR,
  RANSOMWARE_DEVELOPER,
];
