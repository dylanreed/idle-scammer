// ABOUTME: Static definitions for the 6 active abilities with cooldowns
// ABOUTME: Each ability costs SP to unlock and provides a timed or instant effect

import type { ActiveAbilityDefinition } from './types';

/**
 * All 6 active abilities.
 * Unlocked by spending SP, activated on demand with cooldowns.
 */
export const ALL_ACTIVE_ABILITIES: ActiveAbilityDefinition[] = [
  {
    id: 'charm-offensive',
    name: 'Charm Offensive',
    description: '2x scam rewards for 60 seconds',
    cost: 3,
    activationCost: 1,
    activationCostEscalation: 0.5,
    durationMs: 60_000,
    cooldownMs: 300_000, // 5 minutes
    effectValue: 2,
  },
  {
    id: 'ddos-burst',
    name: 'DDoS Burst',
    description: 'Instantly complete all running scam timers',
    cost: 5,
    activationCost: 2,
    activationCostEscalation: 0.5,
    durationMs: 0, // Instant
    cooldownMs: 180_000, // 3 minutes
    effectValue: 1, // Boolean-style: triggers instant completion
  },
  {
    id: 'burner-phone-ability',
    name: 'Burner Phone',
    description: 'Instantly reduce current heat by 30%',
    cost: 3,
    activationCost: 1,
    activationCostEscalation: 0.5,
    durationMs: 0, // Instant
    cooldownMs: 120_000, // 2 minutes
    effectValue: 0.30, // 30% heat reduction
  },
  {
    id: 'vpn-tunnel',
    name: 'VPN Tunnel',
    description: 'Zero heat gain for 60 seconds',
    cost: 8,
    activationCost: 2,
    activationCostEscalation: 0.5,
    durationMs: 60_000,
    cooldownMs: 240_000, // 4 minutes
    effectValue: 1, // Boolean-style: zeroes heat gain
  },
  {
    id: 'deep-fake',
    name: 'Deep Fake',
    description: '2x employee bonuses for 60 seconds',
    cost: 5,
    activationCost: 2,
    activationCostEscalation: 0.5,
    durationMs: 60_000,
    cooldownMs: 300_000, // 5 minutes
    effectValue: 2,
  },
  {
    id: 'zero-day',
    name: 'Zero Day',
    description: '3x scam speed for 30 seconds',
    cost: 10,
    activationCost: 3,
    activationCostEscalation: 0.5,
    durationMs: 30_000,
    cooldownMs: 300_000, // 5 minutes
    effectValue: 3,
  },
];

/**
 * Total SP cost to unlock all active abilities.
 */
export const TOTAL_ABILITY_COST = ALL_ACTIVE_ABILITIES.reduce(
  (sum, ability) => sum + ability.cost,
  0
);
