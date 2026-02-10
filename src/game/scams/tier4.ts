// ABOUTME: Scam definitions for Tier 4 "Organized Crime" scams
// ABOUTME: 10 scams that unlock after third prestige (Trust 31+)

import type { ScamDefinition } from './types';

/**
 * Ponzi Schemes - Pay old investors with new investor money.
 * First Tier 4 scam, free to unlock within the tier.
 *
 * Kongregate economy: unlockCost = baseReward = tier baseCost ($10M)
 */
export const PONZI_SCHEMES: ScamDefinition = {
  id: 'ponzi-schemes',
  name: 'Ponzi Schemes',
  tier: 4,
  baseDuration: 5000,
  baseReward: 10000000,
  resourceType: 'money',
  description: 'Pay old investors with new investor money. What could go wrong?',
  unlockCost: 10000000, // Tier baseCost - entry gate to Tier 4
};

/**
 * Money Laundering Networks - Car washes with suspicious revenue.
 *
 * Kongregate economy: unlockCost = baseReward = $1B
 */
export const MONEY_LAUNDERING_NETWORKS: ScamDefinition = {
  id: 'money-laundering-networks',
  name: 'Money Laundering Networks',
  tier: 4,
  baseDuration: 10000,
  baseReward: 1000000000,
  resourceType: 'money',
  description: 'This car wash does $50M in revenue. Totally normal car wash stuff',
  unlockCost: 1000000000,
};

/**
 * Identity Theft Rings - Mass identity theft operations.
 *
 * Kongregate economy: unlockCost = baseReward = $10B
 */
export const IDENTITY_THEFT_RINGS: ScamDefinition = {
  id: 'identity-theft-rings',
  name: 'Identity Theft Rings',
  tier: 4,
  baseDuration: 20000,
  baseReward: 10000000000,
  resourceType: 'money',
  description: 'You are now 47 different people. Congrats on your new identities',
  unlockCost: 10000000000,
};

/**
 * Credit Card Fraud Networks - Stolen card operations at scale.
 *
 * Kongregate economy: unlockCost = baseReward = $100B
 */
export const CREDIT_CARD_FRAUD_NETWORKS: ScamDefinition = {
  id: 'credit-card-fraud-networks',
  name: 'Credit Card Fraud Networks',
  tier: 4,
  baseDuration: 30000,
  baseReward: 100000000000,
  resourceType: 'money',
  description: 'Your card was declined? Weird. Works fine for me though',
  unlockCost: 100000000000,
};

/**
 * Fake Escrow Services - Stealing money from supposedly safe transactions.
 *
 * Kongregate economy: unlockCost = baseReward = $1T
 */
export const FAKE_ESCROW_SERVICES: ScamDefinition = {
  id: 'fake-escrow-services',
  name: 'Fake Escrow Services',
  tier: 4,
  baseDuration: 45000,
  baseReward: 1000000000000,
  resourceType: 'money',
  description: 'Your money is safe with us! (Narrator: It was not safe)',
  unlockCost: 1000000000000,
};

/**
 * Invoice Fraud - Billing for services never provided.
 *
 * Kongregate economy: unlockCost = baseReward = $10T
 */
export const INVOICE_FRAUD: ScamDefinition = {
  id: 'invoice-fraud',
  name: 'Invoice Fraud',
  tier: 4,
  baseDuration: 60000,
  baseReward: 10000000000000,
  resourceType: 'money',
  description: 'Please pay this invoice for services we definitely provided',
  unlockCost: 10000000000000,
};

/**
 * Insurance Fraud - Repeatedly claiming fake disasters.
 *
 * Kongregate economy: unlockCost = baseReward = $100T
 */
export const INSURANCE_FRAUD: ScamDefinition = {
  id: 'insurance-fraud',
  name: 'Insurance Fraud',
  tier: 4,
  baseDuration: 90000,
  baseReward: 100000000000000,
  resourceType: 'money',
  description: 'My house burned down! Again! For the 5th time this year!',
  unlockCost: 100000000000000,
};

/**
 * Tax Refund Fraud - Filing thousands of fake returns.
 *
 * Kongregate economy: unlockCost = baseReward = $1Qa
 */
export const TAX_REFUND_FRAUD: ScamDefinition = {
  id: 'tax-refund-fraud',
  name: 'Tax Refund Fraud',
  tier: 4,
  baseDuration: 120000,
  baseReward: 1000000000000000,
  resourceType: 'money',
  description: 'Filing 10,000 fake returns. The IRS will never notice',
  unlockCost: 1000000000000000,
};

/**
 * Medicare Fraud - Billing for ghost patients and clinics.
 *
 * Kongregate economy: unlockCost = baseReward = $10Qa
 */
export const MEDICARE_FRAUD: ScamDefinition = {
  id: 'medicare-fraud',
  name: 'Medicare Fraud',
  tier: 4,
  baseDuration: 180000,
  baseReward: 10000000000000000,
  resourceType: 'money',
  description: 'Billing for ghost patients at ghost clinics',
  unlockCost: 10000000000000000,
};

/**
 * Shell Company Networks - Nested corporate structures to hide money.
 *
 * Kongregate economy: unlockCost = baseReward = $100Qa
 */
export const SHELL_COMPANY_NETWORKS: ScamDefinition = {
  id: 'shell-company-networks',
  name: 'Shell Company Networks',
  tier: 4,
  baseDuration: 180000,
  baseReward: 100000000000000000,
  resourceType: 'money',
  description: "Companies within companies within companies. It's shells all the way down",
  unlockCost: 100000000000000000,
};

/**
 * Collection of all Tier 4 "Organized Crime" scams.
 * Ordered by ascending unlock cost (100x progression from baseCost).
 */
export const TIER_4_SCAMS: ScamDefinition[] = [
  PONZI_SCHEMES,                // Free ($10M base)
  MONEY_LAUNDERING_NETWORKS,    // $1B
  IDENTITY_THEFT_RINGS,         // $10B
  CREDIT_CARD_FRAUD_NETWORKS,   // $100B
  FAKE_ESCROW_SERVICES,         // $1T
  INVOICE_FRAUD,                // $10T
  INSURANCE_FRAUD,              // $100T
  TAX_REFUND_FRAUD,             // $1Qa
  MEDICARE_FRAUD,               // $10Qa
  SHELL_COMPANY_NETWORKS,       // $100Qa
];
