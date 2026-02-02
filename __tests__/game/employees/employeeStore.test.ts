// ABOUTME: Tests for the employee Zustand store slice
// ABOUTME: Validates employee state management, hiring, and bonus calculations

import {
  useEmployeeStore,
  getInitialEmployeeState,
  createEmployeeState,
} from '../../../src/game/employees/employeeStore';
import { BOT_WRANGLER, TIER_1_EMPLOYEES } from '../../../src/game/employees/definitions';
import type { EmployeeState } from '../../../src/game/employees/types';

describe('EmployeeStore', () => {
  // Reset store before each test
  beforeEach(() => {
    useEmployeeStore.setState(useEmployeeStore.getInitialState());
  });

  describe('initial state', () => {
    it('should have empty employee map initially', () => {
      const state = useEmployeeStore.getState();

      expect(Object.keys(state.employees).length).toBe(0);
    });
  });

  describe('getInitialEmployeeState', () => {
    it('should return empty state by default', () => {
      const state = getInitialEmployeeState();

      expect(Object.keys(state).length).toBe(0);
    });
  });

  describe('createEmployeeState', () => {
    it('should create state with zero count by default', () => {
      const state = createEmployeeState('bot-wrangler');

      expect(state.employeeId).toBe('bot-wrangler');
      expect(state.count).toBe(0);
    });

    it('should create state with specified count', () => {
      const state = createEmployeeState('bot-wrangler', 5);

      expect(state.count).toBe(5);
    });
  });

  describe('hireEmployee', () => {
    it('should add first employee of a type', () => {
      const { hireEmployee } = useEmployeeStore.getState();

      hireEmployee('bot-wrangler');

      const state = useEmployeeStore.getState().employees['bot-wrangler'];
      expect(state).toBeDefined();
      expect(state.count).toBe(1);
    });

    it('should increment count for existing employee type', () => {
      const { hireEmployee } = useEmployeeStore.getState();

      hireEmployee('bot-wrangler');
      hireEmployee('bot-wrangler');
      hireEmployee('bot-wrangler');

      const state = useEmployeeStore.getState().employees['bot-wrangler'];
      expect(state.count).toBe(3);
    });

    it('should handle multiple employee types independently', () => {
      const { hireEmployee } = useEmployeeStore.getState();

      hireEmployee('bot-wrangler');
      hireEmployee('bot-wrangler');
      hireEmployee('email-copywriter');

      const botWrangler = useEmployeeStore.getState().employees['bot-wrangler'];
      const emailCopywriter = useEmployeeStore.getState().employees['email-copywriter'];

      expect(botWrangler.count).toBe(2);
      expect(emailCopywriter.count).toBe(1);
    });

    it('should hire multiple at once with amount parameter', () => {
      const { hireEmployee } = useEmployeeStore.getState();

      hireEmployee('bot-wrangler', 5);

      const state = useEmployeeStore.getState().employees['bot-wrangler'];
      expect(state.count).toBe(5);
    });

    it('should accumulate when hiring multiple at once', () => {
      const { hireEmployee } = useEmployeeStore.getState();

      hireEmployee('bot-wrangler', 3);
      hireEmployee('bot-wrangler', 2);

      const state = useEmployeeStore.getState().employees['bot-wrangler'];
      expect(state.count).toBe(5);
    });
  });

  describe('getEmployeeCount', () => {
    it('should return 0 for employee types not yet hired', () => {
      const { getEmployeeCount } = useEmployeeStore.getState();

      const count = getEmployeeCount('bot-wrangler');

      expect(count).toBe(0);
    });

    it('should return correct count for hired employees', () => {
      const { hireEmployee, getEmployeeCount } = useEmployeeStore.getState();

      hireEmployee('bot-wrangler', 7);

      const count = useEmployeeStore.getState().getEmployeeCount('bot-wrangler');
      expect(count).toBe(7);
    });

    it('should return 0 for unknown employee IDs', () => {
      const { getEmployeeCount } = useEmployeeStore.getState();

      const count = getEmployeeCount('unknown-employee');

      expect(count).toBe(0);
    });
  });

  describe('getTotalBonuses', () => {
    it('should return zero bonuses when no employees hired', () => {
      const { getTotalBonuses } = useEmployeeStore.getState();

      const bonuses = getTotalBonuses();

      expect(bonuses.speedBonus).toBe(0);
      expect(bonuses.rewardBonus).toBe(0);
    });

    it('should calculate bonuses for hired employees', () => {
      const { hireEmployee, getTotalBonuses } = useEmployeeStore.getState();

      // Bot Wrangler: 3% speed, 5% reward
      hireEmployee('bot-wrangler', 2);

      const bonuses = useEmployeeStore.getState().getTotalBonuses();

      // 2 * 3% = 6% speed boost
      // 2 * 5% = 10% reward boost
      expect(bonuses.speedBonus).toBeCloseTo(0.06);
      expect(bonuses.rewardBonus).toBeCloseTo(0.1);
    });

    it('should combine bonuses from multiple employee types', () => {
      const { hireEmployee } = useEmployeeStore.getState();

      // Bot Wrangler: 3% speed, 5% reward
      hireEmployee('bot-wrangler', 2);
      // Email Copywriter: 2% speed, 8% reward
      hireEmployee('email-copywriter', 3);

      const bonuses = useEmployeeStore.getState().getTotalBonuses();

      // Speed: 2*3% + 3*2% = 6% + 6% = 12%
      // Reward: 2*5% + 3*8% = 10% + 24% = 34%
      expect(bonuses.speedBonus).toBeCloseTo(0.12);
      expect(bonuses.rewardBonus).toBeCloseTo(0.34);
    });
  });

  describe('getScamBonuses', () => {
    it('should return zero bonuses for scam with no employees', () => {
      const { getScamBonuses } = useEmployeeStore.getState();

      const bonuses = getScamBonuses('bot-farms');

      expect(bonuses.speedBonus).toBe(0);
      expect(bonuses.rewardBonus).toBe(0);
    });

    it('should return bonuses only for employees of specific scam', () => {
      const { hireEmployee, getScamBonuses } = useEmployeeStore.getState();

      // Bot Wrangler works on bot-farms
      hireEmployee('bot-wrangler', 2);
      // Email Copywriter works on nigerian-prince-emails
      hireEmployee('email-copywriter', 3);

      const botFarmsBonuses = useEmployeeStore.getState().getScamBonuses('bot-farms');
      const nigerianBonuses =
        useEmployeeStore.getState().getScamBonuses('nigerian-prince-emails');

      // Bot Farms should only have bot-wrangler bonuses
      expect(botFarmsBonuses.speedBonus).toBeCloseTo(0.06);
      expect(botFarmsBonuses.rewardBonus).toBeCloseTo(0.1);

      // Nigerian Prince should only have email-copywriter bonuses
      expect(nigerianBonuses.speedBonus).toBeCloseTo(0.06);
      expect(nigerianBonuses.rewardBonus).toBeCloseTo(0.24);
    });

    it('should return zero for unknown scam ID', () => {
      const { hireEmployee, getScamBonuses } = useEmployeeStore.getState();

      hireEmployee('bot-wrangler', 5);

      const bonuses = useEmployeeStore.getState().getScamBonuses('unknown-scam');

      expect(bonuses.speedBonus).toBe(0);
      expect(bonuses.rewardBonus).toBe(0);
    });
  });

  describe('resetEmployees', () => {
    it('should reset all employee counts to empty', () => {
      const { hireEmployee, resetEmployees } = useEmployeeStore.getState();

      // Hire some employees
      hireEmployee('bot-wrangler', 10);
      hireEmployee('email-copywriter', 5);

      // Verify they were hired
      let state = useEmployeeStore.getState();
      expect(Object.keys(state.employees).length).toBeGreaterThan(0);

      // Reset
      resetEmployees();

      // Verify reset
      state = useEmployeeStore.getState();
      expect(Object.keys(state.employees).length).toBe(0);
    });

    it('should return zero bonuses after reset', () => {
      const { hireEmployee, resetEmployees, getTotalBonuses } =
        useEmployeeStore.getState();

      hireEmployee('bot-wrangler', 10);

      // Verify bonuses before reset
      let bonuses = useEmployeeStore.getState().getTotalBonuses();
      expect(bonuses.speedBonus).toBeGreaterThan(0);

      // Reset
      resetEmployees();

      // Verify bonuses after reset
      bonuses = useEmployeeStore.getState().getTotalBonuses();
      expect(bonuses.speedBonus).toBe(0);
      expect(bonuses.rewardBonus).toBe(0);
    });
  });

  describe('getAllEmployeeStates', () => {
    it('should return empty array when no employees hired', () => {
      const { getAllEmployeeStates } = useEmployeeStore.getState();

      const states = getAllEmployeeStates();

      expect(states).toEqual([]);
    });

    it('should return all hired employee states', () => {
      const { hireEmployee, getAllEmployeeStates } = useEmployeeStore.getState();

      hireEmployee('bot-wrangler', 3);
      hireEmployee('email-copywriter', 2);

      const states = useEmployeeStore.getState().getAllEmployeeStates();

      expect(states.length).toBe(2);
      expect(states.some((s) => s.employeeId === 'bot-wrangler' && s.count === 3)).toBe(
        true
      );
      expect(
        states.some((s) => s.employeeId === 'email-copywriter' && s.count === 2)
      ).toBe(true);
    });
  });

  describe('type safety', () => {
    it('should have proper typing for EmployeeState', () => {
      const { hireEmployee } = useEmployeeStore.getState();
      hireEmployee('bot-wrangler');

      const state: EmployeeState =
        useEmployeeStore.getState().employees['bot-wrangler'];

      expect(typeof state.employeeId).toBe('string');
      expect(typeof state.count).toBe('number');
    });

    it('should have proper typing for bonuses', () => {
      const { getTotalBonuses } = useEmployeeStore.getState();

      const bonuses = getTotalBonuses();

      expect(typeof bonuses.speedBonus).toBe('number');
      expect(typeof bonuses.rewardBonus).toBe('number');
    });
  });
});
