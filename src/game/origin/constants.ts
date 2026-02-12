// ABOUTME: Origin backstory definitions and bonus values
// ABOUTME: Three origins with distinct small gameplay bonuses (duration, heat, reward)

import type { OriginId, OriginDefinition, OriginBonuses } from './types';

/**
 * All origin definitions keyed by their ID.
 */
export const ORIGINS: Record<OriginId, OriginDefinition> = {
  'moms-basement': {
    id: 'moms-basement',
    name: "Mom's Basement",
    description: "Classic hacker setup. Stealing the neighbor's WiFi, energy drinks stacked to the ceiling, mom yelling about dinner.",
    bonusDescription: '10% faster scams',
    bonuses: {
      durationReduction: 0.10,
      heatGainReduction: 0,
      rewardBonus: 0,
    },
  },
  'internet-cafe': {
    id: 'internet-cafe',
    name: 'Internet Cafe',
    description: 'Paying by the hour at a sketchy cafe. Public cover, plausible deniability, and someone else\'s IP address.',
    bonusDescription: '10% less heat',
    bonuses: {
      durationReduction: 0,
      heatGainReduction: 0.10,
      rewardBonus: 0,
    },
  },
  'stolen-phone': {
    id: 'stolen-phone',
    name: 'Stolen Phone',
    description: 'Ultra humble beginnings. Maximum hustle. You found this phone on a bus and you\'re making it count.',
    bonusDescription: '10% more money',
    bonuses: {
      durationReduction: 0,
      heatGainReduction: 0,
      rewardBonus: 0.10,
    },
  },
};

/**
 * Fallback bonuses when no origin is selected (all zeros).
 */
export const NO_ORIGIN_BONUSES: OriginBonuses = {
  durationReduction: 0,
  heatGainReduction: 0,
  rewardBonus: 0,
};
