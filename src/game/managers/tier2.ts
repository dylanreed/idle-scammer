// ABOUTME: Manager definitions for all Tier 2 "Getting Serious" scams
// ABOUTME: Each manager has a unique personality and automates their scam's employees

import type { ManagerDefinition } from './types';

/**
 * Rajesh "The Fixer" - The Tech Support Scams Manager
 *
 * Claims to be from Microsoft, Apple, AND Google simultaneously.
 * His accent changes depending on who he's scamming.
 *
 * Cost = 0.75 x next scam unlock ($100K) = $75K
 */
export const RAJESH_THE_FIXER: ManagerDefinition = {
  id: 'rajesh-the-fixer',
  name: 'Rajesh "The Fixer"',
  scamId: 'tech-support-scams',
  cost: 75000,
  flavorText: "Hello sir, I am calling from the Microsoft Google Apple department. Your computer has the virus. Please download TeamViewer and give me full access.",
};

/**
 * Valentina Hearts - The Romance Catfishing Manager
 *
 * Has 47 fake dating profiles and remembers all their birthdays.
 * Currently "in love" with 200+ people simultaneously.
 *
 * Cost = 0.75 x next scam unlock ($1M) = $750K
 */
export const VALENTINA_HEARTS: ManagerDefinition = {
  id: 'valentina-hearts',
  name: 'Valentina Hearts',
  scamId: 'romance-catfishing',
  cost: 750000,
  flavorText: "I love you so much, baby. Also I love you, and you, and you, and... *checks spreadsheet* ...you. My heart is very large and my bank account is very empty.",
};

/**
 * Sister Mary Fraud - The Fake Charity Drives Manager
 *
 * Dresses like a nun but has never been to church.
 * Her "orphanage" is actually a Bitcoin mining rig.
 *
 * Cost = 0.75 x next scam unlock ($10M) = $7.5M
 */
export const SISTER_MARY_FRAUD: ManagerDefinition = {
  id: 'sister-mary-fraud',
  name: 'Sister Mary Fraud',
  scamId: 'fake-charity-drives',
  cost: 7500000,
  flavorText: "Bless your generous heart, my child. Your donation will help... *squints at script* ...the underprivileged... dolphins? Sure, the dolphins.",
};

/**
 * Chad McMansion - The Rental Scams Manager
 *
 * Lists penthouses he found on Google Images.
 * Has collected deposits on the same apartment 37 times.
 *
 * Cost = 0.75 x next scam unlock ($100M) = $75M
 */
export const CHAD_MCMANSION: ManagerDefinition = {
  id: 'chad-mcmansion',
  name: 'Chad McMansion',
  scamId: 'rental-scams',
  cost: 75000000,
  flavorText: "Premium location! Ocean view! Pet friendly! Just wire the deposit and first month's rent. No need to visit first. Trust the vibes, bro.",
};

/**
 * ScalpMaster 5000 - The Ticket Scalping Bots Manager
 *
 * An AI that gained sentience and chose to scalp concert tickets.
 * Has ruined more concerts than rain.
 *
 * Cost = 0.75 x next scam unlock ($1B) = $750M
 */
export const SCALPMASTER_5000: ManagerDefinition = {
  id: 'scalpmaster-5000',
  name: 'ScalpMaster 5000',
  scamId: 'ticket-scalping-bots',
  cost: 750000000,
  flavorText: "TICKETS ACQUIRED IN 0.003 SECONDS. RESALE PRICE: 47X FACE VALUE. HUMAN TEARS DETECTED. TEARS FUEL MY ALGORITHMS.",
};

/**
 * Yelena Five-Stars - The Fake Review Farms Manager
 *
 * Has left 50,000 five-star reviews and has never used any product.
 * Her reviewing fingers are legendary.
 *
 * Cost = 0.75 x next scam unlock ($10B) = $7.5B
 */
export const YELENA_FIVE_STARS: ManagerDefinition = {
  id: 'yelena-five-stars',
  name: 'Yelena Five-Stars',
  scamId: 'fake-review-farms',
  cost: 7500000000,
  flavorText: "Amazing product!! Best purchase ever!! Life changing!! My family loves it!! (I do not have a family and I have never seen this product.)",
};

/**
 * Pixel Pete - The Click Fraud Manager
 *
 * Former ad network employee who knows exactly where the money flows.
 * His bot army has cost advertisers billions.
 *
 * Cost = 0.75 x next scam unlock ($100B) = $75B
 */
export const PIXEL_PETE: ManagerDefinition = {
  id: 'pixel-pete',
  name: 'Pixel Pete',
  scamId: 'click-fraud',
  cost: 75000000000,
  flavorText: "Every pixel on your screen is an opportunity. My bots click 10 million ads per second. The advertisers think they're reaching real humans. LOL.",
};

/**
 * FakeFluencer - The Influencer Impersonation Manager
 *
 * Can impersonate any influencer convincingly.
 * Has been banned from 47 platforms under 200 different names.
 *
 * Cost = 0.75 x next scam unlock ($1T) = $750B
 */
export const FAKEFLUENCER: ManagerDefinition = {
  id: 'fakefluencer',
  name: 'FakeFluencer',
  scamId: 'influencer-impersonation',
  cost: 750000000000,
  flavorText: "OMG you guys!! Use code FAKE at checkout for 10% off my totally real merch line! Link in bio! (The link goes to a phishing page btw)",
};

/**
 * Captain No-Ship - The Dropshipping Fraud Manager
 *
 * Has a warehouse that exists only in the imagination.
 * Tracking numbers always lead to mysterious "customs delays."
 *
 * Cost = 0.75 x next scam unlock ($10T) = $7.5T
 */
export const CAPTAIN_NO_SHIP: ManagerDefinition = {
  id: 'captain-no-ship',
  name: 'Captain No-Ship',
  scamId: 'dropshipping-fraud',
  cost: 7500000000000,
  flavorText: "Your order has shipped! Tracking number: LMAO420YOLO. Expected delivery: sometime between tomorrow and heat death of the universe.",
};

/**
 * Warren T. Clause - The Warranty Scams Manager
 *
 * Has been trying to reach you about your car's extended warranty
 * since before you even had a car. Possibly since before cars existed.
 *
 * Cost = 0.75 x $100T (continuing progression) = $75T
 */
export const WARREN_T_CLAUSE: ManagerDefinition = {
  id: 'warren-t-clause',
  name: 'Warren T. Clause',
  scamId: 'warranty-scams',
  cost: 75000000000000,
  flavorText: "We've been trying to reach you about your car's extended warranty. Also your fridge's warranty. And your toaster's. Everything you own is about to expire.",
};

/**
 * Collection of all Tier 2 managers.
 * One manager per scam, each with unique personality.
 */
export const TIER_2_MANAGERS: ManagerDefinition[] = [
  RAJESH_THE_FIXER,
  VALENTINA_HEARTS,
  SISTER_MARY_FRAUD,
  CHAD_MCMANSION,
  SCALPMASTER_5000,
  YELENA_FIVE_STARS,
  PIXEL_PETE,
  FAKEFLUENCER,
  CAPTAIN_NO_SHIP,
  WARREN_T_CLAUSE,
];
