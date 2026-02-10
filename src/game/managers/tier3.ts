// ABOUTME: Manager definitions for all Tier 3 "Big Leagues" scams
// ABOUTME: Each manager has a unique personality and automates their scam's employees

import type { ManagerDefinition } from './types';
import { getManagerCostAtPosition } from '../economy/constants';

/**
 * Viktor "The Vanisher" - The Crypto Rug Pulls Manager
 *
 * Launched 47 tokens, all "safely audited" by himself.
 * His liquidity pools disappear faster than his promises.
 *
 * Cost = getManagerCostAtPosition(19) (75% of position 20 unlock)
 */
export const VIKTOR_THE_VANISHER: ManagerDefinition = {
  id: 'viktor-the-vanisher',
  name: 'Viktor "The Vanisher"',
  scamId: 'crypto-rug-pulls',
  cost: getManagerCostAtPosition(19),
  flavorText: "Welcome to SafeMoonElonCumRocket! Fully doxxed team (stock photos). Liquidity locked (in my personal wallet). DYOR but also YOLO!",
};

/**
 * Bernard Madoff Jr. - The Fake Investment Schemes Manager
 *
 * Learned everything from dad's mistakes: be MORE charming.
 * His investment returns are consistent because they're fictional.
 *
 * Cost = getManagerCostAtPosition(20) (75% of position 21 unlock)
 */
export const BERNARD_MADOFF_JR: ManagerDefinition = {
  id: 'bernard-madoff-jr',
  name: 'Bernard Madoff Jr.',
  scamId: 'fake-investment-schemes',
  cost: getManagerCostAtPosition(20),
  flavorText: "12% returns every month, guaranteed! How? Proprietary algorithms that I definitely didn't make up. Dad taught me well. Maybe too well.",
};

/**
 * Jocelyn Corporate - The Corporate Phishing Manager
 *
 * Has 200 LinkedIn connections in every Fortune 500 company.
 * Her email signature is more convincing than most CEOs'.
 *
 * Cost = getManagerCostAtPosition(21) (75% of position 22 unlock)
 */
export const JOCELYN_CORPORATE: ManagerDefinition = {
  id: 'jocelyn-corporate',
  name: 'Jocelyn Corporate',
  scamId: 'corporate-phishing',
  cost: getManagerCostAtPosition(21),
  flavorText: "Per my last email (that I spoofed from your CEO), we need to discuss the Q4 credentials. Please reply with your password for synergy purposes.",
};

/**
 * Maxwell Wire - The Business Email Compromise Manager
 *
 * Former CFO who went to the dark side after embezzlement charges.
 * Knows exactly which buttons to push in finance departments.
 *
 * Cost = getManagerCostAtPosition(22) (75% of position 23 unlock)
 */
export const MAXWELL_WIRE: ManagerDefinition = {
  id: 'maxwell-wire',
  name: 'Maxwell Wire',
  scamId: 'business-email-compromise',
  cost: getManagerCostAtPosition(22),
  flavorText: "URGENT: CEO needs wire transfer for confidential acquisition. $500K to this totally legitimate account. NO TIME TO VERIFY. This is normal business.",
};

/**
 * ApeQueen 0x - The NFT Pump and Dumps Manager
 *
 * Launched 83 NFT collections, all currently worth zero.
 * Claims each one is "building utility" and "forming a community."
 *
 * Cost = getManagerCostAtPosition(23) (75% of position 24 unlock)
 */
export const APEQUEEN_0X: ManagerDefinition = {
  id: 'apequeen-0x',
  name: 'ApeQueen 0x',
  scamId: 'nft-pump-and-dumps',
  cost: getManagerCostAtPosition(23),
  flavorText: "GM fam! Minting NOW! Roadmap includes metaverse, game, and token! Floor price guaranteed to moon! (Discord will be deleted in 48 hours btw)",
};

/**
 * Dr. Satoshi Fake - The Fake ICOs Manager
 *
 * PhD in blockchain from a university that doesn't exist.
 * His whitepapers are 90% buzzwords and 10% plagiarized math.
 *
 * Cost = getManagerCostAtPosition(24) (75% of position 25 unlock)
 */
export const DR_SATOSHI_FAKE: ManagerDefinition = {
  id: 'dr-satoshi-fake',
  name: 'Dr. Satoshi Fake',
  scamId: 'fake-icos',
  cost: getManagerCostAtPosition(24),
  flavorText: "Our revolutionary quantum blockchain uses AI-powered smart contracts to disrupt the paradigm. Pre-sale bonus: 1000% tokens! Team tokens locked for 2 weeks!",
};

/**
 * Simone Switcheroo - The SIM Swapping Manager
 *
 * Has 17 fake IDs and knows every mobile carrier's script.
 * Your mother's maiden name? She knows it better than you do.
 *
 * Cost = getManagerCostAtPosition(25) (75% of position 26 unlock)
 */
export const SIMONE_SWITCHEROO: ManagerDefinition = {
  id: 'simone-switcheroo',
  name: 'Simone Switcheroo',
  scamId: 'sim-swapping',
  cost: getManagerCostAtPosition(25),
  flavorText: "Hello T-Mobile? I'm the account holder. Yes, I forgot my PIN. My mother's maiden name? Let me check my list... Smith? No? Johnson? Ah, there we go.",
};

/**
 * The Credential King - The Account Takeover Services Manager
 *
 * Anonymous marketplace legend. His success rate is 99.8%.
 * Retired three times but the money keeps calling him back.
 *
 * Cost = getManagerCostAtPosition(26) (75% of position 27 unlock)
 */
export const THE_CREDENTIAL_KING: ManagerDefinition = {
  id: 'the-credential-king',
  name: 'The Credential King',
  scamId: 'account-takeover-services',
  cost: getManagerCostAtPosition(26),
  flavorText: "Any account, any platform, 48 hours guaranteed. 2FA? SMS backup? Security questions? Kid stuff. Bitcoin only. No refunds. Perfect track record.",
};

/**
 * Stuffington McPassword - The Credential Stuffing Manager
 *
 * Has 14 billion username/password combinations in his database.
 * Tests 10,000 logins per second while watching Netflix.
 *
 * Cost = getManagerCostAtPosition(27) (75% of position 28 unlock)
 */
export const STUFFINGTON_MCPASSWORD: ManagerDefinition = {
  id: 'stuffington-mcpassword',
  name: 'Stuffington McPassword',
  scamId: 'credential-stuffing',
  cost: getManagerCostAtPosition(27),
  flavorText: "Still using 'Password123' from that 2019 breach? My bot found 47 of your accounts. Thanks for being consistent across all your logins!",
};

/**
 * Locker McKenzie - The Ransomware as a Service Manager
 *
 * Former security researcher turned to the dark side.
 * Her ransomware has a 5-star customer service rating from victims.
 *
 * Cost = getManagerCostAtPosition(28) (75% of position 29 unlock)
 */
export const LOCKER_MCKENZIE: ManagerDefinition = {
  id: 'locker-mckenzie',
  name: 'Locker McKenzie',
  scamId: 'ransomware-as-a-service',
  cost: getManagerCostAtPosition(28),
  flavorText: "Your files are encrypted! Pay 50 BTC within 72 hours. Need help? Our 24/7 support team speaks 12 languages. We even offer payment plans!",
};

/**
 * Collection of all Tier 3 managers.
 * One manager per scam, each with unique personality.
 */
export const TIER_3_MANAGERS: ManagerDefinition[] = [
  VIKTOR_THE_VANISHER,
  BERNARD_MADOFF_JR,
  JOCELYN_CORPORATE,
  MAXWELL_WIRE,
  APEQUEEN_0X,
  DR_SATOSHI_FAKE,
  SIMONE_SWITCHEROO,
  THE_CREDENTIAL_KING,
  STUFFINGTON_MCPASSWORD,
  LOCKER_MCKENZIE,
];
