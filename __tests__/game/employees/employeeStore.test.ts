// ABOUTME: Tests for the employee Zustand store slice
// ABOUTME: Validates employee state management, hiring, and bonus calculations

import {
  useEmployeeStore,
  getInitialEmployeeState,
  createEmployeeState,
} from '../../../src/game/employees/employeeStore';
import { TIER_1_EMPLOYEES } from '../../../src/game/employees/definitions';
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
      const state = createEmployeeState('email-copywriter');

      expect(state.employeeId).toBe('email-copywriter');
      expect(state.count).toBe(0);
    });

    it('should create state with specified count', () => {
      const state = createEmployeeState('email-copywriter', 5);

      expect(state.count).toBe(5);
    });
  });

  describe('hireEmployee', () => {
    it('should add first employee of a type', () => {
      const { hireEmployee } = useEmployeeStore.getState();

      hireEmployee('email-copywriter');

      const state = useEmployeeStore.getState().employees['email-copywriter'];
      expect(state).toBeDefined();
      expect(state.count).toBe(1);
    });

    it('should increment count for existing employee type', () => {
      const { hireEmployee } = useEmployeeStore.getState();

      hireEmployee('email-copywriter');
      hireEmployee('email-copywriter');
      hireEmployee('email-copywriter');

      const state = useEmployeeStore.getState().employees['email-copywriter'];
      expect(state.count).toBe(3);
    });

    it('should handle multiple employee types independently', () => {
      const { hireEmployee } = useEmployeeStore.getState();

      hireEmployee('email-copywriter');
      hireEmployee('email-copywriter');
      hireEmployee('lottery-announcer');

      const emailCopywriter = useEmployeeStore.getState().employees['email-copywriter'];
      const lotteryAnnouncer = useEmployeeStore.getState().employees['lottery-announcer'];

      expect(emailCopywriter.count).toBe(2);
      expect(lotteryAnnouncer.count).toBe(1);
    });

    it('should hire multiple at once with amount parameter', () => {
      const { hireEmployee } = useEmployeeStore.getState();

      hireEmployee('email-copywriter', 5);

      const state = useEmployeeStore.getState().employees['email-copywriter'];
      expect(state.count).toBe(5);
    });

    it('should accumulate when hiring multiple at once', () => {
      const { hireEmployee } = useEmployeeStore.getState();

      hireEmployee('email-copywriter', 3);
      hireEmployee('email-copywriter', 2);

      const state = useEmployeeStore.getState().employees['email-copywriter'];
      expect(state.count).toBe(5);
    });
  });

  describe('getEmployeeCount', () => {
    it('should return 0 for employee types not yet hired', () => {
      const { getEmployeeCount } = useEmployeeStore.getState();

      const count = getEmployeeCount('email-copywriter');

      expect(count).toBe(0);
    });

    it('should return correct count for hired employees', () => {
      const { hireEmployee, getEmployeeCount } = useEmployeeStore.getState();

      hireEmployee('email-copywriter', 7);

      const count = useEmployeeStore.getState().getEmployeeCount('email-copywriter');
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

      // Email Copywriter: 2% speed, 8% reward
      hireEmployee('email-copywriter', 2);

      const bonuses = useEmployeeStore.getState().getTotalBonuses();

      // 2 * 2% = 4% speed boost
      // 2 * 8% = 16% reward boost
      expect(bonuses.speedBonus).toBeCloseTo(0.04);
      expect(bonuses.rewardBonus).toBeCloseTo(0.16);
    });

    it('should combine bonuses from multiple employee types', () => {
      const { hireEmployee } = useEmployeeStore.getState();

      // Email Copywriter: 2% speed, 8% reward
      hireEmployee('email-copywriter', 2);
      // Lottery Announcer: 4% speed, 6% reward
      hireEmployee('lottery-announcer', 3);

      const bonuses = useEmployeeStore.getState().getTotalBonuses();

      // Speed: 2*2% + 3*4% = 4% + 12% = 16%
      // Reward: 2*8% + 3*6% = 16% + 18% = 34%
      expect(bonuses.speedBonus).toBeCloseTo(0.16);
      expect(bonuses.rewardBonus).toBeCloseTo(0.34);
    });
  });

  describe('getScamBonuses', () => {
    it('should return zero bonuses for scam with no employees', () => {
      const { getScamBonuses } = useEmployeeStore.getState();

      const bonuses = getScamBonuses('nigerian-prince-emails');

      expect(bonuses.speedBonus).toBe(0);
      expect(bonuses.rewardBonus).toBe(0);
    });

    it('should return bonuses only for employees of specific scam', () => {
      const { hireEmployee, getScamBonuses } = useEmployeeStore.getState();

      // Email Copywriter works on nigerian-prince-emails (2% speed, 8% reward)
      hireEmployee('email-copywriter', 2);
      // Lottery Announcer works on fake-lottery-winnings (4% speed, 6% reward)
      hireEmployee('lottery-announcer', 3);

      const nigerianBonuses =
        useEmployeeStore.getState().getScamBonuses('nigerian-prince-emails');
      const lotteryBonuses =
        useEmployeeStore.getState().getScamBonuses('fake-lottery-winnings');

      // Nigerian Prince should only have email-copywriter bonuses
      expect(nigerianBonuses.speedBonus).toBeCloseTo(0.04);
      expect(nigerianBonuses.rewardBonus).toBeCloseTo(0.16);

      // Fake Lottery should only have lottery-announcer bonuses
      expect(lotteryBonuses.speedBonus).toBeCloseTo(0.12);
      expect(lotteryBonuses.rewardBonus).toBeCloseTo(0.18);
    });

    it('should return zero for unknown scam ID', () => {
      const { hireEmployee, getScamBonuses } = useEmployeeStore.getState();

      hireEmployee('email-copywriter', 5);

      const bonuses = useEmployeeStore.getState().getScamBonuses('unknown-scam');

      expect(bonuses.speedBonus).toBe(0);
      expect(bonuses.rewardBonus).toBe(0);
    });
  });

  describe('resetEmployees', () => {
    it('should reset all employee counts to empty', () => {
      const { hireEmployee, resetEmployees } = useEmployeeStore.getState();

      // Hire some employees
      hireEmployee('email-copywriter', 10);
      hireEmployee('lottery-announcer', 5);

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

      hireEmployee('email-copywriter', 10);

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

      hireEmployee('email-copywriter', 3);
      hireEmployee('lottery-announcer', 2);

      const states = useEmployeeStore.getState().getAllEmployeeStates();

      expect(states.length).toBe(2);
      expect(states.some((s) => s.employeeId === 'email-copywriter' && s.count === 3)).toBe(
        true
      );
      expect(
        states.some((s) => s.employeeId === 'lottery-announcer' && s.count === 2)
      ).toBe(true);
    });
  });

  describe('type safety', () => {
    it('should have proper typing for EmployeeState', () => {
      const { hireEmployee } = useEmployeeStore.getState();
      hireEmployee('email-copywriter');

      const state: EmployeeState =
        useEmployeeStore.getState().employees['email-copywriter'];

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
