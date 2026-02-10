// ABOUTME: Manager definitions for all Tier 5 "Mastermind" scams
// ABOUTME: Each manager has a unique personality and automates their scam's employees

import type { ManagerDefinition } from './types';
import { getManagerCostAtPosition } from '../economy/constants';

/**
 * Senator Goldpocket - The Government Contract Fraud Manager
 *
 * Has never met a defense budget he couldn't inflate.
 * His nephew's company always wins the bids somehow.
 *
 * Cost = getManagerCostAtPosition(39) — 75% of position 40 unlock cost
 */
export const SENATOR_GOLDPOCKET: ManagerDefinition = {
  id: 'senator-goldpocket',
  name: 'Senator Goldpocket',
  scamId: 'government-contract-fraud',
  cost: getManagerCostAtPosition(39),
  flavorText: "The American people need these $90,000 hammers and $50,000 toilet seats. National security depends on it. Also, my yacht depends on it.",
};

/**
 * The Conductor - The International Wire Fraud Manager
 *
 * Orchestrates money flows across 47 countries in under a minute.
 * The FBI has his picture on a wall, but not his name.
 *
 * Cost = getManagerCostAtPosition(40) — 75% of position 41 unlock cost
 */
export const THE_CONDUCTOR: ManagerDefinition = {
  id: 'the-conductor',
  name: 'The Conductor',
  scamId: 'international-wire-fraud',
  cost: getManagerCostAtPosition(40),
  flavorText: "Money is just information traveling at the speed of trust. And trust is just another exploitable vulnerability. Watch the symphony begin.",
};

/**
 * Mr. Offshore - The Shadow Banking Manager
 *
 * Runs a bank that doesn't exist in any country's records.
 * His customers include three dictators, two cartels, and one tech CEO.
 *
 * Cost = getManagerCostAtPosition(41) — 75% of position 42 unlock cost
 */
export const MR_OFFSHORE: ManagerDefinition = {
  id: 'mr-offshore',
  name: 'Mr. Offshore',
  scamId: 'shadow-banking',
  cost: getManagerCostAtPosition(41),
  flavorText: "We offer very competitive rates on money that, legally speaking, doesn't exist. Our branches are located everywhere and nowhere. Banking hours: always.",
};

/**
 * Madam Vote - The Election Manipulation Manager
 *
 * Has decided the outcome of 23 elections across 14 countries.
 * Democracy is just marketing with extra steps.
 *
 * Cost = getManagerCostAtPosition(42) — 75% of position 43 unlock cost
 */
export const MADAM_VOTE: ManagerDefinition = {
  id: 'madam-vote',
  name: 'Madam Vote',
  scamId: 'election-manipulation',
  cost: getManagerCostAtPosition(42),
  flavorText: "The people have spoken! Well, actually my bot farms have spoken. But who can tell the difference anymore? Democracy is just targeted advertising at scale.",
};

/**
 * The Cipher - The Corporate Espionage Manager
 *
 * Has infiltrated every Fortune 500 company simultaneously.
 * Your company's secrets are already in his database.
 *
 * Cost = getManagerCostAtPosition(43) — 75% of position 44 unlock cost
 */
export const THE_CIPHER: ManagerDefinition = {
  id: 'the-cipher',
  name: 'The Cipher',
  scamId: 'corporate-espionage',
  cost: getManagerCostAtPosition(43),
  flavorText: "I know your R&D budget, your Q4 projections, and what your CEO had for lunch. Information wants to be free. It also wants to be extremely profitable.",
};

/**
 * Warren Buffet't - The Stock Manipulation Manager
 *
 * Makes markets move with a single tweet from fake accounts.
 * The SEC has investigated him 47 times and found nothing.
 *
 * Cost = getManagerCostAtPosition(44) — 75% of position 45 unlock cost
 */
export const WARREN_BUFFETT: ManagerDefinition = {
  id: 'warren-buffett',
  name: "Warren Buffet't",
  scamId: 'stock-manipulation',
  cost: getManagerCostAtPosition(44),
  flavorText: "I prefer to think of it as 'aggressive market optimization.' Insider trading is such an ugly term. I just happen to know things before they happen.",
};

/**
 * Duke Foreclosure - The Real Estate Fraud Empires Manager
 *
 * Owns 500 buildings that don't exist and mortgages to match.
 * His real estate empire is built on vibes and forged deeds.
 *
 * Cost = getManagerCostAtPosition(45) — 75% of position 46 unlock cost
 */
export const DUKE_FORECLOSURE: ManagerDefinition = {
  id: 'duke-foreclosure',
  name: 'Duke Foreclosure',
  scamId: 'real-estate-fraud-empires',
  cost: getManagerCostAtPosition(45),
  flavorText: "Location, location, location! This prime real estate exists in a quantum state between reality and imagination. Cash offers only. No inspection necessary.",
};

/**
 * Dr. Placebo - The Pharmaceutical Counterfeiting Manager
 *
 * His pills cure nothing but his profit margins are excellent.
 * Has an honorary degree from a university he also made up.
 *
 * Cost = getManagerCostAtPosition(46) — 75% of position 47 unlock cost
 */
export const DR_PLACEBO: ManagerDefinition = {
  id: 'dr-placebo',
  name: 'Dr. Placebo',
  scamId: 'pharmaceutical-counterfeiting',
  cost: getManagerCostAtPosition(46),
  flavorText: "These pills contain the finest sugar, flour, and broken dreams. Side effects may include: financial loss, disappointment, and continued illness. But hey, placebo effect!",
};

/**
 * Rembrandt Scambrandt - The Art Forgery and Laundering Manager
 *
 * Has "discovered" 47 lost masterpieces in the past year.
 * Museum curators hate him. Money launderers love him.
 *
 * Cost = getManagerCostAtPosition(47) — 75% of position 48 unlock cost
 */
export const REMBRANDT_SCAMBRANDT: ManagerDefinition = {
  id: 'rembrandt-scambrandt',
  name: 'Rembrandt Scambrandt',
  scamId: 'art-forgery-and-laundering',
  cost: getManagerCostAtPosition(47),
  flavorText: "This is a genuine lost Van Gogh I found in my garage. Ignore the acrylic paint and 'Made in China' stamp. Art is subjective. Money is objective.",
};

/**
 * Zero Day - The Central Bank Heists Manager
 *
 * Has root access to financial systems that don't officially have root access.
 * The heist of the century happens every Tuesday at 3 AM.
 *
 * Cost = getManagerCostAtPosition(48) — 75% of position 49 unlock cost
 */
export const ZERO_DAY: ManagerDefinition = {
  id: 'zero-day',
  name: 'Zero Day',
  scamId: 'central-bank-heists',
  cost: getManagerCostAtPosition(48),
  flavorText: "They say their systems are unhackable. So did the last seventeen central banks. The money isn't stolen if the ledger says it was always ours.",
};

/**
 * Collection of all Tier 5 managers.
 * One manager per scam, each with unique personality.
 */
export const TIER_5_MANAGERS: ManagerDefinition[] = [
  SENATOR_GOLDPOCKET,
  THE_CONDUCTOR,
  MR_OFFSHORE,
  MADAM_VOTE,
  THE_CIPHER,
  WARREN_BUFFETT,
  DUKE_FORECLOSURE,
  DR_PLACEBO,
  REMBRANDT_SCAMBRANDT,
  ZERO_DAY,
];
