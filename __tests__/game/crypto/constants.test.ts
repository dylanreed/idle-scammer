// ABOUTME: Tests for crypto system constants
// ABOUTME: Validates market params, project definitions, NFT weights, and hype mechanics

import {
  BASE_EXCHANGE_RATE,
  MARKET_TICK_INTERVAL_MS,
  BASE_VOLATILITY,
  BASE_DRIFT,
  EVENT_CHANCE_PER_TICK,
  EVENT_DURATION_TICKS,
  MIN_EXCHANGE_RATE,
  MAX_EXCHANGE_RATE,
  EXCHANGE_FEE,
  MARKET_EVENTS,
  MARKET_EVENT_TYPES,
  MAX_ACTIVE_PROJECTS,
  PROJECT_DEFINITIONS,
  MAX_COLLECTIONS,
  NFT_RARITY_WEIGHTS,
  BASE_MINT_COST,
  NFT_RARITY_MULTIPLIERS,
  HYPE_DECAY_RATE,
  HYPE_SHILL_BOOST,
  MAX_HYPE,
  RUG_PULL_FRACTION,
  BASE_FLOOR_PRICE_PER_HYPE,
} from '../../../src/game/crypto/constants';

describe('Crypto constants', () => {
  describe('Market constants', () => {
    it('should have base exchange rate of 1000', () => {
      expect(BASE_EXCHANGE_RATE).toBe(1000);
    });

    it('should tick every 2 seconds', () => {
      expect(MARKET_TICK_INTERVAL_MS).toBe(2000);
    });

    it('should have 2% base volatility', () => {
      expect(BASE_VOLATILITY).toBe(0.02);
    });

    it('should have 0.1% upward drift bias', () => {
      expect(BASE_DRIFT).toBe(0.001);
    });

    it('should have 0.5% event chance per tick', () => {
      expect(EVENT_CHANCE_PER_TICK).toBe(0.005);
    });

    it('should have 15-tick event duration', () => {
      expect(EVENT_DURATION_TICKS).toBe(15);
    });

    it('should clamp exchange rate between 10 and 1,000,000', () => {
      expect(MIN_EXCHANGE_RATE).toBe(10);
      expect(MAX_EXCHANGE_RATE).toBe(1_000_000);
      expect(MIN_EXCHANGE_RATE).toBeLessThan(MAX_EXCHANGE_RATE);
    });

    it('should have 2% exchange fee', () => {
      expect(EXCHANGE_FEE).toBe(0.02);
    });
  });

  describe('Market events', () => {
    it('should have 5 event types', () => {
      expect(MARKET_EVENT_TYPES).toHaveLength(5);
    });

    it('should have definitions for all event types', () => {
      for (const eventType of MARKET_EVENT_TYPES) {
        expect(MARKET_EVENTS[eventType]).toBeDefined();
        expect(MARKET_EVENTS[eventType].type).toBe(eventType);
        expect(typeof MARKET_EVENTS[eventType].driftModifier).toBe('number');
        expect(typeof MARKET_EVENTS[eventType].volatilityModifier).toBe('number');
      }
    });

    it('should have positive volatility modifiers for all events', () => {
      for (const eventType of MARKET_EVENT_TYPES) {
        expect(MARKET_EVENTS[eventType].volatilityModifier).toBeGreaterThan(0);
      }
    });

    it('should have bull-run with positive drift', () => {
      expect(MARKET_EVENTS['bull-run'].driftModifier).toBeGreaterThan(0);
    });

    it('should have crash with negative drift', () => {
      expect(MARKET_EVENTS['crash'].driftModifier).toBeLessThan(0);
    });

    it('should have elon-tweet as most volatile', () => {
      const elonVol = MARKET_EVENTS['elon-tweet'].volatilityModifier;
      for (const eventType of MARKET_EVENT_TYPES) {
        expect(elonVol).toBeGreaterThanOrEqual(MARKET_EVENTS[eventType].volatilityModifier);
      }
    });
  });

  describe('Project definitions', () => {
    it('should have 4 project types', () => {
      expect(PROJECT_DEFINITIONS).toHaveLength(4);
    });

    it('should have unique IDs', () => {
      const ids = PROJECT_DEFINITIONS.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have risk tiers: low, medium, high, extreme', () => {
      const risks = PROJECT_DEFINITIONS.map((p) => p.risk);
      expect(risks).toContain('low');
      expect(risks).toContain('medium');
      expect(risks).toContain('high');
      expect(risks).toContain('extreme');
    });

    it('should have minReturn <= maxReturn for all projects', () => {
      for (const project of PROJECT_DEFINITIONS) {
        expect(project.minReturn).toBeLessThanOrEqual(project.maxReturn);
      }
    });

    it('should have rug chance between 0 and 1 for all projects', () => {
      for (const project of PROJECT_DEFINITIONS) {
        expect(project.rugChance).toBeGreaterThanOrEqual(0);
        expect(project.rugChance).toBeLessThanOrEqual(1);
      }
    });

    it('should have increasing rug chance with risk tier', () => {
      const byRisk = {
        low: PROJECT_DEFINITIONS.find((p) => p.risk === 'low')!,
        medium: PROJECT_DEFINITIONS.find((p) => p.risk === 'medium')!,
        high: PROJECT_DEFINITIONS.find((p) => p.risk === 'high')!,
        extreme: PROJECT_DEFINITIONS.find((p) => p.risk === 'extreme')!,
      };
      expect(byRisk.medium.rugChance).toBeGreaterThan(byRisk.low.rugChance);
      expect(byRisk.high.rugChance).toBeGreaterThan(byRisk.medium.rugChance);
      expect(byRisk.extreme.rugChance).toBeGreaterThan(byRisk.high.rugChance);
    });

    it('should have increasing duration with risk tier', () => {
      const byRisk = {
        low: PROJECT_DEFINITIONS.find((p) => p.risk === 'low')!,
        medium: PROJECT_DEFINITIONS.find((p) => p.risk === 'medium')!,
        high: PROJECT_DEFINITIONS.find((p) => p.risk === 'high')!,
        extreme: PROJECT_DEFINITIONS.find((p) => p.risk === 'extreme')!,
      };
      expect(byRisk.medium.durationMs).toBeGreaterThan(byRisk.low.durationMs);
      expect(byRisk.high.durationMs).toBeGreaterThan(byRisk.medium.durationMs);
      expect(byRisk.extreme.durationMs).toBeGreaterThan(byRisk.high.durationMs);
    });

    it('should have positive durations', () => {
      for (const project of PROJECT_DEFINITIONS) {
        expect(project.durationMs).toBeGreaterThan(0);
      }
    });

    it('should allow max 5 active projects', () => {
      expect(MAX_ACTIVE_PROJECTS).toBe(5);
    });
  });

  describe('NFT constants', () => {
    it('should allow max 10 collections', () => {
      expect(MAX_COLLECTIONS).toBe(10);
    });

    it('should have rarity weights summing to 100', () => {
      const total = Object.values(NFT_RARITY_WEIGHTS).reduce((sum, w) => sum + w, 0);
      expect(total).toBe(100);
    });

    it('should have all 5 rarity tiers defined', () => {
      expect(NFT_RARITY_WEIGHTS.common).toBeDefined();
      expect(NFT_RARITY_WEIGHTS.uncommon).toBeDefined();
      expect(NFT_RARITY_WEIGHTS.rare).toBeDefined();
      expect(NFT_RARITY_WEIGHTS.legendary).toBeDefined();
      expect(NFT_RARITY_WEIGHTS.mythic).toBeDefined();
    });

    it('should have common as most likely rarity', () => {
      expect(NFT_RARITY_WEIGHTS.common).toBeGreaterThan(NFT_RARITY_WEIGHTS.uncommon);
      expect(NFT_RARITY_WEIGHTS.uncommon).toBeGreaterThan(NFT_RARITY_WEIGHTS.rare);
      expect(NFT_RARITY_WEIGHTS.rare).toBeGreaterThan(NFT_RARITY_WEIGHTS.legendary);
      expect(NFT_RARITY_WEIGHTS.legendary).toBeGreaterThan(NFT_RARITY_WEIGHTS.mythic);
    });

    it('should have positive base mint cost', () => {
      expect(BASE_MINT_COST).toBeGreaterThan(0);
    });

    it('should have increasing rarity multipliers', () => {
      expect(NFT_RARITY_MULTIPLIERS.uncommon).toBeGreaterThan(NFT_RARITY_MULTIPLIERS.common);
      expect(NFT_RARITY_MULTIPLIERS.rare).toBeGreaterThan(NFT_RARITY_MULTIPLIERS.uncommon);
      expect(NFT_RARITY_MULTIPLIERS.legendary).toBeGreaterThan(NFT_RARITY_MULTIPLIERS.rare);
      expect(NFT_RARITY_MULTIPLIERS.mythic).toBeGreaterThan(NFT_RARITY_MULTIPLIERS.legendary);
    });

    it('should have positive hype decay rate', () => {
      expect(HYPE_DECAY_RATE).toBeGreaterThan(0);
    });

    it('should have positive shill boost', () => {
      expect(HYPE_SHILL_BOOST).toBeGreaterThan(0);
    });

    it('should have max hype of 100', () => {
      expect(MAX_HYPE).toBe(100);
    });

    it('should have rug pull fraction of 70%', () => {
      expect(RUG_PULL_FRACTION).toBe(0.7);
    });

    it('should have positive base floor price per hype', () => {
      expect(BASE_FLOOR_PRICE_PER_HYPE).toBeGreaterThan(0);
    });
  });
});
