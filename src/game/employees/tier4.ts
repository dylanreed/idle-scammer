// ABOUTME: Employee definitions for all Tier 4 "Organized Crime" scams
// ABOUTME: Each scam has one specialized employee type that boosts output

import type { EmployeeDefinition } from './types';

/**
 * Pyramid Architect - Designs the mathematical structure of Ponzi schemes.
 * Works on: Ponzi Schemes
 */
export const PYRAMID_ARCHITECT: EmployeeDefinition = {
  id: 'pyramid-architect',
  name: 'Pyramid Architect',
  scamId: 'ponzi-schemes',
  baseCost: 375000000,
  speedBoost: 0.02,
  rewardBoost: 0.04,
};

/**
 * Money Mule Coordinator - Organizes networks of unwitting cash carriers.
 * Works on: Money Laundering Networks
 */
export const MONEY_MULE_COORDINATOR: EmployeeDefinition = {
  id: 'money-mule-coordinator',
  name: 'Money Mule Coordinator',
  scamId: 'money-laundering-networks',
  baseCost: 3750000000,
  speedBoost: 0.03,
  rewardBoost: 0.05,
};

/**
 * Data Broker - Buys and sells stolen identities on dark markets.
 * Works on: Identity Theft Rings
 */
export const DATA_BROKER: EmployeeDefinition = {
  id: 'data-broker',
  name: 'Data Broker',
  scamId: 'identity-theft-rings',
  baseCost: 37500000000,
  speedBoost: 0.04,
  rewardBoost: 0.06,
};

/**
 * Card Cloning Specialist - Creates physical copies of stolen credit cards.
 * Works on: Credit Card Fraud Networks
 */
export const CARD_CLONING_SPECIALIST: EmployeeDefinition = {
  id: 'card-cloning-specialist',
  name: 'Card Cloning Specialist',
  scamId: 'credit-card-fraud-networks',
  baseCost: 375000000000,
  speedBoost: 0.05,
  rewardBoost: 0.07,
};

/**
 * Trust Broker - Operates fake escrow services for high-value transactions.
 * Works on: Fake Escrow Services
 */
export const TRUST_BROKER: EmployeeDefinition = {
  id: 'trust-broker',
  name: 'Trust Broker',
  scamId: 'fake-escrow-services',
  baseCost: 3750000000000,
  speedBoost: 0.03,
  rewardBoost: 0.08,
};

/**
 * Invoice Forger - Creates convincing fake business invoices.
 * Works on: Invoice Fraud
 */
export const INVOICE_FORGER: EmployeeDefinition = {
  id: 'invoice-forger',
  name: 'Invoice Forger',
  scamId: 'invoice-fraud',
  baseCost: 37500000000000,
  speedBoost: 0.02,
  rewardBoost: 0.09,
};

/**
 * Claims Adjuster - Files fraudulent insurance claims at scale.
 * Works on: Insurance Fraud
 */
export const CLAIMS_ADJUSTER: EmployeeDefinition = {
  id: 'claims-adjuster',
  name: 'Claims Adjuster',
  scamId: 'insurance-fraud',
  baseCost: 375000000000000,
  speedBoost: 0.04,
  rewardBoost: 0.06,
};

/**
 * Tax Identity Thief - Files fake tax returns using stolen identities.
 * Works on: Tax Refund Fraud
 */
export const TAX_IDENTITY_THIEF: EmployeeDefinition = {
  id: 'tax-identity-thief',
  name: 'Tax Identity Thief',
  scamId: 'tax-refund-fraud',
  baseCost: 3750000000000000,
  speedBoost: 0.03,
  rewardBoost: 0.07,
};

/**
 * Healthcare Fraudster - Submits fake Medicare and Medicaid claims.
 * Works on: Medicare Fraud
 */
export const HEALTHCARE_FRAUDSTER: EmployeeDefinition = {
  id: 'healthcare-fraudster',
  name: 'Healthcare Fraudster',
  scamId: 'medicare-fraud',
  baseCost: 37500000000000000,
  speedBoost: 0.05,
  rewardBoost: 0.05,
};

/**
 * Corporate Shell Builder - Creates intricate networks of fake companies.
 * Works on: Shell Company Networks
 */
export const CORPORATE_SHELL_BUILDER: EmployeeDefinition = {
  id: 'corporate-shell-builder',
  name: 'Corporate Shell Builder',
  scamId: 'shell-company-networks',
  baseCost: 375000000000000000,
  speedBoost: 0.04,
  rewardBoost: 0.08,
};

/**
 * Collection of all Tier 4 employees.
 * One employee type per scam.
 */
export const TIER_4_EMPLOYEES: EmployeeDefinition[] = [
  PYRAMID_ARCHITECT,
  MONEY_MULE_COORDINATOR,
  DATA_BROKER,
  CARD_CLONING_SPECIALIST,
  TRUST_BROKER,
  INVOICE_FORGER,
  CLAIMS_ADJUSTER,
  TAX_IDENTITY_THIEF,
  HEALTHCARE_FRAUDSTER,
  CORPORATE_SHELL_BUILDER,
];
