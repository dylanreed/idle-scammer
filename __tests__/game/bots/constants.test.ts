// ABOUTME: Tests for bot system constants
// ABOUTME: Validates generation rates, bonus multipliers, and heat reduction values

import {
  BOT_GENERATION_RATES,
  SPEED_BOT_BONUS,
  PROFIT_BOT_BONUS,
  IDLE_BOT_HEAT_REDUCTION,
} from '../../../src/game/bots/constants';

describe('Bot constants', () => {
  describe('BOT_GENERATION_RATES', () => {
    it('should have rates for all 5 tiers', () => {
      expect(BOT_GENERATION_RATES[1]).toBeDefined();
      expect(BOT_GENERATION_RATES[2]).toBeDefined();
      expect(BOT_GENERATION_RATES[3]).toBeDefined();
      expect(BOT_GENERATION_RATES[4]).toBeDefined();
      expect(BOT_GENERATION_RATES[5]).toBeDefined();
    });

    it('should have fractional rates (no scam generates a full bot per completion)', () => {
      expect(BOT_GENERATION_RATES[1]).toBeLessThan(1);
      expect(BOT_GENERATION_RATES[2]).toBeLessThan(1);
      expect(BOT_GENERATION_RATES[3]).toBeLessThan(1);
      expect(BOT_GENERATION_RATES[4]).toBeLessThan(1);
      expect(BOT_GENERATION_RATES[5]).toBeLessThan(1);
    });

    it('should have increasing rates per tier', () => {
      expect(BOT_GENERATION_RATES[2]).toBeGreaterThan(BOT_GENERATION_RATES[1]);
      expect(BOT_GENERATION_RATES[3]).toBeGreaterThan(BOT_GENERATION_RATES[2]);
      expect(BOT_GENERATION_RATES[4]).toBeGreaterThan(BOT_GENERATION_RATES[3]);
      expect(BOT_GENERATION_RATES[5]).toBeGreaterThan(BOT_GENERATION_RATES[4]);
    });

    it('should have correct specific values', () => {
      expect(BOT_GENERATION_RATES[1]).toBe(0.00001);
      expect(BOT_GENERATION_RATES[2]).toBe(0.0001);
      expect(BOT_GENERATION_RATES[3]).toBe(0.0005);
      expect(BOT_GENERATION_RATES[4]).toBe(0.002);
      expect(BOT_GENERATION_RATES[5]).toBe(0.01);
    });
  });

  describe('SPEED_BOT_BONUS', () => {
    it('should be 3% per speed bot', () => {
      expect(SPEED_BOT_BONUS).toBe(0.03);
    });
  });

  describe('PROFIT_BOT_BONUS', () => {
    it('should be 3% per profit bot', () => {
      expect(PROFIT_BOT_BONUS).toBe(0.03);
    });
  });

  describe('IDLE_BOT_HEAT_REDUCTION', () => {
    it('should be 1% heat reduction per idle bot', () => {
      expect(IDLE_BOT_HEAT_REDUCTION).toBe(0.01);
    });
  });
});
