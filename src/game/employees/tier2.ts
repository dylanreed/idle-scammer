// ABOUTME: Employee definitions for all Tier 2 "Getting Serious" scams
// ABOUTME: Each scam has one specialized employee type that boosts output

import type { EmployeeDefinition } from './types';

/**
 * Call Center Operator - Runs the fake tech support phone bank.
 * Works on: Tech Support Scams
 */
export const CALL_CENTER_OPERATOR: EmployeeDefinition = {
  id: 'call-center-operator',
  name: 'Call Center Operator',
  scamId: 'tech-support-scams',
  baseCost: 500,
  speedBoost: 0.03,
  rewardBoost: 0.06,
};

/**
 * Catfish Profile Creator - Crafts irresistible fake dating profiles.
 * Works on: Romance Catfishing
 */
export const CATFISH_PROFILE_CREATOR: EmployeeDefinition = {
  id: 'catfish-profile-creator',
  name: 'Catfish Profile Creator',
  scamId: 'romance-catfishing',
  baseCost: 600,
  speedBoost: 0.02,
  rewardBoost: 0.08,
};

/**
 * Sob Story Writer - Pens heartbreaking fake charity appeals.
 * Works on: Fake Charity Drives
 */
export const SOB_STORY_WRITER: EmployeeDefinition = {
  id: 'sob-story-writer',
  name: 'Sob Story Writer',
  scamId: 'fake-charity-drives',
  baseCost: 700,
  speedBoost: 0.03,
  rewardBoost: 0.07,
};

/**
 * Fake Landlord - Poses as property owners across multiple listings.
 * Works on: Rental Scams
 */
export const FAKE_LANDLORD: EmployeeDefinition = {
  id: 'fake-landlord',
  name: 'Fake Landlord',
  scamId: 'rental-scams',
  baseCost: 800,
  speedBoost: 0.04,
  rewardBoost: 0.05,
};

/**
 * Bot Network Admin - Manages armies of ticket-buying bots.
 * Works on: Ticket Scalping Bots
 */
export const BOT_NETWORK_ADMIN: EmployeeDefinition = {
  id: 'bot-network-admin',
  name: 'Bot Network Admin',
  scamId: 'ticket-scalping-bots',
  baseCost: 900,
  speedBoost: 0.05,
  rewardBoost: 0.04,
};

/**
 * Review Ghost Writer - Generates convincing fake reviews at scale.
 * Works on: Fake Review Farms
 */
export const REVIEW_GHOST_WRITER: EmployeeDefinition = {
  id: 'review-ghost-writer',
  name: 'Review Ghost Writer',
  scamId: 'fake-review-farms',
  baseCost: 1000,
  speedBoost: 0.03,
  rewardBoost: 0.07,
};

/**
 * Click Bot Operator - Programs bots to click ads endlessly.
 * Works on: Click Fraud
 */
export const CLICK_BOT_OPERATOR: EmployeeDefinition = {
  id: 'click-bot-operator',
  name: 'Click Bot Operator',
  scamId: 'click-fraud',
  baseCost: 1100,
  speedBoost: 0.04,
  rewardBoost: 0.06,
};

/**
 * Deepfake Artist - Creates convincing fake influencer content.
 * Works on: Influencer Impersonation
 */
export const DEEPFAKE_ARTIST: EmployeeDefinition = {
  id: 'deepfake-artist',
  name: 'Deepfake Artist',
  scamId: 'influencer-impersonation',
  baseCost: 1200,
  speedBoost: 0.02,
  rewardBoost: 0.09,
};

/**
 * Phantom Shipper - Generates fake tracking numbers and shipping labels.
 * Works on: Dropshipping Fraud
 */
export const PHANTOM_SHIPPER: EmployeeDefinition = {
  id: 'phantom-shipper',
  name: 'Phantom Shipper',
  scamId: 'dropshipping-fraud',
  baseCost: 1300,
  speedBoost: 0.02,
  rewardBoost: 0.08,
};

/**
 * Warranty Caller - Cold-calls people about their expiring warranties.
 * Works on: Warranty Scams
 */
export const WARRANTY_CALLER: EmployeeDefinition = {
  id: 'warranty-caller',
  name: 'Warranty Caller',
  scamId: 'warranty-scams',
  baseCost: 1400,
  speedBoost: 0.03,
  rewardBoost: 0.07,
};

/**
 * Collection of all Tier 2 employees.
 * One employee type per scam.
 */
export const TIER_2_EMPLOYEES: EmployeeDefinition[] = [
  CALL_CENTER_OPERATOR,
  CATFISH_PROFILE_CREATOR,
  SOB_STORY_WRITER,
  FAKE_LANDLORD,
  BOT_NETWORK_ADMIN,
  REVIEW_GHOST_WRITER,
  CLICK_BOT_OPERATOR,
  DEEPFAKE_ARTIST,
  PHANTOM_SHIPPER,
  WARRANTY_CALLER,
];
