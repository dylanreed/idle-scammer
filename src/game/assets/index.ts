// ABOUTME: Asset mapping for scam icons, manager portraits, and UI elements
// ABOUTME: Uses require() for Expo/React Native static image bundling

import { ImageSourcePropType } from 'react-native';
import type { ResourceKey } from '../types';

/**
 * Scam icon assets mapped by scam ID.
 * These are the pixel art icons displayed on scam cards.
 */
export const SCAM_ICONS: Record<string, ImageSourcePropType> = {
  'nigerian-prince-emails': require('../../../assets/tier-1/scams/prince-email.png'),
  'fake-lottery-winnings': require('../../../assets/tier-1/scams/lottery-ticket.png'),
  'iphone-popup': require('../../../assets/tier-1/scams/pop-up-ad.png'),
  'phishing-links': require('../../../assets/tier-1/scams/phishing.png'),
  'survey-scams': require('../../../assets/tier-1/scams/survey.png'),
  'fake-antivirus-popups': require('../../../assets/tier-1/scams/fake-av.png'),
  'gift-card-scams': require('../../../assets/tier-1/scams/gift-card.png'),
  'advance-fee-fraud': require('../../../assets/tier-1/scams/money-bag.png'),
  'fake-job-postings': require('../../../assets/tier-1/scams/fake-job.png'),
};

/**
 * Manager portrait assets mapped by manager ID.
 * These are character portraits shown in the manager purchase UI.
 *
 * Portrait assignments based on personality:
 * - prince-okonkwo: flashy-suit (royal attire)
 * - lucky-larry: cryptobro (hype man energy)
 * - popup-pete: tech-bro (early 2000s web enthusiast)
 * - phishmaster-phil: skimask (sneaky identity theft)
 * - survey-susan: telemarketer (call center style)
 * - dread-norton: nervous-businessman (paranoid warnings)
 * - gwen-cardsworth: innocent-granny (trustworthy for IRS scam!)
 * - felix-upfront: cool-cat (smooth operator)
 * - carla-careers: hacker (tech-savvy scammer)
 */
export const MANAGER_PORTRAITS: Record<string, ImageSourcePropType> = {
  'prince-okonkwo': require('../../../assets/tier-1/managers/flashy-suit.png'),
  'lucky-larry': require('../../../assets/tier-1/managers/cryptobro.png'),
  'popup-pete': require('../../../assets/tier-1/managers/tech-bro.png'),
  'phishmaster-phil': require('../../../assets/tier-1/managers/skimask.png'),
  'survey-susan': require('../../../assets/tier-1/managers/telemarketer.png'),
  'dread-norton': require('../../../assets/tier-1/managers/nervous-businessman.png'),
  'gwen-cardsworth': require('../../../assets/tier-1/managers/innocent-granny.png'),
  'felix-upfront': require('../../../assets/tier-1/managers/cool-cat.png'),
  'carla-careers': require('../../../assets/tier-1/managers/hacker.png'),
};

/**
 * Get the icon for a scam by its ID.
 *
 * @param scamId - The scam's unique identifier
 * @returns The image source for the scam's icon, or undefined if not found
 */
export function getScamIcon(scamId: string): ImageSourcePropType | undefined {
  return SCAM_ICONS[scamId];
}

/**
 * Get the portrait for a manager by their ID.
 *
 * @param managerId - The manager's unique identifier
 * @returns The image source for the manager's portrait, or undefined if not found
 */
export function getManagerPortrait(managerId: string): ImageSourcePropType | undefined {
  return MANAGER_PORTRAITS[managerId];
}

/**
 * UI icons for resource display in the HUD.
 * Maps resource keys to their pixel art icons.
 *
 * Icon assignments:
 * - money: cash (green dollar bills)
 * - bots: bots (cute robot face)
 * - trust: trust (golden handshake)
 * - crypto: crypto (gold coin)
 * - reputation: purple_brain (sparkly brain)
 * - skillPoints: purple_brain (reused - skills = brainpower)
 * - heat: undefined (no icon yet - uses fallback)
 */
export const RESOURCE_ICONS: Partial<Record<ResourceKey, ImageSourcePropType>> = {
  money: require('../../../assets/ui/cash.png'),
  bots: require('../../../assets/ui/bots.png'),
  trust: require('../../../assets/ui/trust.png'),
  crypto: require('../../../assets/ui/crypto.png'),
  reputation: require('../../../assets/ui/purple_brain.png'),
  skillPoints: require('../../../assets/ui/purple_brain.png'),
  heat: require('../../../assets/ui/fire.png'),
};

/**
 * Get the icon for a resource by its key.
 *
 * @param resourceKey - The resource key
 * @returns The image source for the resource's icon, or undefined if not found
 */
export function getResourceIcon(resourceKey: ResourceKey): ImageSourcePropType | undefined {
  return RESOURCE_ICONS[resourceKey];
}
