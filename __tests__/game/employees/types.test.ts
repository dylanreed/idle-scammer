// ABOUTME: Tests for employee type definitions
// ABOUTME: Validates EmployeeDefinition and EmployeeState interfaces work correctly

import type { EmployeeDefinition, EmployeeState } from '../../../src/game/employees/types';

describe('Employee Types', () => {
  describe('EmployeeDefinition', () => {
    it('should have all required fields for an employee definition', () => {
      const testEmployee: EmployeeDefinition = {
        id: 'bot-wrangler',
        name: 'Bot Wrangler',
        scamId: 'bot-farms',
        baseCost: 100,
        speedBoost: 0.05, // 5% duration reduction
        rewardBoost: 0.1, // 10% reward increase
      };

      expect(testEmployee.id).toBe('bot-wrangler');
      expect(testEmployee.name).toBe('Bot Wrangler');
      expect(testEmployee.scamId).toBe('bot-farms');
      expect(testEmployee.baseCost).toBe(100);
      expect(testEmployee.speedBoost).toBe(0.05);
      expect(testEmployee.rewardBoost).toBe(0.1);
    });

    it('should allow zero speed boost (reward-only employees)', () => {
      const employee: EmployeeDefinition = {
        id: 'email-copywriter',
        name: 'Email Copywriter',
        scamId: 'nigerian-prince-emails',
        baseCost: 150,
        speedBoost: 0,
        rewardBoost: 0.15,
      };

      expect(employee.speedBoost).toBe(0);
      expect(employee.rewardBoost).toBe(0.15);
    });

    it('should allow zero reward boost (speed-only employees)', () => {
      const employee: EmployeeDefinition = {
        id: 'fast-typer',
        name: 'Fast Typer',
        scamId: 'phishing-links',
        baseCost: 200,
        speedBoost: 0.1,
        rewardBoost: 0,
      };

      expect(employee.speedBoost).toBe(0.1);
      expect(employee.rewardBoost).toBe(0);
    });

    it('should support fractional boost values', () => {
      const employee: EmployeeDefinition = {
        id: 'test-employee',
        name: 'Test Employee',
        scamId: 'test-scam',
        baseCost: 50,
        speedBoost: 0.025, // 2.5%
        rewardBoost: 0.075, // 7.5%
      };

      expect(employee.speedBoost).toBe(0.025);
      expect(employee.rewardBoost).toBe(0.075);
    });
  });

  describe('EmployeeState', () => {
    it('should have all required fields for employee state', () => {
      const testState: EmployeeState = {
        employeeId: 'bot-wrangler',
        count: 5,
      };

      expect(testState.employeeId).toBe('bot-wrangler');
      expect(testState.count).toBe(5);
    });

    it('should allow zero count (no employees hired)', () => {
      const state: EmployeeState = {
        employeeId: 'bot-wrangler',
        count: 0,
      };

      expect(state.count).toBe(0);
    });

    it('should allow large counts for late game', () => {
      const state: EmployeeState = {
        employeeId: 'bot-wrangler',
        count: 10000,
      };

      expect(state.count).toBe(10000);
    });
  });
});
