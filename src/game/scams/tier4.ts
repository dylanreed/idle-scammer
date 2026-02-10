// ABOUTME: Scam definitions for Tier 4 "Organized Crime" scams
// ABOUTME: 10 scams that unlock after third prestige (Trust 31+)

import type { ScamDefinition } from './types';
import { getProgressionCost } from '../economy/constants';

/**
 * Ponzi Schemes - Pay old investors with new investor money.
 * Position 29 in 3x progression.
 */
export const PONZI_SCHEMES: ScamDefinition = {
  id: 'ponzi-schemes',
  name: 'Ponzi Schemes',
  tier: 4,
  baseDuration: 5000,
  baseReward: getProgressionCost(29),
  resourceType: 'money',
  description: 'Pay old investors with new investor money. What could go wrong?',
  unlockCost: getProgressionCost(29),
};

/**
 * Money Laundering Networks - Car washes with suspicious revenue.
 * Position 30 in 3x progression.
 */
export const MONEY_LAUNDERING_NETWORKS: ScamDefinition = {
  id: 'money-laundering-networks',
  name: 'Money Laundering Networks',
  tier: 4,
  baseDuration: 10000,
  baseReward: getProgressionCost(30),
  resourceType: 'money',
  description: 'This car wash does $50M in revenue. Totally normal car wash stuff',
  unlockCost: getProgressionCost(30),
};

/**
 * Identity Theft Rings - Mass identity theft operations.
 * Position 31 in 3x progression.
 */
export const IDENTITY_THEFT_RINGS: ScamDefinition = {
  id: 'identity-theft-rings',
  name: 'Identity Theft Rings',
  tier: 4,
  baseDuration: 20000,
  baseReward: getProgressionCost(31),
  resourceType: 'money',
  description: 'You are now 47 different people. Congrats on your new identities',
  unlockCost: getProgressionCost(31),
};

/**
 * Credit Card Fraud Networks - Stolen card operations at scale.
 * Position 32 in 3x progression.
 */
export const CREDIT_CARD_FRAUD_NETWORKS: ScamDefinition = {
  id: 'credit-card-fraud-networks',
  name: 'Credit Card Fraud Networks',
  tier: 4,
  baseDuration: 30000,
  baseReward: getProgressionCost(32),
  resourceType: 'money',
  description: 'Your card was declined? Weird. Works fine for me though',
  unlockCost: getProgressionCost(32),
};

/**
 * Fake Escrow Services - Stealing money from supposedly safe transactions.
 * Position 33 in 3x progression.
 */
export const FAKE_ESCROW_SERVICES: ScamDefinition = {
  id: 'fake-escrow-services',
  name: 'Fake Escrow Services',
  tier: 4,
  baseDuration: 45000,
  baseReward: getProgressionCost(33),
  resourceType: 'money',
  description: 'Your money is safe with us! (Narrator: It was not safe)',
  unlockCost: getProgressionCost(33),
};

/**
 * Invoice Fraud - Billing for services never provided.
 * Position 34 in 3x progression.
 */
export const INVOICE_FRAUD: ScamDefinition = {
  id: 'invoice-fraud',
  name: 'Invoice Fraud',
  tier: 4,
  baseDuration: 60000,
  baseReward: getProgressionCost(34),
  resourceType: 'money',
  description: 'Please pay this invoice for services we definitely provided',
  unlockCost: getProgressionCost(34),
};

/**
 * Insurance Fraud - Repeatedly claiming fake disasters.
 * Position 35 in 3x progression.
 */
export const INSURANCE_FRAUD: ScamDefinition = {
  id: 'insurance-fraud',
  name: 'Insurance Fraud',
  tier: 4,
  baseDuration: 90000,
  baseReward: getProgressionCost(35),
  resourceType: 'money',
  description: 'My house burned down! Again! For the 5th time this year!',
  unlockCost: getProgressionCost(35),
};

/**
 * Tax Refund Fraud - Filing thousands of fake returns.
 * Position 36 in 3x progression.
 */
export const TAX_REFUND_FRAUD: ScamDefinition = {
  id: 'tax-refund-fraud',
  name: 'Tax Refund Fraud',
  tier: 4,
  baseDuration: 120000,
  baseReward: getProgressionCost(36),
  resourceType: 'money',
  description: 'Filing 10,000 fake returns. The IRS will never notice',
  unlockCost: getProgressionCost(36),
};

/**
 * Medicare Fraud - Billing for ghost patients and clinics.
 * Position 37 in 3x progression.
 */
export const MEDICARE_FRAUD: ScamDefinition = {
  id: 'medicare-fraud',
  name: 'Medicare Fraud',
  tier: 4,
  baseDuration: 180000,
  baseReward: getProgressionCost(37),
  resourceType: 'money',
  description: 'Billing for ghost patients at ghost clinics',
  unlockCost: getProgressionCost(37),
};

/**
 * Shell Company Networks - Nested corporate structures to hide money.
 * Position 38 in 3x progression.
 */
export const SHELL_COMPANY_NETWORKS: ScamDefinition = {
  id: 'shell-company-networks',
  name: 'Shell Company Networks',
  tier: 4,
  baseDuration: 180000,
  baseReward: getProgressionCost(38),
  resourceType: 'money',
  description: "Companies within companies within companies. It's shells all the way down",
  unlockCost: getProgressionCost(38),
};

/**
 * Collection of all Tier 4 "Organized Crime" scams.
 * Ordered by ascending position in the 3x progression (positions 29-38).
 */
export const TIER_4_SCAMS: ScamDefinition[] = [
  PONZI_SCHEMES,                // Position 29
  MONEY_LAUNDERING_NETWORKS,    // Position 30
  IDENTITY_THEFT_RINGS,         // Position 31
  CREDIT_CARD_FRAUD_NETWORKS,   // Position 32
  FAKE_ESCROW_SERVICES,         // Position 33
  INVOICE_FRAUD,                // Position 34
  INSURANCE_FRAUD,              // Position 35
  TAX_REFUND_FRAUD,             // Position 36
  MEDICARE_FRAUD,               // Position 37
  SHELL_COMPANY_NETWORKS,       // Position 38
];
