// ABOUTME: Manager definitions for all Tier 4 "Organized Crime" scams
// ABOUTME: Each manager has a unique personality and automates their scam's employees

import type { ManagerDefinition } from './types';
import { getManagerCostAtPosition } from '../economy/constants';

/**
 * Bernie "The Promise" - The Ponzi Schemes Manager
 *
 * Runs the longest-running Ponzi scheme in history.
 * His investors think they're getting 47% annual returns.
 *
 * Cost = getManagerCostAtPosition(29) — 75% of position 30 unlock
 */
export const BERNIE_THE_PROMISE: ManagerDefinition = {
  id: 'bernie-the-promise',
  name: 'Bernie "The Promise"',
  scamId: 'ponzi-schemes',
  cost: getManagerCostAtPosition(29),
  flavorText: "It's not a pyramid, it's a triangle of opportunity! Your returns are guaranteed by the continuous influx of... I mean, by our proprietary investment strategy.",
};

/**
 * Dmitri "Clean Money" Volkov - The Money Laundering Networks Manager
 *
 * Former Soviet banker who perfected the art of making dirty money sparkle.
 * Owns 47 car washes that have never washed a single car.
 *
 * Cost = getManagerCostAtPosition(30) — 75% of position 31 unlock
 */
export const DMITRI_CLEAN_MONEY: ManagerDefinition = {
  id: 'dmitri-clean-money',
  name: 'Dmitri "Clean Money" Volkov',
  scamId: 'money-laundering-networks',
  cost: getManagerCostAtPosition(30),
  flavorText: "In my country, we have saying: dirty money is just clean money that hasn't been to laundromat yet. Also I own many laundromats. What a coincidence!",
};

/**
 * The Chameleon - The Identity Theft Rings Manager
 *
 * Has 200 passports and can't remember their original name.
 * Currently wanted in 47 countries under 83 different identities.
 *
 * Cost = getManagerCostAtPosition(31) — 75% of position 32 unlock
 */
export const THE_CHAMELEON: ManagerDefinition = {
  id: 'the-chameleon',
  name: 'The Chameleon',
  scamId: 'identity-theft-rings',
  cost: getManagerCostAtPosition(31),
  flavorText: "Who am I today? Bob from accounting? Susan with the three kids? That guy who owns all those Lamborghinis? I forget. Check my spreadsheet.",
};

/**
 * Magda "The Stripe" - The Credit Card Fraud Networks Manager
 *
 * Can read magnetic strips with her bare fingers.
 * Has cloned more cards than Visa has issued.
 *
 * Cost = getManagerCostAtPosition(32) — 75% of position 33 unlock
 */
export const MAGDA_THE_STRIPE: ManagerDefinition = {
  id: 'magda-the-stripe',
  name: 'Magda "The Stripe"',
  scamId: 'credit-card-fraud-networks',
  cost: getManagerCostAtPosition(32),
  flavorText: "Swipe, clone, profit. Is simple business model. Your card security chip? Very cute. My skimmer thinks it's adorable too.",
};

/**
 * "Trustworthy" Tom Escrow - The Fake Escrow Services Manager
 *
 * Wears a suit and has the word "TRUST" literally in his company name.
 * Has never completed a single legitimate transaction.
 *
 * Cost = getManagerCostAtPosition(33) — 75% of position 34 unlock
 */
export const TRUSTWORTHY_TOM: ManagerDefinition = {
  id: 'trustworthy-tom',
  name: '"Trustworthy" Tom Escrow',
  scamId: 'fake-escrow-services',
  cost: getManagerCostAtPosition(33),
  flavorText: "Of course you can trust me! It says so right in my name! Just deposit the full amount to our secure offshore account and... hello? Why did you hang up?",
};

/**
 * Francesca "The Forger" - The Invoice Fraud Manager
 *
 * Can perfectly replicate any company's invoice format.
 * Has billed every Fortune 500 company for services they never received.
 *
 * Cost = getManagerCostAtPosition(34) — 75% of position 35 unlock
 */
export const FRANCESCA_THE_FORGER: ManagerDefinition = {
  id: 'francesca-the-forger',
  name: 'Francesca "The Forger"',
  scamId: 'invoice-fraud',
  cost: getManagerCostAtPosition(34),
  flavorText: "Accounts payable departments are my favorite. They see invoice, they pay invoice. Nobody questions the $47,000 for 'consulting services' from a company that doesn't exist.",
};

/**
 * Dr. Claim M. All - The Insurance Fraud Manager
 *
 * MD stands for "Money Doctor" not Medical Doctor.
 * Has filed 10,000 whiplash claims without ever being in a car accident.
 *
 * Cost = getManagerCostAtPosition(35) — 75% of position 36 unlock
 */
export const DR_CLAIM_M_ALL: ManagerDefinition = {
  id: 'dr-claim-m-all',
  name: 'Dr. Claim M. All',
  scamId: 'insurance-fraud',
  cost: getManagerCostAtPosition(35),
  flavorText: "Yes, I'm a real doctor. My medical school? University of the Internet. Very prestigious. Now let me bill your insurance for this totally real surgery I definitely performed.",
};

/**
 * The Tax Man Cometh (But Only for Refunds) - The Tax Refund Fraud Manager
 *
 * Files more tax returns in a day than the IRS processes in a month.
 * Has 47,000 imaginary children claimed as dependents.
 *
 * Cost = getManagerCostAtPosition(36) — 75% of position 37 unlock
 */
export const THE_TAX_MAN: ManagerDefinition = {
  id: 'the-tax-man',
  name: 'The Tax Man Cometh',
  scamId: 'tax-refund-fraud',
  cost: getManagerCostAtPosition(36),
  flavorText: "The only certainties in life are death, taxes, and fraudulent refunds. I've claimed so many fake dependents, I technically have more children than China.",
};

/**
 * "Nurse" Betty Billings - The Medicare Fraud Manager
 *
 * Runs a "medical clinic" that's actually just a PO box.
 * Has billed Medicare for operations on patients who don't exist.
 *
 * Cost = getManagerCostAtPosition(37) — 75% of position 38 unlock
 */
export const NURSE_BETTY: ManagerDefinition = {
  id: 'nurse-betty',
  name: '"Nurse" Betty Billings',
  scamId: 'medicare-fraud',
  cost: getManagerCostAtPosition(37),
  flavorText: "Hip replacement? Check. Knee surgery? Check. Did these patients ever visit? No check! Medicare pays anyway. God bless the American healthcare system.",
};

/**
 * The Incorporator - The Shell Company Networks Manager
 *
 * Has created more companies than all of Delaware combined.
 * Can set up a shell corporation faster than you can say "tax haven."
 *
 * Cost = getManagerCostAtPosition(38) — 75% of position 39 unlock
 */
export const THE_INCORPORATOR: ManagerDefinition = {
  id: 'the-incorporator',
  name: 'The Incorporator',
  scamId: 'shell-company-networks',
  cost: getManagerCostAtPosition(38),
  flavorText: "Subsidiary of a holding company owned by a trust controlled by an LLC managed by... even I've lost track. That's the beauty of it. The IRS definitely has.",
};

/**
 * Collection of all Tier 4 managers.
 * One manager per scam, each with unique personality.
 */
export const TIER_4_MANAGERS: ManagerDefinition[] = [
  BERNIE_THE_PROMISE,
  DMITRI_CLEAN_MONEY,
  THE_CHAMELEON,
  MAGDA_THE_STRIPE,
  TRUSTWORTHY_TOM,
  FRANCESCA_THE_FORGER,
  DR_CLAIM_M_ALL,
  THE_TAX_MAN,
  NURSE_BETTY,
  THE_INCORPORATOR,
];
