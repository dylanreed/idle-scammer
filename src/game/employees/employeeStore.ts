// ABOUTME: Zustand store slice for managing employee state
// ABOUTME: Tracks hired employee counts and calculates bonuses per scam

import { create } from 'zustand';
import type { EmployeeState } from './types';
import { TIER_1_EMPLOYEES, getEmployeesByScamId, getEmployeeById } from './definitions';
import { calculateSpeedBonus, calculateRewardBonus } from './calculations';

/**
 * Map of employee IDs to their runtime state
 */
export type EmployeeStateMap = Record<string, EmployeeState>;

/**
 * Bonus values for speed and reward
 */
export interface EmployeeBonuses {
  /** Total speed bonus as a decimal (0.25 = 25% reduction in duration) */
  speedBonus: number;
  /** Total reward bonus as a decimal (0.5 = 50% increase in reward) */
  rewardBonus: number;
}

/**
 * Actions available on the employee store
 */
export interface EmployeeStoreActions {
  /** Hire one or more employees of a specific type */
  hireEmployee: (employeeId: string, amount?: number) => void;

  /** Get the count of a specific employee type */
  getEmployeeCount: (employeeId: string) => number;

  /** Get total bonuses from all hired employees */
  getTotalBonuses: () => EmployeeBonuses;

  /** Get bonuses for a specific scam from its employees */
  getScamBonuses: (scamId: string) => EmployeeBonuses;

  /** Get all employee states as an array */
  getAllEmployeeStates: () => EmployeeState[];

  /** Reset all employee state (for prestige) */
  resetEmployees: () => void;
}

/**
 * Complete employee store state combining state and actions
 */
export interface EmployeeStoreState extends EmployeeStoreActions {
  employees: EmployeeStateMap;
}

/**
 * Creates a new EmployeeState for an employee ID.
 * Used when initializing or first hiring an employee.
 *
 * @param employeeId - The employee ID
 * @param count - Initial count (default: 0)
 * @returns A fresh EmployeeState object
 */
export function createEmployeeState(employeeId: string, count = 0): EmployeeState {
  return {
    employeeId,
    count,
  };
}

/**
 * Returns the initial employee state (empty).
 * Employees are hired during gameplay, not pre-initialized.
 *
 * @returns Initial employee state map (empty)
 */
export function getInitialEmployeeState(): EmployeeStateMap {
  return {};
}

/**
 * Employee store using Zustand.
 * Manages runtime state for all hired employees.
 */
export const useEmployeeStore = create<EmployeeStoreState>()((set, get) => ({
  employees: getInitialEmployeeState(),

  hireEmployee: (employeeId: string, amount = 1) => {
    set((state) => {
      const existingEmployee = state.employees[employeeId];

      if (existingEmployee) {
        // Increment existing employee count
        return {
          employees: {
            ...state.employees,
            [employeeId]: {
              ...existingEmployee,
              count: existingEmployee.count + amount,
            },
          },
        };
      }

      // Create new employee state with the hired amount
      return {
        employees: {
          ...state.employees,
          [employeeId]: createEmployeeState(employeeId, amount),
        },
      };
    });
  },

  getEmployeeCount: (employeeId: string) => {
    const state = get().employees[employeeId];
    return state?.count ?? 0;
  },

  getTotalBonuses: () => {
    const employeeStates = get().getAllEmployeeStates();

    return {
      speedBonus: calculateSpeedBonus(employeeStates, TIER_1_EMPLOYEES),
      rewardBonus: calculateRewardBonus(employeeStates, TIER_1_EMPLOYEES),
    };
  },

  getScamBonuses: (scamId: string) => {
    const employeeStates = get().getAllEmployeeStates();
    const scamEmployees = getEmployeesByScamId(scamId);

    // Filter to only employees that work on this scam
    const relevantStates = employeeStates.filter((state) => {
      const definition = getEmployeeById(state.employeeId);
      return definition?.scamId === scamId;
    });

    return {
      speedBonus: calculateSpeedBonus(relevantStates, scamEmployees),
      rewardBonus: calculateRewardBonus(relevantStates, scamEmployees),
    };
  },

  getAllEmployeeStates: () => {
    return Object.values(get().employees);
  },

  resetEmployees: () => {
    set({ employees: getInitialEmployeeState() });
  },
}));
