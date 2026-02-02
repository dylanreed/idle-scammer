// ABOUTME: Tests for manager type definitions
// ABOUTME: Validates ManagerDefinition and ManagerState interfaces work correctly

import type { ManagerDefinition, ManagerState } from '../../../src/game/managers/types';

describe('Manager Types', () => {
  describe('ManagerDefinition', () => {
    it('should have all required fields for a manager definition', () => {
      const testManager: ManagerDefinition = {
        id: 'bot-3000',
        name: 'B0T-3000',
        scamId: 'bot-farms',
        cost: 1000,
        flavorText: 'BEEP BOOP. AUTOMATION PROTOCOL ENGAGED.',
      };

      expect(testManager.id).toBe('bot-3000');
      expect(testManager.name).toBe('B0T-3000');
      expect(testManager.scamId).toBe('bot-farms');
      expect(testManager.cost).toBe(1000);
      expect(testManager.flavorText).toBe('BEEP BOOP. AUTOMATION PROTOCOL ENGAGED.');
    });

    it('should allow different cost values', () => {
      const cheapManager: ManagerDefinition = {
        id: 'test-manager-1',
        name: 'Cheap Manager',
        scamId: 'test-scam',
        cost: 100,
        flavorText: 'Budget option.',
      };

      const expensiveManager: ManagerDefinition = {
        id: 'test-manager-2',
        name: 'Expensive Manager',
        scamId: 'test-scam',
        cost: 1000000,
        flavorText: 'Premium tier.',
      };

      expect(cheapManager.cost).toBe(100);
      expect(expensiveManager.cost).toBe(1000000);
    });

    it('should support managers with long flavor text', () => {
      const manager: ManagerDefinition = {
        id: 'verbose-manager',
        name: 'The Verbose One',
        scamId: 'test-scam',
        cost: 500,
        flavorText:
          'This manager has a very long backstory involving multiple continents, several failed startups, and an unfortunate incident with a time-share presentation.',
      };

      expect(manager.flavorText.length).toBeGreaterThan(100);
    });

    it('should allow special characters in names', () => {
      const manager: ManagerDefinition = {
        id: 'prince-okonkwo',
        name: 'Prince Okonkwo III',
        scamId: 'nigerian-prince-emails',
        cost: 2000,
        flavorText: "I am the REAL prince. Please believe me this time.",
      };

      expect(manager.name).toBe('Prince Okonkwo III');
    });
  });

  describe('ManagerState', () => {
    it('should have all required fields for manager state', () => {
      const testState: ManagerState = {
        managerId: 'bot-3000',
        isHired: false,
      };

      expect(testState.managerId).toBe('bot-3000');
      expect(testState.isHired).toBe(false);
    });

    it('should track hired state correctly when true', () => {
      const state: ManagerState = {
        managerId: 'prince-okonkwo',
        isHired: true,
      };

      expect(state.isHired).toBe(true);
    });

    it('should track hired state correctly when false', () => {
      const state: ManagerState = {
        managerId: 'prince-okonkwo',
        isHired: false,
      };

      expect(state.isHired).toBe(false);
    });
  });
});
