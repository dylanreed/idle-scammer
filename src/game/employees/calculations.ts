// ABOUTME: Calculation functions for employee costs and bonuses
// ABOUTME: Implements exponential cost scaling and linear bonus accumulation

import type { EmployeeDefinition, EmployeeState } from './types';

/**
 * Exponential growth rate for employee costs.
 * 1.15 means each additional employee costs ~15% more than the previous.
 */
const EMPLOYEE_COST_GROWTH_RATE = 1.15;

/**
 * Calculates the cost to hire the next employee of a given type.
 * Uses exponential scaling (idle game convention).
 *
 * Formula: floor(baseCost * growthRate^currentCount)
 *
 * @param definition - The employee definition
 * @param currentCount - How many of this type are already hired
 * @returns Cost to hire the next employee (floored to integer)
 */
export function calculateEmployeeCost(
  definition: EmployeeDefinition,
  currentCount: number
): number {
  const { baseCost } = definition;

  // Exponential growth: baseCost * growthRate^count
  const cost = baseCost * Math.pow(EMPLOYEE_COST_GROWTH_RATE, currentCount);

  // Floor to integer
  return Math.floor(cost);
}

/**
 * Calculates the total speed bonus from all hired employees.
 * Each employee contributes their speedBoost linearly per count.
 *
 * Formula: sum(employee.speedBoost * count) for all employees
 *
 * @param employees - Array of current employee states
 * @param definitions - Array of employee definitions (to look up boost values)
 * @returns Total speed bonus as a decimal (0.25 = 25%)
 */
export function calculateSpeedBonus(
  employees: EmployeeState[],
  definitions: EmployeeDefinition[]
): number {
  // Create a map for quick lookup of definitions by ID
  const definitionMap = new Map<string, EmployeeDefinition>();
  definitions.forEach((def) => {
    definitionMap.set(def.id, def);
  });

  // Sum up speed boosts from all employees
  let totalBonus = 0;
  employees.forEach((state) => {
    const definition = definitionMap.get(state.employeeId);
    if (definition) {
      totalBonus += definition.speedBoost * state.count;
    }
  });

  return totalBonus;
}

/**
 * Calculates the total reward bonus from all hired employees.
 * Each employee contributes their rewardBoost linearly per count.
 *
 * Formula: sum(employee.rewardBoost * count) for all employees
 *
 * @param employees - Array of current employee states
 * @param definitions - Array of employee definitions (to look up boost values)
 * @returns Total reward bonus as a decimal (0.5 = 50%)
 */
export function calculateRewardBonus(
  employees: EmployeeState[],
  definitions: EmployeeDefinition[]
): number {
  // Create a map for quick lookup of definitions by ID
  const definitionMap = new Map<string, EmployeeDefinition>();
  definitions.forEach((def) => {
    definitionMap.set(def.id, def);
  });

  // Sum up reward boosts from all employees
  let totalBonus = 0;
  employees.forEach((state) => {
    const definition = definitionMap.get(state.employeeId);
    if (definition) {
      totalBonus += definition.rewardBoost * state.count;
    }
  });

  return totalBonus;
}
